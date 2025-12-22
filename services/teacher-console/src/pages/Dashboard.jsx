import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Bar, Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const AUTH_API = 'http://localhost:3008'
const PROFILER_API = 'http://localhost:3003'

function Dashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [alertsOpen, setAlertsOpen] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // Récupérer tous les étudiants depuis auth-service
      const usersResponse = await axios.get(`${AUTH_API}/users`, { headers })
      const authStudents = usersResponse.data.filter(user => user.role === 'student')
      
      console.log(`📊 Chargement des statistiques pour ${authStudents.length} étudiants`)

      // Pour chaque étudiant, récupérer ses quiz scores
      const studentsWithStats = await Promise.all(
        authStudents.map(async (student) => {
          try {
            // Récupérer les scores de quiz de l'étudiant
            const scoresResponse = await axios.get(
              `${AUTH_API}/student-quiz-scores/${student.student_id || student.id}`,
              { headers }
            )
            const scores = scoresResponse.data

            // Calculer les statistiques
            const quizzesTaken = scores.length
            const averageScore = quizzesTaken > 0
              ? scores.reduce((sum, s) => sum + s.score, 0) / quizzesTaken
              : 0
            const passedQuizzes = scores.filter(s => s.passed).length
            const successRate = quizzesTaken > 0 ? (passedQuizzes / quizzesTaken) * 100 : 0

            // Calculer le score de risque (inverse du taux de réussite)
            const riskScore = 100 - successRate

            // Récupérer les ressources vues
            let viewedResourcesCount = 0
            try {
              const viewsResponse = await axios.get(
                `${AUTH_API}/resources?student_id=${student.student_id || student.id}`,
                { headers }
              )
              viewedResourcesCount = viewsResponse.data.filter(r => r.is_viewed).length
            } catch (error) {
              console.warn('Erreur chargement ressources vues:', error)
            }

            // Récupérer le profil ML depuis StudentProfiler
            let profile = null
            try {
              const profileResponse = await axios.get(
                `${PROFILER_API}/profile/${student.student_id || student.id}`
              )
              if (profileResponse.data.status === 'success') {
                profile = profileResponse.data.profile
                console.log(`🎯 Profil ML pour ${student.full_name}:`, profile.profile_name)
              }
            } catch (error) {
              console.warn(`⚠️ Profil ML non disponible pour étudiant ${student.student_id}`)
            }

            return {
              student_id: student.student_id || student.id,
              full_name: student.full_name || `${student.first_name} ${student.last_name}`,
              email: student.email,
              average_score: averageScore,
              quizzes_taken: quizzesTaken,
              passed_quizzes: passedQuizzes,
              success_rate: successRate,
              risk_score: riskScore,
              resources_viewed: viewedResourcesCount,
              average_participation: viewedResourcesCount > 0 ? 0.7 : 0.3, // Estimation basée sur les ressources vues
              profile_cluster: profile?.cluster,
              profile_name: profile?.profile_name || 'Non classifié'
            }
          } catch (error) {
            console.warn(`Erreur pour étudiant ${student.student_id}:`, error)
            // Retourner des données par défaut en cas d'erreur
            return {
              student_id: student.student_id || student.id,
              full_name: student.full_name || `${student.first_name} ${student.last_name}`,
              email: student.email,
              average_score: 0,
              quizzes_taken: 0,
              passed_quizzes: 0,
              success_rate: 0,
              risk_score: 100, // Risque élevé si pas de données
              resources_viewed: 0,
              average_participation: 0,
              profile_cluster: null,
              profile_name: 'Non classifié'
            }
          }
        })
      )

      setStudents(studentsWithStats)
      console.log('✅ Statistiques chargées:', studentsWithStats)
      setLoading(false)
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error)
      setLoading(false)
    }
  }

  const getAlerts = () => {
    return students.filter(s => s.risk_score > 50 || s.average_score < 60)
  }

  const getStudentLabel = (student) => {
    return student.full_name || student.email || `Étudiant ${student.student_id}`
  }

  const performanceData = {
    labels: students.map(s => getStudentLabel(s)),
    datasets: [{
      label: 'Score moyen',
      data: students.map(s => s.average_score),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  }

  const engagementData = {
    labels: students.map(s => getStudentLabel(s)),
    datasets: [{
      label: 'Taux de participation (%)',
      data: students.map(s => s.average_participation * 100),
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  }

  const riskDistribution = {
    labels: ['Faible risque', 'Risque moyen', 'Risque élevé'],
    datasets: [{
      data: [
        students.filter(s => s.risk_score < 30).length,
        students.filter(s => s.risk_score >= 30 && s.risk_score < 60).length,
        students.filter(s => s.risk_score >= 60).length
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(255, 99, 132, 0.5)'
      ]
    }]
  }

  const profileDistribution = {
    labels: ['High Performer', 'Average Learner', 'At Risk'],
    datasets: [{
      data: [
        students.filter(s => s.profile_cluster === 0).length,
        students.filter(s => s.profile_cluster === 1).length,
        students.filter(s => s.profile_cluster === 2).length
      ],
      backgroundColor: [
        'rgba(52, 211, 153, 0.7)',  // Vert (High Performer)
        'rgba(96, 165, 250, 0.7)',   // Bleu (Average Learner)
        'rgba(248, 113, 113, 0.7)'   // Rouge (At Risk)
      ],
      borderColor: [
        'rgba(52, 211, 153, 1)',
        'rgba(96, 165, 250, 1)',
        'rgba(248, 113, 113, 1)'
      ],
      borderWidth: 2
    }]
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Chargement...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Dashboard Administrateur</h1>

      {/* Alertes */}
      {getAlerts().length > 0 && (
        <div style={{ 
          marginBottom: '30px', 
          padding: '20px', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px',
          border: '1px solid #ffc107',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: alertsOpen ? '15px' : '0'
          }}>
            <h2 style={{ 
              margin: '0',
              color: '#856404',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              ⚠️ Alertes ({getAlerts().length})
            </h2>
            <button
              onClick={() => setAlertsOpen(!alertsOpen)}
              style={{
                backgroundColor: 'transparent',
                border: '2px solid #856404',
                borderRadius: '6px',
                color: '#856404',
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#856404'
                e.target.style.color = '#fff3cd'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = '#856404'
              }}
            >
              {alertsOpen ? '▲ Masquer' : '▼ Afficher'}
            </button>
          </div>
          
          {alertsOpen && (
            <ul style={{
              margin: '0',
              paddingLeft: '25px',
              listStylePosition: 'inside',
              listStyleType: 'disc'
            }}>
              {getAlerts().map(s => (
                <li key={s.student_id} style={{
                  padding: '8px 0',
                  color: '#856404',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  <strong>{getStudentLabel(s)}</strong>: Score {s.average_score.toFixed(1)}, 
                  Risque {s.risk_score.toFixed(1)}%
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Graphiques */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Performance des étudiants</h3>
          <Bar data={performanceData} options={{ responsive: true }} />
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Engagement des étudiants</h3>
          <Line data={engagementData} options={{ responsive: true }} />
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Distribution des risques</h3>
          <Pie data={riskDistribution} options={{ responsive: true }} />
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>📊 Clustering ML - Profils Étudiants</h3>
          <Pie data={profileDistribution} options={{ 
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || ''
                    const value = context.parsed || 0
                    const total = context.dataset.data.reduce((a, b) => a + b, 0)
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                    return `${label}: ${value} étudiants (${percentage}%)`
                  }
                }
              }
            }
          }} />
        </div>
      </div>

      {/* Statistiques */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, color: '#666' }}>Total Étudiants</h3>
          <p style={{ fontSize: '32px', margin: '10px 0', fontWeight: 'bold' }}>{students.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, color: '#666' }}>Score Moyen</h3>
          <p style={{ fontSize: '32px', margin: '10px 0', fontWeight: 'bold' }}>
            {students.length > 0 ? (students.reduce((sum, s) => sum + s.average_score, 0) / students.length).toFixed(1) : 0}
          </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, color: '#666' }}>À Risque</h3>
          <p style={{ fontSize: '32px', margin: '10px 0', fontWeight: 'bold', color: '#e74c3c' }}>
            {students.filter(s => s.risk_score > 50).length}
          </p>
        </div>
      </div>

      {/* Table détaillée des étudiants */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>📊 Statistiques par Étudiant</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Étudiant</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Quiz Effectués</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Quiz Réussis</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Score Moyen</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Taux de Réussite</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Ressources Vues</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Profil ML</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Risque</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    Aucun étudiant trouvé
                  </td>
                </tr>
              ) : (
                students
                  .sort((a, b) => b.average_score - a.average_score)
                  .map((student, index) => {
                    const getRiskColor = (score) => {
                      if (score < 30) return '#28a745'
                      if (score < 60) return '#ffc107'
                      return '#dc3545'
                    }
                    
                    const getScoreColor = (score) => {
                      if (score >= 80) return '#28a745'
                      if (score >= 60) return '#ffc107'
                      return '#dc3545'
                    }

                    const getProfileColor = (profileName) => {
                      if (profileName === 'High Performer') return '#34d399'
                      if (profileName === 'Average Learner') return '#60a5fa'
                      if (profileName === 'At Risk') return '#f87171'
                      return '#9ca3af'
                    }

                    const getProfileIcon = (profileName) => {
                      if (profileName === 'High Performer') return '🏆'
                      if (profileName === 'Average Learner') return '📚'
                      if (profileName === 'At Risk') return '⚠️'
                      return '❓'
                    }

                    return (
                      <tr 
                        key={student.student_id}
                        style={{ 
                          borderBottom: '1px solid #dee2e6',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa'
                        }}
                      >
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {student.full_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {student.email}
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: '#e9ecef',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            {student.quizzes_taken}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            {student.passed_quizzes}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: getScoreColor(student.average_score),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            {student.average_score.toFixed(1)}%
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: getScoreColor(student.success_rate),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            {student.success_rate.toFixed(0)}%
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: '#cce5ff',
                            color: '#004085',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            {student.resources_viewed}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: getProfileColor(student.profile_name),
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {getProfileIcon(student.profile_name)} {student.profile_name}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: getRiskColor(student.risk_score),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            {student.risk_score.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Légende */}
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Légende:</strong>
          <div style={{ display: 'flex', gap: '20px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span>🟢 Faible risque (&lt;30%)</span>
            <span>🟡 Risque moyen (30-60%)</span>
            <span>🔴 Risque élevé (&gt;60%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

