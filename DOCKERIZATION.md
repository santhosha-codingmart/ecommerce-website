# 🐳 Dockerization — Complete Guide

This document explains every change made to containerize this full-stack
e-commerce application (Spring Boot + React + MySQL + Elasticsearch).

---

## 📦 What Gets Containerized?

The application has **4 services**, each running in its own container:

| Container | Image / Source | Port | Purpose |
|---|---|---|---|
| `ecommerce-db` | `mysql:8.0` | `3306` | Stores all relational data |
| `ecommerce-es` | `elasticsearch:8.11.1` | `9200` | Powers product search |
| `ecommerce-backend` | Built from `./Dockerfile` | `8080` | Spring Boot REST API |
| `ecommerce-frontend` | Built from `./frontend/Dockerfile` | `80` | React app served via Nginx |

---

## 📁 Files Created / Modified

```
ecommerce/
├── Dockerfile                  ← (UPDATED) Backend image build instructions
├── .dockerignore               ← (UPDATED) Files excluded from backend build
├── docker-compose.yml          ← (NEW) Orchestrates all 4 containers
│
├── frontend/
│   ├── Dockerfile              ← (NEW) Frontend image build instructions
│   ├── nginx.conf              ← (NEW) Nginx web server configuration
│   ├── .dockerignore           ← (NEW) Files excluded from frontend build
│   ├── vite.config.js          ← (UPDATED) Added dev proxy for /api
│   └── src/services/api.js     ← (UPDATED) Changed API base URL to relative
│
└── src/main/java/.../
    ├── ElasticsearchSyncRunner.java  ← (NEW) Auto-sync ES on startup
    ├── EcommerceApplication.java     ← (UPDATED) Cleaned up entry point
    └── security/SecurityConfig.java  ← (UPDATED) CORS + sync endpoint fixes
```

---

## 1️⃣ Backend `Dockerfile` (Updated)

**Location:** `/Dockerfile`

```dockerfile
# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B   # Download deps FIRST (Docker cache layer)
COPY src ./src
RUN mvn clean package -DskipTests  # Compile the Spring Boot jar

# Stage 2: Run
FROM eclipse-temurin:17-jre-jammy  # Slim JRE image (no JDK or Maven)
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Why 2 stages?
This is called a **multi-stage build**. The first stage uses Maven (heavy) to
build the jar. The second stage uses only a slim JRE to run it. The final image
does **not** contain Maven, the JDK, or source code — only the compiled jar.
This makes the final image much smaller and more secure.

### Why copy `pom.xml` before `src`?
Docker builds in layers. If `pom.xml` hasn't changed, Docker reuses the cached
`mvn dependency:go-offline` layer, saving minutes on every rebuild.

---

## 2️⃣ Backend `.dockerignore` (Updated)

**Location:** `/.dockerignore`

```
target/        ← Compiled class files (Docker recompiles these)
.mvn/          ← Maven wrapper internals
*.log          ← Log files
.idea/         ← IntelliJ IDE settings
.vscode/       ← VS Code settings
frontend/node_modules/  ← Huge JS dependency folder
frontend/dist/          ← Built React files
```

### Why does this matter?
When Docker builds an image it copies the entire project folder into a
"build context". Without `.dockerignore`, it would copy `node_modules/`
(often 200MB+) and `target/` unnecessarily, making builds slow. This file
tells Docker to skip them.

---

## 3️⃣ Frontend `Dockerfile` (New)

**Location:** `/frontend/Dockerfile`

```dockerfile
# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                  # Clean install (faster and deterministic)
COPY . .
RUN npm run build           # Produces /app/dist (static HTML/JS/CSS)

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine      # Tiny, fast web server
COPY --from=build /app/dist /usr/share/nginx/html  # Copy built files
COPY nginx.conf /etc/nginx/conf.d/default.conf      # Custom config
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Why Nginx instead of `npm run dev`?
`npm run dev` runs Vite's development server which is not suitable for
production — it is slow, unoptimized, and not designed for real traffic.
Nginx serves pre-built static files, which is fast, stable, and production-ready.

### Why `npm ci` instead of `npm install`?
`npm ci` (clean install) uses exactly the versions specified in
`package-lock.json`, making builds deterministic. `npm install` might
update versions silently.

---

## 4️⃣ Frontend `nginx.conf` (New)

**Location:** `/frontend/nginx.conf`

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Proxy API calls to the Spring Boot backend
    location /api/ {
        proxy_pass http://backend:8080/api/;
    }

    # React Router fallback (SPA support)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Why is the proxy needed?
In Docker, containers talk to each other using their **service name**, not
`localhost`. When the React app calls `/api/products`, Nginx intercepts it
and forwards it to `http://backend:8080/api/products` — where `backend` is
the Docker Compose service name of the Spring Boot container.

### Why the `try_files` line?
React uses client-side routing (React Router). If a user directly visits
`http://localhost/all-products`, Nginx would return a 404 because that file
doesn't exist on disk. `try_files $uri $uri/ /index.html` tells Nginx: "If
the file doesn't exist, serve `index.html` and let React Router handle it."

---

## 5️⃣ Frontend `api.js` (Updated)

**Before:**
```js
const API = axios.create({
    baseURL: 'http://localhost:8080/api',  // Hardcoded — breaks in Docker!
});
```

**After:**
```js
const API = axios.create({
    baseURL: '/api',  // Relative — works in both Docker and local dev
});
```

