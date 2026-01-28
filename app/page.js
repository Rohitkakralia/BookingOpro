"use client";
import React from "react";
import { useState, useRef } from "react";
import TopDeals from "./components/TopDeals";
import MostSearchedDestinations from "./components/MostSearchedDestinations";
import FeaturedHotels from "./components/FeaturedHotels";
import WhyChooseBookingOpro from "./components/WhyChooseBookingOpro";
import Testimonials from "./components/Testimonials";
import Feature from "./components/Feature";

export default function Home() {
  const [tab, setTab] = useState("hotels");
  const [flightType, setFlightType] = useState("roundtrip");


  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans">
      <div
        className="relative w-full bg-cover bg-center transition-all duration-300 pb-32"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1626120639806-1237f30e6576?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
          minHeight: tab === "hotels" ? "350px" : tab === "flights" ? "550px" : "450px",
          
          
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

      <div 
  className="px-4 z-10 relative m-"
  style={{
    marginTop: tab === "hotels" ? "-200px" : tab === "flights" ? "-400px" : "-300px"
  }}
>
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl">
          {/* TABS */}
          <div className="flex border-b">
            {["hotels", "flights", "cars"].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`flex-1 py-4 font-semibold cursor-pointer capitalize transition
                  ${
                    tab === item
                      ? "border-b-4 border-[#1ac6ce] text-teal-900"
                      : "text-gray-500 hover:bg-[#f4e3df]"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="p-6 space-y-6">
            {/* HOTELS */}
            {tab === "hotels" && (
              <div className="grid md:grid-cols-5 gap-4 items-end -mb-32">
                <div>
                  <label className="text-xs font-semibold text-teal-900">
                    Destination
                  </label>
                  <input
                    className="mt-1 w-full px-4 py-3 border rounded-lg"
                    placeholder="Where are you going?"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-teal-900">
                    Check-in
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-teal-900">
                    Check-out
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-teal-900">
                    Guests & Rooms
                  </label>
                  <select className="mt-1 w-full px-4 py-3 border rounded-lg">
                    <option>2 Adults, 1 Room</option>
                  </select>
                </div>

                <button className="bg-linear-to-l cursor-pointer from-[#db6c53] to-[#e93d18] hover:bg-[#d92d08] text-black font-bold px-6 py-3 rounded-lg">
                  🔍 Search
                </button>
              </div>
            )}

            {/* FLIGHTS */}
            <div className="p-6 space-y-6">
  {tab === "flights" && (
    <>
      {/* FLIGHT TYPE TABS */}
      <div className="flex gap-3">
        {["Round Trip", "One Way", "Multi-City"].map((type, i) => (
          <button
            key={i}
            onClick={() => setFlightType(i === 0 ? "roundtrip" : i === 1 ? "oneway" : "multicity")}
            className={`px-4 py-2 rounded-full border text-sm font-semibold
              ${
                (i === 0 && flightType === "roundtrip") ||
                (i === 1 && flightType === "oneway") ||
                (i === 2 && flightType === "multicity")
                  ? "bg-[#e93d18] border-[#e93d18] text-white"
                  : "text-gray-600 border-gray-300 hover:border-[#e93d18]"
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* ROUND TRIP */}
        {flightType === "roundtrip" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-teal-900">
                  From
                </label>
                <input
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="From"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-teal-900">
                  To
                </label>
                <input
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="To"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-teal-900">
                  Departure
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-teal-900">
                  Return
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-teal-900">
                  Travelers
                </label>
                <select className="w-full px-4 py-3 border rounded-lg">
                  <option>1 Traveler, Economy</option>
                  <option>2 Travelers, Economy</option>
                  <option>3 Travelers, Economy</option>
                  <option>1 Traveler, Business</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* ONE WAY */}
        {flightType === "oneway" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-teal-900">
                  From
                </label>
                <input
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="From"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-teal-900">
                  To
                </label>
                <input
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="To"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-teal-900">
                  Departure
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-teal-900">
                  Travelers
                </label>
                <select className="w-full px-4 py-3 border rounded-lg">
                  <option>1 Traveler, Economy</option>
                  <option>2 Travelers, Economy</option>
                  <option>3 Travelers, Economy</option>
                  <option>1 Traveler, Business</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* MULTI-CITY */}
        {flightType === "multicity" && (
          <>
            {/* Flight 1 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-teal-900">Flight 1</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-teal-900">
                    From
                  </label>
                  <input
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="From"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-teal-900">
                    To
                  </label>
                  <input
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="To"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-teal-900">
                    Departure
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-teal-900">
                    Travelers
                  </label>
                  <select className="w-full px-4 py-3 border rounded-lg">
                    <option>1 Traveler, Economy</option>
                    <option>2 Travelers, Economy</option>
                    <option>3 Travelers, Economy</option>
                    <option>1 Traveler, Business</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Flight 2 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-teal-900">Flight 2</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-teal-900">
                    From
                  </label>
                  <input
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="From"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-teal-900">
                    To
                  </label>
                  <input
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="To"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-teal-900">
                    Departure
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-teal-900">
                    Travelers
                  </label>
                  <select className="w-full px-4 py-3 border rounded-lg">
                    <option>1 Traveler, Economy</option>
                    <option>2 Travelers, Economy</option>
                    <option>3 Travelers, Economy</option>
                    <option>1 Traveler, Business</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Add Flight Button */}
            <button className="text-[#e93d18] font-semibold text-sm hover:underline">
              + Add Another Flight
            </button>
          </>
        )}

        {/* SEARCH BUTTON ROW */}
        <div className="flex items-center gap-4 -mb-20">
          <button className="bg-linear-to-l from-[#db6c53] to-[#e93d18] text-white font-bold px-10 py-3 rounded-lg hover:bg-[#d92d08] transition whitespace-nowrap">
            🔍 Search
          </button>

          <button className="py-3 px-6 border border-red-400 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition whitespace-nowrap">
            📞 CALL FOR UNPUBLISHED PHONE DEALS
          </button>
        </div>
      </div>
    </>
  )}
</div>

            {/* CARS */}
            <div className="p-6 space-y-6">
            {tab === "cars" && (
              <div className="grid grid-cols-1 gap-6 -mt-24">
                {/* INPUT ROW */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                  {/* Pick-up Location */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-teal-900">
                      Pick-up Location
                    </label>
                    <input
                      className="w-full px-4 py-3 border rounded-lg"
                      placeholder="Pick-up location"
                    />
                  </div>

                  {/* Pick-up Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-teal-900">
                      Pick-up Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>

                  {/* Pick-up Time */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-teal-900">
                      Pick-up Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>

                  {/* Return Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-teal-900">
                      Drop-off Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>

                  {/* Return Time */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-teal-900">
                      Drop-off Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>

                  {/* Car Type */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-teal-900">
                      Car Type
                    </label>
                    <select className="w-full px-4 py-3 border rounded-lg">
                      <option>Economy</option>
                      <option>SUV</option>
                      <option>Luxury</option>
                    </select>
                  </div>
                </div>

                {/* SEARCH BUTTON ROW */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button className="bg-linear-to-l from-[#db6c53] to-[#e93d18] text-white font-bold px-10 py-3 rounded-lg hover:bg-[#d92d08] transition whitespace-nowrap">
                    🔍 Search
                  </button>

                  <button className="py-3 px-6 border border-red-400 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition whitespace-nowrap">
                    📞 CALL FOR UNPUBLISHED PHONE DEALS
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

     <Feature/>

      <TopDeals />
      <MostSearchedDestinations />
      <FeaturedHotels />
      <WhyChooseBookingOpro />
      <Testimonials />
    </div>
  );
}

