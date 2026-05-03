import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/portal");
  };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 30px",
      backgroundColor: "#667eea",
      color: "white",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ margin: 0, cursor: "pointer" }} onClick={() => navigate("/")}>
        🛒 ShopEase
      </h2>
      
      <div style={{ display: "flex", gap: "25px", alignItems: "center", flexWrap: "wrap" }}>
        {/* Guest (No Login) - Sirf Login Portal */}
        {!token && (
          <a href="/portal" style={{ color: "white", textDecoration: "none" }}>Login Portal</a>
        )}

        {/* Customer Links - Sirf Customer Login Ke Baad */}
        {token && role === "CUSTOMER" && (
          <>
            <a href="/" style={{ color: "white", textDecoration: "none" }}>Home</a>
            <a href="/products" style={{ color: "white", textDecoration: "none" }}>Products</a>
            <a href="/cart" style={{ color: "white", textDecoration: "none" }}>Cart 🛒</a>
            <a href="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</a>
          </>
        )}

        {/* Admin Links - Sirf Admin Login Ke Baad */}
        {token && role === "ADMIN" && (
          <>
            <a href="/admin/dashboard" style={{ color: "white", textDecoration: "none" }}>Admin Dashboard</a>
          </>
        )}
        
        {/* ✅ Profile Icon - Both Customer & Admin */}
        {token && (
          <div style={styles.profileWrapper}>
            <button
              onClick={() => navigate("/profile")}
              style={styles.profileIcon}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
            >
              👤
            </button>
          </div>
        )}
        
        {/* Logout Button - Sirf Login Ke Baad */}
        {token && (
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            Logout 🚪
          </button>
        )}
      </div>
    </nav>
  );
};

const styles = {
  profileWrapper: {
    position: "relative",
  },
  profileIcon: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    color: "white",
  },
};

export default Navbar;