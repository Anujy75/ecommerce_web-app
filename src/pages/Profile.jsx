import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { User, Mail, Phone, MapPin, Calendar, Edit, LogOut, Key, ShoppingBag, CheckCircle, AlertCircle } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await API.get("/user/me");
      setUser(response.data);
      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        address: response.data.address || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put("/user/profile", formData);
      setUser(response.data);
      setEditing(false);
      setMessageType("success");
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessageType("error");
      setMessage("Error updating profile");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customerToken");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("role");
    navigate("/portal");
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.avatar}>
            <span style={styles.avatarIcon}>👤</span>
          </div>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>Manage your personal information</p>
        </div>

        {/* Message */}
        {message && (
          <div style={{...styles.message, backgroundColor: messageType === "success" ? "#dcfce7" : "#fee2e2"}}>
            {messageType === "success" ? <CheckCircle size={16} color="#16a34a" /> : <AlertCircle size={16} color="#dc2626" />}
            <span style={{color: messageType === "success" ? "#16a34a" : "#dc2626"}}>{message}</span>
          </div>
        )}

        {/* Profile Content */}
        <div style={styles.content}>
          {!editing ? (
            // View Mode
            <div style={styles.viewMode}>
              <div style={styles.infoCard}>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>
                    <User size={16} color="#64748b" />
                    <span>Full Name</span>
                  </div>
                  <span style={styles.infoValue}>{user?.name || "Not set"}</span>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>
                    <Mail size={16} color="#64748b" />
                    <span>Email Address</span>
                  </div>
                  <span style={styles.infoValue}>{user?.email}</span>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>
                    <Phone size={16} color="#64748b" />
                    <span>Phone Number</span>
                  </div>
                  <span style={styles.infoValue}>{user?.phone || "Not set"}</span>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>
                    <MapPin size={16} color="#64748b" />
                    <span>Address</span>
                  </div>
                  <span style={styles.infoValue}>{user?.address || "Not set"}</span>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>
                    <Calendar size={16} color="#64748b" />
                    <span>Member Since</span>
                  </div>
                  <span style={styles.infoValue}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "N/A"}
                  </span>
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button style={styles.editBtn} onClick={() => setEditing(true)}>
                  <Edit size={16} />
                  Edit Profile
                </button>
                <button style={styles.changePwdBtn} onClick={() => navigate("/change-password")}>
                  <Key size={16} />
                  Change Password
                </button>
                <button style={styles.logoutBtn} onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form style={styles.editMode} onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  style={styles.input}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  disabled
                />
                <span style={styles.disabledHint}>Email cannot be changed</span>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  style={styles.input}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <textarea
                  style={styles.textarea}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows="3"
                />
              </div>
              <div style={styles.formButtons}>
                <button style={styles.saveBtn} type="submit">
                  <CheckCircle size={16} />
                  Save Changes
                </button>
                <button
                  style={styles.cancelBtn}
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user?.name || "",
                      email: user?.email || "",
                      phone: user?.phone || "",
                      address: user?.address || "",
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Order Section */}
        <div style={styles.orderSection}>
          <div style={styles.orderHeader}>
            <ShoppingBag size={20} color="#4f46e5" />
            <h3 style={styles.orderTitle}>Recent Orders</h3>
          </div>
          <div style={styles.orderCard}>
            <p style={styles.orderPlaceholder}>📦 No orders yet</p>
            <button style={styles.shopBtn} onClick={() => navigate("/products")}>
              Start Shopping →
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
    background: "linear-gradient(135deg, #f5f7fa 0%, #f8fafc 100%)",
    minHeight: "100vh",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  avatar: {
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },
  avatarIcon: {
    fontSize: "40px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "14px",
  },
  message: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "1rem",
    textAlign: "center",
    justifyContent: "center",
  },
  content: {
    background: "white",
    borderRadius: "20px",
    padding: "2rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    marginBottom: "2rem",
  },
  viewMode: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  infoCard: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #f1f5f9",
    flexWrap: "wrap",
    gap: "8px",
  },
  infoLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600",
    color: "#64748b",
    fontSize: "14px",
  },
  infoValue: {
    color: "#1e293b",
    fontWeight: "500",
    fontSize: "14px",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  editBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    background: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  changePwdBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    background: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  logoutBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  editMode: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
  },
  disabledHint: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  formButtons: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  saveBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  orderSection: {
    background: "white",
    borderRadius: "20px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  orderHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "1rem",
  },
  orderTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  orderCard: {
    textAlign: "center",
    padding: "2rem",
  },
  orderPlaceholder: {
    color: "#94a3b8",
    marginBottom: "1rem",
  },
  shopBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 24px",
    background: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
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
    marginBottom: "1rem",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  button:hover {
    transform: translateY(-2px);
    transition: all 0.2s;
  }
`;
document.head.appendChild(styleSheet);

export default Profile;