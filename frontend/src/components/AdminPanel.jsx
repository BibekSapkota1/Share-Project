import React, { useState, useEffect } from 'react';
import { Settings, Users, BarChart3, AlertCircle, Check, X, Shield, TrendingUp, Activity } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

function AdminPanel({ onLogout, user }) {
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({});
  const [editingSettings, setEditingSettings] = useState({});
  
  // Users state
  const [users, setUsers] = useState([]);
  
  // Stats state
  const [stats, setStats] = useState({});
  
  const [notification, setNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettings();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': localStorage.getItem('token') || ''
  });

  const showNotificationMessage = (message, type) => {
    setNotification({ message, type });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/settings`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setSettings(data.settings);
        const editing = {};
        Object.keys(data.settings).forEach(key => {
          editing[key] = data.settings[key].value;
        });
        setEditingSettings(editing);
      } else {
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      showNotificationMessage('Error fetching settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const response = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ key, value })
      });
      const data = await response.json();
      if (response.ok) {
        showNotificationMessage(data.message, 'success');
        fetchSettings();
      } else {
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      showNotificationMessage('Error updating setting', 'error');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      showNotificationMessage('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserAdmin = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-admin`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        showNotificationMessage(data.message, 'success');
        fetchUsers();
      } else {
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      showNotificationMessage('Error updating user', 'error');
    }
  };

  const toggleUserActive = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-active`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        showNotificationMessage(data.message, 'success');
        fetchUsers();
      } else {
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      showNotificationMessage('Error updating user', 'error');
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      } else {
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      showNotificationMessage('Error fetching stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="background-grid"></div>

      {showNotification && notification && (
        <div className={`notification ${notification.type} ${showNotification ? 'show' : ''}`}>
          <AlertCircle size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <Shield size={32} strokeWidth={2.5} />
            <h1>ADMIN<span>PANEL</span></h1>
          </div>
          <div className="admin-user-info">
            <div className="user-badge">
              <Shield size={16} />
              <span>{user?.email}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-content">
        <nav className="admin-nav">
          <button 
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 size={20} />
            Dashboard
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            Global Settings
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            User Management
          </button>
        </nav>

        <main className="admin-main">
          {activeTab === 'stats' && (
            <div className="admin-section">
              <h2 className="section-title">
                <BarChart3 size={28} />
                System Statistics
              </h2>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon users">
                    <Users size={32} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.total_users || 0}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon cycles">
                    <Activity size={32} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.total_cycles || 0}</div>
                    <div className="stat-label">Total Cycles</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon open">
                    <TrendingUp size={32} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.open_cycles || 0}</div>
                    <div className="stat-label">Open Positions</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className={`stat-icon ${stats.total_pnl >= 0 ? 'profit' : 'loss'}`}>
                    NPR
                  </div>
                  <div className="stat-content">
                    <div className={`stat-value ${stats.total_pnl >= 0 ? 'profit' : 'loss'}`}>
                      {stats.total_pnl ? `NPR ${stats.total_pnl.toFixed(2)}` : 'NPR 0.00'}
                    </div>
                    <div className="stat-label">Total P/L</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="admin-section">
              <h2 className="section-title">
                <Settings size={28} />
                Global RSI Settings
              </h2>
              <p className="section-subtitle">
                These settings apply to all users by default. Changes take effect immediately.
              </p>

              {loading ? (
                <div className="loading-state">Loading settings...</div>
              ) : (
                <div className="settings-list">
                  {Object.keys(settings).map(key => (
                    <div key={key} className="setting-item">
                      <div className="setting-info">
                        <div className="setting-name">{settings[key].key.replace(/_/g, ' ').toUpperCase()}</div>
                        <div className="setting-description">{settings[key].description}</div>
                        {settings[key].updated_at && (
                          <div className="setting-updated">
                            Last updated: {new Date(settings[key].updated_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="setting-controls">
                        <input
                          type="number"
                          value={editingSettings[key] || ''}
                          onChange={(e) => setEditingSettings({
                            ...editingSettings,
                            [key]: parseInt(e.target.value)
                          })}
                          className="setting-input"
                          min={key === 'default_rsi_period' ? 2 : key === 'default_lower_threshold' ? 0 : 50}
                          max={key === 'default_rsi_period' ? 100 : key === 'default_lower_threshold' ? 50 : 100}
                        />
                        <button
                          className="save-btn"
                          onClick={() => updateSetting(key, editingSettings[key])}
                          disabled={editingSettings[key] === settings[key].value}
                        >
                          <Check size={18} />
                          Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-section">
              <h2 className="section-title">
                <Users size={28} />
                User Management
              </h2>
              <p className="section-subtitle">
                Manage user accounts, admin privileges, and access control.
              </p>

              {loading ? (
                <div className="loading-state">Loading users...</div>
              ) : (
                <div className="users-table-wrapper">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Admin</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.email}</strong></td>
                          <td>
                            {u.is_admin ? (
                              <span className="badge admin-badge">
                                <Shield size={14} />
                                Admin
                              </span>
                            ) : (
                              <span className="badge user-badge">User</span>
                            )}
                          </td>
                          <td>
                            {u.is_active ? (
                              <span className="badge active-badge">
                                <Check size={14} />
                                Active
                              </span>
                            ) : (
                              <span className="badge inactive-badge">
                                <X size={14} />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                          <td className="actions-cell">
                            <button
                              className="action-btn"
                              onClick={() => toggleUserAdmin(u.id)}
                              title={u.is_admin ? 'Remove admin' : 'Make admin'}
                            >
                              <Shield size={16} />
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => toggleUserActive(u.id)}
                              title={u.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {u.is_active ? <X size={16} /> : <Check size={16} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .admin-panel {
          min-height: 100vh;
          background: #0a0e1a;
          color: #e2e8f0;
        }

        .admin-header {
          background: rgba(15, 20, 25, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #1e293b;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .admin-header-content {
          max-width: 1600px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .admin-logo svg {
          color: #f59e0b;
          filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5));
        }

        .admin-logo h1 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #f1f5f9;
        }

        .admin-logo h1 span {
          color: #f59e0b;
        }

        .admin-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          color: #f59e0b;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .logout-btn {
          padding: 0.5rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .admin-content {
          max-width: 1600px;
          margin: 0 auto;
          padding: 2rem;
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 2rem;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .admin-nav button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #1e293b;
          color: #94a3b8;
          border-radius: 12px;
          cursor: pointer;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .admin-nav button:hover {
          background: rgba(30, 41, 59, 0.8);
          color: #f1f5f9;
          border-color: #f59e0b;
        }

        .admin-nav button.active {
          background: rgba(245, 158, 11, 0.15);
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .admin-main {
          flex: 1;
        }

        .admin-section {
          background: rgba(15, 20, 25, 0.8);
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 2rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 2rem;
          font-weight: 800;
          color: #f1f5f9;
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          color: #94a3b8;
          margin-bottom: 2rem;
          font-size: 1.05rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: #f59e0b;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 800;
        }

        .stat-icon.users {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .stat-icon.cycles {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .stat-icon.open {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .stat-icon.profit {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .stat-icon.loss {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #f1f5f9;
        }

        .stat-value.profit {
          color: #10b981;
        }

        .stat-value.loss {
          color: #ef4444;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .setting-item {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .setting-info {
          flex: 1;
        }

        .setting-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f59e0b;
          margin-bottom: 0.5rem;
        }

        .setting-description {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .setting-updated {
          color: #64748b;
          font-size: 0.8rem;
          font-style: italic;
        }

        .setting-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .setting-input {
          width: 100px;
          padding: 0.75rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #1e293b;
          border-radius: 8px;
          color: #f1f5f9;
          font-family: inherit;
          font-size: 1.1rem;
          font-weight: 700;
          text-align: center;
        }

        .setting-input:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .users-table-wrapper {
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          background: rgba(30, 41, 59, 0.5);
          padding: 1rem;
          text-align: left;
          font-size: 0.85rem;
          font-weight: 700;
          color: #f59e0b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #1e293b;
        }

        .users-table td {
          padding: 1rem;
          border-bottom: 1px solid #1e293b;
        }

        .users-table tr:hover {
          background: rgba(30, 41, 59, 0.3);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .admin-badge {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .user-badge {
          background: rgba(100, 116, 139, 0.2);
          color: #94a3b8;
        }

        .active-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .inactive-badge {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #1e293b;
          color: #94a3b8;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: rgba(30, 41, 59, 0.8);
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: #94a3b8;
          font-size: 1.1rem;
        }

        .notification {
          position: fixed;
          top: 100px;
          right: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          z-index: 1000;
          transform: translateX(400px);
          transition: transform 0.4s ease;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .notification.show {
          transform: translateX(0);
        }

        .notification.success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .notification.error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}

export default AdminPanel;