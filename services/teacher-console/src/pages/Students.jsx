import React, { useState, useEffect } from 'react'
import axios from 'axios'

const AUTH_API = 'http://localhost:3008'

function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createdStudent, setCreatedStudent] = useState(null)
  const [createdStudentsList, setCreatedStudentsList] = useState([]) // Liste des étudiants créés dans cette session
  const [editingStudent, setEditingStudent] = useState(null) // Étudiant en cours de modification
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null) // ID de l'étudiant à supprimer
  const [showImportModal, setShowImportModal] = useState(false) // Modal d'import CSV
  const [importResults, setImportResults] = useState(null) // Résultats de l'import
  const [searchTerm, setSearchTerm] = useState('') // Terme de recherche
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    student_id: '',
    send_email: false  // Nouvelle option pour envoyer l'email
  })

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${AUTH_API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const studentsList = response.data.filter(user => user.role === 'student')
      setStudents(studentsList)
    } catch (error) {
      console.error('Erreur chargement étudiants:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les étudiants selon le terme de recherche
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      student.email?.toLowerCase().includes(term) ||
      student.full_name?.toLowerCase().includes(term) ||
      student.student_id?.toString().includes(term)
    )
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email) {
      alert('Email obligatoire')
      return
    }

    if (!formData.email.includes('@')) {
      alert('Format d\'email invalide')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${AUTH_API}/auth/admin/create-student`,
        {
          email: formData.email,
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          student_id: formData.student_id ? parseInt(formData.student_id) : null,
          send_email: formData.send_email  // Envoyer l'option d'email
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setCreatedStudent(response.data)
      
      // Afficher un message si l'email a été envoyé
      if (response.data.email_sent) {
        alert(`✅ Compte créé et email envoyé à ${response.data.user.email}`)
      }
      
      // Ajouter à la liste des étudiants créés dans cette session
      setCreatedStudentsList(prev => [...prev, {
        email: response.data.user.email,
        full_name: response.data.user.full_name,
        temporary_password: response.data.temporary_password,
        created_at: new Date().toLocaleString('fr-FR'),
        email_sent: response.data.email_sent
      }])
      setFormData({ email: '', first_name: '', last_name: '', student_id: '', send_email: false })
      setShowCreateForm(false)
      loadStudents()
      
    } catch (error) {
      console.error('Erreur création étudiant:', error)
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la création'
      alert(`❌ ${errorMsg}`)
    }
  }

  const copyCredentials = () => {
    if (createdStudent) {
      const text = `Email: ${createdStudent.user.email}\nMot de passe: ${createdStudent.temporary_password}`
      navigator.clipboard.writeText(text)
      alert('✅ Identifiants copiés!')
    }
  }

  const exportToPDF = () => {
    if (createdStudentsList.length === 0) {
      alert('Aucun étudiant créé dans cette session')
      return
    }

    // Créer une fenêtre d'impression avec HTML formaté
    const printWindow = window.open('', '', 'width=800,height=600')
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Liste des Identifiants Étudiants</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            color: #27ae60;
            text-align: center;
            margin-bottom: 10px;
          }
          .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #27ae60;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #27ae60;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <h1>🎓 EduPath - Identifiants Étudiants</h1>
        <div class="subtitle">Liste des comptes créés le ${new Date().toLocaleDateString('fr-FR')}</div>
        
        <div class="warning">
          <strong>⚠️ CONFIDENTIEL:</strong> Ces identifiants doivent être remis directement aux étudiants concernés. 
          Les mots de passe sont temporaires et doivent être changés lors de la première connexion.
        </div>

        <table>
          <thead>
            <tr>
              <th>Nom Complet</th>
              <th>Email</th>
              <th>Mot de Passe Temporaire</th>
              <th>Date de Création</th>
            </tr>
          </thead>
          <tbody>
            ${createdStudentsList.map(student => `
              <tr>
                <td>${student.full_name || 'N/A'}</td>
                <td><strong>${student.email}</strong></td>
                <td><code style="background: #f5f5f5; padding: 4px 8px; border-radius: 3px; font-family: monospace;">${student.temporary_password}</code></td>
                <td>${student.created_at}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p><strong>Total:</strong> ${createdStudentsList.length} compte(s) créé(s)</p>
          <p>Document généré automatiquement par EduPath | ${new Date().toLocaleString('fr-FR')}</p>
          <p>Portail étudiant: http://localhost:3009</p>
        </div>
      </body>
      </html>
    `
    
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setFormData({
      email: student.email,
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      student_id: student.student_id || '',
      send_email: false
    })
    setShowCreateForm(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    
    if (!formData.email) {
      alert('Email obligatoire')
      return
    }

    if (!formData.email.includes('@emsi-edu.ma')) {
      alert('L\'email doit être au format: prenom.nom@emsi-edu.ma')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${AUTH_API}/users/${editingStudent.id}`,
        {
          email: formData.email,
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          student_id: formData.student_id ? parseInt(formData.student_id) : null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      alert('✅ Étudiant modifié avec succès')
      setFormData({ email: '', first_name: '', last_name: '', student_id: '', send_email: false })
      setEditingStudent(null)
      setShowCreateForm(false)
      loadStudents()
      
    } catch (error) {
      console.error('Erreur modification étudiant:', error)
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la modification'
      alert(`❌ ${errorMsg}`)
    }
  }

  const handleDelete = async (studentId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `${AUTH_API}/users/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      alert('✅ Étudiant supprimé avec succès')
      setShowDeleteConfirm(null)
      loadStudents()
      
    } catch (error) {
      console.error('Erreur suppression étudiant:', error)
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la suppression'
      alert(`❌ ${errorMsg}`)
    }
  }

  const cancelEdit = () => {
    setEditingStudent(null)
    setFormData({ email: '', first_name: '', last_name: '', student_id: '', send_email: false })
    setShowCreateForm(false)
  }

  const handleImportCSV = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${AUTH_API}/auth/admin/import-students`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setImportResults(response.data)
      
      // Ajouter les étudiants créés à la liste de session
      if (response.data.created_students && response.data.created_students.length > 0) {
        const newStudents = response.data.created_students.map(s => ({
          email: s.email,
          full_name: s.full_name,
          temporary_password: s.temporary_password,
          created_at: new Date().toLocaleString('fr-FR'),
          email_sent: false
        }))
        setCreatedStudentsList(prev => [...prev, ...newStudents])
      }

      setShowImportModal(true)
      loadStudents()
    } catch (error) {
      console.error('Erreur import:', error)
      alert(`❌ Erreur lors de l'import: ${error.response?.data?.detail || error.message}`)
    }

    // Reset input
    event.target.value = ''
  }

  const downloadExampleCSV = () => {
    const csvContent = `Email,Prénom,Nom,N° Étudiant
mohamed.alami@emsi-edu.ma,Mohamed,Alami,12345
fatima.benali@emsi-edu.ma,Fatima,Benali,12346
youssef.kadiri@emsi-edu.ma,Youssef,Kadiri,12347`
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'exemple_etudiants.csv'
    link.click()
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>📚 Gestion des Étudiants</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {createdStudentsList.length > 0 && (
            <button 
              onClick={exportToPDF}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📄 Exporter en PDF ({createdStudentsList.length})
            </button>
          )}
          <label style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 Import CSV
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleImportCSV}
              style={{ display: 'none' }}
            />
          </label>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '12px 24px',
              backgroundColor: showCreateForm ? '#6c757d' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {showCreateForm ? '✕ Annuler' : '➕ Créer un étudiant'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>
            {editingStudent ? '✏️ Modifier l\'étudiant' : '✏️ Nouveau compte étudiant'}
          </h2>
          <form onSubmit={editingStudent ? handleUpdate : handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email de l'école *</label>
              <input
                type="email"
                placeholder="prenom.nom@emsi-edu.ma"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #ddd', fontSize: '14px' }}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>Format: prenom.nom@emsi-edu.ma</small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Prénom</label>
                <input
                  type="text"
                  placeholder="Prénom"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #ddd', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Nom</label>
                <input
                  type="text"
                  placeholder="Nom"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #ddd', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Numéro étudiant (optionnel)</label>
              <input
                type="number"
                placeholder="Ex: 202312345"
                value={formData.student_id}
                onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #ddd', fontSize: '14px' }}
              />
            </div>

            {!editingStudent && (
              <>
                <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                  <strong style={{ color: '#1976d2' }}>ℹ️ Information:</strong>
                  <p style={{ margin: '8px 0 0 0', color: '#555' }}>
                    Un mot de passe aléatoire sera généré automatiquement. Vous devrez le communiquer à l'étudiant qui devra le changer à sa première connexion.
                  </p>
                </div>

                <div style={{ marginBottom: '20px', backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffc107' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: '600', color: '#856404' }}>
                    <input
                      type="checkbox"
                      checked={formData.send_email}
                      onChange={(e) => setFormData({...formData, send_email: e.target.checked})}
                      style={{ width: '20px', height: '20px', marginRight: '10px', cursor: 'pointer' }}
                    />
                    <span>📧 Envoyer les identifiants par email à l'étudiant</span>
                  </label>
                  <p style={{ margin: '10px 0 0 30px', fontSize: '13px', color: '#856404' }}>
                    Si activé, l'étudiant recevra un email automatique avec ses identifiants de connexion à l'adresse fournie ci-dessus.
                  </p>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="submit"
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#43e97b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  flex: 1
                }}
              >
                {editingStudent ? '💾 Enregistrer les modifications' : '🔐 Créer le compte'}
              </button>
              {editingStudent && (
                <button 
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  ✕ Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {createdStudent && (
        <div style={{ backgroundColor: '#d4edda', padding: '30px', borderRadius: '12px', marginBottom: '30px', border: '2px solid #28a745' }}>
          <h2 style={{ color: '#155724', marginBottom: '20px' }}>✅ Compte créé avec succès !</h2>
          
          {createdStudent.email_sent && (
            <div style={{ backgroundColor: '#cfe2ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #0d6efd' }}>
              <strong style={{ color: '#084298' }}>📧 Email envoyé !</strong>
              <p style={{ margin: '5px 0 0 0', color: '#084298', fontSize: '14px' }}>
                Les identifiants ont été envoyés automatiquement à <strong>{createdStudent.user.email}</strong>
              </p>
            </div>
          )}
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Email:</strong>
              <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', marginTop: '5px', fontFamily: 'monospace' }}>
                {createdStudent.user.email}
              </div>
            </div>
            <div>
              <strong>Mot de passe temporaire:</strong>
              <div style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px', marginTop: '5px', fontFamily: 'monospace', color: '#856404', fontSize: '18px', fontWeight: '600' }}>
                {createdStudent.temporary_password}
              </div>
            </div>
          </div>
          <button 
            onClick={copyCredentials}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            📋 Copier les identifiants
          </button>
          <button 
            onClick={() => setCreatedStudent(null)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Fermer
          </button>
          <p style={{ marginTop: '15px', color: '#856404', fontSize: '14px' }}>
            ⚠️ <strong>Important:</strong> Communiquez ces identifiants à l'étudiant. Il devra changer son mot de passe à la première connexion.
          </p>
        </div>
      )}

      {createdStudentsList.length > 0 && (
        <div style={{ backgroundColor: '#fff3cd', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '2px solid #ffc107' }}>
          <h2 style={{ color: '#856404', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📋 Comptes créés dans cette session ({createdStudentsList.length})
          </h2>
          <p style={{ color: '#856404', marginBottom: '20px', fontSize: '14px' }}>
            Ces comptes ont été créés pendant votre session actuelle. Utilisez le bouton "Exporter en PDF" ci-dessus pour générer un document avec tous les identifiants.
          </p>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#ffc107' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#856404', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#856404', fontWeight: '600' }}>Nom</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#856404', fontWeight: '600' }}>Mot de passe temporaire</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#856404', fontWeight: '600' }}>Créé le</th>
                </tr>
              </thead>
              <tbody>
                {createdStudentsList.map((student, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '14px' }}>{student.email}</td>
                    <td style={{ padding: '12px' }}>{student.full_name || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <code style={{ backgroundColor: '#f8f9fa', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: '600', color: '#dc3545' }}>
                        {student.temporary_password}
                      </code>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{student.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>👥 Liste des étudiants ({students.length})</h2>
          <button 
            onClick={loadStudents}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f8f9fa',
              border: '2px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🔄 Actualiser
          </button>
        </div>

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
              placeholder="Rechercher par nom, email ou N° étudiant..."
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
              📊 {filteredStudents.length} résultat(s) trouvé(s)
            </div>
          )}
        </div>

        {filteredStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>
              {searchTerm ? '🔍' : '📭'}
            </div>
            <p style={{ fontSize: '18px' }}>
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucun étudiant inscrit'}
            </p>
            <p>
              {searchTerm ? 'Essayez un autre terme de recherche' : 'Créez le premier compte étudiant ci-dessus'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>N°</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Nom complet</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>N° Étudiant</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Statut</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date d'inscription</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ 
                      padding: '12px', 
                      fontWeight: '700', 
                      color: '#667eea',
                      fontSize: '16px'
                    }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '12px', color: '#999', fontSize: '13px' }}>#{student.id}</td>
                    <td style={{ padding: '12px' }}>{student.email}</td>
                    <td style={{ padding: '12px' }}>{student.full_name || '-'}</td>
                    <td style={{ padding: '12px' }}>{student.student_id || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: student.is_active ? '#d4edda' : '#f8d7da',
                        color: student.is_active ? '#155724' : '#721c24'
                      }}>
                        {student.is_active ? '✓ Actif' : '✕ Inactif'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{new Date(student.created_at).toLocaleDateString('fr-FR')}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleEdit(student)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ffc107',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          marginRight: '8px'
                        }}
                        title="Modifier l'étudiant"
                      >
                        ✏️ Modifier
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(student.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                        title="Supprimer l'étudiant"
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
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
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>⚠️ Confirmer la suppression</h2>
            <p style={{ fontSize: '16px', color: '#333', marginBottom: '25px' }}>
              Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est <strong>irréversible</strong> et toutes les données associées seront définitivement perdues.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                ✕ Annuler
              </button>
              <button 
                onClick={() => handleDelete(showDeleteConfirm)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                🗑️ Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de résultats d'import */}
      {showImportModal && importResults && (
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
          zIndex: 1000,
          overflow: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '900px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ color: '#28a745', marginBottom: '20px' }}>📊 Résultats de l'import</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#1976d2' }}>{importResults.total_lines}</div>
                <div style={{ fontSize: '14px', color: '#555' }}>Lignes traitées</div>
              </div>
              <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#28a745' }}>{importResults.created_count}</div>
                <div style={{ fontSize: '14px', color: '#555' }}>Comptes créés</div>
              </div>
              <div style={{ backgroundColor: '#f8d7da', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc3545' }}>{importResults.error_count}</div>
                <div style={{ fontSize: '14px', color: '#555' }}>Erreurs</div>
              </div>
            </div>

            {importResults.errors && importResults.errors.length > 0 && (
              <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ color: '#856404', marginBottom: '10px' }}>⚠️ Erreurs détectées</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#856404' }}>
                  {importResults.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {importResults.created_students && importResults.created_students.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>✅ Comptes créés ({importResults.created_students.length})</h3>
                <div style={{ maxHeight: '300px', overflow: 'auto', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                  <table style={{ width: '100%', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Nom</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Mot de passe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResults.created_students.map((student, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '8px', fontFamily: 'monospace' }}>{student.email}</td>
                          <td style={{ padding: '8px' }}>{student.full_name}</td>
                          <td style={{ padding: '8px' }}>
                            <code style={{ backgroundColor: '#fff', padding: '4px 8px', borderRadius: '4px', color: '#dc3545', fontWeight: '600' }}>
                              {student.temporary_password}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={{ marginTop: '15px', fontSize: '14px', color: '#856404' }}>
                  💡 <strong>Astuce :</strong> Utilisez le bouton "Exporter en PDF" pour obtenir un document avec tous les identifiants.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowImportModal(false)
                  setImportResults(null)
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                ✓ Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Students

