#!/bin/bash

# Couleurs pour l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3008"

echo -e "${YELLOW}🧪 Test API Resources${NC}"
echo "================================"

# Test 1: GET /resources (vide au départ)
echo -e "\n${YELLOW}Test 1: GET /resources${NC}"
curl -s "$API_URL/resources" | jq '.' || echo "❌ Erreur"

# Test 2: Créer une ressource
echo -e "\n${YELLOW}Test 2: POST /resources (Créer une ressource)${NC}"
RESOURCE_RESPONSE=$(curl -s -X POST "$API_URL/resources" \
  -H "Content-Type: application/json" \
  -d '{
    "resource_id": "RES001",
    "title": "Introduction à lAnglais",
    "description": "Cours complet sur les bases de lAnglais",
    "resource_type": "pdf",
    "subject_id": "COMM101-EN",
    "subject_name": "Anglais",
    "difficulty_level": "Beginner",
    "duration": 45,
    "author": "Prof. John",
    "external_url": "https://example.com/english.pdf",
    "tags": ["grammaire", "vocabulaire", "anglais"]
  }')

echo "$RESOURCE_RESPONSE" | jq '.'
RESOURCE_ID=$(echo "$RESOURCE_RESPONSE" | jq -r '.id // empty')

# Test 3: GET /resources (vérifier que la ressource est créée)
echo -e "\n${YELLOW}Test 3: GET /resources (Vérifier la création)${NC}"
curl -s "$API_URL/resources" | jq '.[] | {id, title, subject_name}' || echo "❌ Erreur"

# Test 4: GET /resources/subject/{subject_id}
echo -e "\n${YELLOW}Test 4: GET /resources/subject/COMM101-EN${NC}"
curl -s "$API_URL/resources/subject/COMM101-EN" | jq '.' || echo "❌ Erreur"

# Test 5: Créer une deuxième ressource
echo -e "\n${YELLOW}Test 5: POST /resources (Deuxième ressource)${NC}"
curl -s -X POST "$API_URL/resources" \
  -H "Content-Type: application/json" \
  -d '{
    "resource_id": "RES002",
    "title": "Grammaire Française Avancée",
    "description": "Cours avancé de grammaire française",
    "resource_type": "video",
    "subject_id": "COMM101-FR",
    "subject_name": "Français",
    "difficulty_level": "Advanced",
    "duration": 120,
    "author": "Prof. Marie",
    "tags": ["grammaire", "francais", "avance"]
  }' | jq '{id, title, subject_name}'

# Test 6: Marquer comme consulté
if [ ! -z "$RESOURCE_ID" ]; then
  echo -e "\n${YELLOW}Test 6: PUT /resources/$RESOURCE_ID/mark-viewed${NC}"
  curl -s -X PUT "$API_URL/resources/RES001/mark-viewed" | jq '.is_viewed' || echo "❌ Erreur"
fi

# Test 7: Mettre à jour une ressource
echo -e "\n${YELLOW}Test 7: PUT /resources/RES001 (Mettre à jour)${NC}"
curl -s -X PUT "$API_URL/resources/RES001" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction à lAnglais - Updated",
    "description": "Cours complet avec mise à jour"
  }' | jq '.{title, description}' 2>/dev/null || echo "❌ Erreur"

# Test 8: GET /resources (vérifier les deux ressources)
echo -e "\n${YELLOW}Test 8: GET /resources (Résumé final)${NC}"
curl -s "$API_URL/resources" | jq 'length' | xargs -I {} echo "Total: {} ressources"
curl -s "$API_URL/resources" | jq '.[] | {title, subject_name, is_viewed}'

echo -e "\n${GREEN}✅ Tests terminés!${NC}"
