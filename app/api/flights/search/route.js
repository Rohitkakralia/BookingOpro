import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const searchData = await request.json();
    
    // Transform search data for API
    const apiSearchData = {
      origin: searchData.from,
      destination: searchData.to,
      departure_date: searchData.departure,
      return_date: searchData.return,
      passengers: {
        adults: parseInt(searchData.travelers.split(' ')[0]) || 2,
        children: 0,
        infants: 0
      },
      trip_type: searchData.tripType === 'Round trip' ? 'round_trip' : 'one_way',
      class: 'economy'
    };

    // Mock response structure - replace with actual flight API call
    const mockFlightResults = {
      flights: [
        {
          id: 'FL001',
          airline: 'Example Airlines',
          airline_code: 'EX',
          from: searchData.from,
          to: searchData.to,
          departure: searchData.departure,
          departureTime: searchData.departureTime,
          return: searchData.return,
          returnTime: searchData.returnTime,
          price: 299,
          currency: 'USD',
          duration: '2h 30m',
          stops: 0,
          aircraft: 'Boeing 737',
          baggage: '1 x 23kg',
          refundable: false
        },
        {
          id: 'FL002',
          airline: 'Sky Connect',
          airline_code: 'SC',
          from: searchData.from,
          to: searchData.to,
          departure: searchData.departure,
          departureTime: '14:30',
          return: searchData.return,
          returnTime: searchData.returnTime,
          price: 349,
          currency: 'USD',
          duration: '3h 15m',
          stops: 1,
          aircraft: 'Airbus A320',
          baggage: '2 x 23kg',
          refundable: true
        }
      ],
      totalResults: 2,
      searchId: 'search_' + Date.now(),
      searchParams: apiSearchData
    };

    // TODO: Replace with actual flight API call when available
    // const flightResults = await flightAPIService.searchFlights(apiSearchData);
    
    return NextResponse.json({
      success: true,
      data: mockFlightResults,
      message: 'Flight search completed successfully'
    });

  } catch (error) {
    console.error('Flight search error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to search flights'
    }, { status: 500 });
  }
}