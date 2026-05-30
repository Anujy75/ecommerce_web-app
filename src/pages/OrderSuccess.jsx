import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";


const S = {
  /* page */
  page: {
    minHeight: "100vh",
    background: "#f5f4f0",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "48px 16px 64px",
  },

  /* card shell */
  card: {
    width: "100%",
    maxWidth: "660px",
    background: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #e8e6e0",
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },

  /* ── header ── */
  header: {
    background: "#0acc57",
    borderBottom: "1px solid #d1f0de",
    padding: "36px 32px 28px",
    textAlign: "center",
  },
  iconRing: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#ffffff",
    border: "1px solid #b6e8c8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  checkSvg: { width: 22, height: 22, stroke: "#1a9c4d", strokeWidth: 2.5, fill: "none" },
  h1: {
    fontSize: 22,
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: "-0.4px",
    marginBottom: 4,
  },
  headerSub: { fontSize: 13, color: "#4b7a5e", marginBottom: 18 },
  orderPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#ffffff",
    border: "1px solid #b6e8c8",
    borderRadius: 100,
    padding: "5px 16px",
    fontSize: 12,
  },
  pillLabel: { color: "#6b9f83" },
  pillVal: {
    fontFamily: "'DM Mono', monospace",
    fontWeight: 500,
    color: "#166534",
    letterSpacing: "0.04em",
  },

  /* ── body ── */
  body: { padding: "24px 28px 28px" },

  /* ── stat grid ── */
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    marginBottom: 24,
  },
  statCell: {
    background: "#f9f8f6",
    border: "1px solid #eeece6",
    borderRadius: 12,
    padding: "12px 10px",
    textAlign: "center",
  },
  statIcon: { fontSize: 18, marginBottom: 6, display: "block" },
  statLabel: { fontSize: 11, color: "#9e9b94", marginBottom: 3, display: "block" },
  statVal: { fontSize: 13, fontWeight: 600, color: "#1c1b18" },
  statValSuccess: { fontSize: 13, fontWeight: 600, color: "#1a9c4d" },
  statValWarn: { fontSize: 13, fontWeight: 600, color: "#c27c0e" },
  statValAccent: { fontSize: 13, fontWeight: 600, color: "#2563eb" },

  /* ── stepper ── */
  stepperWrap: { marginBottom: 24 },
  secLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#9e9b94",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  stepper: { display: "flex", alignItems: "center" },
  stepCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 },
  stepDot: {
    width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 600,
    background: "#f2f0eb", border: "1px solid #e2e0d8",
    color: "#b0aca2", position: "relative", zIndex: 1,
  },
  stepDotDone: {
    width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#07d322", border: "1px solid #b6e8c8",
    color: "#1a9c4d", position: "relative", zIndex: 1,
  },
  stepDotActive: {
    width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 600,
    background: "#eff6ff", border: "1px solid #93c5fd",
    color: "#2563eb", position: "relative", zIndex: 1,
  },
  stepLabel: { fontSize: 10, color: "#b0aca2", textAlign: "center" },
  stepLabelDone: { fontSize: 10, color: "#1a9c4d", textAlign: "center" },
  stepLabelActive: { fontSize: 10, color: "#2563eb", fontWeight: 600, textAlign: "center" },
  stepLine: { flex: 1, height: 1, background: "#e2e0d8", marginTop: -18, zIndex: 0 },
  stepLineDone: { flex: 1, height: 1, background: "#31e005", marginTop: -18, zIndex: 0 },

  /* ── divider ── */
  divider: { border: "none", borderTop: "1px solid #eeece6", margin: "20px 0" },

  /* ── items ── */
  itemRow: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "11px 0",
    borderBottom: "1px solid #f2f0eb",
  },
  itemIconBox: {
    width: 36, height: 36, flexShrink: 0,
    borderRadius: 10,
    background: "#f9f8f6",
    border: "1px solid #eeece6",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18,
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 14, fontWeight: 500, color: "#1c1b18", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  itemQty: { fontSize: 12, color: "#9e9b94", marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: 600, color: "#1c1b18", flexShrink: 0 },

  /* ── price breakdown ── */
  priceRow: {
    display: "flex", justifyContent: "space-between",
    padding: "7px 0", fontSize: 13,
  },
  prLabel: { color: "#6e6b63" },
  prVal: { color: "#1c1b18", fontWeight: 500 },
  prFree: { color: "#16b811", fontWeight: 500 },
  totalBox: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 16px",
    background: "#f9f8f6",
    border: "1px solid #eeece6",
    borderRadius: 12,
    marginTop: 8,
  },
  totalLabel: { fontSize: 15, fontWeight: 600, color: "#1c1b18" },
  totalVal: { fontSize: 18, fontWeight: 700, color: "#2563eb", letterSpacing: "-0.5px" },

  /* ── buttons ── */
  btnGroup: { display: "flex", gap: 10, marginTop: 24 },
  btnPrimary: {
    flex: 1, padding: "11px 16px",
    borderRadius: 12, fontSize: 14, fontWeight: 600,
    cursor: "pointer", border: "1px solid #93c5fd",
    background: "#eff6ff", color: "#1d4ed8",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    transition: "all 0.15s",
  },
  btnSecondary: {
    flex: 1, padding: "11px 16px",
    borderRadius: 12, fontSize: 14, fontWeight: 600,
    cursor: "pointer", border: "1px solid #e2e0d8",
    background: "#f9f8f6", color: "#3d3a34",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    transition: "all 0.15s",
  },
  btnInvoice: {
    padding: "11px 16px",
    borderRadius: 12, fontSize: 14, fontWeight: 600,
    cursor: "pointer", border: "1px solid #e2e0d8",
    background: "#f9f8f6", color: "#3d3a34",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    transition: "all 0.15s",
  },

  /* ── trust bar ── */
  trustBar: {
    display: "flex", justifyContent: "center",
    borderTop: "1px solid #eeece6",
    marginTop: 24, paddingTop: 20,
    flexWrap: "wrap",
  },
  trustItem: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 12, color: "#9e9b94",
    padding: "4px 16px",
    borderRight: "1px solid #eeece6",
  },
  trustItemLast: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 12, color: "#9e9b94",
    padding: "4px 16px",
  },

  /* ── loading / error states ── */
  centerPage: {
    minHeight: "100vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#f5f4f0",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  spinnerBox: { textAlign: "center" },
  spinnerRing: {
    width: 40, height: 40,
    border: "2px solid #e2e0d8",
    borderTopColor: "#1a9c4d",
    borderRadius: "50%",
    animation: "ospin 0.9s linear infinite",
    margin: "0 auto 14px",
  },
  spinnerText: { fontSize: 13, color: "#9e9b94" },

  notFoundCard: {
    background: "#fff",
    border: "1px solid #e8e6e0",
    borderRadius: 20,
    padding: "40px 36px",
    textAlign: "center",
    maxWidth: 380,
  },
  notFoundIcon: { fontSize: 42, marginBottom: 16 },
  notFoundH2: { fontSize: 18, fontWeight: 600, color: "#1c1b18", marginBottom: 8 },
  notFoundP: { fontSize: 13, color: "#9e9b94", marginBottom: 24 },
};

