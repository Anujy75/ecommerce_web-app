import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";  // ✅ Add this line
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Register from './pages/Register';
import Login from './pages/Login';
import LoginPortal from './pages/LoginPortal';  
import AdminLogin from './pages/AdminLogin';        
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/DashBoard';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';

function App() {
  return (
    <>
      <Toaster position="top-right" />  {/* ✅ Add this line */}
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/portal" element={<LoginPortal />} />
          <Route path="/login/user" element={<Login />} />   
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          
          {/* Customer Only Routes */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <Home />
            </ProtectedRoute>
          } />  
          <Route path="/home" element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/product/:id" element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <ProductDetails />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]}>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Admin Only Route */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Both Admin & Customer */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER"]}>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;