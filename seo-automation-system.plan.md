# SEO Automation System - Enhanced Plan

## 🎯 Tổng quan

Hệ thống SEO Automation toàn diện để tự động tạo và đăng nội dung AI cho 50 WordPress sites, với Next.js Dashboard, Telegram Bot, CI/CD automation, testing đầy đủ, và các tính năng bảo mật, monitoring nâng cao.
 
## 🏗️ Kiến trúc hệ thống

### Backend Service (Python FastAPI)

-   **Content Generator**: AI content creation với OpenAI GPT-4/3.5
-   **Image Manager**: Hybrid strategy (Stock photos + DALL-E 3)
-   **Keyword Research**: Trending keywords Việt Nam (pytrends)
-   **Competitor Analyzer**: Web scraping & content analysis
-   **WordPress Publisher**: REST API integration với Application Passwords
-   **Scheduler**: Celery + Redis cho background tasks
-   **Security**: JWT auth, rate limiting, password encryption
-   **Monitoring**: Centralized logging, health checks, error tracking

### Frontend Dashboard (Next.js 14)

-   **Sites Management**: CRUD 50 WordPress sites với test connection
-   **Content Queue**: Approve/reject content với preview
-   **Keyword Manager**: Trending keywords, manual input
-   **Analytics**: Performance charts, site statistics
-   **Scheduler Control**: Configure posting frequency per site
-   **Real-time Updates**: WebSocket integration

### Telegram Bot

-   **Quick Commands**: /addsite, /sites, /stats, /approve
-   **Notifications**: Success/failure alerts, daily digest
-   **Manual Control**: Approve/reject content queue
-   **Trending Alerts**: New trending keywords notifications

## 📁 Cấu trúc dự án

