# PrepaData Microservice

## Description
Microservice Python/Flask pour le nettoyage, la normalisation et le calcul des features des étudiants à partir des données brutes LMS.

## Stack Technique
- **Runtime**: Python 3.11+
- **Framework**: Flask
- **Bibliothèques**: pandas, numpy

## Endpoints

### GET /features/{student_id}
Récupère les features calculées pour un étudiant spécifique.

**Exemple de requête:**
```
GET /features/1
```

**Réponse:**
```json
{
  "status": "success",
  "student_id": 1,
  "features": {
    "student_id": 1,
    "average_score": 75.0,
    "total_modules": 3,
    "average_participation": 0.83,
    "total_time_spent": 136.0,
    "average_time_per_module": 45.33,
    "total_assignments": 24,
    "total_quiz_attempts": 15,
    "average_last_access": 2.67,
    "risk_score": 25.5,
    "engagement_level": "Medium",
    "performance_trend": "Stable"
  }
}
```

### GET /health
Vérifie l'état du service.

## Installation

```bash
pip install -r requirements.txt
```

## Exécution

```bash
python src/app.py
```

## Variables d'environnement

```
PORT=3002
LMS_CONNECTOR_URL=http://localhost:3001
```

## Docker

```bash
docker build -t prepa-data .
docker run -p 3002:3002 prepa-data
```

