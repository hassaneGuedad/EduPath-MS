import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
    { path: '/students', label: 'Étudiants', icon: '👥' },
    { path: '/users', label: 'Utilisateurs', icon: '👤' },
    { path: '/modules', label: 'Modules', icon: '📚' },
    { path: '/resources', label: 'Ressources', icon: '📖' },
    { path: '/quizzes', label: 'Quiz', icon: '📋' },
    { path: '/recommendations', label: 'Recommandations', icon: '🎯' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>EduPath Admin</h2>
        
        <nav style={{ flex: 1 }}>
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'block',
                padding: '12px 15px',
                marginBottom: '5px',
                color: location.pathname === item.path ? '#3498db' : 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                backgroundColor: location.pathname === item.path ? '#34495e' : 'transparent',
                transition: 'all 0.3s'
              }}
            >
              <span style={{ marginRight: '10px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #34495e', paddingTop: '20px' }}>
          <div style={{ marginBottom: '10px', fontSize: '14px' }}>
            <strong>{user?.full_name}</strong>
            <div style={{ fontSize: '12px', color: '#95a5a6' }}>{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '30px' }}>
        {children}
      </div>
    </div>
  )
}

export default Layout

