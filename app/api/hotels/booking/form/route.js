import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || "https://api.worldota.net";
const API_KEY = process.env.API_KEY;
const KEY_ID = process.env.KEY_ID;

/**
 * ETG Hotel Booking — Step 1: Create Booking Process
 *
 * ETG requires a 2-stage process BEFORE booking/form:
 *   1. Prebook (match_hash → fresh book_hash)  ← THIS STEP IS DONE HERE TRANSPARENTLY
 *   2. booking/form (fresh book_hash → ETG order_id)
 *
 * Frontend sends: { book_hash (= match_hash from SERP), partner_order_id, language }
 * This route:
 *   a) Calls ETG /prebook with the match_hash to get a validated, fresh book_hash
 *   b) Calls ETG /booking/form with the fresh book_hash
 *   c) Returns { success, order_id, partner_order_id } to the frontend
 *
 * Docs:
 *   Prebook: https://docs.emergingtravel.com/docs/b2b-api/hotel-search/prebook-rate-from-search-step/
 *   Booking/form: https://docs.emergingtravel.com/docs/b2b-api/booking/create-booking-process/
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { book_hash, partner_order_id, language = 'en', user_ip } = body;
    
    console.log("body in route", body);
    // ── Validate input ───────────────────────────────────────────────────────
    if (!book_hash) {
      console.log("book_hash not present in request body");
      return NextResponse.json({
        success: false,
        message: 'book_hash is required (use the match_hash from the search result rate)',
      }, { status: 400 });
    }

    if (!partner_order_id) {
      console.log("partner_order_id not present in request body");
      return NextResponse.json({
        success: false,
        message: 'partner_order_id is required (a UUID you generate to identify this order)',
      }, { status: 400 });
    }

    const keyId = KEY_ID;
    const apiKey = API_KEY;
    const baseUrl = API_BASE_URL;
    

    if (!keyId || !apiKey) {
      console.error("Missing environment variables: KEY_ID or API_KEY");
      return NextResponse.json({
        success: false,
        message: 'Server configuration error: missing API credentials',
      }, { status: 500 });
    }

    const authString = Buffer.from(`${keyId}:${apiKey}`).toString("base64");
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    };

    // ── STAGE A: Prebook — validate rate & get a fresh book_hash ─────────────
    // The match_hash from SERP expires quickly. Prebook confirms availability
    // and returns a stable book_hash to use for booking/form.
    // Note: Some API versions may not require prebook step
    const prebookUrl = `${baseUrl}/api/b2b/v3/hotel/order/prebook`;
    console.log("Prebook request for match_hash:", book_hash.substring(0, 20) + "...");

    let freshBookHash = book_hash; // Default to original hash

    try {
      const prebookResponse = await fetch(prebookUrl, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          book_hash,          // match_hash from SERP search results
          language,
        }),
      });

      const prebookText = await prebookResponse.text();
      console.log("Prebook response status:", prebookResponse.status);

      if (prebookResponse.ok) {
        let prebookData;
        try {
          prebookData = JSON.parse(prebookText);
        } catch {
          console.warn("Invalid prebook response, using original book_hash");
        }

        // ETG prebook returns { status, data: { book_hash, ... } }
        if (prebookData && prebookData.status === 'ok' && prebookData.data?.book_hash) {
          freshBookHash = prebookData.data.book_hash;
          console.log("✅ Prebook successful. Fresh book_hash received.");
        } else {
          console.warn("Prebook returned non-ok status, using original book_hash");
        }
      } else {
        console.warn(`Prebook failed with ${prebookResponse.status}, proceeding with original book_hash`);
        // Don't throw error, continue with original book_hash
      }
    } catch (prebookError) {
      console.warn("Prebook request failed, proceeding with original book_hash:", prebookError.message);
      // Continue with original book_hash
    }

    // ── STAGE B: booking/form — create the order ─────────────────────────────
    const bookingFormUrl = `${baseUrl}/api/b2b/v3/hotel/order/booking/form`;

    const etgFormPayload = {
      partner_order_id,
      book_hash: freshBookHash,   // Fresh book_hash from prebook (or original if prebook failed)
      language,
    };
    if (user_ip) etgFormPayload.user_ip = user_ip;

    console.log("Calling ETG booking/form:", bookingFormUrl);

    const formResponse = await fetch(bookingFormUrl, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(etgFormPayload),
    });

    const formText = await formResponse.text();
    console.log("ETG booking/form status:", formResponse.status);

    if (!formResponse.ok) {
      console.error("ETG booking/form failed:", formText.substring(0, 300));
      return NextResponse.json({
        success: false,
        error: `booking_form_failed_${formResponse.status}`,
        message: `Booking form error (${formResponse.status}): ${formText.substring(0, 150)}`,
      }, { status: formResponse.status >= 500 ? 502 : formResponse.status });
    }

    let formData;
    try {
      formData = JSON.parse(formText);
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Invalid booking/form response from ETG API',
      }, { status: 502 });
    }

    if (formData.status !== 'ok') {
      const errCode = formData.error || formData.status || 'unknown';
      console.error("ETG booking/form non-ok status:", formData);

      // duplicate_reservation / double_booking_form = retry with new partner_order_id
      return NextResponse.json({
        success: false,
        error: errCode,
        message: `Booking form error: ${errCode}`,
        retryable: ['duplicate_reservation', 'double_booking_form', 'timeout', 'unknown'].includes(errCode),
        raw: formData,
      }, { status: 422 });
    }

    // ETG returns { status: "ok", data: { order_id, partner_order_id, item_id, ... } }
    const etgOrderId = formData.data?.order_id;
    if (!etgOrderId) {
      console.error("booking/form succeeded but no order_id returned:", formData);
      return NextResponse.json({
        success: false,
        message: 'Booking form succeeded but no order_id returned. Please try again.',
      }, { status: 502 });
    }

    console.log("✅ Booking form created. ETG order_id:", etgOrderId);

    return NextResponse.json({
      success: true,
      data: formData,                 // Full ETG response
      order_id: etgOrderId,           // ETG-assigned order_id (required for finish & status)
      partner_order_id,               // Your UUID (for your own tracking)
      prebook_data: prebookData.data, // Preboooked rate info (updated price if changed)
      message: 'Booking form created successfully',
    });

  } catch (error) {
    console.error('Booking form route error:', error.message, error.stack);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      message: 'Failed to process booking form request',
    }, { status: 500 });
  }
}
