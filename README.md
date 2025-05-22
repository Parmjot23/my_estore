# MadeByParm.com

This repo contains a simple full‑stack portfolio.

Directory structure:
- `portfolio_backend/` – Django REST Framework project with `portfolio` app
- `portfolio_frontend/` – React + Vite frontend
- `backend/` – legacy e‑store project (kept for reference)

## Local Development

### Backend
1. Install Python 3.10+
2. Install dependencies:
   ```bash
   pip install -r portfolio_backend/requirements.txt
   ```
3. Run migrations and start the server:
   ```bash
   cd portfolio_backend
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```
   The API will be available at `http://localhost:8000/api/`.

### Frontend
1. Install Node.js 18+
2. Install dependencies:
   ```bash
   cd portfolio_frontend
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev -- --host
   ```
   Access the site at `http://localhost:5173`.

### Docker Compose
Alternatively you can run both services with Docker Compose:
```bash
docker-compose up --build
```

### API Endpoints
- `GET /api/projects/` – list projects
- `POST /api/contact/` – submit the contact form

Use the Django admin at `/admin/` to manage content.
