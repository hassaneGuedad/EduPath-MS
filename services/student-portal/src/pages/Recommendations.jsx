import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE = 'http://localhost:3008'

function Recommendations() {
  const [resources, setResources] = useState([])
  const [certifications, setCertifications] = useState([])
  const [popularCourses, setPopularCourses] = useState([])
  const [studentSubjects, setStudentSubjects] = useState([])
  const [teacherRecommendations, setTeacherRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [stats, setStats] = useState({ completed: 0, badges: 2, level: 0.81 })
  const navigate = useNavigate()

  const categories = ['Tous', 'IA', 'Dev Web', 'Data', 'Réseaux', 'Cloud', 'Sécurité']

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      // Récupérer les matières de l'étudiant
      const studentDataStr = localStorage.getItem('currentStudent')
      if (studentDataStr) {
        const studentData = JSON.parse(studentDataStr)
        if (studentData && studentData.subjects) {
          setStudentSubjects(studentData.subjects)
          
          // Charger toutes les ressources
          const response = await axios.get(`${API_BASE}/resources`)
          const allResources = response.data
          
          // Filtrer les ressources recommandées (qui correspondent aux matières de l'étudiant)
          const recommended = allResources.filter(resource => 
            studentData.subjects.some(subject => 
              subject.toLowerCase().includes(resource.subject_id?.toLowerCase()) ||
              resource.subject_id?.toLowerCase().includes(subject.toLowerCase())
            )
          ).slice(0, 4) // Limiter à 4 recommandations
          
          setResources(recommended)
          
          // Charger les recommandations du professeur depuis l'API
          try {
            console.log('🔍 Chargement des recommandations depuis l\'API...')
            const recsResponse = await axios.get(`${API_BASE}/teacher/recommendations`)
            console.log('📥 Réponse API:', recsResponse.data)
            console.log('📊 Nombre total de recommandations:', recsResponse.data?.length || 0)
            
            if (recsResponse.data && recsResponse.data.length > 0) {
              // Filtrer pour cet étudiant et les recommandations "pour tous"
              const myRecommendations = recsResponse.data.filter(rec => {
                console.log('🔎 Vérification rec:', rec.id, 'for_all:', rec.for_all_students)
                return rec.for_all_students === true || 
                  rec.student_id === studentData.student_id || 
                  rec.student_id === 'all'
              })
              setTeacherRecommendations(myRecommendations)
              console.log(`✅ ${myRecommendations.length} recommandations du professeur chargées depuis l'API`)
            } else {
              console.log('⚠️ Aucune recommandation trouvée dans l\'API')
              setTeacherRecommendations([])
            }
          } catch (error) {
            console.error('❌ Erreur lors du chargement des recommandations depuis l\'API:', error)
            console.error('❌ Détails:', error.response?.data)
          }

          // Charger les certifications depuis l'API
          try {
            const certifsResponse = await axios.get(`${API_BASE}/teacher/certifications`)
            if (certifsResponse.data && certifsResponse.data.length > 0) {
              setCertifications(certifsResponse.data)
              console.log(`✅ ${certifsResponse.data.length} certifications chargées depuis l'API`)
            } else {
              // Fallback: certifications par défaut si aucune n'a été créée
              setCertifications([])
            }
          } catch (error) {
            console.error('Erreur lors du chargement des certifications depuis l\'API:', error)
            // Fallback en cas d'erreur
            setCertifications([])
          }
          
          // Cours populaires (les 3 premiers de toutes les ressources)
          setPopularCourses(allResources.slice(0, 3))
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const getFilteredResources = () => {
    if (activeFilter === 'Tous') return resources
    return resources.filter(r => r.subject_id?.toLowerCase().includes(activeFilter.toLowerCase()))
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '20px' }}>📚</div>
        <p style={{ fontSize: '18px', color: '#666' }}>Chargement des recommandations...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* En-tête avec sparkle */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '40px', 
        borderRadius: '16px', 
        marginBottom: '30px',
        color: 'white'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: '700' }}>✨ Personnalisé pour vous</h1>
        <p style={{ margin: '0 0 20px 0', fontSize: '18px', opacity: 0.9 }}>
          Recommandations personnalisées
        </p>
        <p style={{ margin: '0 0 25px 0', fontSize: '14px', opacity: 0.8 }}>
          Découvrez des cours et des certifications adaptés à votre profil et à vos intérêts.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => loadRecommendations()}
            style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            🔄 Actualiser
          </button>
          <button style={{
            padding: '12px 24px',
            backgroundColor: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Voir les recommandations
          </button>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeFilter === cat ? '#667eea' : 'white',
              color: activeFilter === cat ? 'white' : '#666',
              border: '2px solid ' + (activeFilter === cat ? '#667eea' : '#e0e0e0'),
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: activeFilter === cat ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
        {/* Colonne principale */}
        <div>
          {/* Recommandations du professeur */}
          {teacherRecommendations.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🎯 Recommandations de votre professeur
              </h2>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                Cours et quiz recommandés spécialement pour vous
              </p>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                {teacherRecommendations.map((rec) => (
                  <div 
                    key={rec.id}
                    style={{ 
                      backgroundColor: 'white', 
                      padding: '24px', 
                      borderRadius: '12px', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '2px solid #667eea',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          backgroundColor: '#f0f4ff',
                          color: '#667eea',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {rec.type === 'course' && '📚 Cours'}
                          {rec.type === 'quiz' && '📋 Quiz'}
                          {rec.type === 'certification' && '🎓 Certification'}
                        </span>
                        {rec.for_all_students && (
                          <span style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            backgroundColor: '#e8f5e9',
                            color: '#4caf50',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            👥 Pour tous
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: '#999' }}>
                        {new Date(rec.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '20px', fontWeight: '700' }}>
                      {rec.title || 'Recommandation'}
                    </h3>
                    
                    {rec.note && (
                      <div style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '12px', 
                        borderRadius: '8px',
                        marginBottom: '16px',
                        borderLeft: '3px solid #667eea'
                      }}>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                          💬 {rec.note}
                        </p>
                      </div>
                    )}
                    
                    {rec.resource && (
                      <button
                        onClick={() => rec.resource.content ? navigate(`/course/${rec.resource.resource_id}`) : window.open(rec.resource.url, '_blank')}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                      >
                        Commencer →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommandations basées sur profil */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#333' }}>Recommandations automatiques</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>Cours adaptés à vos matières</p>
            
            {resources.length === 0 ? (
              <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>📭</div>
                <p style={{ color: '#666', fontSize: '18px' }}>Aucune recommandation disponible</p>
              </div>
            ) : (
              <>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <strong>Basé sur vos intérêts</strong> - {getFilteredResources().length} recommandations
                </div>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {getFilteredResources().map((resource) => (
                    <div 
                      key={resource.id} 
                      onClick={() => resource.content ? navigate(`/course/${resource.resource_id}`) : window.open(resource.url, '_blank')}
                      style={{ 
                        backgroundColor: 'white', 
                        padding: '24px', 
                        borderRadius: '12px', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          backgroundColor: '#f0f4ff',
                          color: '#667eea',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          Tous niveaux
                        </span>
                      </div>
                      
                      <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '20px', fontWeight: '700' }}>
                        {resource.title}
                      </h3>
                      
                      {resource.description && (
                        <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                          {resource.description.length > 200 ? resource.description.substring(0, 200) + '...' : resource.description}
                        </p>
                      )}
                      
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          backgroundColor: '#e8f5e9',
                          color: '#2e7d32',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {resource.subject_id}
                        </span>
                        <span style={{ fontSize: '13px', color: '#999' }}>
                          étudiants
                        </span>
                      </div>
                      
                      <button style={{
                        padding: '10px 20px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        width: '100%'
                      }}>
                        Voir le cours
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Certifications recommandées */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#333' }}>Certifications recommandées</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>{certifications.length} certifications</p>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {certifications.map((cert) => (
                <div 
                  key={cert.id}
                  style={{ 
                    backgroundColor: 'white', 
                    padding: '24px', 
                    borderRadius: '12px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#f0f4ff',
                      color: '#667eea',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {cert.level}
                    </span>
                    <span style={{ marginLeft: '10px', fontSize: '12px', color: '#999' }}>cours</span>
                  </div>
                  
                  <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '18px', fontWeight: '700' }}>
                    {cert.title}
                  </h3>
                  
                  <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                    {cert.description}
                  </p>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', color: '#999' }}>
                      {cert.enrolled} étudiants inscrits
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => cert.courseraUrl && window.open(cert.courseraUrl, '_blank')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'white',
                      color: '#667eea',
                      border: '2px solid #667eea',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#667eea'
                      e.target.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white'
                      e.target.style.color = '#667eea'
                    }}
                  >
                    🎓 Voir sur Coursera
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cours populaires */}
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#333' }}>Cours populaires</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>{popularCourses.length} cours</p>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {popularCourses.map((course) => (
                <div 
                  key={course.id}
                  onClick={() => course.content ? navigate(`/course/${course.resource_id}`) : window.open(course.url, '_blank')}
                  style={{ 
                    backgroundColor: 'white', 
                    padding: '24px', 
                    borderRadius: '12px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#f0f4ff',
                      color: '#667eea',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Tous niveaux
                    </span>
                  </div>
                  
                  <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '18px', fontWeight: '700' }}>
                    {course.title}
                  </h3>
                  
                  {course.description && (
                    <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                      {course.description.length > 150 ? course.description.substring(0, 150) + '...' : course.description}
                    </p>
                  )}
                  
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      backgroundColor: '#fff3e0',
                      color: '#e65100',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginRight: '8px'
                    }}>
                      {course.subject_id}
                    </span>
                    <span style={{ fontSize: '13px', color: '#999' }}>
                      étudiants
                    </span>
                  </div>
                  
                  <button style={{
                    padding: '10px 20px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    width: '100%'
                  }}>
                    Voir le cours
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar avec statistiques */}
        <div>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            position: 'sticky',
            top: '20px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700' }}>📊 Vos statistiques</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Cours terminés</span>
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>{stats.completed}</span>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Badges</span>
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#ffa726' }}>{stats.badges}</span>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Niveau</span>
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#66bb6a' }}>{stats.level}/10</span>
              </div>
              <div style={{ 
                height: '8px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${stats.level * 10}%`,
                  backgroundColor: '#66bb6a',
                  transition: 'width 0.5s'
                }} />
              </div>
            </div>
            
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <p style={{ margin: '0', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                <strong>Conseil du jour :</strong> Complétez au moins un cours par semaine pour progresser rapidement ! 🚀
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Recommendations