```
autoseo/
├── backend/                    # Python Backend
│   ├── src/
│   │   ├── api/               # FastAPI
│   │   │   ├── routes/
│   │   │   │   ├── auth.py           # JWT authentication
│   │   │   │   ├── sites.py          # Sites CRUD
│   │   │   │   ├── keywords.py       # Keywords management
│   │   │   │   ├── content.py        # Content queue
│   │   │   │   ├── scheduler.py      # Scheduler control
│   │   │   │   ├── analytics.py      # Analytics endpoints
│   │   │   │   └── health.py         # Health checks
│   │   │   ├── middleware/
│   │   │   │   ├── auth.py           # JWT middleware
│   │   │   │   ├── rate_limit.py     # Rate limiting
│   │   │   │   └── cors.py           # CORS configuration
│   │   │   ├── websocket.py          # WebSocket handlers
│   │   │   └── main.py               # FastAPI app
│   │   ├── core/
│   │   │   ├── content_generator.py  # OpenAI integration
│   │   │   ├── image_manager.py     # Image processing
│   │   │   ├── keyword_research.py  # Trending keywords
│   │   │   ├── competitor_analyzer.py # Web scraping
│   │   │   ├── wordpress_client.py  # WP REST API
│   │   │   ├── content_safety.py    # Safety filters
│   │   │   └── content_variation.py  # Avoid duplicates
│   │   ├── scheduler/
│   │   │   ├── celery_app.py         # Celery configuration
│   │   │   ├── tasks.py              # Background tasks
│   │   │   └── content_queue.py      # Queue management
│   │   ├── database/
│   │   │   ├── models.py             # SQLAlchemy models
│   │   │   ├── db_manager.py         # Database connection
│   │   │   └── migrations/           # Alembic migrations
│   │   ├── telegram/
│   │   │   ├── bot.py                # Bot setup
│   │   │   ├── handlers.py           # Command handlers
│   │   │   └── notifications.py     # Notification system
│   │   └── utils/
│   │       ├── encryption.py         # Password encryption
│   │       ├── logger.py             # Centralized logging
│   │       ├── cache.py              # Redis caching
│   │       └── validators.py         # Data validation
│   ├── tests/
│   │   ├── unit/                     # Unit tests
│   │   ├── integration/              # Integration tests
│   │   └── e2e/                      # End-to-end tests
│   ├── scripts/
│   │   ├── create_admin.py           # Admin user creation
│   │   └── seed_database.py          # Database seeding
│   ├── requirements.txt
│   └── Dockerfile
│
├── dashboard/                  # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── page.tsx          # Overview dashboard
│   │   │   │   ├── sites/           # Sites management
│   │   │   │   ├── keywords/        # Keywords manager
│   │   │   │   ├── content/         # Content queue
│   │   │   │   ├── scheduler/       # Scheduler control
│   │   │   │   └── analytics/       # Analytics dashboard
│   │   │   ├── api/                 # Next.js API routes
│   │   │   ├── login/               # Authentication
│   │   │   └── layout.tsx           # Root layout
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── sites/
│   │   │   │   ├── SiteForm.tsx     # Add/edit site form
│   │   │   │   ├── SiteTable.tsx    # Sites list table
│   │   │   │   └── TestConnection.tsx # Connection test
│   │   │   ├── content/
│   │   │   │   ├── ContentQueue.tsx # Queue management
│   │   │   │   ├── ContentPreview.tsx # Content preview
│   │   │   │   └── BulkActions.tsx  # Bulk operations
│   │   │   └── analytics/
│   │   │       ├── StatsCards.tsx   # Statistics cards
│   │   │       ├── PerformanceChart.tsx # Performance charts
│   │   │       └── SiteMetrics.tsx  # Site-specific metrics
│   │   ├── lib/
│   │   │   ├── api-client.ts        # Backend API client
│   │   │   ├── websocket.ts         # WebSocket client
│   │   │   ├── auth.ts              # Authentication utilities
│   │   │   └── utils.ts             # Utility functions
│   │   ├── hooks/
│   │   │   ├── useAuth.ts           # Authentication hook
│   │   │   ├── useWebSocket.ts      # WebSocket hook
│   │   │   └── useSites.ts          # Sites data hook
│   │   └── types/
│   │       ├── api.ts               # API types
│   │       ├── site.ts              # Site types
│   │       └── content.ts           # Content types
│   ├── tests/
│   │   ├── components/              # Component tests
│   │   ├── pages/                   # Page tests
│   │   └── e2e/                     # E2E tests
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       ├── test.yml                 # Test pipeline
│       ├── deploy.yml               # Deploy pipeline
│       └── security.yml             # Security scanning
│
├── docker-compose.yml              # Development
├── docker-compose.staging.yml      # Staging environment
├── docker-compose.test.yml          # Testing environment
├── nginx.conf                       # Nginx configuration
├── .env.example                     # Environment template
└── README.md                        # Documentation
```

## 🗄️ Database Schema (PostgreSQL)

### Core Tables

**Sites Table** - Quản lý 50 WordPress sites

```sql
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    app_password_encrypted TEXT NOT NULL, -- AES-256 encrypted
    status site_status DEFAULT 'testing',
    niche VARCHAR(100),
    language VARCHAR(10) DEFAULT 'vi',
    posts_per_week INTEGER DEFAULT 3 CHECK (posts_per_week BETWEEN 1 AND 10),
    publish_time_start TIME DEFAULT '08:00',
    publish_time_end TIME DEFAULT '18:00',
    seo_plugin seo_plugin_type DEFAULT 'none',
    default_category_id INTEGER,
    default_tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    group_ids JSONB DEFAULT '[]',
    last_published_at TIMESTAMP,
    total_published INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE TYPE site_status AS ENUM ('active', 'inactive', 'error', 'testing');
CREATE TYPE seo_plugin_type AS ENUM ('yoast', 'rankmath', 'aioseo', 'none');
```

**Site Groups Table** - Phân nhóm sites

