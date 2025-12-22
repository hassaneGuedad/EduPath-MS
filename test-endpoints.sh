#!/bin/bash

# Script de test des endpoints EduPath-MS

echo "=== Test des Endpoints EduPath-MS ==="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de test
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -n "Test $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

# Tests
echo "1. Test LMSConnector /sync"
test_endpoint "LMSConnector" "GET" "http://localhost:3001/sync"
echo ""

echo "2. Test PrepaData /features/1"
test_endpoint "PrepaData" "GET" "http://localhost:3002/features/1"
echo ""

echo "3. Test StudentProfiler /profile/1"
test_endpoint "StudentProfiler" "GET" "http://localhost:3003/profile/1"
echo ""

echo "4. Test PathPredictor /predict"
test_endpoint "PathPredictor" "POST" "http://localhost:3004/predict" '{"student_id": 1, "module_id": "MATH101"}'
echo ""

echo "5. Test RecoBuilder /recommend/1"
test_endpoint "RecoBuilder" "GET" "http://localhost:3005/recommend/1"
echo ""

echo "6. Test StudentCoach API /student/1/dashboard"
test_endpoint "StudentCoach API" "GET" "http://localhost:3007/student/1/dashboard"
echo ""

echo "=== Tests terminés ==="

