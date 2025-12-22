from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import os
from dotenv import load_dotenv
import requests
import joblib

load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv('PORT', 3003))
PREPA_DATA_URL = os.getenv('PREPA_DATA_URL', 'http://localhost:3002')

# Modèle et scaler globaux
model = None
scaler = None
pca = None
profiles_cache = {}
cluster_mapping = {}  # Mapping des clusters KMeans vers les profils finaux

def load_all_students_features():
    """Charge les features de tous les étudiants depuis PrepaData"""
    # Inclure les IDs dummy (1-10) ET les vrais étudiants (12345-12347, 12400-12403)
    student_ids = list(range(1, 11)) + [12345, 12346, 12347, 12400, 12401, 12402, 12403]
    all_features = []
    
    for student_id in student_ids:
        try:
            response = requests.get(f'{PREPA_DATA_URL}/features/{student_id}', timeout=5)
            if response.status_code == 200:
                data = response.json()
                features = data['features']
                features['student_id'] = student_id
                all_features.append(features)
        except Exception as e:
            print(f"Erreur lors de la récupération des features pour l'étudiant {student_id}: {e}")
    
    return pd.DataFrame(all_features)

def train_profiling_model():
    """Entraîne le modèle de profilage (KMeans + PCA)"""
    global model, scaler, pca, cluster_mapping
    
    print("Entraînement du modèle de profilage...")
    df = load_all_students_features()
    
    if df.empty:
        print("Aucune donnée disponible pour l'entraînement")
        return
    
    # Features pour le clustering
    feature_cols = [
        'average_score', 'average_participation', 'total_time_spent',
        'total_assignments', 'total_quiz_attempts', 'risk_score'
    ]
    
    X = df[feature_cols].values
    
    # Normalisation
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # PCA pour réduction de dimensionnalité
    pca = PCA(n_components=3)
    X_pca = pca.fit_transform(X_scaled)
    
    # KMeans clustering (3 profils)
    model = KMeans(n_clusters=3, random_state=42, n_init=10)
    model.fit(X_pca)
    
    # Stocker les profils
    df['profile_cluster'] = model.labels_
    
    # Identifier les clusters basés sur les scores ET le risque
    # Calculer un indicateur de performance : score élevé + risque faible = High Performer
    df['performance_indicator'] = df['average_score'] - (df['risk_score'] * 0.5)
    cluster_performance = df.groupby('profile_cluster')['performance_indicator'].mean()
    sorted_clusters = cluster_performance.sort_values(ascending=False)
    
    # Mapper les clusters : plus haut indicateur = High Performer (0), plus bas = At Risk (2)
    cluster_mapping = {
        sorted_clusters.index[0]: 0,  # Cluster avec le meilleur indicateur → High Performer
        sorted_clusters.index[1]: 1,  # Cluster avec indicateur moyen → Average Learner
        sorted_clusters.index[2]: 2   # Cluster avec le pire indicateur → At Risk
    }
    
    df['mapped_cluster'] = df['profile_cluster'].map(cluster_mapping)
    
    for idx, row in df.iterrows():
        student_id = int(row['student_id'])
        mapped_cluster = int(row['mapped_cluster'])
        profiles_cache[student_id] = {
            'cluster': mapped_cluster,
            'profile_name': get_profile_name(mapped_cluster)
        }
    
    print(f"Modèle entraîné avec {len(df)} étudiants, {len(set(model.labels_))} profils")
    print(f"Mapping clusters: {cluster_mapping}")
    print(f"Performance indicator par cluster: {cluster_performance.to_dict()}")

def get_profile_name(cluster_id):
    """Assigne un nom de profil basé sur le cluster"""
    profile_names = {
        0: 'High Performer',
        1: 'Average Learner',
        2: 'At Risk'
    }
    return profile_names.get(cluster_id, 'Unknown')

def predict_profile(student_id):
    """Prédit le profil d'un étudiant en utilisant des seuils fixes basés sur le score et le risque"""
    global model, scaler, pca, cluster_mapping
    
    # Récupérer les features de l'étudiant
    try:
        response = requests.get(f'{PREPA_DATA_URL}/features/{student_id}', timeout=5)
        if response.status_code != 200:
            print(f"Impossible de récupérer les features pour {student_id}, utilisation de données factices")
            # Données factices
            features = {
                'average_score': 70 + (student_id % 3) * 5,
                'average_participation': 0.7 + (student_id % 3) * 0.1,
                'total_time_spent': 30 + (student_id % 3) * 10,
                'total_assignments': 3,
                'total_quiz_attempts': 2,
                'risk_score': 25 + (student_id % 3) * 15
            }
        else:
            features = response.json()['features']
        
        # Utiliser des seuils fixes basés sur le score et le risque
        score = features['average_score']
        risk = features['risk_score']
        
        # Classification basée sur le score ET le risque
        if score >= 85 and risk < 20:
            cluster = 0  # High Performer
            profile_name = 'High Performer'
        elif score < 50 or risk > 40:
            cluster = 2  # At Risk
            profile_name = 'At Risk'
        else:
            cluster = 1  # Average Learner
            profile_name = 'Average Learner'
        
        result = {
            'cluster': cluster,
            'profile_name': profile_name
        }
        
        profiles_cache[student_id] = result
        return result
        
    except Exception as e:
        print(f"Erreur lors de la prédiction du profil: {e}")
        return None

@app.route('/profile/<int:student_id>', methods=['GET'])
def get_profile(student_id):
    """Endpoint pour récupérer le profil d'un étudiant"""
    try:
        profile = predict_profile(student_id)
        
        if profile is None:
            return jsonify({
                'error': f'Impossible de déterminer le profil pour l\'étudiant {student_id}'
            }), 404
        
        return jsonify({
            'status': 'success',
            'student_id': student_id,
            'profile': profile
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
        'service': 'StudentProfiler'
    })

# Initialiser le modèle au démarrage
if __name__ == '__main__':
    train_profiling_model()
    app.run(host='0.0.0.0', port=PORT, debug=True)

