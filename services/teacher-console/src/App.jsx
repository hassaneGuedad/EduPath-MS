import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Students from './pages/Students'
import Modules from './pages/Modules'
import Resources from './pages/Resources'
import Quizzes from './pages/Quizzes'
import Recommendations from './pages/Recommendations'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>Chargement...</div>
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/users" element={
        <PrivateRoute>
          <Layout>
            <Users />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/students" element={
        <PrivateRoute>
          <Layout>
            <Students />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/modules" element={
        <PrivateRoute>
          <Layout>
            <Modules />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/resources" element={
        <PrivateRoute>
          <Layout>
            <Resources />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/quizzes" element={
        <PrivateRoute>
          <Layout>
            <Quizzes />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/recommendations" element={
        <PrivateRoute>
          <Layout>
            <Recommendations />
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
