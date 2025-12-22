# 🔐 Guide d'Authentification - Solutions

## ✅ Problèmes Résolus

### 1. AdminConsole (http://localhost:3006)

**Avant**: Accessible sans authentification ❌

**Maintenant**: 
- ✅ Redirection automatique vers `/login` si non authentifié
- ✅ Authentification obligatoire pour accéder aux pages

**Identifiants Admin**:
- Email: `admin@edupath.com`
- Password: `admin123`

### 2. StudentPortal (http://localhost:3009)

**Avant**: Pas de compte étudiant disponible ❌

**Maintenant**:
- ✅ Compte étudiant par défaut créé automatiquement
- ✅ Identifiants affichés sur la page de login

**Identifiants Étudiant**:
- Email: `student@edupath.com`
- Password: `student123`

---

## 🚀 Utilisation

### AdminConsole

1. Accédez à **http://localhost:3006**
2. Vous serez automatiquement redirigé vers `/login`
3. Connectez-vous avec:
   ```
   Email: admin@edupath.com
   Password: admin123
   ```

### StudentPortal

1. Accédez à **http://localhost:3009/login**
2. Les identifiants sont affichés sur la page
3. Connectez-vous avec:
   ```
   Email: student@edupath.com
   Password: student123
   ```

---

## 🔧 Créer le Compte Étudiant (si nécessaire)

### Méthode 1: Via PowerShell (Recommandé)

```powershell
# Attendre que le service soit prêt
Start-Sleep -Seconds 10

# Créer le compte
$body = @{
    email = "student@edupath.com"
    password = "student123"
    full_name = "Student User"
    role = "student"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3008/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    Write-Host "✅ Compte créé avec succès!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Le compte existe déjà!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Erreur: $_" -ForegroundColor Yellow
    }
}
```

### Méthode 2: Via Postman

**POST** `http://localhost:3008/auth/register`

**Body (JSON):**
```json
{
  "email": "student@edupath.com",
  "password": "student123",
  "full_name": "Student User",
  "role": "student"
}
```

### Méthode 3: Via le Script

```powershell
cd EduPath-MS-EMSI
.\scripts\create-student.ps1
```

---

## ✅ Vérification

### Vérifier que les services fonctionnent

```powershell
# Vérifier Auth Service
Invoke-RestMethod -Uri "http://localhost:3008/health"

# Vérifier AdminConsole
# Ouvrir http://localhost:3006 → Doit rediriger vers /login

# Vérifier StudentPortal
# Ouvrir http://localhost:3009/login → Doit afficher les identifiants
```

### Tester la connexion

```powershell
# Test login admin
$formData = @{
    username = "admin@edupath.com"
    password = "admin123"
}
$response = Invoke-RestMethod -Uri "http://localhost:3008/auth/login" `
    -Method POST -Body $formData -ContentType "application/x-www-form-urlencoded"
$token = $response.access_token
Write-Host "Token obtenu: $($token.Substring(0, 20))..." -ForegroundColor Green

# Test login étudiant
$formData = @{
    username = "student@edupath.com"
    password = "student123"
}
$response = Invoke-RestMethod -Uri "http://localhost:3008/auth/login" `
    -Method POST -Body $formData -ContentType "application/x-www-form-urlencoded"
$token = $response.access_token
Write-Host "Token obtenu: $($token.Substring(0, 20))..." -ForegroundColor Green
```

---

## 🔄 Redémarrer les Services

Si vous avez des problèmes:

```powershell
# Redémarrer tous les services
docker-compose restart

# Ou redémarrer seulement auth-service
docker-compose restart auth-service

# Reconstruire si nécessaire
docker-compose build auth-service
docker-compose up -d auth-service
```

---

## 📋 Résumé des Comptes

| Rôle | Email | Password | Interface |
|------|-------|----------|-----------|
| Admin | `admin@edupath.com` | `admin123` | http://localhost:3006 |
| Student | `student@edupath.com` | `student123` | http://localhost:3009 |

---

## 🎯 Résultat Final

✅ **AdminConsole**: Protégé, authentification obligatoire
✅ **StudentPortal**: Compte étudiant disponible
✅ **Comptes par défaut**: Créés automatiquement

**Tout est maintenant sécurisé et fonctionnel !** 🎉

---

## 💡 Astuce

Si vous voulez créer d'autres comptes, utilisez l'interface AdminConsole après vous être connecté en tant qu'admin, ou utilisez l'API directement.

