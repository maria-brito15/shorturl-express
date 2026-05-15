# 🔗 ShortURL

A URL shortener with click tracking, built with **Node.js**, **TypeScript**, **MongoDB**, and **Redis**.

[![CI](https://github.com/your-username/shorturl/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/shorturl/actions/workflows/ci.yml)

---

## ✨ Features

- **URL shortening** — generates unique 6-character codes via [nanoid](https://github.com/ai/nanoid)
- **Fast redirects** — Redis cache with a 10-minute TTL for high throughput
- **Click tracking** — atomic counter incremented on every redirect
- **Input validation** — [Zod](https://zod.dev) middleware rejects malformed URLs before they reach the controller
- **Full REST API** — CRUD operations with standardized JSON responses
- **Bundled frontend** — web interface served as static files by the same server
- **Containerized** — spin up everything with a single `docker compose up`

---

## 🛠 Tech Stack

| Layer            | Technology                |
| ---------------- | ------------------------- |
| Runtime          | Node.js 20 + TypeScript 5 |
| Framework        | Express 4                 |
| Database         | MongoDB 7 (Mongoose 8)    |
| Cache            | Redis 7                   |
| Code generation  | nanoid 3                  |
| Validation       | Zod                       |
| Containerization | Docker + Docker Compose   |
| CI               | GitHub Actions            |

---

## 📐 Architecture

```
src/
├── server.ts          # Entry point — bootstraps Express, MongoDB, and Redis
├── db.ts              # MongoDB connection
├── routes/
│   └── urlRoutes.ts   # API route definitions
├── controllers/
│   └── urlController.ts  # Business logic (create, redirect, list, delete)
├── middleware/
│   └── validateUrl.ts    # Request body validation with Zod
├── models/
│   └── Url.ts            # Mongoose schema (originalUrl, code, clicks)
└── lib/
    └── redis.ts          # Redis client with get/set/del helpers
```

**Redirect flow:**

```
GET /:code
    │
    ├─ Redis HIT  →  302 redirect  (async: increments clicks in MongoDB)
    │
    └─ Redis MISS →  MongoDB findOneAndUpdate ($inc clicks)
                          │
                          ├─ Not found → 404
                          └─ Found → cache in Redis → 302 redirect
```

---

## 🚀 Getting Started

### With Docker (recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/shorturl.git
cd shorturl

# Copy the environment file
cp .env.example .env

# Start all services (API + MongoDB + Redis)
docker compose up
```

The API will be available at `http://localhost:3000`.

---

### Locally (without Docker)

**Prerequisites:** Node.js 20+, MongoDB, and Redis running locally.

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your local MongoDB and Redis URIs

# Start in development mode (hot reload)
npm run dev
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable    | Description                           | Default                              |
| ----------- | ------------------------------------- | ------------------------------------ |
| `PORT`      | Server port                           | `3000`                               |
| `MONGO_URL` | MongoDB connection URI                | `mongodb://localhost:27017/shorturl` |
| `REDIS_URL` | Redis connection URI                  | `redis://localhost:6379`             |
| `BASE_URL`  | Base URL used to build the short link | `http://localhost:3000`              |

---

## 📡 API Reference

### `POST /api/urls`

Creates a new short link.

**Body:**

```json
{ "url": "https://example.com/my-very-long-url" }
```

**Response `201`:**

```json
{
  "id": "664f...",
  "originalUrl": "https://example.com/my-very-long-url",
  "shortUrl": "http://localhost:3000/aB3xYz",
  "code": "aB3xYz",
  "clicks": 0,
  "createdAt": "2024-05-14T20:00:00.000Z"
}
```

---

### `GET /api/urls`

Lists all created URLs, sorted newest first.

**Response `200`:**

```json
{
  "urls": [ ...URL objects... ],
  "total": 42
}
```

---

### `GET /api/urls/:code`

Returns data for a specific URL by code (without redirecting).

**Response `200`:** full URL object including `updatedAt`.

---

### `DELETE /api/urls/:code`

Removes the URL from the database and invalidates its Redis cache entry.

**Response `200`:**

```json
{ "ok": true, "message": "URL \"aB3xYz\" removed" }
```

---

### `GET /:code`

Redirects to the original URL (`302`) and increments the click counter.

---

## 🧪 Available Scripts

```bash
npm run dev        # Start with hot reload (tsx watch)
npm run build      # Compile TypeScript to dist/
npm start          # Run the production build
npm run typecheck  # Type-check without emitting files
npm run lint       # Lint with ESLint
```

---

## 🔄 CI/CD

The CI pipeline runs automatically on every push and pull request to `main` via **GitHub Actions**:

1. Install dependencies
2. Type-check with TypeScript (`tsc --noEmit`)
3. Build the project (`tsc`)

---

## 📄 License

This project was developed for educational and portfolio purposes.
