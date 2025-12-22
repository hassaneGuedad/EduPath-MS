# 🚀 Guide de Lancement du Projet

## ⚠️ Important : Répertoire de Travail

**Vous devez être dans le répertoire `EduPath-MS-EMSI` pour lancer les commandes docker-compose !**

```powershell
# Naviguer vers le bon répertoire
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI

# Vérifier que vous êtes au bon endroit
Get-Location
# Doit afficher: C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI

# Vérifier que docker-compose.yml existe
Test-Path docker-compose.yml
# Doit afficher: True
```

---

## 🚀 Commandes de Lancement

### 1. Démarrer tous les services

```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
docker-compose up -d
```

Cette commande démarre tous les services en arrière-plan.

### 2. Vérifier l'état des services

```powershell
docker-compose ps
```

### 3. Voir les logs d'un service

```powershell
# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f lms-connector
docker-compose logs -f prepa-data
docker-compose logs -f auth-service
```

### 4. Arrêter les services

```powershell
docker-compose down
```

### 5. Redémarrer un service

```powershell
docker-compose restart [nom-du-service]
```

---

## 📋 Services Disponibles

| Service | Port | URL |
|---------|------|-----|
| LMSConnector | 3001 | http://localhost:3001 |
| PrepaData | 3002 | http://localhost:3002 |
| StudentProfiler | 3003 | http://localhost:3003 |
| PathPredictor | 3004 | http://localhost:3004 |
| RecoBuilder | 3005 | http://localhost:3005 |
| TeacherConsole | 3006 | http://localhost:3006 |
| StudentCoach API | 3007 | http://localhost:3007 |
| Auth Service | 3008 | http://localhost:3008 |
| StudentPortal | 3009 | http://localhost:3009 |
| Benchmarks Service | 3010 | http://localhost:3010 |
| PostgreSQL | 5432 | localhost:5432 |
| MinIO | 9000 | http://localhost:9000 |
| MinIO Console | 9001 | http://localhost:9001 |
| MLflow | 5000 | http://localhost:5000 |
| Airflow | 8080 | http://localhost:8080 |

---

## ✅ Vérification Rapide

### Tester les services

```powershell
# Health check de tous les services
Invoke-RestMethod -Uri "http://localhost:3001/health"
Invoke-RestMethod -Uri "http://localhost:3002/health"
Invoke-RestMethod -Uri "http://localhost:3008/health"
```

### Accéder aux interfaces

- **AdminConsole**: http://localhost:3006
  - Email: `admin@edupath.com`
  - Password: `admin123`

- **StudentPortal**: http://localhost:3009/login
  - Email: `student@edupath.com`
  - Password: `student123`

- **MLflow**: http://localhost:5000
- **Airflow**: http://localhost:8080 (admin/admin)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)

---

## 🔧 Dépannage

### Problème: "no configuration file provided"

**Solution**: Assurez-vous d'être dans le répertoire `EduPath-MS-EMSI`

```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
```

### Problème: Services ne démarrent pas

```powershell
# Voir les logs d'erreur
docker-compose logs

# Reconstruire les images
docker-compose build

# Redémarrer
docker-compose up -d
```

### Problème: Port déjà utilisé

```powershell
# Voir quels ports sont utilisés
netstat -ano | findstr :3001

# Arrêter le processus ou changer le port dans docker-compose.yml
```

---

## 📝 Commandes Utiles

```powershell
# Voir l'utilisation des ressources
docker stats

# Nettoyer les conteneurs arrêtés
docker-compose down
docker system prune -a

# Reconstruire un service spécifique
docker-compose build [nom-du-service]
docker-compose up -d [nom-du-service]
```

---

**🎉 Bon lancement !**

