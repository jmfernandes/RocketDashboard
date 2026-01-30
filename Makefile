# PHONY targets (not actual files)
.PHONY: help runserver stopserver

# Default target when just running 'make'
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

runserver: ## Start Django development server on default port (8000)
	python3 manage.py runserver

stopserver: ## Stop all running Django development servers
	@pkill -f "manage.py runserver" || echo "No Django server running"
