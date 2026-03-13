import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log("Hotel search API called");

    const searchData = await request.json();
    console.log("Request data:", searchData);

    // Validate required fields
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
        {
          success: false,
          error: "Missing environment variables",
        },
        { status: 500 }
      );
    }

    const authString = Buffer.from(`${keyId}:${apiKey}`).toString("base64");

    // Step 1: Get location IDs
    console.log("Step 1: Getting location IDs for", searchData.destination);
    const multicompleteResponse = await fetch(
      `${baseUrl}/api/b2b/v3/search/multicomplete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify({
          query: searchData.destination,
          language: "en",
        }),
      }
    );

    console.log("Multicomplete response status:", multicompleteResponse.status);

    if (!multicompleteResponse.ok) {
      const errorText = await multicompleteResponse.text();
      console.error("Multicomplete error:", errorText);
      throw new Error(`Location search failed: ${errorText.substring(0, 100)}`);
    }

    const multicompleteResult = await multicompleteResponse.json();

    // Extract region IDs
    let regionIds = [];
    if (multicompleteResult.data && multicompleteResult.data.regions) {
      regionIds = multicompleteResult.data.regions.map((region) =>
        region.id.toString()
      );
    }

    if (regionIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Location not found",
          message: `No results found for "${searchData.destination}"`,
        },
        { status: 404 }
      );
    }

    console.log("Found region IDs:", regionIds);

    // Validate and format dates
    const checkinDate = new Date(searchData.checkin);
    const checkoutDate = new Date(searchData.checkout);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    
    console.log("Date validation:", {
      checkin: checkinDate.toISOString().split('T')[0],
      checkout: checkoutDate.toISOString().split('T')[0],
      today: today.toISOString().split('T')[0]
    });

    // Check if dates are valid and in the future
    if (checkinDate < today) {
      return NextResponse.json({
        success: false,
        error: "Invalid dates",
        message: "Check-in date cannot be in the past"
      }, { status: 400 });
    }
    
    if (checkoutDate <= checkinDate) {
      return NextResponse.json({
        success: false,
        error: "Invalid dates",
        message: "Check-out date must be after check-in date"
      }, { status: 400 });
    }

    // Step 2: Search hotels with multiple strategies
    console.log("Step 2: Searching hotels...");

    // Strategy 1: Try with all region IDs (broader search)
    console.log("Strategy 1: Searching with all region IDs:", regionIds);
    
    const hotelSearchData = {
      checkin: searchData.checkin,
      checkout: searchData.checkout,
      residency: "us",
      language: "en",
      guests: [
        {
          adults: parseInt(searchData.adults) || 2,
          children: [],
        },
      ],
      ids: regionIds, // Use ALL region IDs for broader search
      currency: searchData.currency || "USD",
    };

    console.log("Hotel search payload:", JSON.stringify(hotelSearchData, null, 2));

    const hotelResponse = await fetch(`${baseUrl}/api/b2b/v3/search/serp/hotels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(hotelSearchData),
    });

    console.log("Hotel search status:", hotelResponse.status);

    if (!hotelResponse.ok) {
      const errorText = await hotelResponse.text();
      console.error("Hotel search error:", errorText);
      
      // Try to parse the error for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Parsed error:", errorJson);
      } catch (e) {
        console.error("Could not parse error as JSON");
      }
      
      throw new Error("Hotel search failed: " + errorText.substring(0, 200));
    }

    const hotelResult = await hotelResponse.json();
    console.log("Hotel search result status:", hotelResult.status);

    let hotelsFound = hotelResult.data && hotelResult.data.hotels ? hotelResult.data.hotels.length : 0;
    console.log("Hotels found with all regions:", hotelsFound);

    // Strategy 2: If no results, try with just the main city region
    if (hotelsFound === 0) {
      console.log("Strategy 2: Trying with main city region only...");
      
      const mainRegionId = regionIds.find((id) => {
        const region = multicompleteResult.data.regions.find((r) => r.id.toString() === id);
        return region && region.type === "City";
      }) || regionIds[0];

      console.log("Using main region ID:", mainRegionId);

      const mainRegionSearchData = {
        ...hotelSearchData,
        ids: [mainRegionId],
      };

      const mainRegionResponse = await fetch(`${baseUrl}/api/b2b/v3/search/serp/hotels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify(mainRegionSearchData),
      });

      if (mainRegionResponse.ok) {
        const mainRegionResult = await mainRegionResponse.json();
        const mainRegionCount = mainRegionResult.data && mainRegionResult.data.hotels ? mainRegionResult.data.hotels.length : 0;
        console.log("Hotels found with main region:", mainRegionCount);

        if (mainRegionCount > 0) {
          return NextResponse.json({
            success: true,
            data: mainRegionResult,
            locationData: multicompleteResult.data,
            message: "Hotels found successfully",
          });
        }
      }
    }

    // Strategy 3: If still no results, try with specific hotel IDs as fallback
    if (hotelsFound === 0 && multicompleteResult.data.hotels && multicompleteResult.data.hotels.length > 0) {
      console.log("Strategy 3: Trying with specific hotel IDs as fallback...");

      const hotelIds = multicompleteResult.data.hotels.map((hotel) => hotel.id);
      console.log("Using hotel IDs:", hotelIds);

      const hotelIdSearchData = {
        ...hotelSearchData,
        ids: hotelIds,
      };

      const hotelIdResponse = await fetch(`${baseUrl}/api/b2b/v3/search/serp/hotels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify(hotelIdSearchData),
      });

      if (hotelIdResponse.ok) {
        const hotelIdResult = await hotelIdResponse.json();
        const hotelIdCount = hotelIdResult.data && hotelIdResult.data.hotels ? hotelIdResult.data.hotels.length : 0;
        console.log("Hotels found with hotel IDs:", hotelIdCount);

        if (hotelIdCount > 0) {
          return NextResponse.json({
            success: true,
            data: hotelIdResult,
            locationData: multicompleteResult.data,
            message: "Hotels found successfully",
          });
        }
      }
    }

    // Return the main result (even if empty, for debugging)
    return NextResponse.json({
      success: true,
      data: hotelResult,
      locationData: multicompleteResult.data,
      message: hotelsFound > 0 ? "Hotels found successfully" : "No hotels available for the selected dates and location",
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
