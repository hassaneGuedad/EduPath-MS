from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import xgboost as xgb
import os
from dotenv import load_dotenv
import requests
import joblib
from database import save_prediction, save_model_history, create_alert
import mlflow
import mlflow.xgboost

load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv('PORT', 3004))
PREPA_DATA_URL = os.getenv('PREPA_DATA_URL', 'http://localhost:3002')

# Modèle global
model = None

def create_training_data():
    """Crée des données d'entraînement simulées"""
    # Simuler des données historiques pour l'entraînement
    np.random.seed(42)
    
    n_samples = 100
    data = []
    
    for i in range(n_samples):
        # Features similaires à celles de PrepaData
        avg_score = np.random.uniform(30, 100)
        participation = np.random.uniform(0.3, 1.0)
        time_spent = np.random.uniform(15, 70)
        assignments = np.random.randint(2, 11)
        quiz_attempts = np.random.randint(1, 9)
        risk_score = np.random.uniform(0, 100)
        
        # Label: risque d'échec (1 = échec, 0 = succès)
        # Basé sur une combinaison des features
        failure_prob = (
            (100 - avg_score) * 0.4 +
            (1 - participation) * 100 * 0.3 +
            risk_score * 0.3
        ) / 100
        
        will_fail = 1 if failure_prob > 0.5 else 0
        
        data.append({
            'average_score': avg_score,
            'average_participation': participation,
            'total_time_spent': time_spent,
            'total_assignments': assignments,
            'total_quiz_attempts': quiz_attempts,
            'risk_score': risk_score,
            'will_fail': will_fail
        })
    
    return pd.DataFrame(data)

def train_model():
    """Entraîne le modèle XGBoost"""
    global model
    
    print("Entraînement du modèle XGBoost...")
    df = create_training_data()
    
    # Features
    feature_cols = [
        'average_score', 'average_participation', 'total_time_spent',
        'total_assignments', 'total_quiz_attempts', 'risk_score'
    ]
    
    X = df[feature_cols].values
    y = df['will_fail'].values
    
    # Entraînement XGBoost
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42
    )
    
    # Entraîner avec MLflow tracking
    with mlflow.start_run():
        model.fit(X, y)
        
        # Métriques
        accuracy = model.score(X, y)
        predictions = model.predict(X)
        
        # Enregistrer les métriques dans MLflow
        mlflow.log_metric("accuracy", accuracy)
        mlflow.log_metric("n_samples", len(df))
        mlflow.log_param("max_depth", 5)
        mlflow.log_param("learning_rate", 0.1)
        
        # Enregistrer le modèle
        mlflow.xgboost.log_model(model, "model")
        
        run_id = mlflow.active_run().info.run_id
        
        # Sauvegarder dans PostgreSQL
        save_model_history(
            "XGBoost Risk Predictor",
            "1.0",
            run_id,
            {"accuracy": accuracy, "n_samples": len(df)},
            is_active=True
        )
        
        print(f"Modèle entraîné avec {len(df)} échantillons")
        print(f"Précision: {accuracy:.2%}")
        print(f"MLflow Run ID: {run_id}")

def predict_failure(student_id, module_id=None):
    """Prédit le risque d'échec pour un étudiant"""
    global model
    
    if model is None:
        train_model()
    
    # Récupérer les features de l'étudiant
    try:
        response = requests.get(f'{PREPA_DATA_URL}/features/{student_id}', timeout=5)
        if response.status_code != 200:
            return None
        
        features = response.json()['features']
        
        # Préparer les features pour la prédiction
        feature_cols = [
            'average_score', 'average_participation', 'total_time_spent',
            'total_assignments', 'total_quiz_attempts', 'risk_score'
        ]
        
        X = np.array([[features[col] for col in feature_cols]])
        
        # Prédiction
        failure_prob = model.predict_proba(X)[0][1]  # Probabilité d'échec
        will_fail = model.predict(X)[0]
        
        return {
            'will_fail': bool(will_fail),
            'failure_probability': float(failure_prob),
            'success_probability': float(1 - failure_prob),
            'risk_level': get_risk_level(failure_prob)
        }
        
    except Exception as e:
        print(f"Erreur lors de la prédiction: {e}")
        return None

def get_risk_level(probability):
    """Détermine le niveau de risque"""
    if probability >= 0.7:
        return 'High'
    elif probability >= 0.4:
        return 'Medium'
    else:
        return 'Low'

@app.route('/predict', methods=['POST'])
def predict():
    """Endpoint pour prédire le risque d'échec"""
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        module_id = data.get('module_id')  # Optionnel
        
        if not student_id:
            return jsonify({
                'error': 'student_id est requis'
            }), 400
        
        prediction = predict_failure(student_id, module_id)
        
        if prediction is None:
            return jsonify({
                'error': f'Impossible de faire une prédiction pour l\'étudiant {student_id}'
            }), 404
        
        # Sauvegarder la prédiction dans PostgreSQL
        module_id = module_id or 'ALL'
        save_prediction(
            str(student_id),
            module_id,
            prediction['success_probability'],
            prediction['failure_probability'],
            prediction['risk_level'],
            '1.0'
        )
        
        # Créer une alerte si risque élevé
        if prediction['risk_level'] == 'High':
            create_alert(
                str(student_id),
                'high_risk',
                f'Étudiant à haut risque d\'échec (probabilité: {prediction["failure_probability"]:.2%})',
                'high'
            )
        
        return jsonify({
            'status': 'success',
            'student_id': student_id,
            'module_id': module_id,
            'prediction': prediction
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Endpoint de santé"""
    return jsonify({
        'status': 'ok',
        'service': 'PathPredictor'
    })

# Initialiser le modèle au démarrage
if __name__ == '__main__':
    train_model()
    app.run(host='0.0.0.0', port=PORT, debug=True)

