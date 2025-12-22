# 🗺️ Roadmap - Développement Projet Complet

## Phase 1 : Authentification (Semaine 1)

### ✅ Tâches
- [ ] Créer service `auth-service` avec FastAPI
- [ ] Créer tables `users` et `sessions` dans PostgreSQL
- [ ] Implémenter endpoints : `/auth/register`, `/auth/login`, `/auth/refresh`
- [ ] Ajouter hashage de mots de passe (bcrypt)
- [ ] Génération tokens JWT
- [ ] Tester avec Postman

### 📁 Fichiers à créer
```
services/auth-service/
├── src/
│   ├── app.py
│   ├── models.py
│   ├── routes/
│   │   └── auth.py
│   └── utils/
│       ├── jwt.py
│       └── password.py
├── requirements.txt
└── Dockerfile
```

---

## Phase 2 : Améliorer AdminConsole (Semaine 2)

### ✅ Tâches
- [ ] Renommer `teacher-console` → `admin-console`
- [ ] Ajouter React Router
- [ ] Créer page Login
- [ ] Créer page Dashboard améliorée
- [ ] Créer page Gestion Utilisateurs
- [ ] Créer page Gestion Modules
- [ ] Créer page Gestion Ressources
- [ ] Ajouter authentification (JWT dans headers)
- [ ] Créer composants Layout (Sidebar, Header)

### 📁 Structure
```
services/admin-console/src/
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Users/
│   ├── Modules/
│   └── Resources/
├── components/
│   └── Layout/
└── services/
    └── api.js
```

---

## Phase 3 : Créer StudentPortal (Semaine 3)

### ✅ Tâches
- [ ] Créer nouvelle app React `student-portal`
- [ ] Setup Vite + React Router
- [ ] Créer page Login
- [ ] Créer page Dashboard étudiant
- [ ] Créer page Mes Modules
- [ ] Créer page Recommandations
- [ ] Créer page Ressources
- [ ] Intégrer avec StudentCoach API
- [ ] Ajouter authentification

---

## Phase 4 : Middleware Auth (Semaine 4)

### ✅ Tâches
- [ ] Ajouter middleware auth dans PrepaData
- [ ] Ajouter middleware auth dans StudentProfiler
- [ ] Ajouter middleware auth dans PathPredictor
- [ ] Ajouter middleware auth dans RecoBuilder
- [ ] Ajouter middleware auth dans StudentCoach API
- [ ] Tester tous les endpoints avec tokens

---

## Phase 5 : API Gateway (Optionnel - Semaine 5)

### ✅ Tâches
- [ ] Créer service `api-gateway`
- [ ] Router toutes les requêtes
- [ ] Centraliser authentification
- [ ] Ajouter rate limiting
- [ ] Ajouter logging

---

## 🚀 Démarrage Rapide - Commencer Maintenant

### Option A : Commencer par Auth Service

```bash
# 1. Créer le dossier
mkdir -p services/auth-service/src

# 2. Créer requirements.txt
cd services/auth-service
# Ajouter FastAPI, SQLAlchemy, JWT, bcrypt

# 3. Créer app.py basique
# 4. Tester localement
# 5. Ajouter au docker-compose.yml
```

### Option B : Améliorer AdminConsole d'abord

```bash
cd services/teacher-console

# 1. Installer React Router
npm install react-router-dom

# 2. Créer structure de pages
# 3. Ajouter routing
# 4. Améliorer UI avec Material-UI
npm install @mui/material @emotion/react @emotion/styled
```

---

## 📊 Checklist Projet Complet

### Backend
- [x] Microservices fonctionnels
- [ ] Service Auth
- [ ] Middleware auth sur tous les services
- [ ] Base de données avec tables utilisateurs
- [ ] API Gateway (optionnel)

### Frontend Admin
- [x] Dashboard basique
- [ ] Authentification
- [ ] Gestion utilisateurs
- [ ] Gestion modules
- [ ] Gestion ressources
- [ ] Rapports

### Frontend User
- [ ] Dashboard étudiant
- [ ] Mes modules
- [ ] Recommandations
- [ ] Ressources
- [ ] Profil

### Mobile
- [x] Structure Flutter basique
- [ ] Authentification
- [ ] Dashboard complet
- [ ] Notifications push

---

## 🎯 Objectif Final

**Un projet complet avec :**
- ✅ Authentification sécurisée (JWT)
- ✅ Interface Admin complète (gestion tout)
- ✅ Interface User complète (web + mobile)
- ✅ Tous les microservices protégés
- ✅ Base de données persistante
- ✅ Documentation complète

**Temps estimé : 4-6 semaines pour une équipe de 3 étudiants**