```sql
CREATE TABLE site_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
    posting_strategy JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Keywords Table** - Từ khóa theo dõi

```sql
CREATE TABLE keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword VARCHAR(255) NOT NULL,
    search_volume INTEGER,
    competition DECIMAL(3,2) CHECK (competition BETWEEN 0.00 AND 1.00),
    trend_score DECIMAL(5,2),
    country VARCHAR(2) DEFAULT 'VN',
    language VARCHAR(10) DEFAULT 'vi',
    source keyword_source DEFAULT 'manual',
    related_keywords JSONB DEFAULT '[]',
    status keyword_status DEFAULT 'active',
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE keyword_source AS ENUM ('manual', 'trending', 'competitor');
CREATE TYPE keyword_status AS ENUM ('active', 'used', 'exhausted');
```

**Content Queue Table** - Hàng đợi nội dung

```sql
CREATE TABLE content_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id),
    keyword_id UUID NOT NULL REFERENCES keywords(id),
    content_type content_type_enum NOT NULL,
    title TEXT,
    content TEXT, -- Generated HTML content
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    featured_image_url TEXT,
    status content_status DEFAULT 'pending',
    scheduled_time TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    wordpress_post_id INTEGER,
    generation_prompt TEXT,
    ai_model VARCHAR(50),
    tokens_used INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

CREATE TYPE content_type_enum AS ENUM ('article', 'landing_page', 'product_desc');
CREATE TYPE content_status AS ENUM ('pending', 'generated', 'approved', 'rejected', 'published', 'failed');
```

**Users Table** - Quản lý users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    telegram_chat_id BIGINT UNIQUE,
    role user_role DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');
```

**Audit Logs Table** - Lịch sử thao tác

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Security & Authentication

### JWT Authentication

```python
# src/api/middleware/auth.py
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthManager:
    def __init__(self):
        self.secret_key = settings.JWT_SECRET
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30

    def create_access_token(self, data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)
```

### Rate Limiting

```python
# src/api/middleware/rate_limit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"]
)

# Apply to routes
@limiter.limit("10/minute")  # Content generation
@limiter.limit("5/minute")   # WordPress publish
@limiter.limit("20/minute")  # General APIs
```

### Password Encryption

```python
# src/utils/encryption.py
from cryptography.fernet import Fernet

class PasswordEncryption:
    def __init__(self, key: bytes):
        self.cipher = Fernet(key)

    def encrypt(self, password: str) -> str:
        return self.cipher.encrypt(password.encode()).decode()

    def decrypt(self, encrypted: str) -> str:
        return self.cipher.decrypt(encrypted.encode()).decode()
```

## 📊 Monitoring & Logging

### Centralized Logging

```python
# src/utils/logger.py
import logging
import json
from pythonjsonlogger import jsonlogger
from datetime import datetime

class StructuredLogger:
    def __init__(self):
        self.logger = logging.getLogger()
        handler = logging.StreamHandler()
        formatter = jsonlogger.JsonFormatter()
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)

    def log_content_published(self, site_id: str, content_id: str, wp_post_id: int):
        self.logger.info("Content published", extra={
            "event": "content_published",
            "site_id": site_id,
            "content_id": content_id,
            "wp_post_id": wp_post_id,
            "timestamp": datetime.utcnow().isoformat()
        })

    def log_error(self, error: Exception, context: dict):
        self.logger.error("System error", extra={
            "event": "error",
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context,
            "timestamp": datetime.utcnow().isoformat()
        })
```

### Health Monitoring

```python
# src/api/routes/health.py
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": await check_db_connection(),
            "redis": await check_redis_connection(),
            "openai": await check_openai_quota(),
            "wordpress_sites": await count_active_sites()
        },
        "metrics": {
            "queue_size": await get_queue_size(),
            "active_tasks": await get_active_tasks(),
            "memory_usage": get_memory_usage()
        }
    }
```

## 🎨 Content Generation & Safety

### Content Generator với Safety

