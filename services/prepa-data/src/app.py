from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv('PORT', 3002))

# Cache pour les données
data_cache = None

def get_dummy_data():
    """Crée des données factices pour les étudiants"""
    # Données de base (IDs 1-10)
    base_ids = [str(i) for i in range(1, 11)]
    base_scores = [75 + (i % 3) * 5 for i in range(10)]
    base_participation = [0.7 + (i % 3) * 0.1 for i in range(10)]
    base_time = [30 + (i % 3) * 10 for i in range(10)]
    base_assignments = [3 + (i % 2) for i in range(10)]
    base_quiz = [2 + (i % 2) for i in range(10)]
    base_access = [2 + (i % 4) for i in range(10)]
    
    # Données réelles pour les étudiants (12345, 12346, 12347, 12400-12403)
    # Étudiant 12345 (Mohamed Alami) → AT RISK (scores faibles)
    # Étudiant 12346 (Fatima Benali) → HIGH PERFORMER
    # Étudiant 12347 (Youssef Kadiri) → AVERAGE
    # Étudiant 12400 (Hassan Guedad) → AVERAGE
    # Étudiant 12401 (Ayoub Bouhdary) → AVERAGE
    # Étudiant 12402 (Student User) → AVERAGE
    # Étudiant 12403 (Mohssine Guedad) → AVERAGE
    real_ids = ['12345', '12346', '12347', '12400', '12401', '12402', '12403']
    real_scores = [37.67, 95.0, 70.0, 75.0, 72.0, 68.0, 77.0]  # Moyenne des quiz scores
    real_participation = [0.3, 0.95, 0.7, 0.65, 0.68, 0.62, 0.70]
    real_time = [11, 57.5, 36.5, 25.0, 28.0, 22.0, 30.0]
    real_assignments = [1, 9, 6, 5, 5, 4, 6]
    real_quiz = [3, 3, 3, 3, 3, 3, 3]
    real_access = [10, 1, 3, 4, 3, 5, 2]
    
    data = {
        'student_id': base_ids + real_ids,
        'score': base_scores + real_scores,
        'participation_rate': base_participation + real_participation,
        'time_spent_hours': base_time + real_time,
        'assignment_submitted': base_assignments + real_assignments,
        'quiz_attempts': base_quiz + real_quiz,
        'last_access_days_ago': base_access + real_access
    }
    return pd.DataFrame(data)

def load_data():
    """Charge les données"""
    global data_cache
    
    if data_cache is not None:
        return data_cache
    
    # Utiliser les données factices
    data_cache = get_dummy_data()
    return data_cache

def calculate_features(student_id, df):
    """Calcule les features pour un étudiant"""
    student_data = df[df['student_id'] == str(student_id)]
    
    if student_data.empty:
        return None
    
    # Conversion des types
    student_data = student_data.copy()
    numeric_cols = ['score', 'participation_rate', 'time_spent_hours', 
                    'assignment_submitted', 'quiz_attempts', 'last_access_days_ago']
    for col in numeric_cols:
        student_data[col] = pd.to_numeric(student_data[col], errors='coerce')
    
    avg_score = float(student_data['score'].mean())
    participation = float(student_data['participation_rate'].mean())
    last_access = float(student_data['last_access_days_ago'].mean())
    
    # Calcul du score de risque
    score_risk = max(0, 100 - avg_score)
    participation_risk = max(0, (1 - participation) * 50)
    access_risk = min(50, last_access * 5)
    risk_score = float((score_risk * 0.5 + participation_risk * 0.3 + access_risk * 0.2))
    
    # Déterminer le niveau d'engagement
    if participation >= 0.85:
        engagement_level = 'High'
    elif participation >= 0.70:
        engagement_level = 'Medium'
    else:
        engagement_level = 'Low'
    
    # Features agrégées
    features = {
        'student_id': int(student_id),
        'average_score': avg_score,
        'total_modules': int(len(student_data)),
        'average_participation': participation,
        'total_time_spent': float(student_data['time_spent_hours'].sum()),
        'average_time_per_module': float(student_data['time_spent_hours'].mean()),
        'total_assignments': int(student_data['assignment_submitted'].sum()),
        'total_quiz_attempts': int(student_data['quiz_attempts'].sum()),
        'average_last_access': last_access,
        'risk_score': risk_score,
        'engagement_level': engagement_level,
        'performance_trend': 'Stable'
    }
    
    return features

@app.route('/features/<int:student_id>', methods=['GET'])
def get_features(student_id):
    """Endpoint pour récupérer les features d'un étudiant"""
    try:
        df = load_data()
        features = calculate_features(student_id, df)
        
        if features is None:
            return jsonify({
                'error': f'Étudiant {student_id} non trouvé'
            }), 404
        
        return jsonify({
            'status': 'success',
            'student_id': student_id,
            'features': features
        })
    except Exception as e:
        print(f"Erreur: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Endpoint de santé"""
    return jsonify({
        'status': 'ok',
        'service': 'PrepaData'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=True)
