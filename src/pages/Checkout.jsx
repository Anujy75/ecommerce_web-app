import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { initiateRazorpayPayment } from "../services/razorpay";

const Checkout = () => {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("customerToken") ||
    localStorage.getItem("adminToken");

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [focused, setFocused] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "UPI",
  });

  const loadCart = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(response.data.items || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "ANUJ100") {
      setDiscount(100);
      toast.success("Coupon Applied");
    } else if (
      coupon.toUpperCase() === "MEGA500"
    ) {
      setDiscount(500);
      toast.success("Mega Discount Applied");
    } else {
      setDiscount(0);
      toast.error("Invalid Coupon");
    }
  };

  const calculations = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) =>
        sum + item.product.price * item.quantity,
      0
    );

    const gst = subtotal * 0.18;

    const shipping = subtotal > 999 ? 0 : 99;

    const platformFee = 9;

    const finalTotal =
      subtotal +
      gst +
      shipping +
      platformFee -
      discount;

    return {
      subtotal,
      gst,
      shipping,
      platformFee,
      finalTotal,
    };
  }, [cart, discount]);

  const deliveryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);

    return date.toDateString();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Razorpay Payment
    if (formData.paymentMethod === "RAZORPAY") {
      setIsRazorpayLoading(true);
      
      await initiateRazorpayPayment(
        calculations.finalTotal,
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        },
        token,
        async (paymentResponse) => {
          try {
            const orderResponse = await axios.post(
              "http://localhost:8080/api/orders/checkout",
              {
                ...formData,
                discount,
                totalAmount: calculations.finalTotal,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpayOrderId: paymentResponse.razorpay_order_id
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            toast.success("Order Placed Successfully");
            navigate(`/order-success?orderId=${orderResponse.data.orderId}`);
          } catch (err) {
            console.error(err);
            toast.error("Failed to place order");
          }
          setIsRazorpayLoading(false);
        },
        (error) => {
          toast.error(error || "Payment failed");
          setIsRazorpayLoading(false);
        }
      );
      return;
    }

    // ✅ Existing COD/CARD/UPI logic
    setPlacing(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/orders/checkout",
        {
          ...formData,
          discount,
          totalAmount:
            calculations.finalTotal,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "Order Placed Successfully"
      );

      navigate(
        `/order-success?orderId=${response.data.orderId}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Checkout Failed");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderPage}>
        <div style={styles.loader}></div>

        <h2 style={styles.loaderText}>
          Preparing Checkout...
        </h2>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={styles.emptyCart}>
        <h1>Your Cart is Empty</h1>

        <button
          style={styles.shopBtn}
          onClick={() =>
            navigate("/products")
          }
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      <div style={styles.wrapper}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>
              Secure Checkout
            </h1>

            <p style={styles.subheading}>
              Fast • Secure • Premium
              Experience
            </p>
          </div>

          <div style={styles.securityBadge}>
            🔒 SSL Secured
          </div>
        </div>

        {/* MAIN */}
        <div style={styles.layout}>
          {/* LEFT */}
          <form
            onSubmit={handleSubmit}
            style={styles.formCard}
          >
            {/* SHIPPING */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                🚚 Shipping Details
              </div>

              <div style={styles.grid2}>
                <Input
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                />

                <Input
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                />
              </div>

              <div style={styles.grid2}>
                <Input
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                />

                <Input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                />
              </div>

              <div style={styles.grid2}>
                <Input
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                />

                <div></div>
              </div>

              <textarea
                name="address"
                placeholder="Full Address"
                value={formData.address}
                onChange={handleChange}
                style={styles.textarea}
                required
              />
            </div>

            {/* PAYMENT */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                💳 Payment Method
              </div>

              <div style={styles.paymentGrid}>
                {[
                  {
                    label: "UPI",
                    icon: "📱",
                  },
                  {
                    label: "CARD",
                    icon: "💳",
                  },
                  {
                    label: "COD",
                    icon: "💵",
                  },
                  {
                    label: "RAZORPAY",
                    icon: "💳",
                  },
                ].map((method) => (
                  <div
                    key={method.label}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        paymentMethod:
                          method.label,
                      })
                    }
                    style={{
                      ...styles.paymentCard,
                      border:
                        formData.paymentMethod ===
                        method.label
                          ? "2px solid #6366f1"
                          : "1px solid #e2e8f0",
                    }}
                  >
                    <div style={styles.paymentIcon}>
                      {method.icon}
                    </div>

                    <div
                      style={
                        styles.paymentTitle
                      }
                    >
                      {method.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COUPON */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                🎁 Coupon
              </div>

              <div style={styles.couponRow}>
                <input
                  value={coupon}
                  onChange={(e) =>
                    setCoupon(e.target.value)
                  }
                  placeholder="Enter Coupon"
                  style={styles.couponInput}
                />

                <button
                  type="button"
                  onClick={applyCoupon}
                  style={styles.applyBtn}
                >
                  Apply
                </button>
              </div>

              <div style={styles.rewardBox}>
                ⭐ Premium reward eligible
                order
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={placing || isRazorpayLoading}
              style={styles.checkoutBtn}
            >
              {placing || isRazorpayLoading
                ? "Processing..."
                : `Pay ₹${calculations.finalTotal.toLocaleString(
                    "en-IN"
                  )}`}
            </button>
          </form>

          {/* RIGHT */}
          <div style={styles.summaryCard}>
            <div style={styles.summaryTop}>
              <h2 style={styles.summaryTitle}>
                Order Summary
              </h2>

              <div style={styles.delivery}>
                🚀 Delivery by{" "}
                {deliveryDate}
              </div>
            </div>

            {/* CART */}
            <div style={styles.cartContainer}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={styles.cartItem}
                >
                  <div>
                    <div style={styles.productName}>
                      {item.product.name}
                    </div>

                    <div style={styles.productMeta}>
                      Qty : {item.quantity}
                    </div>
                  </div>

                  <div style={styles.price}>
                    ₹
                    {(
                      item.product.price *
                      item.quantity
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* BILL */}
            <div style={styles.bill}>
              <BillRow
                label="Subtotal"
                value={calculations.subtotal}
              />

              <BillRow
                label="GST"
                value={calculations.gst}
              />

              <BillRow
                label="Shipping"
                value={calculations.shipping}
              />

              <BillRow
                label="Platform Fee"
                value={
                  calculations.platformFee
                }
              />

              <BillRow
                label="Discount"
                value={`- ₹${discount}`}
                green
              />

              <div style={styles.totalRow}>
                <span>Total</span>

                <span>
                  ₹
                  {calculations.finalTotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            </div>

            {/* TRUST */}
            <div style={styles.trustContainer}>
              <div style={styles.trustItem}>
                ✅ Secure Payment
              </div>

              <div style={styles.trustItem}>
                ⚡ Fast Checkout
              </div>

              <div style={styles.trustItem}>
                🔁 Easy Returns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* INPUT */
const Input = ({
  name,
  placeholder,
  value,
  onChange,
  focused,
  setFocused,
}) => (
  <input
    type="text"
    name={name}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onFocus={() => setFocused(name)}
    onBlur={() => setFocused("")}
    style={{
      ...styles.input,
      border:
        focused === name
          ? "1.5px solid #6366f1"
          : "1.5px solid #e2e8f0",
    }}
    required
  />
);

/* BILL ROW */
const BillRow = ({
  label,
  value,
  green,
}) => (
  <div style={styles.billRow}>
    <span>{label}</span>

    <span
      style={{
        color: green ? "#16a34a" : "#0f172a",
      }}
    >
      {typeof value === "number"
        ? `₹${value.toLocaleString("en-IN")}`
        : value}
    </span>
  </div>
);

/* STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    background: `
      linear-gradient(
        135deg,
        #eef2ff 0%,
        #f8fafc 40%,
        #ffffff 100%
      )
    `,
    padding: "28px",
    position: "relative",
    overflow: "hidden",
    fontFamily:
      "'Inter', 'Segoe UI', sans-serif",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: `
      radial-gradient(
        circle at top right,
        rgba(99,102,241,0.10),
        transparent 35%
      ),
      radial-gradient(
        circle at bottom left,
        rgba(168,85,247,0.08),
        transparent 30%
      )
    `,
  },

  wrapper: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1380px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "14px",
  },

  heading: {
    fontSize: "48px",
    fontWeight: "900",
    lineHeight: "1",
    letterSpacing: "-2px",
    background:
      "linear-gradient(135deg,#312e81,#7c3aed,#2563eb)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
  },

  subheading: {
    color: "#475569",
    fontSize: "16px",
    fontWeight: "500",
  },

  securityBadge: {
    background:
      "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "white",
    padding: "12px 22px",
    borderRadius: "50px",
    fontWeight: "700",
    boxShadow:
      "0 12px 28px rgba(99,102,241,0.20)",
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "1.25fr 0.85fr",
    gap: "20px",
    alignItems: "start",
  },

  formCard: {
    background:
      "rgba(255,255,255,0.82)",
    border:
      "1px solid rgba(255,255,255,0.9)",
    borderRadius: "30px",
    padding: "28px",
    backdropFilter: "blur(24px)",
    boxShadow:
      "0 20px 60px rgba(99,102,241,0.10)",
  },

  summaryCard: {
    background:
      "rgba(255,255,255,0.84)",
    border:
      "1px solid rgba(255,255,255,0.9)",
    borderRadius: "30px",
    padding: "24px",
    backdropFilter: "blur(24px)",
    boxShadow:
      "0 20px 60px rgba(15,23,42,0.08)",
    position: "sticky",
    top: "20px",
    height: "fit-content",
  },

  section: {
    marginBottom: "22px",
  },

  sectionHeader: {
    color: "#0f172a",
    fontSize: "20px",
    fontWeight: "800",
    marginBottom: "16px",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "14px",
  },

  input: {
    width: "100%",
    padding: "15px 16px",
    borderRadius: "16px",
    background: "#ffffff",
    color: "#0f172a",
    outline: "none",
    fontSize: "14px",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    boxShadow:
      "0 4px 10px rgba(15,23,42,0.03)",
  },

  textarea: {
    width: "100%",
    minHeight: "95px",
    borderRadius: "16px",
    padding: "16px",
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    color: "#0f172a",
    outline: "none",
    fontSize: "14px",
    resize: "none",
    boxSizing: "border-box",
  },

paymentGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",  // Responsive
  gap: "12px",
},

  paymentCard: {
    padding: "16px",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg,#ffffff,#f8fafc)",
    cursor: "pointer",
    transition: "0.3s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "110px",
    boxShadow:
      "0 8px 18px rgba(15,23,42,0.04)",
  },

  paymentIcon: {
    fontSize: "28px",
  },

  paymentTitle: {
    color: "#0f172a",
    fontWeight: "700",
  },

  couponRow: {
    display: "flex",
    gap: "10px",
  },

  couponInput: {
    flex: 1,
    padding: "14px",
    borderRadius: "16px",
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    color: "#0f172a",
    outline: "none",
  },

  applyBtn: {
    padding: "0 20px",
    borderRadius: "16px",
    border: "none",
    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
  },

  rewardBox: {
    marginTop: "12px",
    background:
      "linear-gradient(135deg,#ede9fe,#eff6ff)",
    padding: "14px",
    borderRadius: "16px",
    color: "#4c1d95",
    fontWeight: "600",
    fontSize: "14px",
  },

  checkoutBtn: {
    width: "100%",
    padding: "18px",
    border: "none",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "white",
    fontSize: "17px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow:
      "0 16px 34px rgba(99,102,241,0.25)",
  },

  summaryTop: {
    marginBottom: "18px",
  },

  summaryTitle: {
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: "900",
  },

  delivery: {
    color: "#16a34a",
    marginTop: "6px",
    fontWeight: "600",
  },

  cartContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "18px",
  },

  cartItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background:
      "linear-gradient(145deg,#ffffff,#f8fafc)",
    padding: "14px 16px",
    borderRadius: "16px",
    boxShadow:
      "0 6px 14px rgba(15,23,42,0.04)",
  },

  productName: {
    color: "#0f172a",
    fontWeight: "700",
  },

  productMeta: {
    color: "#64748b",
    marginTop: "4px",
    fontSize: "13px",
  },

  price: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: "16px",
  },

  bill: {
    marginTop: "20px",
  },

  billRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#475569",
    marginBottom: "14px",
    fontWeight: "500",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#0f172a",
    fontWeight: "900",
    fontSize: "26px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "20px",
    marginTop: "16px",
  },

  trustContainer: {
    display: "grid",
    gap: "10px",
    marginTop: "18px",
  },

  trustItem: {
    background:
      "linear-gradient(145deg,#ffffff,#f8fafc)",
    padding: "13px 14px",
    borderRadius: "14px",
    color: "#0f172a",
    fontWeight: "600",
    fontSize: "14px",
  },

  loaderPage: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: "20px",
    background: "#f8fafc",
  },

  loader: {
    width: "60px",
    height: "60px",
    border:
      "4px solid rgba(99,102,241,0.15)",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation:
      "spin 1s linear infinite",
  },

  loaderText: {
    color: "#0f172a",
  },

  emptyCart: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    background: "#f8fafc",
  },

  shopBtn: {
    padding: "14px 24px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
  },
};

const style =
  document.createElement("style");

style.innerHTML = `
@keyframes spin{
  0%{
    transform:rotate(0deg);
  }
  100%{
    transform:rotate(360deg);
  }
}

body{
  margin:0;
  padding:0;
  background:#f8fafc;
}

input::placeholder,
textarea::placeholder{
  color:#94a3b8;
}

@media(max-width: 1000px){
  div[style*="grid-template-columns: 1.25fr 0.85fr"]{
    grid-template-columns:1fr !important;
  }
}
`;

document.head.appendChild(style);

export default Checkout;