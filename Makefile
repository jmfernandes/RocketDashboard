# PHONY targets (not actual files)
.PHONY: help setup runserver stopserver

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

runserver: ## Start Django development server on default port (8000)
	python3 manage.py runserver

stopserver: ## Stop all running Django development servers
	@pkill -f "manage.py runserver" || echo "No Django server running"
