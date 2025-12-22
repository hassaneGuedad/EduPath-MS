# 🔐 Guide de Connexion - Application StudentCoach

## ✅ Problème Résolu : Mots de Passe Mis à Jour

Les mots de passe des comptes étudiants ont été réinitialisés. Vous pouvez maintenant vous connecter !

---

## 🔑 COMPTES DISPONIBLES

### 🔴 Étudiant At Risk (ID: 12345)
```
📧 Email    : mohamed.alami@emsi-edu.ma
🔒 Password : student123
📊 Profil   : At Risk - Besoin d'aide (37.67%)
```

### 🟢 Étudiant High Performer (ID: 12346)
```
📧 Email    : fatima.benali@emsi-edu.ma
🔒 Password : student123
📊 Profil   : High Performer - Excellence (95%)
```

### 🔵 Étudiant Average Learner (ID: 12347)
```
📧 Email    : youssef.kadiri@emsi-edu.ma
🔒 Password : student123
📊 Profil   : Average - Performance moyenne (70%)
```

---

## 🚀 LANCER L'APPLICATION

### Option 1 : Script Automatique (Recommandé)
```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
.\LANCER_AVEC_AUTH.ps1
```

### Option 2 : Manuelle
```powershell
# 1. Démarrer les services
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
docker-compose up -d postgres auth-service student-coach-api prepa-data student-profiler

# 2. Attendre le démarrage (10 secondes)
Start-Sleep -Seconds 10

# 3. Lancer Flutter
cd services\student-coach-flutter
flutter run -d chrome
```

---

## 📱 UTILISATION

### 1. Écran de Connexion
- L'application démarre avec un écran de connexion
- Entrez l'email et le mot de passe d'un des comptes ci-dessus

### 2. Dashboard Personnalisé
- Après connexion, vous voyez le **dashboard personnalisé**
- Les données correspondent à **votre student_id**
- Progression, recommandations, coaching personnalisés

### 3. Session Persistante
- Une fois connecté, vous **restez connecté**
- Même après avoir fermé et rouvert l'application
- Le token JWT est sauvegardé localement

### 4. Déconnexion
- Utilisez le bouton de déconnexion pour changer de compte
- Retour automatique à l'écran de connexion

---

## 🔄 Tester les 3 Profils

### Test 1 : Étudiant At Risk (12345)
```
1. Se connecter avec : mohamed.alami@emsi-edu.ma / student123
2. Observer : Score 37.67%, conseils urgents, engagement faible
3. Se déconnecter
```

### Test 2 : Étudiant High Performer (12346)
```
1. Se connecter avec : fatima.benali@emsi-edu.ma / student123
2. Observer : Score 95%, recommandations avancées, excellent engagement
3. Se déconnecter
```

### Test 3 : Étudiant Average (12347)
```
1. Se connecter avec : youssef.kadiri@emsi-edu.ma / student123
2. Observer : Score 70%, conseils d'amélioration, engagement moyen
3. Se déconnecter
```

---

## 🧪 VÉRIFICATION MANUELLE

### Tester l'API Auth directement :
```powershell
# Connexion Mohamed (At Risk)
$body = @{username="mohamed.alami@emsi-edu.ma"; password="student123"}
Invoke-RestMethod -Uri "http://localhost:3008/auth/login" -Method POST -ContentType "application/x-www-form-urlencoded" -Body $body

# Connexion Fatima (High Performer)
$body = @{username="fatima.benali@emsi-edu.ma"; password="student123"}
Invoke-RestMethod -Uri "http://localhost:3008/auth/login" -Method POST -ContentType "application/x-www-form-urlencoded" -Body $body

# Connexion Youssef (Average)
$body = @{username="youssef.kadiri@emsi-edu.ma"; password="student123"}
Invoke-RestMethod -Uri "http://localhost:3008/auth/login" -Method POST -ContentType "application/x-www-form-urlencoded" -Body $body
```

**Résultat attendu** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

**Dernière mise à jour** : 22 décembre 2025  
**Mot de passe unique** : `student123` pour tous les comptes  
**Services requis** : Auth (3008), StudentCoach (3007), PostgreSQL (5432)
