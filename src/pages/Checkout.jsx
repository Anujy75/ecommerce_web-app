import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (savedCart.length === 0) {
      navigate("/products");
    }
    setCart(savedCart);
    setLoading(false);
  }, [navigate]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cartTotal > 500 ? 0 : 40;
  const grandTotal = cartTotal + shipping;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would call your backend API to place order
    alert("Order placed successfully! 🎉");
    localStorage.removeItem("cart");
    navigate("/products");
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div>
          <h1 style={styles.title}>Checkout</h1>
          <p style={styles.subtitle}>Complete your purchase</p>
        </div>

        <div style={styles.content}>
          {/* Left Side - Shipping Form */}
          <form style={styles.form} onSubmit={handleSubmit}>
            <h3 style={styles.sectionTitle}>Shipping Information</h3>
            <input
              style={styles.input}
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <input
              style={styles.input}
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              style={styles.input}
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <textarea
              style={styles.textarea}
              name="address"
              placeholder="Full Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <div style={styles.row}>
              <input
                style={{ ...styles.input, width: "48%" }}
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <input
                style={{ ...styles.input, width: "48%" }}
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
            <button style={styles.placeOrderBtn} type="submit">
              Place Order • ₹{grandTotal.toLocaleString("en-IN")}
            </button>
          </form>

          {/* Right Side - Order Summary */}
          <div style={styles.summary}>
            <h3 style={styles.sectionTitle}>Order Summary</h3>
            {cart.map((item) => (
              <div key={item.id} style={styles.cartItem}>
                <div>
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemQty}>Qty: {item.quantity}</div>
                </div>
                <div style={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
              </div>
            ))}
            <div style={styles.divider} />
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>
            <div style={styles.summaryRowTotal}>
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <button
              style={styles.backBtn}
              onClick={() => navigate("/cart")}
            >
              ← Back to Cart
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
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#64748b",
    marginBottom: "2rem",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "1fr 400px",
    gap: "2rem",
  },
  form: {
    background: "white",
    padding: "2rem",
    borderRadius: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "1rem",
    color: "#1e293b",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    marginBottom: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    marginBottom: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
    minHeight: "80px",
    fontFamily: "inherit",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
  },
  placeOrderBtn: {
    width: "100%",
    padding: "14px",
    background: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "1rem",
  },
  summary: {
    background: "white",
    padding: "2rem",
    borderRadius: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
    height: "fit-content",
  },
  cartItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #f1f5f9",
  },
  itemName: {
    fontWeight: "600",
    marginBottom: "4px",
  },
  itemQty: {
    fontSize: "12px",
    color: "#64748b",
  },
  itemPrice: {
    fontWeight: "600",
  },
  divider: {
    height: "1px",
    background: "#e2e8f0",
    margin: "1rem 0",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
    color: "#475569",
  },
  summaryRowTotal: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "2px solid #e2e8f0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
  },
  backBtn: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    color: "#667eea",
    border: "1px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "1rem",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};

export default Checkout;