```python
# src/core/content_generator.py
class ContentGenerator:
    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.safety_checker = ContentSafetyChecker()

    async def generate_content(self, keyword: str, content_type: str, site_niche: str):
        # 1. Generate content with OpenAI
        prompt = self.build_prompt(keyword, content_type, site_niche)
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )

        content = response.choices[0].message.content

        # 2. Safety check
        safety_result = await self.safety_checker.check_content(content)
        if not safety_result["safe"]:
            raise ContentSafetyError("Content failed safety check")

        # 3. SEO optimization
        optimized_content = self.optimize_for_seo(content, keyword)

        return {
            "content": optimized_content,
            "tokens_used": response.usage.total_tokens,
            "model": "gpt-4-turbo-preview"
        }
```

### Content Variation để tránh duplicate

```python
# src/core/content_variation.py
class ContentVariation:
    def generate_variations(self, base_keyword: str, num_sites: int):
        variations = []
        for i in range(num_sites):
            angle = self.select_unique_angle(base_keyword, i)
            tone = self.select_tone(i)
            audience = self.select_audience(i)

            prompt = f"""
            Viết về '{base_keyword}' với:
            - Góc nhìn: {angle}
            - Tone: {tone}
            - Đối tượng: {audience}
            - Tránh trùng lặp với các bài khác
            """
            variations.append(prompt)
        return variations
```

### Image Manager với Hybrid Strategy

```python
# src/core/image_manager.py
class ImageManager:
    def __init__(self):
        self.unsplash_client = UnsplashClient()
        self.pexels_client = PexelsClient()
        self.dalle_client = DALLEClient()

    async def get_featured_image(self, keyword: str, niche: str, content_type: str):
        # 1. Try stock photos first (fast & free)
        image = await self.unsplash_client.search(keyword, niche)
        if not image:
            image = await self.pexels_client.search(keyword, niche)

        # 2. Fallback to DALL-E if needed
        if not image or image.quality_score < 0.7:
            image = await self.dalle_client.generate(keyword, content_type)

        # 3. Process and optimize
        optimized = self.optimize_image(image)
        webp_image = self.convert_to_webp(optimized)

        # 4. Generate alt text with AI
        alt_text = await self.generate_alt_text(keyword, image.context)

        return {
            'image_data': webp_image,
            'alt_text': alt_text,
            'source': image.source
        }
```

## 🤖 Telegram Bot

### Command Handlers

```python
# src/telegram/handlers.py
class TelegramHandlers:
    async def handle_addsite(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Wizard để thêm site mới"""
        await update.message.reply_text("Nhập URL WordPress:")
        # Store state và tiếp tục wizard

    async def handle_sites(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Hiển thị danh sách sites"""
        sites = await get_user_sites(update.effective_user.id)
        keyboard = self.build_sites_keyboard(sites)
        await update.message.reply_text("Danh sách sites:", reply_markup=keyboard)

    async def handle_approve_content(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Approve content từ queue"""
        content_id = context.args[0]
        await approve_content(content_id, update.effective_user.id)
        await update.message.reply_text("✅ Content đã được approve!")
```

### Notification System

```python
# src/telegram/notifications.py
class NotificationManager:
    async def send_publish_success(self, site_name: str, post_title: str, chat_id: int):
        message = f"""
        ✅ **Đăng bài thành công!**
        Site: {site_name}
        Bài viết: {post_title}
        Thời gian: {datetime.now().strftime('%H:%M %d/%m/%Y')}
        """
        await self.bot.send_message(chat_id, message, parse_mode='Markdown')

    async def send_daily_digest(self, user_id: int):
        stats = await get_daily_stats(user_id)
        message = f"""
        📊 **Báo cáo hàng ngày**
        Số bài đã đăng: {stats['published']}
        Số bài trong queue: {stats['queue']}
        Sites hoạt động: {stats['active_sites']}
        """
        await self.bot.send_message(user_id, message)
```

## 🧪 Testing Strategy

### Backend Testing

