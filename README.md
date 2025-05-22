# MadeByParm.com Backend

This repository now includes a minimal Django REST Framework backend for the portfolio site **MadeByParm.com**.

Directory structure:
- `portfolio_backend/` – Django project and `portfolio` app
- `frontend/` – placeholder for the React frontend (not included in this phase)
- `backend/` – legacy e‑store project (kept for reference)

## Getting Started
1. Install Python 3.10+ and dependencies:
   ```bash
   pip install -r portfolio_backend/requirements.txt
   ```
2. Run migrations and start the dev server:
   ```bash
   cd portfolio_backend
   python manage.py migrate
   python manage.py runserver
   ```
   The API will be available at `http://127.0.0.1:8000/api/`.

### API Endpoints
- `GET /api/projects/` – list projects
- `POST /api/contact/` – submit the contact form

Use the Django admin at `/admin/` to manage content.
