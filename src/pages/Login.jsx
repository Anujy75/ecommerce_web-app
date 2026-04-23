import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        "http://localhost:8080/api/users/login",
        formData
      );
      const message = response.data;
   if (message.startsWith("Login successful")) {
       const token = message.split("Token: ")[1];
       localStorage.setItem("token", token);
       navigate("/");
  } else {
  setError(message);
    }
      } catch (err) {
         setError("Something went wrong!");
      }
    setLoading(false);
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
    },
    card: {
      background: "#fff",
      borderRadius: "16px",
      padding: "40px",
      width: "100%",
      maxWidth: "420px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    },
    logo: { textAlign: "center", marginBottom: "8px" },
    logoText: { fontSize: "28px", fontWeight: "800", color: "#667eea" },
    subtitle: {
      textAlign: "center",
      color: "#888",
      fontSize: "14px",
      marginBottom: "28px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: "600",
      color: "#444",
      marginBottom: "6px",
    },
    input: {
      width: "100%",
      padding: "11px 14px",
      borderRadius: "8px",
      border: "1.5px solid #e0e0e0",
      fontSize: "14px",
      marginBottom: "16px",
      outline: "none",
      boxSizing: "border-box",
    },
    button: {
      width: "100%",
      padding: "13px",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontSize: "15px",
      fontWeight: "700",
      cursor: "pointer",
      marginTop: "4px",
      letterSpacing: "0.5px",
    },
    error: {
      marginTop: "16px",
      padding: "12px",
      borderRadius: "8px",
      textAlign: "center",
      fontSize: "14px",
      fontWeight: "500",
      background: "#fdecea",
      color: "#c62828",
    },
    divider: {
      textAlign: "center",
      color: "#aaa",
      fontSize: "13px",
      marginTop: "20px",
    },
    link: {
      color: "#667eea",
      fontWeight: "600",
      cursor: "pointer",
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>🛒 ShopEase</span>
        </div>
        <p style={styles.subtitle}>Welcome back! Please login to continue</p>

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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.divider}>
          Don't have an account?{" "}
          <a href="/register" style={styles.link}>
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;