# PHONY targets (not actual files)
.PHONY: help setup runserver stopserver satellite test-pytest test-react test-e2e coverage dev-up dev-down superuser

# Default target when just running 'make'
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Install all dependencies, apply migrations, and seed the database
	pip3 install -r requirements.txt
	npm install
	python3 manage.py makemigrations
	python3 manage.py migrate
	python3 manage.py setup_db

runserver: ## Start Django (port 8000) and Vite (port 5173) in the background
	nohup python3 manage.py runserver --insecure > /dev/null 2>&1 &
	nohup npx vite > /dev/null 2>&1 &
	@echo "Django started at http://localhost:8000"
	@echo "Vite started at http://localhost:5173"

stopserver: ## Stop Django and Vite dev servers
	@pkill -f "manage.py runserver" || echo "No Django server running"
	@pkill -f "vite" || echo "No Vite server running"

satellite: ## Query raw API. Command is `make satellite ID=5`
	@curl -s "http://localhost:8000/api/telemetry/?satellite_id=SAT-$$(printf '%03d' $(ID))" | python3 -m json.tool

test-pytest: ## Run Django backend tests
	python3 -m pytest -v

test-react: ## Run React frontend tests
	npx vitest --run

test-e2e: ## Run Playwright end-to-end tests (starts Django automatically)
	@pkill -f "manage.py runserver" || true
	nohup python3 manage.py runserver --insecure > /dev/null 2>&1 &
	@sleep 2
	npx playwright test; EXIT_CODE=$$?; pkill -f "manage.py runserver" || true; exit $$EXIT_CODE

coverage: ## Run python tests with coverage report (fails if under 80%)
	python3 -m pytest --cov --cov-report=term-missing --cov-report=html

dev-up: ## Build and run the app in Docker
	docker-compose up --build -d

dev-down: ## Bring the container down
	docker-compose down

superuser: ## Create a Django superuser inside the running Docker container
	docker-compose exec web python manage.py createsuperuser
