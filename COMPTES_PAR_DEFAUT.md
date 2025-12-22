# 🔐 Comptes par Défaut

## Comptes Disponibles

### 👨‍💼 Compte Administrateur

**URL**: http://localhost:3006

- **Email**: `admin@edupath.com`
- **Password**: `admin123`
- **Rôle**: admin
- **Accès**: AdminConsole complet

### 👨‍🎓 Compte Étudiant

**URL**: http://localhost:3009

- **Email**: `student@edupath.com`
- **Password**: `student123`
- **Rôle**: student
- **Accès**: StudentPortal

---

## 📝 Créer un Nouveau Compte

### Méthode 1: Via PowerShell

```powershell
cd EduPath-MS-EMSI
.\scripts\create-student.ps1
```

### Méthode 2: Via Postman

**POST** `http://localhost:3008/auth/register`

**Body (JSON):**
```json
{
  "email": "nouveau@example.com",
  "password": "password123",
  "full_name": "Nouveau Étudiant",
  "role": "student"
}
```

### Méthode 3: Via PowerShell (manuel)

```powershell
$body = @{
    email = "nouveau@example.com"
    password = "password123"
    full_name = "Nouveau Étudiant"
    role = "student"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3008/auth/register" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Méthode 4: Via curl

```bash
curl -X POST http://localhost:3008/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau@example.com",
    "password": "password123",
    "full_name": "Nouveau Étudiant",
    "role": "student"
  }'
```

---

## ⚠️ Notes

- Les comptes par défaut sont créés automatiquement au premier démarrage
- Les mots de passe sont hashés avec bcrypt
- En production, changez tous les mots de passe par défaut
- Le compte admin peut créer d'autres utilisateurs via l'interface AdminConsole

---

## 🔄 Réinitialiser les Comptes

Si vous devez réinitialiser les comptes :

1. Arrêter les services : `docker-compose down -v`
2. Redémarrer : `docker-compose up -d`
3. Les comptes seront recréés automatiquement

