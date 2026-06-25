import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= HANDLE SUBMIT =================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

      const response = await API.post(
        "/api/auth/login",
        formData
      );

      const {
        token,
        role,
        name,
        email,
      } = response.data;

      // ROLE CHECK
      if (role !== "CUSTOMER") {

        setError(
          "This portal is for customers only."
        );

        setLoading(false);

        return;
      }

      // SAVE TOKEN & USER INFO
      if (token) {

        localStorage.setItem(
          "token",
          token
        );

        localStorage.setItem(
          "customerToken",
          token
        );

        localStorage.setItem(
          "role",
          role
        );

        localStorage.setItem(
          "userName",
          name || "Customer"
        );

        localStorage.setItem(
          "userEmail",
          email
        );

        // SUCCESS TOAST
        toast.success(
          `Welcome back, ${name || "Customer"}! 🎉`
        );

        // REDIRECT
        navigate("/home");
      }

    } catch (err) {

      console.error(err);

      const message =
        err.response?.data?.message ||
        "Invalid email or password!";

      setError(message);

      toast.error(message);
    }

    setLoading(false);
  };

  // ================= UI =================

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        {/* LOGO */}

        <div style={styles.logo}>

          <span style={styles.logoIcon}>
            👤
          </span>

          <div style={styles.logoText}>
            ShopEase Customer
          </div>

        </div>

        {/* TITLE */}

        <h2 style={styles.title}>
          Customer Login
        </h2>

        <p style={styles.subtitle}>
          Login to continue shopping
        </p>

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <label style={styles.label}>
            Email Address
          </label>

          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="john@example.com"
            onChange={handleChange}
            required
          />

          {/* PASSWORD */}

          <label style={styles.label}>
            Password
          </label>

          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder="Enter your password"
            onChange={handleChange}
            required
          />

          {/* BUTTON */}

          <button
            style={styles.button}
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>

        {/* ERROR */}

        {error && (

          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* REGISTER */}

        <div style={styles.registerLink}>

          Don't have an account?

          <a
            href="/register"
            style={styles.registerLinkText}
          >
            {" "}Sign Up
          </a>

        </div>

        {/* BACK */}

        <div style={styles.backLink}>

          <a
            href="/portal"
            style={styles.backLinkText}
          >
            ← Back to Portal
          </a>

        </div>

      </div>

    </div>
  );
};

// ================= STYLES =================

const styles = {

  page: {

    minHeight: "100vh",

    background:
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    padding: "20px",

    fontFamily:
      "'Segoe UI', sans-serif",
  },

  card: {

    background: "#fff",

    borderRadius: "24px",

    padding: "48px 40px",

    width: "100%",

    maxWidth: "450px",

    textAlign: "center",

    boxShadow:
      "0 20px 60px rgba(0,0,0,0.2)",
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

    background:
      "linear-gradient(135deg,#667eea,#764ba2)",

    WebkitBackgroundClip: "text",

    WebkitTextFillColor:
      "transparent",
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


