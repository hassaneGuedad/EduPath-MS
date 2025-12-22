"""
Module de connexion PostgreSQL pour PrepaData
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

# Configuration de la connexion
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://edupath:edupath123@postgres:5432/edupath_prepa')

# Pool de connexions
pool = None

def init_pool():
    """Initialise le pool de connexions"""
    global pool
    try:
        pool = SimpleConnectionPool(1, 20, DATABASE_URL)
        print('✅ Connected to PostgreSQL (PrepaData)')
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
                """)
                
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS session_data (
                        id SERIAL PRIMARY KEY,
                        student_id VARCHAR(50) NOT NULL,
                        session_date DATE NOT NULL,
                        time_spent INTEGER,
                        activities_completed INTEGER,
                        score DECIMAL(5,2),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS processing_logs (
                        id SERIAL PRIMARY KEY,
                        process_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        students_processed INTEGER,
                        status VARCHAR(50),
                        error_message TEXT
                    );
                """)
                
        print('✅ PrepaData database tables initialized')
    except Exception as e:
        print(f'❌ Error initializing tables: {e}')

def save_student_indicators(student_id, indicators):
    """Sauvegarde les indicateurs d'un étudiant"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO student_indicators 
                    (student_id, engagement_rate, success_rate, access_frequency, 
                     avg_time_spent, avg_score, participation_rate, risk_score, trend)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (student_id) 
                    DO UPDATE SET
                        engagement_rate = EXCLUDED.engagement_rate,
                        success_rate = EXCLUDED.success_rate,
                        access_frequency = EXCLUDED.access_frequency,
                        avg_time_spent = EXCLUDED.avg_time_spent,
                        avg_score = EXCLUDED.avg_score,
                        participation_rate = EXCLUDED.participation_rate,
                        risk_score = EXCLUDED.risk_score,
                        trend = EXCLUDED.trend,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING *;
                """, (
                    student_id,
                    indicators.get('engagement_rate'),
                    indicators.get('success_rate'),
                    indicators.get('access_frequency'),
                    indicators.get('avg_time_spent'),
                    indicators.get('avg_score'),
                    indicators.get('participation_rate'),
                    indicators.get('risk_score'),
                    indicators.get('trend')
                ))
                return cur.fetchone()
    except Exception as e:
        print(f'Error saving student indicators: {e}')
        return None

def save_processing_log(students_processed, status, error_message=None):
    """Sauvegarde un log de traitement"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO processing_logs (students_processed, status, error_message)
                    VALUES (%s, %s, %s)
                    RETURNING *;
                """, (students_processed, status, error_message))
                return cur.fetchone()
    except Exception as e:
        print(f'Error saving processing log: {e}')
        return None

# Initialiser le pool au chargement du module
init_pool()

