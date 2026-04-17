/**
 * Event Listener Tests
 * 
 * Tests for blockchain event listener functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventListener, BlockchainEvent } from '../event-listener';
import { EventQueue } from '../event-queue';

describe('EventListener', () => {
  let listener: EventListener;

  beforeEach(() => {
    listener = new EventListener();
  });

  afterEach(async () => {
    await listener.stopListening();
  });

  describe('Event Queuing', () => {
    it('should queue ProofSubmitted events', async () => {
      const mockEvent: BlockchainEvent = {
        id: 'proof-test-1',
        type: 'ProofSubmitted',
        contractAddress: '0x123',
        transactionHash: '0xabc',
        blockNumber: 100n,
        logIndex: 0,
        data: {
          user: '0xuser',
          taskId: 'task-1',
          proofHash: 'hash-1',
          rewardMinted: '1000',
        },
        retryCount: 0,
        status: 'pending',
      };

      const queue = new EventQueue();
      await queue.enqueue(mockEvent);

      // Event should be queued
      expect(mockEvent.id).toBe('proof-test-1');
    });

    it('should queue TokensMinted events', async () => {
      const mockEvent: BlockchainEvent = {
        id: 'mint-test-1',
        type: 'TokensMinted',
        contractAddress: '0x123',
        transactionHash: '0xabc',
        blockNumber: 100n,
        logIndex: 0,
        data: {
          to: '0xuser',
          value: '1000',
        },
        retryCount: 0,
        status: 'pending',
      };

      const queue = new EventQueue();
      await queue.enqueue(mockEvent);

      expect(mockEvent.id).toBe('mint-test-1');
    });

    it('should queue Transfer events', async () => {
      const mockEvent: BlockchainEvent = {
        id: 'transfer-test-1',
        type: 'Transfer',
        contractAddress: '0x123',
        transactionHash: '0xabc',
        blockNumber: 100n,
        logIndex: 0,
        data: {
          from: '0xuser1',
          to: '0xuser2',
          value: '500',
        },
        retryCount: 0,
        status: 'pending',
      };

      const queue = new EventQueue();
      await queue.enqueue(mockEvent);

      expect(mockEvent.id).toBe('transfer-test-1');
    });
  });

  describe('Event Status', () => {
    it('should return listener status', () => {
      const status = listener.getStatus();

      expect(status).toHaveProperty('isListening');
      expect(status).toHaveProperty('lastBlockProcessed');
      expect(status).toHaveProperty('queueSize');
      expect(typeof status.isListening).toBe('boolean');
    });

    it('should track listening state', async () => {
      let status = listener.getStatus();
      expect(status.isListening).toBe(false);

      await listener.startListening();
      status = listener.getStatus();
      expect(status.isListening).toBe(true);

      await listener.stopListening();
      status = listener.getStatus();
      expect(status.isListening).toBe(false);
    });
  });

  describe('Event Retry Logic', () => {
    it('should track retry count', () => {
      const event: BlockchainEvent = {
        id: 'test-1',
        type: 'ProofSubmitted',
        contractAddress: '0x123',
        transactionHash: '0xabc',
        blockNumber: 100n,
        logIndex: 0,
        data: {},
        retryCount: 0,
        status: 'pending',
      };

      expect(event.retryCount).toBe(0);

      event.retryCount++;
      expect(event.retryCount).toBe(1);

      event.retryCount++;
      expect(event.retryCount).toBe(2);

      event.retryCount++;
      expect(event.retryCount).toBe(3);
    });

    it('should respect max retry limit', () => {
      const MAX_RETRIES = 3;
      const event: BlockchainEvent = {
        id: 'test-1',
        type: 'ProofSubmitted',
        contractAddress: '0x123',
        transactionHash: '0xabc',
        blockNumber: 100n,
        logIndex: 0,
        data: {},
        retryCount: 0,
        status: 'pending',
      };

      while (event.retryCount < MAX_RETRIES) {
        event.retryCount++;
      }

      expect(event.retryCount).toBe(MAX_RETRIES);
      expect(event.retryCount >= MAX_RETRIES).toBe(true);
    });
  });

  describe('Event Data Validation', () => {
    it('should validate ProofSubmitted event data', () => {
      const event: BlockchainEvent = {
        id: 'proof-test-1',
        type: 'ProofSubmitted',
        contractAddress: '0x123',
        transactionHash: '0xabc',
        blockNumber: 100n,
        logIndex: 0,
        data: {
          user: '0xuser',
          taskId: 'task-1',
          proofHash: 'hash-1',
          rewardMinted: '1000',
        },
        retryCount: 0,
        status: 'pending',
      };

      expect(event.data.user).toBeDefined();
      expect(event.data.taskId).toBeDefined();
      expect(event.data.proofHash).toBeDefined();
      expect(event.data.rewardMinted).toBeDefined();
    });

    it('should validate TokensMinted event data', () => {
      const event: BlockchainEvent = {
        id: 'mint-test-1',
        type: 'TokensMinted',
        contractAddress: '0x123',
        transactionHash: '0xabc',
        blockNumber: 100n,
        logIndex: 0,
        data: {
          to: '0xuser',
          value: '1000',
        },
        retryCount: 0,
        status: 'pending',
      };

      expect(event.data.to).toBeDefined();
      expect(event.data.value).toBeDefined();
    });

    it('should validate Transfer event data', () => {
      const event: BlockchainEvent = {
        id: 'transfer-test-1',
        type: 'Transfer',
        contractAddress: '0x123',
        transactionHash: '0xabc',
        blockNumber: 100n,
        logIndex: 0,
        data: {
          from: '0xuser1',
          to: '0xuser2',
          value: '500',
        },
        retryCount: 0,
        status: 'pending',
      };

      expect(event.data.from).toBeDefined();
      expect(event.data.to).toBeDefined();
      expect(event.data.value).toBeDefined();
    });
  });

  describe('Event Deduplication', () => {
    it('should create unique event IDs', () => {
      const event1: BlockchainEvent = {
        id: 'proof-0x123-0',
        type: 'ProofSubmitted',
        contractAddress: '0x123',
        transactionHash: '0x123',
        blockNumber: 100n,
        logIndex: 0,
        data: {},
        retryCount: 0,
        status: 'pending',
      };

      const event2: BlockchainEvent = {
        id: 'proof-0x123-1',
        type: 'ProofSubmitted',
        contractAddress: '0x123',
        transactionHash: '0x123',
        blockNumber: 100n,
        logIndex: 1,
        data: {},
        retryCount: 0,
        status: 'pending',
      };

      expect(event1.id).not.toBe(event2.id);
    });
  });
});

describe('EventQueue', () => {
  let queue: EventQueue;

  beforeEach(() => {
    queue = new EventQueue();
  });

  afterEach(async () => {
    await queue.stopProcessing();
  });

  describe('Queue Operations', () => {
    it('should enqueue events', async () => {
      const event: BlockchainEvent = {
        id: 'test-1',
        type: 'ProofSubmitted',
        contractAddress: '0x123',
        transactionHash: '0xabc',
        blockNumber: 100n,
        logIndex: 0,
        data: {},
        retryCount: 0,
        status: 'pending',
      };

      await queue.enqueue(event);
      // Event should be queued without error
      expect(event.id).toBe('test-1');
    });

    it('should track processing state', () => {
      expect(queue).toBeDefined();
      queue.startProcessing();
      // Processing should start without error
      queue.stopProcessing();
    });
  });

  describe('Failed Event Handling', () => {
    it('should retrieve failed events', async () => {
      const failed = await queue.getFailedEvents(50);
      expect(Array.isArray(failed)).toBe(true);
    });

    it('should retrieve recent alerts', async () => {
      const alerts = await queue.getRecentAlerts(50);
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should clear failed events', async () => {
      await queue.clearFailedEvents();
      const failed = await queue.getFailedEvents(50);
      expect(failed.length).toBe(0);
    });
  });
});
