# Autoseo API Documentation

## Overview
Autoseo API cung cấp RESTful endpoints để quản lý SEO automation system.

**Base URL:** `http://40.82.144.18:8000`  
**Interactive Docs:** `http://40.82.144.18:8000/docs`

## Authentication

### Register
```http
POST /api/auth/register
```

**Parameters:**
- `email` (string, required): Email address
- `password` (string, required): Password

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com"
}
```

### Login (Token-based)
```http
POST /api/auth/login
```

**Body (form-data):**
- `username`: Email address
- `password`: Password

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Login (Cookie-based)
```http
POST /api/auth/login-cookie
```

**Body (form-data):**
- `username`: Email address
- `password`: Password

**Response:** Sets HTTP-only cookie `token`

### Get Current User
```http
GET /api/auth/me
```

**Headers:**
- `Authorization: Bearer <token>` (for token-based)
- Cookie: `token=<token>` (for cookie-based)

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "user",
  "is_active": true
}
```

### Logout
```http
POST /api/auth/logout
```

**Response:**
```json
{
  "message": "Đăng xuất thành công"
}
```

## Sites Management

### List Sites
```http
GET /api/sites/
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "name": "My Blog",
    "wp_url": "https://example.com",
    "wp_username": "admin",
    "wp_password_enc": "encrypted_password",
    "is_auto_enabled": true,
    "schedule_cron": "0 9 * * *",
    "daily_quota": 5,
    "active_start_hour": 9,
    "active_end_hour": 17
  }
]
```

### Get Single Site
```http
GET /api/sites/{site_id}
```

### Create Site
```http
POST /api/sites/
```

**Body:**
```json
{
  "name": "My Blog",
  "wp_url": "https://example.com",
  "wp_username": "admin",
  "wp_password_enc": "encrypted_password"
}
```

### Update Site (Full)
```http
PUT /api/sites/{site_id}
```

### Update Site (Partial)
```http
PATCH /api/sites/{site_id}
```

**Body:**
```json
{
  "is_auto_enabled": true,
  "schedule_cron": "0 9 * * *",
  "daily_quota": 5,
  "active_start_hour": 9,
  "active_end_hour": 17
}
```

### Delete Site
```http
DELETE /api/sites/{site_id}
```

### Test Site Connection
```http
POST /api/sites/{site_id}/test-connection
```

**Response:**
```json
{
  "ok": true
}
```

## Keywords Management

### List Keywords
```http
GET /api/keywords/
```

**Query Parameters:**
- `limit` (int, default: 10): Number of results
- `page` (int, default: 1): Page number
- `q` (string): Search query
- `status` (string): Filter by status
- `category` (string): Filter by category

**Response:**
```json
[
  {
    "id": 1,
    "keyword": "SEO tips",
    "category": "marketing",
    "site_id": 1,
    "site_name": "My Blog",
    "status": "active",
    "search_volume": 1000,
    "difficulty": 50,
    "created_at": "2025-10-18T08:00:00Z",
    "updated_at": "2025-10-18T08:00:00Z"
  }
]
```

### Get Single Keyword
```http
GET /api/keywords/{keyword_id}
```

### Create Keyword
```http
POST /api/keywords/
```

**Body:**
```json
{
  "site_id": 1,
  "keyword": "SEO tips",
  "category": "marketing",
  "status": "active"
}
```

### Update Keyword (Full)
```http
PUT /api/keywords/{keyword_id}
```

### Update Keyword (Partial)
```http
PATCH /api/keywords/{keyword_id}
```

### Delete Keyword
```http
DELETE /api/keywords/{keyword_id}
```

## Content Queue Management

### List Content
```http
GET /api/content-queue/
```

**Query Parameters:**
- `limit` (int, default: 10): Number of results
- `page` (int, default: 1): Page number
- `q` (string): Search query
- `status` (string): Filter by status

**Response:**
```json
[
  {
    "id": 1,
    "title": "Bài viết mẫu",
    "content": "Nội dung",
    "status": "pending",
    "site_id": 1,
    "site_name": "My Blog",
    "created_at": "2025-10-18T08:00:00Z",
    "updated_at": "2025-10-18T08:00:00Z"
  }
]
```

### Get Single Content
```http
GET /api/content-queue/{content_id}
```

### Create Content
```http
POST /api/content-queue/
```

**Body:**
```json
{
  "site_id": 1,
  "title": "Bài viết mẫu",
  "body": "Nội dung bài viết",
  "status": "pending"
}
```

### Update Content (Full)
```http
PUT /api/content-queue/{content_id}
```

### Update Content (Partial)
```http
PATCH /api/content-queue/{content_id}
```

### Delete Content
```http
DELETE /api/content-queue/{content_id}
```

### Update Content Status
```http
PATCH /api/content-queue/{content_id}/status
```

**Body:**
```json
{
  "status": "approved"
}
```

### Publish Content
```http
POST /api/content-queue/{content_id}/publish
```

**Response:**
```json
{
  "ok": true,
  "post_id": 123,
  "link": "https://example.com/post/123",
  "raw": {...}
}
```

### Content Checklist
```http
POST /api/content-queue/checklist
```

**Body:**
```json
{
  "title": "Bài viết mẫu",
  "body": "Nội dung bài viết"
}
```

**Response:**
```json
{
  "passed": true,
  "score": 85,
  "issues": [],
  "warnings": ["no_headings_found"]
}
```

## Health Check

### System Health
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-18T08:00:00Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Không thể xác thực"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

- **Authentication endpoints:** 10 requests/minute
- **API endpoints:** 100 requests/minute
- **Bulk operations:** 5 requests/minute

## Examples

### Complete Workflow

1. **Register user:**
```bash
curl -X POST "http://40.82.144.18:8000/api/auth/register?email=user@example.com&password=password123"
```

2. **Login:**
```bash
curl -X POST "http://40.82.144.18:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password123"
```

3. **Create site:**
```bash
curl -X POST "http://40.82.144.18:8000/api/sites/" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Blog", "wp_url": "https://example.com", "wp_username": "admin", "wp_password_enc": "password"}'
```

4. **Create keyword:**
```bash
curl -X POST "http://40.82.144.18:8000/api/keywords/" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"site_id": 1, "keyword": "SEO tips", "category": "marketing"}'
```

5. **Create content:**
```bash
curl -X POST "http://40.82.144.18:8000/api/content-queue/" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"site_id": 1, "title": "Bài viết mẫu", "body": "Nội dung", "status": "pending"}'
```

## Dashboard Access

**URL:** `http://40.82.144.18/`  
**Test Account:** `admin@autoseo.com` / `admin123`

## Support

For technical support, please contact the development team.
