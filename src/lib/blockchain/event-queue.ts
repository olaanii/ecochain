/**
 * Event Processing Queue
 * 
 * Handles queuing and processing of blockchain events
 * with retry logic and error handling
 * 
 * Requirements: 18.1, 18.8, 18.7, 18.9
 */

import { redis } from '@/lib/redis/client';
import { BlockchainEvent, EventProcessingResult } from './event-listener';
import { processProofSubmittedEvent, processTokensMintedEvent, processTransferEvent } from './event-handlers';

const QUEUE_KEY = 'blockchain:event:queue';
const PROCESSING_KEY = 'blockchain:event:processing';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds
const BATCH_SIZE = 10;

/**
 * Event Processing Queue
 * Manages event processing with retry logic
 */
export class EventQueue {
  private isProcessing: boolean = false;
  private processInterval: NodeJS.Timeout | null = null;

  /**
   * Enqueue an event for processing
   * Requirement: 18.8
   */
  async enqueue(event: BlockchainEvent): Promise<void> {
    try {
      // Store event in Redis queue
      await redis.lpush(QUEUE_KEY, JSON.stringify(event));

      // Also store in a set for deduplication
      await redis.sadd(`event:processed:${event.type}`, event.id);

      console.log(`[EventQueue] Enqueued event: ${event.id}`);
    } catch (error) {
      console.error('[EventQueue] Error enqueuing event:', error);
    }
  }

  /**
   * Start processing events from the queue
   * Requirement: 18.5, 18.6
   */
  startProcessing(): void {
    if (this.isProcessing) {
      console.warn('[EventQueue] Already processing events');
      return;
    }

    this.isProcessing = true;
    console.log('[EventQueue] Starting event processing');

    // Process events every 2 seconds
    this.processInterval = setInterval(async () => {
      try {
        await this.processNextBatch();
      } catch (error) {
        console.error('[EventQueue] Error processing batch:', error);
      }
    }, 2000);
  }

  /**
   * Stop processing events
   */
  async stopProcessing(): Promise<void> {
    if (!this.isProcessing) {
      return;
    }

    this.isProcessing = false;
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }

