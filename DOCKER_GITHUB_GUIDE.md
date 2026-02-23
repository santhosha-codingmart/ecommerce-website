# Full Guide: Dockerizing and Uploading to GitHub

This guide provides detailed steps and commands to containerize your e-commerce application (Spring Boot + React + MySQL + Elasticsearch) and push it to a GitHub repository.

---

## Part 1: Dockerization

### 1. Create Backend Dockerfile
Create a file named `Dockerfile` in the **root** project directory:

```dockerfile
# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2. Create Frontend Dockerfile
Create a file named `Dockerfile` inside the `frontend/` directory:

```dockerfile
# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Create Docker Compose File
Create a file named `docker-compose.yml` in the **root** project directory:

```yaml
version: '3.8'
services:
  db:
    image: mysql:8.0
    container_name: mysql-db
    environment:
      MYSQL_ROOT_PASSWORD: Root@123
      MYSQL_DATABASE: ecommerce_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.1
    container_name: elastic-search
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  backend:
    build: .
    container_name: spring-backend
    ports:
      - "8080:8080"
    depends_on:
      - db
      - elasticsearch
    environment:
      # These override application.properties for Docker networking
      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/ecommerce_db
      SPRING_ELASTICSEARCH_URIS: http://elasticsearch:9200

  frontend:
    build: ./frontend
    container_name: react-frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### 4. Commands to Run
To build and start all services:
```bash
docker-compose up --build
```
To stop everything:
```bash
docker-compose down
```

---

## Part 2: Uploading to GitHub

### 1. Initialize Git Repo
Run these in the **root** directory:
```bash
# Initialize local repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "feat: add docker configuration and project source"
```

### 2. Prepare Remote Repository
1.  Log in to [GitHub](https://github.com).
2.  Click **New Repository**.
3.  Name it (e.g., `ecommerce-fullstack`) and click **Create repository**.
4.  Copy the remote URL (e.g., `https://github.com/USERNAME/REPO_NAME.git`).

### 3. Push to GitHub
Run these in your terminal:
```bash
# Link local repo to GitHub (Replace URL with your copied link)
git remote add origin https://github.com/your-username/ecommerce-fullstack.git

# Rename main branch
git branch -M main

# Push the code
git push -u origin main
```

---

## Important Tips
- **Networking**: In Docker, services use their service names (like `db` or `elasticsearch`) instead of `localhost`.
- **Ignore files**: Ensure your `.gitignore` includes `node_modules`, `target`, and `.env` files before pushing.
- **Vite Proxy**: If you use a proxy in `vite.config.js`, make sure the target is `http://backend:8080`.
