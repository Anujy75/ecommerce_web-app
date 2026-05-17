import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        formData
      );
      
      const { token, role } = response.data;
      
      if (role !== "CUSTOMER") {
        setError("This portal is for customers only. Please use Admin Login.");
        setLoading(false);
        return;
      }
      
if (token) {
  // ✅ Purane token ko bhi rakho (agar kahi use ho raha ho)
  localStorage.setItem("token", token);
  // ✅ Naye customerToken ko set karo
  localStorage.setItem("customerToken", token);
  localStorage.setItem("role", role);
  
  console.log("Token saved in both places");
        
        // Welcome Toast
        try {
          const userResponse = await axios.get("http://localhost:8080/api/user/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userName = userResponse.data.name || "Customer";
          toast.success(`Welcome back, ${userName}! 🎉`);
        } catch (err) {
          toast.success("Welcome back! 🎉");
        }
        
        navigate("/home");
      }
    } catch (err) {
      setError("Invalid email or password!");
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>👤</span>
          <span style={styles.logoText}>ShopEase Customer</span>
        </div>
        <h2 style={styles.title}>Customer Login</h2>
        <p style={styles.subtitle}>Login to shop and explore products</p>
        
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="john@example.com"
            onChange={handleChange}
            required
          />
          
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder="Enter your password"
            onChange={handleChange}
            required
          />
          
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login as Customer"}
          </button>
        </form>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <div style={styles.registerLink}>
          Don't have an account? <a href="/register" style={styles.registerLinkText}>Sign Up</a>
        </div>
        
        <div style={styles.backLink}>
          <a href="/portal" style={styles.backLinkText}>← Back to Login Portal</a>
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
    fontFamily: "'Segoe UI', sans-serif",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "24px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "450px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  logo: {
    marginBottom: "24px",
  },
  logoIcon: {
    fontSize: "56px",
  },
  logoText: {
    fontSize: "32px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "32px",
  },
  label: {
    display: "block",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    marginBottom: "20px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
    marginTop: "8px",
  },
  error: {
    marginTop: "16px",
    padding: "12px",
    background: "#fee2e2",
    color: "#dc2626",
    borderRadius: "12px",
    fontSize: "13px",
  },
  registerLink: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#64748b",
  },
  registerLinkText: {
    color: "#8b5cf6",
    textDecoration: "none",
    fontWeight: "600",
  },
  backLink: {
    marginTop: "16px",
  },
  backLinkText: {
    color: "#667eea",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default Login;