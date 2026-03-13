// Examples of how to call hotel search API from frontend

// ===== METHOD 1: Using the React Hook (Recommended) =====
import { useBookingAPI } from '../hooks/useBookingAPI';

function MyComponent() {
  const { searchHotels, loading, error } = useBookingAPI();

  const searchHotelsInParis = async () => {
    try {
      const searchParams = {
        destination: 'Paris',
        checkin: '2024-06-01',
        checkout: '2024-06-05',
        adults: 2,
        children: 0,
        currency: 'USD',
        language: 'en'
      };

      const response = await searchHotels(searchParams);
      console.log('Hotels in Paris:', response.data);
      return response.data;
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <button onClick={searchHotelsInParis} disabled={loading}>
      {loading ? 'Searching...' : 'Search Paris Hotels'}
    </button>
  );
}

// ===== METHOD 2: Direct Fetch API Call =====
async function searchHotelsDirectly() {
  try {
    const searchParams = {
      destination: 'New York',
      checkin: '2024-07-01',
      checkout: '2024-07-05',
      adults: 2,
      children: 1,
      currency: 'USD',
      language: 'en'
    };

    const response = await fetch('/api/hotels/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchParams)
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    console.log('Hotels in New York:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// ===== METHOD 3: Using Async/Await with Error Handling =====
async function searchHotelsWithErrorHandling(location, checkin, checkout) {
  const searchParams = {
    destination: location,
    checkin: checkin,
    checkout: checkout,
    adults: 2,
    children: 0,
    currency: 'USD',
    language: 'en'
  };

  try {
    const response = await fetch('/api/hotels/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchParams)
    });

    const result = await response.json();

    if (result.success) {
      console.log(`Found ${result.data.hotels?.length || 0} hotels in ${location}`);
      return result.data;
    } else {
      throw new Error(result.message || 'Search failed');
    }
  } catch (error) {
    console.error('Hotel search error:', error.message);
    throw error;
  }
}

// ===== METHOD 4: Search Multiple Locations =====
async function searchMultipleLocations(locations) {
  const checkin = '2024-08-01';
  const checkout = '2024-08-05';
  
  const searchPromises = locations.map(location => 
    fetch('/api/hotels/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: location,
        checkin,
        checkout,
        adults: 2,
        children: 0,
        currency: 'USD'
      })
    }).then(res => res.json())
  );

  try {
    const results = await Promise.all(searchPromises);
    return results.map((result, index) => ({
      location: locations[index],
      hotels: result.data?.hotels || [],
      success: result.success
    }));
  } catch (error) {
    console.error('Multi-location search failed:', error);
  }
}

// ===== USAGE EXAMPLES =====

// Example 1: Search hotels in London
searchHotelsDirectly();

// Example 2: Search with error handling
searchHotelsWithErrorHandling('London', '2024-06-15', '2024-06-20')
  .then(hotels => console.log('London hotels:', hotels))
  .catch(error => console.error('Failed to get London hotels:', error));

// Example 3: Search multiple cities
const cities = ['Paris', 'London', 'Rome', 'Barcelona'];
searchMultipleLocations(cities)
  .then(results => {
    results.forEach(result => {
      console.log(`${result.location}: ${result.hotels.length} hotels found`);
    });
  });

// ===== SEARCH PARAMETERS REFERENCE =====
const searchParamsExample = {
  destination: 'Tokyo',           // Required: City, region, or hotel name
  checkin: '2024-06-01',         // Required: YYYY-MM-DD format
  checkout: '2024-06-05',        // Required: YYYY-MM-DD format
  adults: 2,                     // Optional: Number of adults (default: 2)
  children: 0,                   // Optional: Number of children (default: 0)
  currency: 'USD',               // Optional: USD, EUR, GBP, etc. (default: USD)
  language: 'en',                // Optional: en, es, fr, de, etc. (default: en)
  regionType: 'city'             // Optional: city, region, country (default: city)
};

export {
  searchHotelsDirectly,
  searchHotelsWithErrorHandling,
  searchMultipleLocations
};