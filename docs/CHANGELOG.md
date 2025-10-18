# Changelog

All notable changes to the Autoseo project will be documented in this file.

## [1.2.0] - 2025-10-18

### Added

-   **RESTful API Compliance (10/10):** Complete RESTful API implementation
-   **Missing REST Operations:** Added GET/{id}, PUT/{id}, DELETE/{id} for all resources
-   **API Documentation:** Comprehensive API documentation with examples
-   **Pre-filled Login:** Test credentials pre-filled in login form
-   **Cookie Authentication:** HTTP-only cookie-based authentication for dashboard
-   **Standardized Responses:** Consistent error handling and response formats

### Changed

-   **API Prefix:** All routes now use `/api/` prefix for consistency
-   **Non-RESTful Endpoints:** Converted to RESTful patterns
    -   `POST /test-connection` → `POST /api/sites/{id}/test-connection`
    -   `POST /publish` → `POST /api/content-queue/{id}/publish`
-   **Authentication Flow:** Improved cookie-based authentication
-   **Test Endpoints:** Updated test cases to use new API endpoints

### Fixed

-   **502 Bad Gateway:** Fixed missing JWT_SECRET and nginx configuration
-   **CI/CD Failures:** Updated test endpoints to match new API structure
-   **Dashboard Authentication:** Fixed "Login" button showing when already authenticated
-   **API Consistency:** Standardized all endpoints with proper HTTP methods

### Technical Improvements

-   **HTTP Methods:** Complete CRUD operations (GET, POST, PUT, PATCH, DELETE)
-   **Status Codes:** Proper HTTP status codes (200, 201, 400, 401, 404, 500)
-   **Resource Naming:** Consistent plural nouns and descriptive paths
-   **URL Structure:** Standardized `/api/` prefix across all endpoints
-   **Response Models:** Unified response formats and error handling

## [1.1.0] - 2025-10-17

### Added

-   **Dashboard UI:** Complete Next.js dashboard with modern UI
-   **Authentication System:** JWT-based authentication with cookie support
-   **CRUD Operations:** Full CRUD for Sites, Keywords, Content Queue
-   **Real-time Updates:** SWR for data fetching and caching
-   **Form Validation:** React Hook Form with Zod validation
-   **UI Components:** shadcn/ui component library integration
-   **Responsive Design:** Mobile-friendly dashboard

### Changed

-   **Telegram Bot:** Simplified bot with minimal commands
-   **Architecture:** Moved complex operations to web dashboard
-   **User Experience:** Improved login flow with pre-filled credentials

### Fixed

-   **Health Checks:** Improved Docker health check configurations
-   **Auto-restart:** Added restart policies for all services
-   **Network Issues:** Fixed nginx proxy configuration

## [1.0.0] - 2025-10-16

### Added

-   **Initial Release:** Core SEO automation system
-   **Backend API:** FastAPI with PostgreSQL and Redis
-   **Telegram Bot:** Full-featured bot with admin commands
-   **Content Generation:** AI-powered content creation
-   **WordPress Integration:** Automated publishing to WordPress
-   **Scheduler:** Celery-based task scheduling
-   **Database Models:** Sites, Keywords, Content Queue, Users
-   **Authentication:** JWT-based user authentication
-   **Docker Setup:** Complete containerized application

### Features

-   **Site Management:** Add and configure WordPress sites
-   **Keyword Research:** Track and manage SEO keywords
-   **Content Queue:** Approve and publish content
-   **Admin Commands:** Telegram bot administration
-   **Automated Publishing:** Scheduled content publishing
-   **Health Monitoring:** System health checks

---

## Version Format

This project uses [Semantic Versioning](https://semver.org/):

-   **MAJOR:** Incompatible API changes
-   **MINOR:** New functionality in a backwards compatible manner
-   **PATCH:** Backwards compatible bug fixes

## Release Notes

### v1.2.0 - RESTful API Excellence

This release focuses on achieving perfect RESTful API compliance and improving developer experience. The API now follows REST principles with proper HTTP methods, status codes, and resource naming. The dashboard has been enhanced with pre-filled login credentials for easier testing.

### v1.1.0 - Modern Dashboard

This release introduces a complete web dashboard built with Next.js, providing a modern interface for managing the SEO automation system. The Telegram bot has been simplified to focus on essential operations while complex management tasks are handled through the web interface.

### v1.0.0 - Foundation

The initial release establishes the core functionality of the SEO automation system, including content generation, keyword research, WordPress integration, and Telegram bot management.
