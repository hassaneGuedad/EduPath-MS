import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

DATABASE_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME', 'edupath_coaching'),
    'user': os.getenv('DB_USER', 'edupath'),
    'password': os.getenv('DB_PASSWORD', 'edupath2024')
}

@contextmanager
def get_db_connection():
    """Context manager pour la connexion à la base de données"""
    conn = None
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        yield conn
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

def get_motivational_message(profile_type: str, score: float):
    """Récupère un message motivant depuis la base de données"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # Déterminer la plage de score
            if score >= 85:
                score_range = 'high'
            elif score >= 50:
                score_range = 'medium'
            else:
                score_range = 'low'
            
            cursor.execute("""
                SELECT message FROM motivational_messages 
                WHERE profile_type = %s AND score_range = %s 
                ORDER BY RANDOM() 
                LIMIT 1
            """, (profile_type, score_range))
            
            result = cursor.fetchone()
            return result['message'] if result else "Continue ton excellent travail ! 💪"
    except Exception as e:
        print(f"Erreur lors de la récupération du message: {e}")
        return "Continue ton excellent travail ! 💪"

def save_coaching_session(student_id: int, message_sent: str, advice_given: str):
    """Enregistre une session de coaching"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO student_coaching_sessions 
                (student_id, message_sent, advice_given) 
                VALUES (%s, %s, %s)
                RETURNING id
            """, (student_id, message_sent, advice_given))
            
            session_id = cursor.fetchone()[0]
            return session_id
    except Exception as e:
        print(f"Erreur lors de l'enregistrement de la session: {e}")
        return None

def save_feedback(student_id: int, feedback_text: str, rating: int = None):
    """Enregistre le feedback d'un étudiant"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE student_coaching_sessions 
                SET student_feedback = %s, rating = %s 
                WHERE student_id = %s 
                ORDER BY session_date DESC 
                LIMIT 1
            """, (feedback_text, rating, student_id))
            
            return True
    except Exception as e:
        print(f"Erreur lors de l'enregistrement du feedback: {e}")
        return False

def get_coaching_history(student_id: int, limit: int = 10):
    """Récupère l'historique des sessions de coaching"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("""
                SELECT session_date, message_sent, advice_given, 
                       student_feedback, rating 
                FROM student_coaching_sessions 
                WHERE student_id = %s 
                ORDER BY session_date DESC 
                LIMIT %s
            """, (student_id, limit))
            
            return cursor.fetchall()
    except Exception as e:
        print(f"Erreur lors de la récupération de l'historique: {e}")
        return []

def rate_recommendation(student_id: int, resource_name: str, rating: int):
    """Enregistre l'évaluation d'une recommandation"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO recommendation_ratings 
                (student_id, resource_name, rating) 
                VALUES (%s, %s, %s)
                ON CONFLICT (student_id, resource_name) 
                DO UPDATE SET rating = %s, rated_at = NOW()
            """, (student_id, resource_name, rating, rating))
            
            return True
    except Exception as e:
        print(f"Erreur lors de l'enregistrement de la note: {e}")
        return False
