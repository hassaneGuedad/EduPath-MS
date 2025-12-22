# StudentProfiler Microservice

## Description
Microservice Python pour le regroupement des étudiants par profil d'apprentissage en utilisant KMeans clustering et PCA.

## Stack Technique
- **Runtime**: Python 3.11+
- **Framework**: Flask
- **Bibliothèques ML**: scikit-learn (KMeans, PCA)

## Endpoints

### GET /profile/{student_id}
Récupère le profil d'apprentissage d'un étudiant.

**Exemple de requête:**
```
GET /profile/1
```

**Réponse:**
```json
{
  "status": "success",
  "student_id": 1,
  "profile": {
    "cluster": 1,
    "profile_name": "Average Learner"
  }
}
```

**Profils possibles:**
- `High Performer`: Étudiants avec de hautes performances
- `Average Learner`: Étudiants avec des performances moyennes
- `At Risk`: Étudiants à risque d'échec

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
PORT=3003
PREPA_DATA_URL=http://localhost:3002
```

## Docker

```bash
docker build -t student-profiler .
docker run -p 3003:3003 student-profiler
```

## Algorithme

Le service utilise:
1. **StandardScaler**: Normalisation des features
2. **PCA**: Réduction de dimensionnalité (3 composantes)
3. **KMeans**: Clustering en 3 groupes

