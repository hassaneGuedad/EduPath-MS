# Communication Inter-Services dans EduPath-MS

Ce document explique les différents modes de communication utilisés (ou envisageables) dans l'architecture EduPath-MS, leurs rôles respectifs et comment ils s'articulent pour créer un système robuste.

## 1. Vue d'ensemble des protocoles

Dans une architecture microservices avancée, on distingue généralement trois types de communication :

| Protocole | Type | Cas d'usage principal dans EduPath |
|-----------|------|------------------------------------|
| **REST API** (HTTP) | Synchrone | Communication standard, interaction Frontend-Backend |
| **RabbitMQ** (AMQP) | Asynchrone | Traitements longs (ML), découplage, événements |
| **gRPC** (Protoc) | Synchrone (Rapide) | Communication interne critique entre services Backend |

---

## 2. API REST (Architecture Actuelle)

C'est le mode de communication principal actuellement implémenté dans le projet.

### Comment on l'applique ?
Chaque microservice expose des points d'entrée (endpoints) HTTP standards (GET, POST, PUT, DELETE). Les services communiquent en s'envoyant des requêtes JSON.

### Exemple Concret dans le Projet
*   **Flux :** Le `Frontend Student Portal` veut afficher les recommandations.
*   **Action :** Le frontend envoie une requête `GET http://gateway/recommendations/{student_id}`.
*   **Chaîne d'appel :**
    1.  Frontend appel API Gateway (ou directement le service).
    2.  Le service reçoit la requête, interroge sa base de données ou un autre service.
    3.  Le service renvoie la réponse JSON immédiatement.

### Rôle :
*   **Accessibilité :** Facile à consommer pour les frontends (React, Flutter) et les clients externes.
*   **Standardisation :** Universel, pas besoin de clients spécifiques lourds.
*   **Stateless :** Chaque requête contient tout le nécessaire, simplifiant le scaling.

---

## 3. RabbitMQ (Communication Asynchrone - Évolutivité)

RabbitMQ est un "Message Broker". Il permet aux services de communiquer sans se connaître directement et sans attendre la réponse immédiate. **Idéal pour les tâches lourdes d'IA.**

### Comment on l'applique (Scenario) ?
Au lieu d'appeler directement un service et *d'attendre*, on dépose un message dans une "boîte aux lettres" (Queue).

### Exemple Concret pour EduPath
*   **Scénario :** Un étudiant complète un Quiz. Cela doit déclencher un recalcul complet de son profil et de ses prédictions (ce qui prend 5-10 secondes).
*   **Sans RabbitMQ (REST) :** L'utilisateur attend 10s devant un écran de chargement. ❌
*   **Avec RabbitMQ :**
    1.  `LMS Connector` publie un événement `QUIZ_COMPLETED` dans RabbitMQ.
    2.  Le serveur répond "OK" à l'utilisateur immédiatement (0.1s). ✅
    3.  En arrière-plan, `Prepa Data` et `Student Profiler` (les consommateurs) voient le message, récupèrent les données et recalculent les modèles.
    4.  Une fois fini, ils envoient une notification (via WebSocket par exemple).

### Rôle :
*   **Découplage :** Le producteur (LMS) ne se soucie pas de qui traite le message ou si le service est en ligne.
*   **Lissage de charge :** Si 1000 étudiants finissent en même temps, RabbitMQ garde les messages en file d'attente et les services les traitent à leur rythme sans crasher.

---

## 4. gRPC (Communication Haute Performance)

gRPC est un framework de communication moderne développé par Google. Il utilise HTTP/2 et Protocol Buffers (binaire) au lieu de JSON (texte).

### Comment on l'applique (Scenario) ?
On définit un fichier `.proto` qui décrit les fonctions et les données. Le code client et serveur est généré automatiquement.

### Exemple Concret pour EduPath
*   **Scénario :** `Student Coach` a besoin des prédictions en temps réel pour des milliers d'étudiants pour un dashboard d'analytics global.
*   **Pourquoi gRPC ?** Le transfert JSON est lourd et lent pour de gros volumes de données numériques (matrices, vecteurs d'embeddings).
*   **Flux :**
    1.  `Student Coach` appelle la méthode `GetPredictions(stream StudentList)` sur `Path Predictor`.
    2.  Les données transitent en binaire (très compact).
    3.  La connexion HTTP/2 permet le streaming bidirectionnel (envoi et réception en continu).

### Rôle :
*   **Performance :** 5x à 10x plus rapide que REST pour les communications internes.
*   **Typage fort :** Les erreurs de type sont détectées à la compilation, pas à l'exécution.
*   **Communication Inter-Services Backend :** Idéal pour faire discuter les services Python (IA) entre eux.

---

## Résumé de l'Architecture Hybride

Dans l'évolution future d'EduPath :

1.  **Utilisateur → API Gateway** : **REST** (Simple, universel).
2.  **API Gateway → Services Front** : **REST**.
3.  **Services IA entre eux (ex: Profiler ↔ Predictor)** : **gRPC** (Rapide, efficace pour les données).
4.  **Événements Métier (Sync, Fin de cours)** : **RabbitMQ** (Fiable, asynchrone).
