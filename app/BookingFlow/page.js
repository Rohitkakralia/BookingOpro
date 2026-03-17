"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useBookingAPI } from "../hooks/useBookingAPI";

// At the top of BookingFlowContent, add:
import { useRouter } from "next/navigation";


function BookingFlowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const { getCreditToken } = useBookingAPI();
  const{ finishBooking } = useBookingAPI();

  // ── Read sessionStorage inside useEffect (client-side only) ───────────────
  const [hotelData, setHotelData] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [bookingFormData, setBookingFormData] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setDataLoaded(true);
      return;
    }

    try {
      const hotel = sessionStorage.getItem(`${bookingId}_hotel`);
      const room = sessionStorage.getItem(`${bookingId}_room`);
      const form = sessionStorage.getItem(`${bookingId}_bookingForm`);
      console.log("Loaded booking session data:", { hotel, room, form });

      setHotelData(hotel ? JSON.parse(hotel) : null);
      setRoomData(room ? JSON.parse(room) : null);
      setBookingFormData(form ? JSON.parse(form) : null);
    } catch (err) {
      console.error("Failed to parse sessionStorage data:", err);
    } finally {
      setDataLoaded(true);
    }
  }, [bookingId]);

  // ── Destructure booking form response fields ───────────────────────────────
  const {
    order_id,
    partner_order_id,
    item_id,
    upsell_data,
    payment_types,
  } = bookingFormData ?? {};

  // ── Debug logs (only after data is loaded) ─────────────────────────────────
  // useEffect(() => {
  //   if (!dataLoaded) return;
  //   console.log("=== Booking Flow Debug ===");
  //   console.log("bookingId:", bookingId);
  //   console.log("hotelData:", hotelData ? "✅ Found" : "❌ Missing");
  //   console.log("roomData:", roomData ? "✅ Found" : "❌ Missing");
  //   console.log("bookingFormData:", bookingFormData ? "✅ Found" : "❌ Missing");
  //   console.log("order_id:", order_id);
  //   console.log("partner_order_id:", partner_order_id);
  //   console.log("item_id:", item_id);
  //   console.log("book_hash from hotelData:", hotelData?.book_hash);
  //   console.log("book_hash from roomData:", roomData?.book_hash);
  //   console.log("========================");
  // }, [dataLoaded]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    cardHolderName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    specialRequests: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const cleanupBookingData = () => {
    if (bookingId) {
      sessionStorage.removeItem(`${bookingId}_hotel`);
      sessionStorage.removeItem(`${bookingId}_room`);
      sessionStorage.removeItem(`${bookingId}_bookingForm`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    if (name === "cardNumber") {
      val = value
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
    }
    if (name === "expiry") {
      val = value
        .replace(/\D/g, "")
        .slice(0, 4)
        .replace(/^(\d{2})(\d)/, "$1 / $2");
    }
    if (name === "cvc") {
      val = value.replace(/\D/g, "").slice(0, 4);
    }

    setForm((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.country) e.country = "Please select a country";
    if (!form.cardHolderName.trim()) e.cardHolderName = "Required";
    if (form.cardNumber.replace(/\s/g, "").length < 16)
      e.cardNumber = "Enter a valid 16-digit card number";
    if (form.expiry.replace(/\s\/\s/g, "").length < 4)
      e.expiry = "Enter MM / YY";
    if (form.cvc.length < 3) e.cvc = "Enter 3 or 4 digits";
    if (!form.agreeTerms) e.agreeTerms = "You must agree to continue";
    return e;
  };

  const handleSubmit = async () => {
  const e = validate();
  if (Object.keys(e).length > 0) {
    setErrors(e);
    return;
  }

  const [month = "", year = ""] = form.expiry.split("/").map((s) => s.trim());

  const credit_card_data_core = {
    card_number: form.cardNumber.replace(/\s+/g, ""),
    card_holder: form.cardHolderName,
    month,
    year,
  };

  try {
    // ── Step 2: Tokenize card — returns pay_uuid + init_uuid ─────────────
    const tokenResult = await getCreditToken({
      item_id,
      first_name: form.firstName,
      last_name:  form.lastName,
      cvc:        form.cvc,
      credit_card_data_core,
    });

    console.log("✅ Step 2 done:", tokenResult);

    const { pay_uuid, init_uuid } = tokenResult; // ← from the updated getCreditToken

    // ── Step 3: Finish booking ────────────────────────────────────────────
    const pt = payment_types?.[0];

    const finishBookingData = {
      partner_order_id,                          // ← root level (required)
      order_id,
      item_id,
      language: "en",
      return_path: `${window.location.origin}/booking/confirm`,

      partner: {
        partner_order_id,
        comment:           "Booking via web interface",
        amount_sell_b2b2c: "0",
      },

      payment_type: {
        type:          pt?.type          || "deposit",
        amount:        String(pt?.show_amount || pt?.amount || totalPrice || "0"),
        currency_code: pt?.currency_code  || "USD",
        pay_uuid,      // ← from step 2
        init_uuid,     // ← from step 2
      },

      rooms: [{
        guests: [{
          first_name: form.firstName,
          last_name:  form.lastName,
        }],
      }],

      user: {
        email:   form.email,
        phone:   form.phone,
        comment: form.specialRequests || "",
      },

      supplier_data: {
        first_name_original: form.firstName,
        last_name_original:  form.lastName,
        email:               form.email,
        phone:               form.phone,
      },

      upsell_data: upsell_data || [],
    };

    console.log("Step 3 payload:", finishBookingData);

    const finishResult = await finishBooking(finishBookingData);
    console.log("✅ Step 3 done:", finishResult);


    const confirmationId = `confirmation_${Date.now()}`;
sessionStorage.setItem(`${confirmationId}_booking`, JSON.stringify({
  // Booking identifiers
  order_id,
  partner_order_id,
  item_id,

  // Guest & contact
  first_name:  form.firstName,
  last_name:   form.lastName,
  email:       form.email,
  phone:       form.phone,
  country:     form.country,

  // Hotel & room
  hotelName:   hotelData?.hotelName,
  checkin:     hotelData?.checkin,
  checkout:    hotelData?.checkout,
  roomName:    roomData?.room_data_trans?.main_name || roomData?.room_name,

  // Payment
  payment_type:     pt?.type,
  amount:           String(pt?.show_amount || pt?.amount || totalPrice || "0"),
  currency_code:    pt?.currency_code || "USD",

  // API result
  finishResult:     finishResult?.data || {},

  // Timestamp
  booked_at: new Date().toISOString(),
}));


    cleanupBookingData();
    setSubmitted(true);
    router.push(`/your-bookings?id=${confirmationId}`);



  } catch (err) {
    console.error("Booking process failed:", err);
    setErrors({ payment: err.message || "Booking failed. Please try again." });
  }
};

  // ── Loading state (waiting for sessionStorage) ─────────────────────────────
  if (!dataLoaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏨</div>
          <p style={{ fontSize: "18px", color: "#6b7a8d" }}>
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  // ── No data state ──────────────────────────────────────────────────────────
  if (!hotelData || !roomData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 6px 28px rgba(10,20,40,0.09)",
            maxWidth: "400px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏨</div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              fontWeight: "700",
              color: "#1a2332",
              marginBottom: "12px",
            }}
          >
            Booking Flow
          </h1>
          <p
            style={{ color: "#6b7a8d", fontSize: "16px", marginBottom: "24px" }}
          >
            No booking data found. Please select a room from the hotel results.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Back to Results
          </button>
        </div>
      </div>
    );
  }

  // ── Missing booking form data state ────────────────────────────────────────
  if (!bookingFormData || !item_id) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 6px 28px rgba(10,20,40,0.09)",
            maxWidth: "400px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              fontWeight: "700",
              color: "#1a2332",
              marginBottom: "12px",
            }}
          >
            Booking Setup Incomplete
          </h1>
          <p
            style={{ color: "#dc2626", fontSize: "16px", marginBottom: "24px" }}
          >
            The booking form could not be created. This may be due to an expired
            session or invalid booking hash.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Back to Results
          </button>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "48px 40px",
            textAlign: "center",
            boxShadow: "0 6px 28px rgba(10,20,40,0.09)",
            maxWidth: "480px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "32px",
            }}
          >
            ✓
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "28px",
              fontWeight: "700",
              color: "#1a2332",
              marginBottom: "12px",
            }}
          >
            Booking Confirmed!
          </h1>
          <p style={{ color: "#6b7a8d", fontSize: "16px", marginBottom: "8px" }}>
            Thank you, {form.firstName}. Your reservation at
          </p>
          <p
            style={{
              color: "#1a2332",
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            {hotelData.hotelName || hotelData.id}
          </p>
          <p
            style={{
              color: "#6b7a8d",
              fontSize: "14px",
              marginBottom: "24px",
            }}
          >
            has been received. A confirmation will be sent to{" "}
            <strong>{form.email}</strong>.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 28px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const hotelName =
    hotelData.hotelName ||
    (hotelData.id
      ? hotelData.id
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Luxury Hotel");

  const dailyPrice = parseFloat(roomData.daily_prices?.[0] || 0).toFixed(0);
  const nights = roomData.daily_prices?.length || 1;
  const paymentType = roomData.payment_options?.payment_types?.[0];
  const totalPrice = paymentType?.show_amount || "—";
  const roomName = roomData.room_data_trans?.main_name || roomData.room_name;
  const beddingType = roomData.room_data_trans?.bedding_type;
  const hasBreakfast = roomData.meal_data?.has_breakfast;
  const mealType = roomData.meal;
  const freeCancelBefore =
    paymentType?.cancellation_penalties?.free_cancellation_before;
  const vatTax = paymentType?.tax_data?.taxes?.find((t) => t.name === "vat");
  const cityTax = paymentType?.tax_data?.taxes?.find(
    (t) => t.name === "city_tax"
  );

  const mealLabel =
    mealType === "breakfast"
      ? "Breakfast included"
      : mealType === "nomeal"
      ? "No meals"
      : mealType === "halfboard" || mealType === "half-board"
      ? "Half board"
      : mealType === "fullboard"
      ? "Full board"
      : mealType === "allinclusive"
      ? "All inclusive"
      : mealType;

  const inputStyle = (field) => ({
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: `1.5px solid ${errors[field] ? "#ef4444" : "#e2e8f0"}`,
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#1a2332",
    outline: "none",
    boxSizing: "border-box",
    background: "white",
    transition: "border-color 0.2s",
  });

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  };

  const errorStyle = {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "4px",
  };

  const sectionCard = {
    background: "white",
    borderRadius: "20px",
    padding: "28px 32px",
    marginBottom: "20px",
    boxShadow: "0 4px 20px rgba(10,20,40,0.07)",
  };

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Top nav bar */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 8px rgba(10,20,40,0.06)",
        }}
      >
        <button
          onClick={() => window.history.back()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#6b7a8d",
            fontFamily: "'DM Sans', sans-serif",
            padding: "6px 0",
          }}
        >
          ← Back to Results
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "#6b7a8d",
          }}
        >
          <span
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            1
          </span>
          Select Room
          <span style={{ color: "#cbd5e1" }}>──</span>
          <span
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            2
          </span>
          <strong style={{ color: "#1a2332" }}>Your Details</strong>
          <span style={{ color: "#cbd5e1" }}>──</span>
          <span
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#e2e8f0",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            3
          </span>
          Confirmation
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "36px 20px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "34px",
              fontWeight: "800",
              color: "#1a2332",
              margin: "0 0 6px 0",
            }}
          >
            Complete Your Booking
          </h1>
          <p style={{ color: "#6b7a8d", fontSize: "15px", margin: 0 }}>
            Review your selection and fill in your details to confirm the
            reservation.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 420px",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* ── LEFT COLUMN: Guest form ────────────────────────────────── */}
          <div>
            <div style={sectionCard}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#1a2332",
                  margin: "0 0 20px",
                }}
              >
                👤 Guest Information
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>First name</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    style={inputStyle("firstName")}
                  />
                  {errors.firstName && (
                    <p style={errorStyle}>{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Last name</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Smith"
                    style={inputStyle("lastName")}
                  />
                  {errors.lastName && (
                    <p style={errorStyle}>{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Email address</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  style={inputStyle("email")}
                />
                {errors.email && <p style={errorStyle}>{errors.email}</p>}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>Phone number</label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 555 000 0000"
                    style={inputStyle("phone")}
                  />
                  {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    style={{
                      ...inputStyle("country"),
                      cursor: "pointer",
                      appearance: "none",
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7a8d' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 14px center",
                      paddingRight: "36px",
                    }}
                  >
                    <option value="">Select country</option>
                    {[
                      "United States",
                      "United Kingdom",
                      "France",
                      "Germany",
                      "India",
                      "Australia",
                      "Canada",
                      "Japan",
                      "Brazil",
                      "South Africa",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  {errors.country && (
                    <p style={errorStyle}>{errors.country}</p>
                  )}
                </div>
              </div>
            </div>

            <div style={sectionCard}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#1a2332",
                  margin: "0 0 4px",
                }}
              >
                💳 Payment Details
              </h2>
              <p
                style={{
                  color: "#6b7a8d",
                  fontSize: "13px",
                  margin: "0 0 20px",
                }}
              >
                Your card will be charged ${totalPrice} upon confirmation.
              </p>

              {/* Payment error banner */}
              {errors.payment && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "10px",
                    color: "#dc2626",
                    fontSize: "14px",
                    marginBottom: "16px",
                  }}
                >
                  ⚠️ {errors.payment}
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Card Holder Name</label>
                <input
                  name="cardHolderName"
                  value={form.cardHolderName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={inputStyle("cardHolderName")}
                />
                {errors.cardHolderName && (
                  <p style={errorStyle}>{errors.cardHolderName}</p>
                )}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Card number</label>
                <input
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  style={inputStyle("cardNumber")}
                />
                {errors.cardNumber && (
                  <p style={errorStyle}>{errors.cardNumber}</p>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "16px",
                }}
              >
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>Expiry date</label>
                  <input
                    name="expiry"
                    value={form.expiry}
                    onChange={handleChange}
                    placeholder="MM / YY"
                    style={inputStyle("expiry")}
                  />
                  {errors.expiry && <p style={errorStyle}>{errors.expiry}</p>}
                </div>
                <div>
                  <label style={labelStyle}>CVC</label>
                  <input
                    name="cvc"
                    value={form.cvc}
                    onChange={handleChange}
                    placeholder="123"
                    style={inputStyle("cvc")}
                  />
                  {errors.cvc && <p style={errorStyle}>{errors.cvc}</p>}
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  background: "#f0fdf4",
                  borderRadius: "10px",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#15803d",
                }}
              >
                🔒 Your payment information is encrypted and secure.
              </div>
            </div>

            <div style={sectionCard}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#1a2332",
                  margin: "0 0 6px",
                }}
              >
                📝 Special Requests
              </h2>
              <p
                style={{
                  color: "#6b7a8d",
                  fontSize: "13px",
                  margin: "0 0 14px",
                }}
              >
                Optional — requests are not guaranteed but we'll do our best.
              </p>
              <textarea
                name="specialRequests"
                value={form.specialRequests}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. high floor, early check-in, cot for infant..."
                style={{
                  ...inputStyle("specialRequests"),
                  resize: "vertical",
                  lineHeight: "1.6",
                }}
              />
            </div>

            <div style={sectionCard}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={form.agreeTerms}
                  onChange={handleChange}
                  style={{
                    width: "16px",
                    height: "16px",
                    marginTop: "2px",
                    flexShrink: 0,
                    accentColor: "#1d4ed8",
                    cursor: "pointer",
                  }}
                />
                <label
                  htmlFor="agreeTerms"
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    lineHeight: "1.6",
                    cursor: "pointer",
                  }}
                >
                  I have read and agree to the{" "}
                  <span
                    style={{
                      color: "#1d4ed8",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    booking terms & conditions
                  </span>{" "}
                  and the hotel's{" "}
                  <span
                    style={{
                      color: "#1d4ed8",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    cancellation policy
                  </span>
                  .
                </label>
              </div>
              {errors.agreeTerms && (
                <p style={{ ...errorStyle, marginBottom: "12px" }}>
                  {errors.agreeTerms}
                </p>
              )}

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    cleanupBookingData();
                    window.history.back();
                  }}
                  style={{
                    background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px 24px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  ← Back
                </button>

                <button
                  onClick={handleSubmit}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px 28px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
                  }}
                >
                  Confirm Booking — ${totalPrice} →
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Booking summary ──────────────────────────── */}
          <div style={{ position: "sticky", top: "80px" }}>
            <div style={{ ...sectionCard, marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  marginBottom: "16px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    flexShrink: 0,
                  }}
                >
                  🏨
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#1a2332",
                      margin: "0 0 4px",
                    }}
                  >
                    {hotelName}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#f59e0b", margin: 0 }}>
                    ★★★ Paris, France
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                {[
                  { label: "Check-in", value: hotelData.checkin || "—" },
                  { label: "Check-out", value: hotelData.checkout || "—" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      background: "#f8fafc",
                      borderRadius: "10px",
                      padding: "10px 12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#6b7a8d",
                        margin: "0 0 3px",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1a2332",
                        margin: 0,
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "14px",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#1a2332",
                    margin: "0 0 4px",
                  }}
                >
                  {roomName}
                </p>
                {beddingType && (
                  <p style={{ fontSize: "13px", color: "#6b7a8d", margin: "0 0 8px" }}>
                    🛏️ {beddingType}
                  </p>
                )}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      background: hasBreakfast ? "#dcfce7" : "#f1f5f9",
                      color: hasBreakfast ? "#16a34a" : "#64748b",
                      border: `1px solid ${hasBreakfast ? "#bbf7d0" : "#e2e8f0"}`,
                      borderRadius: "20px",
                      padding: "3px 10px",
                      fontWeight: "500",
                    }}
                  >
                    {hasBreakfast ? "🍳" : "🚫"} {mealLabel}
                  </span>
                  {roomData.amenities_data?.map((a) => (
                    <span
                      key={a}
                      style={{
                        fontSize: "11px",
                        background: "#f1f5f9",
                        color: "#64748b",
                        border: "1px solid #e2e8f0",
                        borderRadius: "20px",
                        padding: "3px 10px",
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: freeCancelBefore ? "#f0fdf4" : "#fff7ed",
                  border: `1px solid ${freeCancelBefore ? "#bbf7d0" : "#fed7aa"}`,
                  fontSize: "12px",
                  color: freeCancelBefore ? "#15803d" : "#c2410c",
                  marginBottom: "16px",
                }}
              >
                {freeCancelBefore
                  ? `✅ Free cancellation before ${new Date(
                      freeCancelBefore
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}`
                  : "⚠️ Non-refundable — full charge applies at booking"}
              </div>

              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1a2332",
                    margin: "0 0 10px",
                  }}
                >
                  Price breakdown
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7a8d" }}>
                      ${dailyPrice} × {nights} night{nights > 1 ? "s" : ""}
                    </span>
                    <span style={{ color: "#1a2332" }}>${totalPrice}</span>
                  </div>
                  {vatTax && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#6b7a8d" }}>
                        VAT ({vatTax.included_by_supplier ? "included" : "excl."})
                      </span>
                      <span style={{ color: "#1a2332" }}>${vatTax.amount}</span>
                    </div>
                  )}
                  {cityTax && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#6b7a8d" }}>City tax (pay at hotel)</span>
                      <span style={{ color: "#1a2332" }}>
                        {cityTax.currency_code} {cityTax.amount}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    borderTop: "2px solid #f1f5f9",
                    marginTop: "12px",
                    paddingTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#1a2332" }}>
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "26px",
                      fontWeight: "800",
                      color: "#1a2332",
                    }}
                  >
                    ${totalPrice}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "16px 20px",
                boxShadow: "0 4px 20px rgba(10,20,40,0.07)",
              }}
            >
              {[
                { icon: "🔒", text: "Secure 256-bit SSL encryption" },
                { icon: "✅", text: "Instant booking confirmation" },
                { icon: "🌍", text: "Best price guarantee" },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 0",
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: "13px",
                    color: "#374151",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{icon}</span>
                  {text}
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  paddingTop: "8px",
                  fontSize: "13px",
                  color: "#374151",
                }}
              >
                <span style={{ fontSize: "16px" }}>💬</span>
                24/7 customer support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingFlow() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏨</div>
            <p style={{ fontSize: "18px", color: "#6b7a8d" }}>
              Loading booking details...
            </p>
          </div>
        </div>
      }
    >
      <BookingFlowContent />
    </Suspense>
  );
}