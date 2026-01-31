#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate

echo "Seeding database..."
python manage.py setup_db

echo "Starting Django on :8000..."
python manage.py runserver 0.0.0.0:8000 --insecure &

echo "Starting Vite on :5173..."
npx vite --host 0.0.0.0
