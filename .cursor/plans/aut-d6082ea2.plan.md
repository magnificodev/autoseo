<!-- d6082ea2-d22f-48c2-9008-6fea7417a16d b3d307dc-b842-4707-8a8a-a0acedb74ed5 -->
# Autoseo – Kế hoạch theo giai đoạn (ngắn gọn)

## Giai đoạn 0 – Khởi tạo (Ngày 0–1)

- Mục tiêu: Dọn dẹp repo, cấu hình môi trường, chạy container local.
- Phạm vi:
- Tạo skeleton theo cấu trúc trong `seo-automation-system.plan.md`.
- Thêm `.env.example`, các file compose, `nginx.conf`.
- Backend tối thiểu `backend/src/api/main.py` có `/health` và CORS.
- Frontend Next.js 14 khởi tạo, trang `/login` dạng stub.
- Bàn giao: `docker-compose.yml` chạy `postgres`, `redis`, `backend`, `dashboard` và `/health` phản hồi OK.
- Tiêu chí nghiệm thu: `docker compose up` → backend trả 200 `/health`, dashboard hiển thị.

## Giai đoạn 1 – Nền tảng cốt lõi (Tuần 1–2)

- Mục tiêu: CRUD an toàn và quy trình publish cơ bản, có kiểm thử và CI.
- Backend
- CSDL: Mô hình `SQLAlchemy` và migration Alembic cho `sites`, `keywords`, `content_queue`, `users`.
- Bảo mật: JWT (`src/api/middleware/auth.py`), rate limiting (`slowapi`), băm mật khẩu và mã hóa Fernet (`src/utils/encryption.py`).
- API lõi: routers `sites`, `keywords`, `content`, `health`; client WordPress có test kết nối; wrapper OpenAI kèm theo theo dõi chi phí.
- Ghi log: Logger JSON có cấu trúc, xử lý lỗi tập trung.
- Frontend
- Luồng đăng nhập và bảo vệ route.
- Quản lý Sites (CRUD, kiểm tra kết nối).
- Hàng đợi nội dung (xem, duyệt/từ chối), form tạo nội dung thủ công.
- API client và types; UI cơ bản với shadcn.
- DevOps/CI
- GitHub Actions: unit/integration backend, test frontend, upload coverage.
- Dockerfiles cho backend/dashboard; healthcheck trong compose.
- Kiểm thử
- Backend unit (≥80% phần lõi), integration cho endpoint chính.
- Frontend test component cho form/bảng.
- Tiêu chí nghiệm thu
- Thêm site → tạo nội dung thủ công → duyệt → publish lên WordPress (môi trường test) thành công ≥95% local.
- CI xanh cho PR vào `develop` và push `main`.

## Giai đoạn 2 – Tự động hóa & Telegram (Tuần 3)

- Mục tiêu: Sinh/đăng nền background và điều khiển/nhận cảnh báo qua chat.
- Backend
- Celery + Redis: workers + beat; lịch sinh nội dung theo cấu hình site.
- Nghiên cứu từ khóa (pytrends): xu hướng VN; theo dõi trạng thái/số lần dùng.
- Module biến thể nội dung; điều phối hàng đợi.
- Telegram
- Thiết lập bot với `/addsite`, `/sites`, `/approve`, `/reject`, báo cáo hằng ngày.
- Hook thông báo khi publish thành công/thất bại.
- Frontend
- Trang quản lý từ khóa; điều khiển lịch theo site/nhóm.
- Cập nhật thời gian thực qua WebSocket cho trạng thái queue.
- Thao tác hàng loạt (duyệt/publish).
- Tiêu chí nghiệm thu
- Scheduler đăng theo tần suất/khung giờ cấu hình.
- Lệnh Telegram vận hành luồng chính end-to-end.

## Giai đoạn 3 – Phân tích & Gia cố (Tuần 4)

- Mục tiêu: Insight, chất lượng, quan sát hệ thống và bảo mật.
- Backend
- Phân tích đối thủ (scraping) và kiểm tra chất lượng nội dung.
- Nâng cao SEO meta và sinh alt text bằng AI.
- Nhật ký kiểm toán cho thao tác nhạy cảm.
- Giám sát: health metrics, tích hợp Sentry.
- Frontend
- Dashboard phân tích: thẻ thống kê, biểu đồ hiệu năng, chỉ số theo site.
- Xem trước nội dung, lọc/tìm kiếm nâng cao.
- Hạ tầng
- Tự động sao lưu, profiling hiệu năng, hardening bảo mật.
- Tiêu chí nghiệm thu
- Dashboard phân tích có dữ liệu; tỉ lệ lỗi <1%; cảnh báo hoạt động.

## Giai đoạn 4 – Nâng cao/Tùy chọn (Tuần 5+)

- Tùy chọn: Tích hợp Google Search Console, đa người dùng RBAC, A/B testing tiêu đề/meta, hỗ trợ liên kết nội bộ, cải thiện sinh ảnh, tối ưu hiệu năng, cổng white‑label.
- Tiêu chí nghiệm thu theo từng hạng mục được chọn.

## Bản đồ module (chính)

- Backend: `src/api/routes/{auth,sites,keywords,content,health}.py`, `src/core/{content_generator,image_manager,keyword_research,content_variation,wordpress_client}.py`, `src/scheduler/{celery_app,tasks,content_queue}.py`, `src/database/{models,db_manager,migrations}/`.
- Frontend: `src/app/(dashboard)/{page.tsx,sites,keywords,content,...}`, `src/lib/{api-client,websocket,auth}.ts`, `src/components/sites/*`, `src/components/content/*`.

## Ma trận chấp nhận (mỗi giai đoạn)

- API p95 < 500ms, uptime 99.9% (health container), publish thành công ≥95%, backend coverage ≥80%, frontend ≥70%.

## Môi trường & Triển khai

- Dev bằng docker compose; staging/production triển khai bằng GitHub Actions SSH tới `40.82.144.18`.
- Sau triển khai: chạy `alembic upgrade head`, kiểm tra health, cấu hình SSL qua nginx/Let’s Encrypt.

### To-dos

- [ ] Khởi tạo skeleton repo, tạo file môi trường, compose, backend/dashboard cơ bản
- [ ] Tạo models SQLAlchemy và migration Alembic cho các bảng lõi
- [ ] Thêm xác thực JWT, rate limiting và tiện ích mã hóa mật khẩu (Fernet)
- [ ] Xây dựng routers sites/keywords/content/health và WordPress client (kèm kiểm tra kết nối)
- [ ] Triển khai đăng nhập, Sites CRUD, hàng đợi nội dung và API client
- [ ] Thiết lập GitHub Actions cho kiểm thử/coverage và viết Dockerfiles
- [ ] Thêm Celery workers/beat và scheduler tự động sinh/đăng nội dung
- [ ] Xây bot Telegram: lệnh điều khiển và thông báo/báo cáo hằng ngày
- [ ] Thêm WebSocket cập nhật thời gian thực và thao tác hàng loạt trên UI
- [ ] Bổ sung dashboard phân tích và cơ chế kiểm tra chất lượng nội dung
- [ ] Thêm audit logs, tích hợp Sentry, sao lưu tự động và hardening bảo mật
- [ ] Triển khai các tính năng nâng cao đã chọn (GSC, RBAC, A/B testing, v.v.)