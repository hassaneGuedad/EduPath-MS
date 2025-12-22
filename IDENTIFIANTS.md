# 🔐 Identifiants de Connexion

## ✅ Comptes Disponibles

### 👨‍💼 Compte Administrateur

**Interface**: http://localhost:3006

- **Email**: `admin@edupath.com`
- **Password**: `admin123`
- **Rôle**: admin

**Fonctionnalités**:
- Dashboard avec statistiques
- Gestion des étudiants
- Gestion des utilisateurs
- Graphiques interactifs

### 👨‍🎓 Compte Étudiant

**Interface**: http://localhost:3009

- **Email**: `student@edupath.com`
- **Password**: `student123`
- **Rôle**: student

**Fonctionnalités**:
- Dashboard personnel
- Mes modules
- Recommandations personnalisées
- Ressources pédagogiques
- Mon profil

---

## 🚀 Comment Se Connecter

### AdminConsole

1. Ouvrez http://localhost:3006
2. Vous serez automatiquement redirigé vers `/login`
3. Entrez:
   - Email: `admin@edupath.com`
   - Password: `admin123`
4. Cliquez sur "Se connecter"

### StudentPortal

1. Ouvrez http://localhost:3009/login
2. Les identifiants sont affichés sur la page
3. Entrez:
   - Email: `student@edupath.com`
   - Password: `student123`
4. Cliquez sur "Se connecter"

---

## ✅ Vérification

Les comptes sont **créés et fonctionnels**. Vous pouvez vous connecter immédiatement !

---

## 🔄 Créer de Nouveaux Comptes

Si vous voulez créer d'autres comptes, utilisez l'API :

```powershell
$body = @{
    email = "nouveau@example.com"
    password = "password123"
    full_name = "Nouveau Utilisateur"
    role = "student"  # ou "admin" ou "teacher"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3008/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

**🎉 Tout est prêt ! Connectez-vous maintenant !**

