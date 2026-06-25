import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Delivered:  { label: "Delivered",  cls: "badge-success", icon: "ti-check" },
  Processing: { label: "Processing", cls: "badge-warning", icon: "ti-clock" },
  Shipped:    { label: "Shipped",    cls: "badge-info",    icon: "ti-truck-delivery" },
};

const ORDER_STEPS = ["Placed", "Confirmed", "Packed", "Shipped", "Delivered"];
const ORDER_STEP_ICONS = [
  "ti-check", "ti-clipboard-check", "ti-package",
  "ti-truck-delivery", "ti-home",
];

// ─── Inline styles (colorful & attractive) ────────────────────────────────────
const s = {
  page: {
    padding: "32px",
    background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  inner: { maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" },

  // Top bar
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" },
  h1: { fontSize: "22px", fontWeight: "700", background: "linear-gradient(135deg, #1E293B, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "3px" },
  subtitle: { fontSize: "13px", color: "#64748B" },
  topActions: { display: "flex", gap: "8px" },
  btn: {
    display: "flex", alignItems: "center", gap: "6px",
    background: "white", border: "1px solid #E2E8F0",
    borderRadius: "8px", padding: "8px 16px",
    fontSize: "13px", color: "#475569", cursor: "pointer",
    transition: "all 0.2s",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
    color: "white", border: "none", borderRadius: "8px",
    padding: "8px 16px", fontSize: "13px", fontWeight: "500",
    cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
    transition: "all 0.2s",
  },

  // Profile strip
  profileStrip: {
    background: "white", border: "1px solid #E2E8F0",
    borderRadius: "16px", padding: "20px 24px",
    display: "flex", alignItems: "center",
    justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  },
  profileLeft: { display: "flex", alignItems: "center", gap: "16px" },
  avatar: {
    width: "52px", height: "52px", borderRadius: "50%",
    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
    color: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "16px", fontWeight: "600", flexShrink: 0,
  },
  profileName: { fontSize: "16px", fontWeight: "700", color: "#1E293B", marginBottom: "3px" },
  profileEmail: { fontSize: "13px", color: "#64748B" },
  profileRight: { display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" },
  profileMeta: { textAlign: "center" },
  profileMetaVal: { fontSize: "14px", fontWeight: "700", color: "#1E293B", marginBottom: "2px" },
  profileMetaLbl: { fontSize: "11px", color: "#64748B" },
  divider: { width: "1px", height: "32px", background: "#E2E8F0" },
  memberBadge: {
    background: "linear-gradient(135deg, #E0E7FF, #EDE9FE)",
    color: "#4F46E5", borderRadius: "99px", padding: "5px 14px",
    fontSize: "12px", fontWeight: "500",
    display: "flex", alignItems: "center", gap: "5px",
  },

  // Stats
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" },
  statCard: {
    background: "white", border: "1px solid #E2E8F0",
    borderRadius: "16px", padding: "18px 20px",
    cursor: "pointer", transition: "all 0.2s",
  },
  statIconWrap: {
    width: "36px", height: "36px", borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "14px",
  },
  statVal: { fontSize: "22px", fontWeight: "700", color: "#1E293B", marginBottom: "3px" },
  statLbl: { fontSize: "12px", color: "#64748B" },
  statTrend: { fontSize: "11px", fontWeight: "500", marginTop: "4px" },

  // Two column
  twoCol: { display: "grid", gridTemplateColumns: "3fr 2fr", gap: "20px" },

  // Card base
  card: {
    background: "white", border: "1px solid #E2E8F0",
    borderRadius: "16px", padding: "20px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: "16px",
  },
  cardTitle: { fontSize: "15px", fontWeight: "600", color: "#1E293B", display: "flex", alignItems: "center", gap: "8px" },
  cardLink: { fontSize: "12px", color: "#3B82F6", cursor: "pointer", background: "none", border: "none", display: "flex", alignItems: "center", gap: "3px" },

  // Orders table
  orderColHeader: { fontSize: "11px", color: "#94A3B8", padding: "0 0 10px" },
  orderRow: {
    display: "flex", alignItems: "center",
    borderBottom: "1px solid #F1F5F9", padding: "12px 0",
  },
  orderId: { fontSize: "13px", fontWeight: "600", color: "#3B82F6", flex: "0 0 90px" },
  orderDate: { fontSize: "12px", color: "#64748B", flex: 1 },
  orderItems: { fontSize: "12px", color: "#64748B", flex: "0 0 50px", textAlign: "center" },
  orderAmt: { fontSize: "13px", fontWeight: "600", color: "#1E293B", flex: "0 0 80px", textAlign: "right" },
  orderStatusCol: { flex: "0 0 110px", textAlign: "right" },

  // Badge
  badge: { borderRadius: "99px", padding: "3px 10px", fontSize: "11px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" },
  badgeSuccess: { background: "#D1FAE5", color: "#059669" },
  badgeWarning: { background: "#FEF3C7", color: "#D97706" },
  badgeInfo: { background: "#DBEAFE", color: "#2563EB" },

  // Order tracker
  trackerWrap: { marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #F1F5F9" },
  trackerLabel: { fontSize: "12px", color: "#64748B", marginBottom: "12px", display: "flex", justifyContent: "space-between" },
  trackerRow: { display: "flex", alignItems: "center" },
  trackerStep: { flex: 1, textAlign: "center" },
  trackerCircle: {
    width: "24px", height: "24px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 5px", fontSize: "12px",
  },
  trackerStepLbl: { fontSize: "10px", color: "#94A3B8" },
  trackerLine: { flex: 1, height: "2px", marginBottom: "20px" },

  // Wishlist
  wishlistItem: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "10px 0", borderBottom: "1px solid #F1F5F9",
    cursor: "pointer",
  },
  wishlistImg: {
    width: "44px", height: "44px", background: "linear-gradient(135deg, #F8FAFC, #F1F5F9)",
    border: "1px solid #E2E8F0", borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, fontSize: "18px", color: "#64748B",
  },
  wishlistName: { fontSize: "13px", fontWeight: "600", color: "#1E293B", marginBottom: "2px" },
  wishlistCat: { fontSize: "11px", color: "#64748B" },
  wishlistPrice: { marginLeft: "auto", fontSize: "13px", fontWeight: "600", color: "#1E293B", textAlign: "right" },
  wishlistDisc: { fontSize: "11px", color: "#059669", display: "block" },
  wishlistDiscDown: { fontSize: "11px", color: "#DC2626", display: "block" },

  // Points card
  pointsCard: { background: "linear-gradient(135deg, #1E293B, #0F172A)", border: "none", borderRadius: "16px", padding: "16px 20px", color: "white" },
  pointsHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" },
  pointsTitle: { fontSize: "13px", fontWeight: "500", color: "#94A3B8" },
  pointsVal: { fontSize: "20px", fontWeight: "700", color: "#F59E0B" },
  progressBar: { height: "4px", background: "#334155", borderRadius: "99px", overflow: "hidden", marginBottom: "6px" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #F59E0B, #EF4444)", borderRadius: "99px" },
  progressLabels: { display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94A3B8" },

  // Bottom row
  bottomRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },

  // Quick actions
  actionsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "4px" },
  actionBtn: {
    background: "#F8FAFC", border: "1px solid #E2E8F0",
    borderRadius: "10px", padding: "12px 16px",
    fontSize: "13px", color: "#334155", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "10px",
    transition: "all 0.2s",
  },

  // Account summary
  summaryRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 0", borderBottom: "1px solid #F1F5F9",
  },
  summaryKey: { fontSize: "13px", color: "#64748B", display: "flex", alignItems: "center", gap: "8px" },
  summaryVal: { fontSize: "13px", color: "#1E293B", fontWeight: "500" },
  summaryMuted: { fontSize: "13px", color: "#94A3B8", display: "flex", alignItems: "center", gap: "8px" },
  addLink: { fontSize: "12px", color: "#3B82F6", cursor: "pointer", marginLeft: "4px" },

  // Loading
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "16px" },
  spinner: { width: "32px", height: "32px", border: "3px solid #E2E8F0", borderTop: "3px solid #3B82F6", borderRadius: "50%" },
  loadingText: { fontSize: "14px", color: "#64748B" },
};

// ─── Helper: initials from name ───────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U";

// ─── Component ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await API.get("/user/me");
        setUser(userRes.data);

        const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setWishlist(savedWishlist.slice(0, 3));

        setRecentOrders([
          { id: "#ORD001", date: "2024-05-01", total: 2499, status: "Delivered",  items: 2, progress: 5 },
          { id: "#ORD002", date: "2024-04-15", total: 899,  status: "Delivered",  items: 1, progress: 5 },
          { id: "#ORD003", date: "2024-04-05", total: 5499, status: "Processing", items: 3, progress: 2 },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={s.loadingWrap}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={s.spinner}
        />
        <p style={s.loadingText}>Loading your dashboard…</p>
      </div>
    );
  }

  const totalSpent = recentOrders.reduce((acc, o) => acc + o.total, 0);
  const delivered  = recentOrders.filter((o) => o.status === "Delivered").length;
  const trackedOrder = recentOrders.find((o) => o.status === "Processing") || recentOrders[0];

  const stats = [
    { label: "Total orders",   value: recentOrders.length, trend: "📈 +22% this month",  iconBg: "#E0E7FF", iconColor: "#4F46E5", icon: "ti-package" },
    { label: "Delivered",      value: delivered,            trend: "✅ On time",          iconBg: "#D1FAE5", iconColor: "#059669", icon: "ti-check" },
    { label: "Wishlist items", value: wishlist.length || 5, trend: "🔥 2 on sale now",   iconBg: "#FCE7F3", iconColor: "#DB2777", icon: "ti-heart" },
    { label: "Reward points",  value: 240,                  trend: "💰 Worth ₹120",      iconBg: "#FEF3C7", iconColor: "#D97706", icon: "ti-coin" },
    { label: "Profile",        value: "Settings",           trend: "⚙️ Manage →",        iconBg: "#E0E7FF", iconColor: "#4F46E5", icon: "ti-settings", onClick: () => navigate("/profile") },
  ];

  const getBadgeStyle = (status) => ({
    ...s.badge,
    ...(status === "Delivered"  ? s.badgeSuccess :
        status === "Processing" ? s.badgeWarning  : s.badgeInfo),
  });

  const WISHLIST_ITEMS = wishlist.length
    ? wishlist
    : [
        { id: 1, name: "Wireless headphones", category: "Electronics", price: 4999, disc: "🔥 Save 37%", discType: "good", icon: "ti-headphones" },
        { id: 2, name: "Smart watch",          category: "Electronics", price: 12999, disc: "⚠️ Price up", discType: "bad", icon: "ti-watch" },
        { id: 3, name: "Linen shirt",          category: "Fashion",     price: 1499, disc: "🎉 Save 40%", discType: "good", icon: "ti-shirt" },
      ];

  return (
    <div style={s.page}>
      <div style={s.inner}>

        {/* ── Top bar ── */}
        <div style={s.topBar}>
          <div>
            <h1 style={s.h1}>✨ My Dashboard</h1>
            <p style={s.subtitle}>Manage your account, track orders, and more</p>
          </div>
          <div style={s.topActions}>
            <button style={s.btn} onClick={() => navigate("/notifications")}>
              <i className="ti ti-bell" style={{ fontSize: "15px" }} aria-hidden="true" />
              Notifications
            </button>
            <button style={s.btnPrimary} onClick={() => navigate("/products")}>
              <i className="ti ti-shopping-cart" style={{ fontSize: "15px" }} aria-hidden="true" />
              Continue shopping
            </button>
          </div>
        </div>

        {/* ── Profile strip ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={s.profileStrip}>
          <div style={s.profileLeft}>
            <div style={s.avatar}>{getInitials(user?.name)}</div>
            <div>
              <div style={s.profileName}>{user?.name || "Customer"}</div>
              <div style={s.profileEmail}>{user?.email}</div>
            </div>
          </div>
          <div style={s.profileRight}>
            <div style={s.profileMeta}>
              <div style={s.profileMetaVal}>{recentOrders.length}</div>
              <div style={s.profileMetaLbl}>Orders</div>
            </div>
            <div style={s.divider} />
            <div style={s.profileMeta}>
              <div style={s.profileMetaVal}>₹{totalSpent.toLocaleString("en-IN")}</div>
              <div style={s.profileMetaLbl}>Total spent</div>
            </div>
            <div style={s.divider} />
            <div style={s.profileMeta}>
              <div style={s.profileMetaVal}>{wishlist.length || 5}</div>
              <div style={s.profileMetaLbl}>Wishlist</div>
            </div>
            <div style={s.divider} />
            <span style={s.memberBadge}>
              <i className="ti ti-shield-check" style={{ fontSize: "12px" }} aria-hidden="true" />
              Member since{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                : "Jan 2024"}
            </span>
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <div style={s.statsRow}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={s.statCard}
              onClick={stat.onClick}
            >
              <div style={{ ...s.statIconWrap, background: stat.iconBg, color: stat.iconColor }}>
                <i className={`ti ${stat.icon}`} style={{ fontSize: "18px" }} aria-hidden="true" />
              </div>
              <div style={s.statVal}>{stat.value}</div>
              <div style={s.statLbl}>{stat.label}</div>
              <div style={{ ...s.statTrend, color: stat.iconColor }}>
                {stat.trend}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Two column ── */}
        <div style={s.twoCol}>

          {/* Orders card */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>
                <i className="ti ti-list-check" style={{ fontSize: "16px", color: "#3B82F6" }} aria-hidden="true" />
                Recent orders
              </span>
              <button style={s.cardLink} onClick={() => navigate("/orders")}>
                View all <i className="ti ti-arrow-right" style={{ fontSize: "12px" }} aria-hidden="true" />
              </button>
            </div>

            {/* Table header */}
            <div style={{ display: "flex", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
              <span style={{ ...s.orderColHeader, flex: "0 0 90px" }}>Order ID</span>
              <span style={{ ...s.orderColHeader, flex: 1 }}>Date</span>
              <span style={{ ...s.orderColHeader, flex: "0 0 50px", textAlign: "center" }}>Items</span>
              <span style={{ ...s.orderColHeader, flex: "0 0 80px", textAlign: "right" }}>Amount</span>
              <span style={{ ...s.orderColHeader, flex: "0 0 110px", textAlign: "right" }}>Status</span>
            </div>

            {recentOrders.map((order, idx) => {
              const cfg = STATUS_CONFIG[order.status] || {};
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  style={{ ...s.orderRow, ...(idx === recentOrders.length - 1 ? { borderBottom: "none" } : {}) }}
                >
                  <span style={s.orderId}>{order.id}</span>
                  <span style={s.orderDate}>{new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span style={s.orderItems}>{order.items}</span>
                  <span style={s.orderAmt}>₹{order.total.toLocaleString("en-IN")}</span>
                  <span style={s.orderStatusCol}>
                    <span style={getBadgeStyle(order.status)}>
                      <i className={`ti ${cfg.icon}`} style={{ fontSize: "10px" }} aria-hidden="true" />
                      {cfg.label}
                    </span>
                  </span>
                </motion.div>
              );
            })}

            {/* Order tracker */}
            {trackedOrder && (
              <div style={s.trackerWrap}>
                <div style={s.trackerLabel}>
                  <span>🚚 Tracking: {trackedOrder.id}</span>
                  <span style={{ color: "#3B82F6", fontWeight: "600" }}>{trackedOrder.status}</span>
                </div>
                <div style={s.trackerRow}>
                  {ORDER_STEPS.map((step, i) => {
                    const done = i < trackedOrder.progress;
                    const active = i === trackedOrder.progress - 1;
                    return (
                      <div key={step} style={{ display: "flex", alignItems: "center", flex: i < ORDER_STEPS.length - 1 ? "1 1 0" : "0 0 auto" }}>
                        <div style={s.trackerStep}>
                          <div style={{
                            ...s.trackerCircle,
                            background: done ? "#3B82F6" : "white",
                            border: done ? "none" : "1px solid #E2E8F0",
                            boxShadow: done ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
                          }}>
                            <i
                              className={`ti ${ORDER_STEP_ICONS[i]}`}
                              style={{ fontSize: "11px", color: done ? "white" : "#94A3B8" }}
                              aria-hidden="true"
                            />
                          </div>
                          <div style={{ ...s.trackerStepLbl, color: done ? "#3B82F6" : "#94A3B8", fontWeight: active ? "600" : "400" }}>
                            {step}
                          </div>
                        </div>
                        {i < ORDER_STEPS.length - 1 && (
                          <div style={{ ...s.trackerLine, background: i < trackedOrder.progress - 1 ? "#3B82F6" : "#E2E8F0" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right column: wishlist + points */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>
                  <i className="ti ti-heart" style={{ fontSize: "16px", color: "#DB2777" }} aria-hidden="true" />
                  Wishlist
                </span>
                <button style={s.cardLink} onClick={() => navigate("/wishlist")}>
                  View all <i className="ti ti-arrow-right" style={{ fontSize: "12px" }} aria-hidden="true" />
                </button>
              </div>
              {WISHLIST_ITEMS.map((item, idx) => (
                <div
                  key={item.id}
                  style={{ ...s.wishlistItem, ...(idx === WISHLIST_ITEMS.length - 1 ? { borderBottom: "none", paddingBottom: 0 } : {}) }}
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div style={s.wishlistImg}>
                    <i className={`ti ${item.icon || "ti-tag"}`} aria-hidden="true" />
                  </div>
                  <div>
                    <div style={s.wishlistName}>{item.name}</div>
                    <div style={s.wishlistCat}>{item.category}</div>
                  </div>
                  <div style={s.wishlistPrice}>
                    ₹{item.price.toLocaleString("en-IN")}
                    <span style={item.discType === "bad" ? s.wishlistDiscDown : s.wishlistDisc}>
                      {item.disc}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Reward points */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={s.pointsCard}>
              <div style={s.pointsHeader}>
                <span style={s.pointsTitle}>⭐ Reward points</span>
                <span style={s.pointsVal}>240 pts</span>
              </div>
              <div style={s.progressBar}>
                <div style={{ ...s.progressFill, width: "48%" }} />
              </div>
              <div style={s.progressLabels}>
                <span>0</span>
                <span>🎯 260 pts to next tier</span>
                <span>500</span>
              </div>
              <button style={{ ...s.btnPrimary, width: "100%", justifyContent: "center", marginTop: "12px", fontSize: "12px" }}
                onClick={() => navigate("/rewards")}>
                Redeem points →
              </button>
            </motion.div>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div style={s.bottomRow}>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>
                <i className="ti ti-layout-grid" style={{ fontSize: "16px", color: "#8B5CF6" }} aria-hidden="true" />
                Quick actions
              </span>
            </div>
            <div style={s.actionsGrid}>
              {[
                { label: "🛍️ Shop products",  path: "/products" },
                { label: "✏️ Edit profile",   path: "/profile" },
                { label: "🛒 View cart",      path: "/cart" },
                { label: "🚚 Track orders",   path: "/orders" },
                { label: "⭐ My reviews",     path: "/reviews" },
                { label: "🎧 Get support",    path: "/support" },
              ].map((a) => (
                <button key={a.label} style={s.actionBtn} onClick={() => navigate(a.path)}>
                  {a.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Account details */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>
                <i className="ti ti-user" style={{ fontSize: "16px", color: "#3B82F6" }} aria-hidden="true" />
                Account details
              </span>
              <button style={s.cardLink} onClick={() => navigate("/profile")}>
                Edit <i className="ti ti-edit" style={{ fontSize: "12px" }} aria-hidden="true" />
              </button>
            </div>

            {[
              { icon: "ti-mail",     label: "Email",    value: user?.email,   required: true },
              { icon: "ti-phone",    label: "Phone",    value: user?.phone,   required: false },
              { icon: "ti-map-pin",  label: "Address",  value: user?.address, required: false },
              { icon: "ti-lock",     label: "Password", value: "••••••••",    required: true },
              { icon: "ti-calendar", label: "Member since",
                value: user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
                  : "January 2024",
                required: true },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ ...s.summaryRow, ...(i === arr.length - 1 ? { borderBottom: "none" } : {}) }}>
                <span style={s.summaryKey}>
                  <i className={`ti ${row.icon}`} style={{ fontSize: "15px" }} aria-hidden="true" />
                  {row.label}
                </span>
                {row.value
                  ? <span style={s.summaryVal}>{row.value}</span>
                  : (
                    <span style={s.summaryMuted}>
                      Not set
                      <span style={s.addLink} onClick={() => navigate("/profile")}>Add</span>
                    </span>
                  )}
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;




