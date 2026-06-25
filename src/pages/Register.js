import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // ✅ ADD THIS

function Register() {
  const navigate = useNavigate();  // ✅ ADD THIS
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', address: ''
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ FIXED URL - "/auth/register" not "/users/register"
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.text();
      setMessage(data);
      setIsSuccess(response.ok);
      
      // ✅ Agar registration successful ho to login page pe bhej do
      // ✅ Naya — credentials bhi bhejo saath me
if (response.ok) {
  setTimeout(() => {
    navigate('/login/user', { 
      state: { 
        email: formData.email, 
        password: formData.password 
      } 
    });
  }, 2000);
}
      
    } catch (error) {
      setMessage('Something went wrong!');
      setIsSuccess(false);
    }
    setLoading(false);
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif"
    },
    card: {
      background: '#fff',
      borderRadius: '16px',
      padding: '40px',
      width: '100%',
      maxWidth: '420px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    },
    logo: {
      textAlign: 'center',
      marginBottom: '8px'
    },
    logoText: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#667eea'
    },
    subtitle: {
      textAlign: 'center',
      color: '#888',
      fontSize: '14px',
      marginBottom: '28px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#444',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '11px 14px',
      borderRadius: '8px',
      border: '1.5px solid #e0e0e0',
      fontSize: '14px',
      marginBottom: '16px',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border 0.2s'
    },
    button: {
      width: '100%',
      padding: '13px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      marginTop: '4px',
      letterSpacing: '0.5px'
    },
    message: {
      marginTop: '16px',
      padding: '12px',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      background: isSuccess ? '#e6f9f0' : '#fdecea',
      color: isSuccess ? '#2e7d32' : '#c62828'
    },
    divider: {
      textAlign: 'center',
      color: '#aaa',
      fontSize: '13px',
      marginTop: '20px'
    },
    link: {
      color: '#667eea',
      fontWeight: '600',
      cursor: 'pointer',
      textDecoration: 'none'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>🛒 ShopEase</span>
        </div>
        <p style={styles.subtitle}>Create your account to get started</p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            name="name"
            placeholder="John Doe"
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="john@example.com"
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder="Min 6 characters"
            onChange={handleChange}
            required
          />
          <label style={styles.label}>Phone Number</label>
          <input
            style={styles.input}
            name="phone"
            placeholder="+91 99999 99999"
            onChange={handleChange}
          />

          <label style={styles.label}>Address</label>
          <input
            style={styles.input}
            name="address"
            placeholder="Mumbai, India"
            onChange={handleChange}
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {message && <div style={styles.message}>{message}</div>}

        <div style={styles.divider}>
          Already have an account? <a href="/login/user" style={styles.link}>Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default Register;


