import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import API from "../services/api";

// ─── Custom Hooks ─────────────────────────────────────────────────────────────
const useCountdown = (targetHours = 8) => {
  const [time, setTime] = useState({ h: targetHours, m: 0, s: 0 });
  useEffect(() => {
    const end = Date.now() + targetHours * 3600 * 1000;
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetHours]);
  return time;
};

const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const update = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", update);
    return () => window.removeEventListener("mousemove", update);
  }, []);
  return position;
};

const pad = (n) => String(n).padStart(2, "0");

// ─── Components ──────────────────────────────────────────────────────────────
const FlipDigit = ({ value, label }) => (
  <div style={s.flipUnit}>
    <motion.div
      key={value}
      initial={{ rotateX: -90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={s.flipCard}
    >
      {pad(value)}
    </motion.div>
    <span style={s.flipLabel}>{label}</span>
  </div>
);

const GlowCard = ({ children, delay = 0, onClick, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay, duration: 0.5, type: "spring", stiffness: 100 }}
    whileHover={{ y: -6, transition: { duration: 0.2 } }}
    style={s.glowCard}
    onClick={onClick}
  >
    <div style={s.glowInner}>{children}</div>
  </motion.div>
);

const GradientButton = ({ children, onClick, variant = "primary", style = {} }) => (
  <motion.button
    whileHover={{ scale: 1.03, boxShadow: "0 8px 28px rgba(99,102,241,0.35)" }}
    whileTap={{ scale: 0.97 }}
    style={{ ...s.gradientBtn, ...(variant === "secondary" ? s.gradientBtnSecondary : {}), ...style }}
    onClick={onClick}
  >
    {children}
  </motion.button>
);

const AnimatedSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ delay, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const [userName, setUserName] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifVisible, setNotifVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("featured");
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const heroRef = useRef(null);
  const mousePos = useMousePosition();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, prodRes] = await Promise.all([
          API.get("/user/me"),
          API.get("/products"),
        ]);
        setUserName(userRes.data.name?.split(" ")[0] || "Customer");
        const enriched = (prodRes.data || []).map((p, i) => ({
          ...p,
          emoji: ["📱", "👟", "🎧", "💻", "⌚", "📷", "🎮", "👜", "🕶️", "🧥"][i % 10],
          category: ["Electronics", "Fashion", "Audio", "Computers", "Accessories", "Photography", "Gaming", "Bags", "Luxury", "Sports"][i % 10],
          rating: 3.5 + (i % 3) * 0.5,
          originalPrice: Math.round(p.price * (1.15 + (i % 3) * 0.1)),
          reviews: Math.floor(Math.random() * 500) + 20,
        }));
        setFeaturedProducts(enriched.slice(0, 12));
      } catch {
        setUserName("Guest");
        setFeaturedProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = [
    { name: "All", icon: "✨", color: "#6366F1" },
    { name: "Electronics", icon: "📱", color: "#3B82F6" },
    { name: "Fashion", icon: "👕", color: "#EC4899" },
    { name: "Home", icon: "🏠", color: "#10B981" },
    { name: "Books", icon: "📚", color: "#F59E0B" },
    { name: "Sports", icon: "⚽", color: "#EF4444" },
    { name: "Beauty", icon: "💄", color: "#F43F5E" },
    { name: "Gaming", icon: "🎮", color: "#8B5CF6" },
  ];

  const deals = [
    { title: "Flash Sale", subtitle: "Up to 70% off", emoji: "⚡", color: "#F59E0B", bg: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)" },
    { title: "New Arrivals", subtitle: "Fresh drops weekly", emoji: "✨", color: "#8B5CF6", bg: "linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)" },
    { title: "Trending Now", subtitle: "Hottest picks", emoji: "🔥", color: "#EF4444", bg: "linear-gradient(135deg, #FEE2E2 0%, #FEF2F2 100%)" },
    { title: "Bundle & Save", subtitle: "Extra 15% off", emoji: "🎁", color: "#10B981", bg: "linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%)" },
  ];

  const perks = [
    { icon: "🚚", title: "Free Delivery", desc: "On orders ₹499+", color: "#3B82F6" },
    { icon: "🔄", title: "Easy Returns", desc: "30-day policy", color: "#10B981" },
    { icon: "🔒", title: "Secure Checkout", desc: "PCI-DSS compliant", color: "#8B5CF6" },
    { icon: "🎧", title: "24/7 Support", desc: "Instant assistance", color: "#F59E0B" },
    { icon: "💳", title: "0% EMI", desc: "On select cards", color: "#EC4899" },
    { icon: "🎁", title: "Gift Wrapping", desc: "Premium packaging", color: "#EF4444" },
  ];

  const testimonials = [
    { name: "Rahul Sharma", city: "Mumbai", rating: 5, text: "Absolutely love the quality! The packaging was exquisite and delivery was 2 days early. Will definitely shop again.", avatar: "RS", badge: "Verified Buyer" },
    { name: "Priya Patel", city: "Bangalore", rating: 5, text: "Best shopping experience ever! Customer support helped me find the perfect size. The app is buttery smooth!", avatar: "PP", badge: "Top Reviewer" },
    { name: "Amit Kumar", city: "Delhi", rating: 5, text: "Genuine products at competitive prices. The loyalty program is a game-changer. Highly recommended!", avatar: "AK", badge: "Frequent Shopper" },
    { name: "Sneha Reddy", city: "Hyderabad", rating: 5, text: "The unboxing experience was magical. Every detail, from the packaging to the handwritten note, was perfect.", avatar: "SR", badge: "Trendsetter" },
  ];

  const stats = [
    { value: "50K+", label: "Happy Customers", icon: "😊", trend: "+22%" },
    { value: "10K+", label: "Products", icon: "📦", trend: "+15%" },
    { value: "500+", label: "Brands", icon: "🏷️", trend: "+8%" },
    { value: "4.9★", label: "Avg Rating", icon: "⭐", trend: "+0.3" },
  ];

  const filteredProducts = featuredProducts.filter((p) =>
    activeCategory === "All" || p.category === activeCategory
  );

  const tabProducts = activeTab === "featured"
    ? filteredProducts
    : activeTab === "new"
    ? [...filteredProducts].sort((a, b) => b.id - a.id)
    : filteredProducts.filter((_, i) => i % 2 === 0);

  const countdown = useCountdown(6);

  if (loading) {
    return (
      <div style={s.loadingScreen}>
        <div style={s.loadingBg} />
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={s.loadingLogo}
        >
          🛍️
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={s.loadingBar}
        />
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={s.loadingText}
        >
          Crafting your experience...
        </motion.p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Animated Background Gradient */}
      <div style={s.bgGradient} />

      {/* Floating Mouse Follower */}
      <motion.div
        animate={{ x: mousePos.x - 150, y: mousePos.y - 150 }}
        transition={{ type: "spring", stiffness: 30, damping: 20 }}
        style={s.mouseGlow}
      />

      {/* Announcement Banner */}
      <AnimatePresence>
        {notifVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={s.banner}
          >
            <span>🎉 New customer? Use code <strong style={{ color: "#F59E0B" }}>WELCOME200</strong> to save ₹200 on your first order.</span>
            <button style={s.bannerClose} onClick={() => setNotifVisible(false)}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Search Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={s.searchBar}
      >
        <motion.div
          animate={{ width: searchFocused ? 560 : 480 }}
          transition={{ duration: 0.25 }}
          style={{ ...s.searchWrap, boxShadow: searchFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "0 4px 20px rgba(0,0,0,0.04)" }}
        >
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="Search 10,000+ products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery && (
            <motion.button whileTap={{ scale: 0.9 }} style={s.clearBtn} onClick={() => setSearchQuery("")}>
              ✕
            </motion.button>
          )}
        </motion.div>
        <GradientButton onClick={() => navigate("/cart")} style={s.cartBtnNav}>
          🛒 <span style={s.cartBadge}>3</span>
        </GradientButton>
      </motion.div>

      {/* Hero Section */}
      <motion.section ref={heroRef} style={{ ...s.hero, opacity: heroOpacity, scale: heroScale }}>
        <div style={s.heroBg}>
          <div style={s.heroGlow1} />
          <div style={s.heroGlow2} />
        </div>
        <div style={s.heroContent}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={s.heroPill}
          >
            <span style={s.pulseDot} /> 🔥 Flash Sale — Up to 70% off
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={s.heroHeading}
          >
            Welcome back,<br />
            <span style={s.heroName}>{userName}</span>
            <span style={s.heroAccent}> ✨</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={s.heroSub}
          >
            Discover premium products at unbeatable prices. 
            Free shipping on orders above ₹499.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={s.heroBtns}
          >
            <GradientButton onClick={() => navigate("/products")}>
              Shop Now →
            </GradientButton>
            <GradientButton variant="secondary" onClick={() => navigate("/deals")}>
              View Deals
            </GradientButton>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={s.heroStats}
          >
            {stats.map((stat, i) => (
              <div key={stat.label} style={s.heroStat}>
                <span style={s.heroStatIcon}>{stat.icon}</span>
                <div>
                  <span style={s.heroStatValue}>{stat.value}</span>
                  <span style={s.heroStatLabel}>{stat.label}</span>
                </div>
                <span style={s.heroStatTrend}>↑ {stat.trend}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 80 }}
          style={s.heroVisual}
        >
          <div style={s.hero3dCard}>
            <div style={s.hero3dInner}>
              <span style={s.hero3dEmoji}>🛍️</span>
              <div style={s.hero3dBadge}>
                <span>⭐ 4.9</span>
                <span>Trusted by 50K+</span>
              </div>
            </div>
          </div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={s.heroFloat1}
          >
            <span>🚀</span> Free Shipping
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            style={s.heroFloat2}
          >
            <span>💎</span> Premium Quality
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Flash Sale Countdown */}
      <AnimatedSection>
        <div style={s.saleSection}>
          <div style={s.saleHeader}>
            <div>
              <h2 style={s.saleTitle}>
                <span style={s.saleTitleIcon}>⚡</span> Flash Sale
              </h2>
              <p style={s.saleSub}>Hurry — prices will rise soon</p>
            </div>
            <div style={s.flipRow}>
              <FlipDigit value={countdown.h} label="HOURS" />
              <span style={s.flipColon}>:</span>
              <FlipDigit value={countdown.m} label="MINUTES" />
              <span style={s.flipColon}>:</span>
              <FlipDigit value={countdown.s} label="SECONDS" />
            </div>
          </div>
          <div style={s.saleGrid}>
            {SALE_ITEMS.map((item, i) => (
              <GlowCard key={item.name} delay={i * 0.08} onClick={() => navigate("/products")}>
                <div style={s.saleCard}>
                  <span style={s.saleEmoji}>{item.emoji}</span>
                  <div style={s.saleInfo}>
                    <p style={s.saleName}>{item.name}</p>
                    <p style={s.salePrice}>₹{item.price.toLocaleString("en-IN")}</p>
                  </div>
                  <span style={s.discBadge}>-{item.disc}%</span>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Deal Banners */}
      <div style={s.container}>
        <div style={s.dealsGrid}>
          {deals.map((d, i) => (
            <GlowCard key={d.title} delay={i * 0.1} onClick={() => navigate("/products")}>
              <div style={{ ...s.dealCard, background: d.bg }}>
                <span style={s.dealEmoji}>{d.emoji}</span>
                <div>
                  <h3 style={{ ...s.dealTitle, color: d.color }}>{d.title}</h3>
                  <p style={s.dealSub}>{d.subtitle}</p>
                </div>
                <span style={{ ...s.dealArrow, color: d.color }}>→</span>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={s.container}>
        <AnimatedSection>
          <div style={s.sectionHeader}>
            <div>
              <span style={s.sectionBadge}>Shop by</span>
              <h2 style={s.sectionTitle}>Browse Categories</h2>
            </div>
          </div>
          <div style={s.catRow}>
            {categories.map((cat, i) => (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.94 }}
                style={{
                  ...s.catChip,
                  background: activeCategory === cat.name ? cat.color : "white",
                  color: activeCategory === cat.name ? "white" : "#1E293B",
                  borderColor: activeCategory === cat.name ? "transparent" : "#E2E8F0",
                }}
                onClick={() => setActiveCategory(cat.name)}
              >
                <span style={s.catChipIcon}>{cat.icon}</span>
                {cat.name}
              </motion.button>
            ))}
          </div>
        </AnimatedSection>
      </div>

      {/* Products Section */}
      <div style={s.container}>
        <AnimatedSection>
          <div style={s.tabBar}>
            {[
              { id: "featured", label: "✨ Featured", icon: "✨" },
              { id: "new", label: "🆕 New Arrivals", icon: "🆕" },
              { id: "trending", label: "🔥 Trending", icon: "🔥" },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ y: -2 }}
                style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {activeTab === tab.id && <motion.div layoutId="activeTab" style={s.tabIndicator} />}
              </motion.button>
            ))}
          </div>
        </AnimatedSection>

        <div style={s.productsGrid}>
          {tabProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -8 }}
              onHoverStart={() => setHoveredProduct(product.id)}
              onHoverEnd={() => setHoveredProduct(null)}
              style={s.productCard}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {i < 2 && <span style={s.productBadge}>{i === 0 ? "🔥 Best Seller" : "⭐ New"}</span>}
              <button
                style={{ ...s.wishBtn, color: hoveredProduct === product.id ? "#EF4444" : "#94A3B8" }}
                onClick={(e) => { e.stopPropagation(); }}
              >
                ♡
              </button>
              <div style={s.productImageWrap}>
                <span style={s.productEmoji}>{product.emoji || "🛍️"}</span>
              </div>
              <div style={s.productInfo}>
                <p style={s.productCategory}>{product.category}</p>
                <h3 style={s.productName}>{product.name}</h3>
                <div style={s.productRating}>
                  <span style={s.stars}>
                    {"★".repeat(Math.floor(product.rating))}{"☆".repeat(5 - Math.floor(product.rating))}
                  </span>
                  <span style={s.reviewCount}>({product.reviews || 128})</span>
                </div>
                <div style={s.priceRow}>
                  <span style={s.price}>₹{product.price.toLocaleString("en-IN")}</span>
                  <span style={s.originalPrice}>₹{product.originalPrice.toLocaleString("en-IN")}</span>
                  <span style={s.discountPill}>-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
                </div>
                <GradientButton variant="secondary" style={s.productBtn}>
                  🛒 Add to Cart
                </GradientButton>
              </div>
              {hoveredProduct === product.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={s.quickView}
                >
                  Quick View
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <div style={s.loadMoreWrap}>
          <GradientButton variant="secondary" onClick={() => navigate("/products")}>
            Browse All Products →
          </GradientButton>
        </div>
      </div>

      {/* Perks Section */}
      <div style={s.perksSection}>
        <div style={s.container}>
          <AnimatedSection>
            <div style={s.perksGrid}>
              {perks.map((perk, i) => (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  style={s.perkCard}
                >
                  <div style={{ ...s.perkIcon, background: `${perk.color}15`, color: perk.color }}>
                    {perk.icon}
                  </div>
                  <h4 style={s.perkTitle}>{perk.title}</h4>
                  <p style={s.perkDesc}>{perk.desc}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Testimonials */}
      <div style={s.testimonialsSection}>
        <div style={s.container}>
          <AnimatedSection>
            <div style={s.sectionHeaderCentered}>
              <span style={s.sectionBadge}>Testimonials</span>
              <h2 style={s.sectionTitle}>What Our Customers Say</h2>
              <p style={s.sectionSub}>Join 50,000+ happy shoppers</p>
            </div>
            <div style={s.testimonialsGrid}>
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  style={s.testimonialCard}
                >
                  <div style={s.testimonialHeader}>
                    <div style={s.testimonialAvatar}>{t.avatar}</div>
                    <div>
                      <p style={s.testimonialName}>{t.name}</p>
                      <p style={s.testimonialCity}>📍 {t.city}</p>
                    </div>
                    <div style={s.testimonialRating}>
                      {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
                    </div>
                  </div>
                  <p style={s.testimonialText}>"{t.text}"</p>
                  <div style={s.testimonialBadge}>
                    <span>✓</span> {t.badge}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Newsletter Section */}
      <div style={s.newsletterSection}>
        <div style={s.newsletterInner}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span style={s.newsletterIcon}>📬</span>
            <h2 style={s.newsletterTitle}>Get Exclusive Deals</h2>
            <p style={s.newsletterSub}>Be the first to know about sales, new arrivals, and secret offers.</p>
            <div style={s.newsletterForm}>
              <input type="email" placeholder="Enter your email" style={s.newsletterInput} />
              <GradientButton>Subscribe →</GradientButton>
            </div>
            <p style={s.newsletterNote}>No spam. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerColumn}>
            <span style={s.footerLogo}>🛍️ ShopEase</span>
            <p style={s.footerDesc}>Premium e-commerce experience since 2025.</p>
            <div style={s.socialLinks}>
              {["📘", "📷", "🐦", "🎵"].map((soc, i) => (
                <motion.a key={i} whileHover={{ scale: 1.1, y: -2 }} href="#" style={s.socialLink}>
                  {soc}
                </motion.a>
              ))}
            </div>
          </div>
          {[
            { title: "Shop", links: ["All Products", "New Arrivals", "Best Sellers", "Deals"] },
            { title: "Support", links: ["Help Center", "Returns", "Shipping", "Contact"] },
            { title: "Company", links: ["About Us", "Careers", "Blog", "Press"] },
            { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
          ].map((col) => (
            <div key={col.title} style={s.footerColumn}>
              <h4 style={s.footerTitle}>{col.title}</h4>
              {col.links.map((link) => (
                /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
                <a key={link} href="#" style={s.footerLink}>{link}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={s.footerBottom}>
          <span>© 2025 ShopEase. All rights reserved.</span>
          <span>Made with ❤️ for premium shopping</span>
        </div>
      </div>
    </div>
  );
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: 1, name: "Premium Wireless Headphones", price: 4999, originalPrice: 7999, category: "Electronics", emoji: "🎧", rating: 5, reviews: 234 },
  { id: 2, name: "Running Shoes Pro X", price: 3299, originalPrice: 4999, category: "Sports", emoji: "👟", rating: 4, reviews: 189 },
  { id: 3, name: "Smart Watch Series 7", price: 12999, originalPrice: 17999, category: "Electronics", emoji: "⌚", rating: 5, reviews: 456 },
  { id: 4, name: "Linen Summer Shirt", price: 1499, originalPrice: 2499, category: "Fashion", emoji: "👕", rating: 4, reviews: 92 },
  { id: 5, name: "Portable SSD 1TB", price: 5999, originalPrice: 8999, category: "Electronics", emoji: "💾", rating: 5, reviews: 78 },
  { id: 6, name: "Yoga Mat Premium", price: 999, originalPrice: 1599, category: "Sports", emoji: "🧘", rating: 4, reviews: 312 },
  { id: 7, name: "Coffee Table Book", price: 799, originalPrice: 1299, category: "Books", emoji: "📚", rating: 4, reviews: 45 },
  { id: 8, name: "Skincare Essentials Kit", price: 2199, originalPrice: 3499, category: "Beauty", emoji: "✨", rating: 5, reviews: 167 },
];

const SALE_ITEMS = [
  { name: "AirPods Pro", emoji: "🎧", price: 8999, disc: 35 },
  { name: "Nike Air Max", emoji: "👟", price: 4499, disc: 40 },
  { name: "iPad Mini", emoji: "📱", price: 29999, disc: 20 },
  { name: "Kindle", emoji: "📖", price: 7999, disc: 25 },
  { name: "Sony Headphones", emoji: "🎧", price: 14999, disc: 30 },
  { name: "Apple Watch", emoji: "⌚", price: 24999, disc: 15 },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const ACCENT = "#6366F1";
const s = {
  page: {
    position: "relative",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: "#F8FAFC",
    minHeight: "100vh",
    overflowX: "hidden",
  },
  bgGradient: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 20% 80%, rgba(99,102,241,0.03) 0%, transparent 50%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  mouseGlow: {
    position: "fixed",
    width: "300px",
    height: "300px",
    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },

  /* Loading */
  loadingScreen: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0F0E17 0%, #1A1A2E 100%)",
    position: "relative",
    gap: "24px",
  },
  loadingBg: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 30% 40%, rgba(99,102,241,0.15) 0%, transparent 60%)",
  },
  loadingLogo: { fontSize: "72px", position: "relative", zIndex: 1 },
  loadingBar: {
    width: "280px",
    height: "4px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "99px",
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
  },
  loadingText: { color: "#A1A1AA", fontSize: "14px", letterSpacing: "0.2em", textTransform: "uppercase", position: "relative", zIndex: 1 },

  /* Banner */
  banner: {
    background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
    color: "#C7D2FE",
    textAlign: "center",
    padding: "12px 40px",
    fontSize: "13px",
    position: "relative",
    zIndex: 20,
  },
  bannerClose: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#A5B4FC",
    cursor: "pointer",
    fontSize: "16px",
  },

  /* Search Bar */
  searchBar: {
    position: "sticky",
    top: 0,
    zIndex: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "14px 32px",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(226,232,240,0.6)",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    background: "white",
    borderRadius: "60px",
    padding: "0 20px",
    gap: "12px",
    border: "1px solid #E2E8F0",
    transition: "all 0.25s",
  },
  searchIcon: { fontSize: "16px", opacity: 0.6 },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    padding: "12px 0",
    width: "100%",
    background: "transparent",
    color: "#1E293B",
  },
  clearBtn: {
    background: "#F1F5F9",
    border: "none",
    borderRadius: "50%",
    width: "22px",
    height: "22px",
    cursor: "pointer",
    color: "#64748B",
    fontSize: "11px",
  },
  cartBtnNav: { padding: "10px 24px", position: "relative" },
  cartBadge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    background: "#EF4444",
    color: "white",
    borderRadius: "99px",
    padding: "2px 6px",
    fontSize: "10px",
    fontWeight: "700",
  },

  /* Hero */
  hero: {
    position: "relative",
    minHeight: "620px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "60px 60px 80px",
    gap: "40px",
    overflow: "hidden",
    zIndex: 1,
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #4C1D95 100%)",
    zIndex: -2,
  },
  heroGlow1: {
    position: "absolute",
    top: "-30%",
    right: "-20%",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
    borderRadius: "50%",
  },
  heroGlow2: {
    position: "absolute",
    bottom: "-20%",
    left: "-10%",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)",
    borderRadius: "50%",
  },
  heroContent: { flex: 1, position: "relative", zIndex: 2 },
  heroPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(8px)",
    borderRadius: "99px",
    padding: "6px 18px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#FCA5A5",
    marginBottom: "24px",
    border: "1px solid rgba(255,255,255,0.15)",
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    background: "#EF4444",
    borderRadius: "50%",
    display: "inline-block",
    animation: "pulse 1.5s infinite",
  },
  heroHeading: {
    fontSize: "clamp(40px, 5vw, 64px)",
    fontWeight: "800",
    color: "white",
    lineHeight: 1.15,
    marginBottom: "20px",
    letterSpacing: "-0.02em",
  },
  heroName: {
    background: "linear-gradient(135deg, #A5B4FC, #E879F9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroAccent: { fontSize: "clamp(40px, 5vw, 64px)" },
  heroSub: {
    fontSize: "17px",
    color: "rgba(255,255,255,0.7)",
    marginBottom: "32px",
    maxWidth: "460px",
    lineHeight: 1.5,
  },
  heroBtns: { display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "48px" },
  heroStats: {
    display: "flex",
    gap: "32px",
    flexWrap: "wrap",
    borderTop: "1px solid rgba(255,255,255,0.15)",
    paddingTop: "32px",
  },
  heroStat: { display: "flex", alignItems: "center", gap: "12px" },
  heroStatIcon: { fontSize: "24px" },
  heroStatValue: { fontSize: "18px", fontWeight: "700", color: "white", display: "block" },
  heroStatLabel: { fontSize: "12px", color: "#A5B4FC", display: "block" },
  heroStatTrend: { fontSize: "11px", color: "#10B981", fontWeight: "600" },

  heroVisual: { flex: "0 0 320px", position: "relative", zIndex: 2 },
  hero3dCard: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
    backdropFilter: "blur(16px)",
    borderRadius: "32px",
    padding: "40px",
    border: "1px solid rgba(255,255,255,0.2)",
    transform: "rotateY(10deg) rotateX(5deg)",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
  },
  hero3dInner: { textAlign: "center" },
  hero3dEmoji: { fontSize: "100px", display: "block", marginBottom: "20px" },
  hero3dBadge: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    fontSize: "12px",
    color: "#A5B4FC",
  },
  heroFloat1: {
    position: "absolute",
    top: "10%",
    right: "-15%",
    background: "rgba(255,255,255,0.9)",
    padding: "8px 16px",
    borderRadius: "40px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#1E293B",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  heroFloat2: {
    position: "absolute",
    bottom: "15%",
    left: "-20%",
    background: "rgba(255,255,255,0.9)",
    padding: "8px 16px",
    borderRadius: "40px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#1E293B",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  /* Sale Section */
  saleSection: {
    background: "linear-gradient(135deg, #1E1B4B 0%, #2D2A5E 100%)",
    margin: "0 24px 40px",
    borderRadius: "32px",
    padding: "32px 40px",
  },
  saleHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  saleTitle: { fontSize: "28px", fontWeight: "800", color: "white", margin: 0, display: "flex", alignItems: "center", gap: "10px" },
  saleTitleIcon: { fontSize: "32px" },
  saleSub: { fontSize: "13px", color: "#A5B4FC", marginTop: "4px" },
  flipRow: { display: "flex", alignItems: "center", gap: "8px" },
  flipUnit: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" },
  flipCard: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(8px)",
    color: "white",
    fontSize: "28px",
    fontWeight: "800",
    borderRadius: "12px",
    padding: "10px 18px",
    minWidth: "60px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.15)",
    fontFamily: "monospace",
  },
  flipLabel: { fontSize: "10px", color: "#94A3B8", letterSpacing: "0.1em", fontWeight: "500" },
  flipColon: { fontSize: "28px", fontWeight: "800", color: "white", marginBottom: "14px" },
  saleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" },
  saleCard: { display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" },
  saleEmoji: { fontSize: "40px" },
  saleInfo: { flex: 1 },
  saleName: { color: "white", fontWeight: "600", fontSize: "14px", margin: "0 0 4px" },
  salePrice: { color: "#A5B4FC", fontSize: "16px", fontWeight: "700", margin: 0 },
  discBadge: { background: "#EF4444", color: "white", borderRadius: "8px", padding: "4px 12px", fontSize: "12px", fontWeight: "700" },

  /* Container & Grid */
  container: { maxWidth: "1280px", margin: "0 auto", padding: "0 24px" },

  dealsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "48px" },
  dealCard: { borderRadius: "24px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" },
  dealEmoji: { fontSize: "40px" },
  dealTitle: { fontSize: "18px", fontWeight: "700", margin: "0 0 4px" },
  dealSub: { fontSize: "13px", color: "#475569", margin: 0 },
  dealArrow: { marginLeft: "auto", fontSize: "22px", fontWeight: "700" },

  /* Categories */
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" },
  sectionHeaderCentered: { textAlign: "center", marginBottom: "48px" },
  sectionBadge: {
    display: "inline-block",
    background: "#EEF2FF",
    color: ACCENT,
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 12px",
    borderRadius: "99px",
    marginBottom: "12px",
  },
  sectionTitle: { fontSize: "32px", fontWeight: "800", color: "#1E293B", margin: 0 },
  sectionSub: { fontSize: "15px", color: "#64748B", marginTop: "8px" },

  catRow: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "48px" },
  catChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "99px",
    padding: "10px 22px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1.5px solid #E2E8F0",
  },
  catChipIcon: { fontSize: "16px" },

  /* Tabs */
  tabBar: { display: "flex", gap: "12px", marginBottom: "32px", borderBottom: "2px solid #E2E8F0", paddingBottom: "12px", position: "relative" },
  tab: {
    position: "relative",
    background: "none",
    border: "none",
    padding: "8px 20px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#94A3B8",
    cursor: "pointer",
    transition: "color 0.2s",
  },
  tabActive: { color: ACCENT },
  tabIndicator: {
    position: "absolute",
    bottom: "-14px",
    left: 0,
    right: 0,
    height: "3px",
    background: ACCENT,
    borderRadius: "3px",
  },

  /* Products */
  productsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px", marginBottom: "48px" },
  productCard: {
    position: "relative",
    background: "white",
    borderRadius: "24px",
    overflow: "hidden",
    cursor: "pointer",
    border: "1px solid #F1F5F9",
    transition: "all 0.3s",
  },
  productBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "linear-gradient(135deg, #F59E0B, #EF4444)",
    color: "white",
    fontSize: "10px",
    fontWeight: "700",
    padding: "4px 12px",
    borderRadius: "99px",
    zIndex: 2,
  },
  wishBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "white",
    border: "none",
    borderRadius: "50%",
    width: "34px",
    height: "34px",
    fontSize: "18px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    zIndex: 2,
    transition: "all 0.2s",
  },
  productImageWrap: { background: "#F8FAFC", height: "200px", display: "flex", alignItems: "center", justifyContent: "center" },
  productEmoji: { fontSize: "72px" },
  productInfo: { padding: "16px 20px 20px" },
  productCategory: { fontSize: "11px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" },
  productName: { fontSize: "16px", fontWeight: "700", color: "#1E293B", margin: "0 0 8px", lineHeight: 1.4 },
  productRating: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" },
  stars: { fontSize: "12px", color: "#F59E0B", letterSpacing: "2px" },
  reviewCount: { fontSize: "11px", color: "#94A3B8" },
  priceRow: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "16px" },
  price: { fontSize: "20px", fontWeight: "800", color: ACCENT },
  originalPrice: { fontSize: "13px", color: "#94A3B8", textDecoration: "line-through" },
  discountPill: { background: "#FEE2E2", color: "#EF4444", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px" },
  productBtn: { width: "100%" },
  quickView: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "700",
    fontSize: "14px",
  },

  loadMoreWrap: { textAlign: "center", marginTop: "16px" },

  /* Perks */
  perksSection: { background: "white", padding: "64px 0", marginTop: "40px" },
  perksGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" },
  perkCard: {
    textAlign: "center",
    padding: "24px 20px",
    borderRadius: "20px",
    transition: "all 0.3s",
    background: "#F8FAFC",
  },
  perkIcon: { fontSize: "32px", width: "64px", height: "64px", borderRadius: "32px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  perkTitle: { fontSize: "16px", fontWeight: "700", color: "#1E293B", margin: "0 0 6px" },
  perkDesc: { fontSize: "13px", color: "#64748B", margin: 0 },

  /* Testimonials */
  testimonialsSection: { background: "#F8FAFC", padding: "64px 0" },
  testimonialsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" },
  testimonialCard: {
    background: "white",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #F1F5F9",
    transition: "all 0.3s",
  },
  testimonialHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
  testimonialAvatar: {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    color: "white",
  },
  testimonialName: { fontWeight: "700", margin: 0 },
  testimonialCity: { fontSize: "12px", color: "#94A3B8", margin: "2px 0 0" },
  testimonialRating: { marginLeft: "auto", fontSize: "12px", color: "#F59E0B" },
  testimonialText: { fontSize: "14px", color: "#475569", lineHeight: 1.6, marginBottom: "16px" },
  testimonialBadge: { display: "inline-flex", alignItems: "center", gap: "6px", background: "#EEF2FF", color: ACCENT, fontSize: "11px", fontWeight: "600", padding: "4px 12px", borderRadius: "99px" },

  /* Newsletter */
  newsletterSection: { background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)", padding: "64px 24px", textAlign: "center" },
  newsletterInner: { maxWidth: "560px", margin: "0 auto" },
  newsletterIcon: { fontSize: "48px", display: "block", marginBottom: "16px" },
  newsletterTitle: { fontSize: "32px", fontWeight: "800", color: "white", marginBottom: "12px" },
  newsletterSub: { color: "#94A3B8", fontSize: "15px", marginBottom: "28px" },
  newsletterForm: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" },
  newsletterInput: {
    background: "#334155",
    border: "1px solid #475569",
    borderRadius: "60px",
    padding: "14px 24px",
    fontSize: "14px",
    color: "white",
    width: "280px",
    outline: "none",
  },
  newsletterNote: { fontSize: "12px", color: "#64748B" },

  /* Footer */
  footer: { background: "#0F172A", padding: "48px 24px 24px" },
  footerInner: { maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "32px", marginBottom: "48px" },
  footerColumn: { display: "flex", flexDirection: "column", gap: "12px" },
  footerLogo: { fontSize: "22px", fontWeight: "800", color: "white", marginBottom: "8px" },
  footerDesc: { fontSize: "13px", color: "#64748B", lineHeight: 1.5 },
  socialLinks: { display: "flex", gap: "16px", marginTop: "8px" },
  socialLink: { fontSize: "24px", textDecoration: "none", cursor: "pointer", transition: "transform 0.2s" },
  footerTitle: { fontSize: "14px", fontWeight: "700", color: "white", marginBottom: "8px" },
  footerLink: { fontSize: "13px", color: "#64748B", textDecoration: "none", transition: "color 0.2s" },
  footerBottom: { textAlign: "center", paddingTop: "24px", borderTop: "1px solid #1E293B", fontSize: "12px", color: "#475569", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" },

  /* Gradient Button */
  gradientBtn: {
    background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
    color: "white",
    border: "none",
    borderRadius: "60px",
    padding: "12px 28px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  gradientBtnSecondary: {
    background: "transparent",
    border: "2px solid #6366F1",
    color: "#6366F1",
  },
  glowCard: {
    background: "white",
    borderRadius: "24px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s",
  },
};

// Add keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  .prod-card:hover .prod-overlay {
    opacity: 1;
  }
`;
document.head.appendChild(styleSheet);

export default Home;