```python
# tests/conftest.py
import pytest
from unittest.mock import Mock, AsyncMock

@pytest.fixture
def mock_openai():
    """Mock OpenAI responses"""
    mock = AsyncMock()
    mock.chat.completions.create.return_value = Mock(
        choices=[Mock(message=Mock(content="Generated content"))],
        usage=Mock(total_tokens=100)
    )
    return mock

@pytest.fixture
def test_site():
    """Sample test site"""
    return {
        "url": "https://test-site.com",
        "username": "test",
        "app_password": "test_password"
    }

# tests/unit/test_content_generator.py
class TestContentGenerator:
    async def test_generate_article(self, mock_openai):
        generator = ContentGenerator()
        result = await generator.generate_content("AI", "article", "tech")
        assert result["content"] == "Generated content"
        assert result["tokens_used"] == 100
```

### Frontend Testing

```typescript
// tests/components/SiteForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SiteForm } from '@/components/sites/SiteForm';

describe('SiteForm', () => {
    it('should validate WordPress URL', () => {
        render(<SiteForm />);
        const urlInput = screen.getByLabelText('WordPress URL');
        fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
        expect(screen.getByText('URL không hợp lệ')).toBeInTheDocument();
    });
});
```

### E2E Testing

```python
# tests/e2e/test_full_workflow.py
class TestFullWorkflow:
    async def test_add_site_and_publish_content(self):
        # 1. Add site
        site_data = {
            "name": "Test Site",
            "url": "https://test-wp.com",
            "username": "admin",
            "app_password": "test_password"
        }
        site = await create_site(site_data)

        # 2. Generate content
        content = await generate_content(site.id, "AI technology")

        # 3. Approve and publish
        await approve_content(content.id)
        published_post = await publish_content(content.id)

        assert published_post.status == "published"
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
    pull_request:
    push:
        branches: [main, develop]

jobs:
    backend-tests:
        runs-on: ubuntu-latest
        services:
            postgres:
                image: postgres:15
                env:
                    POSTGRES_PASSWORD: test
                options: >-
                    --health-cmd pg_isready
                    --health-interval 10s
            redis:
                image: redis:7-alpine

        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-python@v4
              with:
                  python-version: '3.11'

            - name: Install dependencies
              run: |
                  cd backend
                  pip install -r requirements.txt
                  pip install pytest pytest-cov pytest-asyncio

            - name: Run unit tests
              run: pytest tests/unit --cov=src --cov-report=xml

            - name: Run integration tests
              run: pytest tests/integration

            - name: Upload coverage
              uses: codecov/codecov-action@v3

    frontend-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                  node-version: '20'

            - name: Install dependencies
              run: |
                  cd dashboard
                  npm ci

            - name: Run tests
              run: npm test -- --coverage

            - name: Run E2E tests
              run: npx playwright test

    e2e-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3

            - name: Start services
              run: docker-compose -f docker-compose.test.yml up -d

            - name: Wait for services
              run: sleep 30

            - name: Run E2E tests
              run: |
                  cd backend
                  pytest tests/e2e

            - name: Cleanup
              run: docker-compose -f docker-compose.test.yml down
```

### Deployment Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
    push:
        branches: [main]
    workflow_dispatch:

jobs:
    deploy:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3

            - name: Deploy to Server
              uses: appleboy/ssh-action@master
              with:
                  host: 40.82.144.18
                  username: ${{ secrets.SSH_USER }}
                  key: ${{ secrets.SSH_PRIVATE_KEY }}
                  script: |
                      cd /opt/autoseo
                      git pull origin main
                      docker-compose down
                      docker-compose build
                      docker-compose up -d
                      docker-compose exec backend alembic upgrade head
