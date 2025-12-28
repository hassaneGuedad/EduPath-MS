
# EduPath-MS — Learning Analytics & Recommandations

## Description

EduPath-MS est une plateforme microservices complète pour analyser les trajectoires d'apprentissage des étudiants et proposer des recommandations pédagogiques personnalisées. Le projet utilise une architecture microservices modulaire permettant une scalabilité et une maintenabilité optimales.

## Architecture

Le projet est composé de 7 microservices principaux :

1. **LMSConnector** (Node.js) : Synchronisation des données depuis Moodle/Canvas
2. **PrepaData** (Python + Flask) : Nettoyage et calcul des features
3. **StudentProfiler** (Python + scikit-learn) : Profilage des étudiants (KMeans/PCA)
4. **PathPredictor** (Python + XGBoost) : Prédiction du risque d'échec
5. **RecoBuilder** (Python + Transformers + Faiss) : Génération de recommandations
6. **TeacherConsole** (React + Chart.js) : Dashboard pour enseignants
7. **StudentCoach** (Flutter + FastAPI) : Application mobile pour étudiants

## Structure du Projet

```
EduPath-MS-EMSI/
├── data/                          # Dataset simulé
│   ├── students.csv
│   ├── modules.csv
│   └── resources.csv
├── services/
│   ├── lms-connector/            # Service Node.js
│   ├── prepa-data/               # Service Python/Flask
│   ├── student-profiler/         # Service Python/ML
│   ├── path-predictor/           # Service Python/XGBoost
│   ├── reco-builder/             # Service Python/Transformers
│   ├── teacher-console/          # Application React
│   ├── student-coach-api/        # API FastAPI
│   └── student-coach-flutter/    # Application Flutter
├── docker-compose.yml            # Configuration Docker
└── README.md                     # Ce fichier
```

## Prérequis

