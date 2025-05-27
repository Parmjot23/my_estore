# My E‑Store

This project combines a Django backend and a Next.js frontend. The steps below
explain how to set up and run both parts locally after cloning the repository
from GitHub.

## Prerequisites
- Python 3.10+
- Node.js 18+
- npm

## Quick start

### 1. Clone the repository
```bash
git clone <REPOSITORY_URL>
cd my_estore
```

### 2. Backend setup
Create and activate a virtual environment and install the Python dependencies:
```bash
python -m venv venv
source venv/bin/activate      # On Windows use "venv\\Scripts\\activate"
pip install -r requirements.txt
```

Copy the example environment file and adjust values as needed:
```bash
cp backend/.env.example backend/.env
```
Run migrations and start the development server:
```bash
python backend/manage.py migrate
python backend/manage.py runserver 0.0.0.0:8000
```
The API will be available at `http://localhost:8000/`.

### 3. Frontend setup
Install Node dependencies and start the Next.js dev server:
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
This runs `next dev` on port `3000`. The frontend will be reachable at
`http://localhost:3000/`.

### 4. Access from other devices
If you need to access the servers from other devices on the same network,
update `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local` with your computer's
IP address and ensure the backend is started with `0.0.0.0:8000` as shown above.

With both servers running you can explore the e‑commerce site locally.
