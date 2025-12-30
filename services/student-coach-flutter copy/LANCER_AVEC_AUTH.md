# 🔐 Lancer l'Application avec Authentification

## ✅ Services Requis

Assurez-vous que ces services sont démarrés :

```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
docker-compose up -d postgres auth-service student-coach-api prepa-data student-profiler
```

**Services actifs** :
- 🗄️ PostgreSQL (port 5432)
- 🔐 Auth Service (port 3008)
- 📊 StudentCoach API (port 3007)
- 📈 PrepaData API (port 3002)
- 🎯 StudentProfiler API (port 3003)

---

## 🚀 Lancer l'Application Flutter

### Étape 1 : Installer les dépendances
```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-flutter
flutter pub get
```

### Étape 2 : Lancer sur Chrome
```powershell
flutter run -d chrome
```

---

## 🔑 Comptes de Test

### Compte Étudiant (Par défaut)
```
Email    : student@edupath.com
Password : student123
```

### Compte Admin
```
Email    : admin@edupath.com
Password : admin123
```

---

## 📱 Fonctionnement de la Connexion

### 1. Écran de Connexion
L'application démarre sur l'écran de connexion où vous entrez :
- **Email** : Votre adresse email
- **Mot de passe** : Votre mot de passe

### 2. Authentification
- Le système vérifie vos identifiants via l'API Auth (port 3008)
- Si valides, vous recevez un **token JWT**
- Le token est sauvegardé localement (SharedPreferences)

### 3. Dashboard
- Après connexion, vous accédez au dashboard
- Les données affichées correspondent à votre profil étudiant
- Le **student_id** est récupéré depuis votre compte utilisateur

### 4. Session Persistante
- Une fois connecté, vous restez connecté
- Le token est vérifié automatiquement au démarrage
- Utilisez le bouton de déconnexion pour vous déconnecter

---

## 🔗 Lien Email ↔ Student ID

### Base de Données Auth

La table `users` contient :
```sql
id | email                  | full_name    | student_id | role    | is_active
---|------------------------|--------------|------------|---------|----------
1  | student@edupath.com    | Student User | 12345      | student | true
2  | admin@edupath.com      | Admin User   | NULL       | admin   | true
```

### Créer un Nouveau Compte Étudiant

#### Via l'API :
```powershell
$body = @{
    email = "nouvel.etudiant@edupath.com"
    password = "motdepasse123"
    full_name = "Nom Complet"
    student_id = 12346
    role = "student"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3008/auth/register" -Method POST -ContentType "application/json" -Body $body
```

#### Via le Script :
```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\scripts
.\create-student.ps1 -Email "etudiant@test.com" -StudentId 12347 -Password "test123"
```

---

## 🛠️ Vérification du Service Auth

### Test de connexion manuel :
```powershell
$credentials = @{
    username = "student@edupath.com"
    password = "student123"
}

Invoke-RestMethod -Uri "http://localhost:3008/auth/login" -Method POST -ContentType "application/x-www-form-urlencoded" -Body $credentials
```

**Résultat attendu** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Test récupération profil :
```powershell
$token = "VOTRE_TOKEN_ICI"
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3008/auth/me" -Headers $headers
```

**Résultat attendu** :
```json
{
  "id": 1,
  "email": "student@edupath.com",
  "full_name": "Student User",
  "student_id": 12345,
  "role": "student",
  "is_active": true
}
```

---

## 🔄 Workflow Complet

```
1. Utilisateur ouvre l'app
   ↓
2. Vérification token local
   ├─ Token valide → Dashboard
   └─ Pas de token → Écran de connexion
      ↓
3. Utilisateur entre email + mot de passe
   ↓
4. Envoi à http://localhost:3008/auth/login
   ↓
5. API Auth vérifie dans PostgreSQL
   ├─ Valide → Retourne token JWT
   └─ Invalide → Erreur
      ↓
6. Token sauvegardé localement
   ↓
7. Récupération user info (avec student_id)
   ↓
8. Navigation vers Dashboard
   ↓
9. Dashboard utilise student_id pour afficher les données
```

---

## 🧪 Tests Recommandés

### Test 1 : Connexion avec compte par défaut
1. Lancer l'app
2. Utiliser `student@edupath.com` / `student123`
3. Vérifier l'accès au dashboard

### Test 2 : Mauvais identifiants
1. Entrer un email inexistant
2. Vérifier le message d'erreur

### Test 3 : Session persistante
1. Se connecter
2. Fermer l'app (Ctrl+C dans le terminal)
3. Relancer l'app
4. Vérifier que vous êtes toujours connecté

### Test 4 : Déconnexion
1. Cliquer sur le bouton de déconnexion
2. Vérifier le retour à l'écran de connexion

---

## 🐛 Dépannage

### Erreur : "Délai de connexion expiré"
**Cause** : Service auth non démarré ou inaccessible

**Solution** :
```powershell
docker-compose up -d auth-service
Start-Sleep -Seconds 5
# Puis relancer Flutter
```

### Erreur : "Email ou mot de passe incorrect"
**Cause** : Identifiants invalides ou compte inexistant

**Solution** :
1. Vérifier les identifiants
2. Créer le compte si nécessaire :
```powershell
Invoke-RestMethod -Uri "http://localhost:3008/auth/register" -Method POST -Body (...)
```

### Token expiré
**Cause** : Le token JWT a une durée de vie de 30 minutes

**Solution** :
1. Se déconnecter
2. Se reconnecter pour obtenir un nouveau token

---

## 📊 Architecture Technique

```
┌─────────────────────┐
│  Flutter App        │
│  (Chrome)           │
└──────────┬──────────┘
           │
           ├─ POST /auth/login
           │  └─> Token JWT
           │
           ├─ GET /auth/me
           │  └─> User Info + student_id
           │
           └─ GET /student/{id}/dashboard
              └─> Données étudiant
                  
┌─────────────────────┐
│  Auth Service       │
│  Port 3008          │
└──────────┬──────────┘
           │
           ├─ PostgreSQL
           │  └─> Table users
           │
           └─ JWT Token
              └─> Email, Role, Expiration

┌─────────────────────┐
│  StudentCoach API   │
│  Port 3007          │
└─────────────────────┘
```

---

## 📝 Commande Rapide (Tout-en-un)

```powershell
# Démarrer tous les services
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
docker-compose up -d postgres auth-service student-coach-api prepa-data student-profiler

# Attendre le démarrage
Start-Sleep -Seconds 10

# Lancer Flutter
cd services\student-coach-flutter
flutter pub get
flutter run -d chrome
```

---

**Dernière mise à jour** : 21 décembre 2025  
**Version** : 1.0.0 avec authentification JWT  
**Services** : Auth (3008) + StudentCoach (3007)
