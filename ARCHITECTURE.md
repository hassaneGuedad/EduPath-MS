# Architecture EduPath-MS

## Vue d'ensemble

EduPath-MS suit une architecture microservices modulaire où chaque service a une responsabilité spécifique et communique via des APIs REST.

## Diagramme d'Architecture

```
┌─────────────────┐
│   Data (CSV)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ LMSConnector    │ Port 3001 (Node.js)
│ GET /sync       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PrepaData     │ Port 3002 (Python/Flask)
│ GET /features/  │
└─────┬─────┬─────┘
      │     │
      ▼     ▼
┌─────────┐ ┌──────────────┐
│Student  │ │PathPredictor │ Port 3004 (Python/XGBoost)
│Profiler │ │POST /predict │
│Port 3003│ └──────────────┘
└────┬────┘
     │
     ▼
┌──────────────┐
│ RecoBuilder  │ Port 3005 (Python/Transformers+Faiss)
│GET /recommend│
└──────────────┘
     │
     ▼
┌─────────────────┐  ┌──────────────────┐
│ TeacherConsole  │  │ StudentCoach API  │ Port 3007 (FastAPI)
│  Port 3006      │  │                   │
│  (React)        │  └──────────────────┘
└─────────────────┘           │
                              ▼
                    ┌──────────────────┐
                    │ StudentCoach      │
                    │ Flutter App      │
                    └──────────────────┘
```

## Flux de Données

### 1. Synchronisation (LMSConnector)
- Lit les fichiers CSV dans `data/`
- Fournit un endpoint `/sync` pour récupérer toutes les données
- Simule la synchronisation depuis Moodle/Canvas

### 2. Préparation des Données (PrepaData)
- Récupère les données depuis LMSConnector
- Calcule les features pour chaque étudiant:
  - Score moyen
  - Taux de participation
  - Temps total passé
  - Score de risque
  - Niveau d'engagement
  - Tendance de performance

### 3. Profilage (StudentProfiler)
- Utilise les features de PrepaData
- Applique KMeans clustering avec PCA
- Identifie 3 profils: High Performer, Average Learner, At Risk

### 4. Prédiction (PathPredictor)
- Utilise XGBoost pour prédire le risque d'échec
- Entraîné sur des données synthétiques
- Retourne probabilité d'échec et niveau de risque

### 5. Recommandations (RecoBuilder)
- Analyse les difficultés de l'étudiant
- Utilise SentenceTransformers pour les embeddings
- Utilise Faiss pour la recherche de similarité
- Génère des recommandations personnalisées

### 6. Interfaces Utilisateur

#### TeacherConsole (React)
- Dashboard avec graphiques Chart.js
- Liste des étudiants avec alertes
- Détails individuels par étudiant

#### StudentCoach (Flutter + FastAPI)
- API FastAPI agrège toutes les données
- Application Flutter affiche:
  - Progression
  - Profil
  - Prédictions
  - Recommandations

## Communication Inter-Services

### Méthode
- **Protocole**: HTTP REST
- **Format**: JSON
- **Synchronisation**: Appels HTTP directs

### Endpoints Utilisés

1. PrepaData → LMSConnector: `GET /sync`
2. StudentProfiler → PrepaData: `GET /features/{id}`
3. PathPredictor → PrepaData: `GET /features/{id}`
4. RecoBuilder → PrepaData: `GET /features/{id}`
5. RecoBuilder → PathPredictor: `POST /predict`
6. StudentCoach API → Tous les services précédents
7. TeacherConsole → PrepaData: `GET /features/{id}`

## Technologies par Service

| Service | Langage | Framework | ML/AI | Port |
|---------|---------|-----------|-------|------|
| LMSConnector | Node.js | Express | - | 3001 |
| PrepaData | Python | Flask | pandas, numpy | 3002 |
| StudentProfiler | Python | Flask | scikit-learn | 3003 |
| PathPredictor | Python | Flask | XGBoost | 3004 |
| RecoBuilder | Python | Flask | Transformers, Faiss | 3005 |
| TeacherConsole | JavaScript | React | Chart.js | 3006 |
| StudentCoach API | Python | FastAPI | - | 3007 |
| StudentCoach App | Dart | Flutter | - | - |

## Base de Données

### PostgreSQL
- Utilisé pour la persistance (optionnel dans cette version MVP)
- Port: 5432
- Base de données: `edupath_db`
- Utilisateur: `edupath`
- Mot de passe: `edupath123`

### Données Simulées
- Format: CSV
- Emplacement: `data/`
- Fichiers:
  - `students.csv`: Données des étudiants
  - `modules.csv`: Informations sur les modules
  - `resources.csv`: Ressources pédagogiques

## Scalabilité

### Horizontal Scaling
Chaque microservice peut être scalé indépendamment:
- LMSConnector: Plusieurs instances pour gérer plus de sources
- PrepaData: Scaling pour traiter plus d'étudiants
- ML Services: Scaling selon la charge de prédiction

### Vertical Scaling
- Augmenter les ressources pour les services ML
- Optimiser les modèles pour réduire la latence

## Sécurité (À Implémenter)

- [ ] Authentification JWT
- [ ] HTTPS/TLS
- [ ] Rate limiting
- [ ] Validation des entrées
- [ ] Secrets management
- [ ] CORS configuré correctement

## Monitoring (À Implémenter)

- [ ] Health checks pour tous les services
- [ ] Logging centralisé
- [ ] Métriques de performance
- [ ] Alertes automatiques
- [ ] Tracing distribué

## Déploiement

### Docker Compose (Développement)
- Tous les services dans un seul fichier
- Facile à démarrer/arrêter
- Parfait pour le développement

### Production (Recommandé)
- Kubernetes pour l'orchestration
- Service mesh (Istio) pour la communication
- Load balancers
- Auto-scaling
- CI/CD pipeline

