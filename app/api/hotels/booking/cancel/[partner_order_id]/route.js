import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const keyId = process.env.KEY_ID;
    const apiKey = process.env.API_KEY;
    const baseUrl = process.env.API_BASE_URL;
    console.log("========== CANCEL BOOKING REQUEST ==========");
    console.log("Received cancel request with params:", params);
    // Check environment variables
    if (!keyId || !apiKey || !baseUrl) {
      return NextResponse.json(
        { success: false, error: "Missing environment variables" },
        { status: 500 }
      );
    }

    // Get partner_order_id from URL params
    const { partner_order_id } = await params;

    if (!partner_order_id) {
      return NextResponse.json(
        { success: false, error: "partner_order_id is required" },
        { status: 400 }
      );
    }

    // Create Basic Auth
    const authString = Buffer.from(`${keyId}:${apiKey}`).toString("base64");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    };

    // Build cancel payload
    const payload = {
      partner_order_id,
    };

    console.log("========== CANCELLING BOOKING ==========");
    console.log("partner_order_id:", partner_order_id);
    console.log("Payload:", payload);

    // Call WorldOTA Cancel API
    const apiResponse = await fetch(
      `${baseUrl}/api/b2b/v3/hotel/order/cancel/`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();

      console.error("WorldOTA Cancel Error:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: "WorldOTA API error",
          message: errorText.substring(0, 200),
        },
        { status: apiResponse.status }
      );
    }

    const result = await apiResponse.json();

    if (result.status !== "ok") {
      console.error("Cancel API returned error:", result.error);

      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to cancel booking",
        },
        { status: 400 }
      );
    }

    console.log("Booking cancelled successfully:", partner_order_id);

    return NextResponse.json({
      success: true,
      data: result?.data || {},
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Booking API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to cancel booking",
      },
      { status: 500 }
    );
  }
}