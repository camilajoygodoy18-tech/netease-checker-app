import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShieldAlt, FaGamepad, FaUser, FaLock, FaKey, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(username, password);
    setLoading(false);
    
    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        className="login-wrapper glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Panel - Brand */}
        <div className="login-brand">
          <div className="brand-content">
            <div className="brand-icon">
              <FaGamepad size={60} color="#FF6B35" />
            </div>
            <h1 className="brand-title">NETEASE GAMES</h1>
            <div className="brand-checkton">
              <FaShieldAlt size={24} color="#4A5BFF" />
              <span>Checkton</span>
            </div>
            <div className="brand-status">
              <span className="status-dot"></span>
              <span>Ready</span>
            </div>
            <div className="brand-version">v3.1.3</div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-form">
          <h2 className="form-title">Welcome Back</h2>
          <p className="form-subtitle">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="input-group">
              <FaKey className="input-icon" />
              <input
                type="text"
                placeholder="API Key (optional)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="form-input"
              />
            </div>

            <button 
              type="submit" 
              className="login-btn btn-gradient"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  Continue <FaArrowRight className="btn-icon" />
                </>
              )}
            </button>
          </form>

          <p className="form-footer">
            Don't have an account? <a href="#">Register</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;