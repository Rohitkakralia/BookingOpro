import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || "https://api.worldota.net";
const API_KEY = process.env.API_KEY;
const KEY_ID = process.env.KEY_ID;

/**
 * ETG API: Check Booking Process (Status Polling)
 * POST /api/b2b/v3/hotel/order/booking/finish/status/
 *
 * Request body: { order_id }   ← ETG-assigned order_id from booking/form
 *
 * Response statuses:
 *   - "processing"  → booking still in progress, keep polling
 *   - "ok"          → booking confirmed successfully (maps to "completed" in our UI)
 *   - final errors  → "soldout", "provider", "book_limit" (stop polling, show error)
 *
 * Docs: https://docs.emergingtravel.com/docs/b2b-api/booking/check-booking-process/
 */
export async function POST(request) {
  try {
    const { order_id } = await request.json();

    console.log("Booking status check for ETG order_id:", order_id);

    if (!order_id) {
      return NextResponse.json({
        success: false,
        message: 'order_id is required (ETG order_id from booking/form response)',
      }, { status: 400 });
    }

    const keyId = KEY_ID;
    const apiKey = API_KEY;
    const baseUrl = API_BASE_URL;

    if (!keyId || !apiKey || !baseUrl) {
      console.error("Missing environment variables");
      return NextResponse.json({
        success: false,
        message: 'Server configuration error: missing API credentials',
      }, { status: 500 });
    }

    const authString = Buffer.from(`${keyId}:${apiKey}`).toString("base64");
    const apiUrl = `${baseUrl}/api/b2b/v3/hotel/order/booking/finish/status`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({ order_id }),
    });

    console.log("ETG booking/finish/status response:", response.status);

    const responseText = await response.text();

    if (!response.ok) {
      console.error("ETG API Error:", {
        status: response.status,
        body: responseText.substring(0, 500),
      });
      // On 5xx, ETG may be temporarily unavailable — caller should retry
      return NextResponse.json({
        success: false,
        error: `ETG API Error: ${response.status}`,
        message: 'Failed to fetch booking status. Retry shortly.',
        retryable: response.status >= 500,
      }, { status: response.status >= 500 ? 502 : response.status });
    }

    let etgData;
    try {
      etgData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse ETG status response:", parseErr);
      return NextResponse.json({
        success: false,
        message: 'Invalid response from ETG API',
      }, { status: 502 });
    }

    /**
     * ETG status field meanings:
     *  - "processing"       → poll again (booking in progress)
     *  - "ok"               → booking confirmed (treat as "completed" in our UI)
     *  - "soldout"          → room no longer available (fatal, stop polling)
     *  - "provider"         → provider error (fatal)
     *  - "book_limit"       → booking limit reached (fatal)
     *  - "timeout"/"unknown"→ retry (transient error)
     */
    const etgStatus = etgData.status || etgData.data?.status;

    // Map ETG status to a UI-friendly status
    let uiStatus;
    if (etgStatus === 'ok') {
      uiStatus = 'completed';
    } else if (etgStatus === 'processing') {
      uiStatus = 'processing';
    } else if (['soldout', 'provider', 'book_limit'].includes(etgStatus)) {
      uiStatus = 'failed';
    } else {
      uiStatus = etgStatus || 'processing'; // treat unknown as processing (retry)
    }

    console.log(`ETG status: "${etgStatus}" → UI status: "${uiStatus}"`);

    return NextResponse.json({
      success: true,
      data: etgData,
      status: uiStatus,          // UI-friendly status: completed | processing | failed
      etg_status: etgStatus,     // Raw ETG status for debugging
      message: 'Booking status retrieved',
    });

  } catch (error) {
    console.error('Booking status route error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      message: 'Failed to check booking status',
    }, { status: 500 });
  }
}
