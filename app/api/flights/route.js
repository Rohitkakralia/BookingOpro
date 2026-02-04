import connectDB from "../../../db/connectDB";

export async function POST(request) {
  try {
    const pool = await connectDB();
    console.log("Database connected successfully");
    console.log("body received", request);
    const body = await request.json();

    const {
      tripType,
      from,
      to,
      departure,
      return: returnDate,
      travelers
    } = body;

    // Extract number & class
    const [count, travelClass] = travelers.split(",").map(v => v.trim());

    await pool.query(
      `INSERT INTO flight_searches
       (trip_type, from_city, to_city, departure_date, return_date, travelers, travel_class)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tripType,
        from,
        to,
        departure,
        tripType === "Round Trip" ? returnDate : null,
        parseInt(count),
        travelClass
      ]
    );

    return Response.json({ message: "Search stored successfully" });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
