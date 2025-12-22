import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const STUDENT_API = 'http://localhost:3007'
const studentId = 1 // À remplacer par user.id

function Profile() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${STUDENT_API}/student/${studentId}/dashboard`)
      setDashboardData(response.data.dashboard)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  const progress = dashboardData?.progress || {}
  const profile = dashboardData?.profile || {}

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Mon Profil</h1>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Informations personnelles */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>Informations Personnelles</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <strong>Nom complet:</strong> {user?.full_name || 'N/A'}
            </div>
            <div>
              <strong>Email:</strong> {user?.email || 'N/A'}
            </div>
            <div>
              <strong>Rôle:</strong> {user?.role || 'N/A'}
            </div>
          </div>
        </div>

        {/* Statistiques d'apprentissage */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>Statistiques d'Apprentissage</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <strong>Score moyen:</strong> {progress.average_score?.toFixed(1) || 'N/A'}
            </div>
            <div>
              <strong>Modules:</strong> {progress.total_modules || 'N/A'}
            </div>
            <div>
              <strong>Engagement:</strong> {progress.engagement_level || 'N/A'}
            </div>
            <div>
              <strong>Temps total:</strong> {progress.total_time_spent?.toFixed(1) || 'N/A'}h
            </div>
            <div>
              <strong>Tendance:</strong> {progress.performance_trend || 'N/A'}
            </div>
            <div>
              <strong>Profil:</strong> {profile.profile_name || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

