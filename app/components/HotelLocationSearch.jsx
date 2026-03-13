"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingAPI } from "../hooks/useBookingAPI";

export default function HotelLocationSearch() {
  const router = useRouter();
  const { loading, searchDestinations } = useBookingAPI();
  const [searchParams, setSearchParams] = useState({
    destination: "",
    checkin: "",
    checkout: "",
    adults: 2,
    children: 0,
    currency: "USD",
    language: "en",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));

    // Handle destination autocomplete
    if (field === "destination") {
      if (value.length >= 2) {
        fetchDestinationSuggestions(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const fetchDestinationSuggestions = async (query) => {
    setSuggestionsLoading(true);
    try {
      const response = await searchDestinations(query);
      const results = response.data || [];
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      console.log("Destination suggestions:", results);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    // Support both string and object suggestion formats
    const destinationValue =
      typeof suggestion === "string"
        ? suggestion
        : suggestion.name || suggestion.label || suggestion.id;
    setSearchParams((prev) => ({ ...prev, destination: destinationValue }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (
      !searchParams.destination ||
      !searchParams.checkin ||
      !searchParams.checkout
    ) {
      alert("Please fill in destination, check-in and check-out dates");
      return;
    }

    // Create URL parameters for the hotel-results page
    const urlParams = new URLSearchParams({
      destination: searchParams.destination,
      checkin: searchParams.checkin,
      checkout: searchParams.checkout,
      adults: searchParams.adults.toString(),
      children: searchParams.children.toString(),
      currency: searchParams.currency,
      language: searchParams.language,
    });

    // Navigate to hotel-results page with search parameters
    router.push(`/hotel-results?${urlParams.toString()}`);
  };

  const handleViewHotelInfo = async (hotelId) => {
    // This function is no longer needed in the search component
    // Hotel info will be handled in the results page
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Search Hotels by Location</h2>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-lg shadow-lg p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchParams.destination}
                onChange={(e) =>
                  handleInputChange("destination", e.target.value)
                }
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                placeholder="City, hotel name, or region"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="off"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 z-10 max-h-64 overflow-y-auto shadow-lg">
                  {suggestionsLoading && (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      Loading suggestions...
                    </div>
                  )}
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer border-b border-gray-200 last:border-b-0 text-sm"
                    >
                      <div className="font-medium">
                        {typeof suggestion === "string"
                          ? suggestion
                          : suggestion.name ||
                            suggestion.label ||
                            suggestion.id}
                      </div>
                      {typeof suggestion === "object" && suggestion.type && (
                        <div className="text-xs text-gray-500">
                          {suggestion.type}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Check-in */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in
            </label>
            <input
              type="date"
              value={searchParams.checkin}
              onChange={(e) => handleInputChange("checkin", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Check-out */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out
            </label>
            <input
              type="date"
              value={searchParams.checkout}
              onChange={(e) => handleInputChange("checkout", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Adults */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adults
            </label>
            <select
              value={searchParams.adults}
              onChange={(e) =>
                handleInputChange("adults", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} Adult{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Children */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Children
            </label>
            <select
              value={searchParams.children}
              onChange={(e) =>
                handleInputChange("children", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[0, 1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num} Child{num !== 1 ? "ren" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={searchParams.currency}
              onChange={(e) => handleInputChange("currency", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={searchParams.language}
              onChange={(e) => handleInputChange("language", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-700 text-black cursor-pointer font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching Hotels..." : "Search Hotels"}
        </button>
      </form>
    </div>
  );
}
