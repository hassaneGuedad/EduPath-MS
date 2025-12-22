import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:3008'

function Modules() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState(null)
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [newModule, setNewModule] = useState({
    module_id: '',
    module_name: '',
    category: '',
    credits: '',
    difficulty_level: 'Intermediate',
    description: ''
  })
  const [newSubject, setNewSubject] = useState({
    subject_id: '',
    subject_name: '',
    description: '',
    hours: ''
  })
  const [moduleLoading, setModuleLoading] = useState(false)
  const [moduleError, setModuleError] = useState(null)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/modules`)
      
      // Charger aussi les subjects pour chaque module
      const modulesWithSubjects = await Promise.all(
        response.data.map(async (module) => {
          const subjectsResponse = await axios.get(`${API_BASE}/subjects?module_id=${module.module_id}`)
          return {
            ...module,
            subjects: subjectsResponse.data
          }
        })
      )
      
      setModules(modulesWithSubjects)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setModuleError('Erreur lors du chargement des modules')
      setLoading(false)
    }
  }

  const handleAddModule = async (e) => {
    e.preventDefault()
    setModuleError(null)
    setModuleLoading(true)

    try {
      const moduleData = {
        module_id: newModule.module_id,
        module_name: newModule.module_name,
        category: newModule.category,
        credits: parseInt(newModule.credits),
        difficulty_level: newModule.difficulty_level,
        description: newModule.description
      }

      // Créer le module via l'API
      const response = await axios.post(`${API_BASE}/modules`, moduleData)
      
      // Recharger tous les modules
      await loadModules()
      
      setNewModule({
        module_id: '',
        module_name: '',
        category: '',
        credits: '',
        difficulty_level: 'Intermediate',
        description: ''
      })
      setShowModuleModal(false)
      alert('Module créé avec succès !')

    } catch (error) {
      console.error('Erreur:', error)
      setModuleError(error.response?.data?.detail || 'Erreur lors de la création du module')
    } finally {
      setModuleLoading(false)
    }
  }

  const handleAddSubject = async (e) => {
    e.preventDefault()
    setModuleError(null)
    setModuleLoading(true)

    try {
      if (!selectedModule) return

      const subjectData = {
        subject_id: newSubject.subject_id,
        module_id: selectedModule.module_id,
        subject_name: newSubject.subject_name,
        description: newSubject.description,
        hours: parseInt(newSubject.hours)
      }

      // Créer la matière via l'API
      await axios.post(`${API_BASE}/subjects`, subjectData)
      
      // Recharger tous les modules
      await loadModules()
      
      // Mettre à jour le module sélectionné
      const updatedModule = modules.find(m => m.module_id === selectedModule.module_id)
      if (updatedModule) {
        setSelectedModule(updatedModule)
      }
      
      setNewSubject({
        subject_id: '',
        subject_name: '',
        description: '',
        hours: ''
      })
      setShowSubjectModal(false)
      alert('Matière ajoutée avec succès !')

    } catch (error) {
      console.error('Erreur:', error)
      setModuleError(error.response?.data?.detail || 'Erreur lors de l\'ajout de la matière')
    } finally {
      setModuleLoading(false)
    }
  }

  const handleDeleteSubject = (subjectId) => {
    const updatedModules = modules.map(mod => {
      if (mod.id === selectedModule.id) {
        return {
          ...mod,
          subjects: mod.subjects.filter(s => s.id !== subjectId)
        }
      }
      return mod
    })
    setModules(updatedModules)
    setSelectedModule(updatedModules.find(m => m.id === selectedModule.id))
  }

  const handleDeleteModule = (moduleId) => {
    setModules(modules.filter(m => m.id !== moduleId))
    setSelectedModule(null)
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Gestion des Modules et Matières</h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowModuleModal(true)}
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
          + Ajouter un Module
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Liste des modules */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '15px' }}>Modules</h2>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {modules.map(mod => (
              <div
                key={mod.id}
                onClick={() => setSelectedModule(mod)}
                style={{
                  padding: '12px',
                  marginBottom: '10px',
                  backgroundColor: selectedModule?.id === mod.id ? '#e8f4f8' : '#f9f9f9',
                  border: selectedModule?.id === mod.id ? '2px solid #007bff' : '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{mod.module_name}</strong>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    ID: {mod.module_id} | Crédits: {mod.credits} | {mod.subjects?.length || 0} matière(s)
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteModule(mod.id)
                  }}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Détails du module sélectionné */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {selectedModule ? (
            <>
              <h2 style={{ marginBottom: '15px' }}>{selectedModule.module_name}</h2>
              <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
                <p><strong>ID:</strong> {selectedModule.module_id}</p>
                <p><strong>Catégorie:</strong> {selectedModule.category}</p>
                <p><strong>Crédits:</strong> {selectedModule.credits}</p>
                <p><strong>Niveau:</strong> {selectedModule.difficulty_level}</p>
                <p><strong>Description:</strong> {selectedModule.description || 'N/A'}</p>
              </div>

              <h3 style={{ marginBottom: '15px' }}>Matières ({selectedModule.subjects?.length || 0})</h3>

              <button
                onClick={() => setShowSubjectModal(true)}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '15px',
                  fontSize: '14px'
                }}
              >
                + Ajouter une Matière
              </button>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {selectedModule.subjects && selectedModule.subjects.length > 0 ? (
                  selectedModule.subjects.map(subject => (
                    <div
                      key={subject.id}
                      style={{
                        padding: '10px',
                        marginBottom: '10px',
                        backgroundColor: '#f9f9f9',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong>{subject.subject_name}</strong>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
                          ID: {subject.subject_id} | {subject.hours}h
                        </div>
                        {subject.description && (
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '3px' }}>
                            {subject.description}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                    Aucune matière ajoutée
                  </p>
                )}
              </div>
            </>
          ) : (
            <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
              Sélectionnez un module pour voir ses détails
            </p>
          )}
        </div>
      </div>

      {/* Modal ajouter module */}
      {showModuleModal && (
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
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2>Ajouter un nouveau Module</h2>

            {moduleError && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px'
              }}>
                {moduleError}
              </div>
            )}

            <form onSubmit={handleAddModule} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  ID Module:
                </label>
                <input
                  type="text"
                  value={newModule.module_id}
                  onChange={(e) => setNewModule({ ...newModule, module_id: e.target.value })}
                  required
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
                  Nom du Module:
                </label>
                <input
                  type="text"
                  value={newModule.module_name}
                  onChange={(e) => setNewModule({ ...newModule, module_name: e.target.value })}
                  required
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
                  Catégorie:
                </label>
                <input
                  type="text"
                  value={newModule.category}
                  onChange={(e) => setNewModule({ ...newModule, category: e.target.value })}
                  placeholder="ex: STEM, Humanities"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Crédits:
                  </label>
                  <input
                    type="number"
                    value={newModule.credits}
                    onChange={(e) => setNewModule({ ...newModule, credits: e.target.value })}
                    required
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
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Niveau:
                  </label>
                  <select
                    value={newModule.difficulty_level}
                    onChange={(e) => setNewModule({ ...newModule, difficulty_level: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Description:
                </label>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  rows="3"
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

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModuleModal(false)
                    setModuleError(null)
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
                  disabled={moduleLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: moduleLoading ? '#cccccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: moduleLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {moduleLoading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ajouter matière */}
      {showSubjectModal && (
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
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2>Ajouter une Matière à {selectedModule?.module_name}</h2>

            {moduleError && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px'
              }}>
                {moduleError}
              </div>
            )}

            <form onSubmit={handleAddSubject} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  ID Matière:
                </label>
                <input
                  type="text"
                  value={newSubject.subject_id}
                  onChange={(e) => setNewSubject({ ...newSubject, subject_id: e.target.value })}
                  required
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
                  Nom de la Matière:
                </label>
                <input
                  type="text"
                  value={newSubject.subject_name}
                  onChange={(e) => setNewSubject({ ...newSubject, subject_name: e.target.value })}
                  placeholder="ex: Anglais, Français"
                  required
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
                  Nombre d'heures:
                </label>
                <input
                  type="number"
                  value={newSubject.hours}
                  onChange={(e) => setNewSubject({ ...newSubject, hours: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Description:
                </label>
                <textarea
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  rows="3"
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

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubjectModal(false)
                    setModuleError(null)
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
                  disabled={moduleLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: moduleLoading ? '#cccccc' : '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: moduleLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {moduleLoading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Modules

