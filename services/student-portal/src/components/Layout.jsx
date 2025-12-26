import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/modules', label: 'Mes Modules', icon: '📚' },
    { path: '/recommendations', label: 'Recommandations', icon: '💡' },
    { path: '/resources', label: 'Ressources', icon: '📖' },
    { path: '/profile', label: 'Mon Profil', icon: '👤' },
    { path: '/settings', label: 'Paramètres', icon: '⚙️' }
  ]

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">SP</div>
          <h2 className="sidebar-title">EduPath</h2>
          <p className="sidebar-subtitle">Portail Étudiant</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.full_name?.charAt(0) || 'E'}</div>
            <div className="user-details">
              <div className="user-name">{user?.full_name}</div>
              <div className="user-role">Étudiant</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {children}
      </div>
    </div>
  )
}

export default Layout
