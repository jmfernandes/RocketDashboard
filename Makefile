# PHONY targets (not actual files)
.PHONY: help setup runserver stopserver satellite test coverage

# Default target when just running 'make'
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Install dependencies, apply migrations, and seed the database
	pip3 install -r requirements.txt
	python3 manage.py makemigrations
	python3 manage.py migrate
	python3 manage.py setup_db

runserver: ## Start Django development server in the background on port 8000
	nohup python3 manage.py runserver --insecure > /dev/null 2>&1 &
	@echo "Server started at http://localhost:8000"

stopserver: ## Stop all running Django development servers
	@pkill -f "manage.py runserver" || echo "No Django server running"

satellite: ## Query raw API. Command is `make satellite ID=5`
	@curl -s "http://localhost:8000/api/telemetry/?satellite_id=SAT-$$(printf '%03d' $(ID))" | python3 -m json.tool

test: ## Run all tests
	python3 -m pytest -v

coverage: ## Run tests with coverage report (fails if under 80%)
	python3 -m pytest --cov --cov-report=term-missing --cov-report=html
