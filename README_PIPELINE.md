# Configuration Rapide - Pipelines Jenkins Séparés

## Résumé
Chaque microservice possède maintenant son propre Jenkinsfile pour des déploiements indépendants.

## Services Configurés (11 au total)

### Services Backend Python
- ✅ `services/auth-service/Jenkinsfile`
- ✅ `services/student-coach-api/Jenkinsfile`
- ✅ `services/student-profiler/Jenkinsfile`
- ✅ `services/path-predictor/Jenkinsfile`
- ✅ `services/reco-builder/Jenkinsfile`
- ✅ `services/prepa-data/Jenkinsfile`
- ✅ `services/benchmarks-service/Jenkinsfile`

### Services Frontend
- ✅ `services/student-portal/Jenkinsfile` (React)
- ✅ `services/teacher-console/Jenkinsfile` (React)
- ✅ `services/student-coach-flutter/Jenkinsfile` (Flutter)

### Services Node.js
- ✅ `services/lms-connector/Jenkinsfile`

## Prochaines Étapes

### 1. Créer les Jobs Jenkins
Pour chaque service, créez un job **Multibranch Pipeline** dans Jenkins :
```
Nom du job : edupath-[nom-du-service]
Script Path : services/[nom-du-service]/Jenkinsfile
```

### 2. Configurer GitHub Webhook
```
URL : http://[JENKINS_URL]/github-webhook/
Events : Push events
```

### 3. Tester
```bash
# Modifier un service
cd services/auth-service
# Faire une modification
git commit -am "test: trigger pipeline"
git push

# Vérifier que seul le job edupath-auth-service se déclenche
```

## Documentation Complète
Consultez `JENKINS_SETUP_GUIDE.md` pour les instructions détaillées.

## Avantages
- ✅ Déploiements indépendants par service
- ✅ Builds plus rapides (seul le service modifié)
- ✅ Isolation des erreurs
- ✅ Scalabilité facilitée
