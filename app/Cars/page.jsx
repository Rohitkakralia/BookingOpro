"use client";
import React from "react";
import { useState } from "react";
import CarRentalTips from "../components/CarRentalTips";
import WhyChooseBookingOpro from "../components/WhyChooseBookingOpro";

const page = () => {
  const [tab, setTab] = useState("cars");

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans">
      {/* HERO */}
      <div
        className="relative w-full bg-cover bg-center pb-32"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1626120639806-1237f30e6576)",
          minHeight: "350px",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex flex-col items-center pt-5 text-white text-center">
          <p className="uppercase tracking-[0.3em] text-sm">
            RENT THE PERFECT CAR FOR YOUR
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            NEXT ADVENTURE
          </h1>
        </div>
      </div>

      {/* SEARCH CARD */}
      <div className="-mt-50 px-4 relative z-10">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl">
          {/* TABS */}
          {/* <div className="flex border-b">
            <button
              onClick={() => setTab("cars")}
              className={`flex-1 py-4 font-semibold capitalize transition
                ${
                  tab === "cars"
                    ? "border-b-4 border-[#e93d18] text-teal-900"
                    : "text-gray-500 hover:text-teal-700"
                }`}
            >
              Cars
            </button>
          </div> */}
{/* 
          CONTENT */}

          {/* CONTENT */}
          <div className="p-6 space-y-6">
            {tab === "cars" && (
              <div className="grid grid-cols-1 gap-6">
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

      <CarRentalTips />
      <WhyChooseBookingOpro />
    </div>
  );
};

export default page;
