import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:3008'

function Modules() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState(null)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const response = await axios.get(`${API_BASE}/modules`)
      const modulesData = response.data
      
      // Charger les matières pour chaque module
      const modulesWithSubjects = await Promise.all(
        modulesData.map(async (module) => {
          try {
            const subjectsResponse = await axios.get(`${API_BASE}/subjects?module_id=${module.module_id}`)
            return { ...module, subjects: subjectsResponse.data }
          } catch (error) {
            return { ...module, subjects: [] }
          }
        })
      )
      
      setModules(modulesWithSubjects)
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '20px' }}>📚</div>
        <p style={{ fontSize: '18px', color: '#666' }}>Chargement des modules...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>📚 Tous les Modules</h1>
      
      {modules.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>📭</div>
          <p style={{ color: '#666', fontSize: '18px' }}>Aucun module disponible</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {modules.map((module) => (
            <div key={module.id} style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #667eea'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '22px' }}>
                    {module.module_name}
                  </h2>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span style={{ 
                      fontSize: '13px', 
                      color: '#667eea',
                      fontWeight: '600',
                      backgroundColor: '#f0f4ff',
                      padding: '4px 10px',
                      borderRadius: '12px'
                    }}>
                      📌 {module.module_id}
                    </span>
                    {module.category && (
                      <span style={{ fontSize: '13px', color: '#999' }}>🏷️ {module.category}</span>
                    )}
                    {module.credits > 0 && (
                      <span style={{ fontSize: '13px', color: '#999' }}>⭐ {module.credits} crédits</span>
                    )}
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: module.difficulty_level === 'Beginner' ? '#d4edda' : module.difficulty_level === 'Intermediate' ? '#fff3cd' : '#f8d7da',
                      color: module.difficulty_level === 'Beginner' ? '#155724' : module.difficulty_level === 'Intermediate' ? '#856404' : '#721c24'
                    }}>
                      {module.difficulty_level}
                    </span>
                  </div>
                  {module.description && (
                    <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                      {module.description}
                    </p>
                  )}
                </div>
              </div>
              
              {module.subjects && module.subjects.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#667eea',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '0',
                      marginBottom: expandedModule === module.id ? '15px' : '0'
                    }}
                  >
                    {expandedModule === module.id ? '▼' : '▶'} 
                    {module.subjects.length} matière{module.subjects.length > 1 ? 's' : ''}
                  </button>
                  
                  {expandedModule === module.id && (
                    <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                      {module.subjects.map((subject) => (
                        <div key={subject.id} style={{
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '6px',
                          borderLeft: '3px solid #667eea'
                        }}>
                          <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '15px' }}>
                            📖 {subject.subject_name}
                          </h4>
                          {subject.description && (
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '13px' }}>
                              {subject.description}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#999' }}>🆔 {subject.subject_id}</span>
                            {subject.hours > 0 && (
                              <span style={{ fontSize: '12px', color: '#999' }}>⏱️ {subject.hours}h</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Modules

