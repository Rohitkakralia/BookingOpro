import { NextResponse } from 'next/server';
import apiService from '../../../lib/apiService';

export async function POST(request) {
  try {
    const { inventory = 'all', language = 'en' } = await request.json();
    
    // Get hotel dump from Worldota API
    const dumpResult = await apiService.getHotelInfoDump(inventory, language);
    
    if (!dumpResult.data || !dumpResult.data.url) {
      throw new Error('No dump URL received from API');
    }

    // The API returns a URL to download the hotel data
    const downloadUrl = dumpResult.data.url;
    
    // Fetch the actual hotel data from the provided URL
    const hotelDataResponse = await fetch(downloadUrl);
    
    if (!hotelDataResponse.ok) {
      throw new Error('Failed to download hotel data');
    }
    
    const hotelData = await hotelDataResponse.json();
    
    return NextResponse.json({
      success: true,
      data: {
        hotels: hotelData,
        downloadUrl: downloadUrl,
        totalHotels: Array.isArray(hotelData) ? hotelData.length : 0
      },
      message: 'Hotel dump retrieved successfully'
    });

  } catch (error) {
    console.error('Hotel dump error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve hotel dump'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Default parameters for GET request
    const dumpResult = await apiService.getHotelInfoDump('all', 'en');
    
    if (!dumpResult.data || !dumpResult.data.url) {
      throw new Error('No dump URL received from API');
    }

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: dumpResult.data.url,
        message: 'Use this URL to download hotel data'
      },
      message: 'Hotel dump URL retrieved successfully'
    });

  } catch (error) {
    console.error('Hotel dump error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve hotel dump URL'
    }, { status: 500 });
  }
}