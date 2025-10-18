# Autoseo Documentation

## 🚀 Quick Start

### Dashboard Access

-   **URL:** `http://40.82.144.18/`
-   **Test Account:** `admin@autoseo.com` / `admin123`

### API Documentation

-   **Interactive Docs:** `http://40.82.144.18:8000/docs`
-   **API Reference:** [API.md](./API.md)

## 📋 System Overview

Autoseo là hệ thống tự động hóa SEO với các tính năng:

-   **Content Generation:** Tự động tạo nội dung SEO
-   **Keyword Research:** Nghiên cứu từ khóa thông minh
-   **WordPress Integration:** Tích hợp với WordPress
-   **Telegram Bot:** Điều khiển qua Telegram
-   **Dashboard:** Giao diện quản lý web

## 🏗️ Architecture

### Backend (FastAPI)

-   **Port:** 8000
-   **Database:** PostgreSQL
-   **Cache:** Redis
-   **Queue:** Celery

### Frontend (Next.js)

-   **Port:** 3000
-   **Framework:** Next.js 14 + React 18
-   **UI:** Tailwind CSS + shadcn/ui
-   **State:** SWR + React Hook Form

### Infrastructure

-   **Reverse Proxy:** Nginx
-   **Containerization:** Docker Compose
-   **CI/CD:** GitHub Actions

## 🔧 Development

### Local Setup

```bash
# Clone repository
git clone <repository-url>
cd autoseo

# Start services
docker compose up -d

# Access services
# Dashboard: http://localhost:3000
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Environment Variables

```bash
# Backend
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost/autoseo
REDIS_URL=redis://localhost:6379

# Telegram
TELEGRAM_TOKEN=your-bot-token
TELEGRAM_OWNER_ID=your-user-id

# Dashboard
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

## 📚 API Endpoints

### Authentication

-   `POST /api/auth/register` - Register user
-   `POST /api/auth/login` - Login (token-based)
-   `POST /api/auth/login-cookie` - Login (cookie-based)
-   `GET /api/auth/me` - Get current user
-   `POST /api/auth/logout` - Logout

### Sites

-   `GET /api/sites/` - List sites
-   `POST /api/sites/` - Create site
-   `GET /api/sites/{id}` - Get site
-   `PUT /api/sites/{id}` - Update site (full)
-   `PATCH /api/sites/{id}` - Update site (partial)
-   `DELETE /api/sites/{id}` - Delete site
-   `POST /api/sites/{id}/test-connection` - Test connection

### Keywords

-   `GET /api/keywords/` - List keywords
-   `POST /api/keywords/` - Create keyword
-   `GET /api/keywords/{id}` - Get keyword
-   `PUT /api/keywords/{id}` - Update keyword (full)
-   `PATCH /api/keywords/{id}` - Update keyword (partial)
-   `DELETE /api/keywords/{id}` - Delete keyword

### Content Queue

-   `GET /api/content-queue/` - List content
-   `POST /api/content-queue/` - Create content
-   `GET /api/content-queue/{id}` - Get content
-   `PUT /api/content-queue/{id}` - Update content (full)
-   `PATCH /api/content-queue/{id}` - Update content (partial)
-   `DELETE /api/content-queue/{id}` - Delete content
-   `PATCH /api/content-queue/{id}/status` - Update status
-   `POST /api/content-queue/{id}/publish` - Publish content
-   `POST /api/content-queue/checklist` - Content checklist

## 🤖 Telegram Bot

### Commands

-   `/start` - Bot status and dashboard link
-   `/profile` - User profile and quick actions

### Features

-   **Simplified Interface:** Minimal commands for easy use
-   **Dashboard Integration:** Complex operations moved to web dashboard
-   **Status Updates:** Real-time notifications

## 📊 Dashboard Features

### Pages

-   **Sites:** Manage WordPress sites
-   **Keywords:** Keyword research and management
-   **Content Queue:** Content approval and publishing
-   **Audit Logs:** System activity tracking
-   **Login:** Authentication

### Features

-   **Real-time Updates:** SWR for data fetching
-   **Form Validation:** React Hook Form + Zod
-   **Responsive Design:** Mobile-friendly UI
-   **Error Handling:** User-friendly error messages

## 🔒 Security

### Authentication

-   **JWT Tokens:** Secure token-based auth
-   **HTTP-only Cookies:** XSS protection
-   **Password Hashing:** PBKDF2 with salt

### API Security

-   **Rate Limiting:** Prevent abuse
-   **CORS:** Cross-origin protection
-   **Input Validation:** Pydantic models

## 🚀 Deployment

### Staging

-   **URL:** `http://40.82.144.18/`
-   **Auto-deploy:** GitHub Actions on push to main
-   **Health Checks:** Docker health checks

### Production

-   **SSL:** Let's Encrypt certificates
-   **Monitoring:** Health metrics
-   **Backups:** Automated database backups

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest -q
```

### Frontend Tests

```bash
cd dashboard
npm test
```

### Integration Tests

-   **API Testing:** Postman/curl
-   **E2E Testing:** Playwright
-   **Load Testing:** Artillery

## 📈 Monitoring

### Health Checks

-   **Backend:** `GET /health`
-   **Database:** Connection status
-   **Redis:** Cache status
-   **Celery:** Queue status

### Metrics

-   **Response Time:** API performance
-   **Error Rate:** System reliability
-   **Queue Length:** Processing capacity

## 🛠️ Troubleshooting

### Common Issues

#### 502 Bad Gateway

-   Check if all services are running
-   Verify nginx configuration
-   Check service health

#### Authentication Issues

-   Verify JWT_SECRET is set
-   Check cookie settings
-   Clear browser cache

#### Database Issues

-   Check PostgreSQL connection
-   Verify database exists
-   Run migrations

### Logs

```bash
# View all logs
docker compose logs

# View specific service
docker compose logs backend
docker compose logs dashboard
```

## 📞 Support

### Documentation

-   **API Docs:** `/docs` endpoint
-   **Code Comments:** Inline documentation
-   **README:** This file

### Contact

-   **Issues:** GitHub Issues
-   **Email:** Support team
-   **Telegram:** Bot support

## 🔄 Updates

### Version History

-   **v1.0.0:** Initial release
-   **v1.1.0:** RESTful API improvements
-   **v1.2.0:** Dashboard enhancements

### Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed changes.

---

**Last Updated:** October 18, 2025
**Version:** 1.2.0
**Status:** Production Ready ✅
