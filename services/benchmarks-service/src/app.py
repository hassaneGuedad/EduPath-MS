"""
Service de génération de benchmarks anonymisés pour publication
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
import json
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# Connexions aux bases de données
DATABASES = {
    'prepa': os.getenv('PREPA_DB_URL', 'postgresql://edupath:edupath123@postgres:5432/edupath_prepa'),
    'profiler': os.getenv('PROFILER_DB_URL', 'postgresql://edupath:edupath123@postgres:5432/edupath_profiler'),
    'predictor': os.getenv('PREDICTOR_DB_URL', 'postgresql://edupath:edupath123@postgres:5432/edupath_predictor'),
    'reco': os.getenv('RECO_DB_URL', 'postgresql://edupath:edupath123@postgres:5432/edupath_reco')
}

def anonymize_data(df):
    """Anonymise les données en supprimant les identifiants personnels"""
    if 'student_id' in df.columns:
        # Remplacer les IDs par des IDs anonymisés
        unique_ids = df['student_id'].unique()
        id_mapping = {old_id: f'STUDENT_{i+1:04d}' for i, old_id in enumerate(unique_ids)}
        df['student_id'] = df['student_id'].map(id_mapping)
    
    # Supprimer toute autre information personnelle
    columns_to_remove = ['email', 'name', 'full_name', 'first_name', 'last_name']
    for col in columns_to_remove:
        if col in df.columns:
            df = df.drop(columns=[col])
    
    return df

def get_benchmark_data():
    """Récupère et anonymise les données pour les benchmarks"""
    benchmarks = {}
    
    try:
        # Données de PrepaData
        conn = psycopg2.connect(DATABASES['prepa'])
        df_prepa = pd.read_sql_query(
            "SELECT * FROM student_indicators",
            conn
        )
        conn.close()
        
        if not df_prepa.empty:
            df_prepa = anonymize_data(df_prepa)
            benchmarks['student_indicators'] = {
                'count': len(df_prepa),
                'metrics': {
                    'avg_engagement_rate': float(df_prepa['engagement_rate'].mean()),
                    'avg_success_rate': float(df_prepa['success_rate'].mean()),
                    'avg_risk_score': float(df_prepa['risk_score'].mean())
                },
                'data': df_prepa.to_dict('records')
            }
    except Exception as e:
        print(f"Error fetching PrepaData: {e}")
    
    try:
        # Données de StudentProfiler
        conn = psycopg2.connect(DATABASES['profiler'])
        df_profiles = pd.read_sql_query(
            "SELECT profile_type, COUNT(*) as count FROM student_profiles GROUP BY profile_type",
            conn
        )
        conn.close()
        
        if not df_profiles.empty:
            benchmarks['profile_distribution'] = df_profiles.to_dict('records')
    except Exception as e:
        print(f"Error fetching StudentProfiler: {e}")
    
    try:
        # Données de PathPredictor
        conn = psycopg2.connect(DATABASES['predictor'])
        df_predictions = pd.read_sql_query(
            """
            SELECT 
                risk_level,
                COUNT(*) as count,
                AVG(success_probability) as avg_success_prob,
                AVG(failure_probability) as avg_failure_prob
            FROM predictions
            GROUP BY risk_level
            """,
            conn
        )
        conn.close()
        
        if not df_predictions.empty:
            benchmarks['prediction_statistics'] = df_predictions.to_dict('records')
    except Exception as e:
        print(f"Error fetching PathPredictor: {e}")
    
    return benchmarks

@app.route('/benchmarks', methods=['GET'])
def get_benchmarks():
    """Génère des benchmarks anonymisés"""
    try:
        format_type = request.args.get('format', 'json')  # json ou csv
        
        benchmarks = get_benchmark_data()
        benchmarks['metadata'] = {
            'generated_at': datetime.now().isoformat(),
            'version': '1.0',
            'anonymized': True
        }
        
        if format_type == 'csv':
            # Export CSV (simplifié)
            return jsonify({
                'message': 'CSV export not yet implemented',
                'data': benchmarks
            })
        
        return jsonify(benchmarks)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/benchmarks/export', methods=['GET'])
def export_benchmarks():
    """Exporte les benchmarks dans un format pour publication"""
    try:
        benchmarks = get_benchmark_data()
        
        # Format pour SoftwareX
        export_data = {
            'title': 'EduPath-MS Learning Analytics Benchmarks',
            'version': '1.0',
            'generated_at': datetime.now().isoformat(),
            'description': 'Anonymized learning analytics benchmarks from EduPath-MS platform',
            'datasets': benchmarks,
            'citation': 'EduPath-MS: Learning Analytics & Recommendations Platform',
            'license': 'CC-BY-4.0'
        }
        
        return jsonify(export_data)
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
        'service': 'BenchmarksService'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 3010)), debug=True)

