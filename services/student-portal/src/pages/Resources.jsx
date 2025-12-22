import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE = 'http://localhost:3008'

const RESOURCE_TYPES = {
  'pdf': '📄 Document PDF',
  'video': '🎥 Vidéo',
  'podcast': '🎙️ Podcast',
  'ebook': '📖 E-Book',
  'link': '🔗 Lien Externe',
  'presentation': '📊 Présentation',
  'exercice': '📝 Exercice'
}

function ResourcesStudent() {
  const [resources, setResources] = useState([])
  const [studentSubjects, setStudentSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedResource, setSelectedResource] = useState(null)
  const [expandedResource, setExpandedResource] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [currentPage, setCurrentPage] = useState({})

  // Quiz state
  const [quizzes, setQuizzes] = useState({})
  const [quizScores, setQuizScores] = useState({}) // Scores déjà obtenus par l'étudiant
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [studentAnswers, setStudentAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  const [submittingQuiz, setSubmittingQuiz] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadStudentData()
  }, [])

  const loadStudentData = async () => {
    try {
      // Récupérer les données de l'étudiant depuis le localStorage
      const studentDataStr = localStorage.getItem('currentStudent')
      console.log('📚 Données étudiant trouvées:', studentDataStr ? 'Oui' : 'Non')
      
      if (studentDataStr) {
        const studentData = JSON.parse(studentDataStr)
        if (studentData && studentData.subjects) {
          console.log('✅ Matières trouvées:', studentData.subjects)
          setStudentSubjects(studentData.subjects)
          // Charger les ressources pour chaque matière
          loadResourcesBySubjects(studentData.subjects)
        } else {
          console.log('⚠️ Pas de matières, chargement de toutes les ressources')
          loadAllResources()
        }
      } else {
        console.log('⚠️ Pas de données étudiant, chargement de toutes les ressources')
        loadAllResources()
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error)
      // Fallback: charger toutes les ressources
      loadAllResources()
    }
  }

  const loadAllResources = async () => {
    try {
      console.log('🔄 Chargement de TOUTES les ressources...')
      
      // Récupérer l'ID de l'étudiant
      const studentDataStr = localStorage.getItem('currentStudent')
      let studentId = null
      if (studentDataStr) {
        const studentData = JSON.parse(studentDataStr)
        studentId = studentData.student_id
      }
      
      // Charger les ressources avec student_id pour avoir is_viewed personnalisé
      const url = studentId ? `${API_BASE}/resources?student_id=${studentId}` : `${API_BASE}/resources`
      const response = await axios.get(url)
      console.log('✅ Ressources chargées:', response.data.length)
      setResources(response.data)
      setLoading(false)
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error)
      setLoading(false)
    }
  }

  const loadResourcesBySubjects = async (subjects) => {
    try {
      let allResources = []
      
      // Charger les ressources pour chaque matière
      for (const subject of subjects) {
        try {
          const response = await axios.get(`${API_BASE}/resources/subject/${subject.subject_id}`)
          allResources = [...allResources, ...response.data]
        } catch (error) {
          console.error(`Erreur pour la matière ${subject.subject_id}:`, error)
        }
      }

      // Charger AUSSI toutes les ressources (y compris celles sans matière assignée)
      try {
        // Récupérer l'ID de l'étudiant
        const studentDataStr = localStorage.getItem('currentStudent')
        let studentId = null
        if (studentDataStr) {
          const studentData = JSON.parse(studentDataStr)
          studentId = studentData.student_id
        }
        
        const url = studentId ? `${API_BASE}/resources?student_id=${studentId}` : `${API_BASE}/resources`
        const allResourcesResponse = await axios.get(url)
        allResources = [...allResources, ...allResourcesResponse.data]
      } catch (error) {
        console.error('Erreur lors du chargement de toutes les ressources:', error)
      }

      // Supprimer les doublons
      const uniqueResources = Array.from(
        new Map(allResources.map(r => [r.resource_id, r])).values()
      )
      
      console.log('✅ Ressources chargées (StudentPortal):', uniqueResources.length, 'ressource(s)')
      setResources(uniqueResources)
      
      // Charger les quiz pour chaque ressource
      for (const resource of uniqueResources) {
        loadQuizzesForResource(resource.resource_id)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('❌ Erreur dans loadResourcesBySubjects:', error)
      // Fallback: charger simplement toutes les ressources
      loadAllResources()
    }
  }

  const handleMarkAsViewed = async (resourceId, resource_id) => {
    try {
      // Récupérer l'ID de l'étudiant
      const studentDataStr = localStorage.getItem('currentStudent')
      if (!studentDataStr) {
        console.warn('⚠️ Pas de données étudiant pour marquer la ressource')
        return
      }
      
      const studentData = JSON.parse(studentDataStr)
      const studentId = studentData.student_id
      const studentEmail = studentData.email || studentData.student_email
      
      // Envoyer la requête avec student_id
      await axios.put(`${API_BASE}/resources/${resource_id}/mark-viewed?is_viewed=true&student_id=${studentId}&student_email=${studentEmail}`)
      
      // Mettre à jour l'état local
      setResources(resources.map(r =>
        r.id === resourceId ? { ...r, is_viewed: true } : r
      ))
      console.log('✅ Ressource marquée comme consultée par l\'étudiant', studentId, ':', resource_id)
    } catch (error) {
      console.error('❌ Erreur lors du marquage:', error.response?.data || error.message)
    }
  }

  const handleOpenCourseContent = (resource) => {
    if (resource.content) {
      // Naviguer vers la page complète du cours
      navigate(`/course/${resource.resource_id}`)
    }
  }

  const handleOpenResource = (resource) => {
    try {
      if (resource.external_url) {
        const url = resource.external_url
        console.log('🔍 Handling external_url:', url)
        
        // Check if it's an uploaded file path (/uploads/...)
        if (url.startsWith('/uploads/')) {
          // Convert relative path to full API URL
          const fullUrl = `${API_BASE}${url}`
          console.log('📥 Downloading uploaded file:', fullUrl)
          
          // Use fetch to download the file
          fetch(fullUrl)
            .then(response => response.blob())
            .then(blob => {
              // Create a temporary URL for the blob
              const blobUrl = window.URL.createObjectURL(blob)
              // Create a link and click it to trigger download
              const link = document.createElement('a')
              link.href = blobUrl
              link.download = resource.title || 'download.pdf'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              window.URL.revokeObjectURL(blobUrl)
              handleMarkAsViewed(resource.id, resource.resource_id)
              console.log('✅ File downloaded successfully')
            })
            .catch(error => {
              console.error('❌ Download error:', error)
              alert('Erreur lors du téléchargement du fichier')
            })
        } else if (url.startsWith('http://') || url.startsWith('https://')) {
          // External URL - open in new tab
          console.log('🔗 Opening external link:', url)
          window.open(url, '_blank')
          handleMarkAsViewed(resource.id, resource.resource_id)
        } else {
          // Treat as relative path and add API_BASE
          const fullUrl = `${API_BASE}${url}`
          console.log('📥 Opening relative path:', fullUrl)
          
          // Try to download
          fetch(fullUrl)
            .then(response => response.blob())
            .then(blob => {
              const blobUrl = window.URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = blobUrl
              link.download = resource.title || 'download'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              window.URL.revokeObjectURL(blobUrl)
              handleMarkAsViewed(resource.id, resource.resource_id)
            })
            .catch(error => {
              console.error('Download error:', error)
              // Fallback to window.open
              window.open(fullUrl, '_blank')
            })
        }
      } else if (resource.file_path) {
        const filePath = resource.file_path
        console.log('🔍 DEBUG - filePath:', filePath)
        
        // Check if it's a local file path (starts with file://, C:/, D:/, etc.)
        if (filePath.startsWith('file://') || /^[A-Z]:/i.test(filePath)) {
          // Local file - use the API endpoint to serve it
          console.log('📄 Downloading via API:', filePath)
          const downloadUrl = `${API_BASE}/resources/${resource.resource_id}/download`
          
          fetch(downloadUrl)
            .then(response => response.blob())
            .then(blob => {
              const blobUrl = window.URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = blobUrl
              link.download = resource.title || 'download'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              window.URL.revokeObjectURL(blobUrl)
              handleMarkAsViewed(resource.id, resource.resource_id)
              console.log('✅ File downloaded successfully')
            })
            .catch(error => {
              console.error('Download error:', error)
              alert('Erreur lors du téléchargement')
            })
        } else {
          // It's a URL or relative path - download normally
          console.log('📥 Path:', filePath)
          fetch(filePath)
            .then(response => response.blob())
            .then(blob => {
              const blobUrl = window.URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = blobUrl
              link.download = resource.title || 'download'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              window.URL.revokeObjectURL(blobUrl)
              handleMarkAsViewed(resource.id, resource.resource_id)
            })
            .catch(error => {
              console.error('Download error:', error)
            })
        }
      }
    } catch (error) {
      console.error('❌ Error:', error)
    }
  }

  const loadQuizzesForResource = async (resourceId) => {
    try {
      const response = await axios.get(`${API_BASE}/quizzes/resource/${resourceId}`)
      const quizzesData = response.data
      
      setQuizzes(prev => ({
        ...prev,
        [resourceId]: quizzesData
      }))

      // Charger les scores existants pour chaque quiz
      const studentData = JSON.parse(localStorage.getItem('currentStudent') || '{}')
      const studentId = studentData.student_id || 1

      for (const quiz of quizzesData) {
        try {
          const scoreResponse = await axios.get(`${API_BASE}/quiz-scores/${quiz.quiz_id}`)
          // Trouver le score de cet étudiant
          const studentScore = scoreResponse.data.find(s => s.student_id === studentId)
          if (studentScore) {
            setQuizScores(prev => ({
              ...prev,
              [quiz.quiz_id]: studentScore
            }))
          }
        } catch (error) {
          // Pas de score = quiz non fait
          console.log(`Pas de score pour quiz ${quiz.quiz_id}`)
        }
      }
    } catch (error) {
      console.error('Erreur chargement quiz:', error)
    }
  }

  const handleStartQuiz = async (quiz) => {
    // Vérifier si l'étudiant a déjà passé ce quiz
    if (quizScores[quiz.quiz_id]) {
      alert('⚠️ Vous avez déjà passé ce quiz. Vous ne pouvez le faire qu\'une seule fois.')
      return
    }

    try {
      const response = await axios.get(`${API_BASE}/quiz-questions/${quiz.quiz_id}`)
      setQuizQuestions(response.data)
      setSelectedQuiz(quiz)
      setStudentAnswers({})
      setQuizResult(null)
      setShowQuizModal(true)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du chargement du quiz')
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setStudentAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitQuiz = async () => {
    try {
      setSubmittingQuiz(true)
      const studentData = JSON.parse(localStorage.getItem('currentStudent') || '{}')
      
      const responses = quizQuestions.map(q => ({
        question_id: q.id,
        answer: studentAnswers[q.id] || ''
      }))

      const payload = {
        quiz_id: selectedQuiz.quiz_id,
        student_id: studentData.student_id || 1,
        student_email: studentData.email || 'student@test.com',
        responses: responses
      }

      console.log('📝 Soumission quiz:', payload)
      const response = await axios.post(`${API_BASE}/quiz-responses`, payload)
      setQuizResult(response.data)
      
      // Sauvegarder le score dans l'état local
      setQuizScores(prev => ({
        ...prev,
        [selectedQuiz.quiz_id]: response.data
      }))
      
      alert(`Quiz terminé! Score: ${response.data.score}% - ${response.data.passed ? '✅ Réussi' : '❌ Échoué'}`)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la soumission: ' + (error.response?.data?.detail || error.message))
    } finally {
      setSubmittingQuiz(false)
    }
  }

  // Filtrage
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || resource.resource_type === selectedType
    const matchesSubject = selectedSubject === 'all' || resource.subject_id === selectedSubject

    return matchesSearch && matchesType && matchesSubject
  })

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement des ressources...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>📚 Mes Ressources Pédagogiques</h1>

      {/* Mes matières */}
      {studentSubjects.length > 0 && (
        <div style={{
          backgroundColor: '#e8f4f8',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #b3d9e8'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '10px' }}>📖 Mes matières:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {studentSubjects.map(subject => (
              <span
                key={subject.subject_id}
                style={{
                  padding: '8px 15px',
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  border: '1px solid #007bff',
                  color: '#007bff',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {subject.subject_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
            🔍 Rechercher:
          </label>
          <input
            type="text"
            placeholder="Titre, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
            📁 Type:
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          >
            <option value="all">Tous les types</option>
            {Object.entries(RESOURCE_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
            📚 Matière:
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          >
            <option value="all">Toutes mes matières</option>
            {studentSubjects.map(subject => (
              <option key={subject.subject_id} value={subject.subject_id}>
                {subject.subject_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Résultats */}
      <div style={{ marginBottom: '15px', color: '#666' }}>
        {filteredResources.length} ressource(s) disponible(s)
      </div>

      {/* Liste des ressources */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {filteredResources.map(resource => (
          <div
            key={resource.id}
            data-resource-id={resource.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              border: resource.is_viewed ? '2px solid #28a745' : '1px solid #ddd',
              transition: 'all 0.3s',
              opacity: resource.is_viewed ? 0.8 : 1
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'}
          >
            {/* En-tête */}
            <div style={{
              backgroundColor: resource.is_viewed ? '#d4edda' : '#f8f9fa',
              padding: '15px',
              borderBottom: '1px solid #eee'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>
                    {resource.title}
                  </h3>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#007bff',
                    border: '1px solid #007bff'
                  }}>
                    {RESOURCE_TYPES[resource.resource_type]}
                  </span>
                </div>
                {resource.is_viewed && (
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    borderRadius: '3px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ✓ Consulté
                  </span>
                )}
              </div>
            </div>

            {/* Contenu */}
            <div style={{ padding: '15px' }}>
              {resource.description && (
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5',
                  marginBottom: '15px'
                }}>
                  {resource.description.substring(0, 150)}
                  {resource.description.length > 150 ? '...' : ''}
                </p>
              )}

              {/* Infos */}
              <div style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '15px',
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                lineHeight: '1.8'
              }}>
                {resource.subject_name && (
                  <p style={{ margin: '0 0 5px 0' }}>
                    <strong>📚 Matière:</strong> {resource.subject_name}
                  </p>
                )}
                {resource.difficulty_level && (
                  <p style={{ margin: '0 0 5px 0' }}>
                    <strong>📊 Niveau:</strong> {resource.difficulty_level}
                  </p>
                )}
                {resource.author && (
                  <p style={{ margin: '0 0 5px 0' }}>
                    <strong>✍️ Auteur:</strong> {resource.author}
                  </p>
                )}
                {resource.duration && (
                  <p style={{ margin: 0 }}>
                    <strong>⏱️ Durée:</strong> {resource.duration} min
                  </p>
                )}
              </div>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  {resource.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        backgroundColor: '#e8f4f8',
                        borderRadius: '3px',
                        fontSize: '11px',
                        marginRight: '5px',
                        marginBottom: '5px',
                        color: '#0066cc'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Quiz disponibles */}
              {quizzes[resource.resource_id] && quizzes[resource.resource_id].length > 0 && (
                <div style={{
                  marginBottom: '15px',
                  padding: '10px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '4px',
                  border: '1px solid #ffc107'
                }}>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '13px', color: '#856404' }}>
                    📋 Quiz disponibles ({quizzes[resource.resource_id].length})
                  </p>
                  {quizzes[resource.resource_id].map(quiz => {
                    const hasCompleted = quizScores[quiz.quiz_id]
                    
                    return (
                      <div key={quiz.quiz_id} style={{
                        backgroundColor: 'white',
                        padding: '8px',
                        marginBottom: '8px',
                        borderRadius: '3px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: hasCompleted ? '2px solid #28a745' : '1px solid #ddd'
                      }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', fontSize: '12px' }}>
                            {quiz.title}
                            {hasCompleted && <span style={{ marginLeft: '8px', color: '#28a745' }}>✓</span>}
                          </p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>
                            {quiz.total_questions} questions • Score requis: {quiz.passing_score}%
                          </p>
                          {hasCompleted && (
                            <p style={{ 
                              margin: '5px 0 0 0', 
                              fontSize: '12px', 
                              fontWeight: 'bold',
                              color: hasCompleted.passed ? '#28a745' : '#dc3545'
                            }}>
                              Score: {hasCompleted.score}% ({hasCompleted.points_earned}/{hasCompleted.max_points} pts)
                              {hasCompleted.passed ? ' - Réussi ✅' : ' - Échoué ❌'}
                            </p>
                          )}
                        </div>
                        {!hasCompleted ? (
                          <button
                            onClick={() => handleStartQuiz(quiz)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            Commencer
                          </button>
                        ) : (
                          <div style={{
                            padding: '6px 12px',
                            backgroundColor: '#e9ecef',
                            color: '#6c757d',
                            borderRadius: '3px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            Terminé
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Boutons d'action */}
              <div style={{
                display: 'flex',
                gap: '8px',
                borderTop: '1px solid #eee',
                paddingTop: '15px'
              }}>
                {resource.content && (
                  <button
                    onClick={() => handleOpenCourseContent(resource)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 4px rgba(40,167,69,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#218838'
                      e.target.style.transform = 'translateY(-1px)'
                      e.target.style.boxShadow = '0 4px 8px rgba(40,167,69,0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#28a745'
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 2px 4px rgba(40,167,69,0.2)'
                    }}
                  >
                    📖 Voir le cours
                  </button>
                )}
                <button
                  onClick={() => handleOpenResource(resource)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: resource.is_viewed ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = resource.is_viewed ? '#5a6268' : '#0056b3'
                    e.target.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = resource.is_viewed ? '#6c757d' : '#007bff'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  {resource.is_viewed ? (
                    <>✓ Consulté</>
                  ) : (
                    resource.external_url ? '🔗 Terminer' : '📥 Terminer'
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedResource(expandedResource === resource.id ? null : resource.id)
                  }}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                >
                  {expandedResource === resource.id ? '▲ Moins' : '▼ Plus'}
                </button>
              </div>

              {/* Détails étendus - Informations techniques uniquement */}
              {expandedResource === resource.id && (
                <div style={{ marginTop: '15px' }}>
                  {/* Informations techniques */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: '4px solid #007bff'
                  }}>
                    <h4 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ℹ️ Informations techniques
                    </h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <p style={{ margin: 0, fontSize: '14px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                        <strong>ID Ressource:</strong> <span style={{ color: '#007bff' }}>{resource.resource_id}</span>
                      </p>
                      <p style={{ margin: 0, fontSize: '14px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                        <strong>Titre:</strong> {resource.title}
                      </p>
                      {resource.description && (
                        <p style={{ margin: 0, fontSize: '14px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                          <strong>Résumé:</strong> {resource.description}
                        </p>
                      )}
                      {resource.author && (
                        <p style={{ margin: 0, fontSize: '14px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                          <strong>Auteur:</strong> {resource.author}
                        </p>
                      )}
                      <p style={{ margin: 0, fontSize: '14px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                        <strong>Type:</strong> {RESOURCE_TYPES[resource.resource_type] || resource.resource_type}
                      </p>
                      {resource.difficulty_level && (
                        <p style={{ margin: 0, fontSize: '14px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                          <strong>Niveau:</strong> {resource.difficulty_level}
                        </p>
                      )}
                      {resource.duration && (
                        <p style={{ margin: 0, fontSize: '14px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                          <strong>Durée:</strong> {resource.duration} minutes
                        </p>
                      )}
                      {resource.external_url && (
                        <p style={{ margin: 0, fontSize: '14px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                          <strong>Lien externe:</strong> <a href={resource.external_url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>{resource.external_url}</a>
                        </p>
                      )}
                      {resource.tags && resource.tags.length > 0 && (
                        <p style={{ margin: 0, fontSize: '14px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                          <strong>Tags:</strong> {resource.tags.join(', ')}
                        </p>
                      )}
                      <p style={{ margin: 0, fontSize: '14px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                        <strong>Créé le:</strong> {new Date(resource.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ANCIEN CODE - Contenu du cours supprimé */}
              {false && resource.content && (() => {
                    // Diviser le contenu en paragraphes
                    const paragraphs = resource.content.split('\n\n').filter(p => p.trim());
                    
                    // Nombre de paragraphes par page
                    const PARAGRAPHS_PER_PAGE = 6;
                    const totalPages = Math.ceil(paragraphs.length / PARAGRAPHS_PER_PAGE);
                    
                    // Page actuelle pour cette ressource
                    const page = currentPage[resource.id] || 1;
                    
                    // Calculer les indices de début et fin
                    const startIdx = (page - 1) * PARAGRAPHS_PER_PAGE;
                    const endIdx = Math.min(startIdx + PARAGRAPHS_PER_PAGE, paragraphs.length);
                    const currentParagraphs = paragraphs.slice(startIdx, endIdx);
                    
                    return (
                      <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        border: '1px solid #e0e0e0'
                      }}>
                        <div style={{
                          borderBottom: '3px solid #007bff',
                          paddingBottom: '15px',
                          marginBottom: '25px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <h2 style={{
                            margin: 0,
                            color: '#2c3e50',
                            fontSize: '24px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            📖 Contenu du cours
                          </h2>
                          {totalPages > 1 && (
                            <span style={{
                              fontSize: '14px',
                              color: '#6c757d',
                              backgroundColor: '#f8f9fa',
                              padding: '5px 12px',
                              borderRadius: '20px',
                              fontWeight: '500'
                            }}>
                              Page {page} / {totalPages}
                            </span>
                          )}
                        </div>
                        
                        <div style={{
                          fontSize: '16px',
                          lineHeight: '1.8',
                          color: '#34495e',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          minHeight: '400px'
                        }}>
                          {currentParagraphs.map((paragraph, idx) => (
                            <p key={startIdx + idx} style={{
                              marginBottom: '20px',
                              textAlign: 'justify',
                              padding: paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•') ? '10px 20px' : '0',
                              backgroundColor: paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•') ? '#f8f9fa' : 'transparent',
                              borderRadius: '6px',
                              borderLeft: paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•') ? '4px solid #007bff' : 'none'
                            }}>
                              {paragraph}
                            </p>
                          ))}
                        </div>

                        {/* Navigation entre les pages */}
                        {totalPages > 1 && (
                          <div style={{
                            marginTop: '30px',
                            paddingTop: '20px',
                            borderTop: '2px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '15px'
                          }}>
                            <button
                              onClick={() => {
                                const newPage = Math.max(1, page - 1);
                                setCurrentPage(prev => ({ ...prev, [resource.id]: newPage }));
                                // Scroll vers le haut du contenu
                                document.querySelector(`[data-resource-id="${resource.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                              }}
                              disabled={page === 1}
                              style={{
                                padding: '12px 24px',
                                backgroundColor: page === 1 ? '#e9ecef' : '#007bff',
                                color: page === 1 ? '#6c757d' : 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: page === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '15px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease',
                                boxShadow: page === 1 ? 'none' : '0 2px 8px rgba(0,123,255,0.2)'
                              }}
                            >
                              ← Précédent
                            </button>

                            <div style={{
                              display: 'flex',
                              gap: '8px',
                              alignItems: 'center'
                            }}>
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                  key={pageNum}
                                  onClick={() => {
                                    setCurrentPage(prev => ({ ...prev, [resource.id]: pageNum }));
                                    document.querySelector(`[data-resource-id="${resource.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                  }}
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    border: pageNum === page ? '2px solid #007bff' : '1px solid #dee2e6',
                                    backgroundColor: pageNum === page ? '#007bff' : 'white',
                                    color: pageNum === page ? 'white' : '#495057',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: pageNum === page ? '600' : '400',
                                    transition: 'all 0.3s ease',
                                    display: totalPages > 10 && Math.abs(pageNum - page) > 2 && pageNum !== 1 && pageNum !== totalPages ? 'none' : 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {pageNum}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => {
                                const newPage = Math.min(totalPages, page + 1);
                                setCurrentPage(prev => ({ ...prev, [resource.id]: newPage }));
                                document.querySelector(`[data-resource-id="${resource.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                              }}
                              disabled={page === totalPages}
                              style={{
                                padding: '12px 24px',
                                backgroundColor: page === totalPages ? '#e9ecef' : '#007bff',
                                color: page === totalPages ? '#6c757d' : 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                fontSize: '15px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease',
                                boxShadow: page === totalPages ? 'none' : '0 2px 8px rgba(0,123,255,0.2)'
                              }}
                            >
                              Suivant →
                            </button>
                          </div>
                        )}

                        <div style={{
                          marginTop: '30px',
                          paddingTop: '20px',
                          borderTop: '1px solid #e0e0e0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '13px',
                          color: '#7f8c8d'
                        }}>
                          <span>📚 Ressource pédagogique</span>
                          <span>✍️ Par {resource.author || 'Enseignant'}</span>
                        </div>
                      </div>
                    );
                  })()}
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          textAlign: 'center',
          borderRadius: '8px',
          color: '#999',
          border: '1px solid #ddd'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>📭 Aucune ressource trouvée</p>
          <p style={{ fontSize: '14px' }}>Revenez plus tard pour découvrir de nouvelles ressources!</p>
        </div>
      )}

      {/* Modal Quiz */}
      {showQuizModal && selectedQuiz && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '20px',
              borderRadius: '8px 8px 0 0'
            }}>
              <h2 style={{ margin: '0 0 10px 0' }}>📋 {selectedQuiz.title}</h2>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                {selectedQuiz.description}
              </p>
              <p style={{ margin: '10px 0 0 0', fontSize: '13px' }}>
                {quizQuestions.length} questions • Score requis: {selectedQuiz.passing_score}%
              </p>
            </div>

            <div style={{ padding: '20px' }}>
              {quizResult ? (
                <div style={{
                  textAlign: 'center',
                  padding: '30px'
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '20px'
                  }}>
                    {quizResult.passed ? '🎉' : '😔'}
                  </div>
                  <h3 style={{
                    color: quizResult.passed ? '#28a745' : '#dc3545',
                    marginBottom: '10px'
                  }}>
                    {quizResult.passed ? 'Félicitations!' : 'Continuez vos efforts'}
                  </h3>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
                    Score: {quizResult.score}%
                  </p>
                  <p style={{ color: '#666', margin: '10px 0' }}>
                    {quizResult.points_earned} / {quizResult.max_points} points
                  </p>
                  <button
                    onClick={() => setShowQuizModal(false)}
                    style={{
                      marginTop: '20px',
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  {quizQuestions.map((question, index) => (
                    <div key={question.id} style={{
                      marginBottom: '25px',
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      border: '1px solid #dee2e6'
                    }}>
                      <p style={{
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        fontSize: '15px'
                      }}>
                        Question {index + 1}/{quizQuestions.length} ({question.points} point{question.points > 1 ? 's' : ''})
                      </p>
                      <p style={{ marginBottom: '15px', fontSize: '14px' }}>
                        {question.question_text}
                      </p>

                      {question.question_type === 'multiple_choice' && question.options && (
                        <div>
                          {question.options.map((option, idx) => (
                            <label key={idx} style={{
                              display: 'block',
                              padding: '10px',
                              marginBottom: '8px',
                              backgroundColor: 'white',
                              border: studentAnswers[question.id] === option ? '2px solid #007bff' : '1px solid #ddd',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}>
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option}
                                checked={studentAnswers[question.id] === option}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                style={{ marginRight: '10px' }}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      )}

                      {question.question_type === 'true_false' && (
                        <div>
                          {['Vrai', 'Faux'].map((option) => (
                            <label key={option} style={{
                              display: 'block',
                              padding: '10px',
                              marginBottom: '8px',
                              backgroundColor: 'white',
                              border: studentAnswers[question.id] === option ? '2px solid #007bff' : '1px solid #ddd',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}>
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option}
                                checked={studentAnswers[question.id] === option}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                style={{ marginRight: '10px' }}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      )}

                      {question.question_type === 'short_answer' && (
                        <input
                          type="text"
                          value={studentAnswers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          placeholder="Votre réponse..."
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      )}
                    </div>
                  ))}

                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '20px'
                  }}>
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={submittingQuiz}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: submittingQuiz ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: submittingQuiz ? 'not-allowed' : 'pointer',
                        fontSize: '15px',
                        fontWeight: 'bold'
                      }}
                    >
                      {submittingQuiz ? '⏳ Envoi...' : '✅ Soumettre le quiz'}
                    </button>
                    <button
                      onClick={() => setShowQuizModal(false)}
                      disabled={submittingQuiz}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: submittingQuiz ? 'not-allowed' : 'pointer',
                        fontSize: '15px'
                      }}
                    >
                      ❌ Annuler
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourcesStudent
