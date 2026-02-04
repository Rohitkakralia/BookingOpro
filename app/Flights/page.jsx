"use client";
import { useState } from "react";
import FlightPageComponent from "../components/FlightPageComponent";

export default function Page() {
  const [tab, setTab] = useState("flights");
  const [formData, setFormData] = useState({
    tripType: "Round Trip",
    from: "",
    to: "",
    departure: "",
    return: "",
    travelers: "1 Traveler, Economy",
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
      const response = await fetch("/api/flights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Flight search results:", data);
        // Handle successful response (redirect, show results, etc.)
      } else {
        console.error("Search failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting flight search:", error);
    }
  };

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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {tab === "flights" && (
              <>
                <div className="flex gap-3">
                  {["Round Trip", "One Way", "Multi-City"].map((type, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleInputChange("tripType", type)}
                      className={`px-4 py-2 rounded-full border text-sm font-semibold
                        ${
                          formData.tripType === type
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
                        value={formData.from}
                        onChange={(e) =>
                          handleInputChange("from", e.target.value)
                        }
                        required
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
                        value={formData.to}
                        onChange={(e) =>
                          handleInputChange("to", e.target.value)
                        }
                        required
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
                        value={formData.departure}
                        onChange={(e) =>
                          handleInputChange("departure", e.target.value)
                        }
                        required
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
                        value={formData.return}
                        onChange={(e) =>
                          handleInputChange("return", e.target.value)
                        }
                        disabled={formData.tripType === "One Way"}
                      />
                    </div>

                    {/* Travelers */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-teal-900">
                        Travelers
                      </label>
                      <select
                        className="w-full px-4 py-3 border rounded-lg"
                        value={formData.travelers}
                        onChange={(e) =>
                          handleInputChange("travelers", e.target.value)
                        }
                      >
                        <option>1 Traveler, Economy</option>
                        <option>2 Travelers, Economy</option>
                        <option>3 Travelers, Economy</option>
                        <option>4 Travelers, Economy</option>
                        <option>1 Traveler, Business</option>
                        <option>2 Travelers, Business</option>
                      </select>
                    </div>
                  </div>

                  {/* SEARCH BUTTON ROW */}
                  <div className="flex items-center gap-4">
                    <button
                      type="submit"
                      className="bg-linear-to-l from-[#db6c53] to-[#e93d18] text-white font-bold px-10 py-3 rounded-lg hover:bg-[#d92d08] transition whitespace-nowrap"
                    >
                      🔍 Search
                    </button>

                    <button
                      type="button"
                      className="py-3 px-6 border border-red-400 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition whitespace-nowrap"
                    >
                      📞 CALL FOR UNPUBLISHED PHONE DEALS
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {/* ------------------------------------------ */}

      <FlightPageComponent/>
    </div>
  );
}
