"use client";
import { useState, useEffect } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getBestRate(rates = []) {
  if (!rates.length) return null;
  return [...rates].sort(
    (a, b) =>
      parseFloat(a.daily_prices?.[0] || 999999) -
      parseFloat(b.daily_prices?.[0] || 999999)
  )[0];
}

function getFreeCancellationDate(rate) {
  const before =
    rate?.payment_options?.payment_types?.[0]?.cancellation_penalties
      ?.free_cancellation_before;
  if (!before) return null;
  return new Date(before).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMealLabel(meal) {
  const map = {
    breakfast: "Breakfast included",
    nomeal: "No meals",
    halfboard: "Half board",
    fullboard: "Full board",
    allinclusive: "All inclusive",
  };
  return map[meal] || meal;
}

function getRoomFeatures(rate) {
  const ext = rate?.rg_ext || {};
  const features = [];
  if (ext.balcony === 1) features.push({ icon: "🏡", label: "Balcony" });
  if (ext.view === 8) features.push({ icon: "🌿", label: "Garden view" });
  if (ext.view === 0 && ext.quality === 5)
    features.push({ icon: "🗼", label: "Eiffel Tower view" });
  if (ext.capacity) features.push({ icon: "👥", label: `Up to ${ext.capacity} guests` });
  if (ext.class === 4) features.push({ icon: "💎", label: "Suite" });
  return features;
}

// ─── Hotel Image Fetcher (via Claude vision) ─────────────────────────────────

function useHotelImage(hotelName) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImage() {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            messages: [
              {
                role: "user",
                content: `Search for a high quality hotel photo for "${hotelName}" hotel. Return ONLY a direct image URL (ending in .jpg, .jpeg, .png, or .webp) of the hotel exterior or lobby. If you cannot find one, return a URL for a generic luxury hotel image from Unsplash. Return only the raw URL, nothing else.`,
              },
            ],
          }),
        });
        const data = await response.json();
        const text = data.content
          ?.filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("");
        const urlMatch = text?.match(/https?:\/\/[^\s"'>]+\.(?:jpg|jpeg|png|webp)[^\s"'>]*/i);
        if (urlMatch) {
          setImageUrl(urlMatch[0]);
        } else {
          // Fallback to Unsplash luxury hotel
          setImageUrl(`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`);
        }
      } catch {
        setImageUrl(`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`);
      } finally {
        setLoading(false);
      }
    }
    fetchImage();
  }, [hotelName]);

  return { imageUrl, loading };
}

// ─── Rate Card ───────────────────────────────────────────────────────────────

