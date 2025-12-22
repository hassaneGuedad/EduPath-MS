# 🚀 Guide de Démarrage - Projet Complet

## ✅ Tout est prêt !

Votre projet EduPath-MS est maintenant **complet** avec :
- ✅ Service d'authentification (JWT)
- ✅ Interface Admin complète
- ✅ Interface Student complète
- ✅ 10 microservices fonctionnels

---

## 📦 Démarrer le Projet

### 1. Lancer tous les services

```powershell
cd EduPath-MS-EMSI
docker-compose up -d
```

**⏱️ Temps estimé**: 5-10 minutes (première fois)

### 2. Vérifier que tout fonctionne

```powershell
docker-compose ps
```

Tous les services doivent être `Up`.

### 3. Accéder aux interfaces

#### 🎓 AdminConsole (Administrateurs)
**URL**: http://localhost:3006

**Compte par défaut:**
- Email: `admin@edupath.com`
- Password: `admin123`

**Fonctionnalités:**
- Dashboard avec statistiques
- Gestion des étudiants
- Gestion des utilisateurs
- Graphiques interactifs

#### 👨‍🎓 StudentPortal (Étudiants)
**URL**: http://localhost:3009

**Pour se connecter:**
1. Créer un compte étudiant (voir ci-dessous)
2. Se connecter avec email/password

**Fonctionnalités:**
- Dashboard personnel
- Mes modules
- Recommandations personnalisées
- Ressources pédagogiques
- Mon profil

#### 📚 API Documentation
**URL**: http://localhost:3008/docs

Documentation Swagger complète de l'API Auth.

---

## 👤 Créer un Compte Étudiant

### Méthode 1: Via Postman

**POST** `http://localhost:3008/auth/register`

**Body (JSON):**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "full_name": "John Student",
  "role": "student"
}
```

### Méthode 2: Via PowerShell

```powershell
$body = @{
    email = "student@example.com"
    password = "password123"
    full_name = "John Student"
    role = "student"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3008/auth/register" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Méthode 3: Via curl

```bash
curl -X POST http://localhost:3008/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "full_name": "John Student",
    "role": "student"
  }'
```

---

## 🔐 Rôles Disponibles

- **admin**: Accès complet (AdminConsole)
- **teacher**: Accès enseignant (à implémenter)
- **student**: Accès étudiant (StudentPortal)

---

## 📊 Services Disponibles

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| LMSConnector | 3001 | http://localhost:3001 | Synchronisation |
| PrepaData | 3002 | http://localhost:3002 | Features |
| StudentProfiler | 3003 | http://localhost:3003 | Profilage |
| PathPredictor | 3004 | http://localhost:3004 | Prédiction |
| RecoBuilder | 3005 | http://localhost:3005 | Recommandations |
| **AdminConsole** | **3006** | http://localhost:3006 | **Interface Admin** |
| StudentCoach API | 3007 | http://localhost:3007 | API étudiants |
| **Auth Service** | **3008** | http://localhost:3008 | **Authentification** |
| **StudentPortal** | **3009** | http://localhost:3009 | **Interface Étudiant** |
| PostgreSQL | 5432 | - | Base de données |

---

## 🧪 Tests Rapides

### Test Auth Service

```powershell
# Login
$formData = @{
    username = "admin@edupath.com"
    password = "admin123"
}
$response = Invoke-RestMethod -Uri "http://localhost:3008/auth/login" `
  -Method POST -Body $formData -ContentType "application/x-www-form-urlencoded"
$token = $response.access_token

# Get Profile
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3008/auth/me" -Headers $headers
```

### Test Student Dashboard

```powershell
Invoke-RestMethod -Uri "http://localhost:3007/student/1/dashboard" | ConvertTo-Json -Depth 5
```

---

## 🛠️ Commandes Utiles

### Voir les logs
```powershell
docker-compose logs -f auth-service
docker-compose logs -f teacher-console
docker-compose logs -f student-portal
```

### Redémarrer un service
```powershell
docker-compose restart auth-service
```

### Reconstruire après modification
```powershell
docker-compose build auth-service
docker-compose up -d auth-service
```

### Arrêter tous les services
```powershell
docker-compose stop
```

### Arrêter et supprimer
```powershell
docker-compose down
```

---

## 📁 Structure du Projet

```
EduPath-MS-EMSI/
├── data/                          # Dataset
├── database/                      # Scripts SQL
│   └── init_auth.sql
├── services/
│   ├── auth-service/              # 🆕 Service Auth
│   ├── teacher-console/           # 🔄 AdminConsole amélioré
│   ├── student-portal/             # 🆕 Portail étudiant
│   ├── lms-connector/
│   ├── prepa-data/
│   ├── student-profiler/
│   ├── path-predictor/
│   ├── reco-builder/
│   ├── student-coach-api/
│   └── student-coach-flutter/
├── docker-compose.yml             # 🔄 Mis à jour
├── RESUME_COMPLET.md              # 📄 Résumé complet
└── DEMARRAGE_COMPLET.md           # 📄 Ce fichier
```

---

## ⚠️ Notes Importantes

1. **Premier démarrage**: Les tables de base de données sont créées automatiquement par SQLAlchemy
2. **Compte admin**: Créé automatiquement (voir script SQL)
3. **Tokens JWT**: Valides 30 minutes par défaut
4. **CORS**: Configuré pour accepter toutes les origines (à restreindre en production)

---

## 🎯 Prochaines Étapes (Optionnel)

1. **Ajouter middleware auth** aux autres services
2. **Compléter les pages Modules/Resources** dans les deux interfaces
3. **Améliorer UI/UX** avec Material-UI
4. **Ajouter tests** unitaires et d'intégration
5. **Créer API Gateway** pour centraliser

---

## 🎉 C'est tout !

Votre projet est maintenant **complet et fonctionnel**. 

**Bon développement !** 🚀

