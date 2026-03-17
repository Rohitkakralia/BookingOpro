"use client";
import { useState, useEffect, useCallback } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  const dt = new Date(d);
  return {
    day: dt.getDate().toString().padStart(2, "0"),
    mon: dt.toLocaleDateString("en-US", { month: "short" }),
    year: dt.getFullYear(),
  };
};

const fmtFull = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getInitials = (g) =>
  ((g?.first_name || "")[0] || "").toUpperCase() +
  ((g?.last_name || "")[0] || "").toUpperCase();

const getFullName = (g) =>
  [g?.first_name, g?.last_name].filter(Boolean).join(" ") || "Guest";

// ─── Constants ───────────────────────────────────────────────────────────────
const FILTERS = ["all", "completed", "pending", "cancelled"];
const PAGE_SIZE = 5;

const STATUS_STYLES = {
  completed: {
    background: "rgba(92,186,139,0.12)",
    color: "#3d9e6e",
    border: "1px solid rgba(92,186,139,0.3)",
  },
  pending: {
    background: "rgba(232,168,74,0.12)",
    color: "#b8791a",
    border: "1px solid rgba(232,168,74,0.3)",
  },
  cancelled: {
    background: "rgba(220,80,80,0.1)",
    color: "#c04040",
    border: "1px solid rgba(220,80,80,0.25)",
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || {
    background: "rgba(150,150,150,0.1)",
    color: "#888",
    border: "1px solid rgba(150,150,150,0.2)",
  };
  return (
    <span
      style={{
        ...style,
        padding: "4px 12px",
        borderRadius: 100,
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      {status}
    </span>
  );
}

function Toast({ msg, type, visible }) {
  const colorMap = {
    success: "#3d9e6e",
    error: "#c04040",
  };
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: "12px 18px",
        fontSize: 13,
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "all 0.3s cubic-bezier(.34,1.56,.64,1)",
        transform: visible ? "translateY(0)" : "translateY(60px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        color: colorMap[type] || "#333",
      }}
    >
      {msg}
    </div>
  );
}