```

## 🐳 Docker Configuration

### Backend Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
    postgres:
        image: postgres:15
        environment:
            POSTGRES_DB: autoseo
            POSTGRES_PASSWORD: ${DB_PASSWORD}
        volumes:
            - postgres_data:/var/lib/postgresql/data
        healthcheck:
            test: ['CMD-SHELL', 'pg_isready -U postgres']
            interval: 10s
            timeout: 5s
            retries: 5

    redis:
        image: redis:7-alpine
        healthcheck:
            test: ['CMD', 'redis-cli', 'ping']
            interval: 10s
            timeout: 5s
            retries: 5

    backend:
        build: ./backend
        environment:
            DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres/autoseo
            REDIS_URL: redis://redis:6379
            OPENAI_API_KEY: ${OPENAI_API_KEY}
            ENCRYPTION_KEY: ${ENCRYPTION_KEY}
        depends_on:
            postgres:
                condition: service_healthy
            redis:
                condition: service_healthy
        ports:
            - '8000:8000'
        healthcheck:
            test: ['CMD', 'curl', '-f', 'http://localhost:8000/health']
            interval: 30s
            timeout: 10s
            retries: 3

    celery:
        build: ./backend
        command: celery -A src.scheduler.celery_app worker -l info
        environment:
            DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres/autoseo
            REDIS_URL: redis://redis:6379
        depends_on:
            - postgres
            - redis

    celery-beat:
        build: ./backend
        command: celery -A src.scheduler.celery_app beat -l info
        environment:
            DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres/autoseo
            REDIS_URL: redis://redis:6379
        depends_on:
            - postgres
            - redis

    telegram-bot:
        build: ./backend
        command: python telegram_service.py
        environment:
            DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres/autoseo
            TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
        depends_on:
            - backend

    dashboard:
        build: ./dashboard
        ports:
            - '3000:3000'
        environment:
            NEXT_PUBLIC_API_URL: http://backend:8000
        depends_on:
            - backend

    nginx:
        image: nginx:alpine
        ports:
            - '80:80'
            - '443:443'
        volumes:
            - ./nginx.conf:/etc/nginx/nginx.conf
            - ./ssl:/etc/nginx/ssl
        depends_on:
            - backend
            - dashboard

volumes:
    postgres_data:
```

## 📋 Development Phases

### PHASE 1: Foundation & Core (Week 1-2)

**Backend Tasks:**

-   [ ] Setup project structure và Docker environment
-   [ ] Database models và migrations (SQLAlchemy + Alembic)
-   [ ] Password encryption utility (Fernet)
-   [ ] JWT authentication middleware
-   [ ] Rate limiting middleware
-   [ ] WordPress REST API client với test connection
-   [ ] OpenAI integration với cost tracking
-   [ ] Image Manager (Unsplash API)
-   [ ] Basic FastAPI endpoints (sites, content, keywords)
-   [ ] Centralized logging setup
-   [ ] Health check endpoints

**Frontend Tasks:**

-   [ ] Next.js 14 setup với TypeScript
-   [ ] Authentication system (login/register)
-   [ ] Sites management page (CRUD)
-   [ ] Test connection UI component
-   [ ] Content queue page (view, approve, reject)
-   [ ] Manual content creation form
-   [ ] API client setup

**DevOps Tasks:**

-   [ ] Docker Compose setup (all services)
-   [ ] GitHub Actions CI/CD pipeline
-   [ ] Environment variables configuration
-   [ ] Nginx reverse proxy config
-   [ ] SSL setup với Let's Encrypt

**Testing Tasks:**

-   [ ] Unit tests (Backend: 80% coverage)
-   [ ] Integration tests (API endpoints)
-   [ ] Component tests (Frontend)
-   [ ] E2E tests (full workflow)
-   [ ] Test fixtures và mocking

**Deliverable:** Hệ thống cơ bản có thể thêm sites, tạo content thủ công, publish lên WordPress, và auto-deploy

### PHASE 2: Automation & Telegram Bot (Week 3)

**Backend Tasks:**

