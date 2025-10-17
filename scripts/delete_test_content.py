#!/usr/bin/env python3
"""
Script để xóa tất cả test content đã tạo
"""

import os
import sys
from datetime import datetime

# Thêm backend vào Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from src.database.models import ContentQueue, Site
from src.database.session import SessionLocal


def delete_test_content():
    """Xóa tất cả test content"""
    db = SessionLocal()
    try:
        # Tìm tất cả content có title chứa "Test"
        test_contents = db.query(ContentQueue).filter(
            ContentQueue.title.like("%Test%")
        ).all()
        
        if not test_contents:
            print("ℹ️ Không tìm thấy test content nào.")
            return
        
        print(f"🔍 Tìm thấy {len(test_contents)} test content:")
        
        # Hiển thị danh sách trước khi xóa
        for content in test_contents:
            print(f"  - #{content.id}: {content.title} (status: {content.status})")
        
        # Xác nhận xóa
        confirm = input(f"\n❓ Bạn có chắc muốn xóa {len(test_contents)} test content? (y/N): ")
        if confirm.lower() != 'y':
            print("❌ Đã hủy xóa.")
            return
        
        # Xóa từng content
        deleted_count = 0
        for content in test_contents:
            db.delete(content)
            deleted_count += 1
        
        db.commit()
        
        print(f"✅ Đã xóa thành công {deleted_count} test content.")
        
        # Hiển thị thống kê còn lại
        remaining = db.query(ContentQueue).count()
        print(f"📊 Còn lại {remaining} content trong database.")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        db.rollback()
    finally:
        db.close()


def delete_all_content():
    """Xóa TẤT CẢ content (nguy hiểm!)"""
    db = SessionLocal()
    try:
        all_contents = db.query(ContentQueue).all()
        
        if not all_contents:
            print("ℹ️ Không có content nào trong database.")
            return
        
        print(f"⚠️ Tìm thấy {len(all_contents)} content trong database:")
        
        # Hiển thị danh sách
        for content in all_contents:
            print(f"  - #{content.id}: {content.title[:50]}... (status: {content.status})")
        
        # Xác nhận xóa
        confirm = input(f"\n🚨 CẢNH BÁO: Bạn có chắc muốn xóa TẤT CẢ {len(all_contents)} content? (y/N): ")
        if confirm.lower() != 'y':
            print("❌ Đã hủy xóa.")
            return
        
        # Xóa tất cả
        for content in all_contents:
            db.delete(content)
        
        db.commit()
        print(f"✅ Đã xóa thành công {len(all_contents)} content.")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("🧹 Script xóa test content")
    print("1. Xóa chỉ test content (có 'Test' trong title)")
    print("2. Xóa TẤT CẢ content (nguy hiểm!)")
    print("3. Thoát")
    
    choice = input("\nChọn option (1-3): ")
    
    if choice == "1":
        delete_test_content()
    elif choice == "2":
        delete_all_content()
    elif choice == "3":
        print("👋 Tạm biệt!")
    else:
        print("❌ Lựa chọn không hợp lệ.")
