import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const AUTH_API = 'http://localhost:3008'

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${AUTH_API}/auth/me`)
      setUser(response.data)
      setIsAuthenticated(true)
    } catch (error) {
      // Erreur 401 normale si pas authentifié (ne pas log)
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      // Utiliser URLSearchParams pour application/x-www-form-urlencoded
      const params = new URLSearchParams()
      params.append('username', email)
      params.append('password', password)
      
      const response = await axios.post(`${AUTH_API}/auth/login`, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      
      const token = response.data.access_token
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      await fetchUser()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Erreur de connexion' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

