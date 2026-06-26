import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ─────────────────────────────────────────────
   INJECT FONTS + KEYFRAMES
───────────────────────────────────────────────*/
(() => {
  const id = "ord-styles";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    @keyframes ordspin { to { transform: rotate(360deg); } }
    @keyframes ordslide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes ordpop { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
    body { margin:0; padding:0; }
    input::placeholder { color:#a09c93; font-family:'Sora',sans-serif; }
    @media(max-width:700px){
      .ord-stats { grid-template-columns: repeat(2,1fr) !important; }
      .ord-filters { flex-wrap: wrap !important; }
      .ord-row-right { gap: 10px !important; }
      .ord-header-row { flex-direction: column !important; align-items: flex-start !important; }
    }
  `;
  document.head.appendChild(s);
})();

/* ─────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────*/
const STATUS = {
  CONFIRMED:  { label: "Confirmed",  dot: "#1a9c4d", bg: "#f0faf4", border: "#b6e8c8", text: "#166534" },
  PENDING:    { label: "Pending",    dot: "#c27c0e", bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  SHIPPED:    { label: "Shipped",    dot: "#2563eb", bg: "#eff6ff", border: "#93c5fd", text: "#1e40af" },
  DELIVERED:  { label: "Delivered",  dot: "#0d9488", bg: "#f0fdfa", border: "#99f6e4", text: "#115e59" },
  CANCELLED:  { label: "Cancelled",  dot: "#dc2626", bg: "#fef2f2", border: "#fca5a5", text: "#991b1b" },
  DEFAULT:    { label: "Processing", dot: "#6e6b63", bg: "#f9f8f6", border: "#e4e0d8", text: "#3d3a34" },
};

const getStatus = (s) => STATUS[s] || STATUS.DEFAULT;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────*/
const fmt = (n) => (n ?? 0).toLocaleString("en-IN");

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const deliveryEst = (status, createdAt) => {
  if (status === "DELIVERED") return "Delivered ✓";
  if (status === "CANCELLED") return "Order cancelled";
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 5);
  return `Expected by ${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`;
};

/* ─────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────*/
const StatusBadge = ({ status }) => {
  const c = getStatus(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 100,
      background: c.bg, border: `1px solid ${c.border}`,
      fontSize: 12, fontWeight: 600, color: c.text,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
};

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────*/
const StatCard = ({ label, value, accent }) => (
  <div style={{ ...S.statCard, borderTop: `3px solid ${accent}` }}>
    <span style={S.statLabel}>{label}</span>
    <span style={{ ...S.statValue, color: accent }}>{value}</span>
  </div>
);

/* ─────────────────────────────────────────────
   ORDER CARD
───────────────────────────────────────────────*/
const OrderCard = ({ order, isExpanded, onToggle, onView }) => {
  const sc = getStatus(order.orderStatus);
  const stepMap = { PENDING: 0, CONFIRMED: 1, SHIPPED: 2, DELIVERED: 3, CANCELLED: -1 };
  const step = stepMap[order.orderStatus] ?? 0;
  const steps = ["Placed", "Confirmed", "Shipped", "Delivered"];

  return (
    <div style={{ ...S.orderCard, animation: "ordpop 0.25s ease" }}>

      {/* Card header row */}
      <div style={S.cardTop} onClick={onToggle}>
        {/* Left: icon + id + date */}
        <div style={S.cardLeft}>
          <div style={{ ...S.pkgBox, background: sc.bg, border: `1px solid ${sc.border}` }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={sc.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16v-2" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <div style={S.orderId}>
              <span style={S.orderHash}>#</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 500, color: "#1c1b18" }}>
                {order.orderId}
              </span>
            </div>
            <div style={S.orderMeta}>
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#a09c93" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {fmtDate(order.createdAt)}
            </div>
          </div>
        </div>

        {/* Right: total + status + chevron */}
        <div style={S.cardRight} className="ord-row-right">
          <div style={S.totalBlock}>
            <span style={S.totalLbl}>Grand Total</span>
            <span style={S.totalAmt}>₹{fmt(order.grandTotal)}</span>
          </div>
          <StatusBadge status={order.orderStatus} />
          <div style={{ ...S.chevron, transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#a09c93" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ ...S.expandBox, animation: "ordslide 0.2s ease" }}>

          {/* Progress stepper — hidden for cancelled */}
          {order.orderStatus !== "CANCELLED" && (
            <div style={S.stepper}>
              {steps.map((s, i) => {
                const done = i <= step;
                const active = i === step;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
                    <div style={S.stepUnit}>
                      <div style={{
                        ...S.stepDot,
                        background: done ? (active ? sc.dot : "#1a9c4d") : "#e4e0d8",
                        border: active ? `2px solid ${sc.dot}` : done ? "2px solid #1a9c4d" : "2px solid #e4e0d8",
                        boxShadow: active ? `0 0 0 3px ${sc.bg}` : "none",
                      }}>
                        {done && !active && (
                          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                        {active && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "block" }} />}
                      </div>
                      <span style={{ ...S.stepLbl, color: done ? (active ? sc.text : "#1a9c4d") : "#a09c93", fontWeight: active ? 600 : 400 }}>{s}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: i < step ? "#1a9c4d" : "#e4e0d8", margin: "0 4px", marginBottom: 18 }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Detail rows */}
          <div style={S.detailGrid}>
            <DetailCell label="Payment Status" value={order.paymentStatus} />
            <DetailCell label="Delivery Estimate" value={deliveryEst(order.orderStatus, order.createdAt)} />
            <DetailCell label="Items" value={`${order.items?.length ?? "—"} item${order.items?.length !== 1 ? "s" : ""}`} />
            <DetailCell label="Payment Method" value={order.paymentMethod ?? "—"} />
          </div>

          {/* Items preview */}
          {order.items?.length > 0 && (
            <div style={S.itemsRow}>
              {order.items.slice(0, 3).map((item, i) => (
                <div key={i} style={S.itemChip}>
                  <span style={S.itemDot}>·</span>
                  <span style={S.itemName}>{item.product?.name ?? "Product"}</span>
                  <span style={S.itemQty}>×{item.quantity}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <div style={S.moreChip}>+{order.items.length - 3} more</div>
              )}
            </div>
          )}

          {/* Action */}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button style={S.viewBtn} onClick={onView}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View Full Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailCell = ({ label, value }) => (
  <div style={S.detailCell}>
    <span style={S.detailLabel}>{label}</span>
    <span style={S.detailValue}>{value}</span>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────*/
const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const token = localStorage.getItem("customerToken") || localStorage.getItem("adminToken");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/orders/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    let f = [...orders];
    if (search) f = f.filter(o => o.orderId.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "ALL") f = f.filter(o => o.orderStatus === statusFilter);
    setFiltered(f);
  }, [search, statusFilter, orders]);

  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.orderStatus === "DELIVERED").length,
    pending: orders.filter(o => ["PENDING", "CONFIRMED", "SHIPPED"].includes(o.orderStatus)).length,
    spent: orders.reduce((s, o) => s + (o.grandTotal || 0), 0),
  };

  const FILTERS = ["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

  if (loading) return (
    <div style={S.loadPage}>
      <div style={S.loadRing} />
      <p style={S.loadText}>Loading your orders…</p>
    </div>
  );

  return (
    <div style={S.page}>

      {/* ── Top header ── */}
      <div style={S.topBar}>
        <div style={S.topInner} className="ord-header-row">
          <div style={S.topLeft}>
            <div style={S.topIconBox}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1c1b18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div>
              <h1 style={S.topTitle}>My Orders</h1>
              <p style={S.topSub}>Track and manage all your purchases</p>
            </div>
          </div>
          <button style={S.shopBtn} onClick={() => navigate("/products")}>
            Continue Shopping
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>

      <div style={S.body}>

        {/* ── Stats ── */}
        <div style={S.statsGrid} className="ord-stats">
          <StatCard label="Total Orders" value={stats.total} accent="#2563eb" />
          <StatCard label="Delivered" value={stats.delivered} accent="#1a9c4d" />
          <StatCard label="In Progress" value={stats.pending} accent="#c27c0e" />
          <StatCard label="Total Spent" value={`₹${fmt(stats.spent)}`} accent="#7c3aed" />
        </div>

        {/* ── Search + Filters ── */}
        <div style={S.filterCard}>
          <div style={{ position: "relative" }}>
            <svg style={S.searchIcon} viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#a09c93" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search by order ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{ ...S.searchInput, border: searchFocused ? "1.5px solid #2563eb" : "1.5px solid #e4e0d8" }}
            />
            {search && (
              <button style={S.clearX} onClick={() => setSearch("")}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
          <div style={S.filterRow} className="ord-filters">
            {FILTERS.map(f => {
              const active = statusFilter === f;
              const sc = f !== "ALL" ? getStatus(f) : null;
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  style={{
                    ...S.filterChip,
                    background: active ? (sc ? sc.bg : "#1c1b18") : "#fafaf8",
                    border: active ? `1.5px solid ${sc ? sc.border : "#1c1b18"}` : "1.5px solid #e4e0d8",
                    color: active ? (sc ? sc.text : "#fff") : "#6e6b63",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {f === "ALL" ? "All orders" : getStatus(f).label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Orders list or empty ── */}
        {filtered.length === 0 ? (
          <div style={S.emptyBox}>
            <div style={S.emptyEmoji}>📦</div>
            <h3 style={S.emptyTitle}>No orders found</h3>
            <p style={S.emptySub}>Try adjusting your search or filters</p>
            <button style={S.resetBtn} onClick={() => { setSearch(""); setStatusFilter("ALL"); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={S.resultCount}>{filtered.length} order{filtered.length !== 1 ? "s" : ""} found</p>
            {filtered.map(order => (
              <OrderCard
                key={order.orderId}
                order={order}
                isExpanded={expanded === order.orderId}
                onToggle={() => setExpanded(expanded === order.orderId ? null : order.orderId)}
                onView={() => navigate(`/order-success?orderId=${order.orderId}`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────*/
const S = {
  page: {
    minHeight: "100vh",
    background: "#f5f4f0",
    fontFamily: "'Sora', 'Segoe UI', sans-serif",
  },

  /* top bar */
  topBar: {
    background: "#ffffff",
    borderBottom: "1px solid #e8e4dc",
    padding: "20px",
  },
  topInner: {
    maxWidth: 1100, margin: "0 auto",
    display: "flex", justifyContent: "space-between",
    alignItems: "center", gap: 16,
  },
  topLeft: { display: "flex", alignItems: "center", gap: 14 },
  topIconBox: {
    width: 44, height: 44, borderRadius: 12,
    background: "#f5f4f0", border: "1px solid #e4e0d8",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  topTitle: { fontSize: 22, fontWeight: 800, color: "#1c1b18", letterSpacing: "-0.6px", marginBottom: 2 },
  topSub: { fontSize: 13, color: "#9e9b94" },
  shopBtn: {
    display: "flex", alignItems: "center", gap: 7,
    padding: "9px 18px",
    borderRadius: 100, border: "1.5px solid #e4e0d8",
    background: "#fafaf8", color: "#1c1b18",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },

  body: { maxWidth: 1100, margin: "0 auto", padding: "28px 20px 60px" },

  /* stats */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12, marginBottom: 20,
  },
  statCard: {
    background: "#fff",
    border: "1px solid #e8e4dc",
    borderRadius: 14,
    padding: "16px 18px",
    display: "flex", flexDirection: "column", gap: 6,
  },
  statLabel: { fontSize: 12, color: "#9e9b94", fontWeight: 500 },
  statValue: { fontSize: 26, fontWeight: 800, letterSpacing: "-1px" },

  /* filter card */
  filterCard: {
    background: "#fff",
    border: "1px solid #e8e4dc",
    borderRadius: 14,
    padding: "16px",
    marginBottom: 20,
  },
  searchWrapper: { position: "relative", marginBottom: 12 },
  searchIcon: {
    position: "absolute", left: 14, top: "50%",
    transform: "translateY(-50%)", pointerEvents: "none",
  },
  searchInput: {
    width: "100%", padding: "11px 40px",
    borderRadius: 10, fontSize: 14,
    color: "#1c1b18", background: "#fafaf8",
    outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", marginBottom: 12,
    transition: "border 0.2s",
  },
  clearX: {
    position: "absolute", right: 12, top: "50%",
    transform: "translateY(-50%)",
    background: "#e4e0d8", border: "none",
    borderRadius: "50%", width: 20, height: 20,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#6e6b63",
    marginTop: -6,
  },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  filterChip: {
    padding: "6px 14px",
    borderRadius: 100, fontSize: 12,
    cursor: "pointer", transition: "all 0.15s",
    fontFamily: "inherit",
  },

  resultCount: { fontSize: 12, color: "#a09c93", marginBottom: 4 },

  /* order card */
  orderCard: {
    background: "#fff",
    border: "1px solid #e8e4dc",
    borderRadius: 14,
    overflow: "hidden",
  },
  cardTop: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "16px 18px",
    cursor: "pointer", userSelect: "none",
    transition: "background 0.15s",
  },
  cardLeft: { display: "flex", alignItems: "center", gap: 12 },
  pkgBox: {
    width: 38, height: 38, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  orderId: { display: "flex", alignItems: "baseline", gap: 1, marginBottom: 3 },
  orderHash: { fontSize: 12, color: "#a09c93", fontWeight: 500 },
  orderMeta: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: 12, color: "#a09c93",
  },
  cardRight: { display: "flex", alignItems: "center", gap: 16 },
  totalBlock: { textAlign: "right" },
  totalLbl: { fontSize: 10, color: "#a09c93", display: "block", marginBottom: 2 },
  totalAmt: { fontSize: 15, fontWeight: 700, color: "#1c1b18" },
  chevron: { transition: "transform 0.2s", flexShrink: 0 },

  /* expanded */
  expandBox: {
    padding: "16px 18px 18px",
    borderTop: "1px solid #f2f0eb",
    background: "#fafaf8",
  },

  /* stepper */
  stepper: { display: "flex", alignItems: "flex-start", marginBottom: 18 },
  stepUnit: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5 },
  stepDot: {
    width: 22, height: 22, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s",
  },
  stepLbl: { fontSize: 10, textAlign: "center", width: 56 },

  /* detail grid */
  detailGrid: {
    display: "grid", gridTemplateColumns: "repeat(2,1fr)",
    gap: "10px 20px", marginBottom: 14,
  },
  detailCell: { display: "flex", flexDirection: "column", gap: 2 },
  detailLabel: { fontSize: 11, color: "#a09c93" },
  detailValue: { fontSize: 13, fontWeight: 500, color: "#1c1b18" },

  /* items row */
  itemsRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  itemChip: {
    display: "flex", alignItems: "center", gap: 4,
    background: "#f0f0ec", border: "1px solid #e4e0d8",
    borderRadius: 100, padding: "3px 10px",
    fontSize: 12, color: "#3d3a34",
  },
  itemDot: { color: "#a09c93", fontSize: 16, lineHeight: 1 },
  itemName: { fontWeight: 500, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  itemQty: { color: "#a09c93", flexShrink: 0 },
  moreChip: {
    display: "flex", alignItems: "center",
    background: "#f0f0ec", border: "1px solid #e4e0d8",
    borderRadius: 100, padding: "3px 10px",
    fontSize: 12, color: "#6e6b63", fontWeight: 500,
  },

  /* view btn */
  viewBtn: {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "9px 18px",
    borderRadius: 10, border: "1.5px solid #1c1b18",
    background: "#1c1b18", color: "#fff",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit", transition: "opacity 0.15s",
  },

  /* empty */
  emptyBox: {
    background: "#fff", border: "1px solid #e8e4dc",
    borderRadius: 16, padding: "60px 20px",
    textAlign: "center",
  },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: "#1c1b18", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#9e9b94", marginBottom: 20 },
  resetBtn: {
    padding: "9px 22px",
    borderRadius: 100, border: "1.5px solid #1c1b18",
    background: "#1c1b18", color: "#fff",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit",
  },

  /* loader */
  loadPage: {
    minHeight: "100vh", display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center",
    background: "#f5f4f0", gap: 14,
    fontFamily: "'Sora', sans-serif",
  },
  loadRing: {
    width: 40, height: 40,
    border: "3px solid #e4e0d8",
    borderTopColor: "#1c1b18",
    borderRadius: "50%",
    animation: "ordspin 0.9s linear infinite",
  },
  loadText: { fontSize: 13, color: "#9e9b94" },
};

export default Orders;