import React, { useState, useEffect } from 'react'
import axios from 'axios'

const AUTH_API = 'http://localhost:3008'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('') // État pour la recherche

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${AUTH_API}/users`)
      setUsers(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  // Filtrer les utilisateurs selon le terme de recherche
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      user.email?.toLowerCase().includes(term) ||
      user.full_name?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    )
  })

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>👥 Gestion des Utilisateurs</h1>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {/* Barre de recherche */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '600px' }}>
            <span style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
              color: '#666'
            }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom, email ou rôle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 15px 12px 50px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                outline: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: '#f8f9fa'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea'
                e.target.style.backgroundColor = 'white'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd'
                e.target.style.backgroundColor = '#f8f9fa'
              }}
            />
          </div>
          {searchTerm && (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              📊 {filteredUsers.length} résultat(s) trouvé(s) sur {users.length} utilisateur(s)
            </div>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>N°</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nom</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Rôle</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔍</div>
                  <p style={{ fontSize: '16px' }}>Aucun résultat trouvé</p>
                  <p style={{ fontSize: '14px' }}>Essayez un autre terme de recherche</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ 
                    padding: '12px', 
                    fontWeight: '700', 
                    color: '#667eea',
                    fontSize: '16px'
                  }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '12px', color: '#999', fontSize: '13px' }}>#{user.id}</td>
                  <td style={{ padding: '12px' }}>{user.full_name}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: user.role === 'admin' ? '#e74c3c' : user.role === 'teacher' ? '#3498db' : '#2ecc71',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {user.is_active ? '✅ Actif' : '❌ Inactif'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Users