### Why was the change needed?
In Docker, the browser talks to **Nginx on port 80**, not directly to
Spring Boot. If `baseURL` was `http://localhost:8080`, the browser would
try to bypass Nginx and talk directly to Spring Boot — which causes CORS
errors. Using `/api` (relative URL) means all requests go through Nginx,
which proxies them to the backend correctly.

---

## 6️⃣ Frontend `vite.config.js` (Updated)

```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // During local dev
        changeOrigin: true,
      }
    }
  }
})
```

### Why was this needed?
After changing `api.js` to use `/api` (relative), calls to `/api/products`
in local development would hit the Vite dev server itself (which doesn't
know about them). The proxy tells Vite: "Forward any `/api` request to
the Spring Boot server at `localhost:8080`." This mirrors what Nginx does
in Docker.

---

## 7️⃣ `docker-compose.yml` (New)

**Location:** `/docker-compose.yml`

This is the main orchestration file. It defines all 4 services and how they
connect to each other.

```yaml
services:
  db:           # MySQL
  elasticsearch:  # Elasticsearch
  backend:      # Spring Boot (depends on db + elasticsearch being healthy)
  frontend:     # React via Nginx (depends on backend)

volumes:
  mysql_data:   # Persists MySQL data across container restarts
  es_data:      # Persists Elasticsearch index across container restarts
```

### Key Design Decisions

#### a) Healthchecks
```yaml
# MySQL healthcheck
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  interval: 10s
  retries: 10

# Elasticsearch healthcheck
healthcheck:
  test: ["CMD-SHELL", "curl -sf http://localhost:9200/_cluster/health?wait_for_status=yellow"]
  start_period: 60s   # Give ES 60s to boot before checking
  retries: 20
```

The backend uses `depends_on: condition: service_healthy` for both MySQL and
Elasticsearch. This means Docker will **wait** until both are confirmed
healthy before starting Spring Boot. Without this, the backend would crash
on startup because the database isn't ready yet.

#### b) Environment Variable Overrides
```yaml
backend:
  environment:
    SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/ecommerce_db
    SPRING_ELASTICSEARCH_URIS: http://elasticsearch:9200
```

In `application.properties`, the URLs point to `localhost`. But in Docker,
services are on a virtual network and must use **service names** (`db`,
`elasticsearch`) instead of `localhost`. These environment variables
**override** the properties file at runtime without changing the source code.

#### c) Named Volumes
```yaml
volumes:
  mysql_data:
  es_data:
```

Without volumes, every `docker compose down` would erase your database.
Named volumes persist data on your machine and are reattached when containers
restart.

---

## 8️⃣ `ElasticsearchSyncRunner.java` (New)

**Location:** `src/main/java/com/codingmart/ecommerce/ElasticsearchSyncRunner.java`

```java
@Component
public class ElasticsearchSyncRunner implements ApplicationListener<ApplicationReadyEvent> {

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        productService.syncAllProducts(); // Pull all from MySQL → push to ES
    }
}
```

### Why was this needed?
Elasticsearch's index is separate from MySQL. When the backend starts in a
fresh Docker container, the ES index is empty even if MySQL has data.
This runner fires **once** after Spring Boot is fully ready and syncs all
products from MySQL into Elasticsearch automatically.

### Why `ApplicationReadyEvent` instead of `@PostConstruct`?
`@PostConstruct` fires during bean initialization, before the web server is
ready. `ApplicationReadyEvent` fires after **everything** is initialized —
safer for tasks that need the full application context.

---

## 9️⃣ `SecurityConfig.java` (Updated)

Two changes were made:

### a) Added CORS origin for Docker frontend
```java
// Before:
configuration.setAllowedOrigins(List.of("http://localhost:5173"));

// After:
configuration.setAllowedOrigins(List.of(
    "http://localhost:5173",   // Local dev (Vite)
    "http://localhost",        // Docker (Nginx on port 80)
    "http://localhost:80"
));
```
Without this, the browser would block API calls from the Dockerized frontend
with a CORS error.

### b) Made `/api/products/sync` public
```java
.requestMatchers(HttpMethod.POST, "/api/products/sync").permitAll()
```
This allows the ES sync endpoint to be called without a JWT token (e.g.,
from a `curl` command or during debugging). Without this, it returned `403 Forbidden`.

---

## 🔄 How It All Works Together

```
Browser (http://localhost)
       │
       ▼
  Nginx (port 80)
       │
       ├── Static files  → serves /usr/share/nginx/html (React build)
       │
       └── /api/*        → proxies to → Spring Boot (port 8080)
                                               │
                                               ├── MySQL (port 3306)
                                               └── Elasticsearch (port 9200)
```

---

## 🚀 Common Commands

```bash
# Start everything
sudo docker compose up -d

# Stop everything (data preserved)
sudo docker compose down

# Stop and wipe all data (fresh start)
sudo docker compose down -v

# Rebuild a specific service after code changes
sudo docker compose up -d --build backend

# View live logs
sudo docker compose logs -f backend

# Check container status
sudo docker compose ps

# Manually trigger Elasticsearch sync
curl -X POST http://localhost:8080/api/products/sync
```

---

## 🌐 Access Points

| Service | URL |
|---|---|
| Frontend (React App) | `http://localhost` |
| Backend REST API | `http://localhost:8080/api` |
| Elasticsearch | `http://localhost:9200` |
| MySQL | `localhost:3306` (user: `root`, pass: `Root@123`) |
