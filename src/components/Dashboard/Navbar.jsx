import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Calendar, CheckSquare, Target, BarChart2, LogOut, User, ClipboardList, Sun, Moon } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, theme, toggleTheme } = useApp();

  const tabs = [
    { id: 'habits', label: 'Habits', icon: <Calendar size={16} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={16} /> },
    { id: 'goals', label: 'Goals', icon: <Target size={16} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart2 size={16} /> },
    { id: 'review', label: 'Review', icon: <ClipboardList size={16} /> }
  ];

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand */}
        <div className="nav-brand" onClick={() => setActiveTab('habits')} style={{ cursor: 'pointer' }}>
          <Sparkles size={18} className="nav-brand-icon" />
          <span>AURAA</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info, Theme Toggle & Logout */}
        <div className="nav-user-actions">
          <div className="nav-user-badge">
            <User size={14} className="user-icon" />
            <span className="username">{currentUser?.username}</span>
          </div>
          
          <button 
            onClick={toggleTheme} 
            className="btn-icon nav-theme-btn" 
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <button onClick={logout} className="btn-icon nav-logout-btn" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .navbar-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          background-color: var(--navbar-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          z-index: 1000;
          display: flex;
          align-items: center;
        }

        .navbar-container {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--brand-color);
        }

        .nav-brand-icon {
          color: var(--accent-primary);
        }

        .nav-tabs {
          display: flex;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 3px;
        }

        .nav-tab-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          border-radius: 16px;
          transition: var(--transition-smooth);
        }

        .nav-tab-item:hover {
          color: var(--text-primary);
        }

        .nav-tab-item.active {
          background-color: var(--bg-tertiary);
          color: var(--accent-primary);
          box-shadow: var(--shadow-sm);
        }

        .nav-user-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-user-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: var(--border-radius-sm);
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .user-icon {
          color: var(--text-muted);
        }

        .username {
          font-weight: 500;
          color: var(--text-primary);
        }

        .nav-logout-btn {
          border-color: var(--border-color);
        }
        .nav-logout-btn:hover {
          color: var(--accent-danger);
          border-color: rgba(224, 122, 95, 0.4);
          background-color: rgba(224, 122, 95, 0.05);
        }

        .nav-theme-btn {
          border-color: var(--border-color);
          color: var(--text-secondary);
        }
        .nav-theme-btn:hover {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
          background-color: var(--bg-tertiary);
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 16px;
          }
          
          .nav-brand span, .nav-user-badge span {
            display: none;
          }

          .nav-tab-item span {
            display: none;
          }
          
          .nav-tab-item {
            padding: 8px 12px;
          }
        }
      `}</style>
    </header>
  );
};
