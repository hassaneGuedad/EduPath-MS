# RecoBuilder Microservice

## Description
Microservice Python pour la génération automatique de recommandations de ressources pédagogiques selon les difficultés détectées, utilisant Transformers et Faiss pour la recherche sémantique.

## Stack Technique
- **Runtime**: Python 3.11+
- **Framework**: Flask
- **Bibliothèques ML**: sentence-transformers, faiss-cpu

## Endpoints

### GET /recommend/{student_id}
Génère des recommandations de ressources pour un étudiant.

**Paramètres de requête:**
- `top_k` (optionnel): Nombre de recommandations (défaut: 5)

**Exemple de requête:**
```
GET /recommend/1?top_k=5
```

**Réponse:**
```json
{
  "status": "success",
  "student_id": 1,
  "recommendations": [
    {
      "resource_id": "R1",
      "resource_name": "Basic Algebra Tutorial",
      "resource_type": "Video",
      "module_id": "MATH101",
      "difficulty_level": "Beginner",
      "description": "Introduction to algebraic concepts",
      "tags": ["algebra", "math", "basics"],
      "relevance_score": 0.85
    }
  ]
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
PORT=3005
PREPA_DATA_URL=http://localhost:3002
PATH_PREDICTOR_URL=http://localhost:3004
```

## Docker

```bash
docker build -t reco-builder .
docker run -p 3005:3005 reco-builder
```

## Algorithme

Le service utilise:
1. **SentenceTransformer**: Pour générer des embeddings sémantiques des ressources
2. **Faiss**: Pour la recherche rapide de similarité vectorielle
3. **Analyse des difficultés**: Basée sur les features de l'étudiant et les prédictions de risque

Les recommandations sont générées en fonction:
- Des difficultés détectées (faible performance, faible engagement, etc.)
- Du niveau de risque d'échec
- De la similarité sémantique avec les ressources disponibles

