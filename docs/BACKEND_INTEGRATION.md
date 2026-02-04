# Integrating capstone-be with capstone-Fe-Therapy-app

This guide explains how to run the backend (capstone-be) and frontend (capstone-Fe-Therapy-app) together so the app uses the real API for auth (register/login).

## 1. Backend (capstone-be)

### Prerequisites

- Node.js
- MongoDB running locally or a connection string

### Setup

```bash
cd capstone-be
npm install
```

Create a `.env` file in `capstone-be/` (copy from below or your own):

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/your-db-name
JWT_SECRET=your-secret-at-least-32-chars-long
SALT=10
```

### Run

```bash
npm start
```

The server will listen on **http://localhost:8000** (or the `PORT` you set). You should see: `Server is running on port 8000`.

- **Register:** `POST /api/users` — body: `{ "username", "password" }`
- **Login:** `POST /api/auth/login` — body: `{ "username", "password" }` → returns JWT and user

The backend has CORS enabled so the Expo app can call it from the simulator or a device.

---

## 2. Frontend (capstone-Fe-Therapy-app)

### Environment

Create a `.env` or `.env.local` in the **frontend** project root:

```env
# Backend URL (no trailing slash). Omit to use default http://localhost:8000
EXPO_PUBLIC_API_URL=http://localhost:8000

# Set to "true" to use mock auth only (no network calls)
# EXPO_PUBLIC_USE_MOCK_AUTH=false
```

**URL by environment:**

| Where you run the app | EXPO_PUBLIC_API_URL |
|------------------------|----------------------|
| iOS Simulator          | `http://localhost:8000` |
| Android Emulator       | `http://10.0.2.2:8000`  |
| Physical device       | `http://YOUR_COMPUTER_IP:8000` (same Wi‑Fi as the machine running the backend) |

After changing `.env`, restart the Expo dev server (and rebuild if needed).

### Run

```bash
cd capstone-Fe-Therapy-app
npm install
npx expo start
```

With the backend running and `EXPO_PUBLIC_API_URL` pointing to it (and **without** `EXPO_PUBLIC_USE_MOCK_AUTH=true`), the app will:

- **Register:** call `POST /api/users`, then log in to get a JWT and store it.
- **Login:** call `POST /api/auth/login` and store the returned JWT and user.

The stored token is sent as `Authorization: Bearer <token>` on subsequent API requests.

---

## 3. Quick checklist

1. MongoDB is running (if your backend uses a local DB).
2. `capstone-be` has a `.env` with `PORT`, `MONGODB_URI`, `JWT_SECRET`, `SALT`.
3. Backend is running: `cd capstone-be && npm start`.
4. Frontend has `.env` with `EXPO_PUBLIC_API_URL` set to the backend URL (or rely on default `http://localhost:8000` for simulator).
5. Do **not** set `EXPO_PUBLIC_USE_MOCK_AUTH=true` if you want to use the real backend.
6. Restart Expo after changing `.env`.

---

## 4. Troubleshooting

- **Network / connection errors:** Ensure the backend is running and the URL in `EXPO_PUBLIC_API_URL` is correct. For a physical device, use your computer’s LAN IP and ensure the device is on the same network.
- **401 after login/register:** Backend should return a JWT on login; register flow in the app automatically logs in after signup to get that JWT. If 401 persists, check `JWT_SECRET` and that the backend actually returns a token.
- **CORS errors:** The backend enables CORS in `app.ts`. If you still see CORS issues, confirm the request origin matches what the backend allows.