/* ─── helpers ─────────────────────────────── */
const formatDate = (d) => {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmt = (n) => (n ?? 0).toLocaleString("en-IN");

const STEPS = ["Placed", "Processing", "Shipped", "Delivered"];
const STATUS_STEP = { 
  PENDING: 0, 
  CONFIRMED: 1, 
  PROCESSING: 1, 
  SHIPPED: 2, 
  DELIVERED: 3 
};

/* ─── icons (inline SVG, no deps) ─────────── */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" style={S.checkSvg}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ITEM_ICONS = {
  laptop: "💻", phone: "📱", headphone: "🎧", default: "📦",
};

const guessIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("laptop") || n.includes("macbook") || n.includes("ideapad")) return ITEM_ICONS.laptop;
  if (n.includes("phone") || n.includes("mobile") || n.includes("case")) return ITEM_ICONS.phone;
  if (n.includes("headphone") || n.includes("earphone") || n.includes("sony") || n.includes("wh")) return ITEM_ICONS.headphone;
  return ITEM_ICONS.default;
};

/* ─── component ───────────────────────────── */
const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const token =
    localStorage.getItem("customerToken") || localStorage.getItem("adminToken");

  // ✅ Fetch order details function
  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(response.data);
      
      // ✅ If order is still PENDING and it's a Razorpay order, refresh after 2 seconds (max 3 times)
      if (response.data.orderStatus === "PENDING" && 
          response.data.paymentMethod === "RAZORPAY" && 
          refreshCount < 3) {
        setTimeout(() => {
          setRefreshCount(prev => prev + 1);
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  }, [orderId, token, refreshCount]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  /* inject keyframe for spinner */
  useEffect(() => {
    const id = "os-kf";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `
        @keyframes ospin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
      `;
      document.head.appendChild(s);
    }
  }, []);

  /* ── active step ── */
  const activeStep = order ? (STATUS_STEP[order.orderStatus?.toUpperCase()] ?? 0) : 0;

  /* ── loading ── */
  if (loading) {
    return (
      <div style={S.centerPage}>
        <div style={S.spinnerBox}>
          <div style={S.spinnerRing} />
          <p style={S.spinnerText}>Loading your order…</p>
        </div>
      </div>
    );
  }

  /* ── not found ── */
  if (!order) {
    return (
      <div style={S.centerPage}>
        <div style={S.notFoundCard}>
          <div style={S.notFoundIcon}>🔍</div>
          <h2 style={S.notFoundH2}>Order not found</h2>
          <p style={S.notFoundP}>We couldn't locate your order details.</p>
          <button
            style={{ ...S.btnPrimary, flex: "none" }}
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ✅ Determine status display (show CONFIRMED if paymentMethod is RAZORPAY and status is PENDING - will update)
  const displayOrderStatus = (order.orderStatus === "PENDING" && order.paymentMethod === "RAZORPAY" && refreshCount > 0) 
    ? "CONFIRMED" 
    : order.orderStatus;
  
  const displayPaymentStatus = (order.paymentStatus === "PENDING" && order.paymentMethod === "RAZORPAY" && refreshCount > 0)
    ? "PAID"
    : order.paymentStatus;

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div style={S.iconRing}><CheckIcon /></div>
          <h1 style={S.h1}>Order confirmed!</h1>
          <p style={S.headerSub}>Thank you — we've received your order and it's being processed.</p>
          <div style={S.orderPill}>
            <span style={S.pillLabel}>Order</span>
            <span style={S.pillVal}>{order.orderId}</span>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={S.body}>

          {/* Stat grid */}
          <div style={S.statGrid}>
            <div style={S.statCell}>
              <span style={S.statIcon}>📅</span>
              <span style={S.statLabel}>Order date</span>
              <span style={S.statVal}>{formatDate(order.createdAt)}</span>
            </div>
            <div style={S.statCell}>
              <span style={S.statIcon}>📦</span>
              <span style={S.statLabel}>Status</span>
              <span style={S.statValSuccess}>{displayOrderStatus}</span>
            </div>
            <div style={S.statCell}>
              <span style={S.statIcon}>💳</span>
              <span style={S.statLabel}>Payment</span>
              <span style={displayPaymentStatus === "PAID" ? S.statValSuccess : S.statValWarn}>
                {displayPaymentStatus}
              </span>
            </div>
            <div style={S.statCell}>
              <span style={S.statIcon}>🧾</span>
              <span style={S.statLabel}>Total</span>
              <span style={S.statValAccent}>₹{fmt(order.grandTotal)}</span>
            </div>
          </div>

          {/* Refresh indicator for Razorpay orders */}
          {order.paymentMethod === "RAZORPAY" && order.orderStatus === "PENDING" && refreshCount < 3 && (
            <div style={{ textAlign: "center", marginBottom: 16, fontSize: 12, color: "#c27c0e" }}>
              ⏳ Verifying payment... please wait
            </div>
          )}

          {/* Delivery stepper */}
          <div style={S.stepperWrap}>
            <div style={S.secLabel}>📍 Delivery progress</div>
            <div style={S.stepper}>
              {STEPS.map((step, i) => {
                const isDone = i < activeStep;
                const isActive = i === activeStep;
                return (
                  <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <div style={S.stepCol}>
                      <div style={isDone ? S.stepDotDone : isActive ? S.stepDotActive : S.stepDot}>
                        {isDone ? <CheckIcon /> : i + 1}
                      </div>
                      <span style={isDone ? S.stepLabelDone : isActive ? S.stepLabelActive : S.stepLabel}>
                        {step}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={isDone ? S.stepLineDone : S.stepLine} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <hr style={S.divider} />

          {/* Items */}
          {order.items?.length > 0 && (
            <>
              <div style={S.secLabel}>🛍 Items ordered</div>
              <div>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ ...S.itemRow, borderBottom: idx === order.items.length - 1 ? "none" : "1px solid #f2f0eb" }}>
                    <div style={S.itemIconBox}>{guessIcon(item.product?.name)}</div>
                    <div style={S.itemInfo}>
                      <div style={S.itemName}>{item.product?.name ?? "Product"}</div>
                      <div style={S.itemQty}>Qty: {item.quantity}</div>
                    </div>
                    <div style={S.itemPrice}>₹{fmt(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
              <hr style={S.divider} />
            </>
          )}

          {/* Price breakdown */}
          <div style={S.secLabel}>🧮 Price breakdown</div>
          <div>
            <div style={S.priceRow}>
              <span style={S.prLabel}>Subtotal</span>
              <span style={S.prVal}>₹{fmt(order.totalAmount)}</span>
            </div>
            <div style={S.priceRow}>
              <span style={S.prLabel}>GST (18%)</span>
              <span style={S.prVal}>₹{fmt(order.taxAmount)}</span>
            </div>
            <div style={S.priceRow}>
              <span style={S.prLabel}>Shipping</span>
              <span style={order.shippingCharges === 0 ? S.prFree : S.prVal}>
                {order.shippingCharges === 0 ? "✓ Free" : `₹${order.shippingCharges}`}
              </span>
            </div>
          </div>
          <div style={S.totalBox}>
            <span style={S.totalLabel}>Grand total</span>
            <span style={S.totalVal}>₹{fmt(order.grandTotal)}</span>
          </div>

          {/* Buttons */}
          <div style={S.btnGroup}>
            <button
              style={{ ...S.btnPrimary, opacity: hovered === "shop" ? 0.85 : 1 }}
              onMouseEnter={() => setHovered("shop")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate("/products")}
            >
              🛒 Continue Shopping
            </button>
            <button
              style={{ ...S.btnSecondary, opacity: hovered === "orders" ? 0.85 : 1 }}
              onMouseEnter={() => setHovered("orders")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate("/orders")}
            >
              📋 My Orders
            </button>
            <button
              style={{ ...S.btnInvoice, opacity: hovered === "invoice" ? 0.85 : 1 }}
              onMouseEnter={() => setHovered("invoice")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => window.print()}
              title="Download invoice"
            >
              ⬇ Invoice
            </button>
          </div>

          {/* Trust bar */}
          <div style={S.trustBar}>
            {[
              ["🛡", "Secure payment"],
              ["🚚", "Free shipping"],
              ["⚡", "Fast delivery"],
              ["↩", "Easy returns"],
            ].map(([icon, label], i, arr) => (
              <div key={label} style={i === arr.length - 1 ? S.trustItemLast : S.trustItem}>
                <span>{icon}</span> {label}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;