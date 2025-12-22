# 🚀 Comment Lancer le Projet EduPath-MS avec Docker

## Méthode Simple (Recommandée)

### Étape 1 : Ouvrir PowerShell dans le dossier du projet

```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
```

### Étape 2 : Démarrer tous les services

```powershell
docker-compose up -d
```

Cette commande va :
- ✅ Télécharger les images Docker nécessaires (si première fois)
- ✅ Construire les images des microservices
- ✅ Démarrer tous les services en arrière-plan

**⏱️ Temps estimé** : 5-10 minutes la première fois (téléchargement des images)

### Étape 3 : Vérifier que tout fonctionne

```powershell
docker-compose ps
```

Vous devriez voir tous les services avec le statut `Up` :

```
NAME                        STATUS
edupath-postgres            Up (healthy)
edupath-lms-connector       Up
edupath-prepa-data          Up
edupath-student-profiler    Up
edupath-path-predictor      Up
edupath-reco-builder        Up
edupath-teacher-console     Up
edupath-student-coach-api   Up
```

### Étape 4 : Tester les services

Ouvrez votre navigateur et accédez à :

- **TeacherConsole (Dashboard)** : http://localhost:3006
- **API Documentation** : http://localhost:3007/docs

## 📋 Commandes Utiles

### Voir les logs en temps réel
```powershell
docker-compose logs -f
```

### Voir les logs d'un service spécifique
```powershell
docker logs edupath-prepa-data -f
docker logs edupath-path-predictor -f
```

### Redémarrer un service
```powershell
docker-compose restart prepa-data
```

### Arrêter tous les services
```powershell
docker-compose stop
```

### Arrêter et supprimer les conteneurs
```powershell
docker-compose down
```

### Reconstruire après modification du code
```powershell
docker-compose build
docker-compose up -d
```

## 🧪 Tests Rapides

### Test 1 : Vérifier que PrepaData fonctionne
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/features/1" -Method GET
```

### Test 2 : Vérifier que PathPredictor fonctionne
```powershell
$body = @{student_id=1; module_id="MATH101"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3004/predict" -Method POST -Body $body -ContentType "application/json"
```

## ⚠️ Résolution de Problèmes

### Si un service ne démarre pas

1. **Vérifier les logs** :
```powershell
docker logs edupath-<nom-service> --tail 50
```

2. **Reconstruire le service** :
```powershell
docker-compose build <nom-service>
docker-compose up -d <nom-service>
```

### Si les ports sont déjà utilisés

Vérifier quels ports sont utilisés :
```powershell
netstat -ano | findstr :3001
```

Arrêter l'application qui utilise le port, ou modifier les ports dans `docker-compose.yml`.

## 📊 Ports Utilisés

| Service | Port | URL |
|---------|------|-----|
| LMSConnector | 3001 | http://localhost:3001 |
| PrepaData | 3002 | http://localhost:3002 |
| StudentProfiler | 3003 | http://localhost:3003 |
| PathPredictor | 3004 | http://localhost:3004 |
| RecoBuilder | 3005 | http://localhost:3005 |
| TeacherConsole | 3006 | http://localhost:3006 |
| StudentCoach API | 3007 | http://localhost:3007 |
| PostgreSQL | 5432 | localhost:5432 |

## ✅ Checklist de Démarrage

- [ ] Docker Desktop est lancé
- [ ] Vous êtes dans le dossier `EduPath-MS-EMSI`
- [ ] Commande `docker-compose up -d` exécutée
- [ ] Tous les services sont `Up` (vérifier avec `docker-compose ps`)
- [ ] TeacherConsole accessible sur http://localhost:3006
- [ ] API Documentation accessible sur http://localhost:3007/docs

---

**🎉 C'est tout ! Votre projet est maintenant lancé et prêt à être utilisé.**

