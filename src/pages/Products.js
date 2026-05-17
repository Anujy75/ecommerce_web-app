import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import axios from "axios";
import toast from "react-hot-toast";

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [added, setAdded] = useState({});

  const token = localStorage.getItem("customerToken") || localStorage.getItem("adminToken");

  useEffect(() => {
    API.get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  let filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  else if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

  // ✅ Updated: Add to Cart - Backend API Call
  const handleAdd = async (product) => {
    try {
      if (!token) {
        toast.error("Please login first");
        navigate("/portal");
        return;
      }
      
      await axios.post(
        "http://localhost:8080/api/cart/add",
        {
          productId: product.id,
          quantity: 1
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAdded((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => setAdded((prev) => ({ ...prev, [product.id]: false })), 1500);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/product/${id}`);
  };

  // ✅ Updated: Buy Now - Backend API Call then checkout
  const handleBuyNow = async (product) => {
    try {
      if (!token) {
        toast.error("Please login first");
        navigate("/portal");
        return;
      }
      
      await axios.post(
        "http://localhost:8080/api/cart/add",
        {
          productId: product.id,
          quantity: 1
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      navigate("/checkout");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const stockBadge = (stock) => {
    if (stock === 0) return <span style={styles.outStock}>Out of stock</span>;
    if (stock <= 5) return <span style={styles.lowStock}>Only {stock} left</span>;
    return <span style={styles.inStock}>In stock</span>;
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>✨ Premium Collection</h1>
        <p style={styles.heroSubtitle}>Discover the best products curated just for you</p>
      </div>

      <div style={styles.statsRow}>
        {[
          { label: "Total Products", val: products.length, icon: "📦" },
          { label: "In Stock", val: products.filter((p) => p.stock > 0).length, icon: "✅" },
          { label: "Categories", val: new Set(products.map((p) => p.category)).size, icon: "🏷️" },
          {
            label: "Avg Price",
            val: products.length
              ? "₹" + Math.round(products.reduce((s, p) => s + p.price, 0) / products.length).toLocaleString("en-IN")
              : "₹0",
            icon: "💰",
          },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statVal}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.topbar}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.search}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select style={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select style={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      <div style={styles.count}>
        🎯 <span style={{ fontWeight: 600 }}>{filtered.length}</span> products found
      </div>

      <div style={styles.grid}>
        {filtered.map((p) => (
          <div key={p.id} style={styles.card}>
            <div style={styles.cardImgWrapper}>
              <div style={styles.cardImg}>
                {p.imageUrl ? (
                  <img 
                    src={p.imageUrl} 
                    alt={p.name} 
                    style={styles.productImageStyle} 
                  />
                ) : (
                  "🛍️"
                )}
              </div>
              {p.stock <= 5 && p.stock > 0 && (
                <div style={styles.hurryBadge}>🔥 Hurry!</div>
              )}
            </div>
            <div style={styles.cardBody}>
              <div style={styles.cardCat}>{p.category}</div>
              <div style={styles.cardName}>{p.name}</div>
              <div style={styles.cardDesc}>{p.description}</div>
              <div style={styles.cardFooter}>
                <div style={styles.price}>₹{p.price.toLocaleString("en-IN")}</div>
                {stockBadge(p.stock)}
              </div>
              
              <button
                style={styles.detailsBtn}
                onClick={() => handleViewDetails(p.id)}
              >
                👁️ View Details
              </button>
              
              <button
                style={added[p.id] ? styles.addedBtn : p.stock > 0 ? styles.addBtn : styles.disabledBtn}
                disabled={p.stock === 0}
                onClick={() => handleAdd(p)}
              >
                {added[p.id] ? "✓ Added to Cart!" : "🛒 Add to Cart"}
              </button>
              
              <button
                style={p.stock > 0 ? styles.buyNowBtn : styles.disabledBuyBtn}
                disabled={p.stock === 0}
                onClick={() => handleBuyNow(p)}
              >
                ⚡ Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyEmoji}>🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "2rem",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  hero: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "24px",
    padding: "40px 32px",
    marginBottom: "32px",
    textAlign: "center",
    color: "white",
  },
  heroTitle: {
    fontSize: "32px",
    marginBottom: "12px",
    fontWeight: "700",
  },
  heroSubtitle: {
    fontSize: "16px",
    opacity: 0.9,
  },
  statsRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  statCard: {
    background: "white",
    borderRadius: "20px",
    padding: "18px 24px",
    flex: 1,
    minWidth: "140px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  statIcon: {
    fontSize: "32px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: "500",
  },
  statVal: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    marginTop: "4px",
  },
  topbar: {
    display: "flex",
    gap: "40px",
    marginBottom: "24px",
    flexWrap: "wrap",
    background: "white",
    padding: "16px 20px",
    borderRadius: "60px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  searchWrapper: {
    flex: 1,
    position: "relative",
    minWidth: "200px",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "16px",
    opacity: 0.6,
  },
  search: {
    width: "100%",
    padding: "12px 16px 12px 40px",
    borderRadius: "40px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    background: "#f8fafc",
    transition: "all 0.2s",
  },
  select: {
    padding: "10px 18px",
    borderRadius: "40px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    background: "#f8fafc",
    cursor: "pointer",
    outline: "none",
    fontWeight: "500",
  },
  count: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "20px",
    marginLeft: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "28px",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    cursor: "pointer",
  },
  cardImgWrapper: {
    position: "relative",
  },
  cardImg: {
    height: "220px",
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productImageStyle: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  hurryBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "#f97316",
    color: "white",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  cardBody: {
    padding: "20px",
  },
  cardCat: {
    fontSize: "12px",
    color: "#8b5cf6",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: "600",
    marginBottom: "8px",
  },
  cardName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  cardDesc: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "12px",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "8px",
  },
  price: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
  },
  inStock: {
    fontSize: "11px",
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 10px",
    borderRadius: "20px",
    fontWeight: "500",
  },
  lowStock: {
    fontSize: "11px",
    background: "#fef3c7",
    color: "#b45309",
    padding: "4px 10px",
    borderRadius: "20px",
    fontWeight: "500",
  },
  outStock: {
    fontSize: "11px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "4px 10px",
    borderRadius: "20px",
    fontWeight: "500",
  },
  detailsBtn: {
    width: "100%",
    padding: "10px 0",
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "8px",
  },
  addBtn: {
    width: "100%",
    padding: "10px 0",
    background: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "8px",
  },
  addedBtn: {
    width: "100%",
    padding: "10px 0",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "8px",
  },
  disabledBtn: {
    width: "100%",
    padding: "10px 0",
    background: "#cbd5e1",
    color: "#475569",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "not-allowed",
    marginBottom: "8px",
  },
  buyNowBtn: {
    width: "100%",
    padding: "10px 0",
    background: "#f97316",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  disabledBuyBtn: {
    width: "100%",
    padding: "10px 0",
    background: "#fed7aa",
    color: "#9a3412",
    border: "none",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "not-allowed",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "24px",
    marginTop: "20px",
  },
  emptyEmoji: {
    fontSize: "64px",
    marginBottom: "16px",
  },
};

export default Products;