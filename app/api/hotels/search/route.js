import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const searchData = await request.json();

    // ── Validate required fields ──────────────────────────────────────────────
    if (
      !searchData.destination ||
      !searchData.checkin ||
      !searchData.checkout
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Please provide destination, check-in and check-out dates",
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

    // ── Validate dates ────────────────────────────────────────────────────────
    const checkinDate = new Date(searchData.checkin);
    const checkoutDate = new Date(searchData.checkout);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkinDate < today) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid dates",
          message: "Check-in date cannot be in the past",
        },
        { status: 400 }
      );
    }

    if (checkoutDate <= checkinDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid dates",
          message: "Check-out date must be after check-in date",
        },
        { status: 400 }
      );
    }

    const guests = [{ adults: parseInt(searchData.adults) || 2, children: [] }];
    const currency = searchData.currency || "USD";
    const language = searchData.language || "en";
    const residency = "us";

    const basePayload = {
      checkin: searchData.checkin,
      checkout: searchData.checkout,
      residency,
      language,
      currency,
      guests,
    };

    // ─── Step 1: Multicomplete ────────────────────────────────────────────────
    console.log("\n========== STEP 1: MULTICOMPLETE ==========");

    const mcRes = await fetch(`${baseUrl}/api/b2b/v3/search/multicomplete`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ query: searchData.destination, language }),
    });

    if (!mcRes.ok) {
      const err = await mcRes.text();
      throw new Error(`Multicomplete failed: ${err.substring(0, 100)}`);
    }

    const mcResult = await mcRes.json();
    const regions = mcResult?.data?.regions ?? [];

    if (regions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Location not found",
          message: `No results found for "${searchData.destination}"`,
        },
        { status: 404 }
      );
    }

    const regionIds = regions.map((r) => r.id.toString());
    console.log("Region IDs:", regionIds);

    // ─── Step 2: SERP ─────────────────────────────────────────────────────────
    console.log("\n========== STEP 2: SERP ==========");

    async function searchHotels(ids) {
      const res = await fetch(`${baseUrl}/api/b2b/v3/search/serp/hotels/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ ...basePayload, ids }),
      });
      if (!res.ok) return null;
      return await res.json();
    }

    // Strategy 1: All region IDs
    let hotelResult = await searchHotels(regionIds);
    let hotelsFound = hotelResult?.data?.hotels?.length ?? 0;

    // Strategy 2: City region only
    if (hotelsFound === 0) {
      const cityRegion = regions.find((r) => r.type === "City");
      const mainId = cityRegion ? cityRegion.id.toString() : regionIds[0];
      hotelResult = await searchHotels([mainId]);
      hotelsFound = hotelResult?.data?.hotels?.length ?? 0;
    }

    // Strategy 3: Each region individually
    if (hotelsFound === 0) {
      for (const id of regionIds) {
        hotelResult = await searchHotels([id]);
        hotelsFound = hotelResult?.data?.hotels?.length ?? 0;
        if (hotelsFound > 0) break;
      }
    }

    // Strategy 4: Hotel IDs from multicomplete
    if (hotelsFound === 0 && mcResult?.data?.hotels?.length > 0) {
      const hotelIds = mcResult.data.hotels.map((h) => h.id.toString());
      hotelResult = await searchHotels(hotelIds);
      hotelsFound = hotelResult?.data?.hotels?.length ?? 0;
    }

    console.log(
      `Step 2 complete — total_hotels: ${
        hotelResult?.data?.total_hotels ?? 0
      }, returned: ${hotelsFound}`
    );

    // ── Log SERP book_hashes ──────────────────────────────────────────────────
    console.log("\n========== BOOK HASHES (Step 2 - SERP) ==========");
    hotelResult?.data?.hotels?.[0]?.rates?.forEach((rate, i) => {
      console.log(
        `Rate [${i}] book_hash: ${
          rate.book_hash ?? "NOT FOUND"
        } | match_hash: ${rate.match_hash ?? "NOT FOUND"}`
      );
    });
    console.log("==================================================\n");

    if (hotelsFound === 0) {
      return NextResponse.json({
        success: true,
        data: { total_hotels: 0, hotels: [] },
        locationData: mcResult.data,
        message: "No hotels available for the selected dates and location",
      });
    }

    // Return hotel data directly from SERP without additional processing
    return NextResponse.json({
      success: true,
      data: hotelResult.data,
      locationData: mcResult.data,
      message: "Hotels found successfully",
    });
  } catch (error) {
    console.error("Hotel search error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to search hotels",
      },
      { status: 500 }
    );
  }
}
