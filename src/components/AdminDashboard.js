import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, FaUsers, FaKey, FaCog, FaSignOutAlt, 
  FaGamepad, FaCopy, FaTrash, FaSearch, FaPlus,
  FaCheckCircle, FaSync, FaUser, FaServer
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import './AdminDashboard.css';

// PALITAN ITO NG ACTUAL NETLIFY URL MO
const API_URL = 'https://your-netlify-app.netlify.app/.netlify/functions/api'\;

const AdminDashboard = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const generateAPIKey = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/admin/generate-key`, { userId });
      toast.success('API Key generated successfully!');
      fetchUsers();
      setLoading(false);
    } catch (error) {
      toast.error('Failed to generate API Key');
      setLoading(false);
    }
  };

  const revokeAPIKey = async (userId) => {
    if (!window.confirm('Are you sure you want to revoke this API Key?')) return;
    
    try {
      setLoading(true);
      await axios.post(`${API_URL}/admin/revoke-key`, { userId });
      toast.success('API Key revoked successfully!');
      fetchUsers();
      setLoading(false);
    } catch (error) {
      toast.error('Failed to revoke API Key');
      setLoading(false);
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

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        <div className="admin-sidebar glass">
          <div className="sidebar-brand">
            <FaGamepad size={30} color="#FF6B35" />
            <span>Checkton Admin</span>
          </div>

          <nav className="sidebar-nav">
            <div 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaHome />
              <span>Dashboard</span>
            </div>
            <div 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FaUsers />
              <span>Users</span>
            </div>
            <div 
              className={`nav-item ${activeTab === 'apikeys' ? 'active' : ''}`}
              onClick={() => setActiveTab('apikeys')}
            >
              <FaKey />
              <span>API Keys</span>
            </div>
            <div 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FaCog />
              <span>Settings</span>
            </div>
          </nav>

          <button onClick={handleLogout} className="sidebar-logout">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="admin-dashboard"
            >
              <h2 className="admin-title">Dashboard Overview</h2>
              
              <div className="stats-grid">
                <div className="stat-card glass">
                  <div className="stat-icon" style={{ background: 'rgba(74, 91, 255, 0.2)' }}>
                    <FaUsers color="#4A5BFF" />
                  </div>
                  <div className="stat-info">
                    <h3>Total Users</h3>
                    <p>{dashboardData?.totalUsers || 0}</p>
                  </div>
                </div>

                <div className="stat-card glass">
                  <div className="stat-icon" style={{ background: 'rgba(0, 255, 0, 0.2)' }}>
                    <FaKey color="#00ff00" />
                  </div>
                  <div className="stat-info">
                    <h3>Active API Keys</h3>
                    <p>{dashboardData?.activeApiKeys || 0}</p>
                  </div>
                </div>

                <div className="stat-card glass">
                  <div className="stat-icon" style={{ background: 'rgba(255, 107, 53, 0.2)' }}>
                    <FaUser color="#FF6B35" />
                  </div>
                  <div className="stat-info">
                    <h3>Connected Users</h3>
                    <p>{dashboardData?.connectedUsers || 0}</p>
                  </div>
                </div>

                <div className="stat-card glass">
                  <div className="stat-icon" style={{ background: 'rgba(0, 255, 0, 0.2)' }}>
                    <FaServer color="#00ff00" />
                  </div>
                  <div className="stat-info">
                    <h3>System Status</h3>
                    <p className="status-online">
                      <FaCheckCircle />
                      {dashboardData?.systemStatus || 'Online'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="admin-users"
            >
              <div className="users-header">
                <h2 className="admin-title">User Management</h2>
                <div className="search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="users-table glass">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Role</th>
                      <th>API Key</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td><strong>{user.username}</strong></td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <div className="api-key-cell">
                            <span className="key-preview mono">
                              {user.apiKey ? `${user.apiKey.slice(0, 8)}...` : 'No Key'}
                            </span>
                            {user.apiKey && (
                              <button 
                                className="icon-btn"
                                onClick={() => copyToClipboard(user.apiKey)}
                                title="Copy API Key"
                              >
                                <FaCopy size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="mono">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn generate"
                              onClick={() => generateAPIKey(user.id)}
                              disabled={loading}
                              title="Generate/Regenerate API Key"
                            >
                              <FaPlus />
                            </button>
                            <button 
                              className="action-btn revoke"
                              onClick={() => revokeAPIKey(user.id)}
                              disabled={loading}
                              title="Revoke API Key"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'apikeys' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="admin-apikeys"
            >
              <h2 className="admin-title">API Key Management</h2>
              
              <div className="apikeys-list glass">
                {users.map((user) => (
                  <div key={user.id} className="apikey-item">
                    <div className="apikey-info">
                      <span className="apikey-owner">{user.username}</span>
                      <span className="apikey-value mono">{user.apiKey || 'No API Key'}</span>
                      <span className="apikey-status">
                        {user.apiKey ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </div>
                    <div className="apikey-actions">
                      <button 
                        className="action-btn generate"
                        onClick={() => generateAPIKey(user.id)}
                        disabled={loading}
                        title="Generate/Regenerate API Key"
                      >
                        <FaSync />
                      </button>
                      <button 
                        className="action-btn copy"
                        onClick={() => copyToClipboard(user.apiKey)}
                        disabled={!user.apiKey}
                        title="Copy API Key"
                      >
                        <FaCopy />
                      </button>
                      <button 
                        className="action-btn revoke"
                        onClick={() => revokeAPIKey(user.id)}
                        disabled={loading || !user.apiKey}
                        title="Revoke API Key"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="admin-settings"
            >
              <h2 className="admin-title">System Settings</h2>
              
              <div className="settings-card glass">
                <div className="settings-section">
                  <h3>System Status</h3>
                  <div className="status-indicator">
                    <span className="status-dot green"></span>
                    <span>🟢 Online</span>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>AI Integration</h3>
                  <div className="settings-item">
                    <span className="settings-label">Status:</span>
                    <span className="settings-value">
                      <span className="status-dot green"></span>
                      AI Connected Successfully
                    </span>
                  </div>
                  <div className="settings-item">
                    <span className="settings-label">Checker Engine:</span>
                    <span className="settings-value disabled">Disabled</span>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Environment</h3>
                  <div className="settings-item">
                    <span className="settings-label">API URL:</span>
                    <span className="settings-value mono">{API_URL}</span>
                  </div>
                  <div className="settings-item">
                    <span className="settings-label">Version:</span>
                    <span className="settings-value">v3.1.3</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
