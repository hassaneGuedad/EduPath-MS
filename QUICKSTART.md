# Guide de Démarrage Rapide

## Démarrage avec Docker (Recommandé)

### 1. Démarrer tous les services

```bash
docker-compose up -d
```

### 2. Vérifier que tous les services sont démarrés

```bash
docker-compose ps
```

Vous devriez voir tous les services avec le statut "Up".

### 3. Tester les endpoints

#### Test LMSConnector
```bash
curl http://localhost:3001/sync
```

#### Test PrepaData
```bash
curl http://localhost:3002/features/1
```

#### Test StudentProfiler
```bash
curl http://localhost:3003/profile/1
```

#### Test PathPredictor
```bash
curl -X POST http://localhost:3004/predict \
  -H "Content-Type: application/json" \
  -d '{"student_id": 1, "module_id": "MATH101"}'
```

#### Test RecoBuilder
```bash
curl http://localhost:3005/recommend/1
```

#### Test StudentCoach API
```bash
curl http://localhost:3007/student/1/dashboard
```

### 4. Accéder aux interfaces

- **TeacherConsole**: http://localhost:3006
- **StudentCoach API Docs**: http://localhost:3007/docs

## Démarrage Local (Sans Docker)

### Ordre de démarrage recommandé

1. **LMSConnector** (port 3001)
2. **PrepaData** (port 3002) - dépend de LMSConnector
3. **StudentProfiler** (port 3003) - dépend de PrepaData
4. **PathPredictor** (port 3004) - dépend de PrepaData
5. **RecoBuilder** (port 3005) - dépend de PrepaData et PathPredictor
6. **TeacherConsole** (port 3006) - dépend de PrepaData
7. **StudentCoach API** (port 3007) - dépend de tous les services précédents

### Commandes de démarrage

```bash
# Terminal 1 - LMSConnector
cd services/lms-connector
npm install && npm start

# Terminal 2 - PrepaData
cd services/prepa-data
pip install -r requirements.txt
python src/app.py

# Terminal 3 - StudentProfiler
cd services/student-profiler
pip install -r requirements.txt
python src/app.py

# Terminal 4 - PathPredictor
cd services/path-predictor
pip install -r requirements.txt
python src/app.py

# Terminal 5 - RecoBuilder
cd services/reco-builder
pip install -r requirements.txt
python src/app.py

# Terminal 6 - TeacherConsole
cd services/teacher-console
npm install && npm run dev

# Terminal 7 - StudentCoach API
cd services/student-coach-api
pip install -r requirements.txt
uvicorn src.main:app --reload
```

## Vérification du Flux Complet

### Scénario de test complet

1. **Synchroniser les données**
   ```bash
   curl http://localhost:3001/sync
   ```

2. **Récupérer les features d'un étudiant**
   ```bash
   curl http://localhost:3002/features/1
   ```

3. **Obtenir le profil de l'étudiant**
   ```bash
   curl http://localhost:3003/profile/1
   ```

4. **Prédire le risque d'échec**
   ```bash
   curl -X POST http://localhost:3004/predict \
     -H "Content-Type: application/json" \
     -d '{"student_id": 1}'
   ```

5. **Obtenir des recommandations**
   ```bash
   curl http://localhost:3005/recommend/1
   ```

6. **Dashboard complet (StudentCoach API)**
   ```bash
   curl http://localhost:3007/student/1/dashboard
   ```

## Résolution de Problèmes

### Service ne démarre pas

1. Vérifier que le port n'est pas déjà utilisé
2. Vérifier les logs: `docker-compose logs <service-name>`
3. Vérifier les dépendances (un service dépend d'un autre)

### Erreur de connexion entre services

1. Vérifier que tous les services sont démarrés
2. Dans Docker, utiliser les noms de services (ex: `http://prepa-data:3002`)
3. En local, utiliser `http://localhost:PORT`

### Erreur de données manquantes

1. Vérifier que les fichiers CSV sont présents dans `data/`
2. Vérifier que LMSConnector peut lire les fichiers
3. Vérifier les permissions des fichiers

## Arrêt des Services

### Docker
```bash
docker-compose down
```

### Local
Arrêter chaque terminal avec `Ctrl+C`

## Nettoyage

### Docker
```bash
# Arrêter et supprimer les conteneurs
docker-compose down

# Supprimer aussi les volumes (⚠️ supprime les données)
docker-compose down -v
```

