#!/usr/bin/env python3
"""
Script để tạo nhiều bài test cho tính năng phân trang
"""

import os
import sys
from datetime import datetime

# Thêm backend vào Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from src.database.models import ContentQueue, Site
from src.database.session import SessionLocal


def create_test_content():
    """Tạo nhiều bài test với các trạng thái khác nhau"""
    db = SessionLocal()
    try:
        # Kiểm tra xem có site nào không
        site = db.query(Site).first()
        if not site:
            print("❌ Không có site nào. Vui lòng tạo site trước.")
            return

        print(f"📝 Tạo bài test cho site: {site.name} (ID: {site.id})")

        # Tạo 50 bài pending
        print("🔄 Tạo 50 bài pending...")
        for i in range(1, 51):
            content = ContentQueue(
                site_id=site.id,
                title=f"Test Pending Article #{i:02d} - {datetime.now().strftime('%H:%M:%S')}",
                body=f"Đây là nội dung test cho bài pending số {i}. Nội dung này được tạo tự động để test tính năng phân trang của Telegram bot. Bài viết này chứa đầy đủ thông tin cần thiết để kiểm tra các chức năng approve, reject và publish.",
                status="pending",
                created_at=datetime.utcnow(),
            )
            db.add(content)

        # Tạo 30 bài approved
        print("✅ Tạo 30 bài approved...")
        for i in range(1, 31):
            content = ContentQueue(
                site_id=site.id,
                title=f"Test Approved Article #{i:02d} - {datetime.now().strftime('%H:%M:%S')}",
                body=f"Đây là nội dung test cho bài approved số {i}. Bài này đã được duyệt và sẵn sàng để publish. Nội dung chất lượng cao, phù hợp với tiêu chuẩn SEO và có thể đăng ngay lên website.",
                status="approved",
                created_at=datetime.utcnow(),
            )
            db.add(content)

        # Tạo 20 bài rejected
        print("🛑 Tạo 20 bài rejected...")
        for i in range(1, 21):
            content = ContentQueue(
                site_id=site.id,
                title=f"Test Rejected Article #{i:02d} - {datetime.now().strftime('%H:%M:%S')}",
                body=f"Đây là nội dung test cho bài rejected số {i}. Bài này bị từ chối vì lý do chất lượng không đạt yêu cầu hoặc nội dung trùng lặp. Cần được xem xét và chỉnh sửa trước khi có thể approve.",
                status="rejected",
                created_at=datetime.utcnow(),
            )
            db.add(content)

        # Tạo 10 bài published
        print("📢 Tạo 10 bài published...")
        for i in range(1, 11):
            content = ContentQueue(
                site_id=site.id,
                title=f"Test Published Article #{i:02d} - {datetime.now().strftime('%H:%M:%S')}",
                body=f"Đây là nội dung test cho bài published số {i}. Bài này đã được đăng lên website và có thể xem tại URL tương ứng. Nội dung đã được tối ưu SEO và sẵn sàng cho người dùng.",
                status="published",
                created_at=datetime.utcnow(),
            )
            db.add(content)

        db.commit()
        print("✅ Đã tạo thành công:")
        print("   - 50 bài pending")
        print("   - 30 bài approved")
        print("   - 20 bài rejected")
        print("   - 10 bài published")
        print("   - Tổng cộng: 110 bài")

        # Hiển thị thống kê
        stats = db.query(ContentQueue).filter(ContentQueue.site_id == site.id).all()
        pending_count = len([s for s in stats if s.status == "pending"])
        approved_count = len([s for s in stats if s.status == "approved"])
        rejected_count = len([s for s in stats if s.status == "rejected"])
        published_count = len([s for s in stats if s.status == "published"])

        print("\n📊 Thống kê hiện tại:")
        print(f"   - Pending: {pending_count} bài")
        print(f"   - Approved: {approved_count} bài")
        print(f"   - Rejected: {rejected_count} bài")
        print(f"   - Published: {published_count} bài")

    except Exception as e:
        print(f"❌ Lỗi: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_test_content()
