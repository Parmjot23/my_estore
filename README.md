# Local Network Development

This project contains a Django backend and a Next.js frontend.

## Backend
1. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Run the development server so it is reachable from other devices:
   ```bash
   python backend/manage.py runserver 0.0.0.0:8000
   ```
The server will listen on port `8000` on all network interfaces.

Create a `backend/.env` file to store sensitive settings. Example:

```bash
SECRET_KEY=changeme
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=webmaster@example.com
```

The `.env` file is already listed in `.gitignore` so it won't be committed.

## Frontend
1. Install dependencies:
   ```bash
   cd frontend && npm install
   ```
2. Ensure the frontend can reach the backend when accessed from another device.
   Create a `frontend/.env.local` file and set the backend URL using your computer's IP address:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://<YOUR_IP>:8000/api
   ```
3. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
   This runs `next dev -H 0.0.0.0 -p 3000`, so the frontend is available on port `3000` from other devices on the network.

Both the frontend and backend will now be accessible from devices connected to the same network (for example, via a phone hotspot).
