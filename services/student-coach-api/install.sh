#!/bin/bash

# Script d'installation et configuration de StudentCoach API

echo "🚀 Installation de StudentCoach API..."

# 1. Installer les dépendances Python
echo "📦 Installation des dépendances Python..."
pip install -r requirements.txt

# 2. Créer la base de données PostgreSQL
echo "🗄️ Configuration de la base de données..."
psql -U edupath -d postgres -c "CREATE DATABASE IF NOT EXISTS edupath_coaching;" 2>/dev/null || echo "Base de données existe déjà"

# 3. Initialiser les tables
echo "📊 Initialisation des tables..."
psql -U edupath -d edupath_coaching -f ../../database/init_coaching.sql

# 4. Créer le fichier .env
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    echo "✅ Fichier .env créé. Pensez à le modifier si nécessaire."
else
    echo "ℹ️  Fichier .env existe déjà"
fi

echo ""
echo "✅ Installation terminée !"
echo ""
echo "Pour démarrer l'API :"
echo "  uvicorn src.main:app --host 0.0.0.0 --port 3007 --reload"
echo ""
echo "Documentation API disponible sur :"
echo "  http://localhost:3007/docs"
