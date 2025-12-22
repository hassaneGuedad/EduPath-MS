import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Modules from './pages/Modules'
import Recommendations from './pages/Recommendations'
import Resources from './pages/Resources'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import CourseContent from './pages/CourseContent'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
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
      <Route path="/modules" element={
        <PrivateRoute>
          <Layout>
            <Modules />
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
      <Route path="/resources" element={
        <PrivateRoute>
          <Layout>
            <Resources />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout>
            <Profile />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <Layout>
            <Settings />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/course/:resourceId" element={
        <PrivateRoute>
          <CourseContent />
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

