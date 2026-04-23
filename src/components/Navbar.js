import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div style={{ padding: "10px", backgroundColor: "#eee" }}>
      <h2>My Website</h2>

      <div>
        <Link to="/" style={{ marginRight: "15px" }}>Home</Link>
        <Link to="/products" style={{ marginRight: "15px" }}>Products</Link>
        <Link to="/cart">Cart</Link>
      </div>
    </div>
  );
}

export default Navbar;