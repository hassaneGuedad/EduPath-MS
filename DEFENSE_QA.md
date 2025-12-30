# Guide de Questions/Réponses pour la Soutenance

Ce document regroupe les questions techniques probables que le jury pourrait vous poser, classées par thématique, avec des réponses adaptées à votre projet EduPath-MS.

---

## 🏗️ 1. Architecture Microservices

**Q : Pourquoi avoir choisi une architecture microservices plutôt qu'un monolithe pour ce projet ?**
> **R :** Pour la **scalabilité indépendante** et la **diversité technologique**. Le module de Machine Learning (Python/XGBoost) demande beaucoup de CPU, tandis que le Backend (Node.js/FastAPI) est plus léger. Les microservices nous permettent de scaler uniquement la partie IA si nécessaire, et d'utiliser Python pour l'IA et Node.js pour les IO, ce qui serait impossible dans un monolithe unique.

**Q : Comment vos microservices communiquent-ils entre eux ?**
> **R :** Nous utilisons une approche hybride détaillée dans notre documentation :
> 1. **REST (Synchrone)** : Pour les appels directs du frontend et les requêtes simples (ex: récupérer un profil utilisateur).
> 2. **RabbitMQ (Asynchrone)** : Prévu pour les tâches lourdes comme le calcul des prédictions après un quiz, pour ne pas bloquer l'utilisateur.
> 3. **gRPC** : Envisagé pour la communication rapide entre les services d'IA (ex: Profiler vers Predictor).

**Q : Comment gérez-vous la découverte de services (Service Discovery) ?**
> **R :** Actuellement, nous utilisons le DNS interne de **Docker Compose** pour le développement. Pour la production, nous avons planifié l'intégration d'**Eureka Server** et d'une **API Gateway** (Spring Cloud Gateway) pour centraliser le routage et la sécurité.

---

## 🤖 2. Intelligence Artificielle & Data

**Q : Pourquoi avoir choisi XGBoost pour la prédiction d'échec ?**
> **R :** XGBoost est l'algorithme "état de l'art" pour les données tabulaires (structurées comme nos notes et temps de connexion). Il est plus performant et plus rapide à entraîner qu'un réseau de neurones profond (Deep Learning) sur ce type de données, et il offre une meilleure interprétabilité (on peut savoir quelles features pèsent le plus).

**Q : Comment gérez-vous le problème de l'overfitting (surapprentissage) ?**
> **R :** C'est un point critique. Dans notre prototype actuel (MVP), nous utilisons des données synthétiques, donc le risque est présent. Pour la version finale, nous mettrons en place :
> 1. Une séparation stricte des données (80% Train, 20% Test).
> 2. Une **Cross-Validation** pour valider la robustesse du modèle.
> 3. L'arrêt précoce (Early Stopping) lors de l'entraînement XGBoost.

**Q : Comment avez-vous déterminé le nombre de profils (clusters) à 3 pour le KMeans ?**
> **R :** C'est un choix métier initial (High Performer, Average, At Risk) pour simplifier l'interface pédagogique. Techniquement, nous pourrions utiliser la méthode du coude (**Elbow Method**) pour vérifier si mathématiquement 4 ou 5 groupes seraient plus pertinents.

---

## ⚙️ 3. DevOps & Qualité

**Q : Quelle est votre stratégie de CI/CD ?**
> **R :** Nous utilisons **Jenkins**. Notre pipeline typique comprend :
> 1. **Checkout** du code.
> 2. **Build** des images Docker.
> 3. **Tests Unitaires** (Pytest pour Python).
> 4. **Déploiement** sur un environnement de staging via Docker Compose.

**Q : Pourquoi Docker ?**
> **R :** Docker garantit que "ça marche chez moi" marche aussi en production. Il isole les dépendances conflictuelles (ex: des versions différentes de Python pour différents services) et simplifie considérablement le déploiement de notre stack hétérogène (Node, Python, Java).

---

## 🛡️ 4. Sécurité

