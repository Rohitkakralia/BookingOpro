import { NextResponse } from "next/server";

const PAYOTA_BASE_URL = "https://api.payota.net";
const PAYOTA_KEY_ID = process.env.API_KEY;
const PAYOTA_API_KEY = process.env.KEY_ID;

/**
 * POST /api/hotels/booking/creditToken
 *
 * Calls Payota /api/public/v1/manage/init_partners to tokenize credit card.
 *
 * Request body (from getCreditToken hook):
 *   {
 *     object_id, pay_uuid, init_uuid,
 *     user_first_name, user_last_name,
 *     cvc, is_cvc_required,
 *     credit_card_data_core: { card_number, card_holder, month, year }
 *   }
 *
 * Response:
 *   { success, data: { ... payota response ... } }
 */

// Maps every Payota error code to a human-readable message
const PAYOTA_ERROR_MESSAGES = {
  body_error:              "The request body contains invalid JSON. Please try again.",
  validation_error:        "One or more required fields are missing. Please check your input.",
  invalid_pay_uuid:        "The payment UUID is invalid or doesn't match the required format.",
  invalid_init_uuid:       "The initialization UUID is invalid or doesn't match the required format.",
  invalid_month:           "The card expiry month is invalid. Please enter a value between 01 and 12.",
  invalid_year:            "The card expiry year is invalid. Please check and try again.",
  invalid_cvc:             "The CVC / CVV code is invalid. Please check and try again.",
  invalid_card_number:     "The credit card number is invalid. Please check and try again.",
  invalid_card_holder:     "The cardholder name is invalid. Please use only letters and spaces.",
  invalid_is_cvc_required: "The is_cvc_required field is required but was not provided.",
  luhn_algorithm_error:    "The credit card number failed the Luhn check. Please verify the card number.",
};

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("creditToken API called — body:", body);

    const {
      object_id,
      pay_uuid,
      init_uuid,
      user_first_name,
      user_last_name,
      cvc,
      is_cvc_required,
      credit_card_data_core,
    } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!object_id) {
      return NextResponse.json(
        { success: false, message: "object_id is required" },
        { status: 400 }
      );
    }

    if (!pay_uuid || !init_uuid) {
      return NextResponse.json(
        { success: false, message: "pay_uuid and init_uuid are required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidPattern =
      /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidPattern.test(pay_uuid) || !uuidPattern.test(init_uuid)) {
      return NextResponse.json(
        { success: false, message: "pay_uuid and init_uuid must be valid UUID format" },
        { status: 400 }
      );
    }

    if (!user_first_name || !user_last_name) {
      return NextResponse.json(
        { success: false, message: "user_first_name and user_last_name are required" },
        { status: 400 }
      );
    }

    if (
      !credit_card_data_core?.card_number ||
      !credit_card_data_core?.card_holder ||
      !credit_card_data_core?.month ||
      !credit_card_data_core?.year
    ) {
      return NextResponse.json(
        { success: false, message: "credit_card_data_core fields are required: card_number, card_holder, month, year" },
        { status: 400 }
      );
    }

    if (!PAYOTA_KEY_ID || !PAYOTA_API_KEY) {
      console.error("Missing environment variables: PAYOTA_KEY_ID or PAYOTA_API_KEY");
      return NextResponse.json(
        { success: false, message: "Server configuration error: missing Payota credentials" },
        { status: 500 }
      );
    }

    // ── Build auth & payload ──────────────────────────────────────────────────
    const authString = Buffer.from(`${PAYOTA_KEY_ID}:${PAYOTA_API_KEY}`).toString("base64");
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    };

    const payload = {
      object_id: String(object_id),
      pay_uuid,
      init_uuid,
      user_first_name,
      user_last_name,
      is_cvc_required: is_cvc_required ?? false,
      credit_card_data_core: {
        card_number: credit_card_data_core.card_number,
        card_holder: credit_card_data_core.card_holder,
        month: credit_card_data_core.month,
        year: credit_card_data_core.year,
      },
    };

    // Only include cvc if provided (it's optional)
    if (cvc) {
      payload.cvc = cvc;
    }

    console.log("Payota init_partners payload:", JSON.stringify({
      ...payload,
      credit_card_data_core: {
        ...payload.credit_card_data_core,
        card_number: "****" + payload.credit_card_data_core.card_number.slice(-4), // mask for logs
      },
    }, null, 2));

    // ── Call Payota init_partners ─────────────────────────────────────────────
    const res = await fetch(
      `${PAYOTA_BASE_URL}/api/public/v1/manage/init_partners`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      }
    );

    const resText = await res.text();
    console.log("Payota init_partners status:", res.status);

    if (!res.ok) {
      console.error("Payota init_partners error:", resText.substring(0, 300));
      return NextResponse.json(
        {
          success: false,
          message: `Credit token request failed (${res.status}): ${resText.substring(0, 150)}`,
        },
        { status: res.status >= 500 ? 502 : res.status }
      );
    }

    let resData;
    try {
      resData = JSON.parse(resText);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid response from Payota API" },
        { status: 502 }
      );
    }

    // ── Handle Payota-level errors with exact error codes ─────────────────────
    if (resData.status !== "ok") {
      const errCode = resData.error || resData.status || "unknown";
      console.error("Payota init_partners non-ok:", resData);

      const humanMessage =
        PAYOTA_ERROR_MESSAGES[errCode] ??
        `An unexpected error occurred (${errCode}). Please try again.`;

      return NextResponse.json(
        {
          success: false,
          error: errCode,         // exact Payota error key, e.g. "luhn_algorithm_error"
          message: humanMessage,  // user-friendly description
        },
        { status: 422 }
      );
    }

    console.log("✅ Credit token initialized — pay_uuid:", pay_uuid);

    return NextResponse.json({
      success: true,
      data: resData.data,
      message: "Credit token initialized successfully",
    });

  } catch (error) {
    console.error("creditToken route error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process credit token request",
        error: error.message,
      },
      { status: 500 }
    );
  }
}