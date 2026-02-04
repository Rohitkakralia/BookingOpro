import connectDB from "../../../db/connectDB";

export async function GET() {
  try {
    const pool = await connectDB();

    const [rows] = await pool.query(
      "SELECT * FROM flight_searches ORDER BY created_at DESC"
    );

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching flights:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
