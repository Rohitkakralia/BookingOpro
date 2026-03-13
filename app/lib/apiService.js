// API Service for Booking System
const API_BASE_URL = process.env.API_BASE_URL || "https://api.worldota.net";
const API_KEY = process.env.API_KEY;
const KEY_ID = process.env.KEY_ID;

class BookingAPIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.apiKey = API_KEY;
    this.keyId = KEY_ID;
  }

  // Generic API call method
  async makeAPICall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Use Basic Auth as shown in the example
    // Create base64 encoding for Node.js environment
    let authString;
    try {
      if (typeof Buffer !== "undefined") {
        // Node.js environment
        authString = Buffer.from(`${this.keyId}:${this.apiKey}`).toString(
          "base64"
        );
      } else {
        // Browser environment (fallback)
        authString = btoa(`${this.keyId}:${this.apiKey}`);
      }
    } catch (error) {
      console.error("Authentication encoding error:", error);
      throw new Error("Failed to create authentication header");
    }

    const defaultHeaders = {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
      ...options.headers,
    };

    const config = {
      method: options.method || "POST", // Default to POST as per API examples
      headers: defaultHeaders,
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    console.log("Making API call to:", url);
    console.log("Request config:", {
      ...config,
      headers: { ...config.headers, Authorization: "[HIDDEN]" },
    });

    try {
      const response = await fetch(url, config);

      console.log("API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error response:", errorText);
        throw new Error(
          `API Error: ${response.status} - ${response.statusText}. Response: ${errorText}`
        );
      }

      const responseData = await response.json();
      console.log("API Response data:", responseData);
      return responseData;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ===== HOTEL APIs =====

  // Search hotels by location
  async searchHotelsByLocation(searchParams) {
    const endpoint = "/api/b2b/v3/search/serp/hotels";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: searchParams,
    });
  }

  // Get hotel info
  async getHotelInfo(hotelId) {
    const endpoint = `/api/b2b/v3/hotel/info`;
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: { 
        id: hotelId,
        language: "en"
      },
    });
  }

  // Hotel prebook
  async prebookHotel(prebookData) {
    const endpoint = "/api/b2b/v3/hotel/prebook";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: prebookData,
    });
  }

  // Get booking form
  async getHotelBookingForm(formData) {
    const endpoint = "/api/b2b/v3/hotel/order/booking/form";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: formData,
    });
  }

  // Finish hotel booking
  async finishHotelBooking(bookingData) {
    const endpoint = "/api/b2b/v3/hotel/order/booking/finish";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: bookingData,
    });
  }

  // Get booking status
  async getHotelBookingStatus(orderId) {
    const endpoint = "/api/b2b/v3/hotel/order/booking/finish/status";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: { order_id: orderId },
    });
  }

  // Get hotel order info
  async getHotelOrderInfo(orderId) {
    const endpoint = "/api/b2b/v3/hotel/order/info";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: { order_id: orderId },
    });
  }

  // Cancel hotel order
  async cancelHotelOrder(orderId) {
    const endpoint = "/api/b2b/v3/hotel/order/cancel";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: { order_id: orderId },
    });
  }

  // Download hotel voucher
  async downloadHotelVoucher(orderId) {
    const endpoint = "/api/b2b/v3/hotel/order/document/voucher/download";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: { order_id: orderId },
    });
  }

  // ===== SEARCH APIs =====

  // Multicomplete search
  async searchMulticomplete(query) {
    const endpoint = "/api/b2b/v3/search/multicomplete";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: { query },
    });
  }

  // Search by region
  async searchByRegion(regionData) {
    const endpoint = "/api/b2b/v3/search/serp/region";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: regionData,
    });
  }

  // Search by geo
  async searchByGeo(geoData) {
    const endpoint = "/api/b2b/v3/search/serp/geo";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: geoData,
    });
  }

  // ===== PROFILE APIs =====

  // List profiles
  async listProfiles() {
    const endpoint = "/api/b2b/v3/profiles/list";
    return this.makeAPICall(endpoint, { method: "POST" });
  }

  // Create profile
  async createProfile(profileData) {
    const endpoint = "/api/b2b/v3/profiles/create";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: profileData,
    });
  }

  // Edit profile
  async editProfile(profileData) {
    const endpoint = "/api/b2b/v3/profiles/edit";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: profileData,
    });
  }

  // Delete profile
  async deleteProfile(profileId) {
    const endpoint = "/api/b2b/v3/profiles/delete";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: { profile_id: profileId },
    });
  }

  // ===== UTILITY APIs =====

  // Get overview
  async getOverview() {
    const endpoint = "/api/b2b/v3/overview";
    return this.makeAPICall(endpoint, { method: "POST" });
  }

  // Get hotel static data
  async getHotelStatic() {
    const endpoint = "/api/b2b/v3/hotel/static";
    return this.makeAPICall(endpoint, { method: "POST" });
  }

  // Get hotel info dump - retrieves all hotels data
  async getHotelInfoDump(inventory = "all", language = "en") {
    const endpoint = "/api/b2b/v3/hotel/info/dump/";
    return this.makeAPICall(endpoint, {
      method: "POST",
      body: {
        inventory: inventory,
        language: language,
      },
    });
  }

  // Get hotel regions dump
  async getHotelRegionsDump() {
    const endpoint = "/api/b2b/v3/hotel/region/dump";
    return this.makeAPICall(endpoint, { method: "POST" });
  }

  // Get hotel POI dump
  async getHotelPOIDump() {
    const endpoint = "/api/b2b/v3/hotel/poi/dump";
    return this.makeAPICall(endpoint, { method: "POST" });
  }
}

const apiService = new BookingAPIService();
export default apiService;
