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
      
      // Récupérer les données utilisateur avec le token
      const userRes = await axios.get(`${AUTH_API}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Stocker les données étudiant pour les ressources
      const userData = userRes.data
      const studentData = {
        id: userData.id,
        student_id: userData.student_id || userData.id,  // Utiliser student_id ou id comme fallback
        email: userData.email,
        role: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name,
        subjects: userData.subjects || []
      }
      localStorage.setItem('currentStudent', JSON.stringify(studentData))
      console.log('📚 Données étudiant sauvegardées:', studentData)
      
      setUser(userData)
      setIsAuthenticated(true)
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

