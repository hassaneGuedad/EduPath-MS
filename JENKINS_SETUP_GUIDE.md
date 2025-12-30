# Guide de Configuration Jenkins - Pipelines Séparés par Service

## Vue d'ensemble
Ce guide explique comment configurer Jenkins pour exécuter des pipelines CI/CD indépendants pour chaque microservice du projet EduPath-MS.

## Prérequis
- Jenkins installé et configuré
- Plugin Jenkins : **Multibranch Pipeline** ou **Pipeline**
- Plugin Jenkins : **GitHub Integration**
- Accès au dépôt GitHub : `https://github.com/hassaneGuedad/EduPath-MS`
- Docker installé sur le serveur Jenkins

---

## Étape 1 : Configuration des Jobs Jenkins

### Option A : Multibranch Pipeline (Recommandé)

Pour chaque service, créez un **Multibranch Pipeline** :

1. **Créer un nouveau job** :
   - Cliquez sur "New Item"
   - Nom : `edupath-auth-service` (exemple pour auth-service)
   - Type : **Multibranch Pipeline**
   - Cliquez sur "OK"

2. **Configuration du job** :
   - **Branch Sources** → Ajouter **Git**
   - Repository URL : `https://github.com/hassaneGuedad/EduPath-MS.git`
   - Credentials : Ajoutez vos credentials GitHub
   - **Build Configuration** :
     - Mode : **by Jenkinsfile**
     - Script Path : `services/auth-service/Jenkinsfile`

3. **Scan Multibranch Pipeline Triggers** :
   - Cochez "Periodically if not otherwise run"
   - Interval : 1 minute (pour le développement)

4. **Répétez** pour chaque service :
   - `edupath-student-coach-api` → `services/student-coach-api/Jenkinsfile`
   - `edupath-lms-connector` → `services/lms-connector/Jenkinsfile`
   - `edupath-student-profiler` → `services/student-profiler/Jenkinsfile`
   - `edupath-path-predictor` → `services/path-predictor/Jenkinsfile`
   - `edupath-reco-builder` → `services/reco-builder/Jenkinsfile`
   - `edupath-prepa-data` → `services/prepa-data/Jenkinsfile`
   - `edupath-student-portal` → `services/student-portal/Jenkinsfile`
   - `edupath-teacher-console` → `services/teacher-console/Jenkinsfile`
   - `edupath-student-coach-flutter` → `services/student-coach-flutter/Jenkinsfile`
   - `edupath-benchmarks-service` → `services/benchmarks-service/Jenkinsfile`

### Option B : Pipeline Simple

Si vous préférez des pipelines simples :

1. Créez un job de type **Pipeline**
2. Dans **Pipeline** → **Definition** : "Pipeline script from SCM"
3. SCM : Git
4. Repository URL : `https://github.com/hassaneGuedad/EduPath-MS.git`
5. Script Path : `services/[nom-du-service]/Jenkinsfile`

---

## Étape 2 : Configuration GitHub Webhooks

### Configuration Globale (Recommandée)

1. **Dans GitHub** :
   - Allez sur votre dépôt → **Settings** → **Webhooks**
   - Cliquez sur "Add webhook"
   - **Payload URL** : `http://[JENKINS_URL]/github-webhook/`
     - Exemple : `http://jenkins.example.com:8080/github-webhook/`
   - **Content type** : `application/json`
   - **Which events** : Sélectionnez "Just the push event"
   - Cochez "Active"
   - Cliquez sur "Add webhook"

2. **Dans Jenkins** :
   - Installez le plugin **GitHub Integration Plugin**
   - Dans chaque job Multibranch Pipeline :
     - **Scan Multibranch Pipeline Triggers** → Cochez "Scan by webhook"

### Configuration avec Filtrage par Service (Avancé)

Pour déclencher uniquement le pipeline du service modifié :

1. **Utilisez GitHub Actions** comme intermédiaire :
   - Créez `.github/workflows/trigger-jenkins.yml` :

