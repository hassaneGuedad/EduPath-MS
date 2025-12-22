# 🚀 Comment Lancer l'Application Flutter StudentCoach

## ⚠️ PROBLÈME DÉTECTÉ : ESPACE DISQUE INSUFFISANT

**Espace libre sur C:** : Seulement **0,12 GB (120 MB)**  
**Requis pour Flutter** : Au moins **2-3 GB**

### 🔧 Solutions Immédiates

#### Option 1 : Libérer de l'espace disque (RECOMMANDÉ)

1. **Vider la corbeille**
   ```powershell
   Clear-RecycleBin -Force
   ```

2. **Nettoyer les fichiers temporaires**
   ```powershell
   Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
   ```

3. **Nettoyer le cache Flutter**
   ```powershell
   flutter clean
   flutter pub cache clean
   ```

4. **Nettoyer le cache npm/node**
   ```powershell
   npm cache clean --force
   ```

5. **Utiliser le nettoyage de disque Windows**
   - Appuyez sur `Win + R`
   - Tapez `cleanmgr`
   - Sélectionnez le disque C:
   - Cochez toutes les cases
   - Cliquez sur "Nettoyer les fichiers système"

---

## 📱 Lancement de l'Application Flutter (Après nettoyage)

### Méthode 1 : Script PowerShell (Automatique)

```powershell
# Depuis n'importe où
& "C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-flutter\start-flutter.ps1"

# Ou depuis le répertoire du projet
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
.\services\student-coach-flutter\start-flutter.ps1
```

### Méthode 2 : Commandes Manuelles

```powershell
# 1. Aller dans le dossier Flutter
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-flutter

# 2. Installer les dépendances
flutter pub get

# 3. Lancer sur Chrome (recommandé)
flutter run -d chrome

# OU lancer sur Edge
flutter run -d edge

# OU lancer en application Windows native
flutter run -d windows
```

### Méthode 3 : Commande Courte (Tout-en-un)

```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-flutter; flutter pub get; flutter run -d chrome
```

---

## 🌐 Appareils Disponibles

Vous avez **3 options** pour exécuter l'application :

### 1. 🌐 Chrome (Recommandé pour développement)
```powershell
flutter run -d chrome
```
**Avantages** :
- ✅ Léger
- ✅ Hot reload rapide
- ✅ DevTools intégrés
- ✅ Pas besoin de build lourd

### 2. 🌐 Microsoft Edge
```powershell
flutter run -d edge
```
**Avantages** :
- ✅ Similaire à Chrome
- ✅ Intégration Windows

### 3. 🖥️ Windows (Application Native)
```powershell
flutter run -d windows
```
**Avantages** :
- ✅ Performance native
- ✅ Expérience application complète

**Inconvénients** :
- ❌ Build plus long (~2-3 minutes)
- ❌ Consomme plus d'espace disque

---

## 🔍 Vérifications Avant Lancement

### 1. Vérifier Flutter
```powershell
flutter --version
```

### 2. Vérifier les appareils disponibles
```powershell
flutter devices
```

### 3. Vérifier l'espace disque
```powershell
Get-PSDrive C | Select-Object @{Name="Free(GB)";Expression={[math]::Round($_.Free/1GB,2)}}
```
**Minimum requis** : 2 GB libre

### 4. Tester la santé du projet
```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-flutter
flutter doctor
```

---

## 🎯 Configuration API Backend

L'application Flutter communique avec l'API StudentCoach sur **http://localhost:3007**

### Vérifier que l'API est active
```powershell
Invoke-RestMethod -Uri "http://localhost:3007/health"
```

### Si l'API n'est pas lancée
```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-api
.\start.ps1
```

---

## 📱 Fonctionnalités de l'Application

Une fois lancée, l'application Flutter affiche :

1. **Dashboard Étudiant**
   - Progression personnalisée
   - Score moyen et tendance
   - Profil ML (High Performer / Average / At Risk)

2. **Messages Motivants**
   - Messages personnalisés selon le profil
   - Encouragements adaptés au niveau

3. **Recommandations**
   - Ressources suggérées par RecoBuilder
   - Basées sur le profil et les performances

4. **Conseils de Coaching**
   - Conseils personnalisés
   - Actions concrètes à suivre

---

## 🔧 Dépannage

### Erreur : "No pubspec.yaml found"
**Cause** : Mauvais répertoire

**Solution** :
```powershell
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-flutter
```

### Erreur : "Insufficient disk space"
**Cause** : Moins de 500 MB libre

**Solution** : Libérer de l'espace (voir section ci-dessus)

### Erreur : "Cannot connect to API"
**Cause** : API StudentCoach non lancée

**Solution** :
```powershell
# Terminal 1 : Lancer l'API
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-api
.\start.ps1

# Terminal 2 : Lancer Flutter
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-flutter
.\start-flutter.ps1
```

### Erreur : "Waiting for another flutter command to release the startup lock"
**Solution** :
```powershell
# Arrêter tous les processus Flutter
Get-Process flutter | Stop-Process -Force

# Ou supprimer le lock manuellement
Remove-Item "$env:LOCALAPPDATA\flutter_tool.lock" -Force
```

### Compilation lente
**Solution 1** : Mode web (plus rapide)
```powershell
flutter run -d chrome --web-renderer html
```

**Solution 2** : Build release (une fois)
```powershell
flutter build web
cd build/web
python -m http.server 8080
# Ouvrir http://localhost:8080
```

---

## 🎮 Commandes Pendant l'Exécution

Une fois l'application lancée, dans le terminal :

- **`r`** : Hot reload (recharger les changements)
- **`R`** : Hot restart (redémarrer l'app)
- **`q`** : Quitter l'application
- **`h`** : Aide
- **`d`** : Ouvrir DevTools
- **`v`** : Ouvrir en mode verbose

---

## 📊 Architecture Complète

```
┌─────────────────────────────────────────────┐
│   Flutter App (Port: Chrome/Edge/Windows)   │
│          Student Coach Interface            │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────┐
│     StudentCoach API (Port 3007)            │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│  PrepaData   │      │  Profiler    │
│  (Port 3002) │      │  (Port 3003) │
└──────────────┘      └──────────────┘
```

---

## 📝 Résumé des Étapes

1. ✅ **Libérer de l'espace** (au moins 2 GB)
2. ✅ **Lancer l'API** StudentCoach (port 3007)
3. ✅ **Lancer Flutter** sur Chrome/Edge/Windows
4. ✅ **Tester** l'application

---

## 🚨 ACTION PRIORITAIRE

**AVANT DE LANCER FLUTTER** :

```powershell
# 1. Nettoyer les fichiers temporaires
Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue

# 2. Nettoyer Flutter
cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-flutter
flutter clean

# 3. Vérifier l'espace libre
Get-PSDrive C | Select-Object @{Name="Free(GB)";Expression={[math]::Round($_.Free/1GB,2)}}

# Si > 2 GB libre, lancer :
flutter run -d chrome
```

---

**Status** : ⚠️ **ESPACE DISQUE CRITIQUE - NETTOYAGE REQUIS**  
**Documentation** : http://localhost:3007/docs (API)  
**Version Flutter** : 3.35.5