-   [ ] Celery + Redis setup cho background tasks
-   [ ] Keyword research integration (pytrends)
-   [ ] Auto content generation scheduler
-   [ ] Content variation để tránh duplicate
-   [ ] Telegram Bot setup với commands
-   [ ] Notification system (success/failure alerts)
-   [ ] Site Groups management
-   [ ] Bulk import sites functionality

**Frontend Tasks:**

-   [ ] Keywords manager page
-   [ ] Scheduler control page
-   [ ] Real-time updates (WebSocket)
-   [ ] Bulk operations UI
-   [ ] Site groups management

**Telegram Tasks:**

-   [ ] /addsite wizard
-   [ ] /sites, /siteinfo, /stats commands
-   [ ] /approve, /reject content commands
-   [ ] Daily digest notifications
-   [ ] Trending keyword alerts

**Deliverable:** Hệ thống tự động tạo và đăng bài theo lịch, quản lý qua Dashboard & Telegram

### PHASE 3: Analytics & Optimization (Week 4)

**Backend Tasks:**

-   [ ] Competitor analyzer (web scraping)
-   [ ] Content quality checker
-   [ ] AI alt text generation
-   [ ] DALL-E 3 fallback cho images
-   [ ] Enhanced SEO meta generation
-   [ ] Audit logs system
-   [ ] Performance monitoring
-   [ ] Error tracking (Sentry)

**Frontend Tasks:**

-   [ ] Analytics dashboard
-   [ ] Performance charts (Recharts)
-   [ ] Content preview component
-   [ ] Advanced filters & search
-   [ ] Site metrics visualization

**Infrastructure Tasks:**

-   [ ] Production deployment optimization
-   [ ] Database backup automation
-   [ ] Monitoring setup (Prometheus/Grafana)
-   [ ] Security hardening

**Deliverable:** Production-ready system với analytics và monitoring

### PHASE 4: Advanced Features (Week 5+)

**Optional Enhancements:**

-   [ ] Google Search Console integration
-   [ ] Multi-user support với RBAC
-   [ ] A/B testing cho titles/meta
-   [ ] Internal linking intelligence
-   [ ] Content spinning/variation
-   [ ] Advanced image generation
-   [ ] Performance optimization
-   [ ] White-label client portal

## 🔧 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:password@postgres/autoseo

# Redis
REDIS_URL=redis://redis:6379

# OpenAI
OPENAI_API_KEY=sk-...

# Encryption
ENCRYPTION_KEY=...

# Telegram
TELEGRAM_BOT_TOKEN=...

# Images
UNSPLASH_ACCESS_KEY=...
PEXELS_API_KEY=...

# Auth
JWT_SECRET=...

# Server
SERVER_HOST=40.82.144.18

# Optional: Monitoring
SENTRY_DSN=...
```

## 📊 Success Metrics

### Technical Metrics

-   **Uptime**: 99.9% availability
-   **Response Time**: < 500ms cho APIs
-   **Test Coverage**: Backend 80%, Frontend 70%
-   **Error Rate**: < 1% failed requests

### Business Metrics

-   **Content Generation**: 50+ articles/day
-   **Publishing Success**: 95% success rate
-   **User Adoption**: Dashboard usage > 80%
-   **Cost Efficiency**: < $0.10 per article

## 🎯 Next Steps

1. **Setup Development Environment**

    - Clone repository
    - Setup Docker environment
    - Configure environment variables
    - Run initial migrations

2. **Start Phase 1 Development**

    - Begin với backend foundation
    - Setup database models
    - Implement authentication
    - Create basic API endpoints

3. **Testing & Quality Assurance**

    - Write unit tests
    - Setup CI/CD pipeline
    - Implement monitoring
    - Security audit

4. **Deployment & Production**
    - Deploy to server 40.82.144.18
    - Configure SSL
    - Setup monitoring
    - Performance optimization

Plan này đã được hoàn thiện với tất cả các cải tiến về security, monitoring, testing, và development workflow. Bạn có muốn tôi bắt đầu implement Phase 1 không?