```yaml
name: Trigger Jenkins Pipelines

on:
  push:
    branches: [ main, develop ]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 2
      
      - name: Detect changed services
        id: changes
        run: |
          CHANGED_FILES=$(git diff --name-only HEAD^ HEAD)
          echo "Changed files: $CHANGED_FILES"
          
          if echo "$CHANGED_FILES" | grep -q "services/auth-service/"; then
            curl -X POST http://jenkins.example.com:8080/job/edupath-auth-service/build
          fi
          
          if echo "$CHANGED_FILES" | grep -q "services/student-coach-api/"; then
            curl -X POST http://jenkins.example.com:8080/job/edupath-student-coach-api/build
          fi
          
          # Répétez pour chaque service...
```

---

## Étape 3 : Configuration Jenkins avec Détection de Changements

### Méthode Alternative : Jenkinsfile avec Détection

Modifiez le Jenkinsfile racine pour détecter les changements :

```groovy
pipeline {
    agent any
    
    stages {
        stage('Detect Changes') {
            steps {
                script {
                    def changedFiles = sh(
                        script: 'git diff --name-only HEAD^ HEAD',
                        returnStdout: true
                    ).trim()
                    
                    if (changedFiles.contains('services/auth-service/')) {
                        build job: 'edupath-auth-service'
                    }
                    if (changedFiles.contains('services/student-coach-api/')) {
                        build job: 'edupath-student-coach-api'
                    }
                    // Ajoutez les autres services...
                }
            }
        }
    }
}
```

---

## Étape 4 : Vérification

### Tester un Pipeline Individuel

1. **Commit un changement** dans un service spécifique :
   ```bash
   cd services/auth-service
   # Faites une modification
   git add .
   git commit -m "test: trigger auth-service pipeline"
   git push origin main
   ```

2. **Vérifiez Jenkins** :
   - Le job `edupath-auth-service` devrait se déclencher automatiquement
   - Les autres jobs ne devraient PAS se déclencher

3. **Consultez les logs** :
   - Cliquez sur le job → Build History → Console Output
   - Vérifiez que seul le service modifié est buildé

---

## Étape 5 : Déploiement

### Configuration Docker Compose

Assurez-vous que votre `docker-compose.yml` permet le déploiement par service :

```bash
# Déployer uniquement auth-service
docker-compose up -d auth-service

# Déployer uniquement student-portal
docker-compose up -d student-portal
```

### Variables d'Environnement Jenkins

Configurez les credentials dans Jenkins :
- **Manage Jenkins** → **Manage Credentials**
- Ajoutez :
  - Docker Registry credentials (si applicable)
  - GitHub credentials
  - Secrets d'environnement

---

## Avantages de cette Architecture

✅ **Déploiements indépendants** : Chaque service peut être déployé sans affecter les autres  
✅ **Builds plus rapides** : Seul le service modifié est rebuilté  
✅ **Isolation des erreurs** : Un échec de build n'impacte qu'un service  
✅ **Scalabilité** : Facile d'ajouter de nouveaux services  
✅ **Traçabilité** : Historique de build par service  

---

## Dépannage

### Le webhook ne déclenche pas le build
- Vérifiez que l'URL Jenkins est accessible depuis GitHub
- Consultez **Settings** → **Webhooks** → **Recent Deliveries** dans GitHub
- Vérifiez les logs Jenkins : `/log/all`

### Le build échoue avec "Docker not found"
- Assurez-vous que Docker est installé sur le serveur Jenkins
- Ajoutez l'utilisateur Jenkins au groupe Docker : `sudo usermod -aG docker jenkins`
- Redémarrez Jenkins

### Les tests échouent
- Les tests sont configurés en mode non-bloquant (`|| exit 0`)
- Pour les rendre bloquants, retirez `|| exit 0` du Jenkinsfile

---

## Prochaines Étapes

1. ✅ Créer les 11 Jenkinsfiles (Fait)
2. ⏳ Configurer les jobs Jenkins
3. ⏳ Configurer les webhooks GitHub
4. ⏳ Tester chaque pipeline
5. ⏳ Documenter les résultats pour la défense

---

## Support

Pour toute question, consultez :
- [Documentation Jenkins](https://www.jenkins.io/doc/)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)
- [Docker Compose](https://docs.docker.com/compose/)
