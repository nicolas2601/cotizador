# Cotizador - Quotation Management Platform

Full-stack application for creating, managing and tracking business quotations with PDF generation, AI-assisted pricing and real-time collaboration.

## Features

- **Quotation CRUD** - Create, edit, duplicate and manage quotations with line items
- **PDF Generation** - Professional PDF export with WeasyPrint and React PDF
- **AI-Assisted Pricing** - Intelligent pricing suggestions based on historical data
- **Authentication** - JWT-based auth with role management
- **Background Tasks** - Celery + Redis for async PDF generation and notifications

## Tech Stack

**Backend:** Python 3.12+ / Django 6.0 / Django REST Framework / PostgreSQL / Redis / Celery / JWT Auth

**Frontend:** Next.js 15 / React 19 / TypeScript / TanStack React Query / Tailwind CSS + shadcn/ui / Zustand

**Infrastructure:** Docker + Docker Compose / Gunicorn + WhiteNoise

## Project Structure

```
cotizador/
├── backend/
│   ├── apps/
│   │   ├── accounts/       # User management & auth
│   │   ├── cotizaciones/   # Quotation models & API
│   │   ├── cotizadores/    # Quotation creator profiles
│   │   ├── ia/             # AI pricing module
│   │   └── common/         # Shared utilities
│   ├── config/             # Django settings
│   └── Dockerfile
├── frontend/
│   ├── app/                # Next.js app router
│   ├── components/         # React components
│   └── Dockerfile
├── docker-compose.yml
└── docker-compose.dev.yml
```

## Quick Start

```bash
# Development with Docker
docker-compose -f docker-compose.dev.yml up

# Or manually
cd backend && pip install -e . && python manage.py runserver
cd frontend && bun install && bun dev
```

## License

MIT
