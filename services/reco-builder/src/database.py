"""
Module de connexion PostgreSQL et MinIO pour RecoBuilder
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager
from dotenv import load_dotenv
from minio import Minio
from minio.error import S3Error
import json

load_dotenv()

# Configuration PostgreSQL
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://edupath:edupath123@postgres:5432/edupath_reco')

# Configuration MinIO
MINIO_ENDPOINT = os.getenv('MINIO_ENDPOINT', 'minio:9000')
MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY', 'minioadmin123')
MINIO_BUCKET = os.getenv('MINIO_BUCKET', 'educational-resources')

pool = None
minio_client = None

def init_pool():
    """Initialise le pool de connexions PostgreSQL"""
    global pool
    try:
        pool = SimpleConnectionPool(1, 20, DATABASE_URL)
        print('✅ Connected to PostgreSQL (RecoBuilder)')
        init_tables()
    except Exception as e:
        print(f'❌ Error connecting to PostgreSQL: {e}')

def init_minio():
    """Initialise le client MinIO"""
    global minio_client
    try:
        minio_client = Minio(
            MINIO_ENDPOINT,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=False
        )
        
        # Créer le bucket s'il n'existe pas
        if not minio_client.bucket_exists(MINIO_BUCKET):
            minio_client.make_bucket(MINIO_BUCKET)
            print(f'✅ Created MinIO bucket: {MINIO_BUCKET}')
        else:
            print(f'✅ MinIO bucket exists: {MINIO_BUCKET}')
            
    except Exception as e:
        print(f'❌ Error initializing MinIO: {e}')

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
                """)
                
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS recommendations (
                        id SERIAL PRIMARY KEY,
                        student_id VARCHAR(50) NOT NULL,
                        resource_id VARCHAR(50) NOT NULL,
                        relevance_score DECIMAL(5,2),
                        reason TEXT,
                        recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        viewed BOOLEAN DEFAULT FALSE
                    );
                """)
                
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS recommendation_history (
                        id SERIAL PRIMARY KEY,
                        student_id VARCHAR(50) NOT NULL,
                        recommendation_count INTEGER,
                        avg_relevance DECIMAL(5,2),
                        period_start DATE,
                        period_end DATE
                    );
                """)
                
        print('✅ RecoBuilder database tables initialized')
    except Exception as e:
        print(f'❌ Error initializing tables: {e}')

def save_resource(resource_id, resource_name, resource_type, module_id, difficulty_level, description, tags, minio_path=None):
    """Sauvegarde une ressource"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO resources 
                    (resource_id, resource_name, resource_type, module_id, difficulty_level, description, tags, minio_path)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (resource_id) 
                    DO UPDATE SET
                        resource_name = EXCLUDED.resource_name,
                        resource_type = EXCLUDED.resource_type,
                        module_id = EXCLUDED.module_id,
                        difficulty_level = EXCLUDED.difficulty_level,
                        description = EXCLUDED.description,
                        tags = EXCLUDED.tags,
                        minio_path = EXCLUDED.minio_path
                    RETURNING *;
                """, (resource_id, resource_name, resource_type, module_id, difficulty_level, description, tags, minio_path))
                return cur.fetchone()
    except Exception as e:
        print(f'Error saving resource: {e}')
        return None

def save_recommendation(student_id, resource_id, relevance_score, reason):
    """Sauvegarde une recommandation"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO recommendations 
                    (student_id, resource_id, relevance_score, reason)
                    VALUES (%s, %s, %s, %s)
                    RETURNING *;
                """, (student_id, resource_id, relevance_score, reason))
                return cur.fetchone()
    except Exception as e:
        print(f'Error saving recommendation: {e}')
        return None

def upload_to_minio(file_path, object_name, content_type='application/octet-stream'):
    """Upload un fichier vers MinIO"""
    global minio_client
    if minio_client is None:
        init_minio()
    
    try:
        minio_client.fput_object(MINIO_BUCKET, object_name, file_path, content_type=content_type)
        url = f"http://{MINIO_ENDPOINT}/{MINIO_BUCKET}/{object_name}"
        print(f'✅ File uploaded to MinIO: {object_name}')
        return url
    except S3Error as e:
        print(f'❌ Error uploading to MinIO: {e}')
        return None

# Initialiser les connexions
init_pool()
init_minio()

