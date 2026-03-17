import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Hotel page API called — body:", body);

    const {
      hid,
      checkin,
      checkout,
      currency = "USD",
      language = "en",
      residency = "us",
      guests = [{ adults: 2, children: [] }],
    } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!hid || !checkin || !checkout) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Please provide hid, check-in and check-out dates",
        },
        { status: 400 }
      );
    }

    const keyId = process.env.KEY_ID;
    const apiKey = process.env.API_KEY;
    const baseUrl = process.env.API_BASE_URL;

    if (!keyId || !apiKey || !baseUrl) {
      return NextResponse.json(
        { success: false, error: "Missing environment variables" },
        { status: 500 }
      );
    }

    const authString = Buffer.from(`${keyId}:${apiKey}`).toString("base64");
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    };

    const basePayload = {
      checkin,
      checkout,
      residency,
      language,
      currency,
      guests,
      hid: 8473727, // Use known working HID for testing
      // hid: parseInt(hid), // Use actual HID from frontend
    };

    // ─── Step 1: HP — Get hotel details and book_hash per rate ────────────────
    console.log("\n========== STEP 1: HP ==========");
    console.log("Using HID:", hid, "Type:", typeof hid);
    console.log("Parsed HID:", parseInt(hid));
    console.log("Full payload:", JSON.stringify(basePayload, null, 2));

    const hpRes = await fetch(`${baseUrl}/api/b2b/v3/search/hp/`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(basePayload),
    });

    if (!hpRes.ok) {
      const errorText = await hpRes.text();
      console.error("HP API error status:", hpRes.status);
      console.error("HP API error response:", errorText);

      // Try to parse error as JSON for better debugging
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error("Parsed error data:", JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.error("Could not parse error as JSON");
      }

      return NextResponse.json(
        {
          success: false,
          error: "HP API failed",
          message: `Failed to get hotel details (${
            hpRes.status
          }): ${errorText.substring(0, 200)}`,
          debug: {
            status: hpRes.status,
            hid_used: 8473727,
            original_hid: hid,
            payload_sent: basePayload,
            full_error: errorData || errorText.substring(0, 500),
            api_url: `${baseUrl}/api/b2b/v3/search/hp/`,
          },
        },
        { status: hpRes.status }
      );
    }

    const hpResult = await hpRes.json();
    const hotel = hpResult?.data?.hotels?.[0];

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: "No hotel data",
          message: "No hotel found for the provided HID",
        },
        { status: 404 }
      );
    }

    console.log(
      `HP complete — hotel: ${hotel.rate}, rates: ${hotel.rates?.length ?? 0}`
    );

    // ── Log HP book_hashes ────────────────────────────────────────────────────
    console.log("\n========== BOOK HASHES (Step 1 - HP) ==========");
    hotel.rates?.forEach((rate, i) => {
      console.log(`Rate [${i}] book_hash: ${rate.book_hash ?? "NOT FOUND"}`);
    });
    console.log("===============================================\n");

    // ─── Step 2: Prebook — Get prebook hash for first available rate ─────────
    console.log("\n========== STEP 2: PREBOOK ==========");

    let prebookData = null;
    const firstRateWithBookHash = hotel.rates?.find((rate) => rate.book_hash);

    if (firstRateWithBookHash?.book_hash) {
      console.log(
        `Prebook using book_hash: ${firstRateWithBookHash.book_hash}`
      );

      const prebookRes = await fetch(`${baseUrl}/api/b2b/v3/hotel/prebook/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ hash: firstRateWithBookHash.book_hash }),
      });

      if (prebookRes.ok) {
        const prebookResult = await prebookRes.json();
        console.log("Prebook result:", JSON.stringify(prebookResult, null, 2));

        // Try different paths for book_hash based on API response structure
        let prebookBookHash = prebookResult?.data?.book_hash;
        if (!prebookBookHash) {
          prebookBookHash =
            prebookResult?.data?.hotels?.[0]?.rates?.[0]?.book_hash;
        }

        if (prebookBookHash) {
          prebookData = {
            prebook_book_hash: prebookBookHash,
            original_book_hash: firstRateWithBookHash.book_hash,
            prebook_response: prebookResult?.data,
          };
          console.log(`Prebook successful — prebook_hash: ${prebookBookHash}`);
        } else {
          console.warn("Prebook returned no book_hash");
        }
      } else {
        console.warn(`Prebook failed: ${prebookRes.status}`);
      }
    } else {
      console.warn("No book_hash found in rates for prebook");
    }

    // ── Store in session (using response headers) ─────────────────────────────
    const sessionData = {
      hotel_data: hotel,
      prebook_data: prebookData,
      search_params: basePayload,
      timestamp: Date.now(),
    };

    const response = NextResponse.json({
      success: true,
      data: {
        hotel,
        prebook_data: prebookData,
        rates_count: hotel.rates?.length ?? 0,
        has_book_hash: !!firstRateWithBookHash?.book_hash,
        has_prebook_hash: !!prebookData?.prebook_book_hash,
      },
      message: "Hotel details fetched successfully",
    });

    // Store session data in cookie (you can also use other session storage)
    response.cookies.set("hotel_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Hotel page API error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to fetch hotel details",
      },
      { status: 500 }
    );
  }
}
