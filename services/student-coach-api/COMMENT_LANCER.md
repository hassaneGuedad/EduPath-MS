# 🚀 COMMENT LANCER L'API STUDENTCOACH

## ⚠️ IMPORTANT : Bon Répertoire

Vous devez être dans le répertoire **EduPath-MS-EMSI**, pas dans `Edu_Path` !

### ✅ BON :
```
C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
```

### ❌ MAUVAIS :
```
C:\Users\youbitech\Desktop\Edu_Path
```

---

## 📍 Méthode 1 : Script PowerShell (RECOMMANDÉ)

### Depuis n'importe où :
```powershell
& "C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-api\start.ps1"
```

### Depuis le répertoire du projet :
```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
.\services\student-coach-api\start.ps1
```

---

## 📍 Méthode 2 : Commandes Manuelles

```powershell
# 1. Aller dans le BON répertoire
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-api

# 2. Configurer l'environnement
$env:PYTHONPATH = (Get-Location).Path

# 3. Arrêter l'ancien container Docker (optionnel)
docker stop edupath-student-coach-api

# 4. Lancer l'API
& "C:\Users\youbitech\Desktop\Edu_Path\.venv\Scripts\uvicorn.exe" src.main:app --host 127.0.0.1 --port 3007 --reload
```

---

## 📍 Méthode 3 : Commande Courte (depuis EduPath-MS-EMSI)

```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-api
$env:PYTHONPATH = $PWD.Path
C:\Users\youbitech\Desktop\Edu_Path\.venv\Scripts\uvicorn.exe src.main:app --port 3007 --reload
```

---

## 🌐 Une fois démarré

### Documentation Interactive (Swagger)
```
http://localhost:3007/docs
```

### Test Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3007/health"
```

### Test Message Motivant
```powershell
Invoke-RestMethod -Uri "http://localhost:3007/student/12346/motivational-message"
```

### Test Coaching Complet
```powershell
Invoke-RestMethod -Uri "http://localhost:3007/student/12346/complete-coaching" | ConvertTo-Json -Depth 5
```

---

## 🔧 Dépannage

### Erreur : "Impossible de trouver le chemin"
**Cause** : Vous êtes dans `Edu_Path` au lieu de `EduPath-MS-EMSI`

**Solution** :
```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
```

### Erreur : "uvicorn n'est pas reconnu"
**Cause** : `uvicorn` n'est pas dans le PATH

**Solution** : Utiliser le chemin complet :
```powershell
C:\Users\youbitech\Desktop\Edu_Path\.venv\Scripts\uvicorn.exe src.main:app --port 3007 --reload
```

### Erreur : "ModuleNotFoundError: No module named 'src'"
**Cause** : PYTHONPATH n'est pas configuré

**Solution** :
```powershell
$env:PYTHONPATH = "C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-api"
```

### Port 3007 déjà utilisé
**Solution** : Arrêter l'ancien container Docker
```powershell
docker stop edupath-student-coach-api
```

---

## 📦 Fichiers Disponibles

- **start.ps1** - Script de démarrage automatique
- **start.bat** - Script Batch pour CMD
- **QUICKSTART.md** - Guide complet
- **TEST_GUIDE.md** - Guide de test des endpoints
- **TEST_RESULTS.md** - Résultats des tests

---

## 🎯 Résumé Rapide

```powershell
# Copier-coller cette commande complète :
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-api; $env:PYTHONPATH = $PWD.Path; docker stop edupath-student-coach-api 2>$null; & "C:\Users\youbitech\Desktop\Edu_Path\.venv\Scripts\uvicorn.exe" src.main:app --host 127.0.0.1 --port 3007 --reload
```

Cette commande fait tout :
1. ✅ Change de répertoire
2. ✅ Configure PYTHONPATH
3. ✅ Arrête l'ancien container
4. ✅ Lance l'API

---

**Documentation** : http://localhost:3007/docs  
**Status** : ✅ Production Ready  
**Version** : 2.0.0
