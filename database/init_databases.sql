-- Script d'initialisation des bases de données pour tous les microservices

-- Base de données pour LMSConnector
SELECT 'CREATE DATABASE edupath_lms'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'edupath_lms')\gexec

CREATE TABLE IF NOT EXISTS sync_logs (
    id SERIAL PRIMARY KEY,
    sync_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    records_synced INTEGER,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS raw_student_data (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    lms_source VARCHAR(50) NOT NULL,
    raw_data JSONB,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_grades (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    module_id VARCHAR(50) NOT NULL,
    grade DECIMAL(5,2),
    max_grade DECIMAL(5,2),
    submission_date TIMESTAMP,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_connections (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    connection_time TIMESTAMP NOT NULL,
    session_duration INTEGER,
    pages_visited INTEGER,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Base de données pour PrepaData
CREATE DATABASE IF NOT EXISTS edupath_prepa;
\c edupath_prepa;

CREATE TABLE IF NOT EXISTS student_indicators (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    engagement_rate DECIMAL(5,2),
    success_rate DECIMAL(5,2),
    access_frequency DECIMAL(5,2),
    avg_time_spent DECIMAL(10,2),
    avg_score DECIMAL(5,2),
    participation_rate DECIMAL(5,2),
    risk_score DECIMAL(5,2),
    trend VARCHAR(20),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session_data (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    session_date DATE NOT NULL,
    time_spent INTEGER,
    activities_completed INTEGER,
    score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS processing_logs (
    id SERIAL PRIMARY KEY,
    process_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    students_processed INTEGER,
    status VARCHAR(50),
    error_message TEXT
);

-- Base de données pour StudentProfiler
CREATE DATABASE IF NOT EXISTS edupath_profiler;
\c edupath_profiler;

CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    profile_type VARCHAR(50) NOT NULL,
    cluster_id INTEGER,
    pca_components JSONB,
    profile_confidence DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profile_statistics (
    id SERIAL PRIMARY KEY,
    profile_type VARCHAR(50) NOT NULL,
    student_count INTEGER,
    avg_engagement DECIMAL(5,2),
    avg_success_rate DECIMAL(5,2),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Base de données pour PathPredictor
CREATE DATABASE IF NOT EXISTS edupath_predictor;
\c edupath_predictor;

CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    module_id VARCHAR(50) NOT NULL,
    success_probability DECIMAL(5,2),
    failure_probability DECIMAL(5,2),
    risk_level VARCHAR(20),
    model_version VARCHAR(50),
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_history (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    mlflow_run_id VARCHAR(100),
    training_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metrics JSONB,
    is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    message TEXT,
    severity VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN DEFAULT FALSE
);

-- Base de données pour RecoBuilder
CREATE DATABASE IF NOT EXISTS edupath_reco;
\c edupath_reco;

CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    resource_id VARCHAR(50) NOT NULL UNIQUE,
    resource_name VARCHAR(200) NOT NULL,
    resource_type VARCHAR(50),
    module_id VARCHAR(50),
    difficulty_level VARCHAR(20),
    description TEXT,
    tags TEXT[],
    minio_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50) NOT NULL,
    relevance_score DECIMAL(5,2),
    reason TEXT,
    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    viewed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS recommendation_history (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    recommendation_count INTEGER,
    avg_relevance DECIMAL(5,2),
    period_start DATE,
    period_end DATE
);

-- Base de données pour MLflow
CREATE DATABASE IF NOT EXISTS mlflow_db;
\c mlflow_db;

-- MLflow créera ses propres tables automatiquement

-- Base de données pour Airflow
CREATE DATABASE IF NOT EXISTS airflow_db;
\c airflow_db;

-- Airflow créera ses propres tables automatiquement

-- Base de données pour Module Management
CREATE DATABASE IF NOT EXISTS edupath_modules;
\c edupath_modules;

CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL UNIQUE,
    module_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    credits INTEGER,
    difficulty_level VARCHAR(50),
    prerequisites TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    subject_id VARCHAR(50) NOT NULL UNIQUE,
    subject_name VARCHAR(200) NOT NULL,
    module_id VARCHAR(50) NOT NULL,
    description TEXT,
    hours INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    resource_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL,
    subject_id VARCHAR(50),
    difficulty_level VARCHAR(50),
    duration INTEGER,
    author VARCHAR(200),
    file_path VARCHAR(500),
    external_url VARCHAR(500),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE SET NULL
);

-- Retour à la base principale
\c edupath_db;

