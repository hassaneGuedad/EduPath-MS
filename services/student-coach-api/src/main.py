from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import requests
from typing import Optional
from .database import (
    get_motivational_message, 
    save_coaching_session, 
    save_feedback,
    get_coaching_history,
    rate_recommendation
)
from .coaching_engine import (
    generate_motivational_message,
    generate_coaching_advice,
    generate_study_plan
)

load_dotenv()

app = FastAPI(title="Student Coach API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PORT = int(os.getenv('PORT', 3007))
PREPA_DATA_URL = os.getenv('PREPA_DATA_URL', 'http://localhost:3002')
STUDENT_PROFILER_URL = os.getenv('STUDENT_PROFILER_URL', 'http://localhost:3003')
PATH_PREDICTOR_URL = os.getenv('PATH_PREDICTOR_URL', 'http://localhost:3004')
RECO_BUILDER_URL = os.getenv('RECO_BUILDER_URL', 'http://localhost:3005')

class PredictionRequest(BaseModel):
    student_id: int
    module_id: str = None

class FeedbackRequest(BaseModel):
    feedback_text: str
    rating: Optional[int] = None

class RatingRequest(BaseModel):
    resource_name: str
    rating: int

@app.get("/")
async def root():
    return {"message": "Student Coach API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "StudentCoachAPI"}

@app.get("/student/{student_id}/progress")
async def get_student_progress(student_id: int):
    """Récupère la progression d'un étudiant"""
    try:
        # Récupérer les features
        response = requests.get(f'{PREPA_DATA_URL}/features/{student_id}', timeout=5)
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        features = response.json()['features']
        
        # Récupérer le profil
        profile_response = requests.get(f'{STUDENT_PROFILER_URL}/profile/{student_id}', timeout=5)
        profile = None
        if profile_response.status_code == 200:
            profile = profile_response.json()['profile']
        
        return {
            "status": "success",
            "student_id": student_id,
            "progress": {
                "average_score": features['average_score'],
                "total_modules": features['total_modules'],
                "engagement_level": features['engagement_level'],
                "performance_trend": features['performance_trend'],
                "total_time_spent": features['total_time_spent'],
                "profile": profile
            }
        }
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erreur de communication: {str(e)}")

@app.get("/student/{student_id}/recommendations")
async def get_student_recommendations(student_id: int, top_k: int = 5):
    """Récupère les recommandations pour un étudiant"""
    try:
        response = requests.get(f'{RECO_BUILDER_URL}/recommend/{student_id}?top_k={top_k}', timeout=10)
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Recommandations non disponibles")
        
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erreur de communication: {str(e)}")

@app.post("/student/{student_id}/predict")
async def predict_student_risk(student_id: int, request: PredictionRequest = None):
    """Prédit le risque d'échec pour un étudiant"""
    try:
        payload = {"student_id": student_id}
        if request and request.module_id:
            payload["module_id"] = request.module_id
        
        response = requests.post(f'{PATH_PREDICTOR_URL}/predict', json=payload, timeout=5)
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Prédiction non disponible")
        
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erreur de communication: {str(e)}")

@app.get("/student/{student_id}/dashboard")
async def get_student_dashboard(student_id: int):
    """Récupère toutes les données pour le dashboard étudiant"""
    try:
        # Récupérer progression
        progress_response = requests.get(f'{PREPA_DATA_URL}/features/{student_id}', timeout=5)
        if progress_response.status_code != 200:
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        features = progress_response.json()['features']
        
        # Récupérer profil
        profile_response = requests.get(f'{STUDENT_PROFILER_URL}/profile/{student_id}', timeout=5)
        profile = None
        if profile_response.status_code == 200:
            profile = profile_response.json()['profile']
        
        # Récupérer prédiction
        prediction_response = requests.post(
            f'{PATH_PREDICTOR_URL}/predict',
            json={'student_id': student_id},
            timeout=5
        )
        prediction = None
        if prediction_response.status_code == 200:
            prediction = prediction_response.json()['prediction']
        
        # Récupérer recommandations
        recommendations_response = requests.get(
            f'{RECO_BUILDER_URL}/recommend/{student_id}?top_k=3',
            timeout=10
        )
        recommendations = []
        if recommendations_response.status_code == 200:
            recommendations = recommendations_response.json()['recommendations']
        
        return {
            "status": "success",
            "student_id": student_id,
            "dashboard": {
                "progress": {
                    "average_score": features['average_score'],
                    "total_modules": features['total_modules'],
                    "engagement_level": features['engagement_level'],
                    "performance_trend": features['performance_trend'],
                    "total_time_spent": features['total_time_spent']
                },
                "profile": profile,
                "prediction": prediction,
                "recommendations": recommendations
            }
        }
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erreur de communication: {str(e)}")

@app.get("/student/{student_id}/motivational-message")
async def get_motivational_message_endpoint(student_id: int):
    """Génère un message motivant personnalisé pour l'étudiant"""
    try:
        # Récupérer les features
        response = requests.get(f'{PREPA_DATA_URL}/features/{student_id}', timeout=5)
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        features = response.json()['features']
        
        # Récupérer le profil
        profile_response = requests.get(f'{STUDENT_PROFILER_URL}/profile/{student_id}', timeout=5)
        profile = {'profile_name': 'Average Learner'}
        if profile_response.status_code == 200:
            profile = profile_response.json()['profile']
        
        # Générer le message
        message = generate_motivational_message(
            profile_type=profile['profile_name'],
            score=features['average_score'],
            trend=features['performance_trend'],
            engagement=features['engagement_level']
        )
        
        # Sauvegarder dans la base de données
        try:
            save_coaching_session(student_id, message, None)
        except Exception as db_error:
            print(f"Erreur DB (non bloquante): {db_error}")
        
        return {
            "status": "success",
            "student_id": student_id,
            "message": message,
            "profile": profile['profile_name'],
            "score": features['average_score']
        }
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erreur de communication: {str(e)}")

@app.get("/student/{student_id}/coaching-advice")
async def get_coaching_advice_endpoint(student_id: int):
    """Génère des conseils de coaching personnalisés"""
    try:
        # Récupérer les features
        response = requests.get(f'{PREPA_DATA_URL}/features/{student_id}', timeout=5)
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        features = response.json()['features']
        
        # Récupérer le profil
        profile_response = requests.get(f'{STUDENT_PROFILER_URL}/profile/{student_id}', timeout=5)
        profile = {'profile_name': 'Average Learner', 'cluster': 1}
        if profile_response.status_code == 200:
            profile = profile_response.json()['profile']
        
        # Générer les conseils
        advice_list = generate_coaching_advice(features, profile)
        
        # Préparer le texte pour sauvegarde
        advice_text = " | ".join([f"{a['title']}: {a['advice']}" for a in advice_list])
        
        # Sauvegarder dans la base de données
        try:
            save_coaching_session(student_id, None, advice_text)
        except Exception as db_error:
            print(f"Erreur DB (non bloquante): {db_error}")
        
        return {
            "status": "success",
            "student_id": student_id,
            "advice": advice_list,
            "count": len(advice_list)
        }
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erreur de communication: {str(e)}")

@app.get("/student/{student_id}/study-plan")
async def get_study_plan_endpoint(student_id: int):
    """Génère un plan d'étude personnalisé"""
    try:
        # Récupérer les features
        response = requests.get(f'{PREPA_DATA_URL}/features/{student_id}', timeout=5)
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        features = response.json()['features']
        
        # Générer le plan d'étude
        study_plan = generate_study_plan(features)
        
        return {
            "status": "success",
            "student_id": student_id,
            "study_plan": study_plan
        }
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erreur de communication: {str(e)}")

@app.post("/student/{student_id}/feedback")
async def submit_feedback(student_id: int, feedback: FeedbackRequest):
    """Enregistre le feedback d'un étudiant"""
    try:
        success = save_feedback(student_id, feedback.feedback_text, feedback.rating)
        
        if success:
            return {
                "status": "success",
                "message": "Feedback enregistré avec succès",
                "student_id": student_id
            }
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement du feedback")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.post("/student/{student_id}/rate-recommendation")
async def rate_recommendation_endpoint(student_id: int, rating_data: RatingRequest):
    """Évalue une recommandation"""
    try:
        if rating_data.rating < 1 or rating_data.rating > 5:
            raise HTTPException(status_code=400, detail="La note doit être entre 1 et 5")
        
        success = rate_recommendation(student_id, rating_data.resource_name, rating_data.rating)
        
        if success:
            return {
                "status": "success",
                "message": "Note enregistrée avec succès",
                "student_id": student_id,
                "resource_name": rating_data.resource_name,
                "rating": rating_data.rating
            }
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement de la note")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/student/{student_id}/coaching-history")
async def get_coaching_history_endpoint(student_id: int, limit: int = 10):
    """Récupère l'historique des sessions de coaching"""
    try:
        history = get_coaching_history(student_id, limit)
        
        return {
            "status": "success",
            "student_id": student_id,
            "history": history,
            "count": len(history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/student/{student_id}/complete-coaching")
async def get_complete_coaching(student_id: int):
    """Récupère toutes les données de coaching : message, conseils, plan d'étude"""
    try:
        # Récupérer les features
        response = requests.get(f'{PREPA_DATA_URL}/features/{student_id}', timeout=5)
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        features = response.json()['features']
        
        # Récupérer le profil
        profile_response = requests.get(f'{STUDENT_PROFILER_URL}/profile/{student_id}', timeout=5)
        profile = {'profile_name': 'Average Learner', 'cluster': 1}
        if profile_response.status_code == 200:
            profile = profile_response.json()['profile']
        
        # Générer message motivant
        motivational_message = generate_motivational_message(
            profile_type=profile['profile_name'],
            score=features['average_score'],
            trend=features['performance_trend'],
            engagement=features['engagement_level']
        )
        
        # Générer conseils
        advice_list = generate_coaching_advice(features, profile)
        
        # Générer plan d'étude
        study_plan = generate_study_plan(features)
        
        # Sauvegarder dans la base
        advice_text = " | ".join([f"{a['title']}: {a['advice']}" for a in advice_list])
        try:
            save_coaching_session(student_id, motivational_message, advice_text)
        except Exception as db_error:
            print(f"Erreur DB (non bloquante): {db_error}")
        
        return {
            "status": "success",
            "student_id": student_id,
            "coaching": {
                "motivational_message": motivational_message,
                "advice": advice_list,
                "study_plan": study_plan,
                "profile": profile
            }
        }
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erreur de communication: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)

