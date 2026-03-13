"use client";
import { useState } from "react";
import FlightPageComponent from "../components/FlightPageComponent";

export default function Page() {
  const [tab, setTab] = useState("flights");
  const [formData, setFormData] = useState({
    tripType: "One way",
    from: "",
    to: "",
    departure: "",
    departureTime: "12:00",
    return: "",
    returnTime: "12:00",
    travelers: "2 adults",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSwap = () => {
    setFormData((prev) => ({ ...prev, from: prev.to, to: prev.from }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Flight search results:", data);
      } else {
        console.error("Search failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting flight search:", error);
    }
  };

  const isRoundTrip = formData.tripType === "Round trip";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

        .page-wrap {
          font-family: 'DM Sans', sans-serif;
          background: #f1f5f9;
          min-height: 100vh;
        }

        /* ── HERO ── */
        .hero {
          position: relative;
          min-height: 500px;
          background: url('https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1800&q=80')
            center / cover no-repeat;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 72px;
          padding-bottom: 150px;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(170deg, #03091acc 0%, #0c2340e6 55%, #0f3460bb 100%);
        }
        .hero-content {
          position: relative; z-index: 2;
          text-align: center; color: #fff;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 16px; border-radius: 50px;
          background: rgba(56,189,248,0.15);
          border: 1px solid rgba(56,189,248,0.35);
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; color: #7dd3fc;
        }
        .hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2.4rem, 5.5vw, 3.8rem);
          font-weight: 800; line-height: 1.08;
          color: #fff; margin: 0;
        }
        .hero-title em {
          font-style: normal;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          font-size: 15px; color: #94a3b8; font-weight: 400; margin-top: 4px;
        }

        /* ── CARD WRAPPER ── */
        .card-wrap {
          position: relative; z-index: 10;
          margin-top: -115px;
          padding: 0 20px 60px;
        }
        .search-card {
          max-width: 1040px; margin: 0 auto;
          background: #fff;
          border-radius: 20px;
          box-shadow:
            0 24px 64px rgba(3, 9, 26, 0.16),
            0 2px 8px rgba(3,9,26,0.06);
          overflow: hidden;
        }

        /* ── TAB BAR ── */
        .tab-bar {
          display: flex;
          background: #0d1f38;
          padding: 0 28px;
          border-bottom: 1px solid #162d4a;
        }
        .tab-btn {
          padding: 15px 20px 13px;
          font-family: 'Outfit', sans-serif;
          font-size: 12.5px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: #475569;
          background: none; border: none; cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: color 0.2s, border-color 0.2s;
        }
        .tab-btn.active { color: #38bdf8; border-bottom-color: #38bdf8; }
        .tab-btn:hover:not(.active) { color: #94a3b8; }

        /* ── FORM ── */
        .form-area { padding: 26px 28px 32px; }

        /* trip-type pills */
        .trip-type-row { display: flex; gap: 8px; margin-bottom: 20px; }
        .radio-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 16px; border-radius: 50px;
          border: 1.5px solid #e2e8f0; background: #f8fafc;
          cursor: pointer; transition: all 0.15s;
          font-size: 13px; font-weight: 500; color: #64748b;
          user-select: none;
        }
        .radio-pill:hover { border-color: #7dd3fc; color: #0369a1; }
        .radio-pill.active {
          border-color: #0ea5e9; background: #e0f2fe;
          color: #0369a1; font-weight: 600;
        }
        .radio-dot {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }
        .radio-pill.active .radio-dot { border-color: #0ea5e9; background: #0ea5e9; }
        .radio-dot-inner { width: 5px; height: 5px; border-radius: 50%; background: #fff; }

        /* location bar */
        .location-bar {
          display: flex; align-items: stretch;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          margin-bottom: 16px; background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .location-bar:focus-within {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.15);
        }
        .loc-field {
          flex: 1; padding: 13px 18px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .loc-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #94a3b8;
        }
        .loc-input {
          border: none; outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500; color: #0f172a;
          background: transparent; width: 100%;
        }
        .loc-input::placeholder { color: #b0bec8; font-weight: 400; }
        .swap-col {
          display: flex; align-items: center; justify-content: center;
          width: 50px; flex-shrink: 0;
          border-left: 1.5px solid #f1f5f9;
          border-right: 1.5px solid #f1f5f9;
          background: #f8fafc;
        }
        .swap-btn {
          width: 30px; height: 30px; border-radius: 50%;
          background: #fff; border: 1.5px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 14px; color: #64748b;
          transition: all 0.2s;
        }
        .swap-btn:hover {
          background: #0ea5e9; border-color: #0ea5e9;
          color: #fff; transform: rotate(180deg);
        }

        /* bottom fields row */
        .fields-row {
          display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;
        }
        .field-grp { display: flex; flex-direction: column; gap: 5px; }
        .field-label {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.09em;
          text-transform: uppercase; color: #64748b;
        }
        .field-ctrl {
          padding: 10px 13px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500; color: #0f172a;
          background: #f8fafc; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          min-width: 130px;
        }
        .field-ctrl:focus {
          border-color: #38bdf8; background: #fff;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.15);
        }
        select.field-ctrl {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 34px;
          cursor: pointer;
          min-width: 190px;
        }
        .pair { display: flex; gap: 10px; }

        /* search button */
        .search-btn {
          padding: 11px 30px; border-radius: 10px;
          background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 700; letter-spacing: 0.03em;
          border: none; cursor: pointer; white-space: nowrap;
          box-shadow: 0 4px 16px rgba(14,165,233,0.38);
          transition: all 0.2s;
        }
        .search-btn:hover {
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          box-shadow: 0 6px 22px rgba(14,165,233,0.5);
          transform: translateY(-1px);
        }
        .search-btn:active { transform: none; }

        @media (max-width: 700px) {
          .hero { padding-bottom: 130px; min-height: 420px; }
          .fields-row, .pair { flex-direction: column; }
          .field-ctrl, select.field-ctrl { min-width: 100%; width: 100%; }
          .location-bar { flex-direction: column; }
          .swap-col { width: 100%; height: 38px; border-left: none; border-right: none;
            border-top: 1.5px solid #f1f5f9; border-bottom: 1.5px solid #f1f5f9; }
        }
      `}</style>

      <div className="page-wrap">

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-badge">✦ Book Your Journey</div>
            <h1 className="hero-title">
              Travel Smarter,<br /><em>Fly Better</em>
            </h1>
            <p className="hero-sub">Find the best fares on 500+ airlines worldwide</p>
          </div>
        </div>

        {/* ── SEARCH CARD ── */}
        <div className="card-wrap">
          <div className="search-card">

            {/* Tab bar */}
            <div className="tab-bar">
              <button
                onClick={() => setTab("flights")}
                className={`tab-btn ${tab === "flights" ? "active" : ""}`}
              >
                ✈ &nbsp;Flights
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="form-area">

              {/* Trip type */}
              <div className="trip-type-row">
                {["One way", "Round trip"].map((type) => (
                  <div
                    key={type}
                    className={`radio-pill ${formData.tripType === type ? "active" : ""}`}
                    onClick={() => handleInputChange("tripType", type)}
                  >
                    <div className="radio-dot">
                      {formData.tripType === type && <div className="radio-dot-inner" />}
                    </div>
                    {type}
                  </div>
                ))}
              </div>

              {/* Location bar */}
              <div className="location-bar">
                <div className="loc-field">
                  <span className="loc-label">Pick-up point</span>
                  <input
                    className="loc-input"
                    placeholder="Airport, railway station, hotel, or address"
                    value={formData.from}
                    onChange={(e) => handleInputChange("from", e.target.value)}
                    required
                  />
                </div>
                <div className="swap-col">
                  <button type="button" className="swap-btn" onClick={handleSwap} title="Swap">⇄</button>
                </div>
                <div className="loc-field">
                  <span className="loc-label">To</span>
                  <input
                    className="loc-input"
                    placeholder="Airport, railway station, hotel, or address"
                    value={formData.to}
                    onChange={(e) => handleInputChange("to", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Fields row */}
              <div className="fields-row">

                {/* Departure pair */}
                <div className="pair">
                  <div className="field-grp">
                    <label className="field-label">{isRoundTrip ? "Departure date" : "When"}</label>
                    <input
                      type="date" className="field-ctrl"
                      value={formData.departure}
                      onChange={(e) => handleInputChange("departure", e.target.value)}
                      required
                    />
                  </div>
                  <div className="field-grp">
                    <label className="field-label">Pick-up time</label>
                    <input
                      type="time" className="field-ctrl"
                      value={formData.departureTime}
                      onChange={(e) => handleInputChange("departureTime", e.target.value)}
                    />
                  </div>
                </div>

                {/* Return pair */}
                {isRoundTrip && (
                  <div className="pair">
                    <div className="field-grp">
                      <label className="field-label">Return date</label>
                      <input
                        type="date" className="field-ctrl"
                        value={formData.return}
                        onChange={(e) => handleInputChange("return", e.target.value)}
                      />
                    </div>
                    <div className="field-grp">
                      <label className="field-label">Pick-up time</label>
                      <input
                        type="time" className="field-ctrl"
                        value={formData.returnTime}
                        onChange={(e) => handleInputChange("returnTime", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Passengers */}
                <div className="field-grp" style={{ flex: 1 }}>
                  <label className="field-label">Passengers</label>
                  <select
                    className="field-ctrl"
                    value={formData.travelers}
                    onChange={(e) => handleInputChange("travelers", e.target.value)}
                  >
                    <option>1 adult</option>
                    <option>2 adults</option>
                    <option>3 adults</option>
                    <option>4 adults</option>
                    <option>2 adults, 1 child</option>
                    <option>2 adults, 2 children</option>
                  </select>
                </div>

                {/* Search */}
                <div className="field-grp">
                  <label className="field-label" style={{ opacity: 0, userSelect: "none" }}>_</label>
                  <button type="submit" className="search-btn">Search Flights →</button>
                </div>

              </div>
            </form>
          </div>
        </div>

        <FlightPageComponent />
      </div>
    </>
  );
}