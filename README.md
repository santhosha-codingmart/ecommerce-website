# 🛒 E-Commerce Application

A full-stack e-commerce web application built with **Spring Boot**, **React**, **MySQL**, and **Elasticsearch** — fully containerised with Docker Compose.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Nginx |
| **Backend** | Spring Boot 3.4, Java 17 |
| **Database** | MySQL 8.0 |
| **Search** | Elasticsearch 8.11 |
| **Auth** | JWT (JJWT 0.11.5) + Spring Security |
| **ORM** | Spring Data JPA / Hibernate |
| **Container** | Docker & Docker Compose |

---

## 📁 Project Structure

```
ecommerce/
├── src/main/java/com/codingmart/ecommerce/
│   ├── controller/        # REST API controllers
│   ├── entity/            # JPA entities (User, Product, Category)
│   ├── dto/               # Request & Response DTOs
│   ├── repository/        # Spring Data JPA + Elasticsearch repositories
│   ├── service/           # Business logic layer
│   ├── security/          # JWT filter, JwtUtil, SecurityConfig
│   ├── document/          # Elasticsearch document models
│   └── exception/         # Global exception handling
├── frontend/              # React app (built & served via Nginx)
├── docker-compose.yml     # Orchestrates all 4 services
├── Dockerfile             # Spring Boot image
├── .env.example           # ← Copy this to .env before running
└── ecommerce_backup.sql   # Initial database seed data
```

---

## ⚡ Quick Start (Docker — Recommended)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.20

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/ecommerce.git
cd ecommerce
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your own values:

```env
MYSQL_ROOT_PASSWORD=your_strong_password
MYSQL_DATABASE=ecommerce_db
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_strong_password
JWT_SECRET=a_very_long_random_secret_string_at_least_256_bits
```

> ⚠️ **Never commit `.env` to Git.** It is already listed in `.gitignore`.

### 3. Start all services

```bash
docker compose up -d
```

Docker Compose will start four containers in the correct order:

| Container | Port | Description |
|---|---|---|
| `ecommerce-db` | `3306` | MySQL database (pre-seeded) |
| `ecommerce-es` | `9200` | Elasticsearch |
| `ecommerce-backend` | `8080` | Spring Boot REST API |
| `ecommerce-frontend` | `80` | React app served via Nginx |

### 4. Open the app

```
http://localhost
```

The backend API is available at:

```
http://localhost:8080/api
```

### 5. Stop all services

```bash
docker compose down
```

> Data is persisted in named Docker volumes (`mysql_data`, `es_data`). To wipe all data add the `-v` flag: `docker compose down -v`.

---

## 🔌 API Reference

All endpoints are prefixed with `/api`.

### 🔐 Authentication — `/api/auth`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | ❌ | Register a new user |
| `POST` | `/api/auth/signin` | ❌ | Sign in and receive a JWT |

**Signup request body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "confirmPassword": "secret123"
}
```

**Signin request body:**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Signin response:**
```json
{
  "token": "<JWT>",
  "message": "Login successful!",
  "userId": 1
}
```

> For protected endpoints, include the token as a Bearer header:
> `Authorization: Bearer <JWT>`

---

### 📦 Products — `/api/products`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/products?page=0&size=8` | ❌ | Paginated list of all products |
| `GET` | `/api/products/{id}` | ❌ | Single product by ID |
| `GET` | `/api/products/category/{categoryId}?page=0&size=10` | ❌ | Products by category |
| `GET` | `/api/products/search?q=phone&page=0&size=10` | ❌ | Fuzzy search via Elasticsearch |
| `GET` | `/api/products/filter?min=100&max=500&page=0&size=10` | ❌ | Filter by price range |
| `POST` | `/api/products/sync` | ✅ | Sync MySQL → Elasticsearch |

---

### 🗂️ Categories — `/api/categories`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/categories?page=0&size=5` | ❌ | Paginated list of categories |
| `GET` | `/api/categories/{id}` | ❌ | Single category by ID |
| `POST` | `/api/categories` | ✅ | Create a new category |
| `PUT` | `/api/categories/{id}` | ✅ | Update a category |
| `DELETE` | `/api/categories/{id}` | ✅ | Delete a category |

---

## 🏗️ Local Development (Without Docker)

### Prerequisites
- Java 17
- Maven 3.9+
- MySQL 8.0 running locally
- Elasticsearch 8.11 running locally (`http://localhost:9200`)
- Node.js 18+ and npm (for the frontend)

### Backend

```bash
# Set environment variables (or use the fallback defaults in application.properties)
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=your_password
export JWT_SECRET=your_jwt_secret

./mvnw spring-boot:run
```

The API will start at `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server will start at `http://localhost:5173`.

---

## 🔒 Security

- Passwords are hashed with **BCrypt** before storage.
- JWT tokens are signed with **HMAC-SHA256**.
- All secrets are stored in a **`.env` file** (excluded from Git).
- Public endpoints (product browsing, auth) are accessible without a token.
- Write operations (category management, ES sync) require a valid JWT.

---

## 🌊 Data Flow

```
User Browser
    │
    ▼
React (Nginx :80)
    │  /api/*  (proxied)
    ▼
Spring Boot (:8080)
    ├──► MySQL (:3306)         — persistent product/user/category data
    └──► Elasticsearch (:9200) — fast fuzzy search index
```

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `StrongPass@123` |
| `MYSQL_DATABASE` | Database name | `ecommerce_db` |
| `SPRING_DATASOURCE_USERNAME` | DB username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `StrongPass@123` |
| `JWT_SECRET` | Secret for signing JWTs | `64-char-random-string` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is for evaluation purposes. All rights reserved.
