from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv('PORT', 3005))
PREPA_DATA_URL = os.getenv('PREPA_DATA_URL', 'http://localhost:3002')
PATH_PREDICTOR_URL = os.getenv('PATH_PREDICTOR_URL', 'http://localhost:3004')

# Données chargées en mémoire
resources_df = None


def load_resources():
    """Charge les ressources depuis le CSV"""
    global resources_df

    if resources_df is not None:
        return resources_df

    # Dans Docker, le volume est monté sur /app/data
    csv_path = '/app/data/resources.csv'
    if not os.path.exists(csv_path):
        # Fallback pour développement local
        csv_path = os.path.join(os.path.dirname(__file__), '../../data/resources.csv')

    resources_df = pd.read_csv(csv_path)
    return resources_df


def get_student_difficulties(student_id: int):
    """Récupère les difficultés d'un étudiant à partir de PrepaData et PathPredictor."""
    difficulties = []

    try:
        # Récupérer les features
        features_response = requests.get(f'{PREPA_DATA_URL}/features/{student_id}', timeout=5)
        if features_response.status_code != 200:
            return difficulties

        features = features_response.json()['features']

        # Analyse simple des difficultés
        if features.get('average_score', 0) < 60:
            difficulties.append('low_performance')
        if features.get('average_participation', 0) < 0.7:
            difficulties.append('low_engagement')
        if features.get('risk_score', 0) > 50:
            difficulties.append('high_risk')
        if features.get('total_time_spent', 0) < 30:
            difficulties.append('low_study_time')

        # Récupérer la prédiction de risque globale
        try:
            prediction_response = requests.post(
                f'{PATH_PREDICTOR_URL}/predict',
                json={'student_id': student_id},
                timeout=5
            )
            if prediction_response.status_code == 200:
                pred = prediction_response.json().get('prediction', {})
                if pred.get('risk_level') == 'High':
                    difficulties.append('very_high_risk')
        except Exception as e:
            print(f"Erreur lors de l'appel à PathPredictor: {e}")

    except Exception as e:
        print(f"Erreur lors de la récupération des difficultés: {e}")

    return difficulties


def score_resource(resource, difficulties):
    """
    Calcule un score de pertinence simple pour une ressource
    en fonction des difficultés de l'étudiant et des métadonnées de la ressource.
    """
    score = 0.0

    tags = resource.get('tags', '')
    tags_list = []
    if isinstance(tags, str):
        tags_list = [t.strip().lower() for t in tags.split(',') if t.strip()]

    difficulty_level = str(resource.get('difficulty_level', '')).lower()

    # Règles simples de scoring
    if 'low_performance' in difficulties:
        # Favoriser les ressources de niveau Beginner ou Intermediate
        if difficulty_level == 'beginner':
            score += 3
        elif difficulty_level == 'intermediate':
            score += 2

    if 'low_engagement' in difficulties:
        # Favoriser les vidéos et exercices interactifs
        if str(resource.get('resource_type', '')).lower() in ['video', 'exercise']:
            score += 3

    if 'high_risk' in difficulties or 'very_high_risk' in difficulties:
        # Favoriser toutes les ressources avec des tags orientés révision / basics
        if any(t in tags_list for t in ['basics', 'revision', 'remedial']):
            score += 2

    if 'low_study_time' in difficulties:
        # Favoriser les ressources supposées courtes (ex: vidéos basiques)
        if difficulty_level == 'beginner':
            score += 1

    # Petit bonus si la ressource est "Beginner"
    if difficulty_level == 'beginner':
        score += 0.5

    return float(score)


def recommend_resources(student_id: int, top_k: int = 5):
    """Génère des recommandations de ressources pour un étudiant (version légère, sans modèles lourds)."""
    resources = load_resources()
    if resources.empty:
        return []

    difficulties = get_student_difficulties(student_id)

    # Calculer un score pour chaque ressource
    scored = []
    for _, row in resources.iterrows():
        res_dict = row.to_dict()
        s = score_resource(res_dict, difficulties)
        if s > 0:
            res_dict['relevance_score'] = s
            scored.append(res_dict)

    if not scored:
        # Aucun score positif -> fournir un fallback générique (ex: top_k premiers)
        fallback = resources.head(top_k).copy()
        scored = []
        for _, row in fallback.iterrows():
            res_dict = row.to_dict()
            res_dict['relevance_score'] = 0.1  # score neutre
            scored.append(res_dict)
    else:
        # Trier par score décroissant
        scored.sort(key=lambda r: r.get('relevance_score', 0), reverse=True)
        scored = scored[: top_k]

    # Normaliser la forme de la réponse
    recommendations = []
    for r in scored:
        recommendations.append({
            'resource_id': r.get('resource_id'),
            'resource_name': r.get('resource_name'),
            'resource_type': r.get('resource_type'),
            'module_id': r.get('module_id'),
            'difficulty_level': r.get('difficulty_level'),
            'description': r.get('description'),
            'tags': r.get('tags').split(',') if isinstance(r.get('tags'), str) else [],
            'relevance_score': float(r.get('relevance_score', 0.0)),
        })

    return recommendations


@app.route('/recommend/<int:student_id>', methods=['GET'])
def get_recommendations(student_id):
    """Endpoint pour récupérer les recommandations d'un étudiant."""
    try:
        top_k = request.args.get('top_k', default=5, type=int)

        recommendations = recommend_resources(student_id, top_k)

        if not recommendations:
            return jsonify({
                'error': f"Aucune recommandation trouvée pour l'étudiant {student_id}"
            }), 404

        return jsonify({
            'status': 'success',
            'student_id': student_id,
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """Endpoint de santé."""
    return jsonify({
        'status': 'ok',
        'service': 'RecoBuilder'
    })


if __name__ == '__main__':
    # Pas de modèle lourd à initialiser, démarrage direct
    app.run(host='0.0.0.0', port=PORT, debug=True)

