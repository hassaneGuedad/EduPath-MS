# 🔧 Configuration Application Flutter StudentCoach

## 📊 Changement d'Étudiant Affiché

Pour afficher un étudiant différent, modifiez le fichier :
```
lib/config/app_config.dart
```

### Étudiants Disponibles

```dart
// Ligne 9 du fichier app_config.dart
static const int currentStudentId = 12345; // Changez cette valeur
```

#### Options :

**1. Étudiant At Risk (Besoin d'aide)**
```dart
static const int currentStudentId = 12345;
```
- Score : 37.67%
- Profil : At Risk ⚠️
- Conseils : Urgents

**2. Étudiant High Performer (Excellence)**
```dart
static const int currentStudentId = 12346;
```
- Score : 95%
- Profil : High Performer ✅
- Conseils : Challenges avancés

**3. Étudiant Average Learner (Moyen)**
```dart
static const int currentStudentId = 12347;
```
- Score : 70%
- Profil : Average Learner ℹ️
- Conseils : Amélioration

---

## 🔄 Appliquer les Changements

### Méthode 1 : Hot Reload (Rapide)
Dans le terminal Flutter, appuyez sur :
```
r
```

### Méthode 2 : Hot Restart (Complet)
Dans le terminal Flutter, appuyez sur :
```
R
```

### Méthode 3 : Redémarrage Complet
```
q  (quitter)
flutter run -d chrome  (relancer)
```

---

## 🌐 Configuration API

Si vous devez changer l'URL de l'API, modifiez dans `app_config.dart` :

```dart
// Ligne 12
static const String apiBaseUrl = 'http://localhost:3007';
```

### Endpoints Utilisés :
- `/student/{id}/progress` - Progression
- `/student/{id}/recommendations` - Recommandations

---

## 📍 Vérification des Données

### Tester manuellement l'API :

```powershell
# Étudiant 12345 (At Risk)
Invoke-RestMethod -Uri "http://localhost:3007/student/12345/progress"

# Étudiant 12346 (High Performer)
Invoke-RestMethod -Uri "http://localhost:3007/student/12346/progress"

# Étudiant 12347 (Average)
Invoke-RestMethod -Uri "http://localhost:3007/student/12347/progress"
```

---

## 🔧 Dépannage

### Problème : "Aucune donnée disponible"

**Cause possible** : ID étudiant n'existe pas dans la base

**Solution** :
1. Vérifiez que l'API est active : http://localhost:3007/docs
2. Testez l'endpoint manuellement (voir ci-dessus)
3. Vérifiez l'ID dans `app_config.dart`
4. Faites un Hot Restart (R) dans Flutter

### Problème : Données mockées affichées

**Cause** : Application en mode offline/demo

**Solution** :
1. Vérifiez `app_config.dart` - `currentStudentId` doit être 12345, 12346 ou 12347
2. Redémarrez l'application Flutter (q puis flutter run)

### Problème : Erreur de connexion API

**Cause** : Services backend non démarrés

**Solution** :
```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
docker-compose up -d
```

---

## 📁 Structure des Fichiers Modifiés

```
student-coach-flutter/
├── lib/
│   ├── config/
│   │   └── app_config.dart          ← Configuration centralisée
│   ├── services/
│   │   └── api_service.dart         ← Utilise app_config
│   └── screens/
│       └── dashboard_screen.dart    ← Utilise app_config
```

---

## 🚀 Résumé Rapide

**Pour changer d'étudiant :**
1. Ouvrir `lib/config/app_config.dart`
2. Changer `currentStudentId` (12345, 12346, ou 12347)
3. Dans le terminal Flutter, appuyer sur `r` (hot reload)

**Les données affichées viendront maintenant de votre localhost !**

---

**Fichier créé le** : 21 décembre 2025  
**Version Flutter** : 3.35.5
