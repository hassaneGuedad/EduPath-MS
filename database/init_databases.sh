#!/bin/bash
set -e

# Script d'initialisation des bases de données PostgreSQL
# Ce script est exécuté automatiquement au démarrage du conteneur PostgreSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Base de données pour Auth Service (Ressources)
    SELECT 'CREATE DATABASE edupath_auth'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'edupath_auth')\gexec
    
    -- Base de données pour LMSConnector
    SELECT 'CREATE DATABASE edupath_lms'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'edupath_lms')\gexec
    
    -- Base de données pour PrepaData
    SELECT 'CREATE DATABASE edupath_prepa'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'edupath_prepa')\gexec
    
    -- Base de données pour StudentProfiler
    SELECT 'CREATE DATABASE edupath_profiler'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'edupath_profiler')\gexec
    
    -- Base de données pour PathPredictor
    SELECT 'CREATE DATABASE edupath_predictor'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'edupath_predictor')\gexec
    
    -- Base de données pour RecoBuilder
    SELECT 'CREATE DATABASE edupath_reco'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'edupath_reco')\gexec
    
    -- Base de données pour MLflow
    SELECT 'CREATE DATABASE mlflow_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mlflow_db')\gexec
    
    -- Base de données pour Airflow
    SELECT 'CREATE DATABASE airflow_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'airflow_db')\gexec
EOSQL

# Créer les tables pour chaque base de données

# Tables pour Auth Service (Ressources)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "edupath_auth" <<-EOSQL
    CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        resource_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        resource_type VARCHAR(50),
        subject_id VARCHAR(50),
        subject_name VARCHAR(100),
        difficulty_level VARCHAR(50),
        duration INTEGER,
        author VARCHAR(100),
        external_url VARCHAR(500),
        file_path VARCHAR(500),
        tags TEXT[],
        is_viewed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_resources_subject_id ON resources(subject_id);
    CREATE INDEX IF NOT EXISTS idx_resources_resource_id ON resources(resource_id);
    CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "edupath_lms" <<-EOSQL
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
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "edupath_prepa" <<-EOSQL
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
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "edupath_profiler" <<-EOSQL
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
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "edupath_predictor" <<-EOSQL
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
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "edupath_reco" <<-EOSQL
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
EOSQL

echo "✅ Toutes les bases de données ont été initialisées avec succès!"

