#!/bin/bash

echo "Testing GTTM Backend API endpoints..."
echo "======================================="

# Test 1: Health Check
echo -e "\n1. Testing GET /health"
curl -X GET http://localhost:5000/health 2>/dev/null | jq . || echo "Health endpoint not available"

# Test 2: Root endpoint
echo -e "\n2. Testing GET /"
curl -X GET http://localhost:5000/ 2>/dev/null | jq . || echo "Root endpoint not available"

# Test 3: Register User
echo -e "\n3. Testing POST /api/auth/register"
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123!",
    "confirmPassword":"Test123!",
    "fullName":"Test User",
    "numberPhone":"0987654321",
    "gender":"MALE"
  }' 2>/dev/null | jq .

# Test 4: Login
echo -e "\n4. Testing POST /api/auth/login"
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123!"
  }' 2>/dev/null | jq .

echo -e "\n======================================="
echo "API testing completed!"