function CancelModal({ orderId, guestName, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 500,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 16,
          padding: 32,
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 16px 60px rgba(0,0,0,0.15)",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 10,
            color: "#1a1a1a",
          }}
        >
          Cancel Booking #{orderId}
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#666",
            lineHeight: 1.7,
            marginBottom: 28,
          }}
        >
          You're cancelling the reservation for{" "}
          <strong style={{ color: "#1a1a1a" }}>{guestName}</strong>. This
          action <strong style={{ color: "#c04040" }}>cannot be undone</strong>.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={styles.btnSecondary}>
            Keep Booking
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              ...styles.btnDanger,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Cancelling…" : "Cancel Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ order, animDelay, onCancel }) {
  const room = order.rooms_data?.[0] || {};
  const guest = room.guest_data?.guests?.[0] || {};
  const ci = fmtDate(order.checkin_at);
  const co = fmtDate(order.checkout_at);
  const adults = room.guest_data?.adults_number ?? 1;
  const children = room.guest_data?.children_number ?? 0;
  const freeCancel = order.cancellation_info?.free_cancellation_before;
  const penalty = order.cancellation_info?.policies?.find((p) => p.start_at)
    ?.penalty?.amount;
  const isCancellable =
    order.is_cancellable && order.status !== "cancelled";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ebebeb",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        animation: `fadeUp 0.35s ${animDelay}ms both`,
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 22px 14px",
          borderBottom: "1px solid #f0f0f0",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={styles.hotelIcon}>🏨</div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1a1a1a",
                lineHeight: 1.3,
              }}
            >
              {room.room_name || "Hotel Room"}
            </div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
              {room.meal_name === "nomeal" ? "No meal" : room.meal_name} ·{" "}
              {(room.bedding_name || []).join(", ")}
            </div>
          </div>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
        >
          <span style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>
            #{order.order_id}
          </span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Card Body Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        }}
      >
        {/* Dates */}
        <div style={{ ...styles.section, borderRight: "1px solid #f0f0f0" }}>
          <div style={styles.sectionLabel}>Stay Dates</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              <div style={styles.bigDay}>{ci.day}</div>
              <div style={styles.monthYear}>{ci.mon} {ci.year}</div>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                color: "#ccc",
              }}
            >
              <svg width="48" height="10" viewBox="0 0 48 10" fill="none">
                <line x1="0" y1="5" x2="42" y2="5" stroke="currentColor" strokeWidth="1.2" />
                <polyline points="36,1 43,5 36,9" stroke="currentColor" strokeWidth="1.2" fill="none" />
              </svg>
              <span
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#bbb",
                  whiteSpace: "nowrap",
                }}
              >
                {order.nights} night{order.nights !== 1 ? "s" : ""}
              </span>
            </div>
            <div>
              <div style={styles.bigDay}>{co.day}</div>
              <div style={styles.monthYear}>{co.mon} {co.year}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#999", marginTop: 10 }}>
            {adults} adult{adults !== 1 ? "s" : ""}
            {children ? `, ${children} child${children !== 1 ? "ren" : ""}` : ""}
          </div>
        </div>

        {/* Guest */}
        <div style={{ ...styles.section, borderRight: "1px solid #f0f0f0" }}>
          <div style={styles.sectionLabel}>Guest</div>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}
          >
            <div style={styles.avatar}>{getInitials(guest)}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                {getFullName(guest)}
              </div>
              <div style={{ fontSize: 11, color: "#999" }}>
                {order.user_data?.email || "—"}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#999", display: "flex", gap: 4 }}>
            Confirmation:{" "}
            <span style={{ color: "#1a1a1a", fontWeight: 500 }}>
              {order.supplier_data?.confirmation_id || "—"}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div style={{ ...styles.section, borderRight: "1px solid #f0f0f0" }}>
          <div style={styles.sectionLabel}>Amount</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            <span
              style={{ fontSize: 12, color: "#999", alignSelf: "flex-start", marginTop: 4 }}
            >
              {order.amount_payable?.currency_code || "USD"}
            </span>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a" }}>
              {Number(order.amount_payable?.amount || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
            Due: {order.payment_data?.payment_due || "—"}
          </div>
          <div style={styles.paymentBadge}>
            {(order.payment_data?.payment_type || "deposit").replace(/_/g, " ")}
          </div>
        </div>

        {/* Taxes */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Taxes & Fees</div>
          {(order.taxes || []).length === 0 ? (
            <div style={{ fontSize: 12, color: "#999" }}>No additional taxes</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {(order.taxes || []).map((t, i) => (
                <div
                  key={i}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}
                >
                  <span style={{ color: "#999", textTransform: "capitalize" }}>
                    {(t.name || "").replace(/_/g, " ")}
                    {t.is_included && (
                      <span
                        style={{
                          fontSize: 9,
                          background: "rgba(92,186,139,0.12)",
                          color: "#3d9e6e",
                          borderRadius: 4,
                          padding: "1px 5px",
                          marginLeft: 4,
                        }}
                      >
                        incl.
                      </span>
                    )}
                  </span>
                  <span style={{ color: "#1a1a1a", fontWeight: 500 }}>
                    {Number(t.amount_tax.amount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {t.amount_tax.currency_code}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Policy */}
      {freeCancel && (
        <div
          style={{
            margin: "0 22px 16px",
            background: "#f8fdf9",
            border: "1px solid rgba(92,186,139,0.2)",
            borderRadius: 10,
            padding: "10px 14px",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <span style={{ color: "#3d9e6e", fontSize: 14, flexShrink: 0 }}>✓</span>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
            Free cancellation before{" "}
            <strong style={{ color: "#1a1a1a" }}>{fmtFull(freeCancel)}</strong>.
            {penalty && penalty !== "0.00" && (
              <>
                {" "}Penalty after:{" "}
                <strong style={{ color: "#1a1a1a" }}>
                  {penalty} {order.amount_payable?.currency_code}
                </strong>
              </>
            )}
          </div>
        </div>
      )}

      {/* Card Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 22px",
          borderTop: "1px solid #f0f0f0",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#aaa",
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <span>
            Booked{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>Ref: {order.agreement_number}</span>
          {order.contract_slug && <span>{order.contract_slug}</span>}
        </div>

        {isCancellable && (
          <button
            onClick={() =>
              onCancel(order.order_id, getFullName(guest))
            }
            style={styles.btnCancelOutline}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(200,60,60,0.06)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const styles = {
  hotelIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  section: {
    padding: "18px 22px",
  },
  sectionLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: "#bbb",
    marginBottom: 12,
  },
  bigDay: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1,
    color: "#1a1a1a",
  },
  monthYear: {
    fontSize: 11,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginTop: 2,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#e8f0fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    color: "#3b6ef0",
    flexShrink: 0,
  },
  paymentBadge: {
    display: "inline-flex",
    alignItems: "center",
    marginTop: 10,
    background: "#f5f5f5",
    border: "1px solid #e8e8e8",
    borderRadius: 8,
    padding: "5px 10px",
    fontSize: 11,
    color: "#888",
    textTransform: "capitalize",
  },
  btnSecondary: {
    background: "#f5f5f5",
    border: "1px solid #e8e8e8",
    borderRadius: 8,
    padding: "9px 20px",
    fontFamily: "inherit",
    fontSize: 13,
    cursor: "pointer",
    color: "#666",
  },
  btnDanger: {
    background: "rgba(200,60,60,0.08)",
    border: "1px solid rgba(200,60,60,0.3)",
    borderRadius: 8,
    padding: "9px 20px",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 500,
    color: "#c04040",
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "1px solid #e5e5e5",
    background: "transparent",
    fontFamily: "inherit",
    fontSize: 14,
    cursor: "pointer",
    color: "#888",
    transition: "all 0.2s",
  },
  btnCancelOutline: {
    background: "transparent",
    border: "1px solid rgba(200,60,60,0.3)",
    borderRadius: 8,
    padding: "7px 16px",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    color: "#c04040",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "background 0.2s",
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Page() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { orderId, guestName }
  const [toast, setToast] = useState({ msg: "", type: "", visible: false });

  // ── Toast helper
  const showToast = (msg, type) => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  };

  // ── Fetch
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hotels/booking/allBookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: 1, page_size: 50, ordering_by: "created_at", ordering_type: "desc" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setBookings(json?.data?.orders || []);
    } catch (err) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ── Cancel
  const handleCancel = async () => {
    try {
      const res = await fetch(`/api/booking/cancel/${modal.orderId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setBookings((prev) =>
        prev.map((b) =>
          b.order_id === modal.orderId
            ? { ...b, status: "cancelled", is_cancellable: false }
            : b
        )
      );
      showToast("Booking cancelled successfully", "success");
    } catch {
      showToast("Failed to cancel. Please try again.", "error");
    } finally {
      setModal(null);
    }
  };

  // ── Filter + Paginate
  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (f) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #ebebeb",
          paddingBottom: 28,
          marginBottom: 36,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#bbb",
              marginBottom: 8,
            }}
          >
            Dashboard / <span style={{ color: "#1a1a1a" }}>Bookings</span>
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "#1a1a1a",
            }}
          >
            My Bookings
          </h1>
        </div>
        <div
          style={{
            background: "#f7f7f7",
            border: "1px solid #eee",
            borderRadius: 100,
            padding: "7px 18px",
            fontSize: 13,
            color: "#888",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <strong style={{ fontSize: 15, color: "#1a1a1a" }}>
            {bookings.length}
          </strong>{" "}
          total reservations
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            style={{
              background: filter === f ? "#1a1a1a" : "transparent",
              border: filter === f ? "1px solid #1a1a1a" : "1px solid #e5e5e5",
              color: filter === f ? "#fff" : "#888",
              padding: "7px 18px",
              borderRadius: 100,
              fontFamily: "inherit",
              fontSize: 13,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.2s",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: "80px 0",
            color: "#bbb",
          }}
        >
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "2px solid #eee",
              borderTopColor: "#1a1a1a",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ fontSize: 13 }}>Loading your bookings…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid rgba(200,60,60,0.2)",
            borderRadius: 12,
            padding: 32,
            textAlign: "center",
            color: "#c04040",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Failed to load bookings
          </div>
          <div style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>
            {error}
          </div>
          <button
            onClick={fetchBookings}
            style={{
              background: "transparent",
              border: "1px solid rgba(200,60,60,0.3)",
              borderRadius: 8,
              padding: "8px 16px",
              fontFamily: "inherit",
              fontSize: 13,
              cursor: "pointer",
              color: "#c04040",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "#bbb",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.4 }}>🏨</div>
          <div style={{ fontSize: 15 }}>No bookings found</div>
        </div>
      )}

      {/* Booking Cards */}
      {!loading &&
        !error &&
        paged.map((order, i) => (
          <BookingCard
            key={order.order_id}
            order={order}
            animDelay={i * 60}
            onCancel={(id, name) => setModal({ orderId: id, guestName: name })}
          />
        ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginTop: 32,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            style={{
              ...styles.pageBtn,
              opacity: page === 1 ? 0.3 : 1,
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            ‹
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              style={{
                ...styles.pageBtn,
                background: page === i + 1 ? "#1a1a1a" : "transparent",
                color: page === i + 1 ? "#fff" : "#888",
                border:
                  page === i + 1 ? "1px solid #1a1a1a" : "1px solid #e5e5e5",
                fontWeight: page === i + 1 ? 600 : 400,
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            style={{
              ...styles.pageBtn,
              opacity: page === totalPages ? 0.3 : 1,
              cursor: page === totalPages ? "not-allowed" : "pointer",
            }}
          >
            ›
          </button>
        </div>
      )}

      {/* Cancel Modal */}
      {modal && (
        <CancelModal
          orderId={modal.orderId}
          guestName={modal.guestName}
          onClose={() => setModal(null)}
          onConfirm={handleCancel}
        />
      )}

      {/* Toast */}
      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </div>
  );
}