#!/bin/bash
# Script để chạy tạo bài test trong Docker container

echo "🚀 Tạo bài test để kiểm tra phân trang..."

# Chạy script trong backend container
docker compose exec backend python /app/scripts/create_test_content.py

echo "✅ Hoàn thành! Bây giờ bạn có thể test phân trang với:"
echo "   /queue 1 pending"
echo "   /queue 1 10 pending"
echo "   /queue 1 5 approved"