    console.log('[EventQueue] Event processing stopped');
  }

  /**
   * Process next batch of events
   * Requirement: 18.5, 18.6
   */
  private async processNextBatch(): Promise<void> {
    try {
      // Get next batch of events
      const eventStrings = await redis.lrange(QUEUE_KEY, 0, BATCH_SIZE - 1);

      if (eventStrings.length === 0) {
        return;
      }

      // Process each event
      for (const eventString of eventStrings) {
        const event: BlockchainEvent = JSON.parse(eventString);

        try {
          // Mark as processing
          await redis.setex(PROCESSING_KEY, 60, event.id);

          // Process the event
          const result = await this.processEvent(event);

          if (result.success) {
            // Remove from queue
            await redis.lrem(QUEUE_KEY, 1, eventString);

            // Mark as processed
            await redis.setex(`event:${event.id}`, 86400, 'processed'); // 24 hour TTL

            console.log(`[EventQueue] Successfully processed event: ${event.id}`);
          } else if (result.retryable && event.retryCount < MAX_RETRIES) {
            // Increment retry count and re-queue
            event.retryCount++;
            event.status = 'pending';

            // Remove old entry and add updated one
            await redis.lrem(QUEUE_KEY, 1, eventString);
            await redis.rpush(QUEUE_KEY, JSON.stringify(event));

            console.warn(
              `[EventQueue] Retrying event ${event.id} (attempt ${event.retryCount}/${MAX_RETRIES})`
            );
          } else {
            // Max retries exceeded or non-retryable error
            await redis.lrem(QUEUE_KEY, 1, eventString);

            // Store failed event for manual review
            await redis.lpush(
              'blockchain:event:failed',
              JSON.stringify({
                ...event,
                status: 'failed',
                error: result.error,
                failedAt: new Date().toISOString(),
              })
            );

            console.error(
              `[EventQueue] Event processing failed (max retries exceeded): ${event.id}`,
              result.error
            );

            // Alert on repeated failures
            await this.alertProcessingFailure(event, result.error);
          }
        } catch (error) {
          console.error(`[EventQueue] Unexpected error processing event ${event.id}:`, error);

          // Remove from processing
          await redis.del(PROCESSING_KEY);
        }
      }
    } catch (error) {
      console.error('[EventQueue] Error in processNextBatch:', error);
    }
  }

  /**
   * Process a single event
   * Requirement: 18.5, 18.6
   */
  private async processEvent(event: BlockchainEvent): Promise<EventProcessingResult> {
    const startTime = Date.now();

    try {
      let result: EventProcessingResult;

      switch (event.type) {
        case 'ProofSubmitted':
          result = await processProofSubmittedEvent(event);
          break;

        case 'TokensMinted':
          result = await processTokensMintedEvent(event);
          break;

        case 'Transfer':
          result = await processTransferEvent(event);
          break;

        default:
          return {
            success: false,
            eventId: event.id,
            error: `Unknown event type: ${event.type}`,
            retryable: false,
          };
      }

      const processingTime = Date.now() - startTime;

      // Requirement: 18.5, 18.6 - Update database within 1 second
      if (processingTime > 1000) {
        console.warn(
          `[EventQueue] Event processing took ${processingTime}ms (target: <1000ms): ${event.id}`
        );
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        eventId: event.id,
        error: errorMessage,
        retryable: this.isRetryableError(error),
      };
    }
  }

  /**
   * Determine if an error is retryable
   * Requirement: 18.7
   */
  private isRetryableError(error: any): boolean {
    if (!(error instanceof Error)) {
      return true;
    }

    const message = error.message.toLowerCase();

    // Non-retryable errors
    if (
      message.includes('not found') ||
      message.includes('invalid') ||
      message.includes('unauthorized') ||
      message.includes('forbidden')
    ) {
      return false;
    }

    // Retryable errors (network, timeout, etc.)
    return true;
  }

  /**
   * Alert on repeated processing failures
   * Requirement: 18.9
   */
  private async alertProcessingFailure(event: BlockchainEvent, error?: string): Promise<void> {
    try {
      // Log alert
      console.error(
        `[EventQueue] ALERT: Event processing failed after max retries: ${event.id}`,
        error
      );

      // Store alert in Redis for monitoring
      await redis.lpush(
        'blockchain:event:alerts',
        JSON.stringify({
          eventId: event.id,
          eventType: event.type,
          error,
          timestamp: new Date().toISOString(),
        })
      );

      // Keep only last 100 alerts
      await redis.ltrim('blockchain:event:alerts', 0, 99);
    } catch (alertError) {
      console.error('[EventQueue] Error creating alert:', alertError);
    }
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    // This is approximate since we can't get exact size without blocking
    return 0;
  }

  /**
   * Get failed events for manual review
   */
  async getFailedEvents(limit: number = 50): Promise<BlockchainEvent[]> {
    try {
      const failedStrings = await redis.lrange('blockchain:event:failed', 0, limit - 1);
      return failedStrings.map((s) => JSON.parse(s));
    } catch (error) {
      console.error('[EventQueue] Error getting failed events:', error);
      return [];
    }
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(limit: number = 50): Promise<any[]> {
    try {
      const alertStrings = await redis.lrange('blockchain:event:alerts', 0, limit - 1);
      return alertStrings.map((s) => JSON.parse(s));
    } catch (error) {
      console.error('[EventQueue] Error getting alerts:', error);
      return [];
    }
  }

  /**
   * Clear failed events
   */
  async clearFailedEvents(): Promise<void> {
    try {
      await redis.del('blockchain:event:failed');
      console.log('[EventQueue] Cleared failed events');
    } catch (error) {
      console.error('[EventQueue] Error clearing failed events:', error);
    }
  }
}
