import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const API_BASE = 'http://localhost:3008'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalResources: 0,
    viewedResources: 0,
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    studentSubjects: []
  })
  const [recentResources, setRecentResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      // Récupérer les données de l'étudiant connecté
      const studentDataStr = localStorage.getItem('currentStudent')
      let studentSubjects = []
      let studentId = null
      
      if (studentDataStr) {
        const studentData = JSON.parse(studentDataStr)
        studentSubjects = studentData.subjects || []
        studentId = studentData.student_id || studentData.id
      }

      console.log('🎓 Student ID:', studentId)
      console.log('🎓 Matières de l\'étudiant:', studentSubjects)

      // Charger les ressources avec le student_id pour avoir is_viewed personnalisé
      const resourcesResponse = await axios.get(`${API_BASE}/resources`, {
        params: { student_id: studentId }
      })
      const allResources = resourcesResponse.data

      console.log('📚 Total ressources disponibles:', allResources.length)

      // Si l'étudiant n'a pas de matières définies, afficher TOUTES les ressources
      let myResources = allResources
      
      if (studentSubjects.length > 0) {
        // Filtrer les ressources selon les matières de l'étudiant
        myResources = allResources.filter(resource => 
          studentSubjects.some(subject => 
            subject.toLowerCase().includes(resource.subject_id?.toLowerCase()) ||
            resource.subject_id?.toLowerCase().includes(subject.toLowerCase())
          )
        )
        console.log('✅ Ressources filtrées pour mes matières:', myResources.length)
      } else {
        console.log('ℹ️ Aucune matière définie, affichage de toutes les ressources')
      }

      // Compter les ressources consultées (celles marquées comme vues par CET étudiant)
      const viewedResources = myResources.filter(r => r.is_viewed === true)
      console.log('✓ Ressources consultées par cet étudiant:', viewedResources.length)

      // Récupérer les scores de quiz pour CET étudiant
      let quizStats = { total: 0, completed: 0, average: 0 }
      try {
        const quizResponse = await axios.get(`${API_BASE}/student-quiz-scores/${studentId}`)
        const quizScores = quizResponse.data || []
        
        // Récupérer tous les quiz pour compter ceux disponibles pour les ressources de l'étudiant
        let totalQuizzes = 0
        try {
          const allQuizzesResponse = await axios.get(`${API_BASE}/quizzes`)
          const allQuizzes = allQuizzesResponse.data || []
          
          // Compter les quiz qui correspondent aux ressources de l'étudiant
          const myResourceIds = myResources.map(r => r.resource_id)
          totalQuizzes = allQuizzes.filter(quiz => 
            myResourceIds.includes(quiz.resource_id)
          ).length
        } catch (error) {
          console.log('ℹ️ Impossible de récupérer la liste des quiz')
        }
        
        quizStats = {
          total: totalQuizzes,
          completed: quizScores.length,
          average: quizScores.length > 0 
            ? Math.round(quizScores.reduce((sum, q) => sum + (q.score || 0), 0) / quizScores.length)
            : 0
        }
        console.log('📝 Quiz stats pour cet étudiant:', quizStats)
      } catch (error) {
        console.log('ℹ️ Pas de données quiz disponibles')
      }

      // Calculer les stats
      const newStats = {
        totalResources: myResources.length,
        viewedResources: viewedResources.length,
        totalQuizzes: quizStats.total,
        completedQuizzes: quizStats.completed,
        averageScore: quizStats.average,
        studentSubjects: studentSubjects
      }

      console.log('📊 Stats calculées pour cet étudiant:', newStats)

      setStats(newStats)
      setRecentResources(myResources.slice(0, 5))
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '40px', marginBottom: '20px' }}>📊</div>
        <p style={{ fontSize: '18px', color: '#666' }}>Chargement du tableau de bord...</p>
      </div>
    )
  }

  const progressPercentage = stats.totalResources > 0 
    ? Math.round((stats.viewedResources / stats.totalResources) * 100) 
    : 0

  const progressData = {
    labels: ['✓ Consultées', 'En attente'],
    datasets: [{
      data: [stats.viewedResources, stats.totalResources - stats.viewedResources],
      backgroundColor: [
        '#667eea',
        '#e2e8f0'
      ],
      borderWidth: 0
    }]
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333' }}>📊 Tableau de Bord</h1>
        {stats.studentSubjects.length > 0 && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            Mes matières: <strong>{stats.studentSubjects.join(', ')}</strong>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px', opacity: 0.9 }}>📚 Ressources</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>
            {stats.totalResources}
          </p>
          <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>Total disponible</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px', opacity: 0.9 }}>✓ Consultées</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>
            {stats.viewedResources}
          </p>
          <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            Ressources terminées
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px', opacity: 0.9 }}>📈 Progression</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>
            {progressPercentage}%
          </p>
          <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {stats.viewedResources} / {stats.totalResources} consultées
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px', opacity: 0.9 }}>📝 Quiz</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>
            {stats.completedQuizzes}/{stats.totalQuizzes}
          </p>
          <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {stats.completedQuizzes > 0 ? `Moyenne: ${stats.averageScore}%` : 'Pas encore de résultats'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '20px' }}>📊 Progression des Ressources</h2>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <Doughnut data={progressData} options={{
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    padding: 15,
                    font: {
                      size: 14
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '20px' }}>📌 Statistiques</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #667eea'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Taux de complétion</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{progressPercentage}%</div>
            </div>
            <div style={{
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #43e97b'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Ressources restantes</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#43e97b' }}>
                {stats.totalResources - stats.viewedResources}
              </div>
            </div>
            <div style={{
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #4facfe'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Matières suivies</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4facfe' }}>
                {stats.studentSubjects.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {recentResources.length > 0 && (
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '20px' }}>📚 Ressources Récentes</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {recentResources.map((resource, idx) => (
              <div key={idx} style={{
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: '4px solid #667eea',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: '5px', color: '#333' }}>{resource.title}</h4>
                  <p style={{ color: '#666', fontSize: '13px', marginBottom: '5px' }}>
                    {resource.description || 'Pas de description'}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                    <span style={{ color: '#667eea', fontWeight: '600' }}>
                      📂 {resource.subject_id}
                    </span>
                    <span style={{ color: '#999' }}>•</span>
                    <span style={{ color: resource.content ? '#43e97b' : '#f5576c' }}>
                      {resource.content ? '✓ Disponible' : '○ En préparation'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalResources === 0 && (
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📚</div>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>Aucune ressource disponible</h3>
          <p style={{ color: '#666' }}>
            Les ressources pour vos matières seront bientôt disponibles.
          </p>
        </div>
      )}
    </div>
  )
}

export default Dashboard

