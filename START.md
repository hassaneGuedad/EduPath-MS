# Guide de Démarrage - EduPath-MS

## 🚀 Démarrage Rapide avec Docker Compose

### 1. Démarrer tous les services

```powershell
# Depuis le dossier EduPath-MS-EMSI
docker-compose up -d
```

Cette commande démarre tous les microservices en arrière-plan :
- ✅ PostgreSQL (port 5432)
- ✅ LMSConnector (port 3001)
- ✅ PrepaData (port 3002)
- ✅ StudentProfiler (port 3003)
- ✅ PathPredictor (port 3004)
- ✅ RecoBuilder (port 3005)
- ✅ TeacherConsole (port 3006)
- ✅ StudentCoach API (port 3007)

### 2. Vérifier l'état des services

```powershell
docker-compose ps
```

Tous les services doivent avoir le statut `Up` ou `Up (healthy)`.

### 3. Voir les logs

```powershell
# Tous les services
docker-compose logs -f

# Un service spécifique
docker logs edupath-prepa-data -f
docker logs edupath-path-predictor -f
```

### 4. Arrêter les services

```powershell
# Arrêter sans supprimer
docker-compose stop

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer les conteneurs + volumes (⚠️ supprime les données)
docker-compose down -v
```

## 📋 Tests des Endpoints

### Test 1: LMSConnector - Synchronisation
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/sync" -Method GET | ConvertTo-Json -Depth 3
```

### Test 2: PrepaData - Features d'un étudiant
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/features/1" -Method GET | ConvertTo-Json -Depth 5
```

### Test 3: StudentProfiler - Profil d'un étudiant
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/profile/1" -Method GET | ConvertTo-Json -Depth 3
```

### Test 4: PathPredictor - Prédiction de risque
```powershell
$body = @{student_id=1; module_id="MATH101"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3004/predict" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```

### Test 5: RecoBuilder - Recommandations
```powershell
Invoke-RestMethod -Uri "http://localhost:3005/recommend/1" -Method GET | ConvertTo-Json -Depth 5
```

### Test 6: StudentCoach API - Dashboard complet
```powershell
Invoke-RestMethod -Uri "http://localhost:3007/student/1/dashboard" -Method GET | ConvertTo-Json -Depth 5
```

## 🌐 Accès aux Interfaces

### TeacherConsole (Dashboard Enseignant)
Ouvrir dans le navigateur : **http://localhost:3006**

### StudentCoach API Documentation
- **Swagger UI** : http://localhost:3007/docs
- **ReDoc** : http://localhost:3007/redoc

## 🔧 Commandes Utiles

### Reconstruire un service après modification
```powershell
docker-compose build <service-name>
docker-compose up -d <service-name>
```

Exemple :
```powershell
docker-compose build prepa-data
docker-compose up -d prepa-data
```

### Redémarrer un service
```powershell
docker-compose restart <service-name>
```

### Voir les logs en temps réel
```powershell
docker-compose logs -f <service-name>
```

### Accéder au shell d'un conteneur
```powershell
docker exec -it edupath-prepa-data bash
docker exec -it edupath-path-predictor bash
```

## 🐛 Résolution de Problèmes

### Service ne démarre pas

1. **Vérifier les logs** :
   ```powershell
   docker logs <container-name> --tail 50
   ```

2. **Vérifier que le port n'est pas déjà utilisé** :
   ```powershell
   netstat -ano | findstr :3001
   ```

3. **Reconstruire le service** :
   ```powershell
   docker-compose build --no-cache <service-name>
   docker-compose up -d <service-name>
   ```

### Erreur de connexion entre services

Les services dans Docker communiquent via leurs noms de service :
- `http://prepa-data:3002` (dans Docker)
- `http://localhost:3002` (depuis l'extérieur)

### Service en boucle de redémarrage

1. Vérifier les logs pour l'erreur
2. Corriger le problème dans le code
3. Reconstruire l'image :
   ```powershell
   docker-compose build <service-name>
   docker-compose up -d <service-name>
   ```

## 📊 Ordre de Démarrage Recommandé

Si vous démarrez les services manuellement (sans Docker Compose), suivez cet ordre :

1. **PostgreSQL** (base de données)
2. **LMSConnector** (source de données)
3. **PrepaData** (dépend de LMSConnector)
4. **StudentProfiler** (dépend de PrepaData)
5. **PathPredictor** (dépend de PrepaData)
6. **RecoBuilder** (dépend de PrepaData et PathPredictor)
7. **TeacherConsole** (dépend de PrepaData)
8. **StudentCoach API** (dépend de tous les services précédents)

Avec Docker Compose, les dépendances sont gérées automatiquement via `depends_on`.

## ✅ Checklist de Vérification

Avant de commencer à développer, vérifiez que :

- [ ] Tous les services sont démarrés (`docker-compose ps`)
- [ ] LMSConnector répond (`GET /sync`)
- [ ] PrepaData répond (`GET /features/1`)
- [ ] TeacherConsole est accessible (http://localhost:3006)
- [ ] StudentCoach API répond (http://localhost:3007/docs)

## 🎯 Prochaines Étapes

Une fois tous les services démarrés :

1. Tester tous les endpoints avec les exemples ci-dessus
2. Accéder à TeacherConsole pour voir le dashboard
3. Consulter la documentation API sur http://localhost:3007/docs
4. Commencer le développement des fonctionnalités avancées

---

**Note** : Pour un développement local sans Docker, consultez les README individuels de chaque microservice dans `services/<service-name>/README.md`.

