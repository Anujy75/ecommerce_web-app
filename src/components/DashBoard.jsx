import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userResponse = await API.get("/user/me");
        setUser(userResponse.data);

        const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setWishlist(savedWishlist.slice(0, 3));

        setRecentOrders([
          { id: "#ORD001", date: "2024-05-01", total: 2499, status: "Delivered", items: 2 },
          { id: "#ORD002", date: "2024-04-15", total: 899,  status: "Delivered", items: 1 },
          { id: "#ORD003", date: "2024-04-05", total: 5499, status: "Processing", items: 3 },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":  return { color: "#10b981", bg: "#d1fae5", text: "✅ Delivered" };
      case "Processing": return { color: "#f59e0b", bg: "#fef3c7", text: "⏳ Processing" };
      case "Shipped":    return { color: "#3b82f6", bg: "#dbeafe", text: "🚚 Shipped" };
      default:           return { color: "#6b7280", bg: "#f3f4f6", text: status };
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={styles.spinner}
        />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Orders",   value: recentOrders.length, icon: "📦", color: "#667eea" },
    { label: "Wishlist Items", value: wishlist.length,      icon: "❤️", color: "#ef4444" },
    { label: "Member Since",   value: user?.createdAt ? new Date(user.createdAt).getFullYear() : "2024", icon: "🎂", color: "#10b981" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={styles.header}>
          <div>
            <h1 style={styles.title}>My Dashboard</h1>
            <p style={styles.subtitle}>Manage your account, track orders, and more</p>
          </div>
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={styles.welcomeCard}
        >
          <div style={styles.welcomeContent}>
            <div style={styles.avatar}>
              <span style={styles.avatarIcon}>👤</span>
            </div>
            <div>
              <h2 style={styles.welcomeText}>Welcome back, {user?.name || "Customer"}! 🎉</h2>
              <p style={styles.welcomeEmail}>{user?.email}</p>
            </div>
          </div>
          <div style={styles.memberSince}>
            Member since {new Date(user?.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              style={styles.statCard}
            >
              <div style={{ ...styles.statIcon, background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={styles.statCard}
            onClick={() => navigate("/profile")}
          >
            <div style={{ ...styles.statIcon, background: "#8b5cf615", color: "#8b5cf6", cursor: "pointer" }}>⚙️</div>
            <div style={styles.statValue}>Edit</div>
            <div style={styles.statLabel}>Profile Settings</div>
          </motion.div>
        </div>

        {/* Two Column Layout */}
        <div style={styles.twoColumn}>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={styles.ordersSection}
          >
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>📋 Recent Orders</h3>
              {recentOrders.length > 0 && (
                <button style={styles.viewAllBtn} onClick={() => navigate("/orders")}>View All →</button>
              )}
            </div>
            {recentOrders.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No orders yet</p>
                <button style={styles.shopNowBtn} onClick={() => navigate("/products")}>Start Shopping</button>
              </div>
            ) : (
              <div style={styles.ordersList}>
                {recentOrders.map((order, idx) => {
                  const status = getStatusBadge(order.status);
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      style={styles.orderCard}
                    >
                      <div style={styles.orderHeader}>
                        <span style={styles.orderId}>{order.id}</span>
                        <span style={{ ...styles.orderStatus, background: status.bg, color: status.color }}>{status.text}</span>
                      </div>
                      <div style={styles.orderDetails}>
                        <span>📅 {new Date(order.date).toLocaleDateString("en-IN")}</span>
                        <span>📦 {order.items} items</span>
                        <span>💰 ₹{order.total.toLocaleString("en-IN")}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Wishlist Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={styles.wishlistSection}
          >
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>❤️ Wishlist Items</h3>
              {wishlist.length > 0 && (
                <button style={styles.viewAllBtn} onClick={() => navigate("/wishlist")}>View All →</button>
              )}
            </div>
            {wishlist.length === 0 ? (
              <div style={styles.emptyState}>
                <p>Your wishlist is empty</p>
                <button style={styles.shopNowBtn} onClick={() => navigate("/products")}>Explore Products</button>
              </div>
            ) : (
              <div style={styles.wishlistGrid}>
                {wishlist.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    style={styles.wishlistCard}
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    <div style={styles.wishlistImage}>🛍️</div>
                    <div style={styles.wishlistName}>{item.name}</div>
                    <div style={styles.wishlistPrice}>₹{item.price.toLocaleString("en-IN")}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={styles.quickActions}
        >
          <h3 style={styles.sectionTitle}>🚀 Quick Actions</h3>
          <div style={styles.actionsGrid}>
            <motion.button whileHover={{ scale: 1.02 }} style={styles.actionBtn} onClick={() => navigate("/products")}>🛒 Continue Shopping</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} style={styles.actionBtn} onClick={() => navigate("/profile")}>✏️ Edit Profile</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} style={styles.actionBtn} onClick={() => navigate("/cart")}>🛍️ View Cart</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} style={styles.actionBtn} onClick={() => navigate("/orders")}>📦 Track Orders</motion.button>
          </div>
        </motion.div>

        {/* Account Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={styles.accountSummary}
        >
          <h3 style={styles.sectionTitle}>📱 Account Summary</h3>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}><span>📧 Email</span><span>{user?.email}</span></div>
            <div style={styles.summaryItem}><span>📞 Phone</span><span>{user?.phone || "Not set"}</span></div>
            <div style={styles.summaryItem}><span>🏠 Address</span><span>{user?.address || "Not set"}</span></div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

const styles = {
  page: { padding: "2rem", fontFamily: "'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh" },
  container: { maxWidth: "1200px", margin: "0 auto" },
  header: { marginBottom: "2rem" },
  title: { fontSize: "32px", fontWeight: "800", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "8px" },
  subtitle: { color: "#64748b", fontSize: "14px" },
  welcomeCard: { background: "white", borderRadius: "20px", padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" },
  welcomeContent: { display: "flex", alignItems: "center", gap: "1rem" },
  avatar: { width: "60px", height: "60px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarIcon: { fontSize: "28px" },
  welcomeText: { fontSize: "20px", fontWeight: "700", marginBottom: "4px" },
  welcomeEmail: { color: "#64748b", fontSize: "13px" },
  memberSince: { background: "#f1f5f9", padding: "8px 16px", borderRadius: "40px", fontSize: "12px", color: "#475569" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" },
  statCard: { background: "white", borderRadius: "16px", padding: "1.25rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  statIcon: { fontSize: "28px", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" },
  statValue: { fontSize: "24px", fontWeight: "800", color: "#1e293b" },
  statLabel: { fontSize: "12px", color: "#64748b", marginTop: "4px" },
  twoColumn: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" },
  ordersSection: { background: "white", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  wishlistSection: { background: "white", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#1e293b" },
  viewAllBtn: { background: "none", border: "none", color: "#667eea", cursor: "pointer", fontSize: "13px", fontWeight: "500" },
  ordersList: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  orderCard: { padding: "0.75rem", background: "#f8fafc", borderRadius: "12px" },
  orderHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  orderId: { fontWeight: "700", fontSize: "13px", color: "#1e293b" },
  orderStatus: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: "600" },
  orderDetails: { display: "flex", gap: "1rem", fontSize: "11px", color: "#64748b" },
  emptyState: { textAlign: "center", padding: "2rem" },
  shopNowBtn: { marginTop: "0.5rem", padding: "8px 20px", background: "#667eea", color: "white", border: "none", borderRadius: "40px", cursor: "pointer", fontSize: "13px" },
  wishlistGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.75rem" },
  wishlistCard: { textAlign: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: "12px", cursor: "pointer" },
  wishlistImage: { fontSize: "32px", marginBottom: "4px" },
  wishlistName: { fontSize: "12px", fontWeight: "600", marginBottom: "2px" },
  wishlistPrice: { fontSize: "11px", color: "#667eea", fontWeight: "600" },
  quickActions: { background: "white", borderRadius: "20px", padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  actionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginTop: "1rem" },
  actionBtn: { padding: "12px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: "40px", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s" },
  accountSummary: { background: "white", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  summaryGrid: { display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" },
  summaryItem: { display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9", fontSize: "13px" },
  loading: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" },
  spinner: { width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTop: "3px solid #667eea", borderRadius: "50%" },
};

export default Dashboard;