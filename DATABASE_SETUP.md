# ✅ SETUP BASE DE DONNÉES - GUIDE COMPLET

## ❓ Dois-je créer manuellement la base de données?

**Non! ✅** La base de données est créée **automatiquement** lors du démarrage des conteneurs Docker.

---

## 🔄 Comment ça marche?

### Architecture automatique

```
docker-compose up
    ↓
Démarrage du conteneur PostgreSQL
    ↓
Exécution de init_databases.sh
    ↓
Création automatique de:
├─ edupath_auth (Auth Service - Ressources)
├─ edupath_lms (LMS Connector)
├─ edupath_prepa (PrepaData)
├─ edupath_profiler (Student Profiler)
├─ edupath_predictor (Path Predictor)
├─ edupath_reco (Reco Builder)
├─ mlflow_db (MLflow)
└─ airflow_db (Airflow)
    ↓
Création automatique des tables
    ├─ resources (table de Ressources)
    ├─ sync_logs
    ├─ raw_student_data
    └─ ...autres tables
    ↓
✅ Base de données PRÊTE
```

---

## 📝 Ce qui a été configuré

### 1. Script d'initialisation (`database/init_databases.sh`)
```bash
# Crée automatiquement:
SELECT 'CREATE DATABASE edupath_auth'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'edupath_auth')

# Crée la table resources:
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    resource_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    -- 13 autres colonnes...
);
```

### 2. Docker-compose configuration
```yaml
postgres:
  volumes:
    - ./database/init_databases.sh:/docker-entrypoint-initdb.d/init_databases.sh
    # ↑ Ce script s'exécute automatiquement
```

### 3. Auth-Service configuration
```yaml
auth-service:
  environment:
    - DATABASE_URL=postgresql://edupath:edupath123@postgres:5432/edupath_auth
    # ↑ Utilise la BD créée automatiquement
```

---

## 🚀 Étapes pour démarrer

### 1. Arrêter les anciens conteneurs
```bash
docker-compose down
```

### 2. Reconstruire
```bash
docker-compose up --build
```

✅ **C'est tout!** La BD se crée automatiquement.

---

## ✨ Bases de données créées

### Pour Auth Service (Resources)
```
Nom: edupath_auth
Table: resources
```

**Colonnes:**
- id (PK)
- resource_id (UNIQUE)
- title (VARCHAR 200)
- description (TEXT)
- resource_type (VARCHAR 50)
- subject_id (VARCHAR 50)
- subject_name (VARCHAR 100)
- difficulty_level (VARCHAR 50)
- duration (INTEGER)
- author (VARCHAR 100)
- external_url (VARCHAR 500)
- file_path (VARCHAR 500)
- tags (TEXT ARRAY)
- is_viewed (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Indices créés:**
- idx_resources_subject_id
- idx_resources_resource_id
- idx_resources_created_at

---

## 🔍 Vérifier que tout fonctionne

### Dans le conteneur PostgreSQL

```bash
# Accéder au conteneur
docker exec -it edupath-postgres psql -U edupath

# Lister les bases de données
\l

# Vérifier la BD edupath_auth
\c edupath_auth

# Voir les tables
\dt

# Voir la structure de la table resources
\d resources

# Voir les données
SELECT * FROM resources;

# Quitter
\q
```

### Ou via PostgreSQL client externe

```bash
# Depuis votre machine
psql -h localhost -U edupath -d edupath_auth

# Même commandes que ci-dessus
```

---

## 🧪 Test rapide

### 1. Vérifier la BD est créée
```bash
docker exec -it edupath-postgres psql -U edupath -l | grep edupath_auth
```

✅ Vous devez voir: `edupath_auth | edupath`

### 2. Vérifier la table existe
```bash
docker exec -it edupath-postgres psql -U edupath -d edupath_auth -c "\dt"
```

✅ Vous devez voir: `resources`

### 3. Vérifier la structure
```bash
docker exec -it edupath-postgres psql -U edupath -d edupath_auth -c "\d resources"
```

✅ Vous devez voir: 15 colonnes + 3 indices

### 4. Insérer une ressource via l'API
```bash
# Admin crée une ressource
# Student voit la ressource
# Vérifier dans la BD
docker exec -it edupath-postgres psql -U edupath -d edupath_auth -c "SELECT * FROM resources;"
```

✅ Vous devez voir: Les ressources créées

---

## ⚠️ Si ça ne fonctionne pas

### Erreur: Base de données non créée
```bash
# Solution: Redémarrer avec rebuild
docker-compose down
docker-compose up --build

# Attendre ~30 secondes
docker ps  # Vérifier que postgres est healthy
```

### Erreur: Connection refused
```bash
# Attendez que PostgreSQL démarre
docker logs edupath-postgres | grep "ready"

# Ou vérifier la santé
docker ps | grep edupath-postgres
# HEALTHCHECK doit dire "healthy"
```

### Erreur: Table resources n'existe pas
```bash
# Vérifier le script init
cat database/init_databases.sh | grep "resources"

# Vérifier les logs PostgreSQL
docker logs edupath-postgres | grep -i error

# Recréer les tables manuellement (si nécessaire)
docker exec -it edupath-postgres psql -U edupath -d edupath_auth << EOF
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    resource_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50),
    subject_id VARCHAR(50),
    subject_name VARCHAR(100),
    difficulty_level VARCHAR(50),
    duration INTEGER,
    author VARCHAR(100),
    external_url VARCHAR(500),
    file_path VARCHAR(500),
    tags TEXT[],
    is_viewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF
```

---

## 📊 Structure finales des BDs

```
edupath_auth
├── resources (15 colonnes)
│   ├── id (PK)
│   ├── resource_id (UK)
│   ├── title
│   ├── description
│   ├── resource_type
│   ├── subject_id
│   ├── subject_name
│   ├── difficulty_level
│   ├── duration
│   ├── author
│   ├── external_url
│   ├── file_path
│   ├── tags
│   ├── is_viewed
│   ├── created_at
│   └── updated_at

edupath_lms
├── sync_logs
├── raw_student_data
├── raw_grades
└── raw_connections

edupath_prepa
├── student_indicators
├── module_indicators
└── ...

[autres BDs...]
```

---

## ✅ Checklist post-création

```
[x] docker-compose up --build exécuté
[x] Attendre ~30 secondes
[x] postgres container est "healthy"
[x] edupath_auth base de données créée
[x] Table resources existe
[x] 15 colonnes présentes
[x] 3 indices créés
[x] Auth-service peut se connecter
[x] Aucune erreur dans les logs
[x] API endpoints fonctionnels
```

---

## 🎯 Résumé

| Question | Réponse |
|----------|---------|
| Créer manuellement? | ❌ Non, automatique |
| Où c'est créé? | Dans `init_databases.sh` |
| Quand c'est créé? | Au démarrage du conteneur |
| Combien de BDs? | 8 (une pour chaque service) |
| Quelle BD pour ressources? | `edupath_auth` |
| Quelle table pour ressources? | `resources` |
| Combien de colonnes? | 15 |
| Déploiement manuel? | ❌ Non, automatique |
| Connexion auto? | ✅ Oui (DATABASE_URL) |

---

**Status**: ✅ **CONFIGURATION AUTOMATIQUE COMPLÈTE**

Vous n'avez rien à faire! Docker s'occupe de tout. 🚀
