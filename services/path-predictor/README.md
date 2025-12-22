# PathPredictor Microservice

## Description
Microservice Python pour la prédiction du risque d'échec d'un étudiant sur un module en utilisant XGBoost.

## Stack Technique
- **Runtime**: Python 3.11+
- **Framework**: Flask
- **Bibliothèque ML**: XGBoost

## Endpoints

### POST /predict
Prédit le risque d'échec pour un étudiant sur un module.

**Exemple de requête:**
```json
{
  "student_id": 1,
  "module_id": "MATH101"
}
```

**Réponse:**
```json
{
  "status": "success",
  "student_id": 1,
  "module_id": "MATH101",
  "prediction": {
    "will_fail": false,
    "failure_probability": 0.25,
    "success_probability": 0.75,
    "risk_level": "Low"
  }
}
```

**Niveaux de risque:**
- `High`: Probabilité d'échec ≥ 70%
- `Medium`: Probabilité d'échec entre 40% et 70%
- `Low`: Probabilité d'échec < 40%

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
PORT=3004
PREPA_DATA_URL=http://localhost:3002
```

## Docker

```bash
docker build -t path-predictor .
docker run -p 3004:3004 path-predictor
```

## Modèle

Le service utilise XGBoost avec les features suivantes:
- `average_score`: Score moyen
- `average_participation`: Taux de participation moyen
- `total_time_spent`: Temps total passé
- `total_assignments`: Nombre total de devoirs
- `total_quiz_attempts`: Nombre total de tentatives de quiz
- `risk_score`: Score de risque calculé

