import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

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
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error updating profile");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
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
        {message && <div style={styles.message}>{message}</div>}

        {/* Profile Content */}
        <div style={styles.content}>
          {!editing ? (
            // View Mode
            <div style={styles.viewMode}>
              <div style={styles.infoCard}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Full Name</span>
                  <span style={styles.infoValue}>{user?.name || "Not set"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Email Address</span>
                  <span style={styles.infoValue}>{user?.email}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Phone Number</span>
                  <span style={styles.infoValue}>{user?.phone || "Not set"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Address</span>
                  <span style={styles.infoValue}>{user?.address || "Not set"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Member Since</span>
                  <span style={styles.infoValue}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button style={styles.editBtn} onClick={() => setEditing(true)}>
                  ✏️ Edit Profile
                </button>
                <button style={styles.logoutBtn} onClick={handleLogout}>
                  🚪 Logout
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
                  💾 Save Changes
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
                  ❌ Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Order History Preview (Optional) */}
        <div style={styles.orderSection}>
          <h3 style={styles.orderTitle}>📦 Recent Orders</h3>
          <div style={styles.orderCard}>
            <p style={styles.orderPlaceholder}>No orders yet</p>
            <button
              style={styles.shopBtn}
              onClick={() => navigate("/products")}
            >
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
    background: "#f8fafc",
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
  },
  avatarIcon: {
    fontSize: "40px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#64748b",
  },
  message: {
    background: "#dcfce7",
    color: "#166534",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "1rem",
    textAlign: "center",
  },
  content: {
    background: "white",
    borderRadius: "20px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
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
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  infoLabel: {
    fontWeight: "600",
    color: "#64748b",
  },
  infoValue: {
    color: "#1e293b",
    fontWeight: "500",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
  },
  editBtn: {
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
  logoutBtn: {
    flex: 1,
    padding: "12px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
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
  },
  textarea: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
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
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  orderTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "1rem",
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
    padding: "10px 24px",
    background: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
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
`;
document.head.appendChild(styleSheet);

export default Profile;