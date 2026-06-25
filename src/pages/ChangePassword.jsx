import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle } from "lucide-react";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const token = localStorage.getItem("customerToken") || localStorage.getItem("adminToken");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "newPassword") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@#$%^&+=!]/.test(password)
    });
  };

  const getStrengthPercentage = () => {
    const strength = Object.values(passwordStrength).filter(Boolean).length;
    return (strength / 5) * 100;
  };

  const getStrengthText = () => {
    const strength = Object.values(passwordStrength).filter(Boolean).length;
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Medium";
    if (strength <= 4) return "Strong";
    return "Very Strong";
  };

  const getStrengthColor = () => {
    const strength = Object.values(passwordStrength).filter(Boolean).length;
    if (strength <= 2) return "#ef4444";
    if (strength <= 3) return "#eab308";
    if (strength <= 4) return "#22c55e";
    return "#10b981";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ text: "New password and confirm password do not match", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "/api/user/change-password",
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ text: response.data.message, type: "success" });
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => navigate("/profile"), 2000);
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || "Failed to change password",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <Lock size={32} color="#4f46e5" />
          </div>
          <h1 style={styles.title}>Change Password</h1>
          <p style={styles.subtitle}>Update your password to keep your account secure</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Old Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Current Password</label>
            <div style={styles.inputWrapper}>
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                style={styles.eyeBtn}
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.inputWrapper}>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeBtn}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div style={styles.strengthContainer}>
              <div style={styles.strengthBar}>
                <div
                  style={{
                    width: `${getStrengthPercentage()}%`,
                    height: "100%",
                    backgroundColor: getStrengthColor(),
                    borderRadius: "4px",
                    transition: "width 0.3s"
                  }}
                />
              </div>
              <p style={{ ...styles.strengthText, color: getStrengthColor() }}>
                Password Strength: {getStrengthText()}
              </p>
              <div style={styles.strengthList}>
                <div style={{ ...styles.strengthItem, color: passwordStrength.length ? "#22c55e" : "#9ca3af" }}>
                  <CheckCircle size={14} /> Minimum 8 characters
                </div>
                <div style={{ ...styles.strengthItem, color: passwordStrength.uppercase ? "#22c55e" : "#9ca3af" }}>
                  <CheckCircle size={14} /> One uppercase letter
                </div>
                <div style={{ ...styles.strengthItem, color: passwordStrength.lowercase ? "#22c55e" : "#9ca3af" }}>
                  <CheckCircle size={14} /> One lowercase letter
                </div>
                <div style={{ ...styles.strengthItem, color: passwordStrength.number ? "#22c55e" : "#9ca3af" }}>
                  <CheckCircle size={14} /> One number
                </div>
                <div style={{ ...styles.strengthItem, color: passwordStrength.special ? "#22c55e" : "#9ca3af" }}>
                  <CheckCircle size={14} /> One special character (@#$%^&+=!)
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={styles.inputWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeBtn}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div style={{ ...styles.message, backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2" }}>
              {message.type === "success" ? (
                <CheckCircle size={16} color="#16a34a" />
              ) : (
                <AlertCircle size={16} color="#dc2626" />
              )}
              <span style={{ color: message.type === "success" ? "#16a34a" : "#dc2626" }}>{message.text}</span>
            </div>
          )}

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate("/profile")} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>

        <div style={styles.securityNote}>
          <Shield size={14} color="#9ca3af" />
          <span>Your password is encrypted and never shared with anyone</span>
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
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    maxWidth: "500px",
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
  iconWrapper: {
    width: "64px",
    height: "64px",
    background: "#eef2ff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "12px 40px 12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
  },
  strengthContainer: {
    background: "#f9fafb",
    padding: "12px",
    borderRadius: "12px",
  },
  strengthBar: {
    height: "6px",
    background: "#e5e7eb",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  strengthText: {
    fontSize: "12px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  strengthList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
  strengthItem: {
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  message: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "13px",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  submitBtn: {
    flex: 1,
    padding: "12px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  securityNote: {
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "11px",
    color: "#9ca3af",
  },
};

export default ChangePassword;
