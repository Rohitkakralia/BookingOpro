import { NextResponse } from "next/server";

const WORLDOTA_BASE_URL = process.env.API_BASE_URL || "https://api-sandbox.worldota.net";
const WORLDOTA_KEY_ID   = process.env.KEY_ID;
const WORLDOTA_API_KEY  = process.env.API_KEY;

const ERROR_MESSAGES = {
  validation_error:     "One or more required fields are missing or invalid.",
  invalid_pay_uuid:     "The payment UUID is invalid.",
  invalid_init_uuid:    "The initialization UUID is invalid.",
  invalid_order:        "The order was not found or has expired.",
  order_already_booked: "This order has already been booked.",
  payment_failed:       "Payment processing failed. Please check your card details.",
  sandbox_restriction:  "This booking is not available in sandbox mode.",
  not_found:            "Booking order not found. Please start the booking again.",
  null_data:            "No data returned. The booking session may have expired.",
};

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      partner_order_id,
      language = "en",
      return_path,
      partner,
      payment_type,
      rooms,
      user,
      supplier_data,
      upsell_data,
      arrival_datetime,
    } = body;

    // ── Validate ───────────────────────────────────────────────────────────
    if (!partner_order_id) {
      return NextResponse.json(
        { success: false, message: "partner_order_id is required" },
        { status: 400 }
      );
    }

    if (!payment_type?.type || !payment_type?.amount || !payment_type?.currency_code) {
      return NextResponse.json(
        { success: false, message: "payment_type with type, amount, currency_code is required" },
        { status: 400 }
      );
    }

    if (!rooms?.length || !rooms[0]?.guests?.length) {
      return NextResponse.json(
        { success: false, message: "rooms with at least one guest is required" },
        { status: 400 }
      );
    }

    const firstGuest = rooms[0].guests[0];
    if (!firstGuest?.first_name || !firstGuest?.last_name) {
      return NextResponse.json(
        { success: false, message: "Guest first_name and last_name are required" },
        { status: 400 }
      );
    }

    if (!user?.email || !user?.phone) {
      return NextResponse.json(
        { success: false, message: "user.email and user.phone are required" },
        { status: 400 }
      );
    }

    if (!WORLDOTA_KEY_ID || !WORLDOTA_API_KEY) {
      console.error("Missing env vars: KEY_ID or API_KEY");
      return NextResponse.json(
        { success: false, message: "Server configuration error: missing API credentials" },
        { status: 500 }
      );
    }

    // ── Build WorldOTA payload ─────────────────────────────────────────────
    const payload = {
      language,
      partner_order_id,
      partner: {
        partner_order_id,
        comment:           partner?.comment           || "",
        amount_sell_b2b2c: partner?.amount_sell_b2b2c || "0",
      },
      payment_type: {
        type:          payment_type.type,
        amount:        String(payment_type.amount),
        currency_code: payment_type.currency_code,
        ...(payment_type.pay_uuid  && { pay_uuid:  payment_type.pay_uuid }),
        ...(payment_type.init_uuid && { init_uuid: payment_type.init_uuid }),
      },
      rooms,
      user: {
        email:   user.email,
        phone:   user.phone,
        comment: user.comment || "",
      },
    };

    if (supplier_data)       payload.supplier_data    = supplier_data;
    if (upsell_data?.length) payload.upsell_data      = upsell_data;
    if (arrival_datetime)    payload.arrival_datetime = arrival_datetime;
    if (return_path)         payload.return_path      = return_path;

    console.log("→ WorldOTA finish payload:", JSON.stringify(payload, null, 2));

    // ── Call WorldOTA ──────────────────────────────────────────────────────
    const authString = Buffer.from(`${WORLDOTA_KEY_ID}:${WORLDOTA_API_KEY}`).toString("base64");

    const res = await fetch(
      `${WORLDOTA_BASE_URL}/api/b2b/v3/hotel/order/booking/finish/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const resText = await res.text();
    console.log("← WorldOTA status:", res.status);
    console.log("← WorldOTA response:", resText.substring(0, 500));

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Booking finish failed (${res.status}): ${resText.substring(0, 150)}`,
        },
        { status: res.status >= 500 ? 502 : res.status }
      );
    }

    let resData;
    try {
      resData = JSON.parse(resText);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON response from WorldOTA" },
        { status: 502 }
      );
    }

    if (resData.status !== "ok") {
      const errCode = resData.error || resData.status || "unknown";
      console.error("WorldOTA finish non-ok:", resData);
      return NextResponse.json(
        {
          success: false,
          error:   errCode,
          message: ERROR_MESSAGES[errCode] ?? `Booking failed (${errCode}). Please try again.`,
        },
        { status: 422 }
      );
    }

    console.log("✅ Booking finished:", resData.data);

    return NextResponse.json({
      success: true,
      data:    resData.data,
      message: "Booking completed successfully",
    });

  } catch (error) {
    console.error("bookingFinish route error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to complete booking", error: error.message },
      { status: 500 }
    );
  }
}