const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://edupath:edupath123@postgres:5432/edupath_lms',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL (LMS)');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialiser les tables si elles n'existent pas
async function initTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sync_logs (
        id SERIAL PRIMARY KEY,
        sync_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        records_synced INTEGER,
        error_message TEXT
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS raw_student_data (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        lms_source VARCHAR(50) NOT NULL,
        raw_data JSONB,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS raw_grades (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        module_id VARCHAR(50) NOT NULL,
        grade DECIMAL(5,2),
        max_grade DECIMAL(5,2),
        submission_date TIMESTAMP,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS raw_connections (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        connection_time TIMESTAMP NOT NULL,
        session_duration INTEGER,
        pages_visited INTEGER,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ LMS Database tables initialized');
  } catch (error) {
    console.error('❌ Error initializing tables:', error);
  }
}

// Sauvegarder un log de synchronisation
async function saveSyncLog(source, status, recordsSynced, errorMessage = null) {
  try {
    const result = await pool.query(
      'INSERT INTO sync_logs (source, status, records_synced, error_message) VALUES ($1, $2, $3, $4) RETURNING *',
      [source, status, recordsSynced, errorMessage]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving sync log:', error);
    return null;
  }
}

// Sauvegarder des données d'étudiant brutes
async function saveRawStudentData(studentId, lmsSource, rawData) {
  try {
    const result = await pool.query(
      'INSERT INTO raw_student_data (student_id, lms_source, raw_data) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *',
      [studentId, lmsSource, JSON.stringify(rawData)]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving raw student data:', error);
    return null;
  }
}

// Sauvegarder des notes
async function saveGrade(studentId, moduleId, grade, maxGrade, submissionDate) {
  try {
    const result = await pool.query(
      'INSERT INTO raw_grades (student_id, module_id, grade, max_grade, submission_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [studentId, moduleId, grade, maxGrade, submissionDate]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving grade:', error);
    return null;
  }
}

// Sauvegarder une connexion
async function saveConnection(studentId, connectionTime, sessionDuration, pagesVisited) {
  try {
    const result = await pool.query(
      'INSERT INTO raw_connections (student_id, connection_time, session_duration, pages_visited) VALUES ($1, $2, $3, $4) RETURNING *',
      [studentId, connectionTime, sessionDuration, pagesVisited]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving connection:', error);
    return null;
  }
}

module.exports = {
  pool,
  initTables,
  saveSyncLog,
  saveRawStudentData,
  saveGrade,
  saveConnection
};

