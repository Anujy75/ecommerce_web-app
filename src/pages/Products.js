import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import API from "../services/api";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   GLOBAL STYLES + ANIMATIONS
───────────────────────────────────────────────*/
(() => {
  const id = "premium-prod-styles";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      --bg-primary: #fafbfc;
      --bg-secondary: #ffffff;
      --bg-tertiary: #f1f5f9;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-tertiary: #94a3b8;
      --border-light: #e2e8f0;
      --border-medium: #cbd5e1;
      --accent-primary: #3b82f6;
      --accent-secondary: #8b5cf6;
      --accent-gradient: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
      --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
    }
    
    body { font-family: 'Inter', sans-serif; background: var(--bg-primary); }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes countPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes badgeGlow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
      50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
    }
    
    .animate-fade-up { animation: fadeInUp 0.6s ease-out forwards; }
    .animate-fade-scale { animation: fadeInScale 0.4s ease-out forwards; }
    .animate-slide-left { animation: slideInLeft 0.5s ease-out forwards; }
    .animate-slide-right { animation: slideInRight 0.5s ease-out forwards; }
    
    .card-hover {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .card-hover:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-xl);
    }
    .card-hover:hover .prod-overlay {
      opacity: 1 !important;
    }
    
    .image-zoom {
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .image-zoom:hover {
      transform: scale(1.08);
    }
    
    .btn-ripple {
      position: relative;
      overflow: hidden;
    }
    .btn-ripple::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    .btn-ripple:active::after {
      width: 300px;
      height: 300px;
    }

    /* Promo banner ticker */
    .ticker-wrap {
      overflow: hidden;
      width: 100%;
    }
    .ticker-inner {
      display: flex;
      width: max-content;
      animation: marquee 28s linear infinite;
    }
    .ticker-inner:hover {
      animation-play-state: paused;
    }

    /* Recently viewed scrollbar hide */
    .rv-scroll {
      overflow-x: auto;
      scrollbar-width: none;
    }
    .rv-scroll::-webkit-scrollbar { display: none; }

    /* Trending tag hover */
    .trend-tag {
      transition: all 0.2s;
      cursor: pointer;
    }
    .trend-tag:hover {
      transform: translateY(-2px);
    }

    .cat-chip:hover {
      transform: translateY(-2px);
    }
    .prod-overlay button:hover {
      transform: scale(1.05);
    }
    
    @media (max-width: 768px) {
      .prod-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
      .prod-hero-title { font-size: 32px !important; }
    }
    @media (max-width: 480px) {
      .prod-grid { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(s);
})();

/* ─────────────────────────────────────────────
   SHIMMER SKELETON
───────────────────────────────────────────────*/
const Skeleton = ({ index }) => (
  <div style={{ ...S.skelCard, animationDelay: `${index * 0.05}s`, animation: "fadeInScale 0.4s ease-out" }}>
    <div style={S.skelImg} />
    <div style={{ padding: "16px" }}>
      <div style={{ ...S.skelLine, width: "40%", marginBottom: 8 }} />
      <div style={{ ...S.skelLine, width: "75%", marginBottom: 6 }} />
      <div style={{ ...S.skelLine, width: "90%", marginBottom: 16 }} />
      <div style={{ ...S.skelLine, width: "30%", height: 22 }} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   STOCK BADGE
───────────────────────────────────────────────*/
const StockBadge = ({ stock }) => {
  if (stock === 0) return <span style={S.badgeOut}>❌ Out of stock</span>;
  if (stock <= 5) return <span style={S.badgeLow}>⚠️ Only {stock} left</span>;
  return <span style={S.badgeIn}>✅ In stock</span>;
};

/* ─────────────────────────────────────────────
   PROMO BANNER (replaces stats)
───────────────────────────────────────────────*/
const PromoBanner = () => {
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 42, s: 30 });

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return { h: 5, m: 59, s: 59 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = n => String(n).padStart(2, "0");

  const tickers = [
    "🎉 FREE SHIPPING on orders above ₹999",
    "🔥 Flash Sale — Up to 40% OFF selected items",
    "💳 Extra 10% OFF with HDFC cards",
    "📦 Same-day delivery available in select cities",
    "🌟 New arrivals added every Monday",
    "🎁 Gift wrapping available at checkout",
  ];
  const tickerText = [...tickers, ...tickers].join("   ·   ");

  return (
    <div style={S.promoBanner}>
      {/* Left: countdown */}
      <div style={S.promoLeft}>
        <span style={S.promoFireIcon}>🔥</span>
        <div>
          <div style={S.promoLabel}>Flash Sale ends in</div>
          <div style={S.promoCountdown}>
            <span style={S.promoDigit}>{pad(timeLeft.h)}</span>
            <span style={S.promoColon}>:</span>
            <span style={S.promoDigit}>{pad(timeLeft.m)}</span>
            <span style={S.promoColon}>:</span>
            <span style={S.promoDigit} className="countPulse">{pad(timeLeft.s)}</span>
          </div>
        </div>
      </div>

      {/* Center: ticker */}
      <div style={S.promoCenter} className="ticker-wrap">
        <div className="ticker-inner" style={S.tickerInner}>
          <span style={S.tickerText}>{tickerText}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;</span>
          <span style={S.tickerText}>{tickerText}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>

      {/* Right: CTA */}
      <button style={S.promoBtn} className="btn-ripple">
        Shop Now →
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────
   TRENDING TAGS
───────────────────────────────────────────────*/
const TrendingTags = ({ onTagClick, activeTag }) => {
  const tags = [
    { label: "🔥 Bestseller", key: "Bestseller" },
    { label: "✨ New Arrival", key: "New Arrival" },
    { label: "💎 Premium", key: "Premium" },
    { label: "⚡ Flash Deal", key: "Flash Deal" },
    { label: "🎁 Gift Ideas", key: "Gift Ideas" },
    { label: "📱 Electronics", key: "Electronics" },
    { label: "👗 Fashion", key: "Fashion" },
    { label: "🏠 Home & Living", key: "Home & Living" },
  ];

  return (
    <div style={S.trendSection}>
      <div style={S.trendHeader}>
        <span style={S.trendTitle}>🚀 Trending Now</span>
        <span style={S.trendSub}>Tap to filter</span>
      </div>
      <div style={S.trendTags}>
        {tags.map(tag => (
          <button
            key={tag.key}
            className="trend-tag"
            onClick={() => onTagClick(tag.key === activeTag ? null : tag.key)}
            style={{
              ...S.trendTag,
              background: activeTag === tag.key ? "#1e293b" : "#ffffff",
              color: activeTag === tag.key ? "#ffffff" : "#475569",
              borderColor: activeTag === tag.key ? "#1e293b" : "#e2e8f0",
              boxShadow: activeTag === tag.key ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
            }}
          >
            {tag.label}
            {tag.key === "Bestseller" && (
              <span style={S.hotDot} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   RECENTLY VIEWED STRIP
───────────────────────────────────────────────*/
const RecentlyViewed = ({ items, onView }) => {
  if (!items || items.length === 0) return null;
  return (
    <div style={S.rvSection}>
      <div style={S.rvHeader}>
        <span style={S.rvTitle}>👁️ Recently Viewed</span>
        <span style={S.rvCount}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="rv-scroll" style={S.rvScroll}>
        <div style={S.rvRow}>
          {items.map(p => (
            <div
              key={p.id}
              style={S.rvCard}
              onClick={() => onView(p.id)}
              title={p.name}
            >
              <div style={S.rvImgBox}>
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} style={S.rvImg} />
                  : <div style={S.rvImgPlaceholder}>📦</div>
                }
              </div>
              <div style={S.rvInfo}>
                <div style={S.rvName}>{p.name}</div>
                <div style={S.rvPrice}>₹{p.price.toLocaleString("en-IN")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────────*/
const ProductCard = ({ p, onAdd, onBuy, onView, isAdded, isAdding, index }) => {
  const outOfStock = p.stock === 0;

  return (
    <div
      className="card-hover animate-fade-scale"
      style={{ ...S.card, opacity: outOfStock ? 0.75 : 1, animationDelay: `${index * 0.05}s` }}
    >
      {/* Image Section */}
      <div style={S.imgBox} onClick={() => onView(p.id)}>
        <div className="image-zoom" style={S.imgWrap}>
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} style={S.img} loading="lazy" />
          ) : (
            <div style={S.imgPlaceholder}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#cbd5e1" strokeWidth="1.2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button style={S.wishlistBtn} onClick={(e) => { e.stopPropagation(); toast.success("Added to wishlist"); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Overlay */}
        <div className="prod-overlay" style={S.overlay}>
          <button style={S.overlayBtn} onClick={(e) => { e.stopPropagation(); onView(p.id); }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Quick View
          </button>
        </div>

        {/* Badges */}
        <div style={S.badgesStack}>
          {p.stock <= 5 && p.stock > 0 && <span style={S.hotBadge}>🔥 Hot Deal</span>}
          {p.price > 50000 && <span style={S.premiumBadge}>💎 Premium</span>}
          {outOfStock && <span style={S.outBadge}>Sold Out</span>}
        </div>
      </div>

      {/* Body */}
      <div style={S.body}>
        <div style={S.topRow}>
          <span style={S.catChip}>{p.category}</span>
          <StockBadge stock={p.stock} />
        </div>

        <h3 style={S.name} onClick={() => onView(p.id)}>{p.name}</h3>
        <p style={S.desc}>{p.description}</p>

        {/* Rating */}
        <div style={S.ratingRow}>
          <div style={S.stars}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} viewBox="0 0 24 24" width="14" height="14" fill={i < 4 ? "#f59e0b" : "#cbd5e1"} style={{ marginRight: 2 }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
          </div>
          <span style={S.ratingCount}>(128 reviews)</span>
        </div>

        {/* Price */}
        <div style={S.priceRow}>
          <span style={S.price}>₹{p.price.toLocaleString("en-IN")}</span>
          <span style={S.originalPrice}>₹{Math.round(p.price * 1.2).toLocaleString("en-IN")}</span>
          <span style={S.discountBadge}>-20%</span>
        </div>

        <div style={S.ruleLine} />

        {/* Actions */}
        <div style={S.actions}>
          <button
            className="btn-ripple"
            style={S.detailBtn}
            onClick={() => onView(p.id)}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Details
          </button>

          <button
            className="btn-ripple"
            disabled={outOfStock || isAdding}
            style={{
              ...S.addBtn,
              ...(isAdded ? S.addedBtn : {}),
              ...(outOfStock ? S.disabledBtn : {}),
            }}
            onClick={() => !outOfStock && onAdd(p)}
          >
            {isAdded ? (
              <>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Added!
              </>
            ) : isAdding ? (
              <><span style={S.btnSpin} /> Adding…</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Add to Cart
              </>
            )}
          </button>

          <button
            className="btn-ripple"
            disabled={outOfStock}
            style={{ ...S.buyBtn, ...(outOfStock ? S.disabledBtn : {}) }}
            onClick={() => !outOfStock && onBuy(p)}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PRODUCTS COMPONENT
───────────────────────────────────────────────*/
function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [added, setAdded] = useState({});
  const [adding, setAdding] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTag, setActiveTag] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const searchRef = useRef(null);

  const token = localStorage.getItem("customerToken") || localStorage.getItem("adminToken");

  useEffect(() => {
    setLoading(true);
    API.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(products.map(p => p.category))];
  const maxPrice = Math.max(...products.map(p => p.price), 100000);

  let filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    // Trending tag filter — maps tag labels to product properties
    let matchesTag = true;
    if (activeTag === "Premium") matchesTag = p.price > 50000;
    else if (activeTag === "Flash Deal") matchesTag = p.stock <= 5 && p.stock > 0;
    else if (activeTag === "Bestseller") matchesTag = p.stock > 10;
    else if (activeTag) matchesTag = p.category?.toLowerCase().includes(activeTag.toLowerCase());
    return matchesSearch && matchesCategory && matchesPrice && matchesTag;
  });

  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  else if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "stock") filtered.sort((a, b) => b.stock - a.stock);
  else if (sort === "rating") filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const handleAdd = useCallback(async (product) => {
    if (!token) { toast.error("Please login first"); navigate("/portal"); return; }
    setAdding(prev => ({ ...prev, [product.id]: true }));
    try {
      await API.post("/cart/add",
        { productId: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdded(prev => ({ ...prev, [product.id]: true }));
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 2000);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(prev => ({ ...prev, [product.id]: false }));
    }
  }, [token, navigate]);

  const handleBuyNow = useCallback(async (product) => {
    if (!token) { toast.error("Please login first"); navigate("/portal"); return; }
    try {
      await API.post("/cart/add",
        { productId: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/checkout");
    } catch {
      toast.error("Failed. Please try again.");
    }
  }, [token, navigate]);

  const handleView = useCallback((id) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setRecentlyViewed(prev => {
        const filtered = prev.filter(p => p.id !== id);
        return [product, ...filtered].slice(0, 8);
      });
    }
    navigate(`/product/${id}`);
  }, [navigate, products]);

  return (
    <div style={S.page}>
      {/* Hero Section */}
      <div style={S.hero}>
        <div style={S.heroBg} />
        <div style={S.heroInner}>
          <div className="animate-slide-left" style={S.heroPill}>
            <span>✨ NEW ARRIVALS 2025</span>
          </div>
          <h1 className="animate-slide-right" style={S.heroTitle}>
            Discover Your<br />
            <span style={S.heroGradient}>Premium Collection</span>
          </h1>
          <p className="animate-fade-up" style={S.heroSub}>
            Curated products with exceptional quality, fast delivery, and best prices guaranteed.
          </p>
          <div className="animate-fade-up" style={{ ...S.heroSearchWrap, animationDelay: "0.2s" }}>
            <svg style={S.heroSearchIcon} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={searchRef}
              style={{ ...S.heroSearch, borderColor: searchFocused ? "#3b82f6" : "#e2e8f0" }}
              placeholder="Search by name, category, or brand..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {search && (
              <button style={S.heroSearchClear} onClick={() => { setSearch(""); searchRef.current?.focus(); }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Floating Particles */}
        <div style={S.particle1} />
        <div style={S.particle2} />
        <div style={S.particle3} />
        <div style={S.particle4} />
      </div>

      <div style={S.main}>

        {/* ── NEW: Promo Banner with countdown & ticker ── */}
        <PromoBanner />

        {/* ── NEW: Trending Tags ── */}
        <TrendingTags onTagClick={setActiveTag} activeTag={activeTag} />

        {/* ── NEW: Recently Viewed ── */}
        <RecentlyViewed items={recentlyViewed} onView={handleView} />

        {/* Toolbar */}
        <div className="prod-toolbar" style={S.toolbar}>
          {/* Category Filters */}
          <div style={S.catRow}>
            {categories.slice(0, 8).map(c => (
              <button
                key={c}
                className="cat-chip"
                onClick={() => setCategory(c)}
                style={{
                  ...S.catChipBtn,
                  background: category === c ? "#1e293b" : "#ffffff",
                  color: category === c ? "#ffffff" : "#475569",
                  borderColor: category === c ? "#1e293b" : "#e2e8f0",
                  boxShadow: category === c ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div style={S.controls}>
            <button
              style={S.filterBtn}
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3"/>
              </svg>
              Filters
            </button>

            <select value={sort} onChange={e => setSort(e.target.value)} style={S.sortSelect}>
              <option value="default">Sort by: Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="stock">Most Available</option>
              <option value="rating">Top Rated</option>
            </select>

            <div style={S.viewToggle}>
              <button
                style={{ ...S.viewBtn, background: viewMode === "grid" ? "#e2e8f0" : "transparent" }}
                onClick={() => setViewMode("grid")}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </button>
              <button
                style={{ ...S.viewBtn, background: viewMode === "list" ? "#e2e8f0" : "transparent" }}
                onClick={() => setViewMode("list")}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Price Range Filter */}
        {showFilters && (
          <div className="animate-fade-scale" style={S.priceFilter}>
            <label style={S.priceLabel}>Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}</label>
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              style={S.priceSlider}
            />
            <div style={S.priceRangeLabels}>
              <span>₹0</span>
              <span>₹{maxPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div style={S.resultRow}>
          <span style={S.resultCount}>
            {loading ? "Loading products..." : `Showing ${filtered.length} of ${products.length} products`}
            {activeTag && <span style={S.activeTagBadge}>· {activeTag} ×</span>}
          </span>
          {(search || category !== "All" || priceRange[1] < maxPrice || activeTag) && !loading && (
            <button style={S.clearAllBtn} onClick={() => { setSearch(""); setCategory("All"); setPriceRange([0, maxPrice]); setActiveTag(null); }}>
              Clear All Filters ×
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ ...S.grid, gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))" }} className="prod-grid">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} index={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="animate-fade-scale" style={S.emptyBox}>
            <div style={S.emptyIcon}>🔍</div>
            <h3 style={S.emptyTitle}>No products found</h3>
            <p style={S.emptySub}>Try adjusting your search or filter criteria</p>
            <button style={S.emptyResetBtn} onClick={() => { setSearch(""); setCategory("All"); setPriceRange([0, maxPrice]); setActiveTag(null); }}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div
            style={viewMode === "grid" ? S.grid : S.listGrid}
            className="prod-grid"
          >
            {filtered.map((p, idx) => (
              <ProductCard
                key={p.id}
                p={p}
                onAdd={handleAdd}
                onBuy={handleBuyNow}
                onView={handleView}
                isAdded={added[p.id]}
                isAdding={adding[p.id]}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────*/
const S = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
  },

  /* ── Hero ── */
  hero: {
    position: "relative",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    padding: "80px 32px",
    overflow: "hidden",
  },
  heroBg: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "radial-gradient(circle at 20% 80%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.15) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  heroInner: {
    maxWidth: 900,
    margin: "0 auto",
    textAlign: "center",
    position: "relative",
    zIndex: 2,
  },
  heroPill: {
    display: "inline-block",
    background: "rgba(59,130,246,0.15)",
    border: "1px solid rgba(59,130,246,0.3)",
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "6px 20px",
    borderRadius: 100,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-2px",
    marginBottom: 16,
    lineHeight: 1.1,
  },
  heroGradient: {
    background: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: 18,
    color: "#94a3b8",
    marginBottom: 40,
    maxWidth: 600,
    marginLeft: "auto",
    marginRight: "auto",
  },
  heroSearchWrap: {
    position: "relative",
    maxWidth: 520,
    margin: "0 auto",
  },
  heroSearchIcon: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    zIndex: 1,
  },
  heroSearch: {
    width: "100%",
    padding: "14px 20px 14px 48px",
    borderRadius: 60,
    fontSize: 14,
    color: "#1e293b",
    background: "#ffffff",
    border: "2px solid #e2e8f0",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  heroSearchClear: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
    background: "#e2e8f0",
    border: "none",
    borderRadius: "50%",
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#64748b",
  },
  particle1: { position: "absolute", top: "20%", left: "10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" },
  particle2: { position: "absolute", bottom: "10%", right: "5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" },
  particle3: { position: "absolute", top: "50%", right: "15%", width: 150, height: 150, background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" },
  particle4: { position: "absolute", bottom: "30%", left: "20%", width: 200, height: 200, background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" },

  main: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "32px 24px 60px",
  },

  /* ── Promo Banner ── */
  promoBanner: {
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    borderRadius: 20,
    padding: "16px 24px",
    marginBottom: 24,
    gap: 24,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  promoLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  promoFireIcon: {
    fontSize: 28,
    animation: "pulse 1.5s ease-in-out infinite",
  },
  promoLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  promoCountdown: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  promoDigit: {
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    fontSize: 18,
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
    borderRadius: 8,
    padding: "4px 10px",
    minWidth: 42,
    textAlign: "center",
    animation: "countPulse 1s ease-in-out infinite",
  },
  promoColon: {
    color: "#f87171",
    fontSize: 18,
    fontWeight: 800,
  },
  promoCenter: {
    flex: 1,
    overflow: "hidden",
  },
  tickerInner: {
    display: "flex",
    animation: "marquee 28s linear infinite",
  },
  tickerText: {
    fontSize: 13,
    fontWeight: 500,
    color: "#cbd5e1",
    whiteSpace: "nowrap",
    paddingRight: 32,
  },
  promoBtn: {
    flexShrink: 0,
    padding: "10px 20px",
    borderRadius: 40,
    border: "none",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    transition: "opacity 0.2s",
  },

  /* ── Trending Tags ── */
  trendSection: {
    marginBottom: 24,
  },
  trendHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  trendTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
  },
  trendSub: {
    fontSize: 12,
    color: "#94a3b8",
    background: "#f1f5f9",
    padding: "2px 10px",
    borderRadius: 20,
  },
  trendTags: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  trendTag: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 18px",
    borderRadius: 40,
    fontSize: 13,
    fontWeight: 500,
    border: "1.5px solid #e2e8f0",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  hotDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#ef4444",
    animation: "badgeGlow 1.5s ease-in-out infinite",
    display: "inline-block",
  },

  /* ── Recently Viewed ── */
  rvSection: {
    marginBottom: 28,
    background: "#ffffff",
    borderRadius: 20,
    padding: "18px 20px",
    border: "1px solid #e2e8f0",
  },
  rvHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  rvTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
  },
  rvCount: {
    fontSize: 11,
    color: "#94a3b8",
    background: "#f1f5f9",
    padding: "2px 10px",
    borderRadius: 20,
  },
  rvScroll: {
    overflowX: "auto",
  },
  rvRow: {
    display: "flex",
    gap: 12,
    paddingBottom: 4,
  },
  rvCard: {
    flexShrink: 0,
    width: 110,
    background: "#f8fafc",
    borderRadius: 14,
    overflow: "hidden",
    cursor: "pointer",
    border: "1px solid #e2e8f0",
    transition: "all 0.2s",
  },
  rvImgBox: {
    width: "100%",
    height: 80,
    background: "#f1f5f9",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rvImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s",
  },
  rvImgPlaceholder: {
    fontSize: 28,
  },
  rvInfo: {
    padding: "8px 10px",
  },
  rvName: {
    fontSize: 11,
    fontWeight: 600,
    color: "#1e293b",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginBottom: 2,
  },
  rvPrice: {
    fontSize: 11,
    fontWeight: 700,
    color: "#3b82f6",
  },

  /* ── Active tag inline badge ── */
  activeTagBadge: {
    marginLeft: 8,
    background: "#eff6ff",
    color: "#3b82f6",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 10px",
    borderRadius: 20,
    cursor: "pointer",
  },

  /* ── Toolbar ── */
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  catRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  catChipBtn: {
    padding: "8px 18px",
    borderRadius: 40,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1.5px solid #e2e8f0",
    fontFamily: "inherit",
  },
  controls: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  filterBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 16px",
    borderRadius: 40,
    border: "1.5px solid #e2e8f0",
    background: "#ffffff",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  sortSelect: {
    padding: "9px 16px",
    borderRadius: 40,
    border: "1.5px solid #e2e8f0",
    background: "#ffffff",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  viewToggle: {
    display: "flex",
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 40,
    overflow: "hidden",
  },
  viewBtn: {
    padding: "8px 12px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    background: "transparent",
  },
  priceFilter: {
    background: "#ffffff",
    padding: "20px 24px",
    borderRadius: 16,
    marginBottom: 24,
    border: "1px solid #e2e8f0",
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1e293b",
    display: "block",
    marginBottom: 12,
  },
  priceSlider: {
    width: "100%",
    height: 4,
    borderRadius: 4,
    background: "#e2e8f0",
    appearance: "none",
    cursor: "pointer",
  },
  priceRangeLabels: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8,
    fontSize: 12,
    color: "#64748b",
  },

  resultRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  resultCount: {
    fontSize: 13,
    color: "#64748b",
  },
  clearAllBtn: {
    fontSize: 12,
    color: "#ef4444",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 500,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 24,
  },
  listGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
  },

  /* ── Product Card ── */
  card: {
    background: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
  },
  imgBox: {
    position: "relative",
    cursor: "pointer",
    overflow: "hidden",
    height: 260,
    flexShrink: 0,
    background: "#f8fafc",
  },
  imgWrap: {
    width: "100%",
    height: "100%",
    transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
  },
  wishlistBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "rgba(255,255,255,0.9)",
    border: "none",
    borderRadius: "50%",
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2,
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(15,23,42,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.3s",
    zIndex: 1,
  },
  overlayBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 24px",
    borderRadius: 40,
    background: "#ffffff",
    border: "none",
    color: "#1e293b",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "transform 0.2s",
  },
  badgesStack: {
    position: "absolute",
    top: 12,
    left: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    zIndex: 2,
  },
  hotBadge: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 20,
    letterSpacing: "0.05em",
  },
  premiumBadge: {
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 20,
  },
  outBadge: {
    background: "#1e293b",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 20,
  },

  body: {
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catChip: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#8b5cf6",
    background: "#f3e8ff",
    padding: "4px 10px",
    borderRadius: 20,
  },
  name: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.3,
    cursor: "pointer",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  desc: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  stars: {
    display: "flex",
    alignItems: "center",
  },
  ratingCount: {
    fontSize: 11,
    color: "#94a3b8",
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
  },
  originalPrice: {
    fontSize: 13,
    color: "#94a3b8",
    textDecoration: "line-through",
  },
  discountBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: "#10b981",
    background: "#d1fae5",
    padding: "2px 8px",
    borderRadius: 20,
  },
  ruleLine: {
    height: 1,
    background: "#e2e8f0",
    marginTop: 4,
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: 8,
    alignItems: "center",
  },
  detailBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 12,
    border: "1.5px solid #3b82f6",
    background: "#eff6ff",
    color: "#3b82f6",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  addedBtn: {
    background: "#d1fae5",
    borderColor: "#10b981",
    color: "#10b981",
  },
  buyBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 12,
    border: "1.5px solid #f59e0b",
    background: "#fffbeb",
    color: "#d97706",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  disabledBtn: {
    background: "#f1f5f9",
    borderColor: "#cbd5e1",
    color: "#94a3b8",
    cursor: "not-allowed",
    pointerEvents: "none",
  },
  btnSpin: {
    width: 12,
    height: 12,
    border: "2px solid #cbd5e1",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },

  badgeIn: {
    fontSize: 10,
    fontWeight: 600,
    background: "#d1fae5",
    color: "#065f46",
    padding: "4px 10px",
    borderRadius: 20,
  },
  badgeLow: {
    fontSize: 10,
    fontWeight: 600,
    background: "#fed7aa",
    color: "#9a3412",
    padding: "4px 10px",
    borderRadius: 20,
  },
  badgeOut: {
    fontSize: 10,
    fontWeight: 600,
    background: "#fee2e2",
    color: "#991b1b",
    padding: "4px 10px",
    borderRadius: 20,
  },

  /* ── Skeletons ── */
  skelCard: {
    background: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  skelImg: {
    height: 260,
    background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
    backgroundSize: "600px 100%",
    animation: "shimmer 1.4s infinite linear",
  },
  skelLine: {
    height: 12,
    borderRadius: 6,
    background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
    backgroundSize: "600px 100%",
    animation: "shimmer 1.4s infinite linear",
  },

  /* ── Empty state ── */
  emptyBox: {
    background: "#ffffff",
    borderRadius: 24,
    padding: "80px 24px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 24, fontWeight: 700, color: "#1e293b", marginBottom: 8 },
  emptySub: { fontSize: 14, color: "#64748b", marginBottom: 24 },
  emptyResetBtn: {
    padding: "10px 24px",
    borderRadius: 40,
    border: "none",
    background: "#1e293b",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

/* keyframes injected once */
const extraStyles = document.createElement("style");
extraStyles.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes countPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
  @keyframes badgeGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } }
  .cat-chip:hover { transform: translateY(-2px); }
  .prod-overlay button:hover { transform: scale(1.05); }
`;
if (!document.getElementById("prod-extra-styles")) {
  extraStyles.id = "prod-extra-styles";
  document.head.appendChild(extraStyles);
}

export default Products;




