import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    category: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get("/api/products/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
      const uniqueCategories = ["All", ...new Set(response.data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/login/admin");
      return;
    }
    fetchProducts();
  }, [token, role, navigate, fetchProducts]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showMessage("Product updated successfully!", "success");
      } else {
        await axios.post("/api/products", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showMessage("Product added successfully!", "success");
      }
      setFormData({ name: "", description: "", price: "", stock: "", imageUrl: "", category: "" });
      setEditingProduct(null);
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      showMessage("Error saving product", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const currentToken = localStorage.getItem("token");
        await axios.delete(
          `/api/products/${id}`,
          { headers: { 'Authorization': `Bearer ${currentToken}` } }
        );
        showMessage(`"${name}" deleted successfully!`, "success");
        fetchProducts();
      } catch (error) {
        console.error("Delete error:", error);
        showMessage("Delete failed! Try again.", "error");
      }
    }
  };

  // ✅ New: Toggle Out of Stock - Simply sets stock to 0 or restores to 1
  const handleToggleOutOfStock = async (product) => {
    const newStock = product.stock > 0 ? 0 : 1;
    const updatedProduct = { ...product, stock: newStock };
    
    try {
      await axios.put(`/api/products/${product.id}`, updatedProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage(`Product ${newStock > 0 ? "marked IN STOCK" : "marked OUT OF STOCK"}!`, "success");
      fetchProducts();
    } catch (error) {
      console.error("Stock toggle error:", error);
      showMessage("Error updating stock status", "error");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || "",
      category: product.category
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🛒 Inventory Management</h1>
          <p style={styles.subtitle}>Manage your products, track stock, and monitor sales</p>
        </div>
        <button style={styles.addBtn} onClick={() => { setShowForm(true); setEditingProduct(null); setFormData({ name: "", description: "", price: "", stock: "", imageUrl: "", category: "" }); }}>
          <span style={styles.addIcon}>+</span> Add Product
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📦</div>
          <div>
            <div style={styles.statNumber}>{products.length}</div>
            <div style={styles.statLabel}>Total Products</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div>
            <div style={styles.statNumber}>{products.filter(p => p.stock > 0).length}</div>
            <div style={styles.statLabel}>In Stock</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⚠️</div>
          <div>
            <div style={styles.statNumber}>{products.filter(p => p.stock === 0).length}</div>
            <div style={styles.statLabel}>Out of Stock</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏷️</div>
          <div>
            <div style={styles.statNumber}>{categories.length - 1}</div>
            <div style={styles.statLabel}>Categories</div>
          </div>
        </div>
      </div>

      {message && (
        <div style={{...styles.message, ...(messageType === "error" ? styles.messageError : styles.messageSuccess)}}>
          {message}
        </div>
      )}

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={styles.filterSelect}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyRow}>
                  <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>📭</span>
                    <p>No products found</p>
                    <button style={styles.emptyBtn} onClick={() => setShowForm(true)}>Add your first product</button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} style={styles.tableRow}>
                  <td style={styles.td}>#{product.id}</td>
                  <td style={styles.td}>
                    <div style={styles.productCell}>
                      <div style={styles.productImage}>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} style={styles.productImg} />
                        ) : (
                          <span style={styles.productIcon}>🛍️</span>
                        )}
                      </div>
                      <div>
                        <div style={styles.productName}>{product.name}</div>
                        <div style={styles.productDesc}>{product.description?.substring(0, 60)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.categoryBadge}>{product.category}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.priceTag}>₹{product.price?.toLocaleString('en-IN')}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={product.stock > 0 ? styles.stockBadge : styles.outStockBadge}>
                      {product.stock > 0 ? `${product.stock} units` : "Out of stock"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={product.stock > 0 ? styles.inStockStatus : styles.outStockStatus}>
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionBtns}>
                      <button 
                        style={product.stock > 0 ? styles.outOfStockBtn : styles.inStockBtn}
                        onClick={() => handleToggleOutOfStock(product)}
                      >
                        {product.stock > 0 ? "📦 Mark Out of Stock" : "🔄 Mark In Stock"}
                      </button>
                      <button style={styles.editBtn} onClick={() => handleEdit(product)}>✏️ Edit</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(product.id, product.name)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={styles.modalOverlay} onClick={() => { setShowForm(false); setEditingProduct(null); }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}</h2>
              <button style={styles.modalClose} onClick={() => { setShowForm(false); setEditingProduct(null); }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Product Name *</label>
                <input style={styles.formInput} name="name" placeholder="e.g., iPhone 15 Pro" value={formData.name} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description *</label>
                <textarea style={styles.formTextarea} name="description" placeholder="Describe your product..." value={formData.description} onChange={handleChange} required />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Price (₹) *</label>
                  <input style={styles.formInput} name="price" type="number" placeholder="19999" value={formData.price} onChange={handleChange} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Stock *</label>
                  <input style={styles.formInput} name="stock" type="number" placeholder="100" value={formData.stock} onChange={handleChange} required />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Category *</label>
                  <input style={styles.formInput} name="category" placeholder="Electronics, Fashion, etc." value={formData.category} onChange={handleChange} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Image URL</label>
                  <input style={styles.formInput} name="imageUrl" placeholder="https://..." value={formData.imageUrl} onChange={handleChange} />
                </div>
              </div>
              <button style={styles.submitBtn} type="submit">
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={styles.footerStats}>
        <div style={styles.footerStat}>
          <span style={styles.footerStatLabel}>Showing:</span>
          <span style={styles.footerStatValue}>{filteredProducts.length} of {products.length} products</span>
        </div>
        <div style={styles.footerStat}>
          <span style={styles.footerStatLabel}>Total Value:</span>
          <span style={styles.footerStatValue}>₹{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: "2rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#f5f7fa",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2e12e6",
    margin: 0,
  },
  subtitle: {
    color: "#000",
    marginTop: "8px",
    fontSize: "14px",
  },
  addBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  addIcon: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e9ecef",
  },
  statIcon: {
    fontSize: "32px",
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a2e",
  },
  statLabel: {
    fontSize: "13px",
    color: "#6c757d",
    marginTop: "4px",
  },
  filterBar: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  searchBox: {
    flex: 1,
    position: "relative",
    minWidth: "250px",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "16px",
    opacity: 0.6,
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px 12px 40px",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
    fontSize: "14px",
    outline: "none",
  },
  filterSelect: {
    padding: "12px 50px",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
    fontSize: "14px",
    background: "white",
    cursor: "pointer",
    outline: "none",
  },
  message: {
    padding: "12px 20px",
    borderRadius: "12px",
    marginBottom: "1rem",
    textAlign: "center",
    fontWeight: "500",
  },
  messageSuccess: {
    background: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  messageError: {
    background: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
  tableWrapper: {
    background: "white",
    borderRadius: "16px",
    overflow: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e9ecef",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  tableHeader: {
    background: "#f8f9fa",
    borderBottom: "2px solid #e9ecef",
  },
  th: {
    padding: "1rem",
    textAlign: "left",
    fontWeight: "600",
    color: "#495057",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid #e9ecef",
  },
  td: {
    padding: "1rem",
    verticalAlign: "middle",
  },
  productCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  productImage: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    background: "#f8f9fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  productIcon: {
    fontSize: "20px",
  },
  productName: {
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  productDesc: {
    fontSize: "12px",
    color: "#6c757d",
  },
  categoryBadge: {
    background: "#e7f3ff",
    color: "#0066cc",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  priceTag: {
    fontWeight: "600",
    color: "#28a745",
    fontSize: "14px",
  },
  stockBadge: {
    background: "#d4edda",
    color: "#155724",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  outStockBadge: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  inStockStatus: {
    background: "#d4edda",
    color: "#166534",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  outStockStatus: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  actionBtns: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  outOfStockBtn: {
    background: "#f97316",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  inStockBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  editBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  deleteBtn: {
    background: "#dc3545",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  emptyRow: {
    padding: "3rem",
    textAlign: "center",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  emptyIcon: {
    fontSize: "48px",
  },
  emptyBtn: {
    background: "#667eea",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "white",
    borderRadius: "24px",
    padding: "2rem",
    width: "90%",
    maxWidth: "550px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: 0,
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#6c757d",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  formLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#495057",
    marginBottom: "6px",
  },
  formInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e9ecef",
    fontSize: "14px",
    outline: "none",
  },
  formTextarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e9ecef",
    fontSize: "14px",
    outline: "none",
    minHeight: "80px",
    fontFamily: "inherit",
  },
  formRow: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "1rem",
  },
  footerStats: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.5rem",
    padding: "1rem",
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
  },
  footerStat: {
    display: "flex",
    gap: "8px",
    fontSize: "14px",
  },
  footerStatLabel: {
    color: "#6c757d",
  },
  footerStatValue: {
    fontWeight: "600",
    color: "#1a1a2e",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    flexDirection: "column",
  },
  spinner: {
    border: "3px solid #e9ecef",
    borderTop: "3px solid #667eea",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "1rem",
    color: "#6c757d",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  button:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;
