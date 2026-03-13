import connectDB from "../../../db/connectDB";
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      tripType,
      from,
      to,
      departure,
      return: returnDate,
      travelers,
      departureTime,
      returnTime
    } = body;

    // Store search in database
    try {
      const pool = await connectDB();
      console.log("Database connected successfully");

      // Extract number of travelers
      const travelerCount = parseInt(travelers.split(' ')[0]) || 2;

      await pool.query(
        `INSERT INTO flight_searches
         (trip_type, from_city, to_city, departure_date, return_date, travelers, departure_time, return_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tripType,
          from,
          to,
          departure,
          tripType === "Round trip" ? returnDate : null,
          travelerCount,
          departureTime,
          returnTime
        ]
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Continue with API call even if DB storage fails
    }

    // Mock flight search results (replace with actual API call)
    const mockFlightResults = {
      flights: [
        {
          id: 'FL001',
          airline: 'SkyWings Airlines',
          airline_code: 'SW',
          from: from,
          to: to,
          departure: departure,
          departureTime: departureTime,
          return: returnDate,
          returnTime: returnTime,
          price: Math.floor(Math.random() * 500) + 200,
          currency: 'USD',
          duration: '2h 45m',
          stops: 0,
          aircraft: 'Boeing 737-800',
          baggage: '1 x 23kg',
          refundable: false,
          class: 'Economy'
        },
        {
          id: 'FL002',
          airline: 'Global Connect',
          airline_code: 'GC',
          from: from,
          to: to,
          departure: departure,
          departureTime: '16:30',
          return: returnDate,
          returnTime: returnTime,
          price: Math.floor(Math.random() * 600) + 300,
          currency: 'USD',
          duration: '3h 20m',
          stops: 1,
          aircraft: 'Airbus A320',
          baggage: '2 x 23kg',
          refundable: true,
          class: 'Economy'
        }
      ],
      totalResults: 2,
      searchId: 'search_' + Date.now(),
      searchParams: {
        tripType,
        from,
        to,
        departure,
        return: returnDate,
        travelers: travelerCount
      }
    };

    return NextResponse.json({
      success: true,
      data: mockFlightResults,
      message: "Flight search completed successfully"
    });

  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Failed to search flights"
    }, { status: 500 });
  }
}
