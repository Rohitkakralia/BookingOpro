import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || "https://api.worldota.net";
const API_KEY = process.env.API_KEY;
const KEY_ID = process.env.KEY_ID;

/**
 * ETG API: Start Booking Process
 * POST /api/b2b/v3/hotel/order/booking/finish/
 *
 * Request body (ETG format):
 * {
 *   partner: { partner_order_id: "uuid" },
 *   language: "en",
 *   rooms: [{ guests: [{ first_name, last_name }] }],
 *   user: { email, phone },
 *   payment_type: { type: "deposit", amount: "0", currency_code: "USD" }
 * }
 *
 * This endpoint is asynchronous — poll /booking/finish/status to get the final result.
 * Docs: https://docs.emergingtravel.com/docs/b2b-api/booking/start-booking-process/
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      order_id,           // ETG-assigned order_id from booking/form response
      partner_order_id,   // Your UUID (same one used in booking/form)
      first_name,
      last_name,
      email,
      phone = '',
      country = '',
      language = 'en',
      payment_amount = '0',
      payment_currency = 'USD',
    } = body;

    console.log("Booking finish request received:", { order_id, partner_order_id, email });

    if (!order_id) {
      return NextResponse.json({
        success: false,
        message: 'order_id is required (ETG order_id from booking/form response)',
      }, { status: 400 });
    }

    if (!partner_order_id) {
      return NextResponse.json({
        success: false,
        message: 'partner_order_id is required',
      }, { status: 400 });
    }

    if (!first_name || !last_name || !email) {
      return NextResponse.json({
        success: false,
        message: 'first_name, last_name, and email are required for the guest',
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
    const apiUrl = `${baseUrl}/api/b2b/v3/hotel/order/booking/finish`;

    // Build the ETG-compliant payload per API docs
    const etgPayload = {
      partner: {
        partner_order_id,
      },
      language,
      // Guest details must be in rooms[].guests[] array format
      rooms: [
        {
          guests: [
            {
              first_name,
              last_name,
            },
          ],
        },
      ],
      // User (the person making the booking, may differ from guest)
      user: {
        email,
        phone: phone || '',
      },
      // Payment type: "deposit" means ETG deducts from your B2B deposit balance
      payment_type: {
        type: 'deposit',
        amount: payment_amount,
        currency_code: payment_currency,
      },
    };

    console.log("Calling ETG booking/finish:", apiUrl);
    console.log("ETG payload:", JSON.stringify(etgPayload, null, 2));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(etgPayload),
    });

    console.log("ETG booking/finish response status:", response.status);

    const responseText = await response.text();

    if (!response.ok) {
      console.error("ETG API Error:", {
        status: response.status,
        body: responseText.substring(0, 500),
      });
      return NextResponse.json({
        success: false,
        error: `ETG API Error: ${response.status}`,
        message: responseText.substring(0, 200) || 'Failed to start booking process',
      }, { status: response.status >= 500 ? 502 : response.status });
    }

    let etgData;
    try {
      etgData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse ETG response:", parseErr);
      return NextResponse.json({
        success: false,
        message: 'Invalid response from ETG API',
      }, { status: 502 });
    }

    // ETG returns { status: "ok" } — booking is "in progress", not complete yet
    // Poll /booking/finish/status to get the final result
    if (etgData.status !== 'ok') {
      const errCode = etgData.error || etgData.message || 'unknown';
      console.error("ETG booking/finish non-ok status:", etgData);
      return NextResponse.json({
        success: false,
        error: errCode,
        message: `ETG booking finish error: ${errCode}`,
        raw: etgData,
      }, { status: 422 });
    }

    console.log("ETG booking/finish accepted. Booking is now in progress. Poll status endpoint.");

    return NextResponse.json({
      success: true,
      data: etgData,
      order_id,
      message: 'Booking process started. Poll /api/hotels/booking/status for final result.',
    });

  } catch (error) {
    console.error('Booking finish route error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      message: 'Failed to process booking finish request',
    }, { status: 500 });
  }
}
