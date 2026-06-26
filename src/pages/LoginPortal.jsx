import { useNavigate } from "react-router-dom";


const LoginPortal = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🛒</span>
          <span style={styles.logoText}>ShopEase</span>
        </div>
        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>Choose your login type</p>

        <div style={styles.buttonGroup}>
          <button style={styles.customerBtn} onClick={() => navigate("/login/user")}>
            <span style={styles.btnIcon}>👤</span>
            <div style={styles.btnContent}>
              <span style={styles.btnTitle}>Customer Login</span>
              <span style={styles.btnDesc}>Shop & Buy Products</span>
            </div>
            <span style={styles.arrow}>→</span>
          </button>

          <button style={styles.adminBtn} onClick={() => navigate("/login/admin")}>
            <span style={styles.btnIcon}>👑</span>
            <div style={styles.btnContent}>
              <span style={styles.btnTitle}>Admin Login</span>
              <span style={styles.btnDesc}>Manage Products & Orders</span>
            </div>
            <span style={styles.arrow}>→</span>
          </button>
        </div>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>New to ShopEase?</span>
          <span style={styles.dividerLine}></span>
        </div>

        <div style={styles.registerSection}>
          <button style={styles.registerBtn} onClick={() => navigate("/register")}>
            Create New Account →
          </button>
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
    maxWidth: "500px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  logoIcon: { fontSize: "48px" },
  logoText: { fontSize: "48px", fontWeight: "800", color: "#667eea", letterSpacing: "-1px" },
  title: { fontSize: "28px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" },
  subtitle: { color: "#64748b", fontSize: "15px", marginBottom: "40px" },
  buttonGroup: { display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" },
  customerBtn: { display: "flex", alignItems: "center", gap: "16px", width: "100%", padding: "20px 24px", background: "#8b5cf6", border: "none", borderRadius: "16px", cursor: "pointer", textAlign: "left" },
  adminBtn: { display: "flex", alignItems: "center", gap: "16px", width: "100%", padding: "20px 24px", background: "#1e293b", border: "none", borderRadius: "16px", cursor: "pointer", textAlign: "left" },
  btnIcon: { fontSize: "36px" },
  btnContent: { flex: 1, display: "flex", flexDirection: "column", gap: "4px" },
  btnTitle: { fontSize: "18px", fontWeight: "700", color: "white" },
  btnDesc: { fontSize: "13px", color: "rgba(255,255,255,0.8)" },
  arrow: { fontSize: "24px", color: "rgba(255,255,255,0.9)" },
  divider: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" },
  dividerLine: { flex: 1, height: "1px", background: "#e2e8f0" },
  dividerText: { fontSize: "13px", color: "#94a3b8" },
  registerSection: { textAlign: "center" },
  registerBtn: { background: "transparent", border: "2px solid #e2e8f0", padding: "14px 24px", borderRadius: "40px", fontSize: "15px", fontWeight: "600", color: "#475569", cursor: "pointer", width: "100%" },
};

export default LoginPortal;