# 🔗 ShortURL

A URL shortener with click tracking, built with **Node.js**, **TypeScript**, **MongoDB**, and **Redis**.

[![CI](https://github.com/your-username/shorturl/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/shorturl/actions/workflows/ci.yml)

---

## ✨ Features

- **URL shortening** — generates unique 6-character codes via [nanoid](https://github.com/ai/nanoid)
- **Fast redirects** — Redis cache with a 10-minute TTL for high performance
- **Click tracking** — atomic counter incremented on every access
- **Input validation** — middleware using [Zod](https://zod.dev) rejects malformed URLs before they reach the controller
- **Complete REST API** — CRUD operations with standardized JSON responses
- **Frontend included** — web interface served as static files by the same server
- **Containerized** — start everything with a single `docker compose up`

---

## 🛠 Technologies

| Layer            | Technology                |
| ---------------- | ------------------------- |
| Runtime          | Node.js 20 + TypeScript 5 |
| Framework        | Express 4                 |
| Database         | MongoDB 7 (Mongoose 8)    |
| Cache            | Redis 7                   |
| Validation       | Zod 3                     |
| Code generation  | nanoid 3                  |
| Containerization | Docker + Docker Compose   |
| CI               | GitHub Actions            |

---

## 📐 Architecture

```text
src/
├── server.ts          # Entry point — initializes Express, MongoDB, and Redis
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

```text
GET /:code
    │
    ├─ Redis HIT  →  redirect 302  (async: increments clicks in MongoDB)
    │
    └─ Redis MISS →  MongoDB findOneAndUpdate ($inc clicks)
                          │
                          ├─ Not found → 404
                          └─ Found → cache in Redis → redirect 302
```

---

## 🚀 Getting Started

### With Docker (recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/shorturl.git
cd shorturl

# Copy the environment variables file
cp .env.example .env

# Start all services (API + MongoDB + Redis)
docker compose up
```

The application will be available at `http://localhost:3000`.

> **Attention:** if you have MongoDB installed locally on your machine, it may already be using port 27017 and prevent Docker from mapping the port correctly. In that case, stop the local service before starting the compose:
>
> ```powershell
> # Windows (PowerShell as Administrator)
> Stop-Service -Name MongoDB
> ```
>
> ```bash
> # Linux/macOS
> sudo systemctl stop mongod
> ```

---

### Locally (without Docker)

**Prerequisites:** Node.js 20+, MongoDB, and Redis running locally.

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your local MongoDB and Redis URLs

# Start in development mode (hot reload)
npm run dev
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable    | Description                               | Default                              |
| ----------- | ----------------------------------------- | ------------------------------------ |
| `PORT`      | Server port                               | `3000`                               |
| `MONGO_URL` | MongoDB connection URI                    | `mongodb://localhost:27017/shorturl` |
| `REDIS_URL` | Redis connection URI                      | `redis://localhost:6379`             |
| `BASE_URL`  | Base URL used to build the shortened link | `http://localhost:3000`              |

---

## 🔍 Inspecting the data (MongoDB Compass)

The `docker-compose.yml` exposes the MongoDB port so external tools such as [MongoDB Compass](https://www.mongodb.com/products/compass) can connect:

1. Open MongoDB Compass
2. Connect using the string: `mongodb://localhost:27017`
3. Navigate to the **shorturl** database → **urls** collection

Each document has the following structure:

```json
{
  "_id": { "$oid": "..." },
  "originalUrl": "https://example.com/very-long-url",
  "code": "aB3xYz",
  "clicks": 3,
  "createdAt": { "$date": "2026-05-15T17:44:11.229Z" },
  "updatedAt": { "$date": "2026-05-15T17:44:13.046Z" },
  "__v": 0
}
```

> **Attention:** if Compass shows the collection as empty even after creating links, check whether there is a local MongoDB instance running on port 27017 and conflicting with Docker (see the troubleshooting section below).

---

## 📡 API Endpoints

### `POST /api/urls`

Creates a new shortened link.

**Body:**

```json
{ "url": "https://example.com/my-long-url" }
```

**Response `201`:**

```json
{
  "id": "664f...",
  "originalUrl": "https://example.com/my-long-url",
  "shortUrl": "http://localhost:3000/aB3xYz",
  "code": "aB3xYz",
  "clicks": 0,
  "createdAt": "2024-05-14T20:00:00.000Z"
}
```

---

### `GET /api/urls`

Lists all created URLs, sorted from newest to oldest.

**Response `200`:**

```json
{
  "urls": [ ...URL objects... ],
  "total": 42
}
```

---

### `GET /api/urls/:code`

Returns data for a specific URL by its code (without redirecting).

**Response `200`:** full URL object including `updatedAt`.

---

### `DELETE /api/urls/:code`

Removes the URL from the database and invalidates the Redis cache.

**Response `200`:**

```json
{ "ok": true, "message": "URL \"aB3xYz\" removed" }
```

---

### `GET /:code`

Redirects to the original URL (`302`). Increments the click counter.

---

## 🧪 Available Scripts

```bash
npm run dev        # Starts with hot reload (tsx watch)
npm run build      # Compiles TypeScript to dist/
npm start          # Runs the production build
npm run typecheck  # Checks types without emitting files
npm run lint       # Lint with ESLint
```

---

## 🔄 CI/CD

The CI pipeline runs automatically on every push and pull request to the `main` branch via **GitHub Actions**:

1. Installs dependencies
2. Checks types with TypeScript (`tsc --noEmit`)
3. Builds the project (`tsc`)

---

## 🐛 Troubleshooting

### MongoDB Compass shows an empty collection

You probably have a local MongoDB instance installed and occupying port 27017. Compass connects to it instead of the Docker container. To fix it:

```powershell
# Windows (PowerShell as Administrator)
Stop-Service -Name MongoDB

# To permanently disable automatic startup:
Set-Service -Name MongoDB -StartupType Disabled
```

Then start the compose again:

```bash
docker compose down
docker compose up
```

---

## 📄 License

This project was developed for educational and portfolio purposes.
