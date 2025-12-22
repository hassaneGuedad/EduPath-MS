import { useState } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:3008'

function Settings() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validations
    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (oldPassword === newPassword) {
      setError('Le nouveau mot de passe doit être différent de l\'ancien')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_BASE}/auth/change-password`,
        {
          old_password: oldPassword,
          new_password: newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (error) {
      console.error('Erreur:', error)
      setError(error.response?.data?.detail || 'Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '10px' }}>⚙️ Paramètres</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Gérez les paramètres de votre compte
      </p>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
      }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>🔐 Changer le mot de passe</h2>
        
        {success && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb'
          }}>
            ✅ Mot de passe changé avec succès !
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Ancien mot de passe *
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Entrez votre ancien mot de passe"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Nouveau mot de passe *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Au moins 6 caractères"
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Minimum 6 caractères
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Confirmer le nouveau mot de passe *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Répétez le nouveau mot de passe"
            />
          </div>

          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <strong style={{ color: '#1976d2' }}>💡 Conseil:</strong>
            <ul style={{ margin: '8px 0 0 20px', color: '#555' }}>
              <li>Utilisez un mot de passe fort et unique</li>
              <li>Combinez lettres, chiffres et caractères spéciaux</li>
              <li>Ne réutilisez pas un ancien mot de passe</li>
            </ul>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.3s'
            }}
          >
            {loading ? '⏳ Changement en cours...' : '✓ Changer le mot de passe'}
          </button>
        </form>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>ℹ️ Informations</h3>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
          <strong>Email:</strong> {JSON.parse(localStorage.getItem('currentStudent') || '{}').email || 'Non disponible'}
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
          <strong>Rôle:</strong> Étudiant
        </p>
      </div>
    </div>
  )
}

export default Settings