- Docker et Docker Compose
- Node.js 18+ (pour développement local)
- Python 3.11+ (pour développement local)
- Flutter 3.0+ (pour l'application mobile)

## Installation et Démarrage

### Option 1: Docker Compose (Recommandé)

```bash
# Cloner le projet
cd EduPath-MS-EMSI

# Démarrer tous les services
docker-compose up -d

# Vérifier les services
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### Option 2: Développement Local

#### 1. LMSConnector
```bash
cd services/lms-connector
npm install
npm start
# Service disponible sur http://localhost:3001
```

#### 2. PrepaData
```bash
cd services/prepa-data
pip install -r requirements.txt
python src/app.py
# Service disponible sur http://localhost:3002
```

#### 3. StudentProfiler
```bash
cd services/student-profiler
pip install -r requirements.txt
python src/app.py
# Service disponible sur http://localhost:3003
```

#### 4. PathPredictor
```bash
cd services/path-predictor
pip install -r requirements.txt
python src/app.py
# Service disponible sur http://localhost:3004
```

#### 5. RecoBuilder
```bash
cd services/reco-builder
pip install -r requirements.txt
python src/app.py
# Service disponible sur http://localhost:3005
```

#### 6. TeacherConsole (Portail Professeur)
```bash
cd services/teacher-console
npm install
npm run dev
# Application disponible sur http://localhost:3006 (ou 3011 si 3006 est occupé)
```

#### 7. StudentPortal (Portail Étudiant)
```bash
cd services/student-portal
npm install
npm run dev
# Application disponible sur http://localhost:3009
```

> **💡 Note :** Pour le développement avec hot-reload, ouvrez deux terminaux :
> - Terminal 1 : Teacher Console (port 3006)
> - Terminal 2 : Student Portal (port 3009)
> 
> Les modifications du code seront visibles instantanément sans redémarrage.

#### 8. StudentCoach API
```bash
cd services/student-coach-api
pip install -r requirements.txt
uvicorn src.main:app --reload
# API disponible sur http://localhost:3007
```

#### 9. StudentCoach Flutter
```bash
cd services/student-coach-flutter
flutter pub get
flutter run
```

## Endpoints Principaux

### LMSConnector
- `GET /sync` - Synchronise les données depuis les fichiers CSV

### PrepaData
- `GET /features/{student_id}` - Récupère les features d'un étudiant

### StudentProfiler
- `GET /profile/{student_id}` - Récupère le profil d'un étudiant

### PathPredictor
- `POST /predict` - Prédit le risque d'échec
  ```json
  {
    "student_id": 1,
    "module_id": "MATH101"
  }
  ```

### RecoBuilder
- `GET /recommend/{student_id}` - Génère des recommandations

### StudentCoach API
- `GET /student/{student_id}/dashboard` - Dashboard complet
- `GET /student/{student_id}/progress` - Progression
- `GET /student/{student_id}/recommendations` - Recommandations
- `POST /student/{student_id}/predict` - Prédiction

## Dataset Simulé

Le projet inclut un dataset simulé dans le dossier `data/` :
- **students.csv** : Données de 10 étudiants sur 3 modules
- **modules.csv** : Informations sur les modules
- **resources.csv** : Ressources pédagogiques disponibles

## Tests des Endpoints

### Test LMSConnector
```bash
curl http://localhost:3001/sync
```

### Test PrepaData
```bash
curl http://localhost:3002/features/1
```

### Test StudentProfiler
```bash
curl http://localhost:3003/profile/1
```

### Test PathPredictor
```bash
curl -X POST http://localhost:3004/predict \
  -H "Content-Type: application/json" \
  -d '{"student_id": 1, "module_id": "MATH101"}'
```

### Test RecoBuilder
```bash
curl http://localhost:3005/recommend/1
```

### Test StudentCoach API
```bash
curl http://localhost:3007/student/1/dashboard
```

## Flux de Données

1. **LMSConnector** synchronise les données depuis les fichiers CSV
2. **PrepaData** calcule les features pour chaque étudiant
3. **StudentProfiler** détermine le profil d'apprentissage
4. **PathPredictor** prédit le risque d'échec
5. **RecoBuilder** génère des recommandations personnalisées
6. **TeacherConsole** affiche les données aux enseignants
7. **StudentCoach** affiche les données aux étudiants

## Technologies Utilisées

- **Backend**: Node.js, Python (Flask, FastAPI)
- **Machine Learning**: scikit-learn, XGBoost, Transformers, Faiss
- **Frontend**: React, Chart.js
- **Mobile**: Flutter
- **Base de données**: PostgreSQL
- **Containerisation**: Docker, Docker Compose

## Documentation des Microservices

Chaque microservice possède son propre README avec :
- Description détaillée
- Stack technique
- Endpoints disponibles
- Instructions d'installation et d'exécution
- Variables d'environnement

Consulter les README dans chaque dossier `services/{microservice}/README.md`.

## Développement

### Ajout de Nouvelles Fonctionnalités

1. Chaque microservice est indépendant
2. Utiliser les endpoints existants pour la communication inter-services
3. Respecter l'architecture REST
4. Ajouter des tests pour les nouvelles fonctionnalités

### Contribution

1. Créer une branche pour chaque fonctionnalité
2. Suivre les conventions de code existantes
3. Documenter les changements
4. Tester avant de soumettre

## Problèmes Connus et Limitations

- Les données sont simulées (CSV)
- Les modèles ML sont entraînés avec des données synthétiques
- L'application Flutter nécessite une configuration réseau pour accéder à l'API
- TeacherConsole nécessite que PrepaData soit en cours d'exécution

## Roadmap

- [ ] Intégration réelle avec Moodle/Canvas
- [ ] Base de données persistante avec migrations
- [ ] Authentification et autorisation
- [ ] Tests unitaires et d'intégration
- [ ] CI/CD pipeline
- [ ] Monitoring et logging avancés
- [ ] Cache Redis pour améliorer les performances
- [ ] API Gateway pour la gestion centralisée
# Communication entre microservices

Les microservices de la plateforme EduPath-MS sont organisés en pipeline et communiquent via différents protocoles selon le besoin :

- **API REST (HTTP)** : pour les appels synchrones (requêtes/réponses classiques)
- **RabbitMQ (files de messages)** : pour la communication asynchrone, la diffusion d’événements et le découplage des traitements
- **gRPC** : pour les échanges performants entre services Python (notamment pour le transfert de données structurées ou volumineuses)

**Schéma de flux simplifié :**

```
LMS-Connector  --(REST)-->  Prepa-Data  --(RabbitMQ)-->  Student-Profiler  --(gRPC)-->  Path-Predictor  --(REST)-->  Reco-Builder
      |                                                                                                         |
      |                                                                                                         |
      +-------------------(REST)----------------------> TeacherConsole / StudentCoach (UI)
```

**Détail des interactions :**

- **LMS-Connector** :
  - Récupère les données des plateformes LMS (Moodle, Canvas)
  - Envoie les données brutes à Prepa-Data via API REST

- **Prepa-Data** :
  - Nettoie et transforme les données
  - Publie les features calculées dans une file RabbitMQ

- **Student-Profiler** :
  - Consomme les features depuis RabbitMQ
  - Segmente les étudiants (KMeans, PCA)
  - Envoie les profils à Path-Predictor via gRPC

- **Path-Predictor** :
  - Prédit le risque d’échec à partir des profils
  - Expose une API REST pour recevoir les requêtes de prédiction
  - Transmet les scores à Reco-Builder via REST

- **Reco-Builder** :
  - Génère des recommandations personnalisées
  - Expose une API REST pour les interfaces utilisateur

- **TeacherConsole / StudentCoach** :
  - Consomment les données via API REST pour l’affichage en temps réel

Cette architecture permet la scalabilité, la tolérance aux pannes et l’extension facile de la plateforme.

# Communication entre microservices

Les microservices de la plateforme EduPath-MS sont organisés en pipeline et communiquent via différents protocoles selon le besoin :

- **API REST (HTTP)** : pour les appels synchrones (requêtes/réponses classiques)
- **RabbitMQ (files de messages)** : pour la communication asynchrone, la diffusion d’événements et le découplage des traitements
- **gRPC** : pour les échanges performants entre services Python (notamment pour le transfert de données structurées ou volumineuses)

  **Schéma de flux simplifié :**

```
LMS-Connector  --(REST)-->  Prepa-Data  --(RabbitMQ)-->  Student-Profiler  --(gRPC)-->  Path-Predictor  --(REST)-->  Reco-Builder
      |                                                                                                         |
      |                                                                                                         |
      +-------------------(REST)----------------------> TeacherConsole / StudentCoach (UI)
```

**Détail des interactions :**

- **LMS-Connector** :
  - Récupère les données des plateformes LMS (Moodle, Canvas)
  - Envoie les données brutes à Prepa-Data via API REST

- **Prepa-Data** :
  - Nettoie et transforme les données
  - Publie les features calculées dans une file RabbitMQ

- **Student-Profiler** :
  - Consomme les features depuis RabbitMQ
  - Segmente les étudiants (KMeans, PCA)
  - Envoie les profils à Path-Predictor via gRPC

- **Path-Predictor** :
  - Prédit le risque d’échec à partir des profils
  - Expose une API REST pour recevoir les requêtes de prédiction
  - Transmet les scores à Reco-Builder via REST

- **Reco-Builder** :
  - Génère des recommandations personnalisées
  - Expose une API REST pour les interfaces utilisateur

- **TeacherConsole / StudentCoach** :
  - Consomment les données via API REST pour l’affichage en temps réel

Cette architecture permet la scalabilité, la tolérance aux pannes et l’extension facile de la plateforme.

# Communication entre microservices

Test pipeline : modification du README le 28/12/2025

Test pipeline : deuxième modification du README le 28/12/2025

Test pipeline : troisième modification du README le 28/12/2025

Test pipeline : quatrième modification du README le 28/12/2025

Test pipeline : cinquième modification du README le 28/12/2025

<img width="632" height="316" alt="Capture_jenkines" src="https://github.com/user-attachments/assets/cae9f08b-47a7-4261-9ae6-08bd3ab27ecb" />


<img width="638" height="320" alt="Capture_webHooks" src="https://github.com/user-attachments/assets/18eacb43-a0f5-437c-8dcc-a29357944fdf" />

## Démonstration Video

## teacher-console

https://github.com/user-attachments/assets/3d0b0ea3-afa6-487b-b2e5-10ab8b3ae4d2


## Student-portal


https://github.com/user-attachments/assets/007a327d-ccc5-44ba-91d6-7d07b20ba1fa



## Auteurs

Équipe académique - Projet EduPath-MS

## Licence

Ce projet est destiné à un usage académique.

## Support

Pour toute question ou problème, consulter la documentation de chaque microservice ou ouvrir une issue.

