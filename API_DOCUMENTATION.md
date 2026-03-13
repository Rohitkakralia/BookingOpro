# Booking API Documentation

## Overview

This documentation covers the API integration for your booking system with the provided B2B APIs. Your API key and credentials are configured in `.env.local`.

## API Configuration

- **API Key**: `91e14798-048f-4d4f-b84f-337c0381f2b9`
- **Key ID**: `15137`
- **Base URL**: `https://api.worldota.net`
- **Authentication**: Basic Auth (Base64 encoded `keyId:apiKey`)

## Authentication Method

The Worldota API uses Basic Authentication:

```javascript
const authString = Buffer.from(`${keyId}:${apiKey}`).toString('base64');
const headers = {
  'Authorization': `Basic ${authString}`,
  'Content-Type': 'application/json'
};
```

## Available APIs

### Hotel APIs

#### 1. Search Hotels

**Endpoint**: `/api/hotels/search`
**Method**: POST
**Rate Limit**: 150 requests/60 seconds

```javascript
const searchData = {
  checkin: "2024-06-01",
  checkout: "2024-06-05",
  destination: "New York",
  adults: 2,
  children: 0,
  currency: "USD",
  language: "en",
};

const response = await fetch("/api/hotels/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(searchData),
});
```

#### 2. Get Hotel Information

**Endpoint**: `/api/hotels/info`
**Method**: POST
**Rate Limit**: 30 requests/60 seconds

```javascript
const response = await fetch("/api/hotels/info", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ hotelId: "hotel_123" }),
});
```

#### 3. Book Hotel

**Endpoint**: `/api/hotels/book`
**Method**: POST
**Rate Limit**: 30 requests/60 seconds

```javascript
const bookingData = {
  hotelId: "hotel_123",
  checkin: "2024-06-01",
  checkout: "2024-06-05",
  adults: 2,
  children: 0,
  rooms: 1,
  guestData: [
    {
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      phone: "+1234567890",
    },
  ],
  contactData: {
    email: "john@example.com",
    phone: "+1234567890",
  },
};

const response = await fetch("/api/hotels/book", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(bookingData),
});
```

#### 4. Get All Hotels (Dump)

**Endpoint**: `/api/hotels/dump`
**Method**: POST or GET
**Rate Limit**: 100 requests/86400 seconds

```javascript
// Get all hotels data
const response = await fetch('/api/hotels/dump', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    inventory: 'all', 
    language: 'en' 
  })
});

// Or just get the download URL
const response = await fetch('/api/hotels/dump');
```

**Endpoint**: `/api/hotels/book`
**Method**: POST
**Rate Limit**: 30 requests/60 seconds

```javascript
const bookingData = {
  hotelId: "hotel_123",
  checkin: "2024-06-01",
  checkout: "2024-06-05",
  adults: 2,
  children: 0,
  rooms: 1,
  guestData: [
    {
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      phone: "+1234567890",
    },
  ],
  contactData: {
    email: "john@example.com",
    phone: "+1234567890",
  },
};

const response = await fetch("/api/hotels/book", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(bookingData),
});
```

### Flight APIs

#### 1. Search Flights

**Endpoint**: `/api/flights` or `/api/flights/search`
**Method**: POST

```javascript
const searchData = {
  tripType: "Round trip",
  from: "New York",
  to: "Los Angeles",
  departure: "2024-06-01",
  return: "2024-06-05",
  travelers: "2 adults",
  departureTime: "12:00",
  returnTime: "15:00",
};

const response = await fetch("/api/flights", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(searchData),
});
```

### Booking Management

#### 1. Get Booking Status

**Endpoint**: `/api/bookings?orderId={orderId}&type={type}`
**Method**: GET

```javascript
const response = await fetch("/api/bookings?orderId=12345&type=hotel");
```

#### 2. Cancel Booking

**Endpoint**: `/api/bookings`
**Method**: DELETE

```javascript
const response = await fetch("/api/bookings", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ orderId: "12345", type: "hotel" }),
});
```

## Using the React Hook

```javascript
import { useBookingAPI } from "../hooks/useBookingAPI";

function MyComponent() {
  const { loading, error, searchHotels, bookHotel } = useBookingAPI();

  const handleSearch = async () => {
    try {
      const results = await searchHotels({
        checkin: "2024-06-01",
        checkout: "2024-06-05",
        destination: "Paris",
        adults: 2,
      });
      console.log(results.data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleSearch}>Search Hotels</button>
    </div>
  );
}
```

## Available B2B API Endpoints

### Hotel Operations

- `api/b2b/v3/hotel/info` - Get hotel details
- `api/b2b/v3/hotel/prebook` - Prebook hotel
- `api/b2b/v3/hotel/order/booking/form` - Get booking form
- `api/b2b/v3/hotel/order/booking/finish` - Complete booking
- `api/b2b/v3/hotel/order/cancel` - Cancel booking
- `api/b2b/v3/hotel/order/info` - Get order info

### Search Operations

- `api/b2b/v3/search/serp/hotels` - Search hotels
- `api/b2b/v3/search/multicomplete` - Autocomplete search
- `api/b2b/v3/search/serp/region` - Search by region
- `api/b2b/v3/search/serp/geo` - Search by coordinates

### Profile Management

- `api/b2b/v3/profiles/list` - List profiles
- `api/b2b/v3/profiles/create` - Create profile
- `api/b2b/v3/profiles/edit` - Edit profile
- `api/b2b/v3/profiles/delete` - Delete profile

### Data Dumps

- `api/b2b/v3/hotel/static` - Static hotel data
- `api/b2b/v3/hotel/region/dump` - Hotel regions
- `api/b2b/v3/hotel/poi/dump` - Points of interest

## Rate Limits

- Most endpoints: 30 requests/60 seconds
- Search endpoints: 150 requests/60 seconds
- Dump endpoints: 100 requests/86400 seconds

## Error Handling

All API responses follow this structure:

```javascript
{
  success: true/false,
  data: {...}, // Response data
  message: "Success/error message",
  error: "Error details" // Only present on errors
}
```

## Next Steps

1. ✅ API base URL configured: `https://api.worldota.net`
2. Test the APIs using your existing flight search form
3. Implement flight-specific APIs when available
4. Add proper error handling and loading states to your components
5. Consider implementing caching for frequently accessed data
