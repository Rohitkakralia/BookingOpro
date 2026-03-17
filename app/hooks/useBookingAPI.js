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
        
        // Don't log sandbox restrictions as errors since they're expected in dev
        const isSandboxRestriction = errorMessage.includes("sandbox_restriction");
        if (!isSandboxRestriction) {
          console.error("API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            data,
          });
        }
        throw new Error(errorMessage);
      }

      console.log("API Success:", { endpoint, dataKeys: Object.keys(data) });
      return data;
    } catch (err) {
      const errorMessage = err?.message || "Unknown API error";
      
      // Don't log sandbox restrictions as errors since they're expected in dev
      const isSandboxRestriction = errorMessage.includes("sandbox_restriction");
      if (!isSandboxRestriction) {
        console.error("API call failed:", {
          endpoint,
          error: errorMessage,
          errorObject: err,
        });
      }
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Flight APIs
  // const searchFlights = async (searchData) => {
  //   return apiCall("/api/flights/search", {
  //     method: "POST",
  //     body: JSON.stringify(searchData),
  //   });
  // };

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

  // const bookHotel = async (bookingData) => {
  //   return apiCall("/api/hotels/book", {
  //     method: "POST",
  //     body: JSON.stringify(bookingData),
  //   });
  // };

  // ===== 3-STEP BOOKING FLOW =====

  const createBookingForm = async ({ book_hash, language = "en", user_ip }) => {
    console.log("Step 1: Creating booking form with book_hash:", book_hash);
   
    if (!book_hash) {
      throw new Error("book_hash is required to create a booking form");
    }
   
    try {
      return await apiCall("/api/hotels/booking/form", {
        method: "POST",
        body: JSON.stringify({
          book_hash,
          language,
          user_ip: user_ip || "127.0.0.1",
        }),
      });
    } catch (error) {
      // Don't log sandbox restrictions as errors since they're expected in dev
      const isSandboxRestriction = error?.message?.includes("sandbox_restriction");
      if (!isSandboxRestriction) {
        console.error("createBookingForm error:", error);
      }
      throw error;
    }
  };

  //=========================================================================================================
  const generateUUIDFromItemId = (item_id, salt = "") => {
  const input = `${item_id}-${salt}-${Date.now()}`;
  
  // Simple hash of the input string
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use hash + random to fill UUID segments
  const hashHex = Math.abs(hash).toString(16).padStart(8, "0");
  const rand = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, "0");

  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const p1 = hashHex;                                      // 8  chars (from item_id hash)
  const p2 = rand();                                       // 4  chars
  const p3 = "4" + rand().slice(1);                        // 4  chars (version 4)
  const p4 = ((parseInt(rand(), 16) & 0x3fff) | 0x8000)   // 4  chars (variant bits)
               .toString(16).padStart(4, "0");
  const p5 = rand() + rand() + rand();                     // 12 chars

  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
};

  const getCreditToken = async (bookingData) => {
  console.log("Step 2: Getting credit token for booking data:", bookingData);

  const {
    item_id,
    first_name,
    last_name,
    cvc,
    credit_card_data_core,
  } = bookingData;

  const pay_uuid  = generateUUIDFromItemId(item_id, "pay");
  const init_uuid = generateUUIDFromItemId(item_id, "init");

  console.log("item_id:", item_id);
  console.log("Generated pay_uuid:", pay_uuid);
  console.log("Generated init_uuid:", init_uuid);

  const payload = {
    object_id: item_id,
    pay_uuid,
    init_uuid,
    user_first_name: first_name,
    user_last_name: last_name,
    cvc: cvc || undefined,
    is_cvc_required: true,
    credit_card_data_core: {
      card_number: credit_card_data_core.card_number,
      card_holder: credit_card_data_core.card_holder,
      month: credit_card_data_core.month,
      year: credit_card_data_core.year,
    },
  };

  console.log("Sending payload to creditToken backend:", payload);

  const response = await fetch("/api/hotels/booking/creditToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("creditToken backend error:", errorBody);
    throw new Error(
      errorBody?.message || `Credit token request failed (${response.status})`
    );
  }

  const data = await response.json();
  console.log("creditToken response:", data);

  return { ...data, pay_uuid, init_uuid };
};

  // Simplified booking form (skips prebook step)
  // const createSimpleBookingForm = async (formData) => {
  //   console.log("Step 1: Creating simple booking form with data:", formData);
  //   try {
  //     return await apiCall("/api/hotels/booking/simple-form", {
  //       method: "POST",
  //       body: JSON.stringify(formData),
  //     });
  //   } catch (error) {
  //     console.error("createSimpleBookingForm error:", error);
  //     throw error;
  //   }
  // };

  const finishBooking = async (bookingData) => {
    console.log("Step 3: Finishing booking process with data:", bookingData);
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

  // const checkBookingStatus = async (orderId) => {
  //   console.log("Step 3: Checking booking status for order:", orderId);
  //   try {
  //     return await apiCall("/api/hotels/booking/status", {
  //       method: "POST",
  //       body: JSON.stringify({ order_id: orderId }),
  //     });
  //   } catch (error) {
  //     console.error("checkBookingStatus error:", error);
  //     throw error;
  //   }
  // };

  // Get all hotels dump
  // const getAllHotels = async (inventory = "all", language = "en") => {
  //   return apiCall("/api/hotels/dump", {
  //     method: "POST",
  //     body: JSON.stringify({ inventory, language }),
  //   });
  // };

  // Get hotels dump URL only (faster)
  // const getHotelsDumpUrl = async () => {
  //   return apiCall("/api/hotels/dump");
  // };

  // Booking management
  // const getBookingInfo = async (orderId, type) => {
  //   return apiCall(`/api/bookings?orderId=${orderId}&type=${type}`);
  // };

  // const cancelBooking = async (orderId, type) => {
  //   return apiCall("/api/bookings", {
  //     method: "DELETE",
  //     body: JSON.stringify({ orderId, type }),
  //   });
  // };

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
    //searchFlights,
    searchHotels,
    getHotelInfo,
    //bookHotel,
    createBookingForm,
    //createSimpleBookingForm,
    finishBooking,
    //checkBookingStatus,
    //getAllHotels,
    //getHotelsDumpUrl,
    //getBookingInfo,
    //cancelBooking,
    getCreditToken,
    searchDestinations,
  };
};
