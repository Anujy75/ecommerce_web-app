import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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
      
      <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <a href="/" style={{ color: "white", textDecoration: "none" }}>Home</a>
        <a href="/products" style={{ color: "white", textDecoration: "none" }}>Products</a>
        <a href="/cart" style={{ color: "white", textDecoration: "none" }}>Cart 🛒</a>
        <a href="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</a>
        
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

export default Navbar;