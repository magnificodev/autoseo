#!/bin/bash
# Script để chạy delete_test_content.py trong backend Docker container

echo "🧹 Running test content deletion script inside backend container..."
docker compose exec backend python /app/scripts/delete_test_content.py

if [ $? -eq 0 ]; then
    echo "✅ Test content deletion completed."
else
    echo "❌ Failed to delete test content."
fi
