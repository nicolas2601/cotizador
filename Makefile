.PHONY: dev stop migrate seed test lint frontend backend celery

# --- Desarrollo local (sin Docker) ---
dev:
	@echo "Iniciando backend y frontend..."
	@make backend &
	@make frontend

backend:
	cd backend && uv run python manage.py runserver

frontend:
	cd frontend && bun dev

celery:
	cd backend && uv run celery -A config worker -l info

# --- Docker ---
docker-up:
	docker compose up --build

docker-down:
	docker compose down

# --- Base de datos ---
migrate:
	cd backend && uv run python manage.py migrate

makemigrations:
	cd backend && uv run python manage.py makemigrations

seed:
	cd backend && uv run python manage.py shell < scripts/seed_tikno.py

createsuperuser:
	cd backend && uv run python manage.py createsuperuser

# --- Tests ---
test:
	cd backend && uv run pytest -v --reuse-db

test-accounts:
	cd backend && uv run pytest apps/accounts/ -v --reuse-db

test-cotizadores:
	cd backend && uv run pytest apps/cotizadores/ -v --reuse-db

test-cotizaciones:
	cd backend && uv run pytest apps/cotizaciones/ -v --reuse-db

# --- Calidad ---
lint:
	cd backend && uv run ruff check . && uv run ruff format --check .

format:
	cd backend && uv run ruff format .

# --- Utilidades ---
check:
	cd backend && uv run python manage.py check

shell:
	cd backend && uv run python manage.py shell

build-frontend:
	cd frontend && bun run build
