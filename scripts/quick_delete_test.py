#!/usr/bin/env python3
"""
Script nhanh để xóa test content - chạy trực tiếp
"""

import os
import sys

# Thêm backend vào Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from src.database.models import ContentQueue
from src.database.session import SessionLocal


def quick_delete_test():
    """Xóa nhanh tất cả test content"""
    db = SessionLocal()
    try:
        # Tìm và xóa tất cả content có "Test" trong title
        test_contents = (
            db.query(ContentQueue).filter(ContentQueue.title.like("%Test%")).all()
        )

        if not test_contents:
            print("ℹ️ Không tìm thấy test content nào.")
            return

        print(f"🔍 Tìm thấy {len(test_contents)} test content:")
        for content in test_contents:
            print(f"  - #{content.id}: {content.title[:50]}...")

        # Xóa tất cả
        for content in test_contents:
            db.delete(content)

        db.commit()
        print(f"✅ Đã xóa thành công {len(test_contents)} test content.")

        # Thống kê còn lại
        remaining = db.query(ContentQueue).count()
        print(f"📊 Còn lại {remaining} content trong database.")

    except Exception as e:
        print(f"❌ Lỗi: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    quick_delete_test()
