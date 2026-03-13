import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { hotelId } = await request.json();
    
    console.log("Hotel info request received for hotelId:", hotelId);
    
    if (!hotelId) {
      return NextResponse.json({
        success: false,
        message: 'Hotel ID is required'
      }, { status: 400 });
    }

    const keyId = process.env.KEY_ID;
    const apiKey = process.env.API_KEY;
    const baseUrl = process.env.API_BASE_URL;

    console.log("Environment check:", {
      hasKeyId: !!keyId,
      hasApiKey: !!apiKey,
      hasBaseUrl: !!baseUrl,
    });

    if (!keyId || !apiKey || !baseUrl) {
      console.error("Missing environment variables");
      return NextResponse.json({
        success: false,
        message: 'Server configuration error'
      }, { status: 500 });
    }

    const authString = Buffer.from(`${keyId}:${apiKey}`).toString("base64");

    const apiUrl = `${baseUrl}/api/b2b/v3/hotel/info`;
    const requestBody = { 
      id: hotelId,
      language: "en"
    };

    console.log("Making API request:", {
      url: apiUrl,
      hotelId: hotelId,
      bodyToSend: requestBody
    });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      return NextResponse.json({
        success: false,
        error: `API Error: ${response.status} - ${response.statusText}`,
        message: 'Failed to get hotel information from external API'
      }, { status: 500 });
    }

    const hotelInfo = await response.json();
    console.log("Hotel info retrieved successfully");

    return NextResponse.json({
      success: true,
      data: hotelInfo,
      message: 'Hotel information retrieved successfully'
    });

  } catch (error) {
    console.error('Hotel info route error:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      message: 'Failed to process hotel information request'
    }, { status: 500 });
  }
}