"use client";
import { useState } from "react";

// ─── Image URL helper ────────────────────────────────────────────────────────
// API returns URLs with {size} placeholder
const img = (url, size = "1024x768") => url?.replace("{size}", size) || "";

// ─── Payment method display names ────────────────────────────────────────────
const PAYMENT_LABELS = {
  visa: "Visa",
  master_card: "Mastercard",
  american_express: "Amex",
  jcb: "JCB",
  china_unionpay: "UnionPay",
  diners_club: "Diners Club",
  cash: "Cash",
};

// ─── Serp filter icons ────────────────────────────────────────────────────────
const FILTER_ICONS = {
  has_internet: { icon: "📶", label: "WiFi" },
  has_airport_transfer: { icon: "✈️", label: "Airport Transfer" },
  has_parking: { icon: "🅿️", label: "Parking" },
  has_kids: { icon: "👶", label: "Kids Friendly" },
  has_fitness: { icon: "🏋️", label: "Fitness" },
  has_meal: { icon: "🍽️", label: "Meals" },
  has_disabled_support: { icon: "♿", label: "Accessibility" },
  has_business: { icon: "💼", label: "Business" },
  air_conditioning: { icon: "❄️", label: "A/C" },
  has_pets: { icon: "🐾", label: "Pets OK" },
  kitchen: { icon: "🍳", label: "Kitchen" },
  has_ecar_charger: { icon: "⚡", label: "EV Charger" },
};

