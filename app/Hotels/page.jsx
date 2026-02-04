"use client";
import React from "react";
import { useState } from "react";
import TopDeals from "../components/TopDeals";
import MostSearchedDestinations from "../components/MostSearchedDestinations";
import FeaturedHotels from "../components/FeaturedHotels";
import WhyChooseBookingOpro from "../components/WhyChooseBookingOpro";
import Testimonials from "../components/Testimonials";
import Feature from "../components/Feature";

const Hotels = () => {
  const [tab, setTab] = useState("hotels");
  const [formData, setFormData] = useState({
    destination: "",
    checkin: "",
    checkout: "",
    guestsRooms: "2 Adults, 1 Room",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    try {
      const response = await fetch("/api/hotels/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Hotel search results:", data);
        // Handle successful response (redirect, show results, etc.)
      } else {
        console.error("Search failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting hotel search:", error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans">
      <div
        className="relative w-full bg-cover bg-center transition-all duration-300 pb-32"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1626120639806-1237f30e6576?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
          minHeight: "350px",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex flex-col items-center justify-start pt-5 text-white text-center">
          <p className="uppercase tracking-[0.3em] text-sm">
            RENT THE PERFECT CAR FOR YOUR
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            NEXT ADVENTURE
          </h1>
        </div>
      </div>

      <div className="-mt-50 px-4 z-10 relative">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl">
          {/* TABS */}
          <div className="flex border-b">
            {["hotels"].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`flex-1 py-4 font-semibold capitalize transition
                  ${
                    tab === item
                      ? "border-b-3 border-[#36cccc] text-teal-900"
                      : "text-gray-500 hover:text-teal-700"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* HOTELS */}
            {tab === "hotels" && (
              <div className="grid md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="text-xs font-semibold text-teal-900">
                    Destination
                  </label>
                  <input
                    className="mt-1 w-full px-4 py-3 border rounded-lg"
                    placeholder="Where are you going?"
                    value={formData.destination}
                    onChange={(e) =>
                      handleInputChange("destination", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-teal-900">
                    Check-in
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full px-4 py-3 border rounded-lg"
                    value={formData.checkin}
                    onChange={(e) =>
                      handleInputChange("checkin", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-teal-900">
                    Check-out
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full px-4 py-3 border rounded-lg"
                    value={formData.checkout}
                    onChange={(e) =>
                      handleInputChange("checkout", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-teal-900">
                    Guests & Rooms
                  </label>
                  <select
                    className="mt-1 w-full px-4 py-3 border rounded-lg"
                    value={formData.guestsRooms}
                    onChange={(e) =>
                      handleInputChange("guestsRooms", e.target.value)
                    }
                  >
                    <option>1 Adult, 1 Room</option>
                    <option>2 Adults, 1 Room</option>
                    <option>2 Adults, 1 Child, 1 Room</option>
                    <option>2 Adults, 2 Children, 1 Room</option>
                    <option>3 Adults, 1 Room</option>
                    <option>4 Adults, 1 Room</option>
                    <option>2 Adults, 2 Rooms</option>
                    <option>4 Adults, 2 Rooms</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="cursor-pointer bg-linear-to-l from-[#db6c53] to-[#e93d18] hover:bg-[#d92d08] text-black font-bold px-6 py-3 rounded-lg"
                >
                  🔍 Search
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <Feature />

      <TopDeals />
      <MostSearchedDestinations />
      <FeaturedHotels />
      <WhyChooseBookingOpro />
      <Testimonials />
    </div>
  );
};

export default Hotels;
