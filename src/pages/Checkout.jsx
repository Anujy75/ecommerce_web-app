import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { initiateRazorpayPayment } from "../services/razorpay";

/* ─────────────────────────────────────────────
   LOCATION DETECTION UTILITY
   Uses browser Geolocation API + OpenStreetMap
   Nominatim for reverse geocoding (free, no key)
───────────────────────────────────────────────*/
const reverseGeocode = async (lat, lon) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en" },
  });
  if (!res.ok) throw new Error("Geocode failed");
  return res.json();
};

const parseAddress = (data) => {
  const a = data.address || {};

  // Build readable street address
  const streetParts = [
    a.house_number,
    a.road || a.pedestrian || a.footway,
    a.neighbourhood || a.suburb || a.quarter,
  ].filter(Boolean);

  const address = streetParts.join(", ") || a.county || "";

  const city =
    a.city || a.town || a.village || a.municipality || a.district || "";

  const pincode = a.postcode || "";

  return { address, city, pincode };
};

/* ─────────────────────────────────────────────
   LOCATION BUTTON COMPONENT
───────────────────────────────────────────────*/
const LocationButton = ({ onDetect, detecting }) => (
  <button
    type="button"
    onClick={onDetect}
    disabled={detecting}
    style={{
      ...S.locBtn,
      ...(detecting ? S.locBtnActive : {}),
    }}
    title="Autofill address from current location"
  >
    {detecting ? (
      <>
        <span style={S.locSpinner} />
        Detecting location…
      </>
    ) : (
      <>
        <svg
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <circle cx="12" cy="12" r="8" strokeDasharray="2 3" />
        </svg>
        Use Current Location
      </>
    )}
  </button>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────*/
const Checkout = () => {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("customerToken") ||
    localStorage.getItem("adminToken");

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [focused, setFocused] = useState("");

  // Location state
  const [detecting, setDetecting] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "UPI",
  });

  /* ── inject fonts + keyframes once ── */
  useEffect(() => {
    const id = "co-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes cospin { to { transform: rotate(360deg); } }
        @keyframes copulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes coslide { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cocheck { from { stroke-dashoffset:20; } to { stroke-dashoffset:0; } }
        body { margin:0; padding:0; }
        input::placeholder, textarea::placeholder { color:#a09c93; }
        @media(max-width:960px){
          .co-layout { grid-template-columns: 1fr !important; }
        }
        @media(max-width:600px){
          .co-grid2 { grid-template-columns: 1fr !important; }
          .co-pay-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `;
      document.head.appendChild(s);
    }
  }, []);

  /* ── load cart ── */
  const loadCart = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data.items || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // If user manually edits after location detect, remove the badge
    if (["address", "city", "pincode"].includes(e.target.name)) {
      setLocationDetected(false);
    }
  };

  /* ──────────────────────────────────────────
     LOCATION DETECTION — the main feature
  ─────────────────────────────────────────────*/
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await reverseGeocode(latitude, longitude);
          const parsed = parseAddress(data);

          setFormData((prev) => ({
            ...prev,
            address: parsed.address || prev.address,
            city: parsed.city || prev.city,
            pincode: parsed.pincode || prev.pincode,
          }));

          setLocationDetected(true);
          toast.success("Location detected and address filled!");
        } catch (err) {
          console.error(err);
          toast.error("Could not fetch address. Please fill manually.");
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        setDetecting(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied. Please allow access in browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location unavailable. Try again.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;
          default:
            toast.error("Failed to detect location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /* ── coupon ── */
  const applyCoupon = () => {
    if (coupon.toUpperCase() === "ANUJ100") {
      setDiscount(100);
      toast.success("Coupon Applied — ₹100 off!");
    } else if (coupon.toUpperCase() === "MEGA500") {
      setDiscount(500);
      toast.success("Mega Discount Applied — ₹500 off!");
    } else {
      setDiscount(0);
      toast.error("Invalid coupon code.");
    }
  };

  /* ── calculations ── */
  const calculations = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity, 0
    );
    const gst = subtotal * 0.18;
    const shipping = subtotal > 999 ? 0 : 99;
    const platformFee = 9;
    const finalTotal = subtotal + gst + shipping + platformFee - discount;
    return { subtotal, gst, shipping, platformFee, finalTotal };
  }, [cart, discount]);

  const deliveryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toDateString();
  }, []);

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.paymentMethod === "RAZORPAY") {
      setIsRazorpayLoading(true);
      await initiateRazorpayPayment(
        calculations.finalTotal,
        { fullName: formData.fullName, email: formData.email, phone: formData.phone, address: formData.address },
        token,
        async (paymentResponse) => {
          try {
            const orderResponse = await axios.post(
              "http://localhost:8080/api/orders/checkout",
              { ...formData, discount, totalAmount: calculations.finalTotal, razorpayPaymentId: paymentResponse.razorpay_payment_id, razorpayOrderId: paymentResponse.razorpay_order_id },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Order Placed Successfully");
            navigate(`/order-success?orderId=${orderResponse.data.orderId}`);
          } catch (err) {
            console.error(err);
            toast.error("Failed to place order");
          }
          setIsRazorpayLoading(false);
        },
        (error) => {
          toast.error(error || "Payment failed");
          setIsRazorpayLoading(false);
        }
      );
      return;
    }

    setPlacing(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/orders/checkout",
        { ...formData, discount, totalAmount: calculations.finalTotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order Placed Successfully");
      navigate(`/order-success?orderId=${response.data.orderId}`);
    } catch (err) {
      console.error(err);
      toast.error("Checkout Failed");
    } finally {
      setPlacing(false);
    }
  };

  /* ── loading state ── */
  if (loading) {
    return (
      <div style={S.loaderPage}>
        <div style={S.loaderRing} />
        <p style={S.loaderText}>Preparing Checkout…</p>
      </div>
    );
  }

  /* ── empty cart ── */
  if (cart.length === 0) {
    return (
      <div style={S.loaderPage}>
        <div style={S.emptyIcon}>🛒</div>
        <h2 style={S.emptyTitle}>Your cart is empty</h2>
        <button style={S.shopBtn} onClick={() => navigate("/products")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  const isProcessing = placing || isRazorpayLoading;

  return (
    <div style={S.page}>
      <div style={S.wrapper}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.heading}>Secure Checkout</h1>
            <p style={S.subheading}>Fast · Secure · Premium</p>
          </div>
          <div style={S.sslBadge}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            SSL Secured
          </div>
        </div>

        {/* Layout */}
        <div style={S.layout} className="co-layout">

          {/* ── LEFT: Form ── */}
          <form onSubmit={handleSubmit} style={S.formCard}>

            {/* Shipping section */}
            <div style={S.section}>
              <div style={S.sectionHead}>
                <span style={S.sectionDot} />
                Shipping Details
              </div>

              {/* Location detect button */}
              <div style={S.locRow}>
                <LocationButton onDetect={handleDetectLocation} detecting={detecting} />
                {locationDetected && (
                  <div style={S.locBadge}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray:20, strokeDashoffset:0, animation:"cocheck 0.4s ease" }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Location filled
                  </div>
                )}
              </div>

              {/* Name + Email */}
              <div style={S.grid2} className="co-grid2">
                <InputField name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} focused={focused} setFocused={setFocused} />
                <InputField name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} focused={focused} setFocused={setFocused} />
              </div>

              {/* Phone + City */}
              <div style={S.grid2} className="co-grid2">
                <InputField name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} focused={focused} setFocused={setFocused} />
                <InputField
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                  highlighted={locationDetected && !!formData.city}
                />
              </div>

              {/* Pincode */}
              <div style={S.grid2} className="co-grid2">
                <InputField
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                  highlighted={locationDetected && !!formData.pincode}
                />
                <div />
              </div>

              {/* Address textarea */}
              <div style={{ position: "relative" }}>
                <textarea
                  name="address"
                  placeholder="Full Address (Street, Locality, Landmark)"
                  value={formData.address}
                  onChange={handleChange}
                  style={{
                    ...S.textarea,
                    border: focused === "address"
                      ? "1.5px solid #2d6af6"
                      : locationDetected && formData.address
                      ? "1.5px solid #1a9c4d"
                      : "1.5px solid #e4e0d8",
                  }}
                  onFocus={() => setFocused("address")}
                  onBlur={() => setFocused("")}
                  required
                />
                {locationDetected && formData.address && (
                  <span style={S.fieldCheck}>✓</span>
                )}
              </div>
            </div>

            {/* Payment section */}
            <div style={S.section}>
              <div style={S.sectionHead}>
                <span style={S.sectionDot} />
                Payment Method
              </div>
              <div style={S.payGrid} className="co-pay-grid">
                {[
                  { label: "UPI", icon: "📱", sub: "Instant" },
                  { label: "CARD", icon: "💳", sub: "Debit/Credit" },
                  { label: "COD", icon: "💵", sub: "On Delivery" },
                  { label: "RAZORPAY", icon: "⚡", sub: "Smart Pay" },
                ].map((m) => {
                  const active = formData.paymentMethod === m.label;
                  return (
                    <div
                      key={m.label}
                      onClick={() => setFormData({ ...formData, paymentMethod: m.label })}
                      style={{ ...S.payCard, ...(active ? S.payCardActive : {}) }}
                    >
                      <span style={S.payIcon}>{m.icon}</span>
                      <span style={{ ...S.payLabel, color: active ? "#2d6af6" : "#1c1b18" }}>{m.label}</span>
                      <span style={S.paySub}>{m.sub}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coupon section */}
            <div style={S.section}>
              <div style={S.sectionHead}>
                <span style={S.sectionDot} />
                Promo Code
              </div>
              <div style={S.couponRow}>
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Enter coupon code"
                  style={{ ...S.couponInput, border: focused === "coupon" ? "1.5px solid #2d6af6" : "1.5px solid #e4e0d8" }}
                  onFocus={() => setFocused("coupon")}
                  onBlur={() => setFocused("")}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                />
                <button type="button" onClick={applyCoupon} style={S.applyBtn}>Apply</button>
              </div>
              {discount > 0 && (
                <div style={S.couponSuccess}>
                  🎉 ₹{discount} discount applied!
                </div>
              )}
              <div style={S.rewardPill}>⭐ Premium reward eligible order</div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              style={{ ...S.submitBtn, opacity: isProcessing ? 0.75 : 1 }}
            >
              {isProcessing ? (
                <><span style={S.btnSpinner} /> Processing…</>
              ) : (
                <>Pay ₹{Math.round(calculations.finalTotal).toLocaleString("en-IN")} →</>
              )}
            </button>
          </form>

          {/* ── RIGHT: Summary ── */}
          <div style={S.summaryCard}>
            <div style={S.summaryHeader}>
              <h2 style={S.summaryTitle}>Order Summary</h2>
              <div style={S.deliveryTag}>
                🚀 Delivery by {deliveryDate}
              </div>
            </div>

            {/* Cart items */}
            <div style={S.cartList}>
              {cart.map((item) => (
                <div key={item.id} style={S.cartItem}>
                  <div style={S.cartItemIcon}>📦</div>
                  <div style={S.cartItemInfo}>
                    <div style={S.cartItemName}>{item.product.name}</div>
                    <div style={S.cartItemQty}>Qty: {item.quantity}</div>
                  </div>
                  <div style={S.cartItemPrice}>
                    ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            {/* Bill */}
            <div style={S.bill}>
              <BillRow label="Subtotal" value={calculations.subtotal} />
              <BillRow label="GST (18%)" value={calculations.gst} />
              <BillRow label="Shipping" value={calculations.shipping === 0 ? "Free" : calculations.shipping} green={calculations.shipping === 0} />
              <BillRow label="Platform Fee" value={calculations.platformFee} />
              {discount > 0 && <BillRow label="Coupon Discount" value={`-₹${discount}`} green />}
            </div>

            <div style={S.totalRow}>
              <span>Grand Total</span>
              <span style={S.totalAmount}>₹{Math.round(calculations.finalTotal).toLocaleString("en-IN")}</span>
            </div>

            {/* Trust */}
            <div style={S.trustGrid}>
              {[["🛡", "Secure Payment"], ["⚡", "Fast Checkout"], ["🔁", "Easy Returns"], ["📍", "Live Tracking"]].map(([icon, label]) => (
                <div key={label} style={S.trustItem}>
                  <span style={S.trustIcon}>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ─── InputField ─────────────────────────────── */
const InputField = ({ name, type = "text", placeholder, value, onChange, focused, setFocused, highlighted }) => (
  <div style={{ position: "relative" }}>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(name)}
      onBlur={() => setFocused("")}
      style={{
        ...S.input,
        border: focused === name
          ? "1.5px solid #2d6af6"
          : highlighted
          ? "1.5px solid #1a9c4d"
          : "1.5px solid #e4e0d8",
        paddingRight: highlighted ? "36px" : "16px",
      }}
      required
    />
    {highlighted && <span style={S.fieldCheck}>✓</span>}
  </div>
);

/* ─── BillRow ─────────────────────────────────── */
const BillRow = ({ label, value, green }) => (
  <div style={S.billRow}>
    <span style={S.billLabel}>{label}</span>
    <span style={{ ...S.billVal, color: green ? "#1a9c4d" : "#1c1b18" }}>
      {typeof value === "number" ? `₹${Math.round(value).toLocaleString("en-IN")}` : value}
    </span>
  </div>
);

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────*/
const S = {
  page: {
    minHeight: "100vh",
    background: "#f5f4f0",
    padding: "36px 20px 60px",
    fontFamily: "'Sora', 'Segoe UI', sans-serif",
  },
  wrapper: {
    maxWidth: 1260,
    margin: "0 auto",
  },

  /* header */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 14,
  },
  heading: {
    fontSize: 36,
    fontWeight: 800,
    letterSpacing: "-1.2px",
    color: "#1c1b18",
    marginBottom: 4,
  },
  subheading: { fontSize: 14, color: "#9e9b94", fontWeight: 500 },
  sslBadge: {
    display: "flex", alignItems: "center", gap: 7,
    background: "#fff",
    border: "1px solid #e4e0d8",
    borderRadius: 100,
    padding: "8px 18px",
    fontSize: 13, fontWeight: 600,
    color: "#3d3a34",
  },

  /* layout */
  layout: {
    display: "grid",
    gridTemplateColumns: "1.3fr 0.8fr",
    gap: 20,
    alignItems: "start",
  },

  /* form card */
  formCard: {
    background: "#ffffff",
    border: "1px solid #e8e4dc",
    borderRadius: 20,
    padding: "28px 28px 24px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
  },
  section: { marginBottom: 26 },
  sectionHead: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 16, fontWeight: 700,
    color: "#1c1b18", marginBottom: 16,
  },
  sectionDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: "#2d6af6", flexShrink: 0,
    display: "inline-block",
  },

  /* location */
  locRow: {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 16, flexWrap: "wrap",
  },
  locBtn: {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "9px 16px",
    borderRadius: 10,
    border: "1.5px solid #2d6af6",
    background: "#eff6ff",
    color: "#2d6af6",
    fontSize: 13, fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  locBtnActive: {
    background: "#dbeafe",
    color: "#1d4ed8",
    animation: "copulse 1.2s ease infinite",
  },
  locSpinner: {
    display: "inline-block",
    width: 12, height: 12,
    border: "2px solid #93c5fd",
    borderTopColor: "#2d6af6",
    borderRadius: "50%",
    animation: "cospin 0.8s linear infinite",
    flexShrink: 0,
  },
  locBadge: {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 12px",
    borderRadius: 100,
    background: "#f0faf4",
    border: "1px solid #b6e8c8",
    color: "#1a9c4d",
    fontSize: 12, fontWeight: 600,
    animation: "coslide 0.3s ease",
  },

  /* inputs */
  grid2: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 12, marginBottom: 12,
  },
  input: {
    width: "100%", padding: "13px 16px",
    borderRadius: 12, fontSize: 14,
    color: "#1c1b18", background: "#fafaf8",
    outline: "none", boxSizing: "border-box",
    transition: "border 0.2s, background 0.2s",
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%", minHeight: 90,
    borderRadius: 12, padding: "13px 16px",
    fontSize: 14, color: "#1c1b18",
    background: "#fafaf8", outline: "none",
    resize: "vertical", boxSizing: "border-box",
    fontFamily: "inherit", transition: "border 0.2s",
  },
  fieldCheck: {
    position: "absolute", right: 12,
    top: "50%", transform: "translateY(-50%)",
    color: "#1a9c4d", fontWeight: 700, fontSize: 14,
    pointerEvents: "none",
  },

  /* payment */
  payGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  payCard: {
    padding: "14px 10px",
    borderRadius: 14,
    border: "1.5px solid #e4e0d8",
    background: "#fafaf8",
    cursor: "pointer",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 5,
    transition: "all 0.2s",
  },
  payCardActive: {
    border: "1.5px solid #2d6af6",
    background: "#eff6ff",
    boxShadow: "0 0 0 3px rgba(45,106,246,0.1)",
  },
  payIcon: { fontSize: 22 },
  payLabel: { fontSize: 12, fontWeight: 700 },
  paySub: { fontSize: 10, color: "#9e9b94" },

  /* coupon */
  couponRow: { display: "flex", gap: 10, marginBottom: 10 },
  couponInput: {
    flex: 1, padding: "12px 14px",
    borderRadius: 12, fontSize: 14,
    color: "#1c1b18", background: "#fafaf8",
    outline: "none", fontFamily: "inherit",
    transition: "border 0.2s",
  },
  applyBtn: {
    padding: "0 20px",
    borderRadius: 12, border: "none",
    background: "#1c1b18", color: "#fff",
    fontWeight: 700, fontSize: 14,
    cursor: "pointer", fontFamily: "inherit",
    letterSpacing: "-0.2px",
  },
  couponSuccess: {
    padding: "9px 14px", borderRadius: 10,
    background: "#f0faf4", border: "1px solid #b6e8c8",
    color: "#1a9c4d", fontSize: 13, fontWeight: 600,
    marginBottom: 10, animation: "coslide 0.3s ease",
  },
  rewardPill: {
    padding: "9px 14px", borderRadius: 10,
    background: "#fffbeb", border: "1px solid #fde68a",
    color: "#92400e", fontSize: 13, fontWeight: 600,
  },

  /* submit */
  submitBtn: {
    width: "100%", padding: "15px",
    border: "none", borderRadius: 14,
    background: "#1c1b18", color: "#fff",
    fontSize: 16, fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit",
    letterSpacing: "-0.3px",
    display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8,
    transition: "opacity 0.2s, transform 0.1s",
  },
  btnSpinner: {
    width: 16, height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "cospin 0.8s linear infinite",
  },

  /* summary card */
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e8e4dc",
    borderRadius: 20,
    padding: "24px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
    position: "sticky", top: 20,
    height: "fit-content",
  },
  summaryHeader: { marginBottom: 18 },
  summaryTitle: {
    fontSize: 20, fontWeight: 800,
    color: "#1c1b18", marginBottom: 6,
    letterSpacing: "-0.5px",
  },
  deliveryTag: {
    display: "inline-block",
    background: "#f0faf4",
    border: "1px solid #b6e8c8",
    borderRadius: 100, padding: "4px 12px",
    fontSize: 12, fontWeight: 600, color: "#1a9c4d",
  },

  /* cart items */
  cartList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 },
  cartItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px",
    background: "#fafaf8",
    border: "1px solid #eeece6",
    borderRadius: 12,
  },
  cartItemIcon: { fontSize: 20, flexShrink: 0 },
  cartItemInfo: { flex: 1, minWidth: 0 },
  cartItemName: {
    fontSize: 13, fontWeight: 600, color: "#1c1b18",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  cartItemQty: { fontSize: 11, color: "#9e9b94", marginTop: 2 },
  cartItemPrice: { fontSize: 13, fontWeight: 700, color: "#1c1b18", flexShrink: 0 },

  /* bill */
  bill: { borderTop: "1px solid #eeece6", paddingTop: 14, marginBottom: 4 },
  billRow: {
    display: "flex", justifyContent: "space-between",
    padding: "5px 0", fontSize: 13,
  },
  billLabel: { color: "#6e6b63" },
  billVal: { fontWeight: 500 },
  totalRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    borderTop: "1.5px solid #1c1b18",
    paddingTop: 14, marginTop: 8,
    fontSize: 16, fontWeight: 800, color: "#1c1b18",
  },
  totalAmount: { fontSize: 20, letterSpacing: "-0.5px" },

  /* trust */
  trustGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 8, marginTop: 18,
  },
  trustItem: {
    display: "flex", alignItems: "center", gap: 7,
    padding: "8px 10px",
    background: "#fafaf8",
    border: "1px solid #eeece6",
    borderRadius: 10,
    fontSize: 12, fontWeight: 500, color: "#3d3a34",
  },
  trustIcon: { fontSize: 15 },

  /* loader / empty */
  loaderPage: {
    minHeight: "100vh",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "#f5f4f0", gap: 16,
    fontFamily: "'Sora', sans-serif",
  },
  loaderRing: {
    width: 44, height: 44,
    border: "3px solid #e4e0d8",
    borderTopColor: "#2d6af6",
    borderRadius: "50%",
    animation: "cospin 0.9s linear infinite",
  },
  loaderText: { fontSize: 14, color: "#9e9b94", fontWeight: 500 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: "#1c1b18" },
  shopBtn: {
    padding: "12px 24px",
    borderRadius: 12, border: "none",
    background: "#1c1b18", color: "#fff",
    fontWeight: 700, fontSize: 15,
    cursor: "pointer", fontFamily: "'Sora', sans-serif",
  },
};

export default Checkout;