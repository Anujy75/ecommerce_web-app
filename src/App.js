import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* ✅ Root always redirects to /portal */}
          <Route path="/" element={<Navigate to="/portal" replace />} />

          {/* Public routes */}
          <Route path="/portal" element={<LoginPortal />} />
          <Route path="/login/user" element={<Login />} />   
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          <Route path="/order-success" element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]}>
              <OrderSuccess />
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]}>
              <Orders />
            </ProtectedRoute>
          } />

          <Route path="/change-password" element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]}>
              <ChangePassword />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;




