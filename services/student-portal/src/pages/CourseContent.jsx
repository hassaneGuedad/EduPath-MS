import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './CourseContentSimple.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008'

// Composant pour afficher un bloc de code avec copie et thème
const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState('dark')
  
  const language = className ? className.replace('language-', '') : ''
  const code = String(children).replace(/\n$/, '')
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }
  
  return (
    <div className={`code-block-container theme-${theme}`}>
      <div className="code-block-header">
        <span className="code-language">{language || 'code'}</span>
        <div className="code-actions">
          <button onClick={toggleTheme} className="code-action-btn" title="Changer le thème">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={handleCopy} className="code-action-btn" title="Copier le code">
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </div>
      <pre className={`code-block-pre theme-${theme}`}>
        <code className={`code-block-code ${className || ''}`}>{children}</code>
      </pre>
    </div>
  )
}

export default function CourseContent() {
  const { resourceId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [scrollProgress, setScrollProgress] = useState(0)

  const paragraphsPerPage = 10

  useEffect(() => {
    fetchResource()
    if (user?.user_id && resourceId) {
      markAsViewed()
    }
  }, [resourceId])

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchResource = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/resources/${resourceId}`)
      setResource(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement de la ressource:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsViewed = async () => {
    try {
      await axios.post(`${API_BASE_URL}/resources/${resourceId}/view`, {
        student_id: user.user_id
      })
    } catch (error) {
      console.error('Erreur lors du marquage comme vu:', error)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner-container">
            <div className="spinner"></div>
            <div className="spinner spinner-overlay"></div>
          </div>
          <p style={{fontSize: '1.25rem', fontWeight: '500'}}>Chargement du cours...</p>
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!resource || !resource.content) {
    return (
      <div className="empty-state">
        <div className="empty-content">
          <div className="empty-icon">📚</div>
          <div className="empty-card">
            <h2 className="empty-title">Contenu non disponible</h2>
            <p className="empty-text">
              Ce cours ne contient pas encore de contenu détaillé. Revenez plus tard !
            </p>
            <button onClick={() => navigate('/resources')} className="empty-button">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour aux ressources
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Pagination basée sur le nombre de caractères au lieu des lignes
  const contentLength = resource.content.length
  const charsPerPage = 5000 // ~5000 caractères par page
  const totalPages = Math.ceil(contentLength / charsPerPage)
  
  const startIndex = (currentPage - 1) * charsPerPage
  const endIndex = Math.min(startIndex + charsPerPage, contentLength)
  const currentContent = resource.content.substring(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPagination = () => {
    const pages = []
    const maxVisible = 7
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`page-number ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      )
    }

    return (
      <div className="pagination">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          <svg className="arrow-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Précédent</span>
        </button>
        
        <div className="page-numbers">
          {pages}
        </div>
        
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          <span>Suivant</span>
          <svg className="arrow-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="course-content-container">
      <div className="course-header">
        <div className="header-content">
          <div className="header-controls">
            <button onClick={() => navigate('/resources')} className="back-button">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Retour</span>
            </button>
            
            <div style={{flex: 1, textAlign: 'center'}}>
              <h1 className="course-title">{resource.title}</h1>
              {resource.description && (
                <p className="course-description">{resource.description}</p>
              )}
            </div>
            
            <div className="page-indicator">
              📄 {currentPage} / {totalPages}
            </div>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${scrollProgress}%` }} />
        </div>
      </div>

      <div className="content-wrapper">
        <div className="module-card">
          <div className="module-grid">
            <div className="module-item">
              <div className="module-icon">📚</div>
              <div className="module-info">
                <div className="module-label">Module</div>
                <div className="module-value">{resource.module_id}</div>
              </div>
            </div>
            <div className="module-item">
              <div className="module-icon">📖</div>
              <div className="module-info">
                <div className="module-label">Type</div>
                <div className="module-value">{resource.type}</div>
              </div>
            </div>
            {resource.url && (
              <div className="module-item">
                <div className="module-icon">🔗</div>
                <div className="module-info">
                  <div className="module-label">Lien externe</div>
                  <div className="module-value">
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{color: '#667eea', textDecoration: 'none', fontWeight: 'bold'}}
                    >
                      Ouvrir →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="simple-content">
          <div className="markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="md-h1" {...props} />,
                h2: ({node, ...props}) => <h2 className="md-h2" {...props} />,
                h3: ({node, ...props}) => <h3 className="md-h3" {...props} />,
                h4: ({node, ...props}) => <h4 className="md-h4" {...props} />,
                p: ({node, ...props}) => <p className="md-paragraph" {...props} />,
                ul: ({node, ...props}) => <ul className="md-list" {...props} />,
                ol: ({node, ...props}) => <ol className="md-list-ordered" {...props} />,
                li: ({node, ...props}) => <li className="md-list-item" {...props} />,
                img: ({node, ...props}) => <img className="md-image" {...props} />,
                code: ({node, inline, className, children, ...props}) => 
                  inline ? 
                    <code className="md-code-inline" {...props}>{children}</code> : 
                    <CodeBlock className={className}>{children}</CodeBlock>,
                blockquote: ({node, ...props}) => <blockquote className="md-blockquote" {...props} />,
                table: ({node, ...props}) => <table className="md-table" {...props} />,
                a: ({node, ...props}) => <a className="md-link" {...props} target="_blank" rel="noopener noreferrer" />,
              }}
            >
              {currentContent}
            </ReactMarkdown>
          </div>
        </div>

        {totalPages > 1 && renderPagination()}
      </div>
    </div>
  )
}
