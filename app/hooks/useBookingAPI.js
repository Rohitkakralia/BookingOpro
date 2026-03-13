import { useState } from "react";

export const useBookingAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      };

      console.log("API Request:", {
        endpoint,
        method: requestOptions.method || "GET",
        hasBody: !!requestOptions.body,
      });

      const response = await fetch(endpoint, requestOptions);

      console.log("API Response Status:", response.status);

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error("Failed to parse JSON response:", parseErr);
        throw new Error(`Invalid JSON response from server (${response.status})`);
      }

      if (!response.ok) {
        // Handle different error response formats
        const errorMessage =
          data?.message ||
          data?.error ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error("API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        throw new Error(errorMessage);
      }

      console.log("API Success:", { endpoint, dataKeys: Object.keys(data) });
      return data;
    } catch (err) {
      const errorMessage = err?.message || "Unknown API error";
      console.error("API call failed:", {
        endpoint,
        error: errorMessage,
        errorObject: err,
      });
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Flight APIs
  const searchFlights = async (searchData) => {
    return apiCall("/api/flights/search", {
      method: "POST",
      body: JSON.stringify(searchData),
    });
  };

  // Hotel APIs
  const searchHotels = async (searchData) => {
    return apiCall("/api/hotels/search", {
      method: "POST",
      body: JSON.stringify(searchData),
    });
  };

  const getHotelInfo = async (hotelId) => {
    return apiCall("/api/hotels/info", {
      method: "POST",
      body: JSON.stringify({ hotelId }),
    });
  };

  const createBooking = async ({ book_hash, partner_order_id, language = 'en' }) => {
    try {
      const response = await fetch('/api/booking/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_hash, partner_order_id, language }),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };


  const bookHotel = async (bookingData) => {
    return apiCall("/api/hotels/book", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  };

  // ===== 3-STEP BOOKING FLOW =====

  const createBookingForm = async (formData) => {
    console.log("Step 1: Creating booking form with data:", formData);
    try {
      return await apiCall("/api/hotels/booking/form", {
        method: "POST",
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error("createBookingForm error:", error);
      throw error;
    }
  };

  // Simplified booking form (skips prebook step)
  const createSimpleBookingForm = async (formData) => {
    console.log("Step 1: Creating simple booking form with data:", formData);
    try {
      return await apiCall("/api/hotels/booking/simple-form", {
        method: "POST",
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error("createSimpleBookingForm error:", error);
      throw error;
    }
  };

  const finishBooking = async (bookingData) => {
    console.log("Step 2: Starting booking process. ETG order_id:", bookingData.order_id, "partner_order_id:", bookingData.partner_order_id);
    try {
      return await apiCall("/api/hotels/booking/finish", {
        method: "POST",
        body: JSON.stringify(bookingData),
      });
    } catch (error) {
      console.error("finishBooking error:", error);
      throw error;
    }
  };

  const checkBookingStatus = async (orderId) => {
    console.log("Step 3: Checking booking status for order:", orderId);
    try {
      return await apiCall("/api/hotels/booking/status", {
        method: "POST",
        body: JSON.stringify({ order_id: orderId }),
      });
    } catch (error) {
      console.error("checkBookingStatus error:", error);
      throw error;
    }
  };

  // Get all hotels dump
  const getAllHotels = async (inventory = "all", language = "en") => {
    return apiCall("/api/hotels/dump", {
      method: "POST",
      body: JSON.stringify({ inventory, language }),
    });
  };

  // Get hotels dump URL only (faster)
  const getHotelsDumpUrl = async () => {
    return apiCall("/api/hotels/dump");
  };

  // Booking management
  const getBookingInfo = async (orderId, type) => {
    return apiCall(`/api/bookings?orderId=${orderId}&type=${type}`);
  };

  const cancelBooking = async (orderId, type) => {
    return apiCall("/api/bookings", {
      method: "DELETE",
      body: JSON.stringify({ orderId, type }),
    });
  };

  // Destination autocomplete
  const searchDestinations = async (query) => {
    if (!query || query.length < 2) return { data: [] };

    return apiCall("/api/hotels/search/multicomplete", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  };

  return {
    loading,
    error,
    searchFlights,
    searchHotels,
    getHotelInfo,
    bookHotel,
    createBookingForm,
    createSimpleBookingForm,
    finishBooking,
    checkBookingStatus,
    getAllHotels,
    getHotelsDumpUrl,
    getBookingInfo,
    cancelBooking,
    searchDestinations,
  };
};