**Q : Comment sécurisez-vous les échanges entre les services ?**
> **R :** Actuellement, nous nous reposons sur le réseau privé Docker. À l'avenir, avec l'API Gateway, nous implémenterons l'authentification **JWT** centralisée : le Gateway valide le token avant de passer la requête au microservice, déchargeant ainsi les services de cette logique.

**Q : Comment gérez-vous les données sensibles des étudiants (RGPD) ?**
> **R :** Les mots de passe sont hashés avec **Bcrypt**. Nous minimisons les données stockées. Une amélioration future serait d'anonymiser les données envoyées aux services de Machine Learning pour qu'ils travaillent sur des IDs et non des noms.

---

## 💾 5. Base de Données & Data Persistence

**Q : Pourquoi avoir choisi PostgreSQL plutôt qu'une base NoSQL comme MongoDB ?**
> **R :** Nos données sont **relationnelles** et structurées par nature (Étudiants, Cours, Devoirs, Notes). PostgreSQL garantit l'intégrité référentielle (ACID), ce qui est crucial pour ne pas perdre de notes ou d'utilisateurs. Cependant, pour les logs d'activité ou les ressources non-structurées, une base NoSQL pourrait être ajoutée en complément à l'avenir.

**Q : Comment gérez-vous les migrations de base de données ?**
> **R :** Dans le service Python (Auth), nous utilisons un script d'auto-migration au démarrage (voir `app.py`). En production, nous utiliserions un outil dédié comme **Alembic** (pour Python) ou **Liquibase** pour versionner le schéma de la base de données de manière plus robuste.

---

## 💻 6. Frontend (React & Flutter)

**Q : Pourquoi avoir séparé le Frontend (React) du Backend (API) ?**
> **R :** C'est le principe du **Decoupled Architecture**. Cela permet :
> 1. De changer le frontend sans toucher au backend (ex: refaire le design).
> 2. D'avoir plusieurs clients (Web React, Mobile Flutter, CLI) qui consomment la même API.
> 3. De charger l'interface plus vite (SPA - Single Page Application) et de ne demander au serveur que les données JSON nécessaires.

**Q : Comment gérez-vous l'état de l'application (State Management) côté React ?**
> **R :** Nous utilisons les **Hooks** standards (`useState`, `useEffect`) pour les états locaux. Si l'application grandit, nous passerions à **Redux** ou **Context API** pour gérer l'état global (ex: l'utilisateur connecté) et éviter le "prop drilling".

---

## 📈 7. Performance & Scalabilité

**Q : Que se passe-t-il si 10 000 étudiants se connectent en même temps ?**
> **R :** 
> 1. **Load Balancing** : L'API Gateway répartirait la charge.
> 2. **Scaling Horizontal** : Avec Kubernetes, on lancerait automatiquement 10 ou 20 instances de nos microservices.
> 3. **Caching** : Nous devrions ajouter **Redis** pour mettre en cache les profils et les recommandations, évitant de recalculer ou de re-requêter la base de données à chaque clic.

**Q : Vos modèles ML sont-ils ré-entraînés en temps réel ?**
> **R :** Non, c'est trop coûteux. Le ré-entraînement se fait en **batch** (par exemple toutes les nuits) via un pipeline Airflow, sur les nouvelles données récoltées. Les prédictions, elles, sont faites en temps quasi-réel (Inference) avec le modèle pré-entraîné chargé en mémoire.

---

## 🤝 8. Méthodologie & Travail d'équipe

**Q : Quelle méthodologie de gestion de projet avez-vous utilisée ?**
> **R :** Nous nous sommes inspirés de **Scrum**. Nous avons travaillé par itérations (Sprints) : d'abord le MVP (Minimum Viable Product) avec l'auth et la base, puis l'ajout des services IA, et enfin l'interface graphique. Nous avons utilisé Git pour versionner notre code et gérer les conflits.

**Q : Quelle a été la plus grande difficulté technique ?**
> **R :** L'intégration des conteneurs Python (IA) avec les autres services. Python a besoin de nombreuses dépendances lourdes (pandas, numpy, scikit-learn), ce qui rendait les builds Docker lents et les images volumineuses. Nous avons optimisé cela en utilisant des images de base slim et en gérant bien le cache Docker.

