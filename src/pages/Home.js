import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndProducts = async () => {
      try {
        // Fetch user name
        const userResponse = await API.get("/user/me");
        setUserName(userResponse.data.name || "Customer");
        
        // Fetch featured products (top 4)
        const productsResponse = await API.get("/products");
        setFeaturedProducts(productsResponse.data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching data:", error);
        setUserName("Customer");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndProducts();
  }, []);

  const categories = [
    { name: "Electronics", icon: "📱", color: "#667eea", bg: "#e0e7ff" },
    { name: "Fashion", icon: "👕", color: "#f59e0b", bg: "#fef3c7" },
    { name: "Home & Living", icon: "🏠", color: "#10b981", bg: "#d1fae5" },
    { name: "Books", icon: "📚", color: "#ef4444", bg: "#fee2e2" },
    { name: "Sports", icon: "⚽", color: "#8b5cf6", bg: "#ede9fe" },
    { name: "Beauty", icon: "💄", color: "#ec4899", bg: "#fce7f3" },
  ];

  const testimonials = [
    { name: "Rahul Sharma", rating: 5, text: "Amazing products! Fast delivery and great quality.", icon: "👨" },
    { name: "Priya Patel", rating: 5, text: "Best shopping experience ever. Highly recommended!", icon: "👩" },
    { name: "Amit Kumar", rating: 4, text: "Good products at reasonable prices. Will shop again.", icon: "👨" },
  ];

  const stats = [
    { value: "50K+", label: "Happy Customers", icon: "😊" },
    { value: "10K+", label: "Products Sold", icon: "📦" },
    { value: "500+", label: "Brands", icon: "🏷️" },
    { value: "24/7", label: "Support", icon: "🎧" },
  ];

  if (loading) {
    return (
      <div style={styles.loading}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={styles.spinner}
        />
        <p>Loading your personalized experience...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={styles.hero}
      >
        <div style={styles.heroContent}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            style={styles.welcomeEmoji}
          >
            🎉
          </motion.div>
          <h1 style={styles.welcomeText}>
            Welcome to ShopEase, <span style={styles.userName}>{userName}</span>!
          </h1>
          <p style={styles.tagline}>
            Your one-stop destination for premium products, exclusive deals, and unforgettable shopping experiences.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={styles.shopBtn}
            onClick={() => navigate("/products")}
          >
            Start Shopping →
          </motion.button>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={styles.heroImage}
        >
          🛍️
        </motion.div>
      </motion.div>

      {/* Stats Section */}
      <div style={styles.statsSection}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={styles.statCard}
          >
            <div style={styles.statIcon}>{stat.icon}</div>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Categories Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Shop by Category</h2>
        <div style={styles.categoriesGrid}>
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              style={{ ...styles.categoryCard, background: cat.bg }}
              onClick={() => navigate("/products")}
            >
              <div style={{ ...styles.categoryIcon, color: cat.color }}>{cat.icon}</div>
              <h3 style={styles.categoryName}>{cat.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>✨ Featured Products</h2>
          <div style={styles.featuredGrid}>
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                style={styles.featuredCard}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div style={styles.featuredImage}>🛍️</div>
                <h3 style={styles.featuredName}>{product.name}</h3>
                <p style={styles.featuredPrice}>₹{product.price.toLocaleString("en-IN")}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  style={styles.featuredBtn}
                >
                  View Details
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>⭐ What Our Customers Say</h2>
        <div style={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              style={styles.testimonialCard}
            >
              <div style={styles.testimonialIcon}>{testimonial.icon}</div>
              <div style={styles.testimonialStars}>
                {"⭐".repeat(testimonial.rating)}
              </div>
              <p style={styles.testimonialText}>"{testimonial.text}"</p>
              <h4 style={styles.testimonialName}>{testimonial.name}</h4>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.newsletter}
      >
        <h2 style={styles.newsletterTitle}>📧 Stay Updated!</h2>
        <p style={styles.newsletterText}>
          Subscribe to our newsletter and get exclusive deals straight to your inbox.
        </p>
        <div style={styles.newsletterForm}>
          <input
            type="email"
            placeholder="Enter your email"
            style={styles.newsletterInput}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={styles.newsletterBtn}
          >
            Subscribe
          </motion.button>
        </div>
      </motion.div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <div style={styles.featureItem}>
          <div style={styles.featureIcon}>🚚</div>
          <h4>Free Shipping</h4>
          <p>On orders above ₹500</p>
        </div>
        <div style={styles.featureItem}>
          <div style={styles.featureIcon}>🔄</div>
          <h4>Easy Returns</h4>
          <p>30-day return policy</p>
        </div>
        <div style={styles.featureItem}>
          <div style={styles.featureIcon}>🔒</div>
          <h4>Secure Payment</h4>
          <p>100% secure transactions</p>
        </div>
        <div style={styles.featureItem}>
          <div style={styles.featureIcon}>🎧</div>
          <h4>24/7 Support</h4>
          <p>Customer care anytime</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #667eea",
    borderRadius: "50%",
  },
  hero: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "60px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "2rem",
  },
  heroContent: {
    flex: 1,
    color: "white",
  },
  welcomeEmoji: {
    fontSize: "48px",
    marginBottom: "1rem",
  },
  welcomeText: {
    fontSize: "42px",
    fontWeight: "800",
    marginBottom: "1rem",
    lineHeight: "1.2",
  },
  userName: {
    background: "rgba(255,255,255,0.2)",
    padding: "0 8px",
    borderRadius: "12px",
    display: "inline-block",
  },
  tagline: {
    fontSize: "16px",
    opacity: 0.9,
    marginBottom: "2rem",
    lineHeight: "1.5",
    maxWidth: "500px",
  },
  shopBtn: {
    background: "white",
    color: "#667eea",
    border: "none",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "40px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  heroImage: {
    fontSize: "120px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "50%",
    padding: "20px",
    backdropFilter: "blur(10px)",
  },
  statsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    padding: "3rem 2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  statCard: {
    textAlign: "center",
    padding: "1.5rem",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  statIcon: {
    fontSize: "32px",
    marginBottom: "0.5rem",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "4px",
  },
  section: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "28px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "2rem",
    color: "#1e293b",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  categoryCard: {
    textAlign: "center",
    padding: "1.5rem",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  categoryIcon: {
    fontSize: "40px",
    marginBottom: "0.5rem",
  },
  categoryName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },
  featuredGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  featuredCard: {
    background: "white",
    borderRadius: "20px",
    padding: "1.5rem",
    textAlign: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "all 0.2s",
  },
  featuredImage: {
    fontSize: "64px",
    marginBottom: "1rem",
  },
  featuredName: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "0.5rem",
  },
  featuredPrice: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#667eea",
    marginBottom: "1rem",
  },
  featuredBtn: {
    padding: "8px 16px",
    background: "#f1f5f9",
    color: "#334155",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "12px",
  },
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  testimonialCard: {
    background: "white",
    borderRadius: "20px",
    padding: "1.5rem",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  testimonialIcon: {
    fontSize: "48px",
    marginBottom: "0.5rem",
  },
  testimonialStars: {
    fontSize: "14px",
    marginBottom: "1rem",
  },
  testimonialText: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.5",
    marginBottom: "1rem",
  },
  testimonialName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },
  newsletter: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "3rem 2rem",
    textAlign: "center",
    margin: "2rem",
    borderRadius: "30px",
  },
  newsletterTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "white",
    marginBottom: "1rem",
  },
  newsletterText: {
    color: "rgba(255,255,255,0.9)",
    marginBottom: "1.5rem",
  },
  newsletterForm: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  newsletterInput: {
    padding: "12px 20px",
    borderRadius: "40px",
    border: "none",
    width: "280px",
    fontSize: "14px",
    outline: "none",
  },
  newsletterBtn: {
    padding: "12px 28px",
    background: "white",
    color: "#667eea",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  featuresSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    padding: "3rem 2rem",
    background: "white",
    marginTop: "2rem",
  },
  featureItem: {
    textAlign: "center",
  },
  featureIcon: {
    fontSize: "32px",
    marginBottom: "0.5rem",
  },
};

export default Home;