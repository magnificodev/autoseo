# Autoseo

Autoseo là hệ thống tự động hoá SEO gồm backend (FastAPI), dashboard (Next.js), hàng đợi xử lý (Redis/Celery ở giai đoạn sau) và tích hợp WordPress.

## Chạy nhanh (Phase 0)

1. Tạo file môi trường

```bash
cp .env.example .env
```

2. Khởi chạy dịch vụ

```bash
docker compose up --build
```

3. Kiểm tra health

-   Backend: http://localhost:8000/health
-   Dashboard: http://localhost:3000

## Cấu trúc (rút gọn)

```
backend/
  src/api/main.py
dashboard/
  app/login/page.tsx
docker-compose.yml
nginx.conf
.env.example
```

## Ghi chú

-   Phase 0 chỉ yêu cầu healthcheck hoạt động và UI dashboard hiển thị.
-   Các giai đoạn sau sẽ bổ sung database schema, auth, CI/CD, Telegram bot, v.v.
