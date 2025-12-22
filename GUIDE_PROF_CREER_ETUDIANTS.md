# 👨‍🏫 Guide Professeur : Créer des Comptes Étudiants

## 🎯 Vue d'ensemble

Quand vous créez un nouveau compte étudiant dans **localhost**, l'étudiant peut **immédiatement se connecter** à l'application Flutter mobile avec ses identifiants.

**Système automatique :**
1. Prof crée compte → Base de données localhost (avec student_id auto-généré)
2. Étudiant se connecte → Application Flutter
3. Authentification JWT → Données personnalisées

**✨ Nouveau : Le student_id est automatiquement généré** si vous ne le spécifiez pas !

---

## 📝 Méthode 1 : Script PowerShell (RECOMMANDÉ)

### Utilisation :

**Avec auto-génération du Student ID (RECOMMANDÉ) :**
```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\scripts
.\creer-etudiant.ps1 -Email "nouvel.etudiant@emsi-edu.ma" -FullName "Nouvel Étudiant" -Password "motdepasse123"
```

**Avec Student ID manuel :**
```powershell
.\creer-etudiant.ps1 -Email "nouvel.etudiant@emsi-edu.ma" -FullName "Nouvel Étudiant" -StudentId 12500 -Password "motdepasse123"
```

### Paramètres :
- **Email** : Adresse email de l'étudiant (obligatoire)
- **FullName** : Nom complet (obligatoire)
- **StudentId** : ID unique de l'étudiant (✨ OPTIONNEL - auto-généré si non fourni)
- **Password** : Mot de passe (défaut: student123)
- **FirstName** : Prénom (optionnel, extrait du FullName)
- **LastName** : Nom de famille (optionnel, extrait du FullName)

### Exemples :

**Exemple 1 : Création simple avec auto-génération du Student ID** ⭐
```powershell
.\creer-etudiant.ps1 -Email "sarah.mansouri@emsi-edu.ma" -FullName "Sarah Mansouri"
# Le système génère automatiquement le Student ID (12404, 12405, etc.)
```

**Exemple 2 : Avec mot de passe personnalisé**
```powershell
.\creer-etudiant.ps1 -Email "karim.aziz@emsi-edu.ma" -FullName "Karim Aziz" -Password "karim2024"
```

**Exemple 3 : Avec Student ID manuel (pour migration ou cas spécifique)**
```powershell
.\creer-etudiant.ps1 -Email "amina.tazi@emsi-edu.ma" -FullName "Amina Tazi" -StudentId 12500
```

---

## 📝 Méthode 2 : Via API REST (Postman/Swagger)

### Endpoint :
```
POST http://localhost:3008/auth/register
```

### Headers :
```
Content-Type: application/json
```

### Body (JSON) :
```json
{
  "email": "nouvel.etudiant@emsi-edu.ma",
  "password": "motdepasse123",
  "full_name": "Nouvel Étudiant",
  "first_name": "Nouvel",
  "last_name": "Étudiant",
  "student_id": 12400,
  "role": "student"
}
```

### Avec PowerShell :
```powershell
$body = @{
    email = "nouvel.etudiant@emsi-edu.ma"
    password = "motdepasse123"
    full_name = "Nouvel Étudiant"
    first_name = "Nouvel"
    last_name = "Étudiant"
    student_id = 12400
    role = "student"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3008/auth/register" -Method POST -ContentType "application/json" -Body $body
```

---

## 📝 Méthode 3 : Directement dans PostgreSQL

### Si l'API ne fonctionne pas :

```powershell
# 1. Générer le hash du mot de passe
$password = "motdepasse123"
$hash = docker exec -it edupath-auth-service python -c "from src.utils.password import get_password_hash; import sys; sys.stdout.write(get_password_hash('$password'))"

# 2. Insérer dans la base
docker exec -it edupath-postgres psql -U edupath -d edupath_auth -c "
INSERT INTO users (email, password_hash, full_name, first_name, last_name, student_id, role, is_active) 
VALUES ('nouvel.etudiant@emsi-edu.ma', '$hash', 'Nouvel Étudiant', 'Nouvel', 'Étudiant', 12400, 'student', true);
"
```

---

## 🔢 Gestion des Student IDs

### ✨ Auto-génération (Recommandé) :
- Quand vous n'utilisez pas `-StudentId`, le système trouve automatiquement le prochain ID disponible
- Aucun risque de doublon
- Simplifie la création de comptes

### Student IDs déjà utilisés :
- **12345** : Mohamed Alami (At Risk)
- **12346** : Fatima Benali (High Performer)
- **12347** : Youssef Kadiri (Average)
- **12348-12354** : Autres étudiants EMSI
- **12400-12403** : hassan15guedad, ayoubbouhdary, student@edupath, mouhssinguedad15

### Pour les nouveaux étudiants :
- **Option 1 (Recommandé)** : Ne pas spécifier StudentId → auto-généré
- **Option 2** : Spécifier manuellement (utile pour migration depuis autre système)

### Vérifier si un Student ID est disponible :
```powershell
docker exec -it edupath-postgres psql -U edupath -d edupath_auth -c "SELECT email, student_id FROM users WHERE student_id = 12500;"
```

### Voir le prochain Student ID qui sera généré :
```powershell
docker exec edupath-postgres psql -U edupath -d edupath_auth -t -c "SELECT COALESCE(MAX(student_id), 12399) + 1 FROM users;"
```

---

## ✅ Vérification et Tests

