const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

const { initTables, saveSyncLog, saveRawStudentData, saveGrade, saveConnection } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialiser la base de données au démarrage
initTables().catch(console.error);

// Fonction pour lire les données CSV simulées
const readCSVData = (filename) => {
  return new Promise((resolve, reject) => {
    const results = [];
    // Dans Docker, le volume est monté sur /app/data
    let filePath = path.join('/app/data', filename);
    // Fallback pour développement local
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, '../../data', filename);
    }
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Endpoint GET /sync - Synchronise les données depuis les fichiers CSV
app.get('/sync', async (req, res) => {
  let syncLog = null;
  try {
    console.log('Synchronisation des données LMS...');
    
    // Lire les données simulées
    const students = await readCSVData('students.csv');
    const modules = await readCSVData('modules.csv');
    const resources = await readCSVData('resources.csv');
    
    // Sauvegarder les données dans PostgreSQL
    const totalRecords = students.length + modules.length + resources.length;
    
    // Sauvegarder les étudiants
    for (const student of students) {
      await saveRawStudentData(student.student_id, 'CSV', student);
      
      // Sauvegarder les notes si disponibles
      if (student.score) {
        await saveGrade(
          student.student_id,
          student.module_id || 'M001',
          parseFloat(student.score),
          100,
          new Date()
        );
      }
    }
    
    // Sauvegarder le log de synchronisation
    syncLog = await saveSyncLog('CSV', 'success', totalRecords, null);
    
    // Simuler un délai de synchronisation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const syncResult = {
      status: 'success',
      timestamp: new Date().toISOString(),
      sync_log_id: syncLog?.id,
      data: {
        students: students.length,
        modules: modules.length,
        resources: resources.length,
        records: {
          students,
          modules,
          resources
        }
      }
    };
    
    console.log(`Synchronisation réussie: ${students.length} étudiants, ${modules.length} modules, ${resources.length} ressources`);
    
    res.json(syncResult);
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    
    // Sauvegarder le log d'erreur
    if (!syncLog) {
      await saveSyncLog('CSV', 'error', 0, error.message);
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la synchronisation des données',
      error: error.message
    });
  }
});

// Endpoint POST /students - Ajouter un nouvel étudiant
app.post('/students', async (req, res) => {
  try {
    const { student_id, email, firstName, lastName, class: studentClass } = req.body;
    
    // Validation des données requises
    if (!student_id || !email || !firstName || !lastName) {
      return res.status(400).json({ 
        message: 'Les champs suivants sont requis: student_id, email, firstName, lastName' 
      });
    }

    // Simplement retourner une réponse de succès
    // Dans une vraie application, on sauvegarderait dans la base de données
    res.status(201).json({ 
      message: 'Étudiant ajouté avec succès',
      student: {
        student_id,
        email,
        firstName,
        lastName,
        class: studentClass || '',
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'étudiant:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'ajout de l\'étudiant',
      error: error.message 
    });
  }
});

// Endpoint de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LMSConnector' });
});

app.listen(PORT, () => {
  console.log(`LMS Connector service running on port ${PORT}`);
});

