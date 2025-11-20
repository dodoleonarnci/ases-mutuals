#!/bin/bash
# Test script to fetch and display SAML metadata

echo "Testing SAML metadata endpoint..."
echo ""

# Check if server is running on port 3000
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Server doesn't seem to be running on port 3000"
    echo "   Start it with: npm run dev"
    exit 1
fi

echo "Fetching metadata from http://localhost:3000/api/auth/saml/metadata"
echo ""

# Fetch and display metadata
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:3000/api/auth/saml/metadata)
http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS:/d')

if [ "$http_status" = "200" ]; then
    echo "✅ Success! Metadata XML:"
    echo ""
    echo "$body" | head -20
    echo ""
    echo "... (truncated)"
    echo ""
    echo "To save to file: curl http://localhost:3000/api/auth/saml/metadata -o metadata.xml"
else
    echo "❌ Error! HTTP Status: $http_status"
    echo ""
    echo "Response:"
    echo "$body"
    echo ""
    echo "This might mean:"
    echo "- Missing SAML environment variables"
    echo "- Check your .env.local file"
fi
