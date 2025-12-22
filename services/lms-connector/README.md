# LMSConnector Microservice

## Description
Microservice Node.js pour la synchronisation des données depuis des systèmes LMS (Moodle, Canvas) via CSV ou API.

## Stack Technique
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Dépendances principales**: csv-parser, axios, cors

## Endpoints

### GET /sync
Synchronise les données depuis les fichiers CSV simulés.

**Réponse:**
```json
{
  "status": "success",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "students": 30,
    "modules": 3,
    "resources": 9,
    "records": {
      "students": [...],
      "modules": [...],
      "resources": [...]
    }
  }
}
```

### GET /health
Vérifie l'état du service.

## Installation

```bash
npm install
```

## Exécution

```bash
# Développement
npm run dev

# Production
npm start
```

## Variables d'environnement

Créer un fichier `.env`:
```
PORT=3001
NODE_ENV=development
```

## Docker

```bash
docker build -t lms-connector .
docker run -p 3001:3001 lms-connector
```

