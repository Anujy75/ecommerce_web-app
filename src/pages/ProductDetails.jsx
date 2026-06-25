import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

/* ─────────────────────────────────────────────
   Static mock data – replace with real API data
───────────────────────────────────────────── */
const COLORS = ["Midnight", "Pearl", "Cobalt", "Forest", "Crimson"];
const SIZES  = ["XS", "S", "M", "L", "XL"];
const SPECS  = [
  ["Display",       "6.1″ Super Retina XDR"],
  ["Processor",     "A16 Bionic Chip"],
  ["RAM",           "6 GB"],
  ["Storage",       "128 GB / 256 GB / 512 GB"],
  ["Rear Camera",   "48 MP + 12 MP + 12 MP"],
  ["Front Camera",  "12 MP"],
  ["Battery",       "3,279 mAh"],
  ["OS",            "iOS 17"],
  ["Water Rating",  "IP68"],
];

const COLOR_MAP = {
  Midnight: "#1c1c1e",
  Pearl:    "#f5f0eb",
  Cobalt:   "#2a52be",
  Forest:   "#2d5a27",
  Crimson:  "#c0392b",
};

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function ProductDetails() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [product,       setProduct]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [quantity,      setQuantity]      = useState(1);
  const [cartAdded,     setCartAdded]     = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedSize,  setSelectedSize]  = useState(SIZES[2]);
  const [pincode,       setPincode]       = useState("");
  const [deliveryMsg,   setDeliveryMsg]   = useState(null);
  const [activeTab,     setActiveTab]     = useState("specs");
  const [activeImg,     setActiveImg]     = useState(0);

  useEffect(() => {
    API.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const changeQty = useCallback((dir) => {
    setQuantity(q =>
      dir === "inc" ? Math.min(q + 1, product?.stock ?? 1)
                    : Math.max(q - 1, 1)
    );
  }, [product?.stock]);

  const addToCart = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx  = cart.findIndex(i => i.id === product.id);
    if (idx > -1) cart[idx].quantity += quantity;
    else cart.push({ ...product, quantity, selectedColor, selectedSize });
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2200);
  }, [product, quantity, selectedColor, selectedSize]);

  const buyNow = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx  = cart.findIndex(i => i.id === product.id);
    if (idx > -1) cart[idx].quantity += quantity;
    else cart.push({ ...product, quantity, selectedColor, selectedSize });
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/checkout");
  }, [product, quantity, selectedColor, selectedSize, navigate]);

  const checkDelivery = useCallback(() => {
    setDeliveryMsg(
      /^\d{6}$/.test(pincode)
        ? { ok: true,  text: "Delivery available · 3–4 business days" }
        : { ok: false, text: "Enter a valid 6-digit pincode" }
    );
  }, [pincode]);

  /* ── Loading ── */
  if (loading) return (
    <div style={s.center}>
      <div style={s.spinRing} />
      <p style={s.loadText}>Loading…</p>
    </div>
  );

  /* ── Not found ── */
  if (!product) return (
    <div style={s.center}>
      <p style={{ color: "var(--clr-muted)", marginBottom: "1rem" }}>Product not found.</p>
      <button style={s.ghostBtn} onClick={() => navigate("/products")}>← Back to products</button>
    </div>
  );

  const inStock = product.stock > 0;
  const mrp     = (product.price * 1.2).toLocaleString("en-IN");
  const price   = product.price?.toLocaleString("en-IN");

  return (
    <>
      <style>{CSS}</style>
      <div style={s.page}>

        {/* ── Breadcrumb ── */}
        <nav style={s.breadcrumb}>
          <button style={s.crumbBtn} onClick={() => navigate("/products")}>Products</button>
          <span style={s.crumbSep}>/</span>
          <span style={s.crumbActive}>{product.name}</span>
        </nav>

        {/* ── Main grid ── */}
        <div style={s.grid}>

          {/* LEFT – Image gallery */}
          <div style={s.gallery}>
            <div style={s.mainImgWrap}>
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} style={s.mainImg} />
                : <span style={s.imgFallback}>🛍</span>}

              {inStock &&
                <span style={s.stockBadge}>In Stock</span>}
            </div>

            <div style={s.thumbRow}>
              {[0, 1, 2, 3].map(i => (
                <button
                  key={i}
                  className={`thumb-btn${activeImg === i ? " active" : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  {product.imageUrl
                    ? <img src={product.imageUrl} alt="" style={s.thumbImg} />
                    : "🛍"}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT – Details */}
          <div style={s.details}>

            {/* Meta */}
            <p style={s.brand}>ShopEase Exclusive</p>
            <h1 style={s.title}>{product.name}</h1>

            <div style={s.ratingRow}>
              <div style={s.stars}>
                {"★★★★☆"}
              </div>
              <span style={s.ratingNum}>4.5</span>
              <span style={s.ratingCount}>· 1,234 reviews</span>
            </div>

            {/* Price */}
            <div style={s.priceRow}>
              <span style={s.price}>₹{price}</span>
              <span style={s.mrp}>₹{mrp}</span>
              <span style={s.pill}>20% off</span>
            </div>
            <p style={s.taxNote}>Inclusive of all taxes</p>

            <hr style={s.divider} />

            {/* Color */}
            <div style={s.optGroup}>
              <span style={s.optLabel}>Color</span>
              <span style={s.optVal}>{selectedColor}</span>
              <div style={s.swatchRow}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    title={c}
                    className={`swatch-btn${selectedColor === c ? " selected" : ""}`}
                    style={{ "--sw-bg": COLOR_MAP[c] }}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div style={s.optGroup}>
              <span style={s.optLabel}>Size</span>
              <span style={s.optVal}>{selectedSize}</span>
              <div style={s.sizeRow}>
                {SIZES.map(sz => (
                  <button
                    key={sz}
                    className={`size-btn${selectedSize === sz ? " selected" : ""}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div style={s.optGroup}>
              <span style={s.optLabel}>Quantity</span>
              <div style={s.qtyCtrl}>
                <button style={s.qtyBtn} onClick={() => changeQty("dec")} disabled={quantity <= 1}>−</button>
                <span style={s.qtyNum}>{quantity}</span>
                <button style={s.qtyBtn} onClick={() => changeQty("inc")} disabled={!inStock || quantity >= product.stock}>+</button>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={s.ctaRow}>
              <button
                className={`cta-cart${cartAdded ? " added" : ""}`}
                style={s.ctaCart}
                onClick={addToCart}
                disabled={!inStock}
              >
                {cartAdded ? "✓ Added" : "Add to Cart"}
              </button>
              <button
                style={inStock ? s.ctaBuy : s.ctaBuyDisabled}
                onClick={buyNow}
                disabled={!inStock}
              >
                Buy Now
              </button>
            </div>

            {/* Delivery check */}
            <div style={s.deliveryBox}>
              <p style={s.deliveryHeading}>Check Delivery</p>
              <div style={s.pincodeRow}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={e => { setPincode(e.target.value); setDeliveryMsg(null); }}
                  style={s.pincodeInput}
                />
                <button style={s.checkBtn} onClick={checkDelivery}>Check</button>
              </div>
              {deliveryMsg && (
                <p style={{ ...s.deliveryResult, color: deliveryMsg.ok ? "var(--clr-success)" : "var(--clr-error)" }}>
                  {deliveryMsg.text}
                </p>
              )}
            </div>

            {/* Offer strip */}
            <div style={s.offerStrip}>
              <span style={s.offerIcon}>🏷</span>
              10% instant discount on HDFC Bank Cards
            </div>
          </div>
        </div>

        {/* ── Tabs: Specs / Description ── */}
        <div style={s.tabSection}>
          <div style={s.tabBar}>
            {["specs", "description"].map(t => (
              <button
                key={t}
                className={`tab-btn${activeTab === t ? " active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t === "specs" ? "Specifications" : "Description"}
              </button>
            ))}
          </div>

          <div style={s.tabContent}>
            {activeTab === "specs" && (
              <table style={s.specTable}>
                <tbody>
                  {SPECS.map(([k, v]) => (
                    <tr key={k} style={s.specRow}>
                      <td style={s.specKey}>{k}</td>
                      <td style={s.specVal}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeTab === "description" && (
              <p style={s.descText}>{product.description || "No description available."}</p>
            )}
          </div>
        </div>

        {/* ── You may also like ── */}
        <div style={s.relatedSection}>
          <h2 style={s.sectionTitle}>You May Also Like</h2>
          <div style={s.relatedGrid}>
            {[1, 2, 3, 4].map(n => (
              <button key={n} style={s.relatedCard} onClick={() => navigate("/products")}>
                <div style={s.relatedImg}>🛍</div>
                <p style={s.relatedName}>Similar Product {n}</p>
                <p style={s.relatedPrice}>₹999</p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   CSS (injected via <style> tag)
───────────────────────────────────────────── */
const CSS = `
  :root {
    --clr-ink:       #0a0a0a;
    --clr-ink2:      #3a3a3a;
    --clr-muted:     #888;
    --clr-border:    #e8e4de;
    --clr-surface:   #fafaf8;
    --clr-white:     #ffffff;
    --clr-accent:    #1a1a2e;
    --clr-accent2:   #e8572a;
    --clr-success:   #1a7a4a;
    --clr-error:     #c0392b;
    --clr-gold:      #c9a84c;
    --ff-display:    'Playfair Display', Georgia, serif;
    --ff-body:       'DM Sans', -apple-system, sans-serif;
    --radius-sm:     6px;
    --radius-md:     12px;
    --radius-lg:     18px;
    --transition:    0.18s ease;
  }

  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');

  /* Spinner animation */
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeSlide { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  /* Thumbnail buttons */
  .thumb-btn {
    width: 64px; height: 64px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--clr-border);
    background: var(--clr-surface);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; cursor: pointer;
    transition: border-color var(--transition), transform var(--transition);
    padding: 0;
    font-size: 20px;
  }
  .thumb-btn:hover    { border-color: #aaa; transform: translateY(-1px); }
  .thumb-btn.active   { border-color: var(--clr-accent); border-width: 2px; }

  /* Swatch buttons */
  .swatch-btn {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: var(--sw-bg);
    border: 2px solid transparent;
    outline: 2px solid transparent;
    cursor: pointer;
    transition: outline-color var(--transition), transform var(--transition);
  }
  .swatch-btn:hover   { transform: scale(1.12); }
  .swatch-btn.selected { outline-color: var(--clr-accent); outline-offset: 3px; }

  /* Size buttons */
  .size-btn {
    min-width: 44px; height: 36px;
    padding: 0 10px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--clr-border);
    background: var(--clr-white);
    font-family: var(--ff-body);
    font-size: 13px; font-weight: 500;
    color: var(--clr-ink2);
    cursor: pointer;
    transition: all var(--transition);
  }
  .size-btn:hover   { border-color: var(--clr-accent); color: var(--clr-accent); }
  .size-btn.selected {
    background: var(--clr-accent); color: #fff;
    border-color: var(--clr-accent);
  }

  /* CTA Cart button */
  .cta-cart {
    transition: background var(--transition), transform var(--transition);
  }
  .cta-cart:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
  .cta-cart.added {
    background: var(--clr-success) !important;
    animation: fadeSlide 0.25s ease;
  }

  /* Tab buttons */
  .tab-btn {
    padding: 10px 24px;
    border: none; background: none;
    font-family: var(--ff-body);
    font-size: 14px; font-weight: 500;
    color: var(--clr-muted);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color var(--transition), border-color var(--transition);
    text-transform: capitalize;
    letter-spacing: 0.02em;
  }
  .tab-btn:hover { color: var(--clr-ink); }
  .tab-btn.active {
    color: var(--clr-accent);
    border-bottom-color: var(--clr-accent);
  }
`;

/* ─────────────────────────────────────────────
   Inline styles object
───────────────────────────────────────────── */
const s = {
  /* Page */
  page: {
    maxWidth: "1160px",
    margin: "0 auto",
    padding: "2rem 1.5rem 4rem",
    fontFamily: "var(--ff-body)",
    background: "var(--clr-white)",
    minHeight: "100vh",
    color: "var(--clr-ink)",
  },

  /* Loading / center */
  center: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: "60vh", gap: "1rem",
  },
  spinRing: {
    width: "36px", height: "36px",
    border: "2.5px solid var(--clr-border)",
    borderTop: "2.5px solid var(--clr-accent)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadText: { color: "var(--clr-muted)", fontSize: "14px" },

  ghostBtn: {
    background: "none", border: "1px solid var(--clr-border)",
    borderRadius: "var(--radius-sm)", padding: "8px 18px",
    cursor: "pointer", fontSize: "13px", color: "var(--clr-ink2)",
    fontFamily: "var(--ff-body)",
  },

  /* Breadcrumb */
  breadcrumb: {
    display: "flex", alignItems: "center", gap: "8px",
    marginBottom: "2rem",
  },
  crumbBtn: {
    background: "none", border: "none",
    color: "var(--clr-muted)", fontSize: "13px",
    cursor: "pointer", fontFamily: "var(--ff-body)",
    padding: 0,
  },
  crumbSep:    { color: "var(--clr-border)", fontSize: "13px" },
  crumbActive: { fontSize: "13px", color: "var(--clr-ink2)", fontWeight: 500 },

  /* Main grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3.5rem",
    marginBottom: "3.5rem",
    "@media (max-width: 768px)": { gridTemplateColumns: "1fr" },
  },

  /* Gallery */
  gallery: { display: "flex", flexDirection: "column", gap: "12px" },
  mainImgWrap: {
    position: "relative",
    width: "100%", aspectRatio: "1 / 1",
    background: "var(--clr-surface)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  mainImg:    { width: "100%", height: "100%", objectFit: "cover" },
  imgFallback: { fontSize: "80px" },
  stockBadge: {
    position: "absolute", top: "14px", left: "14px",
    background: "var(--clr-success)", color: "#fff",
    fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em",
    padding: "4px 10px", borderRadius: "20px",
    textTransform: "uppercase",
  },
  thumbRow: { display: "flex", gap: "10px" },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover" },

  /* Details */
  details: { display: "flex", flexDirection: "column", gap: "16px" },
  brand: {
    fontFamily: "var(--ff-body)", fontSize: "11px",
    fontWeight: 500, letterSpacing: "0.14em",
    textTransform: "uppercase", color: "var(--clr-muted)",
    margin: 0,
  },
  title: {
    fontFamily: "var(--ff-display)", fontSize: "clamp(22px, 2.8vw, 32px)",
    fontWeight: 600, color: "var(--clr-ink)", lineHeight: 1.2, margin: 0,
  },

  /* Rating */
  ratingRow: { display: "flex", alignItems: "center", gap: "8px" },
  stars:     { color: "var(--clr-gold)", fontSize: "15px", letterSpacing: "1px" },
  ratingNum: { fontSize: "14px", fontWeight: 500 },
  ratingCount: { fontSize: "13px", color: "var(--clr-muted)" },

  /* Price */
  priceRow: { display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" },
  price:    { fontFamily: "var(--ff-display)", fontSize: "30px", fontWeight: 600, color: "var(--clr-ink)" },
  mrp: {
    fontSize: "15px", color: "var(--clr-muted)",
    textDecoration: "line-through",
  },
  pill: {
    fontSize: "12px", fontWeight: 500,
    background: "#fff3cd", color: "#856404",
    padding: "3px 10px", borderRadius: "20px",
  },
  taxNote: { fontSize: "12px", color: "var(--clr-muted)", margin: 0 },

  divider: { border: "none", borderTop: "1px solid var(--clr-border)", margin: 0 },

  /* Option groups */
  optGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  optLabel: {
    fontSize: "12px", fontWeight: 500, color: "var(--clr-muted)",
    letterSpacing: "0.08em", textTransform: "uppercase",
  },
  optVal:  { fontSize: "14px", fontWeight: 500, color: "var(--clr-ink2)", marginTop: "-6px" },
  swatchRow: { display: "flex", gap: "10px" },
  sizeRow:   { display: "flex", gap: "8px", flexWrap: "wrap" },

  /* Qty */
  qtyCtrl: {
    display: "inline-flex", alignItems: "center",
    border: "1.5px solid var(--clr-border)", borderRadius: "var(--radius-sm)",
    overflow: "hidden", width: "fit-content",
  },
  qtyBtn: {
    width: "36px", height: "36px",
    background: "var(--clr-surface)", border: "none",
    fontSize: "18px", cursor: "pointer",
    color: "var(--clr-ink2)", fontFamily: "var(--ff-body)",
    transition: "background var(--transition)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  qtyNum: {
    minWidth: "44px", textAlign: "center",
    fontSize: "15px", fontWeight: 500,
    borderLeft: "1px solid var(--clr-border)",
    borderRight: "1px solid var(--clr-border)",
    height: "36px", lineHeight: "36px",
    userSelect: "none",
  },

  /* CTAs */
  ctaRow: { display: "flex", gap: "12px", marginTop: "4px" },
  ctaCart: {
    flex: 1, padding: "13px",
    background: "var(--clr-accent)", color: "#fff",
    border: "none", borderRadius: "var(--radius-md)",
    fontSize: "14px", fontWeight: 500,
    cursor: "pointer", fontFamily: "var(--ff-body)",
    letterSpacing: "0.02em",
  },
  ctaBuy: {
    flex: 1, padding: "13px",
    background: "var(--clr-accent2)", color: "#fff",
    border: "none", borderRadius: "var(--radius-md)",
    fontSize: "14px", fontWeight: 500,
    cursor: "pointer", fontFamily: "var(--ff-body)",
    letterSpacing: "0.02em",
    transition: "opacity 0.18s ease, transform 0.18s ease",
  },
  ctaBuyDisabled: {
    flex: 1, padding: "13px",
    background: "#f0ede8", color: "#aaa",
    border: "none", borderRadius: "var(--radius-md)",
    fontSize: "14px", cursor: "not-allowed", fontFamily: "var(--ff-body)",
  },

  /* Delivery */
  deliveryBox: {
    background: "var(--clr-surface)",
    borderRadius: "var(--radius-md)",
    padding: "14px 16px",
    border: "1px solid var(--clr-border)",
  },
  deliveryHeading: {
    fontSize: "12px", fontWeight: 500,
    letterSpacing: "0.08em", textTransform: "uppercase",
    color: "var(--clr-muted)", margin: "0 0 10px",
  },
  pincodeRow:  { display: "flex", gap: "8px" },
  pincodeInput: {
    flex: 1, height: "38px",
    padding: "0 12px",
    border: "1.5px solid var(--clr-border)",
    borderRadius: "var(--radius-sm)",
    fontSize: "14px", fontFamily: "var(--ff-body)",
    outline: "none", color: "var(--clr-ink)",
    background: "var(--clr-white)",
  },
  checkBtn: {
    height: "38px", padding: "0 18px",
    background: "var(--clr-accent)", color: "#fff",
    border: "none", borderRadius: "var(--radius-sm)",
    fontSize: "13px", fontWeight: 500,
    cursor: "pointer", fontFamily: "var(--ff-body)",
    whiteSpace: "nowrap",
  },
  deliveryResult: {
    fontSize: "13px", margin: "8px 0 0", fontWeight: 500,
  },

  /* Offer strip */
  offerStrip: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "#fffbf0", border: "1px solid #ffe8a0",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    fontSize: "13px", color: "#7a5e00",
  },
  offerIcon: { fontSize: "16px" },

  /* Tabs */
  tabSection: {
    marginBottom: "3rem",
    border: "1px solid var(--clr-border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  },
  tabBar: {
    display: "flex",
    borderBottom: "1px solid var(--clr-border)",
    background: "var(--clr-surface)",
    padding: "0 8px",
  },
  tabContent: { padding: "24px 28px" },

  /* Spec table */
  specTable: {
    width: "100%", borderCollapse: "collapse",
    fontFamily: "var(--ff-body)",
  },
  specRow: { borderBottom: "1px solid var(--clr-border)" },
  specKey: {
    padding: "11px 0", width: "32%",
    fontSize: "13px", fontWeight: 500,
    color: "var(--clr-muted)",
    verticalAlign: "top",
  },
  specVal: {
    padding: "11px 0", fontSize: "14px",
    color: "var(--clr-ink2)",
  },

  /* Description */
  descText: {
    fontSize: "15px", lineHeight: 1.75,
    color: "var(--clr-ink2)", margin: 0,
  },

  /* Related */
  relatedSection: { marginBottom: "2rem" },
  sectionTitle: {
    fontFamily: "var(--ff-display)",
    fontSize: "22px", fontWeight: 600,
    color: "var(--clr-ink)", marginBottom: "1.25rem",
  },
  relatedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "14px",
  },
  relatedCard: {
    background: "var(--clr-surface)",
    border: "1px solid var(--clr-border)",
    borderRadius: "var(--radius-md)",
    padding: "1rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "box-shadow 0.18s ease, transform 0.18s ease",
    fontFamily: "var(--ff-body)",
  },
  relatedImg:   { fontSize: "40px", marginBottom: "10px" },
  relatedName:  { fontSize: "13px", fontWeight: 500, color: "var(--clr-ink2)", margin: "0 0 4px" },
  relatedPrice: { fontSize: "13px", color: "var(--clr-accent2)", fontWeight: 600, margin: 0 },
};


