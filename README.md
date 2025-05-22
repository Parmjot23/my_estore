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
