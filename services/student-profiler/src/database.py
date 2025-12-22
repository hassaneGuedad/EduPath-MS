"""
Module de connexion PostgreSQL pour StudentProfiler
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager
from dotenv import load_dotenv
import json

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://edupath:edupath123@postgres:5432/edupath_profiler')

pool = None

def init_pool():
    """Initialise le pool de connexions"""
    global pool
    try:
        pool = SimpleConnectionPool(1, 20, DATABASE_URL)
        print('✅ Connected to PostgreSQL (StudentProfiler)')
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
                """)
                
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS profile_statistics (
                        id SERIAL PRIMARY KEY,
                        profile_type VARCHAR(50) NOT NULL,
                        student_count INTEGER,
                        avg_engagement DECIMAL(5,2),
                        avg_success_rate DECIMAL(5,2),
                        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                
        print('✅ StudentProfiler database tables initialized')
    except Exception as e:
        print(f'❌ Error initializing tables: {e}')

def save_student_profile(student_id, profile_type, cluster_id, pca_components, confidence):
    """Sauvegarde le profil d'un étudiant"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO student_profiles 
                    (student_id, profile_type, cluster_id, pca_components, profile_confidence)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (student_id) 
                    DO UPDATE SET
                        profile_type = EXCLUDED.profile_type,
                        cluster_id = EXCLUDED.cluster_id,
                        pca_components = EXCLUDED.pca_components,
                        profile_confidence = EXCLUDED.profile_confidence,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING *;
                """, (student_id, profile_type, cluster_id, json.dumps(pca_components.tolist() if hasattr(pca_components, 'tolist') else pca_components), confidence))
                return cur.fetchone()
    except Exception as e:
        print(f'Error saving student profile: {e}')
        return None

def save_profile_statistics(profile_type, student_count, avg_engagement, avg_success_rate):
    """Sauvegarde les statistiques d'un profil"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO profile_statistics 
                    (profile_type, student_count, avg_engagement, avg_success_rate)
                    VALUES (%s, %s, %s, %s)
                    RETURNING *;
                """, (profile_type, student_count, avg_engagement, avg_success_rate))
                return cur.fetchone()
    except Exception as e:
        print(f'Error saving profile statistics: {e}')
        return None

init_pool()

