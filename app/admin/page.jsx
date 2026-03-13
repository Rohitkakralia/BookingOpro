"use client";

import React, { useEffect, useState } from "react";

const TABS = {
  FLIGHT: "flight",
  HOTEL: "hotel",
  CAR: "car",
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState(TABS.FLIGHT);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === TABS.FLIGHT) {
      fetchFlights();
    }
  }, [activeTab]);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/getFlightDetails");
      const data = await res.json();
      setFlights(data);
    } catch (error) {
      console.error("Failed to fetch flights:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>My Bookings</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
        <TabButton
          label="Flight Booked"
          active={activeTab === TABS.FLIGHT}
          onClick={() => setActiveTab(TABS.FLIGHT)}
        />
        <TabButton
          label="Hotel Booked"
          active={activeTab === TABS.HOTEL}
          onClick={() => setActiveTab(TABS.HOTEL)}
        />
        <TabButton
          label="Car Booked"
          active={activeTab === TABS.CAR}
          onClick={() => setActiveTab(TABS.CAR)}
        />
      </div>

      {/* Content */}
      <div style={{ marginTop: "30px" }}>
        {activeTab === TABS.FLIGHT && (
          <FlightTab flights={flights} loading={loading} />
        )}

        {activeTab === TABS.HOTEL && (
          <Placeholder text="No hotel bookings yet." />
        )}

        {activeTab === TABS.CAR && (
          <Placeholder text="No car bookings yet." />
        )}
      </div>
    </div>
  );
};

/* ---------- Components ---------- */

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      backgroundColor: active ? "#2563eb" : "#e5e7eb",
      color: active ? "#fff" : "#000",
      fontWeight: "600",
    }}
  >
    {label}
  </button>
);
const FlightTab = ({ flights, loading }) => {
  if (loading) {
    return <p className="text-gray-500">Loading flight bookings...</p>;
  }

  if (flights.length === 0) {
    return <p className="text-gray-500">No flight bookings found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-6 py-4">Trip</th>
            <th className="px-6 py-4">Route</th>
            <th className="px-6 py-4">Departure</th>
            <th className="px-6 py-4">Return</th>
            <th className="px-6 py-4">Passengers</th>
            <th className="px-6 py-4">Class</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {flights.map((flight) => (
            <tr
              key={flight.id}
              className="hover:bg-gray-50 transition"
            >
              <td className="px-6 py-4 font-medium text-blue-600">
                {flight.trip_type}
              </td>

              <td className="px-6 py-4">
                <span className="capitalize">{flight.from_city}</span>
                <span className="mx-2 text-gray-400">→</span>
                <span className="capitalize">{flight.to_city}</span>
              </td>

              <td className="px-6 py-4">
                {new Date(flight.departure_date).toDateString()}
              </td>

              <td className="px-6 py-4">
                {flight.return_date
                  ? new Date(flight.return_date).toDateString()
                  : "—"}
              </td>

              <td className="px-6 py-4">
                {flight.travelers}
              </td>

              <td className="px-6 py-4">
                {flight.travel_class}
              </td>

              <td className="px-6 py-4">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Booked
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const Placeholder = ({ text }) => (
  <div
    style={{
      padding: "20px",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
    }}
  >
    <p>{text}</p>
  </div>
);

export default AdminPage;
