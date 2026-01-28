"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const hotels = [
  {
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    title: "Premium Stay",
    location: "Mumbai - Chennai",
    price: "$112.60/night",
  },
  {
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    title: "Premium Stay",
    location: "Riga - Copenhagen",
    price: "$108.39/night",
  },
  {
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    title: "Premium Stay",
    location: "Portland - Eugene",
    price: "$48.99/night",
  },
  {
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    title: "Premium Stay",
    location: "New York City - Tbilisi",
    price: "$559.99/night",
  },
  {
    img: "https://images.unsplash.com/photo-1502673530728-f79b4cab31b1",
    title: "Premium Stay",
    location: "New York City - Tirana",
    price: "$405.99/night",
  },
  {
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    title: "Premium Stay",
    location: "New York City - Tbilisi",
    price: "$559.99/night",
  },
  {
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    title: "Premium Stay",
    location: "New York City - Tbilisi",
    price: "$559.99/night",
  },
];

function FeaturedHotels() {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300; // Adjust this value to control scroll distance
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-[#043B3B] rounded-3xl py-12 px-10 mx-auto max-w-7xl">
      <h2 className="text-center text-3xl font-bold text-white mb-10">
        Featured <span className="text-[#e93d18]">Hotel Partners</span>
      </h2>

      <div className="relative flex items-center">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-6 bg-white p-3 rounded-xl shadow hover:bg-gray-100 z-10"
        >
          <ChevronLeft />
        </button>

        {/* Cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto overflow-y-hidden w-full scrollbar-hide scroll-smooth px-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {hotels.map((hotel, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 min-w-[240px] text-center shadow flex-shrink-0"
            >
              <img
                src={hotel.img}
                alt="hotel"
                className="h-16 w-20 mx-auto object-cover rounded-md mb-4"
              />
              <h3 className="font-semibold text-lg">{hotel.title}</h3>
              <p className="text-gray-500 text-sm">{hotel.location}</p>
              <p className="font-bold text-xl mt-2">{hotel.price}</p>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-6 bg-white p-3 rounded-xl shadow hover:bg-gray-100 z-10"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
export default FeaturedHotels;