import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:3008'

const RESOURCE_TYPES = [
  { value: 'pdf', label: '📄 Document PDF' },
  { value: 'video', label: '🎥 Vidéo' },
  { value: 'podcast', label: '🎙️ Podcast' },
  { value: 'ebook', label: '📖 E-Book' },
  { value: 'link', label: '🔗 Lien Externe' },
  { value: 'presentation', label: '📊 Présentation' },
  { value: 'exercice', label: '📝 Exercice' }
]

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

function Resources() {
  const [resources, setResources] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [editingResource, setEditingResource] = useState(null)
  const [resourceError, setResourceError] = useState(null)
  const [resourceLoading, setResourceLoading] = useState(false)
  
  // Quiz state
  const [quizzes, setQuizzes] = useState({})
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [selectedResourceForQuiz, setSelectedResourceForQuiz] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([])

  // Filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')

  // Formulaire
  const [newResource, setNewResource] = useState({
    resource_id: '',
    title: '',
    description: '',
    content: '', // Contenu détaillé du cours
    resource_type: 'pdf',
    subject_id: '',
    difficulty_level: 'Intermediate',
    duration: '',
    author: '',
    external_url: '',
    file: null,
    tags: ''
  })

  const [newQuiz, setNewQuiz] = useState({
    quiz_id: '',
    title: '',
    description: '',
    passing_score: 50,
    duration_minutes: '',
    questions: []
  })

  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1,
    explanation: ''
  })

  useEffect(() => {
    loadResources()
    loadModulesAndSubjects()
  }, [])

  const loadResources = async () => {
    try {
      const response = await axios.get(`${API_BASE}/resources`)
      console.log('✅ Ressources chargées:', response.data.length, 'ressource(s)')
      setResources(response.data)
      // Charger les quiz pour chaque ressource
      for (const resource of response.data) {
        loadQuizzesForResource(resource.resource_id)
      }
      setLoading(false)
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error)
      setLoading(false)
    }
  }

  const loadQuizzesForResource = async (resourceId) => {
    try {
      const response = await axios.get(`${API_BASE}/quizzes/resource/${resourceId}`)
      setQuizzes(prev => ({
        ...prev,
        [resourceId]: response.data
      }))
    } catch (error) {
      console.error('❌ Erreur:', error)
    }
  }

  const handleOpenQuizModal = (resource) => {
    setSelectedResourceForQuiz(resource)
    setNewQuiz({
      quiz_id: `QUIZ-${Date.now()}`,
      resource_id: resource.resource_id,
      title: '',
      description: '',
      passing_score: 50,
      duration_minutes: '',
      questions: []
    })
    setShowQuizModal(true)
  }

  const handleAddQuestionToQuiz = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { ...newQuestion, question_number: prev.questions.length + 1 }]
    }))
    setNewQuestion({
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
      explanation: ''
    })
  }

  const handleCreateQuiz = async (e) => {
    e.preventDefault()
    try {
      if (!newQuiz.title) {
        alert('⚠️ Veuillez saisir le titre du quiz')
        return
      }
      if (newQuiz.questions.length === 0) {
        alert('⚠️ Veuillez ajouter au moins une question au quiz.\n\n📝 Remplissez le formulaire de question ci-dessous, puis cliquez sur "Ajouter la question" pour l\'ajouter au quiz.')
        return
      }

      const quizData = {
        ...newQuiz,
        passing_score: parseInt(newQuiz.passing_score),
        duration_minutes: newQuiz.duration_minutes ? parseInt(newQuiz.duration_minutes) : null
      }

      console.log('📝 Création du quiz:', quizData)
      const response = await axios.post(`${API_BASE}/quizzes`, quizData)
      console.log('✅ Quiz créé:', response.data)

      setQuizzes(prev => ({
        ...prev,
        [newQuiz.resource_id]: [...(prev[newQuiz.resource_id] || []), response.data]
      }))

      alert('Quiz créé avec succès!')
      setShowQuizModal(false)
    } catch (error) {
      console.error('❌ Erreur:', error)
      alert('Erreur: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleDeleteQuiz = async (quizId, resourceId) => {
    if (!window.confirm('Êtes-vous sûr?')) return
    try {
      await axios.delete(`${API_BASE}/quizzes/${quizId}`)
      setQuizzes(prev => ({
        ...prev,
        [resourceId]: prev[resourceId].filter(q => q.quiz_id !== quizId)
      }))
      alert('Quiz supprimé!')
    } catch (error) {
      console.error('❌ Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const loadModulesAndSubjects = async () => {
    try {
      console.log('🔄 Chargement des matières depuis l\'API...')
      
      // Charger toutes les matières depuis l'API
      const subjectsResponse = await axios.get(`${API_BASE}/subjects`)
      console.log('✅ Matières chargées:', subjectsResponse.data.length, 'matière(s)', subjectsResponse.data)
      
      // Charger aussi les modules pour avoir les noms des modules
      const modulesResponse = await axios.get(`${API_BASE}/modules`)
      console.log('✅ Modules chargés:', modulesResponse.data.length, 'module(s)')
      
      // Mapper les matières avec les noms des modules
      const subjectsWithModules = subjectsResponse.data.map(subject => {
        const module = modulesResponse.data.find(m => m.module_id === subject.module_id)
        return {
          ...subject,
          module_name: module ? module.module_name : subject.module_id
        }
      })
      
      console.log('✅ Matières avec modules:', subjectsWithModules)
      setSubjects(subjectsWithModules)
    } catch (error) {
      console.error('❌ Erreur lors du chargement des matières:', error)
      setSubjects([])
    }
  }

  const handleAddResource = async (e) => {
    e.preventDefault()
    setResourceError(null)
    setResourceLoading(true)

    try {
      // Validation
      if (!newResource.title || !newResource.resource_id) {
        throw new Error('Le titre et l\'ID sont requis')
      }

      if (newResource.resource_type !== 'link' && !newResource.file) {
        throw new Error('Veuillez uploader un fichier ou ajouter un lien')
      }

      if (newResource.resource_type === 'link' && !newResource.external_url) {
        throw new Error('Veuillez ajouter une URL pour ce lien')
      }

      let filePath = null

      // Si c'est un fichier, uploader d'abord
      if (newResource.file) {
        console.log('📤 Upload du fichier...')
        const formData = new FormData()
        formData.append('file', newResource.file)
        const uploadResponse = await axios.post(`${API_BASE}/resources/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        filePath = uploadResponse.data.file_path
        console.log('✅ Fichier uploadé:', filePath)
      }

      // Préparer les tags
      let tagsList = []
      if (newResource.tags && typeof newResource.tags === 'string' && newResource.tags.trim()) {
        tagsList = newResource.tags.split(',').map(t => t.trim()).filter(t => t)
      }

      const resourceData = {
        resource_id: newResource.resource_id,
        title: newResource.title,
        description: newResource.description || '',
        content: newResource.content || '',
        resource_type: newResource.resource_type,
        subject_id: newResource.subject_id || null,
        subject_name: subjects.find(s => s.subject_id === newResource.subject_id)?.subject_name || null,
        difficulty_level: newResource.difficulty_level || 'Intermediate',
        duration: newResource.duration ? parseInt(newResource.duration) : null,
        author: newResource.author || '',
        external_url: newResource.external_url || filePath || null,
        file_path: filePath || null,
        tags: tagsList,
        is_viewed: false
      }

      console.log('📦 Données à envoyer:', resourceData)

      if (editingResource) {
        // Modifier via API
        await axios.put(`${API_BASE}/resources/${editingResource.resource_id}`, resourceData)
      } else {
        // Créer via API
        console.log('📝 Création de ressource:', resourceData)
        const response = await axios.post(`${API_BASE}/resources`, resourceData)
        console.log('✅ Ressource créée avec succès:', response.data)
        // Ajouter directement la nouvelle ressource à la liste
        setResources([...resources, response.data])
      }

      // Recharger les ressources pour être sûr d'avoir à jour
      setTimeout(() => {
        console.log('🔄 Rechargement des ressources...')
        loadResources()
      }, 500)
      resetForm()
      setShowResourceModal(false)
      alert(editingResource ? 'Ressource modifiée avec succès !' : 'Ressource créée avec succès !')
      // Réinitialiser les filtres pour voir la nouvelle ressource
      setSearchQuery('')
      setSelectedType('all')
      setSelectedDifficulty('all')
      setSelectedSubject('all')

    } catch (error) {
      console.error('Erreur:', error)
      setResourceError(error.response?.data?.detail || error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setResourceLoading(false)
    }
  }

  const resetForm = () => {
    setNewResource({
      resource_id: '',
      title: '',
      description: '',
      resource_type: 'pdf',
      subject_id: '',
      difficulty_level: 'Intermediate',
      duration: '',
      author: '',
      external_url: '',
      file: null,
      tags: ''
    })
    setEditingResource(null)
  }

  const handleEditResource = (resource) => {
    setEditingResource(resource)
    setNewResource({
      resource_id: resource.resource_id,
      title: resource.title,
      description: resource.description,
      content: resource.content || '',
      resource_type: resource.resource_type,
      subject_id: resource.subject_id || '',
      difficulty_level: resource.difficulty_level,
      duration: resource.duration || '',
      author: resource.author,
      external_url: resource.external_url || '',
      file: null,
      tags: resource.tags.join(', ')
    })
    loadModulesAndSubjects() // Recharger les matières
    setShowResourceModal(true)
  }

  const handleDeleteResource = async (resourceId, resource_id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      try {
        await axios.delete(`${API_BASE}/resources/${resource_id}`)
        loadResources()
        setSelectedResource(null)
      } catch (error) {
        alert('Erreur lors de la suppression: ' + error.response?.data?.detail)
      }
    }
  }

  // Filtrage
  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchQuery || 
                         resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    const matchesType = selectedType === 'all' || resource.resource_type === selectedType
    const matchesDifficulty = selectedDifficulty === 'all' || 
                             resource.difficulty_level === null || 
                             resource.difficulty_level === selectedDifficulty
    const matchesSubject = selectedSubject === 'all' || 
                          resource.subject_id === null || 
                          resource.subject_id === selectedSubject

    return matchesSearch && matchesType && matchesDifficulty && matchesSubject
  })

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Gestion des Ressources Pédagogiques</h1>

      {/* Bouton Ajouter */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => {
            resetForm()
            loadModulesAndSubjects() // Recharger les matières
            setShowResourceModal(true)
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          + Ajouter une Ressource
        </button>
      </div>

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
            placeholder="Titre, description, tags..."
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
            {RESOURCE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
            📊 Niveau:
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          >
            <option value="all">Tous les niveaux</option>
            {DIFFICULTY_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
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
            <option value="all">Toutes les matières</option>
            {subjects.map(subject => (
              <option key={subject.subject_id} value={subject.subject_id}>
                {subject.subject_name} ({subject.module_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Résultats */}
      <div style={{ marginBottom: '15px', color: '#666' }}>
        {filteredResources.length} ressource(s) trouvée(s)
      </div>

      {/* Liste des ressources */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {filteredResources.map(resource => (
          <div
            key={resource.id}
            onClick={() => setSelectedResource(resource)}
            style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              border: selectedResource?.id === resource.id ? '2px solid #007bff' : '1px solid #ddd',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'}
          >
            <div style={{ marginBottom: '10px' }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: '#e8f4f8',
                borderRadius: '3px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#007bff'
              }}>
                {RESOURCE_TYPES.find(t => t.value === resource.resource_type)?.label}
              </span>
            </div>

            <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>{resource.title}</h3>

            <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px', lineHeight: '1.5' }}>
              <p><strong>Matière:</strong> {resource.subject_name}</p>
              <p><strong>Niveau:</strong> {resource.difficulty_level}</p>
              {resource.duration && <p><strong>Durée:</strong> {resource.duration} min</p>}
              {resource.author && <p><strong>Auteur:</strong> {resource.author}</p>}
            </div>

            {resource.tags && resource.tags.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                {resource.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '3px',
                      fontSize: '11px',
                      marginRight: '5px',
                      marginBottom: '5px'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenQuizModal(resource)
                }}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  minWidth: '100px'
                }}
              >
                📋 Quiz
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditResource(resource)
                }}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  minWidth: '100px'
                }}
              >
                ✏️ Modifier
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteResource(resource.id, resource.resource_id)
                }}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  minWidth: '100px'
                }}
              >
                ✕ Supprimer
              </button>
            </div>

            {/* Afficher les quiz existants */}
            {quizzes[resource.resource_id] && quizzes[resource.resource_id].length > 0 && (
              <div style={{
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid #eee',
                backgroundColor: '#f9f9f9',
                padding: '10px',
                borderRadius: '4px'
              }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '13px' }}>
                  📋 Quiz ({quizzes[resource.resource_id].length})
                </p>
                {quizzes[resource.resource_id].map(quiz => (
                  <div key={quiz.quiz_id} style={{
                    backgroundColor: 'white',
                    padding: '8px',
                    marginBottom: '8px',
                    borderRadius: '3px',
                    borderLeft: '3px solid #28a745',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '12px' }}>
                      <strong>{quiz.title}</strong>
                      <p style={{ margin: '0', color: '#666', fontSize: '11px' }}>
                        {quiz.total_questions} questions • {quiz.passing_score}%
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteQuiz(quiz.quiz_id, resource.resource_id)
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          textAlign: 'center',
          borderRadius: '8px',
          color: '#999'
        }}>
          Aucune ressource trouvée
        </div>
      )}

      {/* Modal ajouter/modifier ressource */}
      {showResourceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          overflow: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '95%',
            margin: '20px auto'
          }}>
            <h2>{editingResource ? 'Modifier la Ressource' : 'Ajouter une Ressource'}</h2>

            {resourceError && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px'
              }}>
                {resourceError}
              </div>
            )}

            <form onSubmit={handleAddResource} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  ID Ressource: *
                </label>
                <input
                  type="text"
                  value={newResource.resource_id}
                  onChange={(e) => setNewResource({ ...newResource, resource_id: e.target.value })}
                  required
                  placeholder="RES001"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Titre: *
                </label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  required
                  placeholder="Titre de la ressource"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Description courte:
                </label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  rows="2"
                  placeholder="Résumé bref de la ressource..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    fontFamily: 'Arial'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  📝 Contenu du cours détaillé:
                </label>
                <textarea
                  value={newResource.content}
                  onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                  rows="10"
                  placeholder="Saisissez le contenu complet du cours ici...&#10;&#10;Vous pouvez utiliser:&#10;- Des paragraphes&#10;- Des listes&#10;- Des exemples de code&#10;- Des explications détaillées"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #007bff',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    backgroundColor: '#f8f9fa'
                  }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  💡 Astuce: Le contenu sera affiché avec un design moderne dans le portail étudiant
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Matière:
                  </label>
                  <select
                    value={newResource.subject_id}
                    onChange={(e) => setNewResource({ ...newResource, subject_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">-- Sélectionner --</option>
                    {subjects.map(subject => (
                      <option key={subject.subject_id} value={subject.subject_id}>
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Niveau:
                  </label>
                  <select
                    value={newResource.difficulty_level}
                    onChange={(e) => setNewResource({ ...newResource, difficulty_level: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {DIFFICULTY_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Durée (minutes):
                  </label>
                  <input
                    type="number"
                    value={newResource.duration}
                    onChange={(e) => setNewResource({ ...newResource, duration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Auteur:
                </label>
                <input
                  type="text"
                  value={newResource.author}
                  onChange={(e) => setNewResource({ ...newResource, author: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  URL:
                </label>
                <input
                  type="url"
                  value={newResource.external_url}
                  onChange={(e) => setNewResource({ ...newResource, external_url: e.target.value })}
                  placeholder="https://example.com"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowResourceModal(false)
                    setResourceError(null)
                    resetForm()
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={resourceLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: resourceLoading ? '#cccccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: resourceLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {resourceLoading ? 'Traitement...' : editingResource ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal créer Quiz */}
      {showQuizModal && selectedResourceForQuiz && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002,
          overflow: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            maxWidth: '700px',
            width: '95%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2>📋 Ajouter un Quiz: {selectedResourceForQuiz.title}</h2>
            
            <form onSubmit={handleCreateQuiz}>
              <input
                type="text"
                placeholder="Titre du quiz"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              <textarea
                placeholder="Description (optionnel)"
                value={newQuiz.description}
                onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  minHeight: '70px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="number"
                  placeholder="Score de passage (%)"
                  value={newQuiz.passing_score}
                  onChange={(e) => setNewQuiz({ ...newQuiz, passing_score: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                <input
                  type="number"
                  placeholder="Durée (minutes)"
                  value={newQuiz.duration_minutes}
                  onChange={(e) => setNewQuiz({ ...newQuiz, duration_minutes: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Questions ({newQuiz.questions.length})</h4>
              
              {newQuiz.questions.map((q, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#f8f9fa',
                  padding: '8px',
                  marginBottom: '8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  <strong>Q{idx + 1}:</strong> {q.question_text.substring(0, 50)}...
                </div>
              ))}

              <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px', marginBottom: '15px' }}>
                <h5>Ajouter une question</h5>
                <input
                  type="text"
                  placeholder="Question"
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    marginBottom: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    fontSize: '12px'
                  }}
                />
                <select
                  value={newQuestion.question_type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    marginBottom: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  <option value="multiple_choice">Choix multiples</option>
                  <option value="true_false">Vrai/Faux</option>
                  <option value="short_answer">Réponse courte</option>
                </select>

                {newQuestion.question_type === 'multiple_choice' && (
                  <div style={{ marginBottom: '8px' }}>
                    {newQuestion.options.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const opts = [...newQuestion.options]
                          opts[idx] = e.target.value
                          setNewQuestion({ ...newQuestion, options: opts })
                        }}
                        style={{
                          width: '100%',
                          padding: '6px',
                          marginBottom: '4px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxSizing: 'border-box',
                          fontSize: '12px'
                        }}
                      />
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Réponse correcte"
                  value={newQuestion.correct_answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    marginBottom: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    fontSize: '12px'
                  }}
                />

                <input
                  type="number"
                  placeholder="Points"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    marginBottom: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />

                <button
                  type="button"
                  onClick={handleAddQuestionToQuiz}
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  ➕ Ajouter question
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ✅ Créer Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ❌ Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Resources
