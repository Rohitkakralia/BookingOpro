"use client";

export default function BookingGuide() {
  return (
    <div className="bg-white rounded-lg p-6 border">
      <h3 className="text-xl font-bold mb-4">🏨 Hotel Booking System Guide</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-green-600 mb-2">✅ What&apos;s Working:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Hotel search with RateHawk API integration</li>
            <li>Destination autocomplete with fallback data</li>
            <li>Hotel result cards with room details</li>
            <li>4-step booking flow (Review → Guest Info → Confirm → Processing)</li>
            <li>Booking form creation (Step 1)</li>
            <li>Booking submission (Step 2)</li>
            <li>Status polling (Step 3)</li>
            <li>Error handling and validation</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-blue-600 mb-2">🔄 How to Use:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Search Hotels:</strong> Use the main search form with destination, dates, and guest count</li>
            <li><strong>Browse Results:</strong> View hotel cards with room options and pricing</li>
            <li><strong>Book a Room:</strong> Click &quot;Book Now&quot; on any room rate</li>
            <li><strong>Complete Booking:</strong> Follow the 4-step booking process:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Review booking details</li>
                <li>Enter guest information</li>
                <li>Confirm and submit</li>
                <li>Wait for confirmation</li>
              </ul>
            </li>
          </ol>
        </div>

        <div>
          <h4 className="font-semibold text-orange-600 mb-2">⚙️ API Endpoints:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm font-mono">
            <li>/api/hotels/search - Hotel search</li>
            <li>/api/hotels/search/multicomplete - Destination autocomplete</li>
            <li>/api/hotels/info - Hotel details</li>
            <li>/api/hotels/booking/form - Create booking form</li>
            <li>/api/hotels/booking/finish - Submit booking</li>
            <li>/api/hotels/booking/status - Check booking status</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-purple-600 mb-2">🧪 Testing:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Use the &quot;Run Test&quot; button above to test hotel search</li>
            <li>Try searching for destinations like &quot;Paris&quot;, &quot;London&quot;, &quot;New York&quot;</li>
            <li>Test the booking flow with any hotel result</li>
            <li>Check booking status with the status checker</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Recent Fixes:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            <li>Fixed prebook API endpoint 404 error - now uses fallback approach</li>
            <li>Added simplified booking form that skips prebook step</li>
            <li>Removed trailing slashes from API endpoints</li>
            <li>Added comprehensive error handling and retry logic</li>
            <li>Added API endpoint tester to verify connectivity</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="font-semibold text-blue-800 mb-2">🔧 Troubleshooting:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
            <li>Use the API Tester above to check which endpoints are working</li>
            <li>If prebook fails, the system automatically uses simplified booking</li>
            <li>Check browser console for detailed error messages</li>
            <li>Verify your API credentials are correct in .env.local</li>
          </ul>
        </div>
      </div>
    </div>
  );
}