"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useBookingAPI } from "../hooks/useBookingAPI";
import HotelResultCard from "../components/HotelResultCard";
import HotelInfoModal from "../components/HotelInfoModal";

export default function HotelResultsPage() {
  const searchParams = useSearchParams();
  const { loading, error, searchHotels, getHotelInfo } = useBookingAPI();
  
  const [hotels, setHotels] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedHotelInfo, setSelectedHotelInfo] = useState(null);
  const [hotelInfoLoading, setHotelInfoLoading] = useState(false);
  const [hotelInfoError, setHotelInfoError] = useState(null);

  // Get search parameters from URL
  const destination = searchParams.get('destination');
  const checkin = searchParams.get('checkin');
  const checkout = searchParams.get('checkout');
  const adults = searchParams.get('adults') || '2';
  const children = searchParams.get('children') || '0';
  const currency = searchParams.get('currency') || 'USD';
  const language = searchParams.get('language') || 'en';

  useEffect(() => {
    // Perform search when component mounts if we have required parameters
    if (destination && checkin && checkout) {
      performSearch();
    }
  }, [destination, checkin, checkout, adults, children, currency, language]);

  const performSearch = async () => {
    const searchData = {
      destination,
      checkin,
      checkout,
      adults: parseInt(adults),
      children: parseInt(children),
      currency,
      language,
    };

    console.log("Starting hotel search with params:", searchData);

    try {
      const response = await searchHotels(searchData);
      console.log("Hotel search response:", response);
      
      if (response.success) {
        setSearchResults(response.data);
        // Handle nested data structure: response.data.data.hotels
        const hotelsArray = response.data.data?.hotels || response.data.hotels || [];
        setHotels(hotelsArray);
      } else {
        throw new Error(response.message || response.error || 'Search failed');
      }
    } catch (err) {
      console.error("Search failed with error:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack
      });
    }
  };

  const handleViewHotelInfo = async (hotelId) => {
    if (!hotelId) {
      setHotelInfoError("Hotel ID is missing");
      return;
    }
    
    setHotelInfoLoading(true);
    setHotelInfoError(null);
    try {
      console.log("Fetching hotel info for ID:", hotelId);
      const response = await getHotelInfo(hotelId);
      console.log("Hotel info response:", response);
      
      if (response.success) {
        setSelectedHotelInfo(response.data.data || response);
      } else {
        setHotelInfoError(response.message || "Failed to fetch hotel information");
      }
    } catch (err) {
      console.error("Failed to fetch hotel info:", err);
      setHotelInfoError(`Failed to load hotel information: ${err.message}`);
    } finally {
      setHotelInfoLoading(false);
    }
  };

  const closeHotelInfoModal = () => {
    setSelectedHotelInfo(null);
    setHotelInfoError(null);
  };

  // If no search parameters, redirect to search page
  if (!destination || !checkin || !checkout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Search Parameters</h2>
          <p className="text-gray-600 mb-6">Please perform a search to view hotel results.</p>
          <a 
            href="/Hotels" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Hotel Search
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-6">
        {/* Search Summary Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Hotel Search Results</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Destination:</span>
              <p className="text-gray-900">{destination}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Check-in:</span>
              <p className="text-gray-900">{new Date(checkin).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Check-out:</span>
              <p className="text-gray-900">{new Date(checkout).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Guests:</span>
              <p className="text-gray-900">{adults} Adult{adults !== '1' ? 's' : ''}{children !== '0' ? `, ${children} Child${children !== '1' ? 'ren' : ''}` : ''}</p>
            </div>
          </div>
          <div className="mt-4">
            <a 
              href="/Hotels" 
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              ← Modify Search
            </a>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            🔍 Searching for hotels in {destination}...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ❌ Error: {error}
          </div>
        )}

        {/* Search Results */}
        {hotels && hotels.length > 0 && (
          <div>
            <div className="text-gray-600 mb-6 text-lg">
              Found {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} in {destination}
            </div>
            {hotels.map((hotel, index) => (
              <HotelResultCard 
                key={hotel.id || index} 
                hotelData={hotel}
                onViewInfo={() => handleViewHotelInfo(hotel.id)}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {searchResults && hotels.length === 0 && !loading && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            ℹ️ No hotels found for your search criteria. Try different dates or destination.
          </div>
        )}

        {/* Hotel Info Modal */}
        {selectedHotelInfo && (
          <HotelInfoModal hotel={selectedHotelInfo} onClose={closeHotelInfoModal} />
        )}
      </div>
    </div>
  );
}