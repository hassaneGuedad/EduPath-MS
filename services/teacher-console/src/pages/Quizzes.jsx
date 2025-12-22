import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:3008'

function Quizzes() {
  const [resources, setResources] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [selectedResource, setSelectedResource] = useState('')
  const [quizScores, setQuizScores] = useState({})
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [expandedQuiz, setExpandedQuiz] = useState(null)

  const [newQuiz, setNewQuiz] = useState({
    quiz_id: '',
    resource_id: '',
    title: '',
    description: '',
    passing_score: 50,
    duration_minutes: '',
    questions: []
  })

  const [newQuestion, setNewQuestion] = useState({
    question_number: '',
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1,
    explanation: ''
  })

  useEffect(() => {
    loadResources()
  }, [])

  useEffect(() => {
    if (selectedResource) {
      loadQuizzesForResource(selectedResource)
    }
  }, [selectedResource])

  const loadResources = async () => {
    try {
      const response = await axios.get(`${API_BASE}/resources`)
      setResources(response.data)
      console.log('✅ Ressources chargées:', response.data.length)
    } catch (error) {
      console.error('❌ Erreur:', error)
    }
  }

  const loadQuizzesForResource = async (resourceId) => {
    try {
      const response = await axios.get(`${API_BASE}/quizzes/resource/${resourceId}`)
      setQuizzes(response.data)
      console.log('✅ Quiz chargés:', response.data.length)
      
      // Charger les scores pour chaque quiz
      for (const quiz of response.data) {
        loadQuizScores(quiz.quiz_id)
      }
    } catch (error) {
      console.error('❌ Erreur:', error)
    }
  }

  const loadQuizScores = async (quizId) => {
    try {
      const response = await axios.get(`${API_BASE}/quiz-scores/${quizId}`)
      setQuizScores(prev => ({
        ...prev,
        [quizId]: response.data
      }))
    } catch (error) {
      console.error('❌ Erreur lors du chargement des scores:', error)
    }
  }

  const handleAddQuestion = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { ...newQuestion, question_number: prev.questions.length + 1 }]
    }))
    setNewQuestion({
      question_number: '',
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
      if (!newQuiz.title || !newQuiz.resource_id || newQuiz.questions.length === 0) {
        alert('Remplissez tous les champs et ajoutez au moins une question')
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

      setQuizzes([...quizzes, response.data])
      alert('Quiz créé avec succès!')
      setShowQuizModal(false)
      resetQuizForm()
    } catch (error) {
      console.error('❌ Erreur:', error)
      alert('Erreur lors de la création du quiz: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce quiz?')) return

    try {
      await axios.delete(`${API_BASE}/quizzes/${quizId}`)
      setQuizzes(quizzes.filter(q => q.quiz_id !== quizId))
      alert('Quiz supprimé!')
    } catch (error) {
      console.error('❌ Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const resetQuizForm = () => {
    setNewQuiz({
      quiz_id: '',
      resource_id: selectedResource,
      title: '',
      description: '',
      passing_score: 50,
      duration_minutes: '',
      questions: []
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>📋 Gestion des Quiz</h1>

      {/* Sélection de ressource */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Sélectionner une ressource:</label>
        <select
          value={selectedResource}
          onChange={(e) => setSelectedResource(e.target.value)}
          style={{
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="">-- Sélectionnez une ressource --</option>
          {resources.map(r => (
            <option key={r.resource_id} value={r.resource_id}>
              {r.title} ({r.resource_id})
            </option>
          ))}
        </select>
      </div>

      {/* Bouton ajouter quiz */}
      {selectedResource && (
        <button
          onClick={() => {
            setNewQuiz({ ...newQuiz, resource_id: selectedResource, quiz_id: `QUIZ-${Date.now()}` })
            setShowQuizModal(true)
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          ➕ Ajouter un Quiz
        </button>
      )}

      {/* Modal créer quiz */}
      {showQuizModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2>📝 Créer un Quiz</h2>
            
            <form onSubmit={handleCreateQuiz}>
              {/* Infos du quiz */}
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="ID du quiz (ex: QUIZ-001)"
                  value={newQuiz.quiz_id}
                  onChange={(e) => setNewQuiz({ ...newQuiz, quiz_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
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
                    minHeight: '80px'
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
              </div>

              {/* Questions */}
              <div style={{ marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <h3>📝 Questions ({newQuiz.questions.length})</h3>
                
                {newQuiz.questions.map((q, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#f8f9fa',
                    padding: '10px',
                    marginBottom: '10px',
                    borderRadius: '4px'
                  }}>
                    <p><strong>Q{q.question_number}:</strong> {q.question_text}</p>
                    {q.options.length > 0 && (
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        Options: {q.options.filter(o => o).join(', ')}
                      </p>
                    )}
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Réponse correcte: <strong>{q.correct_answer}</strong> ({q.points} points)
                    </p>
                  </div>
                ))}

                {/* Ajouter une question */}
                <div style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  borderRadius: '4px',
                  backgroundColor: '#fafafa'
                }}>
                  <h4>Ajouter une question</h4>
                  <input
                    type="text"
                    placeholder="Texte de la question"
                    value={newQuestion.question_text}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                  
                  <select
                    value={newQuestion.question_type}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="multiple_choice">Choix multiples</option>
                    <option value="true_false">Vrai/Faux</option>
                    <option value="short_answer">Réponse courte</option>
                  </select>

                  {newQuestion.question_type === 'multiple_choice' && (
                    <div style={{ marginBottom: '10px' }}>
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
                            marginBottom: '5px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
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
                      padding: '8px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  />

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="number"
                      placeholder="Points"
                      value={newQuestion.points}
                      onChange={(e) => setNewQuestion({ ...newQuestion, points: parseFloat(e.target.value) })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <textarea
                    placeholder="Explication (optionnel)"
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                      minHeight: '60px'
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ➕ Ajouter cette question
                  </button>
                </div>
              </div>

              {/* Boutons */}
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
                  ✅ Créer le Quiz
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuizModal(false)
                    resetQuizForm()
                  }}
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

      {/* Liste des quiz */}
      {selectedResource && (
        <div>
          <h2>📚 Quiz de la ressource</h2>
          {quizzes.length === 0 ? (
            <p style={{ color: '#999' }}>Aucun quiz pour cette ressource</p>
          ) : (
            quizzes.map(quiz => (
              <div key={quiz.quiz_id} style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #ddd'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0' }}>{quiz.title}</h3>
                    <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                      {quiz.description}
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>
                      <strong>📊 Questions:</strong> {quiz.total_questions}
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>
                      <strong>✅ Score de passage:</strong> {quiz.passing_score}%
                    </p>
                    {quiz.duration_minutes && (
                      <p style={{ margin: '0', fontSize: '13px' }}>
                        <strong>⏱️ Durée:</strong> {quiz.duration_minutes} minutes
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.quiz_id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>

                {/* Résultats des étudiants */}
                {quizScores[quiz.quiz_id] && quizScores[quiz.quiz_id].length > 0 && (
                  <div style={{
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #eee'
                  }}>
                    <h4>📈 Résultats des étudiants ({quizScores[quiz.quiz_id].length})</h4>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse'
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Note</th>
                          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Points</th>
                          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Résultat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizScores[quiz.quiz_id].map((score, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{score.student_email}</td>
                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                              {score.score.toFixed(2)}%
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              {score.points}/{score.max_points}
                            </td>
                            <td style={{
                              padding: '10px',
                              textAlign: 'center',
                              color: score.passed ? '#28a745' : '#dc3545',
                              fontWeight: 'bold'
                            }}>
                              {score.passed ? '✅ Réussi' : '❌ Échoué'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Quizzes
