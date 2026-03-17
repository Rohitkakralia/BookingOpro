import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const keyId = process.env.KEY_ID;
    const apiKey = process.env.API_KEY;
    const baseUrl = process.env.API_BASE_URL;

    // Check environment variables
    if (!keyId || !apiKey || !baseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing environment variables",
        },
        { status: 500 }
      );
    }

    // Create Basic Auth
    const authString = Buffer.from(`${keyId}:${apiKey}`).toString("base64");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    };

    // Parse request body
    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const pageNumber = parseInt(body.page) || 1;
    const pageSize = parseInt(body.page_size) || 10;
    const status = body.status || null;
    const orderingBy = body.ordering_by || "created_at";
    const orderingType = body.ordering_type || "desc";
    const language = body.language || "en";

    // Build API payload
    const payload = {
      language,
      ordering: {
        ordering_type: orderingType,
        ordering_by: orderingBy,
      },
      pagination: {
        page_size: pageSize.toString(),
        page_number: pageNumber.toString(),
      },
    };

    // Optional filter
    if (status) {
      payload.filters = {
        status,
      };
    }

    console.log("========== FETCHING BOOKINGS ==========");
    console.log("Payload:", payload);

    // Call WorldOTA API
    const apiResponse = await fetch(
      `${baseUrl}/api/b2b/v3/hotel/order/info/`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();

      console.error("WorldOTA Error:", errorText);

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
      console.error("API returned error:", result.error);

      return NextResponse.json(
        {
          success: false,
          error: result.error || "API returned error",
        },
        { status: 400 }
      );
    }

    const orders = result?.data?.orders || [];
    const totalOrders = result?.data?.total_orders || 0;
    const totalPages = result?.data?.total_pages || 1;
    const currentPage = result?.data?.current_page_number || pageNumber;

    console.log(
      `Bookings fetched: ${orders.length} / ${totalOrders}`
    );

    return NextResponse.json({
      success: true,
      data: {
        orders,
        total_orders: totalOrders,
        total_pages: totalPages,
        current_page_number: currentPage,
        found_orders: result?.data?.found_orders || orders.length,
        found_pages: result?.data?.found_pages || totalPages,
      },
      message:
        orders.length > 0
          ? "Bookings fetched successfully"
          : "No bookings found",
    });
  } catch (error) {
    console.error("Booking API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}