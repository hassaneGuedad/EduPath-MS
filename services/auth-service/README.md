# Auth Service

## Description
Service d'authentification et de gestion des utilisateurs utilisant FastAPI, JWT et PostgreSQL.

## Stack Technique
- **Runtime**: Python 3.11+
- **Framework**: FastAPI
- **Base de données**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentification**: JWT (python-jose)

## Endpoints

### POST /auth/register
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "student"
}
```

### POST /auth/login
Connexion et obtention d'un token JWT.

**Form Data:**
- username: email
- password: password

**Réponse:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### GET /auth/me
Récupère le profil de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <token>
```

### GET /users
Liste tous les utilisateurs (admin seulement).

### GET /users/{user_id}
Récupère un utilisateur spécifique.

## Variables d'environnement

```
PORT=3008
DATABASE_URL=postgresql://edupath:edupath123@postgres:5432/edupath_db
SECRET_KEY=your-secret-key-change-in-production
```

## Docker

```bash
docker build -t auth-service .
docker run -p 3008:3008 auth-service
```

