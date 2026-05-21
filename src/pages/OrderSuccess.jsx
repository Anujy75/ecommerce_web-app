import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("customerToken") || localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId, token]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner}></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={styles.center}>
        <div style={styles.notFoundBox}>
          <div style={styles.notFoundIcon}>🔍</div>
          <h2>Order Not Found</h2>
          <p>We couldn't find your order details</p>
          <button style={styles.primaryBtn} onClick={() => navigate("/products")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Success Header */}
        <div style={styles.header}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.title}>Order Confirmed!</h1>
          <p style={styles.subtitle}>Thank you for your purchase</p>
          <div style={styles.orderIdBox}>
            <span style={styles.orderIdLabel}>Order ID:</span>
            <span style={styles.orderIdValue}>{order.orderId}</span>
          </div>
        </div>

        {/* Order Details Grid */}
        <div style={styles.grid}>
          <div style={{...styles.gridItem, background: "#e0f2fe"}}>
            <div style={styles.label}>📅 Order Date</div>
            <div style={styles.value}>{formatDate(order.createdAt)}</div>
          </div>
          <div style={{...styles.gridItem, background: "#dcfce7"}}>
            <div style={styles.label}>📦 Order Status</div>
            <div style={{...styles.value, color: "#16a34a"}}>{order.orderStatus}</div>
          </div>
          <div style={{...styles.gridItem, background: "#fef3c7"}}>
            <div style={styles.label}>💳 Payment Status</div>
            <div style={{...styles.value, color: "#d97706"}}>{order.paymentStatus}</div>
          </div>
          <div style={{...styles.gridItem, background: "#f3e8ff"}}>
            <div style={styles.label}>💰 Total Amount</div>
            <div style={{...styles.value, color: "#7c3aed", fontSize: "18px"}}>₹{order.grandTotal?.toLocaleString("en-IN")}</div>
          </div>
        </div>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🛍️ Order Items</h3>
            {order.items.map((item, idx) => (
              <div key={idx} style={styles.itemRow}>
                <div>
                  <div style={styles.itemName}>{item.product?.name}</div>
                  <div style={styles.itemQty}>Quantity: {item.quantity}</div>
                </div>
                <div style={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        )}

        {/* Price Breakdown */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>💰 Price Breakdown</h3>
          <div style={styles.priceRow}>
            <span>Subtotal</span>
            <span>₹{order.totalAmount?.toLocaleString("en-IN")}</span>
          </div>
          <div style={styles.priceRow}>
            <span>GST (18%)</span>
            <span>₹{order.taxAmount?.toLocaleString("en-IN")}</span>
          </div>
          <div style={styles.priceRow}>
            <span>Shipping Charges</span>
            <span style={{color: order.shippingCharges === 0 ? "#16a34a" : "#333"}}>
              {order.shippingCharges === 0 ? "FREE" : `₹${order.shippingCharges}`}
            </span>
          </div>
          <div style={styles.totalRow}>
            <span>Grand Total</span>
            <span style={{color: "#7c3aed", fontSize: "20px"}}>₹{order.grandTotal?.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button style={styles.primaryBtn} onClick={() => navigate("/products")}>
            🛒 Continue Shopping
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate("/orders")}>
            📋 View Orders
          </button>
        </div>

        {/* Trust Badges */}
        <div style={styles.badges}>
          <span style={styles.badge}>🚚 Free Shipping</span>
          <span style={styles.badge}>🔒 Secure Payment</span>
          <span style={styles.badge}>⚡ Fast Delivery</span>
          <span style={styles.badge}>↩ Easy Returns</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    maxWidth: "650px",
    width: "100%",
    background: "white",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
  },
  successIcon: {
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "white",
    fontSize: "32px",
    fontWeight: "bold",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "16px",
  },
  orderIdBox: {
    background: "#f3f4f6",
    padding: "8px 16px",
    borderRadius: "40px",
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
  },
  orderIdLabel: {
    fontSize: "12px",
    color: "#6b7280",
  },
  orderIdValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#4f46e5",
    fontFamily: "monospace",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginBottom: "24px",
  },
  gridItem: {
    padding: "14px",
    borderRadius: "16px",
    textAlign: "center",
  },
  label: {
    fontSize: "12px",
    color: "#4b5563",
    marginBottom: "6px",
  },
  value: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1f2937",
  },
  section: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "20px",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "16px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  itemName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
  },
  itemQty: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  itemPrice: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "14px",
    color: "#4b5563",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0 0",
    marginTop: "8px",
    borderTop: "2px solid #e5e7eb",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#1f2937",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
  },
  primaryBtn: {
    flex: 1,
    padding: "12px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  secondaryBtn: {
    flex: 1,
    padding: "12px",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  badges: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "24px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
  badge: {
    fontSize: "11px",
    color: "#6b7280",
    background: "#f9fafb",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  notFoundBox: {
    background: "white",
    padding: "40px",
    borderRadius: "24px",
    textAlign: "center",
    maxWidth: "400px",
  },
  notFoundIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  button:hover {
    transform: scale(1.02);
    opacity: 0.95;
  }
`;
document.head.appendChild(styleSheet);

export default OrderSuccess;