// ─── Stars ───────────────────────────────────────────────────────────────────
function Stars({ count }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: 14, letterSpacing: 2 }}>
      {"★".repeat(count || 0)}
      {"☆".repeat(Math.max(0, 5 - (count || 0)))}
    </span>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, icon, children, noBorder }) {
  return (
    <div
      style={{
        padding: "20px 0",
        borderBottom: noBorder ? "none" : "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#64748b",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>{icon}</span> {title}
      </div>
      {children}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function HotelInfoModal({ hotel, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  if (!hotel) return null;

  const images = hotel.images || [];
  const amenityGroups = hotel.amenity_groups || [];
  const serpFilters = hotel.serp_filters || [];
  const paymentMethods = hotel.payment_methods || [];
  const policies = hotel.policy_struct || [];
  const facts = hotel.facts || {};
  const region = hotel.region || {};

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "amenities", label: "Amenities" },
    { id: "photos", label: `Photos (${images.length})` },
    { id: "policies", label: "Policies" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .hm-overlay { position:fixed; inset:0; background:rgba(10,14,26,0.75); backdrop-filter:blur(6px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease; }
        .hm-panel { background:#fff; border-radius:20px; width:100%; max-width:820px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 40px 100px rgba(0,0,0,0.4); animation:slideUp 0.25s ease; font-family:'DM Sans',sans-serif; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        .hm-scroll { overflow-y:auto; flex:1; padding:0 28px 28px; }
        .hm-scroll::-webkit-scrollbar { width:4px; }
        .hm-scroll::-webkit-scrollbar-track { background:transparent; }
        .hm-scroll::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
        .hm-tab { padding:10px 16px; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; border:none; background:none; cursor:pointer; border-bottom:2.5px solid transparent; color:#94a3b8; transition:all 0.15s; white-space:nowrap; }
        .hm-tab.active { color:#0f172a; border-bottom-color:#0f172a; }
        .hm-tab:hover:not(.active) { color:#475569; }
        .thumb { width:80px; height:56px; object-fit:cover; border-radius:8px; cursor:pointer; border:2.5px solid transparent; transition:all 0.15s; flex-shrink:0; }
        .thumb.active { border-color:#0f172a; }
        .thumb:hover:not(.active) { border-color:#cbd5e1; }
        .pay-chip { display:inline-flex; align-items:center; gap:6px; background:#f8fafc; border:1.5px solid #e2e8f0; color:#334155; padding:6px 12px; border-radius:8px; font-size:12.5px; font-weight:600; }
        .filter-chip { display:flex; flex-direction:column; align-items:center; gap:4px; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:10px 12px; min-width:72px; text-align:center; }
        .close-btn { width:34px; height:34px; border-radius:50%; background:#f1f5f9; border:none; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; color:#64748b; flex-shrink:0; transition:background 0.15s; }
        .close-btn:hover { background:#e2e8f0; }
        .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media(max-width:600px) { .info-grid { grid-template-columns:1fr; } .hm-panel { border-radius:16px; } }
      `}</style>

      <div
        className="hm-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="hm-panel">
          {/* ── Hero Image ── */}
          {images.length > 0 && (
            <div
              style={{
                position: "relative",
                height: 240,
                flexShrink: 0,
                overflow: "hidden",
                borderRadius: "20px 20px 0 0",
              }}
            >
              <img
                src={img(images[imgIdx], "1024x768")}
                alt={hotel.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                }}
              />

              {/* Prev/Next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setImgIdx((i) => (i - 1 + images.length) % images.length)
                    }
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      width: 36,
                      height: 36,
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      width: 36,
                      height: 36,
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  >
                    ›
                  </button>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 14,
                      right: 14,
                      background: "rgba(0,0,0,0.55)",
                      color: "white",
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {imgIdx + 1} / {images.length}
                  </div>
                </>
              )}

              {/* Overlay hotel name */}
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 20,
                  right: 60,
                }}
              >
                <Stars count={hotel.star_rating} />
                <h2
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: "clamp(16px,3vw,22px)",
                    fontWeight: 800,
                    color: "white",
                    margin: "4px 0 2px",
                    lineHeight: 1.2,
                  }}
                >
                  {hotel.name}
                </h2>
                <div
                  style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5 }}
                >
                  📍 {hotel.address}, {hotel.postal_code} · {region.name},{" "}
                  {region.country_code}
                </div>
              </div>

              {/* Close */}
              <button
                className="close-btn"
                onClick={onClose}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  background: "rgba(0,0,0,0.4)",
                  color: "white",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* ── Tabs ── */}
          <div
            style={{
              display: "flex",
              gap: 0,
              borderBottom: "1px solid #f1f5f9",
              padding: "0 28px",
              overflowX: "auto",
              flexShrink: 0,
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`hm-tab${activeTab === t.id ? " active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Scrollable Content ── */}
          <div className="hm-scroll">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <>
                {/* Quick facts row */}
                <Section title="Quick Facts" icon="📋">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill,minmax(130px,1fr))",
                      gap: 10,
                    }}
                  >
                    {[
                      {
                        label: "Check-in",
                        value: hotel.check_in_time?.slice(0, 5) || "—",
                      },
                      {
                        label: "Check-out",
                        value: hotel.check_out_time?.slice(0, 5) || "—",
                      },
                      { label: "Rooms", value: facts.rooms_number || "—" },
                      { label: "Floors", value: facts.floors_number || "—" },
                      { label: "Built", value: facts.year_built || "—" },
                      { label: "Chain", value: hotel.hotel_chain || "—" },
                      { label: "Type", value: hotel.kind || "—" },
                      { label: "GIATA", value: hotel.giata_code || "—" },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        style={{
                          background: "#f8fafc",
                          borderRadius: 10,
                          padding: "12px 14px",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10.5,
                            color: "#94a3b8",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: 4,
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Syne',sans-serif",
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Contact */}
                <Section title="Contact" icon="📞">
                  <div className="info-grid">
                    {hotel.phone && (
                      <a
                        href={`tel:${hotel.phone}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          textDecoration: "none",
                          background: "#f0fdf4",
                          border: "1.5px solid #bbf7d0",
                          borderRadius: 10,
                          padding: "12px 16px",
                        }}
                      >
                        <span style={{ fontSize: 20 }}>📱</span>
                        <div>
                          <div
                            style={{
                              fontSize: 10.5,
                              color: "#94a3b8",
                              fontWeight: 600,
                              marginBottom: 2,
                            }}
                          >
                            PHONE
                          </div>
                          <div
                            style={{
                              color: "#166534",
                              fontWeight: 600,
                              fontSize: 13.5,
                            }}
                          >
                            {hotel.phone}
                          </div>
                        </div>
                      </a>
                    )}
                    {hotel.email && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          background: "#f0f9ff",
                          border: "1.5px solid #bae6fd",
                          borderRadius: 10,
                          padding: "12px 16px",
                        }}
                      >
                        <span style={{ fontSize: 20 }}>✉️</span>
                        <div>
                          <div
                            style={{
                              fontSize: 10.5,
                              color: "#94a3b8",
                              fontWeight: 600,
                              marginBottom: 2,
                            }}
                          >
                            EMAIL
                          </div>
                          <div
                            style={{
                              color: "#0369a1",
                              fontWeight: 600,
                              fontSize: 13,
                              wordBreak: "break-all",
                            }}
                          >
                            {hotel.email?.replace(/[<>]/g, "")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Section>

                {/* Serp filters (top amenity highlights) */}
                {serpFilters.length > 0 && (
                  <Section title="Highlights" icon="✨">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {serpFilters.map((f) => {
                        const info = FILTER_ICONS[f] || {
                          icon: "✦",
                          label: f.replace(/_/g, " "),
                        };
                        return (
                          <div key={f} className="filter-chip">
                            <span style={{ fontSize: 20 }}>{info.icon}</span>
                            <span
                              style={{
                                fontSize: 10.5,
                                color: "#475569",
                                fontWeight: 600,
                              }}
                            >
                              {info.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {/* Payment */}
                {paymentMethods.length > 0 && (
                  <Section title="Payment Methods" icon="💳">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {paymentMethods.map((m) => (
                        <span key={m} className="pay-chip">
                          {m === "visa"
                            ? "💳"
                            : m === "cash"
                            ? "💵"
                            : m === "american_express"
                            ? "🟦"
                            : "🏦"}
                          {PAYMENT_LABELS[m] || m.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Important info */}
                {hotel.metapolicy_extra_info && (
                  <Section title="Important Info" icon="ℹ️" noBorder>
                    <div
                      style={{
                        background: "#fffbeb",
                        border: "1.5px solid #fde68a",
                        borderRadius: 12,
                        padding: "14px 16px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          color: "#78350f",
                          lineHeight: 1.7,
                          margin: 0,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {hotel.metapolicy_extra_info}
                      </p>
                    </div>
                  </Section>
                )}
              </>
            )}

            {/* AMENITIES TAB */}
            {activeTab === "amenities" && (
              <Section title="All Amenities" icon="✨" noBorder>
                {amenityGroups.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    {amenityGroups.map((group, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#f8fafc",
                          borderRadius: 12,
                          padding: "16px",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Syne',sans-serif",
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: "#334155",
                            marginBottom: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                          }}
                        >
                          {group.group_name || `Group ${i + 1}`}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          }}
                        >
                          {(group.amenities || []).map((amenity, j) => (
                            <div
                              key={j}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 13,
                                color: "#475569",
                              }}
                            >
                              <span style={{ color: "#22c55e", fontSize: 12 }}>
                                ✓
                              </span>
                              {amenity}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>
                    No amenity details available.
                  </p>
                )}
              </Section>
            )}

            {/* PHOTOS TAB */}
            {activeTab === "photos" && (
              <Section title="Photo Gallery" icon="📷" noBorder>
                {/* Main selected image */}
                <div
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    marginBottom: 14,
                    aspectRatio: "16/9",
                    background: "#f1f5f9",
                  }}
                >
                  <img
                    src={img(images[imgIdx], "1024x768")}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                {/* Thumbnail strip */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {images.map((url, i) => (
                    <img
                      key={i}
                      src={img(url, "200x150")}
                      alt=""
                      className={`thumb${imgIdx === i ? " active" : ""}`}
                      onClick={() => setImgIdx(i)}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* POLICIES TAB */}
            {activeTab === "policies" && (
              <>
                {policies.length > 0 && (
                  <Section title="Hotel Policies" icon="📋">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {policies.map((policy, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #f1f5f9",
                            borderRadius: 10,
                            padding: "14px 16px",
                            fontSize: 13,
                            color: "#475569",
                            lineHeight: 1.6,
                          }}
                        >
                          <span style={{ color: "#0ea5e9", marginRight: 8 }}>
                            •
                          </span>
                          {typeof policy === "string"
                            ? policy
                            : JSON.stringify(policy)}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Metapolicy struct */}
                {hotel.metapolicy_struct && (
                  <Section title="Detailed Policies" icon="📄" noBorder>
                    {Object.entries(hotel.metapolicy_struct)
                      .filter(([, v]) => Array.isArray(v) && v.length > 0)
                      .map(([key, items]) => (
                        <div key={key} style={{ marginBottom: 16 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#64748b",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: 8,
                            }}
                          >
                            {key.replace(/_/g, " ")}
                          </div>
                          {items.map((item, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: 13,
                                color: "#475569",
                                padding: "8px 12px",
                                background: "#f8fafc",
                                borderRadius: 8,
                                marginBottom: 6,
                              }}
                            >
                              {typeof item === "object"
                                ? Object.entries(item).map(([k, v]) => (
                                    <span key={k} style={{ marginRight: 12 }}>
                                      <strong>{k.replace(/_/g, " ")}:</strong>{" "}
                                      {String(v)}
                                    </span>
                                  ))
                                : item}
                            </div>
                          ))}
                        </div>
                      ))}
                  </Section>
                )}
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              padding: "14px 28px",
              borderTop: "1px solid #f1f5f9",
              flexShrink: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fafafa",
            }}
          >
            <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
              ID: {hotel.id} · {hotel.latitude?.toFixed(4)},{" "}
              {hotel.longitude?.toFixed(4)}
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#0f172a",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "9px 22px",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Syne',sans-serif",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
