import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>🎉 Dashboard</h1>
      <p>Welcome! You are successfully logged in.</p>
      <p>Your token is stored in localStorage ✅</p>
      
      <button 
        onClick={handleLogout}
        style={{
          padding: "12px 24px",
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          marginTop: "20px"
        }}
      >
        Logout 🚪
      </button>
    </div>
  );
};

export default Dashboard;