function RateCard({ rate, isFirst, onBookNow }) {
  const payType = rate?.payment_options?.payment_types?.[0];
  const dailyPrice = parseFloat(rate?.daily_prices?.[0] || 0).toFixed(0);
  const totalPrice = payType?.show_amount || "—";
  const freeCancelDate = getFreeCancellationDate(rate);
  const hasBreakfast = rate?.meal_data?.has_breakfast;
  const features = getRoomFeatures(rate);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: isFirst
          ? "linear-gradient(135deg, #fff9f0 0%, #fff5e6 100%)"
          : "white",
        border: isFirst ? "2px solid #f59e0b" : "1.5px solid #e8edf2",
        borderRadius: 14,
        padding: "18px 20px",
        marginBottom: 12,
        position: "relative",
        transition: "transform 0.18s, box-shadow 0.18s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered
          ? "0 10px 30px rgba(0,0,0,0.10)"
          : isFirst
          ? "0 4px 16px rgba(245,158,11,0.18)"
          : "0 2px 8px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isFirst && (
        <div
          style={{
            position: "absolute",
            top: -1,
            left: 16,
            background: "linear-gradient(90deg, #f59e0b, #ef4444)",
            color: "white",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: "0 0 8px 8px",
          }}
        >
          🏆 Best Value
        </div>
      )}

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginTop: isFirst ? 8 : 0 }}>
        {/* Left: Room details */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              fontWeight: 700,
              color: "#1a2332",
              marginBottom: 4,
              lineHeight: 1.3,
            }}
          >
            {rate.room_data_trans?.main_name || rate.room_name}
          </div>

          {rate.room_data_trans?.bedding_type && (
            <div style={{ fontSize: 12, color: "#6b7a8d", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
              🛏️ {rate.room_data_trans.bedding_type}
            </div>
          )}

          {/* Feature pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
            {features.map((f, i) => (
              <span
                key={i}
                style={{
                  fontSize: 11,
                  background: "#eef6ff",
                  color: "#1d6fa4",
                  border: "1px solid #c5dff5",
                  borderRadius: 20,
                  padding: "2px 9px",
                  fontWeight: 500,
                }}
              >
                {f.icon} {f.label}
              </span>
            ))}
          </div>

          {/* Perks row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: hasBreakfast ? "#16a34a" : "#94a3b8",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              {hasBreakfast ? "🍳" : "☕"} {getMealLabel(rate.meal)}
            </span>
            {freeCancelDate ? (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", display: "flex", alignItems: "center", gap: 3 }}>
                ✅ Free cancel before {freeCancelDate}
              </span>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 500, color: "#dc2626", display: "flex", alignItems: "center", gap: 3 }}>
                ⚠️ Non-refundable
              </span>
            )}
          </div>
        </div>

        {/* Right: Price + CTA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 8,
            minWidth: 120,
            flexShrink: 0,
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 700,
                color: "#1a2332",
                lineHeight: 1,
              }}
            >
              ${dailyPrice}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>per night</div>
            <div style={{ fontSize: 12.5, color: "#475569", fontWeight: 700, marginTop: 4 }}>
              ${totalPrice} total
            </div>
          </div>

          <button
            style={{
              padding: "9px 20px",
              background: isFirst
                ? "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
                : "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
              color: "white",
              border: "none",
              borderRadius: 9,
              fontSize: 12.5,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              letterSpacing: "0.02em",
              boxShadow: isFirst
                ? "0 4px 12px rgba(245,158,11,0.35)"
                : "0 4px 12px rgba(29,78,216,0.3)",
              transition: "opacity 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
            onClick={() => onBookNow(rate)}
          >
            Book Now →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Hotel Card ─────────────────────────────────────────────────────────

export default function HotelResultCard({ hotelData, onViewInfo }) {
  const [showRooms, setShowRooms] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [imgError, setImgError] = useState(false);

  const hotelName = hotelData?.id
    ? hotelData.id.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Luxury Hotel";

  // Always call the hook, regardless of conditions
  const { imageUrl, loading: imageLoading } = useHotelImage(hotelName);

  if (!hotelData) return null;

  const { id, rates = [] } = hotelData;
  const bestRate = getBestRate(rates);
  const bestPrice = parseFloat(bestRate?.daily_prices?.[0] || 0).toFixed(0);
  const totalPrice = bestRate?.payment_options?.payment_types?.[0]?.show_amount;

  const hasFreeCancellation = rates.some(
    (r) => r.payment_options?.payment_types?.[0]?.cancellation_penalties?.free_cancellation_before
  );
  const hasBreakfastOptions = rates.some((r) => r.meal_data?.has_breakfast);
  const hasEiffelView = rates.some((r) => r.rg_ext?.quality === 5 || r.rg_ext?.quality === 6);
  const hasBalcony = rates.some((r) => r.rg_ext?.balcony === 1);

  const displayRates = expanded ? rates : rates.slice(0, 3);

  const handleBookNow = (rate) => {
    setSelectedRoom(rate);
    setShowBookingModal(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .hotel-card-wrap { transition: box-shadow 0.25s; }
        .hotel-card-wrap:hover { box-shadow: 0 24px 60px rgba(10,20,40,0.14) !important; }
        .room-toggle-btn:hover { opacity: 0.88; }
      `}</style>

      <div
        className="hotel-card-wrap"
        style={{
          background: "white",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 6px 28px rgba(10,20,40,0.09)",
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 24,
          maxWidth: 860,
          width: "100%",
        }}
      >
        {/* ── Hero Image ── */}
        <div
          style={{
            position: "relative",
            height: 240,
            background: "linear-gradient(135deg, #1a2332 0%, #2d3f56 100%)",
            overflow: "hidden",
          }}
        >
          {imageLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #1e3a5f, #0f2944)",
              }}
            >
              <div style={{ textAlign: "center", color: "white", opacity: 0.6 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🏨</div>
                <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.06em" }}>Loading image…</div>
              </div>
            </div>
          )}

          {imageUrl && !imgError && (
            <img
              src={imageUrl}
              alt={hotelName}
              onError={() => setImgError(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                opacity: imageLoading ? 0 : 1,
                transition: "opacity 0.4s",
              }}
              onLoad={(e) => (e.target.style.opacity = 1)}
            />
          )}

          {imgError && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, #0f2944, #1e3a5f)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: 64, opacity: 0.3 }}>🏨</div>
            </div>
          )}

          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(10,20,35,0.85) 0%, rgba(10,20,35,0.3) 50%, rgba(10,20,35,0.1) 100%)",
            }}
          />

          {/* Hotel name overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "24px 28px 20px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#f59e0b",
                marginBottom: 6,
              }}
            >
              Hotel · {id}
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 800,
                color: "white",
                margin: 0,
                lineHeight: 1.15,
                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              {hotelName}
            </h2>

            {/* Quick badge row */}
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {hasFreeCancellation && (
                <span style={{ fontSize: 11, background: "rgba(22,163,74,0.25)", color: "#86efac", border: "1px solid rgba(134,239,172,0.35)", borderRadius: 20, padding: "3px 10px", fontWeight: 600, backdropFilter: "blur(4px)" }}>
                  ✅ Free cancellation
                </span>
              )}
              {hasBreakfastOptions && (
                <span style={{ fontSize: 11, background: "rgba(245,158,11,0.25)", color: "#fde68a", border: "1px solid rgba(253,230,138,0.35)", borderRadius: 20, padding: "3px 10px", fontWeight: 600, backdropFilter: "blur(4px)" }}>
                  🍳 Breakfast available
                </span>
              )}
              {hasEiffelView && (
                <span style={{ fontSize: 11, background: "rgba(139,92,246,0.25)", color: "#ddd6fe", border: "1px solid rgba(221,214,254,0.35)", borderRadius: 20, padding: "3px 10px", fontWeight: 600, backdropFilter: "blur(4px)" }}>
                  🗼 Eiffel Tower view
                </span>
              )}
              {hasBalcony && (
                <span style={{ fontSize: 11, background: "rgba(14,165,233,0.25)", color: "#bae6fd", border: "1px solid rgba(186,230,253,0.35)", borderRadius: 20, padding: "3px 10px", fontWeight: 600, backdropFilter: "blur(4px)" }}>
                  🏡 Balcony rooms
                </span>
              )}
            </div>
          </div>

          {/* View Info button */}
          {onViewInfo && (
            <button
              onClick={onViewInfo}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 9,
                padding: "7px 14px",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.25)")}
              onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,0.15)")}
            >
              📋 Hotel Info
            </button>
          )}
        </div>

        {/* ── Price Summary Bar ── */}
        <div
          style={{
            background: "#f8fafc",
            borderBottom: "1px solid #e8edf2",
            padding: "16px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7a8d", textTransform: "uppercase", letterSpacing: "0.08em" }}>From</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 800, color: "#1a2332", lineHeight: 1 }}>
              ${bestPrice}
            </span>
            <span style={{ fontSize: 13, color: "#6b7a8d" }}>/ night</span>
            <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 4 }}>· ${totalPrice} total</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                fontSize: 13,
                color: "#6b7a8d",
                background: "#eef2f7",
                borderRadius: 8,
                padding: "5px 12px",
                fontWeight: 500,
              }}
            >
              🏨 {rates.length} room{rates.length !== 1 ? "s" : ""} available
            </div>

            <button
              className="room-toggle-btn"
              onClick={() => setShowRooms(!showRooms)}
              style={{
                background: showRooms
                  ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
                  : "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "10px 22px",
                fontSize: 13.5,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                boxShadow: showRooms
                  ? "0 4px 14px rgba(220,38,38,0.3)"
                  : "0 4px 14px rgba(29,78,216,0.3)",
                transition: "opacity 0.15s, box-shadow 0.15s",
              }}
            >
              {showRooms ? "▲ Hide Rooms" : "▼ Choose a Room"}
            </button>
          </div>
        </div>

        {/* ── Room List ── */}
        {showRooms && (
          <div style={{ padding: "20px 24px 8px" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#94a3b8",
                marginBottom: 14,
              }}
            >
              Available Rooms · Sorted by price
            </div>

            {displayRates.map((rate, idx) => (
              <RateCard
                key={rate.match_hash || idx}
                rate={rate}
                isFirst={idx === 0}
                onBookNow={handleBookNow}
              />
            ))}

            {/* Show more/less */}
            {rates.length > 3 && (
              <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <button
                  onClick={() => setExpanded(!expanded)}
                  style={{
                    background: "none",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 9,
                    padding: "10px 28px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1d4ed8",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#eff6ff";
                    e.target.style.borderColor = "#1d4ed8";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "none";
                    e.target.style.borderColor = "#e2e8f0";
                  }}
                >
                  {expanded ? "▲ Show fewer options" : `▼ See all ${rates.length} rooms`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal (placeholder — wire up your BookingFlow here) */}
      {showBookingModal && selectedRoom && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,20,35,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => { setShowBookingModal(false); setSelectedRoom(null); }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 18,
              padding: 32,
              maxWidth: 420,
              width: "90%",
              boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#1a2332", marginBottom: 8 }}>
              Ready to Book!
            </div>
            <div style={{ fontSize: 14, color: "#6b7a8d", marginBottom: 6 }}>
              {selectedRoom.room_data_trans?.main_name || selectedRoom.room_name}
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: "#1a2332", marginBottom: 20 }}>
              ${parseFloat(selectedRoom.daily_prices?.[0] || 0).toFixed(0)}/night
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
              Redirect to <code>{"<BookingFlow />"}</code> component.
            </p>
            <button
              onClick={() => { setShowBookingModal(false); setSelectedRoom(null); }}
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "11px 32px",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}