# CI/CD Pipeline Jenkins – EduPath-MS-EMSI

Ce document explique le fonctionnement du pipeline Jenkins utilisé pour le projet EduPath-MS-EMSI.

## Objectifs du pipeline
- Automatiser la construction, les tests et le déploiement des microservices.
- Garantir la qualité du code via l’exécution automatique des tests.
- Déployer les services Docker en environnement d’intégration.

## Étapes principales du pipeline

1. **Checkout SCM**
   - Récupère le code source depuis le dépôt GitHub (branche micro ou main).

2. **Build Docker Images**
   - Construit toutes les images Docker des microservices définis dans `docker-compose.yml`.
   - Utilise la commande :
     ```
     docker-compose build --parallel
     ```

3. **Run Tests**
   - Exécute les tests unitaires (Pytest) dans le conteneur `prepa-data`.
   - Commande utilisée :
     ```
     docker-compose run --rm prepa-data pytest
     ```
   - Si aucun test n’est trouvé ou si un test échoue, le pipeline est marqué "UNSTABLE" ou "FAILED".

4. **Deploy Services**
   - Déploie tous les services définis dans `docker-compose.yml` en mode détaché.
   - Commande :
     ```
     docker-compose up -d
     ```

5. **Post Deployment**
   - Affiche un message de succès si tous les services sont déployés.

6. **Nettoyage**
   - Supprime les conteneurs et images Docker inutilisés pour libérer de l’espace disque.
   - Commande :
     ```
     docker system prune -f
     ```

## Fichiers clés
- `Jenkinsfile` : Définit la logique du pipeline.
- `docker-compose.yml` : Orchestration des microservices.
- `services/prepa-data/test_sample.py` : Exemple de test Pytest.

## Bonnes pratiques
- Ajouter des tests unitaires pour chaque microservice.
- Vérifier que tous les services démarrent correctement après déploiement.
- Surveiller l’espace disque sur le serveur Jenkins.

## Auteur
EduPath-MS-EMSI Team
