import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:3008'

function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [certifications, setCertifications] = useState([])
  const [students, setStudents] = useState([])
  const [resources, setResources] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('recommendations') // recommendations, certifications

  // Form states
  const [showRecommendationForm, setShowRecommendationForm] = useState(false)
  const [showCertificationForm, setShowCertificationForm] = useState(false)
  const [recommendationType, setRecommendationType] = useState('course') // course, quiz, certification
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedResource, setSelectedResource] = useState('')
  const [selectedQuiz, setSelectedQuiz] = useState('')
  const [recommendationNote, setRecommendationNote] = useState('')
  
  // Certification form states
  const [certifTitle, setCertifTitle] = useState('')
  const [certifDescription, setCertifDescription] = useState('')
  const [certifLevel, setCertifLevel] = useState('Tous niveaux')
  const [certifUrl, setCertifUrl] = useState('')
  const [certifCourseraUrl, setCertifCourseraUrl] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // Load students
      const studentsRes = await axios.get(`${API_BASE}/users`, { headers })
      const studentsList = studentsRes.data.filter(u => u.role === 'student')
      setStudents(studentsList)

      // Load resources
      const resourcesRes = await axios.get(`${API_BASE}/resources`, { headers })
      setResources(resourcesRes.data)

      // Load quizzes from all resources
      try {
        let allQuizzes = []
        for (const resource of resourcesRes.data) {
          try {
            const quizzesRes = await axios.get(`${API_BASE}/quizzes/resource/${resource.resource_id}`, { headers })
            allQuizzes = [...allQuizzes, ...quizzesRes.data]
          } catch (err) {
            console.log(`No quizzes for resource ${resource.resource_id}`)
          }
        }
        setQuizzes(allQuizzes)
        console.log(`✅ Chargé ${allQuizzes.length} quiz au total`)
      } catch (error) {
        console.log('Erreur lors du chargement des quiz:', error)
      }

      // Load recommendations from localStorage and sync to API
      const savedRecs = localStorage.getItem('teacher_recommendations')
      if (savedRecs) {
        const recsData = JSON.parse(savedRecs)
        setRecommendations(recsData)
        
        // Synchroniser avec l'API
        try {
          await axios.post(`${API_BASE}/teacher/recommendations`, recsData)
          console.log('✅ Recommandations synchronisées avec l\'API')
        } catch (error) {
          console.error('Erreur lors de la synchronisation des recommandations:', error)
        }
      }

      // Load certifications from localStorage and sync to API
      const savedCertifs = localStorage.getItem('teacher_certifications')
      if (savedCertifs) {
        const certifsData = JSON.parse(savedCertifs)
        setCertifications(certifsData)
        
        // Synchroniser avec l'API
        try {
          await axios.post(`${API_BASE}/teacher/certifications`, certifsData)
          console.log('✅ Certifications synchronisées avec l\'API')
        } catch (error) {
          console.error('Erreur lors de la synchronisation des certifications:', error)
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const handleCreateRecommendation = async () => {
    if (!selectedStudent) {
      alert('Veuillez sélectionner un étudiant ou "Tous les étudiants"')
      return
    }

    let newRecommendation = {
      id: Date.now(),
      student_id: selectedStudent,
      student_name: selectedStudent === 'all' 
        ? 'Tous les étudiants' 
        : students.find(s => s.student_id === parseInt(selectedStudent))?.full_name,
      type: recommendationType,
      note: recommendationNote,
      created_at: new Date().toISOString(),
      for_all_students: selectedStudent === 'all'
    }

    if (recommendationType === 'course' && selectedResource) {
      const resource = resources.find(r => String(r.resource_id) === String(selectedResource))
      if (!resource) {
        console.error('Ressource non trouvée. ID recherché:', selectedResource)
        console.error('Ressources disponibles:', resources.map(r => r.resource_id))
        alert('Ressource introuvable. Veuillez réessayer.')
        return
      }
      newRecommendation.resource = resource
      newRecommendation.title = resource.title
    } else if (recommendationType === 'quiz' && selectedQuiz) {
      const quiz = quizzes.find(q => String(q.quiz_id) === String(selectedQuiz))
      if (!quiz) {
        console.error('Quiz non trouvé. ID recherché:', selectedQuiz)
        console.error('Quiz disponibles:', quizzes.map(q => q.quiz_id))
        alert('Quiz introuvable. Veuillez réessayer.')
        return
      }
      newRecommendation.quiz = quiz
      newRecommendation.title = quiz?.title || 'Quiz'
    } else if (recommendationType === 'certification') {
      newRecommendation.title = 'Certification recommandée'
    }

    const updatedRecs = [...recommendations, newRecommendation]
    setRecommendations(updatedRecs)
    localStorage.setItem('teacher_recommendations', JSON.stringify(updatedRecs))

    // Sauvegarder dans l'API pour partage avec le portail étudiant
    try {
      console.log('📤 Envoi de', updatedRecs.length, 'recommandations à l\'API')
      console.log('📦 Données:', updatedRecs)
      const response = await axios.post(`${API_BASE}/teacher/recommendations`, updatedRecs)
      console.log('✅ Réponse API:', response.data)
      console.log('✅ Recommandations sauvegardées dans l\'API')
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde dans l\'API:', error)
      console.error('❌ Détails:', error.response?.data)
    }

    // Reset form
    setShowRecommendationForm(false)
    setSelectedStudent('')
    setSelectedResource('')
    setSelectedQuiz('')
    setRecommendationNote('')
    alert('Recommandation créée avec succès !')
  }

  const handleCreateCertification = async () => {
    if (!certifTitle || !certifDescription) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const newCertification = {
      id: Date.now(),
      title: certifTitle,
      description: certifDescription,
      level: certifLevel,
      url: certifUrl,
      courseraUrl: certifCourseraUrl,
      enrolled: 0,
      created_at: new Date().toISOString()
    }

    const updatedCertifs = [...certifications, newCertification]
    setCertifications(updatedCertifs)
    localStorage.setItem('teacher_certifications', JSON.stringify(updatedCertifs))

    // Sauvegarder dans l'API pour partage avec le portail étudiant
    try {
      console.log('📤 Envoi de', updatedCertifs.length, 'certifications à l\'API')
      const response = await axios.post(`${API_BASE}/teacher/certifications`, updatedCertifs)
      console.log('✅ Réponse API:', response.data)
      console.log('✅ Certifications sauvegardées dans l\'API')
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde dans l\'API:', error)
      console.error('❌ Détails:', error.response?.data)
    }

    // Reset form
    setShowCertificationForm(false)
    setCertifTitle('')
    setCertifDescription('')
    setCertifLevel('Tous niveaux')
    setCertifUrl('')
    setCertifCourseraUrl('')
    alert('Certification créée avec succès !')
  }

  const handleDeleteRecommendation = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette recommandation ?')) {
      const updatedRecs = recommendations.filter(r => r.id !== id)
      setRecommendations(updatedRecs)
      localStorage.setItem('teacher_recommendations', JSON.stringify(updatedRecs))
      
      // Sauvegarder dans l'API
      try {
        await axios.post(`${API_BASE}/teacher/recommendations`, updatedRecs)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde dans l\'API:', error)
      }
    }
  }

  const handleDeleteCertification = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette certification ?')) {
      const updatedCertifs = certifications.filter(c => c.id !== id)
      setCertifications(updatedCertifs)
      localStorage.setItem('teacher_certifications', JSON.stringify(updatedCertifs))
      
      // Sauvegarder dans l'API
      try {
        await axios.post(`${API_BASE}/teacher/certifications`, updatedCertifs)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde dans l\'API:', error)
      }
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>Chargement...</div>
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px' 
      }}>
        <h1 style={{ fontSize: '28px', margin: 0 }}>🎯 Gestion des Recommandations & Certifications</h1>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <button
          onClick={() => setActiveTab('recommendations')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'recommendations' ? '#3498db' : 'transparent',
            color: activeTab === 'recommendations' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'recommendations' ? '3px solid #2980b9' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'recommendations' ? '600' : '400',
            transition: 'all 0.3s'
          }}
        >
          📝 Recommandations ({recommendations.length})
        </button>
        <button
          onClick={() => setActiveTab('certifications')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'certifications' ? '#3498db' : 'transparent',
            color: activeTab === 'certifications' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'certifications' ? '3px solid #2980b9' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'certifications' ? '600' : '400',
            transition: 'all 0.3s'
          }}
        >
          🎓 Certifications ({certifications.length})
        </button>
      </div>

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setShowRecommendationForm(!showRecommendationForm)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {showRecommendationForm ? '✕ Annuler' : '+ Nouvelle Recommandation'}
            </button>
          </div>

          {/* Recommendation Form */}
          {showRecommendationForm && (
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '30px'
            }}>
              <h3 style={{ marginTop: 0 }}>Créer une Recommandation</h3>
              
              {/* Student Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Étudiant *
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Sélectionner un étudiant</option>
                  <option value="all" style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8' }}>👥 Tous les étudiants</option>
                  {students.map(student => (
                    <option key={student.id} value={student.student_id}>
                      {student.full_name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Type de Recommandation *
                </label>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="course"
                      checked={recommendationType === 'course'}
                      onChange={(e) => setRecommendationType(e.target.value)}
                      style={{ marginRight: '8px' }}
                    />
                    📚 Cours
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="quiz"
                      checked={recommendationType === 'quiz'}
                      onChange={(e) => setRecommendationType(e.target.value)}
                      style={{ marginRight: '8px' }}
                    />
                    📋 Quiz
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="certification"
                      checked={recommendationType === 'certification'}
                      onChange={(e) => setRecommendationType(e.target.value)}
                      style={{ marginRight: '8px' }}
                    />
                    🎓 Certification
                  </label>
                </div>
              </div>

              {/* Resource Selection (if course) */}
              {recommendationType === 'course' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Cours *
                  </label>
                  <select
                    value={selectedResource}
                    onChange={(e) => setSelectedResource(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Sélectionner un cours</option>
                    {resources.map(resource => (
                      <option key={resource.resource_id} value={resource.resource_id}>
                        {resource.title} ({resource.subject_id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quiz Selection (if quiz) */}
              {recommendationType === 'quiz' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Quiz *
                  </label>
                  <select
                    value={selectedQuiz}
                    onChange={(e) => setSelectedQuiz(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Sélectionner un quiz</option>
                    {quizzes.length === 0 ? (
                      <option disabled>Aucun quiz disponible</option>
                    ) : (
                      quizzes.map(quiz => (
                        <option key={quiz.quiz_id} value={quiz.quiz_id}>
                          {quiz.title || `Quiz #${quiz.quiz_id}`} - Resource #{quiz.resource_id}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {/* Note */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Note / Message
                </label>
                <textarea
                  value={recommendationNote}
                  onChange={(e) => setRecommendationNote(e.target.value)}
                  placeholder="Ajoutez une note personnalisée pour l'étudiant..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                onClick={handleCreateRecommendation}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                ✅ Créer la Recommandation
              </button>
            </div>
          )}

          {/* Recommendations List */}
          <div>
            <h3>Liste des Recommandations</h3>
            {recommendations.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: '8px',
                color: '#666'
              }}>
                Aucune recommandation créée. Cliquez sur "+ Nouvelle Recommandation" pour commencer.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {recommendations.map(rec => (
                  <div
                    key={rec.id}
                    style={{
                      backgroundColor: 'white',
                      padding: '20px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666', 
                        marginBottom: '8px',
                        display: 'flex',
                        gap: '15px'
                      }}>
                        <span>👤 {rec.student_name}</span>
                        <span>
                          {rec.type === 'course' && '📚 Cours'}
                          {rec.type === 'quiz' && '📋 Quiz'}
                          {rec.type === 'certification' && '🎓 Certification'}
                        </span>
                        <span>{new Date(rec.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                        {rec.title || 'Recommandation'}
                      </h4>
                      {rec.note && (
                        <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                          💬 {rec.note}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteRecommendation(rec.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setShowCertificationForm(!showCertificationForm)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#9b59b6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {showCertificationForm ? '✕ Annuler' : '+ Nouvelle Certification'}
            </button>
          </div>

          {/* Certification Form */}
          {showCertificationForm && (
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '30px'
            }}>
              <h3 style={{ marginTop: 0 }}>Créer une Certification</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Titre *
                </label>
                <input
                  type="text"
                  value={certifTitle}
                  onChange={(e) => setCertifTitle(e.target.value)}
                  placeholder="Ex: Expert Java et Architectures Modernes"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Description *
                </label>
                <textarea
                  value={certifDescription}
                  onChange={(e) => setCertifDescription(e.target.value)}
                  placeholder="Description détaillée de la certification..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Niveau
                </label>
                <select
                  value={certifLevel}
                  onChange={(e) => setCertifLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option>Débutant</option>
                  <option>Intermédiaire</option>
                  <option>Avancé</option>
                  <option>Tous niveaux</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  URL Coursera
                </label>
                <input
                  type="url"
                  value={certifCourseraUrl}
                  onChange={(e) => setCertifCourseraUrl(e.target.value)}
                  placeholder="https://www.coursera.org/..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  URL Externe (optionnel)
                </label>
                <input
                  type="url"
                  value={certifUrl}
                  onChange={(e) => setCertifUrl(e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>

              <button
                onClick={handleCreateCertification}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#9b59b6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                ✅ Créer la Certification
              </button>
            </div>
          )}

          {/* Certifications List */}
          <div>
            <h3>Liste des Certifications</h3>
            {certifications.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: '8px',
                color: '#666'
              }}>
                Aucune certification créée. Cliquez sur "+ Nouvelle Certification" pour commencer.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {certifications.map(cert => (
                  <div
                    key={cert.id}
                    style={{
                      backgroundColor: 'white',
                      padding: '20px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: '#f0f4ff',
                          color: '#667eea',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {cert.level}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteCertification(cert.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                    
                    <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                      {cert.title}
                    </h4>
                    
                    <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                      {cert.description}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {cert.courseraUrl && (
                        <a
                          href={cert.courseraUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          🎓 Voir sur Coursera
                        </a>
                      )}
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#95a5a6',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          🔗 Lien externe
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Recommendations
