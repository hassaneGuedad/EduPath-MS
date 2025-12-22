# 🚀 Guide de Démarrage Rapide - StudentCoach API

## Installation Rapide (5 minutes)

### Prérequis
- ✅ Python 3.14+ avec environnement virtuel `.venv`
- ✅ PostgreSQL (via Docker: `edupath-postgres`)
- ✅ Services actifs: PrepaData (3002), StudentProfiler (3003)

### Étape 1: Installer les dépendances
```powershell
cd services/student-coach-api
pip install -r requirements.txt
```

### Étape 2: Initialiser la base de données
```powershell
# Créer la base
docker exec -it edupath-postgres psql -U edupath -d postgres -c "CREATE DATABASE edupath_coaching;"

# Importer le schéma et les données (35 messages)
Get-Content "..\..\database\init_coaching.sql" | docker exec -i edupath-postgres psql -U edupath -d edupath_coaching
```

### Étape 3: Configurer l'environnement
Le fichier `.env` est déjà créé avec les bonnes valeurs:
```env
PORT=3007
PREPA_DATA_URL=http://localhost:3002
STUDENT_PROFILER_URL=http://localhost:3003
PATH_PREDICTOR_URL=http://localhost:3004
RECO_BUILDER_URL=http://localhost:3005

DB_HOST=localhost
DB_PORT=5432
DB_NAME=edupath_coaching
DB_USER=edupath
DB_PASSWORD=edupath_password
```

### Étape 4: Arrêter l'ancien container Docker
```powershell
docker stop edupath-student-coach-api
```

### Étape 5: Démarrer l'API
```powershell
$env:PYTHONPATH="C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-api"
Push-Location "C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-api"
& "C:\Users\youbitech\Desktop\Edu_Path\.venv\Scripts\uvicorn.exe" src.main:app --host 127.0.0.1 --port 3007 --reload
```

### Étape 6: Vérifier
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3007/health"

# Documentation interactive
Start-Process "http://localhost:3007/docs"
```

## Tests Rapides

### Test 1: Message Motivant
```powershell
Invoke-RestMethod -Uri "http://localhost:3007/student/12346/motivational-message"
```
**Résultat attendu**: Message personnalisé pour High Performer

### Test 2: Conseils de Coaching
```powershell
Invoke-RestMethod -Uri "http://localhost:3007/student/12345/coaching-advice"
```
**Résultat attendu**: 3-5 conseils pour étudiant At Risk

### Test 3: Coaching Complet
```powershell
Invoke-RestMethod -Uri "http://localhost:3007/student/12347/complete-coaching" | ConvertTo-Json -Depth 5
```
**Résultat attendu**: Message + Conseils + Plan d'étude + Profil

## Endpoints Disponibles

### Anciens Endpoints (Maintenus)
- `GET /health` - Health check
- `GET /student/{id}/progress` - Progression étudiant
- `GET /student/{id}/recommendations` - Recommandations de ressources

### Nouveaux Endpoints (Implémentés)
- `GET /student/{id}/motivational-message` - Message motivant personnalisé
- `GET /student/{id}/coaching-advice` - 2-5 conseils avec actions
- `GET /student/{id}/study-plan` - Plan d'étude adaptatif
- `POST /student/{id}/feedback` - Soumettre feedback + rating
- `POST /student/{id}/rate-recommendation` - Noter une ressource
- `GET /student/{id}/coaching-history` - Historique des sessions
- `GET /student/{id}/complete-coaching` - Tout en un seul appel

## Documentation

- **Swagger UI**: http://localhost:3007/docs
- **ReDoc**: http://localhost:3007/redoc
- **Guide complet**: [TEST_GUIDE.md](TEST_GUIDE.md)
- **Résultats tests**: [TEST_RESULTS.md](TEST_RESULTS.md)

## Dépannage

### Erreur: "ModuleNotFoundError: No module named 'requests'"
```powershell
pip install requests fastapi uvicorn pydantic python-dotenv python-multipart psycopg2-binary
```

### Erreur: "ModuleNotFoundError: No module named 'src'"
```powershell
# Créer __init__.py si manquant
New-Item -Path "src/__init__.py" -ItemType File -Force
```

### Erreur: Port 3007 déjà utilisé
```powershell
# Arrêter l'ancien container
docker stop edupath-student-coach-api
```

### Erreur: Cannot connect to database
```powershell
# Vérifier que PostgreSQL tourne
docker ps | Select-String "postgres"

# Réinitialiser la base
docker exec -it edupath-postgres psql -U edupath -d postgres -c "DROP DATABASE IF EXISTS edupath_coaching; CREATE DATABASE edupath_coaching;"
Get-Content "..\..\database\init_coaching.sql" | docker exec -i edupath-postgres psql -U edupath -d edupath_coaching
```

## Commande Tout-en-Un

```powershell
# Installation + Démarrage complet
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-api

# Installer dépendances
pip install -r requirements.txt

# Init DB (ignorer erreur si existe déjà)
docker exec -it edupath-postgres psql -U edupath -d postgres -c "CREATE DATABASE edupath_coaching;" 2>$null
Get-Content "..\..\database\init_coaching.sql" | docker exec -i edupath-postgres psql -U edupath -d edupath_coaching

# Arrêter ancien container
docker stop edupath-student-coach-api

# Démarrer API
$env:PYTHONPATH=(Get-Location).Path
& "C:\Users\youbitech\Desktop\Edu_Path\.venv\Scripts\uvicorn.exe" src.main:app --host 127.0.0.1 --port 3007 --reload
```

## Statut

✅ **100% Opérationnel**  
✅ **35 Messages Motivants** en base  
✅ **7 Nouveaux Endpoints** testés  
✅ **Conformité Spécifications: 100%**

---

**Dernière mise à jour**: 21 décembre 2025  
**Version**: 2.0.0  
**Tests**: ✅ PASSÉS
