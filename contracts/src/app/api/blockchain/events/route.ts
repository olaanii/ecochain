/**
 * Blockchain Events API
 * 
 * Endpoints for managing blockchain event listener
 * GET /api/blockchain/events - Get event listener status
 * POST /api/blockchain/events/start - Start event listener
 * POST /api/blockchain/events/stop - Stop event listener
 * GET /api/blockchain/events/failed - Get failed events
 * GET /api/blockchain/events/alerts - Get recent alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventListener, startEventListener, stopEventListener } from '@/lib/blockchain/event-listener';
import { EventQueue } from '@/lib/blockchain/event-queue';

/**
 * GET /api/blockchain/events
 * Get event listener status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'failed') {
      // Get failed events
      const queue = new EventQueue();
      const failedEvents = await queue.getFailedEvents(50);

      return NextResponse.json({
        success: true,
        failedEvents,
        count: failedEvents.length,
      });
    }

    if (action === 'alerts') {
      // Get recent alerts
      const queue = new EventQueue();
      const alerts = await queue.getRecentAlerts(50);

      return NextResponse.json({
        success: true,
        alerts,
        count: alerts.length,
      });
    }

    // Get listener status
    const listener = getEventListener();
    const status = listener.getStatus();

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('[API] Error getting event listener status:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blockchain/events/start
 * Start event listener
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || request.nextUrl.searchParams.get('action');

    if (action === 'start') {
      await startEventListener();

      return NextResponse.json({
        success: true,
        message: 'Event listener started',
      });
    }

    if (action === 'stop') {
      await stopEventListener();

      return NextResponse.json({
        success: true,
        message: 'Event listener stopped',
      });
    }

    if (action === 'clear-failed') {
      const queue = new EventQueue();
      await queue.clearFailedEvents();

      return NextResponse.json({
        success: true,
        message: 'Failed events cleared',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API] Error managing event listener:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
