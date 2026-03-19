# Amazon Clone (Full Stack, React Native + Node.js)

This repository contains:

- `server/`: Node.js + Express API with JWT auth, product catalog, cart, and orders.
- `mobile/`: React Native (Expo) app built for mobile use.

## Features

- User registration and login
- Product listing and product details
- Add to cart / update cart / remove from cart
- Checkout and order history
- Profile and logout

## 1) Backend Setup

```bash
cd server
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

Health check:

- `GET http://localhost:5000/api/health`

## 2) Mobile App Setup

```bash
cd mobile
npm install
```

Set API URL (PowerShell example):

```powershell
$env:EXPO_PUBLIC_API_URL="http://YOUR_MACHINE_IP:5000/api"
```

Then run:

```bash
npx expo start
```

Notes:

- Android emulator can usually use `http://10.0.2.2:5000/api`.
- Physical device must use your computer LAN IP.

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/search?q=...`
- `GET /api/cart` (auth)
- `POST /api/cart/items` (auth)
- `PATCH /api/cart/items/:productId` (auth)
- `DELETE /api/cart/items/:productId` (auth)
- `POST /api/orders/checkout` (auth)
- `GET /api/orders` (auth)