### 1. Vérifier que le compte existe :
```powershell
docker exec -it edupath-postgres psql -U edupath -d edupath_auth -c "SELECT id, email, full_name, student_id, role FROM users WHERE email = 'nouvel.etudiant@emsi-edu.ma';"
```

### 2. Tester la connexion :
```powershell
$credentials = @{
    username = "nouvel.etudiant@emsi-edu.ma"
    password = "motdepasse123"
}
Invoke-RestMethod -Uri "http://localhost:3008/auth/login" -Method POST -ContentType "application/x-www-form-urlencoded" -Body $credentials
```

**Résultat attendu :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. L'étudiant se connecte à Flutter :
1. Ouvrir l'application Flutter sur Chrome
2. Entrer : `nouvel.etudiant@emsi-edu.ma` / `motdepasse123`
3. Dashboard s'affiche avec ses données

---

## ⚠️ Notes Importantes

### Student ID et Données
- **Avec Student ID** : L'étudiant voit son dashboard personnalisé
- **Sans Student ID** : L'authentification fonctionne, mais dashboard vide
- **Student ID sans données** : Dashboard vide mais fonctionnel

### Mot de passe
- **Par défaut** : `student123` (si non spécifié)
- **Personnalisé** : Utilisez un mot de passe fort
- **Réinitialisation** : Via le même script ou API

### Sécurité
- Les mots de passe sont **hashés avec bcrypt**
- Tokens JWT expirent après **30 minutes**
- Ne jamais stocker les mots de passe en clair

---

## 🔄 Créer Plusieurs Comptes en Batch

### Script PowerShell pour création en masse :

**Avec auto-génération des Student IDs (Recommandé) :**
```powershell
# Liste des étudiants (pas besoin de StudentId)
$students = @(
    @{Email="student1@emsi-edu.ma"; FullName="Student One"},
    @{Email="student2@emsi-edu.ma"; FullName="Student Two"},
    @{Email="student3@emsi-edu.ma"; FullName="Student Three"}
)

foreach ($student in $students) {
    Write-Host "`n🔄 Création de $($student.FullName)..." -ForegroundColor Cyan
    .\creer-etudiant.ps1 -Email $student.Email -FullName $student.FullName -Password "student123"
    Start-Sleep -Seconds 2
}

Write-Host "`n✅ Tous les comptes créés avec Student IDs auto-générés !" -ForegroundColor Green
```

**Avec Student IDs manuels (pour migration) :**
```powershell
# Liste des étudiants avec IDs spécifiques
$students = @(
    @{Email="student1@emsi-edu.ma"; FullName="Student One"; StudentId=12500},
    @{Email="student2@emsi-edu.ma"; FullName="Student Two"; StudentId=12501},
    @{Email="student3@emsi-edu.ma"; FullName="Student Three"; StudentId=12502}
)

foreach ($student in $students) {
    Write-Host "`n🔄 Création de $($student.FullName)..." -ForegroundColor Cyan
    .\creer-etudiant.ps1 -Email $student.Email -FullName $student.FullName -StudentId $student.StudentId -Password "student123"
    Start-Sleep -Seconds 2
}

Write-Host "`n✅ Tous les comptes créés !" -ForegroundColor Green
```

---

## 📊 Exemple Complet : Nouvelle Classe

**Avec auto-génération (Plus rapide et sans risque de doublon) :**
```powershell
# Créer une classe de 5 étudiants
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\scripts

# Étudiants créés avec Student IDs auto-générés
.\creer-etudiant.ps1 -Email "ali.hassan@emsi-edu.ma" -FullName "Ali Hassan"
.\creer-etudiant.ps1 -Email "sofia.idrissi@emsi-edu.ma" -FullName "Sofia Idrissi"
.\creer-etudiant.ps1 -Email "omar.benjelloun@emsi-edu.ma" -FullName "Omar Benjelloun"
.\creer-etudiant.ps1 -Email "leila.amrani@emsi-edu.ma" -FullName "Leila Amrani"
.\creer-etudiant.ps1 -Email "youssef.mansouri@emsi-edu.ma" -FullName "Youssef Mansouri"
```

**Avec Student IDs manuels (pour cas spécifiques) :**
```powershell
# Si vous devez utiliser des IDs spécifiques
.\creer-etudiant.ps1 -Email "ali.hassan@emsi-edu.ma" -FullName "Ali Hassan" -StudentId 12500
.\creer-etudiant.ps1 -Email "sofia.idrissi@emsi-edu.ma" -FullName "Sofia Idrissi" -StudentId 12501
.\creer-etudiant.ps1 -Email "omar.benjelloun@emsi-edu.ma" -FullName "Omar Benjelloun" -StudentId 12502
```
```

**Tous peuvent maintenant se connecter à Flutter avec leur email et `student123` !**

---

## 🐛 Dépannage

### Erreur : "Service Auth non accessible"
```powershell
docker-compose up -d auth-service
Start-Sleep -Seconds 10
```

### Erreur : "Email déjà utilisé"
Le script met automatiquement à jour le compte existant

### Erreur : "Student ID déjà utilisé"
Choisissez un autre Student ID disponible

### Dashboard vide après connexion
- Le Student ID n'a pas de données dans PrepaData
- C'est normal pour les nouveaux étudiants
- Les données seront ajoutées progressivement

---

## 📞 Contacts

**Pour toute question :**
- Voir la documentation : `services/student-coach-flutter/GUIDE_CONNEXION.md`
- Tester l'API : `http://localhost:3008/docs`

---

**Dernière mise à jour** : 22 décembre 2025  
**Version** : 1.0.0 avec authentification JWT
