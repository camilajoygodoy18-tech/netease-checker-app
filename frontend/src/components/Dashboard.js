import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaKey, FaCopy, FaCheckCircle, FaSignOutAlt, FaGamepad } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import './Dashboard.css';

// PALITAN ITO NG ACTUAL NETLIFY URL MO
const API_URL = 'https://your-netlify-app.netlify.app/.netlify/functions/api'\;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [aiStatus, setAiStatus] = useState(null);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    fetchAIStatus();
    fetchAPIKey();
  }, []);

  const fetchAIStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/ai/status`);
      setAiStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch AI status:', error);
    }
  };

  const fetchAPIKey = async () => {
    try {
      const response = await axios.get(`${API_URL}/apikey`);
      setApiKey(response.data.key);
    } catch (error) {
      console.error('Failed to fetch API key:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <div className="sidebar glass">
          <div className="sidebar-brand">
            <FaGamepad size={30} color="#FF6B35" />
            <span>Checkton</span>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-item active">
              <FaUser />
              <span>Dashboard</span>
            </div>
          </nav>

          <button onClick={handleLogout} className="sidebar-logout">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>

        <div className="main-content">
          <motion.div 
            className="welcome-card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="welcome-header">
              <div>
                <h2>Welcome back, {user?.username}!</h2>
                <p className="welcome-sub">Here's your account overview</p>
              </div>
              <div className="user-badge">
                <FaUser />
                <span>{user?.role}</span>
              </div>
            </div>
          </motion.div>

          <div className="dashboard-grid">
            <motion.div 
              className="info-card glass"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="card-header">
                <FaUser className="card-icon" />
                <h3>Profile</h3>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <span className="label">Username</span>
                  <span className="value">{user?.username}</span>
                </div>
                <div className="info-item">
                  <span className="label">Role</span>
                  <span className="value role-badge">{user?.role}</span>
                </div>
                <div className="info-item">
                  <span className="label">User ID</span>
                  <span className="value mono">{user?.id}</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="info-card glass"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="card-header">
                <FaKey className="card-icon" />
                <h3>API Key</h3>
              </div>
              <div className="card-content">
                <div className="api-key-display">
                  <span className="key-value mono">{apiKey || 'No API Key'}</span>
                  {apiKey && (
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(apiKey)}
                    >
                      <FaCopy />
                    </button>
                  )}
                </div>
                <div className="info-item">
                  <span className="label">Status</span>
                  <span className="value status-active">
                    <FaCheckCircle />
                    Active
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="info-card glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="card-header">
                <FaCheckCircle className="card-icon" />
                <h3>Connection Status</h3>
              </div>
              <div className="card-content">
                <div className="status-container">
                  <div className="status-item">
                    <span className="status-dot green"></span>
                    <span>Backend Connected</span>
                  </div>
                  <div className="status-item">
                    <span className={`status-dot ${aiStatus?.status === 'online' ? 'green' : 'red'}`}></span>
                    <span>AI Status: {aiStatus?.status || 'Checking...'}</span>
                  </div>
                  <div className="status-message">
                    {aiStatus?.message || 'Backend connected successfully. Checker engine is currently disabled.'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
