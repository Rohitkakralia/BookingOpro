"use client";
import { useState } from "react";

export default function Page() {
  const [tab, setTab] = useState("flights");

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans">
      {/* HERO */}
      <div
        className="relative w-full bg-cover bg-center pb-32"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1626120639806-1237f30e6576)",
          minHeight: "500px",
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
      <div className="-mt-80 px-4 relative z-10">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl">
          {/* TABS */}
          <div className="flex border-b">
            <button
              onClick={() => setTab("flights")}
              className={`flex-1 py-4 font-semibold capitalize transition
                ${
                  tab === "flights"
                    ? "border-b-3 border-[#36cccc] text-teal-900"
                    : "text-gray-500 hover:text-teal-700"
                }`}
            >
              flights
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-6 space-y-6">
            {tab === "flights" && (
              <>
                <div className="flex gap-3">
                  {["Round Trip", "One Way", "Multi-City"].map((type, i) => (
                    <button
                      key={i}
                      className={`px-4 py-2 rounded-full border text-sm font-semibold
                        ${
                          i === 0
                            ? "bg-[#e93d18] border-[#e93d18] text-white"
                            : "text-gray-600"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* INPUT ROW */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* From */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-teal-900">
                        From
                      </label>
                      <input
                        className="w-full px-4 py-3 border rounded-lg"
                        placeholder="From"
                      />
                    </div>

                    {/* To */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-teal-900">
                        To
                      </label>
                      <input
                        className="w-full px-4 py-3 border rounded-lg"
                        placeholder="To"
                      />
                    </div>

                    {/* Departure */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-teal-900">
                        Departure
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border rounded-lg"
                      />
                    </div>

                    {/* Return */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-teal-900">
                        Return
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border rounded-lg"
                      />
                    </div>

                    {/* Travelers */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-teal-900">
                        Travelers
                      </label>
                      <select className="w-full px-4 py-3 border rounded-lg">
                        <option>1 Traveler, Economy</option>
                      </select>
                    </div>
                  </div>

                  {/* SEARCH BUTTON ROW */}
                  <div className="flex items-center gap-4">
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
        </div>
      </div>
    </div>
  );
}
