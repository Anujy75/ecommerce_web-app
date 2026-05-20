import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const Cart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const token =
    localStorage.getItem("customerToken") ||
    localStorage.getItem("adminToken");

  // ================= LOAD CART =================
  const loadCart = useCallback(async () => {
    try {
      if (!token) {
        setCart([]);
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:8080/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items =
        response.data.items?.map((item) => ({
          cartItemId: item.id,
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          category: item.product.category,
          imageUrl: item.product.imageUrl,
          stock: item.product.stock,
          quantity: item.quantity,
          deliveryDate: "Tomorrow by 10 PM",
        })) || [];

      setCart(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("adminToken");
        toast.error("Session expired. Please login again");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQuantity = async (cartItemId, newQuantity, stock) => {
    console.log("newQuantity received:", newQuantity);
  if (newQuantity < 1) {
    await removeItem(cartItemId);
    return;
  }

  if (newQuantity > stock) {
    toast.error(`Only ${stock} items available`);
    return;
  }

  try {
    const response = await axios.put(
      `http://localhost:8080/api/cart/update/${cartItemId}`,
      { quantity: newQuantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
     await loadCart();
    
    console.log("UPDATE RESPONSE:", response.status, response.data);
    
    if (response.status === 200) {
      await loadCart();
      toast.success("Quantity updated");
    } else {
      toast.error("Update failed");
    }
  } catch (error) {
    console.log("ERROR DETAILS:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    toast.error("Failed to update quantity");
  }
};
  // ================= REMOVE ITEM =================
const removeItem = async (cartItemId) => {
  console.log("Removing item:", cartItemId); // Debug
  
  try {
    await axios.delete(`http://localhost:8080/api/cart/remove/${cartItemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
     await loadCart();

    // ✅ Direct cart update without waiting for loadCart
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
    
    toast.success("Item removed from cart");
  } catch (error) {
    console.error(error);
    toast.error("Failed to remove item");
    await loadCart(); // Rollback on error
  }
};
  // ================= CLEAR CART =================
  const clearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      try {
        await axios.delete("http://localhost:8080/api/cart/clear", {
          headers: { Authorization: `Bearer ${token}` },
        });

        await loadCart();

        setDiscount(0);
        setPromoCode("");
        setPromoApplied(false);

        toast.success("Cart cleared");
      } catch (error) {
        console.error(error);
        toast.error("Failed to clear cart");
      }
    }
  };

  // ================= APPLY PROMO =================
  const applyPromoCode = () => {
    const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    
    if (promoCode.toUpperCase() === "SAVE10") {
      setDiscount(cartTotal * 0.1);
      setPromoApplied(true);
      setPromoError("");
      toast.success("Promo code applied! 10% off");
    } else if (promoCode.toUpperCase() === "SAVE20") {
      setDiscount(cartTotal * 0.2);
      setPromoApplied(true);
      setPromoError("");
      toast.success("Promo code applied! 20% off");
    } else {
      setPromoError("Invalid promo code");
      setDiscount(0);
      setPromoApplied(false);
      toast.error("Invalid promo code");
    }
  };

  // ================= CALCULATIONS =================
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstRate = 18;
  const gstAmount = (cartTotal * gstRate) / 100;
  const shipping = cartTotal > 500 ? 0 : 40;
  const grandTotal = cartTotal + gstAmount + shipping - discount;
  const savedAmount = cart.reduce(
    (sum, item) => sum + ((item.price * 1.2 - item.price) * item.quantity),
    0
  );

  // ================= LOADING =================
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

  // ================= EMPTY CART =================
  if (cart.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyCart}>
        <div style={styles.emptyIcon}>🛒</div>
        <h2 style={styles.emptyTitle}>Your cart is empty</h2>
        <p style={styles.emptyText}>Add products to continue shopping</p>
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

  // ================= MAIN RETURN =================
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Shopping Cart</h1>
            <p style={styles.subtitle}>{totalItems} Items in your cart</p>
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

        {/* CONTENT */}
        <div style={styles.content}>
          {/* LEFT - CART ITEMS */}
          <div style={styles.cartItems}>
            <AnimatePresence>
              {cart.map((item, index) => (
                <motion.div
                  key={item.cartItemId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  style={styles.cartItem}
                >
                  {/* IMAGE */}
                  <div style={styles.itemImage}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={styles.image} />
                    ) : (
                      <div style={styles.imagePlaceholder}>🛍️</div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div style={styles.itemDetails}>
                    <h3 style={styles.itemName}>{item.name}</h3>
                    <p style={styles.itemCategory}>{item.category}</p>
                    <p style={styles.itemPrice}>₹{item.price.toLocaleString("en-IN")}</p>
                    <p style={{ color: item.stock <= 5 ? "#dc2626" : "#10b981", fontSize: "12px", fontWeight: "600", marginTop: "5px" }}>
                      {item.stock <= 5 ? `Only ${item.stock} left` : "In Stock"}
                    </p>
                    <p style={styles.deliveryText}>🚚 Delivery: {item.deliveryDate}</p>
                  </div>

                  {/* ACTIONS */}
                  <div style={styles.itemActions}>
                    <div style={styles.quantitySelector}>
                      <motion.button whileTap={{ scale: 0.9 }} style={styles.qtyBtn} onClick={() => updateQuantity(item.cartItemId, item.quantity - 1, item.stock)}>
                        −
                      </motion.button>
                      <span style={styles.quantity}>{item.quantity}</span>
                      <motion.button whileTap={{ scale: 0.9 }} style={styles.qtyBtn} onClick={() => updateQuantity(item.cartItemId, item.quantity + 1, item.stock)}>
                        +
                      </motion.button>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={styles.removeBtn} onClick={() => removeItem(item.cartItemId)}>
                      🗑 Remove
                    </motion.button>
                    <div style={styles.itemTotal}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* RIGHT - ORDER SUMMARY */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={styles.summary}>
            <h3 style={styles.summaryTitle}>Order Summary</h3>

            <div style={styles.summaryRow}>
              <span>Items</span>
              <span>{totalItems}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>GST (18%)</span>
              <span>₹{gstAmount.toLocaleString("en-IN")}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? "#10b981" : "#475569" }}>
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </span>
            </div>

            {shipping > 0 && (
              <div style={styles.freeShippingNote}>
                Add ₹{(500 - cartTotal).toLocaleString("en-IN")} more for FREE shipping
              </div>
            )}

            {/* PROMO CODE */}
            <div style={styles.promoSection}>
              <input
                type="text"
                style={styles.promoInput}
                placeholder="Promo Code (SAVE10 / SAVE20)"
                value={promoCode}
                disabled={promoApplied}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={styles.promoBtn} onClick={applyPromoCode} disabled={promoApplied}>
                Apply
              </motion.button>
            </div>
            {promoError && <p style={styles.promoError}>{promoError}</p>}
            {promoApplied && <div style={styles.promoSuccess}>🎉 Promo Applied! You saved ₹{discount.toLocaleString("en-IN")}</div>}

            {/* SAVINGS */}
            <div style={styles.savedBox}>🎉 You saved ₹{savedAmount.toLocaleString("en-IN")} on this order</div>

            {discount > 0 && (
              <div style={styles.summaryRowDiscount}>
                <span>Discount</span>
                <span>-₹{discount.toLocaleString("en-IN")}</span>
              </div>
            )}

            {/* TOTAL */}
            <div style={styles.summaryRowTotal}>
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={styles.checkoutBtn} onClick={() => navigate("/checkout")}>
              Proceed To Checkout →
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={styles.continueBtn} onClick={() => navigate("/products")}>
              Continue Shopping
            </motion.button>

            {/* TRUST BADGES */}
            <div style={styles.trustBadges}>
              <span>🔒 Secure Payment</span>
              <span>↩ 7 Days Return</span>
              <span>✅ Genuine Products</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ================= STYLES =================
const styles = {
  page: {
    padding: "2rem",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #f8fafc 100%)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: { maxWidth: "1400px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" },
  title: { fontSize: "34px", fontWeight: "800", background: "linear-gradient(135deg,#667eea,#764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  subtitle: { color: "#64748b", marginTop: "6px" },
  clearAllBtn: { padding: "12px 20px", borderRadius: "40px", border: "none", background: "#fee2e2", color: "#dc2626", fontWeight: "700", cursor: "pointer" },
  content: { display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem" },
  cartItems: { display: "flex", flexDirection: "column", gap: "1rem" },
  cartItem: { background: "white", borderRadius: "22px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", boxShadow: "0 4px 14px rgba(0,0,0,0.06)" },
  itemImage: { width: "110px", height: "110px", borderRadius: "18px", overflow: "hidden", background: "#f1f5f9" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  imagePlaceholder: { fontSize: "40px", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" },
  itemDetails: { flex: 1, minWidth: "180px" },
  itemName: { fontSize: "18px", fontWeight: "700", marginBottom: "6px" },
  itemCategory: { color: "#8b5cf6", fontSize: "13px", marginBottom: "6px" },
  itemPrice: { fontWeight: "700", fontSize: "16px" },
  deliveryText: { fontSize: "12px", color: "#475569", marginTop: "6px" },
  itemActions: { display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" },
  quantitySelector: { display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", borderRadius: "50px", padding: "5px" },
  qtyBtn: { width: "34px", height: "34px", borderRadius: "50%", border: "none", background: "white", cursor: "pointer", fontWeight: "bold", fontSize: "18px" },
  quantity: { minWidth: "35px", textAlign: "center", fontWeight: "700" },
  removeBtn: { border: "none", background: "#fef2f2", color: "#dc2626", padding: "10px 16px", borderRadius: "40px", cursor: "pointer", fontWeight: "600" },
  itemTotal: { fontSize: "18px", fontWeight: "800", minWidth: "120px", textAlign: "right" },
  summary: { background: "white", borderRadius: "24px", padding: "1.5rem", height: "fit-content", position: "sticky", top: "100px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
  summaryTitle: { fontSize: "22px", fontWeight: "700", marginBottom: "1.5rem" },
  summaryRow: { display: "flex", justifyContent: "space-between", marginBottom: "1rem", color: "#475569" },
  summaryRowDiscount: { display: "flex", justifyContent: "space-between", marginTop: "1rem", color: "#10b981", fontWeight: "700" },
  summaryRowTotal: { display: "flex", justifyContent: "space-between", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "2px solid #e2e8f0", fontSize: "22px", fontWeight: "800" },
  freeShippingNote: { background: "#fef3c7", padding: "10px", borderRadius: "12px", marginBottom: "1rem", fontSize: "13px", color: "#92400e", textAlign: "center" },
  promoSection: { display: "flex", gap: "10px", marginTop: "1rem" },
  promoInput: { flex: 1, padding: "12px", borderRadius: "40px", border: "1px solid #cbd5e1" },
  promoBtn: { border: "none", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", padding: "12px 18px", borderRadius: "40px", cursor: "pointer", fontWeight: "700" },
  promoError: { color: "#dc2626", marginTop: "8px", fontSize: "13px" },
  promoSuccess: { background: "#dcfce7", color: "#166534", padding: "10px", borderRadius: "12px", marginTop: "10px", fontSize: "13px" },
  savedBox: { background: "#ecfccb", color: "#365314", padding: "12px", borderRadius: "12px", marginTop: "1rem", fontWeight: "700", textAlign: "center" },
  checkoutBtn: { width: "100%", padding: "14px", marginTop: "1.5rem", borderRadius: "40px", border: "none", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", fontWeight: "700", cursor: "pointer", fontSize: "16px" },
  continueBtn: { width: "100%", padding: "12px", marginTop: "1rem", borderRadius: "40px", background: "white", border: "2px solid #667eea", color: "#667eea", fontWeight: "700", cursor: "pointer" },
  trustBadges: { marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "#475569" },
  emptyCart: { maxWidth: "500px", margin: "5rem auto", background: "white", padding: "4rem 2rem", borderRadius: "24px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
  emptyIcon: { fontSize: "90px", marginBottom: "1rem" },
  emptyTitle: { fontSize: "28px", fontWeight: "700" },
  emptyText: { marginTop: "10px", color: "#64748b" },
  shopBtn: { marginTop: "1.5rem", padding: "14px 24px", borderRadius: "40px", border: "none", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", fontWeight: "700", cursor: "pointer" },
  loading: { height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1rem" },
  spinner: { width: "50px", height: "50px", borderRadius: "50%", border: "4px solid #e2e8f0", borderTop: "4px solid #667eea", animation: "spin 1s linear infinite" },
};

// Add animation keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Cart;