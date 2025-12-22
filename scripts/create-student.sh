#!/bin/bash
# Script bash pour créer un compte étudiant

echo "Création d'un compte étudiant..."

curl -X POST http://localhost:3008/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@edupath.com",
    "password": "student123",
    "full_name": "Student User",
    "role": "student"
  }'

echo ""
echo "Compte créé:"
echo "Email: student@edupath.com"
echo "Password: student123"

