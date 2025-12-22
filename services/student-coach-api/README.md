# StudentCoach API (FastAPI)

## Description
API FastAPI complète pour l'application mobile StudentCoach, fournissant des endpoints pour la progression, les recommandations, les prédictions, **les messages motivants, le coaching personnalisé et le feedback interactif**.

## Stack Technique
- **Runtime**: Python 3.11+
- **Framework**: FastAPI
- **ASGI Server**: Uvicorn
- **Base de données**: PostgreSQL
- **ORM**: psycopg2

## Nouvelles Fonctionnalités ✨

### 🎯 Messages Motivants
Messages personnalisés basés sur le profil ML, le score et la tendance de l'étudiant.

### 💪 Coaching Personnalisé
Conseils actionnables et plan d'étude adapté au niveau de chaque étudiant.

### 📊 Feedback Interactif
Système de feedback bidirectionnel pour améliorer continuellement le coaching.

### 💾 Base de Données PostgreSQL
Stockage persistant des sessions de coaching, messages, feedbacks et évaluations.

## Endpoints

### Endpoints Existants

#### GET /student/{student_id}/progress
Récupère la progression d'un étudiant.

**Réponse:**
```json
{
  "status": "success",
  "student_id": 1,
  "progress": {
    "average_score": 75.0,
    "total_modules": 3,
    "engagement_level": "Medium",
    "performance_trend": "Stable",
    "total_time_spent": 136.0,
    "profile": {
      "cluster": 1,
      "profile_name": "Average Learner"
    }
  }
}
```

### GET /student/{student_id}/recommendations
Récupère les recommandations pour un étudiant.

**Paramètres:**
- `top_k` (query): Nombre de recommandations (défaut: 5)

### POST /student/{student_id}/predict
Prédit le risque d'échec pour un étudiant.

### GET /student/{student_id}/dashboard
Récupère toutes les données pour le dashboard étudiant (progression, profil, prédiction, recommandations).

### 🆕 Nouveaux Endpoints de Coaching

#### GET /student/{student_id}/motivational-message
Génère un message motivant personnalisé basé sur le profil, score et tendance de l'étudiant.

**Réponse:**
```json
{
  "status": "success",
  "student_id": 1,
  "message": "🚀 Super progression ! Continue, tu es sur une excellente trajectoire !",
  "profile": "Average Learner",
  "score": 75.0
}
```

#### GET /student/{student_id}/coaching-advice
Génère des conseils de coaching personnalisés avec actions concrètes.

**Réponse:**
```json
{
  "status": "success",
  "student_id": 1,
  "advice": [
    {
      "type": "warning",
      "icon": "⚠️",
      "title": "Score à améliorer",
      "advice": "Tu peux faire mieux ! Identifie tes points faibles...",
      "action": "Révise 30 minutes par jour sur tes points faibles"
    }
  ],
  "count": 3
}
```

#### GET /student/{student_id}/study-plan
Génère un plan d'étude personnalisé adapté au niveau de l'étudiant.

**Réponse:**
```json
{
  "status": "success",
  "student_id": 1,
  "study_plan": {
    "duration_per_day": 60,
    "weekly_sessions": 5,
    "priorities": ["Consolidation des acquis", "Pratique régulière"],
    "suggested_schedule": [...]
  }
}
```

#### POST /student/{student_id}/feedback
Enregistre le feedback de l'étudiant sur le coaching reçu.

**Body:**
```json
{
  "feedback_text": "Les conseils m'ont beaucoup aidé !",
  "rating": 5
}
```

#### POST /student/{student_id}/rate-recommendation
Évalue une recommandation de ressource.

**Body:**
```json
{
  "resource_name": "Tutoriel Python Basics",
  "rating": 4
}
```

#### GET /student/{student_id}/coaching-history
Récupère l'historique des sessions de coaching.

**Paramètres:**
- `limit` (query): Nombre de sessions (défaut: 10)

#### GET /student/{student_id}/complete-coaching
Récupère tout le coaching complet : message + conseils + plan d'étude.

### GET /health
Vérifie l'état du service.

## Installation

```bash
# Installer les dépendances
pip install -r requirements.txt

# Initialiser la base de données PostgreSQL
psql -U edupath -d postgres -c "CREATE DATABASE edupath_coaching;"
psql -U edupath -d edupath_coaching -f ../../database/init_coaching.sql

# Copier le fichier d'environnement
cp .env.example .env

# Modifier les variables d'environnement si nécessaire
nano .env
```

## Exécution

```bash
uvicorn src.main:app --host 0.0.0.0 --port 3007 --reload
```

## Variables d'environnement

```env
PORT=3007
PREPA_DATA_URL=http://localhost:3002
STUDENT_PROFILER_URL=http://localhost:3003
PATH_PREDICTOR_URL=http://localhost:3004
RECO_BUILDER_URL=http://localhost:3005

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=edupath_coaching
DB_USER=edupath
DB_PASSWORD=edupath2024
```

## Docker

```bash
docker build -t student-coach-api .
docker run -p 3007:3007 student-coach-api
```

## Documentation API

Une fois le service démarré, accéder à:
- Swagger UI: http://localhost:3007/docs
- ReDoc: http://localhost:3007/redoc

