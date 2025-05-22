# TruckZone Development

This repository contains a minimal e-commerce stack for **TruckZone**, a semi-truck parts store. The backend is powered by Django and Django REST Framework while the frontend uses Next.js with TypeScript and TailwindCSS.

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

Key API endpoints:
* `/api/shop/products/` – list products and view details
* `/api/orders/` – submit a new order
* `/api/contact/messages/` – send a message to TruckZone

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

### Publishing to GitHub

To push this project to your GitHub repository at
`https://github.com/Parmjot23/truck-zone`, create the repo on GitHub and then
run the following commands from the project root:

```bash
git remote add origin git@github.com:Parmjot23/truck-zone.git
git push -u origin work
```
