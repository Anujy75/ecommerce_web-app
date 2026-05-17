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
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  // Mock data for colors, sizes, specifications
  const mockColors = ["Black", "White", "Blue", "Green", "Red"];
  const mockSizes = ["S", "M", "L", "XL", "XXL"];
  
  const mockSpecs = {
    "Display": "6.1-inch Super Retina XDR",
    "Processor": "A16 Bionic Chip",
    "RAM": "6GB",
    "Storage": "128GB / 256GB / 512GB",
    "Camera": "48MP + 12MP + 12MP",
    "Front Camera": "12MP",
    "Battery": "3279 mAh",
    "OS": "iOS 17",
    "Water Resistant": "IP68",
  };

useEffect(() => {
  API.get(`/products/${id}`)
    .then((res) => {
      setProduct(res.data);
      setSelectedColor(mockColors[0]);
      setSelectedSize(mockSizes[1]);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

  const handleQuantityChange = (type) => {
    if (type === "increase" && quantity < product?.stock) {
      setQuantity(quantity + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ 
        ...product, 
        quantity,
        selectedColor,
        selectedSize
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity, selectedColor, selectedSize });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/checkout");
  };

  const checkDelivery = () => {
    if (deliveryPincode.length === 6) {
      setDeliveryMsg("✅ Delivery available within 3-4 business days");
    } else {
      setDeliveryMsg("❌ Please enter valid 6-digit pincode");
    }
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
        {/* Left Side - Image Gallery */}
        <div style={styles.imageSection}>
          <div style={styles.mainImage}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} style={styles.image} />
            ) : (
              <div style={styles.imagePlaceholder}>🛍️</div>
            )}
          </div>
          <div style={styles.thumbnailRow}>
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                style={{...styles.thumbnail, border: activeImage === index ? "2px solid #667eea" : "1px solid #e2e8f0"}}
                onClick={() => setActiveImage(index)}
              >
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={`view ${index}`} style={styles.thumbImg} />
                ) : (
                  <span>🛍️</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Details */}
        <div style={styles.detailsSection}>
          <div style={styles.brand}>ShopEase Exclusive</div>
          <h1 style={styles.name}>{product.name}</h1>
          <div style={styles.ratingRow}>
            <span style={styles.rating}>⭐ 4.5</span>
            <span style={styles.reviewCount}>(1,234 ratings)</span>
          </div>

          <div style={styles.priceSection}>
            <span style={styles.price}>₹{product.price?.toLocaleString("en-IN")}</span>
            <span style={styles.mrp}>MRP: ₹{(product.price * 1.2).toLocaleString("en-IN")}</span>
            <span style={styles.discount}>20% off</span>
          </div>

          {product.stock > 0 ? (
            <div style={styles.stockStatus}>
              <span style={styles.inStock}>✅ In Stock</span>
            </div>
          ) : (
            <div style={styles.stockStatus}>
              <span style={styles.outStock}>❌ Out of Stock</span>
            </div>
          )}

          {/* Color Options */}
          <div style={styles.optionSection}>
            <label style={styles.optionLabel}>Color:</label>
            <div style={styles.colorOptions}>
              {mockColors.map((color) => (
                <button
                  key={color}
                  style={{
                    ...styles.colorBtn,
                    background: color.toLowerCase(),
                    border: selectedColor === color ? "2px solid #667eea" : "1px solid #e2e8f0",
                    boxShadow: selectedColor === color ? "0 0 0 2px #667eea" : "none",
                  }}
                  onClick={() => setSelectedColor(color)}
                >
                  {color === "White" || color === "Black" ? "" : ""}
                </button>
              ))}
            </div>
            <span style={styles.selectedValue}>Selected: {selectedColor}</span>
          </div>

          {/* Size Options */}
          <div style={styles.optionSection}>
            <label style={styles.optionLabel}>Size:</label>
            <div style={styles.sizeOptions}>
              {mockSizes.map((size) => (
                <button
                  key={size}
                  style={{
                    ...styles.sizeBtn,
                    background: selectedSize === size ? "#667eea" : "#f1f5f9",
                    color: selectedSize === size ? "white" : "#334155",
                  }}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <span style={styles.selectedValue}>Selected: {selectedSize}</span>
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

          {/* Delivery Checker */}
          <div style={styles.deliverySection}>
            <label style={styles.optionLabel}>Check Delivery:</label>
            <div style={styles.pincodeBox}>
              <input
                type="text"
                placeholder="Enter pincode"
                value={deliveryPincode}
                onChange={(e) => setDeliveryPincode(e.target.value)}
                maxLength="6"
                style={styles.pincodeInput}
              />
              <button style={styles.checkBtn} onClick={checkDelivery}>
                Check
              </button>
            </div>
            {deliveryMsg && <p style={styles.deliveryMsg}>{deliveryMsg}</p>}
          </div>

          {/* Offer Banner */}
          <div style={styles.offerBanner}>
            <span>🎉 Bank Offer: 10% instant discount on HDFC Bank Cards</span>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <div style={styles.specsSection}>
        <h2 style={styles.specsTitle}>📋 Product Specifications</h2>
        <table style={styles.specsTable}>
          <tbody>
            {Object.entries(mockSpecs).map(([key, value]) => (
              <tr key={key} style={styles.specRow}>
                <td style={styles.specKey}>{key}</td>
                <td style={styles.specValue}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Description Section */}
      <div style={styles.descriptionSection}>
        <h2 style={styles.specsTitle}>📖 Product Description</h2>
        <p style={styles.description}>{product.description}</p>
      </div>

      {/* Similar Products Section */}
      <div style={styles.similarSection}>
        <h2 style={styles.specsTitle}>🛍️ You May Also Like</h2>
        <div style={styles.similarGrid}>
          {[1, 2, 3, 4].map((item) => (
            <div key={item} style={styles.similarCard} onClick={() => navigate("/products")}>
              <div style={styles.similarImage}>🛍️</div>
              <h4 style={styles.similarName}>Similar Product {item}</h4>
              <p style={styles.similarPrice}>₹999</p>
            </div>
          ))}
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
    background: "#f8fafc",
    minHeight: "100vh",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: "14px",
    color: "#667eea",
    cursor: "pointer",
    marginBottom: "1.5rem",
    padding: "8px 16px",
    borderRadius: "8px",
  },
  container: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    background: "white",
    borderRadius: "24px",
    padding: "2rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    marginBottom: "2rem",
  },
  imageSection: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  mainImage: {
    width: "100%",
    height: "350px",
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
  thumbnailRow: {
    display: "flex",
    gap: "0.5rem",
    justifyContent: "center",
  },
  thumbnail: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    overflow: "hidden",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  detailsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  brand: {
    color: "#667eea",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  name: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  rating: {
    background: "#10b981",
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  reviewCount: {
    fontSize: "13px",
    color: "#64748b",
  },
  priceSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginTop: "0.5rem",
  },
  price: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
  },
  mrp: {
    fontSize: "14px",
    color: "#94a3b8",
    textDecoration: "line-through",
  },
  discount: {
    fontSize: "14px",
    color: "#10b981",
    fontWeight: "600",
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
  optionSection: {
    marginTop: "0.5rem",
  },
  optionLabel: {
    fontWeight: "600",
    color: "#334155",
    fontSize: "14px",
    display: "block",
    marginBottom: "8px",
  },
  colorOptions: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "6px",
  },
  colorBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  sizeOptions: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "6px",
  },
  sizeBtn: {
    width: "40px",
    height: "36px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid #e2e8f0",
    transition: "all 0.2s",
  },
  selectedValue: {
    fontSize: "12px",
    color: "#64748b",
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
    width: "32px",
    height: "32px",
    background: "#f1f5f9",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
  },
  quantity: {
    minWidth: "40px",
    textAlign: "center",
    fontWeight: "600",
  },
  maxQty: {
    fontSize: "11px",
    color: "#64748b",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "0.5rem",
  },
  addToCartBtn: {
    flex: 1,
    padding: "12px",
    background: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  addedBtn: {
    flex: 1,
    padding: "12px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  buyNowBtn: {
    flex: 1,
    padding: "12px",
    background: "#f97316",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  disabledBuyBtn: {
    flex: 1,
    padding: "12px",
    background: "#fed7aa",
    color: "#9a3412",
    border: "none",
    borderRadius: "40px",
    cursor: "not-allowed",
  },
  deliverySection: {
    marginTop: "0.5rem",
  },
  pincodeBox: {
    display: "flex",
    gap: "0.5rem",
  },
  pincodeInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    outline: "none",
  },
  checkBtn: {
    padding: "10px 20px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  deliveryMsg: {
    fontSize: "12px",
    marginTop: "6px",
    color: "#10b981",
  },
  offerBanner: {
    background: "#fef3c7",
    padding: "10px",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "12px",
    color: "#b45309",
    marginTop: "0.5rem",
  },
  specsSection: {
    background: "white",
    borderRadius: "20px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  specsTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "1rem",
    color: "#1e293b",
  },
  specsTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  specRow: {
    borderBottom: "1px solid #f1f5f9",
  },
  specKey: {
    padding: "10px",
    fontWeight: "600",
    width: "30%",
    color: "#475569",
  },
  specValue: {
    padding: "10px",
    color: "#334155",
  },
  descriptionSection: {
    background: "white",
    borderRadius: "20px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  description: {
    color: "#475569",
    lineHeight: "1.6",
  },
  similarSection: {
    background: "white",
    borderRadius: "20px",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  similarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },
  similarCard: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "1rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  similarImage: {
    fontSize: "48px",
    marginBottom: "0.5rem",
  },
  similarName: {
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "0.25rem",
  },
  similarPrice: {
    fontSize: "12px",
    color: "#667eea",
    fontWeight: "600",
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
  button:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }
`;
document.head.appendChild(styleSheet);

export default ProductDetails;