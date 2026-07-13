<div align="center">
  <h1>📦 UpStock</h1>
  <p><strong>Smart inventory management system with web & mobile access, multi-user support, real-time dashboards and more.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=java&logoColor=white" alt="Java 21">
    <img src="https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Boot 4">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
    <img src="https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL 16">
    <br>
    <img src="https://img.shields.io/badge/Flyway-CC0000?style=for-the-badge&logo=flyway&logoColor=white" alt="Flyway">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" alt="Railway">
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
  </p>
</div>

---

## 📋 About

**UpStock** is an inventory management system designed to replace spreadsheets and manual processes. With JWT authentication, real-time updates via SSE, server-side filters, and exportable reports, it provides complete control over products, movements, and users.

---

## ✨ Features

- **Dashboard** — Overview with daily indicators, total inventory value, and capacity usage
- **Products** — CRUD, search with server-side filters, quantity and price control
- **Movements** — In/out logging with full history and automatic stock updates
- **Reports** — Summary cards, inventory table, and CSV export
- **Users** — Full CRUD with roles (admin/user), profile and store editing
- **Authentication** — Secure JWT login (24h access token + 7-day refresh token), rate limiting
- **Real-time** — SSE notifications without page reload
- **Pagination** — All listable endpoints return pages of 100 items

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (Frontend)                        │
│  React 19 + Vite + Tailwind CSS + Axios + React Router       │
│                                                              │
│  /api/(.*)  ───── reverse proxy ────►  Railway (Backend)     │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    Railway (Backend)                          │
│  Spring Boot 4.0 + Spring Security + Spring Data JPA          │
│  Flyway + PostgreSQL 16 + Swagger/OpenAPI                     │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Products  │  │Movement s│  │  Users   │  │   Reports    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       └──────────────┴─────────────┴────────────────┘         │
│                           │                                   │
│                    ┌──────┴──────┐                            │
│                    │ PostgreSQL  │                            │
│                    │   (Neon)    │                            │
│                    └─────────────┘                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Runtime |
| Spring Boot | 4.0.6 | Web framework |
| Spring Security | 7.0 | Authentication/authorization |
| Spring Data JPA | — | Data access |
| PostgreSQL | 16 | Database |
| Flyway | — | Migrations |
| JWT (jjwt) | 0.13 | Access tokens |
| Lombok | — | Boilerplate reduction |
| Swagger (SpringDoc) | 3.0.3 | OpenAPI documentation |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI Library |
| Vite | 8 | Build tool |
| React Router | 7 | SPA routing |
| Axios | — | HTTP client |
| Tailwind CSS | — | Styling |

---

## 🚀 Getting Started

### Prerequisites

- JDK 21+
- Maven 3.9+
- Node.js 20+
- PostgreSQL 16

### Backend

```bash
# Clone
git clone https://github.com/Kkrloz/UpStock.git
cd UpStock

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Run migrations and start
mvn spring-boot:run -DskipTests
```

The API will be at `http://localhost:8080`.  
Swagger UI at `http://localhost:8080/swagger-ui.html`.

### Frontend

```bash
cd UpStock

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will be at `http://localhost:5173`.

### Docker

```bash
docker compose up -d
```

---

## 🔐 Environment Variables

### Backend (`.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | ✅ | — | PostgreSQL JDBC URL |
| `JWT_SECRET` | ✅ | — | JWT secret key (min 32 chars) |
| `JWT_EXPIRATION` | ❌ | `86400000` | Access token duration (ms) |
| `ADMIN_PASSWORD` | ✅ | — | Initial admin password |
| `SHOW_SQL` | ❌ | `false` | Log SQL queries |

### Frontend

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | ❌ | `/api` | API base URL (dev proxy) |

---

## 🌐 Deployment

### Backend — Railway

The backend auto-deploys to [Railway](https://railway.app) from the `master` branch. `railway.json` defines:

```json
{
  "build": { "buildCommand": "mvn clean package -DskipTests" },
  "deploy": { "startCommand": "java -jar target/upstock-0.0.1-SNAPSHOT.jar" }
}
```

**Required Railway variables:**

- `SPRING_DATASOURCE_URL` — PostgreSQL database URL (Neon)
- `JWT_SECRET` — JWT secret key
- `ADMIN_PASSWORD` — Admin password

### Frontend — Vercel

The frontend auto-deploys to [Vercel](https://vercel.com) from the `master` branch. `vercel.json` proxies `/api/*` requests to Railway.

---

## 📖 API Documentation

With the backend running, access:

- **Swagger UI:** `/swagger-ui.html`
- **OpenAPI JSON:** `/v3/api-docs`

### Main Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/products` | List products (paginated) |
| POST | `/api/products` | Create product |
| GET | `/api/movements` | List movements (paginated) |
| GET | `/api/users` | List users (paginated) |
| GET | `/api/reports/summary` | Report summary |
| GET | `/api/reports/inventory` | Inventory CSV |

---

## 👥 User Roles

| Role | Access |
|---|---|
| `ADMIN` | Full CRUD for products, movements, users and reports |
| `USER` | Product and movement CRUD for own store only |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made by <a href="https://github.com/Kkrloz">Kkrloz</a> and <a href="https://github.com/lMario09">lMario09</a>
</p>
