# My E‑Store

This project combines a Django backend and a Next.js frontend. The steps below
explain how to set up and run both parts locally after cloning the repository
from GitHub.

## Prerequisites
- Python 3.10+
- Node.js 18+
- npm

## Quick start

The repository includes a helper script `setup_local.sh` that automates the
most common steps. After cloning the repo simply run:

```bash
./setup_local.sh
```

The script creates a Python virtual environment, installs backend dependencies,
sets up the example environment files, runs migrations and installs the frontend
packages. Afterwards you can start the backend and frontend servers manually as
shown below.

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

## Deployment

### Backend on PythonAnywhere
1. Create an account on [PythonAnywhere](https://www.pythonanywhere.com/) and add a new **Manual configuration** web app using the same Python version as your local environment.
2. Clone this repository on your PythonAnywhere account:
   ```bash
   git clone <REPOSITORY_URL> ~/my_estore
   cd ~/my_estore
   ```
3. Create a virtual environment and install the dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
4. Copy `backend/.env.example` to `backend/.env` and adjust values such as `SECRET_KEY`.
5. Run the database migrations and collect static files:
   ```bash
   cd backend
   python manage.py migrate
   python manage.py collectstatic
   ```
6. In the **Web** tab set:
   - **Working directory:** `/home/<username>/my_estore/backend`
   - **WSGI file:** `/home/<username>/my_estore/backend/backend/wsgi.py`
   - Map `/static/` to `/home/<username>/my_estore/backend/staticfiles`
   - Map `/media/` to `/home/<username>/my_estore/backend/media`
7. Reload the web app. Your API will be served from `https://<username>.pythonanywhere.com/`.

### Frontend on Netlify
1. On Netlify, create a new site from Git and choose this repository.
2. Set the **Base directory** to `frontend`.
3. Use `npm run build` as the build command and `.next` as the publish directory.
4. Define the environment variable `NEXT_PUBLIC_API_BASE_URL` with the full URL of your PythonAnywhere backend, for example:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://<username>.pythonanywhere.com/api
   ```
   If you use Next.js image optimization also set `NEXT_PUBLIC_BACKEND_HOST=<username>.pythonanywhere.com`.
5. Deploy the site. Netlify will build the frontend and host it at your chosen domain.
