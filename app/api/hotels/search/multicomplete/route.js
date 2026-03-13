// Destination autocomplete endpoint - Fetch from external API
export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query || query.length < 2) {
      return Response.json({
        success: true,
        data: [],
      });
    }

    const keyId = process.env.KEY_ID;
    const apiKey = process.env.API_KEY;
    const baseUrl = process.env.API_BASE_URL;

    console.log("API Config - keyId set:", !!keyId, "apiKey set:", !!apiKey, "baseUrl set:", !!baseUrl);

    if (keyId && apiKey && baseUrl) {
      // Fetch from external booking API using Basic Auth
      try {
        console.log("Fetching from external API:", baseUrl);
        
        // Create Basic Auth header
        const authString = Buffer.from(`${keyId}:${apiKey}`).toString("base64");
        
        const apiResponse = await fetch(`${baseUrl}/api/b2b/v3/search/multicomplete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${authString}`,
          },
          body: JSON.stringify({
            query,
            language: "en",
          }),
        });

        console.log("API Response Status:", apiResponse.status);
        const responseData = await apiResponse.json();
        console.log("External API response:", JSON.stringify(responseData).substring(0, 500));

        if (apiResponse.ok && responseData) {
          // Extract regions from API response
          let destinations = [];
          if (responseData.data && responseData.data.regions) {
            destinations = responseData.data.regions.map(region => ({
              id: region.id,
              name: region.name,
              type: "Region",
            }));
          }
          
          console.log("Destinations from API:", destinations);
          if (destinations.length > 0) {
            return Response.json({
              success: true,
              data: destinations.slice(0, 10),
            });
          }
        } else {
          console.error("API returned error status:", apiResponse.status);
        }
      } catch (apiError) {
        console.error("External API error:", apiError.message);
      }
    } else {
      console.warn("Missing API credentials - Set KEY_ID, API_KEY and API_BASE_URL in .env.local");
    }

    // Fallback sample data (for testing when API fails)
    console.log("Using fallback sample data");
    const sampleDestinations = [
      { id: "paris", name: "Paris, France", type: "City" },
      { id: "london", name: "London, United Kingdom", type: "City" },
      { id: "new_york", name: "New York, United States", type: "City" },
      { id: "singapore", name: "Singapore", type: "City" },
      { id: "dubai", name: "Dubai, UAE", type: "City" },
      { id: "tokyo", name: "Tokyo, Japan", type: "City" },
      { id: "bangkok", name: "Bangkok, Thailand", type: "City" },
      { id: "bali", name: "Bali, Indonesia", type: "Island" },
      { id: "sydney", name: "Sydney, Australia", type: "City" },
    ];

    const filtered = sampleDestinations.filter(
      (dest) =>
        dest.name.toLowerCase().includes(query.toLowerCase()) ||
        dest.id.toLowerCase().includes(query.toLowerCase())
    );

    console.log("Filtered results:", filtered);
    return Response.json({
      success: true,
      data: filtered.slice(0, 10),
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
