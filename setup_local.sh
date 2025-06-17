#!/usr/bin/env bash
# Simple helper script to set up and start the development environment.
set -e

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  python -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Copy backend environment file if missing
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
fi

# Run migrations
python backend/manage.py migrate

# Install frontend dependencies
pushd frontend >/dev/null
npm install
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
fi
popd >/dev/null

echo "Setup complete. To start the servers run:\n"
echo "  source venv/bin/activate && python backend/manage.py runserver 0.0.0.0:8000"
echo "  cd frontend && npm run dev"
