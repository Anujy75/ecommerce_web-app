import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    API.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleQuantityChange = (type) => {
    if (type === "increase" && quantity < product?.stock) {
      setQuantity(quantity + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    // Add to cart first
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.notFound}>
        <h2>Product not found</h2>
        <button onClick={() => navigate("/products")}>Back to Products</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate("/products")}>
        ← Back to Products
      </button>

      <div style={styles.container}>
        {/* Left Side - Image */}
        <div style={styles.imageSection}>
          <div style={styles.mainImage}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} style={styles.image} />
            ) : (
              <div style={styles.imagePlaceholder}>🛍️</div>
            )}
          </div>
        </div>

        {/* Right Side - Details */}
        <div style={styles.detailsSection}>
          <div style={styles.category}>{product.category}</div>
          <h1 style={styles.name}>{product.name}</h1>
          <div style={styles.priceSection}>
            <span style={styles.price}>₹{product.price?.toLocaleString("en-IN")}</span>
            {product.stock > 0 ? (
              <span style={styles.inStock}>In Stock</span>
            ) : (
              <span style={styles.outStock}>Out of Stock</span>
            )}
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <div style={styles.lowStockWarning}>⚠️ Only {product.stock} left in stock!</div>
          )}

          <div style={styles.description}>
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div style={styles.quantitySection}>
              <label style={styles.quantityLabel}>Quantity:</label>
              <div style={styles.quantitySelector}>
                <button
                  style={styles.qtyBtn}
                  onClick={() => handleQuantityChange("decrease")}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span style={styles.quantity}>{quantity}</span>
                <button
                  style={styles.qtyBtn}
                  onClick={() => handleQuantityChange("increase")}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <span style={styles.maxQty}>Max {product.stock} units</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={styles.buttonGroup}>
            <button
              style={added ? styles.addedBtn : styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {added ? "✓ Added to Cart!" : "🛒 Add to Cart"}
            </button>
            <button
              style={product.stock > 0 ? styles.buyNowBtn : styles.disabledBuyBtn}
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              ⚡ Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Segoe UI', sans-serif",
    minHeight: "100vh",
    background: "#f8fafc",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: "14px",
    color: "#667eea",
    cursor: "pointer",
    marginBottom: "2rem",
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "all 0.2s",
  },
  container: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3rem",
    background: "white",
    borderRadius: "24px",
    padding: "2rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  imageSection: {
    display: "flex",
    justifyContent: "center",
  },
  mainImage: {
    width: "100%",
    maxWidth: "400px",
    height: "400px",
    background: "#f8fafc",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imagePlaceholder: {
    fontSize: "80px",
  },
  detailsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  category: {
    fontSize: "14px",
    color: "#8b5cf6",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "600",
  },
  name: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  priceSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  price: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
  },
  inStock: {
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  outStock: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  lowStockWarning: {
    background: "#fef3c7",
    color: "#b45309",
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "13px",
  },
  description: {
    marginTop: "0.5rem",
  },
  quantitySection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginTop: "0.5rem",
  },
  quantityLabel: {
    fontWeight: "600",
    color: "#334155",
  },
  quantitySelector: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
  },
  qtyBtn: {
    width: "36px",
    height: "36px",
    background: "#f1f5f9",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  quantity: {
    minWidth: "40px",
    textAlign: "center",
    fontWeight: "600",
  },
  maxQty: {
    fontSize: "12px",
    color: "#64748b",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
    flexWrap: "wrap",
  },
  addToCartBtn: {
    flex: 1,
    padding: "14px 24px",
    background: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  addedBtn: {
    flex: 1,
    padding: "14px 24px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  buyNowBtn: {
    flex: 1,
    padding: "14px 24px",
    background: "#f97316",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  disabledBuyBtn: {
    flex: 1,
    padding: "14px 24px",
    background: "#fed7aa",
    color: "#9a3412",
    border: "none",
    borderRadius: "40px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "not-allowed",
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
    borderTop: "3px solid #8b5cf6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  notFound: {
    textAlign: "center",
    padding: "4rem",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ProductDetails;