"""
Module de connexion PostgreSQL et MLflow pour PathPredictor
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager
from dotenv import load_dotenv
import mlflow
import mlflow.xgboost

load_dotenv()

# Configuration PostgreSQL
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://edupath:edupath123@postgres:5432/edupath_predictor')
MLFLOW_TRACKING_URI = os.getenv('MLFLOW_TRACKING_URI', 'http://mlflow:5000')

# Pool de connexions
pool = None

# Configuration MLflow
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)

def init_pool():
    """Initialise le pool de connexions"""
    global pool
    try:
        pool = SimpleConnectionPool(1, 20, DATABASE_URL)
        print('✅ Connected to PostgreSQL (PathPredictor)')
        print(f'✅ MLflow tracking URI: {MLFLOW_TRACKING_URI}')
        init_tables()
    except Exception as e:
        print(f'❌ Error connecting to PostgreSQL: {e}')

@contextmanager
def get_db_connection():
    """Context manager pour obtenir une connexion depuis le pool"""
    global pool
    if pool is None:
        init_pool()
    
    conn = pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        pool.putconn(conn)

def init_tables():
    """Initialise les tables si elles n'existent pas"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
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
                """)
                
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS model_history (
                        id SERIAL PRIMARY KEY,
                        model_name VARCHAR(100) NOT NULL,
                        model_version VARCHAR(50),
                        mlflow_run_id VARCHAR(100),
                        training_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metrics JSONB,
                        is_active BOOLEAN DEFAULT FALSE
                    );
                """)
                
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS alerts (
                        id SERIAL PRIMARY KEY,
                        student_id VARCHAR(50) NOT NULL,
                        alert_type VARCHAR(50) NOT NULL,
                        message TEXT,
                        severity VARCHAR(20),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        acknowledged BOOLEAN DEFAULT FALSE
                    );
                """)
                
        print('✅ PathPredictor database tables initialized')
    except Exception as e:
        print(f'❌ Error initializing tables: {e}')

def save_prediction(student_id, module_id, success_prob, failure_prob, risk_level, model_version):
    """Sauvegarde une prédiction"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO predictions 
                    (student_id, module_id, success_probability, failure_probability, risk_level, model_version)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING *;
                """, (student_id, module_id, success_prob, failure_prob, risk_level, model_version))
                return cur.fetchone()
    except Exception as e:
        print(f'Error saving prediction: {e}')
        return None

def save_model_history(model_name, model_version, mlflow_run_id, metrics, is_active=False):
    """Sauvegarde l'historique d'un modèle"""
    try:
        import json
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO model_history 
                    (model_name, model_version, mlflow_run_id, metrics, is_active)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING *;
                """, (model_name, model_version, mlflow_run_id, json.dumps(metrics), is_active))
                return cur.fetchone()
    except Exception as e:
        print(f'Error saving model history: {e}')
        return None

def create_alert(student_id, alert_type, message, severity='medium'):
    """Crée une alerte pour un étudiant"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO alerts (student_id, alert_type, message, severity)
                    VALUES (%s, %s, %s, %s)
                    RETURNING *;
                """, (student_id, alert_type, message, severity))
                return cur.fetchone()
    except Exception as e:
        print(f'Error creating alert: {e}')
        return None

# Initialiser le pool au chargement du module
init_pool()

