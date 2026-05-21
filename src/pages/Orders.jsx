import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ShoppingBag, 
  Eye, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from "lucide-react";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const token = localStorage.getItem("customerToken") || localStorage.getItem("adminToken");

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/orders/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    let filtered = [...orders];
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const getStatusConfig = (status) => {
    switch(status) {
      case "CONFIRMED":
        return { icon: CheckCircle, color: "#16a34a", bg: "#dcfce7", label: "Confirmed" };
      case "PENDING":
        return { icon: Clock, color: "#ca8a04", bg: "#fef9c3", label: "Pending" };
      case "SHIPPED":
        return { icon: Truck, color: "#2563eb", bg: "#dbeafe", label: "Shipped" };
      case "DELIVERED":
        return { icon: Package, color: "#059669", bg: "#d1fae5", label: "Delivered" };
      case "CANCELLED":
        return { icon: XCircle, color: "#dc2626", bg: "#fee2e2", label: "Cancelled" };
      default:
        return { icon: Package, color: "#4b5563", bg: "#f3f4f6", label: status };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getDeliveryEstimate = (status, createdAt) => {
    if (status === "DELIVERED") return "Delivered";
    if (status === "CANCELLED") return "Cancelled";
    
    const orderDate = new Date(createdAt);
    const estimateDate = new Date(orderDate);
    estimateDate.setDate(orderDate.getDate() + 5);
    
    return `Expected by ${estimateDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`;
  };

  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.orderStatus === "DELIVERED").length,
    pending: orders.filter(o => o.orderStatus === "PENDING").length,
    totalSpent: orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0)
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner}></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <ShoppingBag size={32} color="white" />
            </div>
            <div>
              <h1 style={styles.headerTitle}>My Orders</h1>
              <p style={styles.headerSubtitle}>Track and manage all your orders</p>
            </div>
          </div>
          <button style={styles.shopBtn} onClick={() => navigate("/products")}>
            Continue Shopping
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div style={styles.container}>
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, background: "#eff6ff"}}>
            <p style={styles.statLabel}>Total Orders</p>
            <p style={{...styles.statValue, color: "#2563eb"}}>{stats.total}</p>
          </div>
          <div style={{...styles.statCard, background: "#dcfce7"}}>
            <p style={styles.statLabel}>Delivered</p>
            <p style={{...styles.statValue, color: "#16a34a"}}>{stats.delivered}</p>
          </div>
          <div style={{...styles.statCard, background: "#fef3c7"}}>
            <p style={styles.statLabel}>Pending</p>
            <p style={{...styles.statValue, color: "#ca8a04"}}>{stats.pending}</p>
          </div>
          <div style={{...styles.statCard, background: "#f3e8ff"}}>
            <p style={styles.statLabel}>Total Spent</p>
            <p style={{...styles.statValue, color: "#9333ea"}}>₹{stats.totalSpent.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div style={styles.filterBar}>
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.filterButtons}>
            {["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  ...styles.filterBtn,
                  background: statusFilter === status ? "#4f46e5" : "#f3f4f6",
                  color: statusFilter === status ? "white" : "#374151",
                }}
              >
                {status === "ALL" ? "All" : status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIcon}>📦</div>
            <h3 style={styles.emptyTitle}>No orders found</h3>
            <p style={styles.emptyText}>We couldn't find any orders matching your criteria</p>
            <button style={styles.clearBtn} onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.orderStatus);
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedOrder === order.orderId;
              
              return (
                <div key={order.orderId} style={styles.orderCard}>
                  <div 
                    style={styles.orderHeader}
                    onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}
                  >
                    <div style={styles.orderLeft}>
                      <div style={styles.orderIcon}>
                        <Package size={24} color="#4f46e5" />
                      </div>
                      <div>
                        <p style={styles.orderId}>Order #{order.orderId}</p>
                        <div style={styles.orderDate}>
                          <Calendar size={12} color="#9ca3af" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={styles.orderRight}>
                      <div style={styles.orderTotal}>
                        <p style={styles.totalLabel}>Total</p>
                        <p style={styles.totalValue}>₹{order.grandTotal?.toLocaleString("en-IN")}</p>
                      </div>
                      <div style={{...styles.statusBadge, background: statusConfig.bg}}>
                        <StatusIcon size={12} color={statusConfig.color} />
                        <span style={{...styles.statusText, color: statusConfig.color}}>{statusConfig.label}</span>
                      </div>
                      {isExpanded ? <ChevronUp size={20} color="#9ca3af" /> : <ChevronDown size={20} color="#9ca3af" />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div style={styles.expandedContent}>
                      <div style={styles.expandedGrid}>
                        <div>
                          <p style={styles.expandedLabel}>Payment Status</p>
                          <p style={styles.expandedValue}>{order.paymentStatus}</p>
                        </div>
                        <div>
                          <p style={styles.expandedLabel}>Delivery Estimate</p>
                          <p style={styles.expandedValue}>{getDeliveryEstimate(order.orderStatus, order.createdAt)}</p>
                        </div>
                      </div>
                      <button style={styles.detailBtn} onClick={() => navigate(`/order-success?orderId=${order.orderId}`)}>
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #f8fafc 100%)",
  },
  header: {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    padding: "40px 20px",
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerIcon: {
    background: "rgba(255,255,255,0.2)",
    padding: "12px",
    borderRadius: "50%",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "white",
    marginBottom: "4px",
  },
  headerSubtitle: {
    fontSize: "14px",
    color: "#e0e7ff",
  },
  shopBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.2)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "40px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px 20px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    padding: "20px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  statLabel: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "bold",
  },
  filterBar: {
    background: "white",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    marginBottom: "16px",
    outline: "none",
  },
  filterButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "40px",
    fontSize: "12px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  emptyBox: {
    background: "white",
    borderRadius: "20px",
    padding: "60px 20px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "20px",
  },
  clearBtn: {
    background: "#4f46e5",
    color: "white",
    padding: "10px 24px",
    borderRadius: "40px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  orderCard: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    cursor: "pointer",
    borderBottom: "1px solid #f3f4f6",
  },
  orderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  orderIcon: {
    background: "#eef2ff",
    padding: "12px",
    borderRadius: "12px",
  },
  orderId: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "4px",
  },
  orderDate: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#9ca3af",
  },
  orderRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  orderTotal: {
    textAlign: "right",
  },
  totalLabel: {
    fontSize: "11px",
    color: "#9ca3af",
  },
  totalValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "40px",
  },
  statusText: {
    fontSize: "12px",
    fontWeight: "500",
  },
  expandedContent: {
    padding: "20px",
    background: "#f9fafb",
  },
  expandedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    marginBottom: "20px",
  },
  expandedLabel: {
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "4px",
  },
  expandedValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
  },
  detailBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#4f46e5",
    color: "white",
    padding: "10px 20px",
    borderRadius: "40px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTopColor: "#4f46e5",
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
    transition: all 0.2s;
  }
`;
document.head.appendChild(styleSheet);

export default Orders;