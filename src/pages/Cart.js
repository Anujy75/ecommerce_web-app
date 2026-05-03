import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    setLoading(false);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    
    const updatedCart = cart.map(item =>
      item.id === id ? { ...item, quantity: Math.min(newQuantity, item.stock || 99) } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      setCart([]);
      localStorage.removeItem("cart");
      setDiscount(0);
      setPromoApplied(false);
      setPromoCode("");
    }
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setDiscount(cartTotal * 0.1);
      setPromoApplied(true);
      setPromoError("");
    } else if (promoCode.toUpperCase() === "SAVE20") {
      setDiscount(cartTotal * 0.2);
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code");
      setDiscount(0);
      setPromoApplied(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = cartTotal > 500 ? 0 : 40;
  const discountAmount = discount;
  const grandTotal = cartTotal + shipping - discountAmount;

  if (loading) {
    return (
      <div style={styles.loading}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={styles.spinner}
        />
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.emptyCart}
      >
        <div style={styles.emptyIcon}>🛒</div>
        <h2 style={styles.emptyTitle}>Your cart is empty</h2>
        <p style={styles.emptyText}>Looks like you haven't added any items yet</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={styles.shopBtn}
          onClick={() => navigate("/products")}
        >
          Continue Shopping →
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Shopping Cart</h1>
            <p style={styles.subtitle}>
              {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={styles.clearAllBtn}
            onClick={clearCart}
          >
            Clear All
          </motion.button>
        </div>

        <div style={styles.content}>
          {/* Cart Items */}
          <div style={styles.cartItems}>
            <AnimatePresence>
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  style={styles.cartItem}
                >
                  <div style={styles.itemImage}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={styles.image} />
                    ) : (
                      <span style={styles.imagePlaceholder}>🛍️</span>
                    )}
                  </div>
                  
                  <div style={styles.itemDetails}>
                    <h3 style={styles.itemName}>{item.name}</h3>
                    <p style={styles.itemCategory}>{item.category}</p>
                    <p style={styles.itemPrice}>₹{item.price.toLocaleString("en-IN")}</p>
                  </div>

                  <div style={styles.itemActions}>
                    <div style={styles.quantitySelector}>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        style={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </motion.button>
                      <span style={styles.quantity}>{item.quantity}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        style={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={styles.removeBtn}
                      onClick={() => removeItem(item.id)}
                    >
                      🗑️ Remove
                    </motion.button>
                    <div style={styles.itemTotal}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={styles.summary}
          >
            <h3 style={styles.summaryTitle}>Order Summary</h3>
            
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>
            
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? "#10b981" : "#475569" }}>
                {shipping === 0 ? "Free" : `₹${shipping}`}
              </span>
            </div>
            
            {shipping > 0 && (
              <div style={styles.freeShippingNote}>
                🎉 Add ₹{(500 - cartTotal).toLocaleString("en-IN")} more for free shipping!
              </div>
            )}

            {/* Promo Code */}
            <div style={styles.promoSection}>
              <input
                type="text"
                style={styles.promoInput}
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={promoApplied}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={styles.promoBtn}
                onClick={applyPromoCode}
                disabled={promoApplied}
              >
                Apply
              </motion.button>
            </div>
            {promoError && <p style={styles.promoError}>{promoError}</p>}
            {promoApplied && (
              <div style={styles.promoSuccess}>
                🎉 Promo applied! You saved ₹{discountAmount.toLocaleString("en-IN")}
              </div>
            )}

            {discountAmount > 0 && (
              <div style={styles.summaryRowDiscount}>
                <span>Discount</span>
                <span style={{ color: "#10b981" }}>-₹{discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div style={styles.summaryRowTotal}>
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={styles.checkoutBtn}
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout →
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={styles.continueBtn}
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </motion.button>
          </motion.div>
        </div>

        {/* Recommended Products Section */}
        {cart.length > 0 && (
          <div style={styles.recommended}>
            <h3 style={styles.recommendedTitle}>You May Also Like</h3>
            <div style={styles.recommendedGrid}>
              {[
                { name: "Trending Item", price: "999", icon: "🔥" },
                { name: "Best Seller", price: "1499", icon: "⭐" },
                { name: "New Arrival", price: "1999", icon: "✨" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  style={styles.recommendedCard}
                >
                  <div style={styles.recommendedIcon}>{item.icon}</div>
                  <h4>{item.name}</h4>
                  <p>₹{item.price}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: "2rem",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    background: "linear-gradient(135deg, #f5f7fa 0%, #f8fafc 100%)",
    minHeight: "100vh",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "14px",
  },
  clearAllBtn: {
    padding: "10px 20px",
    background: "transparent",
    color: "#dc2626",
    border: "2px solid #fee2e2",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "2rem",
  },
  cartItems: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  cartItem: {
    background: "white",
    borderRadius: "20px",
    padding: "1.5rem",
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
    flexWrap: "wrap",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid rgba(102, 126, 234, 0.1)",
    transition: "all 0.3s ease",
  },
  itemImage: {
    width: "100px",
    height: "100px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
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
    fontSize: "40px",
  },
  itemDetails: {
    flex: 2,
    minWidth: "150px",
  },
  itemName: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "6px",
    color: "#1e293b",
  },
  itemCategory: {
    fontSize: "12px",
    color: "#8b5cf6",
    marginBottom: "6px",
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
  },
  itemActions: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  quantitySelector: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "#f8fafc",
    borderRadius: "40px",
    padding: "4px",
    border: "1px solid #e2e8f0",
  },
  qtyBtn: {
    width: "32px",
    height: "32px",
    background: "white",
    border: "none",
    borderRadius: "50%",
    fontSize: "18px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#667eea",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  quantity: {
    minWidth: "40px",
    textAlign: "center",
    fontWeight: "700",
    fontSize: "16px",
  },
  removeBtn: {
    padding: "8px 16px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  itemTotal: {
    fontSize: "18px",
    fontWeight: "800",
    minWidth: "120px",
    textAlign: "right",
    color: "#1e293b",
  },
  summary: {
    background: "white",
    borderRadius: "20px",
    padding: "1.5rem",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(102, 126, 234, 0.15)",
    height: "fit-content",
    position: "sticky",
    top: "100px",
  },
  summaryTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "1rem",
    paddingBottom: "0.75rem",
    borderBottom: "2px solid #667eea",
    color: "#1e293b",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
    color: "#475569",
    fontSize: "14px",
  },
  summaryRowDiscount: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
    color: "#10b981",
    fontSize: "14px",
    fontWeight: "600",
  },
  summaryRowTotal: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "2px solid #e2e8f0",
    fontSize: "20px",
    fontWeight: "800",
    color: "#1e293b",
  },
  freeShippingNote: {
    background: "#fef3c7",
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    color: "#b45309",
    marginBottom: "1rem",
    textAlign: "center",
  },
  promoSection: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "1rem",
    marginBottom: "0.5rem",
  },
  promoInput: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "40px",
    border: "1px solid #e2e8f0",
    fontSize: "13px",
    outline: "none",
  },
  promoBtn: {
    padding: "10px 20px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  promoError: {
    color: "#dc2626",
    fontSize: "12px",
    marginTop: "4px",
  },
  promoSuccess: {
    background: "#dcfce7",
    color: "#166534",
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    marginTop: "8px",
  },
  checkoutBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "1rem",
    transition: "all 0.2s",
  },
  continueBtn: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    color: "#667eea",
    border: "2px solid #667eea",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.75rem",
  },
  recommended: {
    marginTop: "3rem",
  },
  recommendedTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "1rem",
    color: "#1e293b",
  },
  recommendedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
  },
  recommendedCard: {
    background: "white",
    borderRadius: "16px",
    padding: "1rem",
    textAlign: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  recommendedIcon: {
    fontSize: "32px",
    marginBottom: "8px",
  },
  emptyCart: {
    textAlign: "center",
    padding: "4rem 2rem",
    background: "white",
    borderRadius: "24px",
    margin: "2rem auto",
    maxWidth: "500px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  },
  emptyIcon: {
    fontSize: "80px",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "0.5rem",
  },
  emptyText: {
    color: "#64748b",
    marginBottom: "1.5rem",
  },
  shopBtn: {
    padding: "12px 32px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "16px",
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
    borderTop: "3px solid #667eea",
    borderRadius: "50%",
  },
};

export default Cart;