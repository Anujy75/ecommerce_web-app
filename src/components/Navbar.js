import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(
    localStorage.getItem("customerToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token")
  );
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const updateNavbar = () => {
      setToken(
        localStorage.getItem("customerToken") ||
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token")
      );
      setRole(localStorage.getItem("role"));
    };

    updateNavbar();
    window.addEventListener("storage", updateNavbar);
    return () => window.removeEventListener("storage", updateNavbar);
  }, []);

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
        {!token && (
          <a href="/portal" style={{ color: "white", textDecoration: "none" }}>Login Portal</a>
        )}

        {token && role === "CUSTOMER" && (
          <>
            <a href="/" style={{ color: "white", textDecoration: "none" }}>Home</a>
            <a href="/products" style={{ color: "white", textDecoration: "none" }}>Products</a>
            <a href="/cart" style={{ color: "white", textDecoration: "none" }}>Cart </a>
            <a href="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</a>
            <a href="/orders" style={{ color: "white", textDecoration: "none" }}>Orders </a>
          </>
        )}

        {token && role === "ADMIN" && (
          <a href="/admin/dashboard" style={{ color: "white", textDecoration: "none" }}>Admin Dashboard</a>
        )}

        {token && (
          <button
            onClick={() => navigate("/profile")}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              fontSize: "18px",
              cursor: "pointer",
              color: "white"
            }}
          >
            👤
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
