import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="main-title">EduPath</div>

      <div className="login-container">

        <div className="info-side">
          <h1>Bienvenue sur votre Portail Étudiant</h1>
          <p className="description">
            Accédez à vos cours, suivez votre progression et recevez des recommandations personnalisées pour réussir votre parcours académique.
          </p>

          <div className="features">
            <div className="feature-item">
              <div className="feature-icon">📚</div>
              <div>Accès complet aux ressources pédagogiques</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📈</div>
              <div>Suivi de progression en temps réel</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <div>Parcours d'apprentissage adaptatif</div>
            </div>
          </div>
        </div>

        <div className="form-side">
          <div className="login-card">
            <div className="login-header">
              <div className="brand">SP</div>
              <h2>Connexion</h2>
            </div>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email</label>
                <div className="input-group">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="étudiant@exemple.com" required />
                </div>
              </div>

              <div className="field">
                <label>Mot de passe</label>
                <div className="input-group">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input className="input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                  <button type="button" className="toggle-pass" onClick={() => setShowPassword(s => !s)}>
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>

              <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login
