# 🐳 VELGURU Tech – Docker & Docker Compose

## 1. Overview

The VELGURU Tech Appointment Management System is containerized using **Docker** and **Docker Compose**.

The application contains three main components:

* Angular Frontend
* Spring Boot Backend
* PostgreSQL Database

Docker Compose is used to run all three components together in a local development environment.

### Application Architecture

```text
                         Browser
                            |
                            | http://localhost:8081
                            v
                   +------------------+
                   | Angular Frontend |
                   |      Nginx       |
                   |      :80         |
                   +--------+---------+
                            |
                         /api/*
                            |
                            v
                   +------------------+
                   | Spring Boot API  |
                   |      :8080       |
                   +--------+---------+
                            |
                           JDBC
                            |
                            v
                   +------------------+
                   |   PostgreSQL     |
                   |      :5432       |
                   +------------------+
```

---

# 2. Why Docker?

Docker packages an application and its dependencies into containers.

Instead of installing and configuring:

```text
Node.js
Java
Maven
PostgreSQL
Nginx
```

individually on every machine, we package the required components into containers.

### Benefits

* Consistent environment
* Easy application startup
* Service isolation
* Reproducible builds
* Easier troubleshooting
* Easy migration toward Kubernetes
* Same container images can later be pushed to ECR/ACR

---

# 3. Docker Components

## Frontend

Technology:

```text
Angular
Node.js
Nginx
```

The Angular application is built using Node.js.

The generated static files are then served using Nginx.

The frontend container exposes:

```text
Container: 80
Host:      8081
```

---

## Backend

Technology:

```text
Spring Boot
Java 17
Maven
```

The Spring Boot application runs inside the container on:

```text
Container: 8080
```

Docker Compose maps it to:

```text
Host: 8082
```

Therefore:

```text
localhost:8082 → backend container:8080
```

---

## Database

Technology:

```text
PostgreSQL 17
```

Database:

```text
velgurudb
```

Username:

```text
velguru
```

The PostgreSQL container uses a Docker volume for persistent database storage.

---

# 4. Dockerfiles

The project contains separate Dockerfiles.

```text
docker/
├── backend/
│   └── Dockerfile
│
└── frontend/
    ├── Dockerfile
    └── nginx.conf
```

---

# 5. Backend Dockerfile

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .

RUN mvn dependency:go-offline

COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Explanation

### Stage 1 – Build

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
```

Uses Maven and Java 17 to build the Spring Boot application.

```dockerfile
WORKDIR /app
```

Creates the working directory inside the image.

```dockerfile
COPY pom.xml .
```

Copies the Maven configuration.

```dockerfile
RUN mvn dependency:go-offline
```

Downloads Maven dependencies before copying source code.

This improves Docker layer caching.

```dockerfile
COPY src ./src
```

Copies the application source code.

```dockerfile
RUN mvn clean package -DskipTests
```

Builds the Spring Boot JAR.

---

### Stage 2 – Runtime

```dockerfile
FROM eclipse-temurin:17-jre
```

Uses a smaller Java runtime image instead of the full Maven image.

```dockerfile
COPY --from=build /app/target/*.jar app.jar
```

Copies only the generated JAR from the build stage.

This is called a **multi-stage Docker build**.

```dockerfile
EXPOSE 8080
```

Documents the application port.

```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Starts the Spring Boot application.

---

# 6. Frontend Dockerfile

```dockerfile
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Explanation

### Stage 1

Node.js is used to build the Angular application.

```dockerfile
RUN npm ci
```

Installs the exact dependencies from the lock file.

```dockerfile
RUN npm run build
```

Creates the production Angular build.

### Stage 2

```dockerfile
FROM nginx:alpine
```

Uses Nginx to serve the Angular application.

```dockerfile
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
```

Copies the Angular production files into the Nginx web directory.

```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

Loads our custom reverse-proxy configuration.

---

# 7. Nginx Reverse Proxy

The frontend uses:

```text
/api/appointments
```

instead of hard-coding the backend address.

Nginx forwards API requests to the Docker Compose backend service.

```nginx
location /api/ {
    proxy_pass http://backend:8080/api/;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

The important part is:

```text
backend:8080
```

`backend` is the **Docker Compose service name**.

Docker's internal DNS resolves:

```text
backend → backend container IP
```

Therefore, the browser does not need to know the backend container address.

---

# 8. Docker Compose

The complete `docker/docker-compose.yml` file:

```yaml
services:

  postgres:
    image: postgres:17
    container_name: velguru-postgres
    environment:
      POSTGRES_DB: velgurudb
      POSTGRES_USER: velguru
      POSTGRES_PASSWORD: velguru123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ../backend
      dockerfile: ../docker/backend/Dockerfile
    container_name: velguru-backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: velgurudb
      DB_USERNAME: velguru
      DB_PASSWORD: velguru123
    ports:
      - "8082:8080"
    depends_on:
      - postgres

  frontend:
    build:
      context: ../frontend
      dockerfile: ../docker/frontend/Dockerfile
    container_name: velguru-frontend
    ports:
      - "8081:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

# 9. Docker Compose – Step-by-Step Explanation

## PostgreSQL Service

```yaml
postgres:
```

Defines the PostgreSQL service.

```yaml
image: postgres:17
```

Uses the official PostgreSQL 17 image.

```yaml
container_name: velguru-postgres
```

Gives the container a predictable name.

```yaml
environment:
```

Defines PostgreSQL configuration.

```yaml
POSTGRES_DB: velgurudb
POSTGRES_USER: velguru
POSTGRES_PASSWORD: velguru123
```

Creates the database and user during initialization.

---

## Port Mapping

```yaml
ports:
  - "5432:5432"
```

The format is:

```text
HOST:CONTAINER
```

Therefore:

```text
localhost:5432 → PostgreSQL container:5432
```

---

## Persistent Volume

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

PostgreSQL stores its database files inside the Docker volume.

```text
postgres_data
       |
       v
/var/lib/postgresql/data
```

The volume prevents database data from being tied only to the container's writable layer.

---

# 10. Backend Service

```yaml
backend:
```

Defines the Spring Boot service.

```yaml
build:
  context: ../backend
  dockerfile: ../docker/backend/Dockerfile
```

Docker uses:

```text
backend/
```

as the build context.

The Dockerfile is located under:

```text
docker/backend/Dockerfile
```

### Environment Variables

```yaml
environment:
  DB_HOST: postgres
  DB_PORT: 5432
  DB_NAME: velgurudb
  DB_USERNAME: velguru
  DB_PASSWORD: velguru123
```

The important point is:

```text
DB_HOST=postgres
```

The backend does **not** use:

```text
localhost
```

because PostgreSQL is running in another container.

Inside the Compose network:

```text
postgres → PostgreSQL container
```

---

# 11. Backend Port Mapping

```yaml
ports:
  - "8082:8080"
```

Therefore:

```text
Host
localhost:8082
      |
      v
Backend container:8080
```

The Spring Boot application itself continues to listen on:

```text
8080
```

---

# 12. depends_on

```yaml
depends_on:
  - postgres
```

This tells Compose to start PostgreSQL before the backend container.

Similarly:

```yaml
frontend:
  depends_on:
    - backend
```

starts the backend before the frontend.

> Note: `depends_on` controls startup order; it does not by itself guarantee that the dependency is fully ready to accept connections.

For production-style Compose, healthchecks can be added.

---

# 13. Frontend Service

```yaml
frontend:
```

Defines the Angular/Nginx service.

```yaml
build:
  context: ../frontend
  dockerfile: ../docker/frontend/Dockerfile
```

The build context is:

```text
frontend/
```

This is why `nginx.conf` was placed inside:

```text
frontend/nginx.conf
```

Docker can only `COPY` files available inside the build context.

---

# 14. Frontend Port Mapping

```yaml
ports:
  - "8081:80"
```

Therefore:

```text
Browser
   |
   | localhost:8081
   v
Nginx container:80
```

Open:

```text
http://localhost:8081
```

---

# 15. Docker Compose Network

Docker Compose automatically creates a network for the application.

The services can communicate using their service names.

```text
frontend
   |
   | backend:8080
   v
backend
   |
   | postgres:5432
   v
postgres
```

### Important DevOps Concept

Inside containers:

```text
localhost
```

means:

> The current container itself.

It does **not** mean another container.

Therefore:

```text
backend → postgres:5432
```

is correct.

And:

```text
backend → localhost:5432
```

would be incorrect for our Compose architecture.

---

# 16. Start the Application

From the project root:

```bash
cd ~/Azure/velguru-project
```

Start all services:

```bash
docker compose -f docker/docker-compose.yml up -d
```

---

# 17. Build and Start

To rebuild images and start containers:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

Use this after changing:

* Dockerfiles
* Angular source
* Nginx configuration
* Backend source
* Compose configuration

---

# 18. Check Container Status

```bash
docker compose -f docker/docker-compose.yml ps
```

Expected:

```text
velguru-postgres    Up
velguru-backend     Up
velguru-frontend    Up
```

---

# 19. Check Backend Health

```bash
curl http://localhost:8082/api/health
```

Expected:

```text
VELGURU Backend is UP
```

---

# 20. Test API

Get appointments:

```bash
curl http://localhost:8082/api/appointments
```

Create an appointment:

```bash
curl -X POST http://localhost:8082/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Rakesh",
    "doctorName": "Dr. Kumar",
    "appointmentDate": "2026-09-27",
    "status": "BOOKED"
  }'
```

---

# 21. Open Frontend

Open:

```text
http://localhost:8081
```

Test:

1. Open the application.
2. Enter patient details.
3. Select doctor.
4. Select appointment date.
5. Book the appointment.
6. Verify the success message.

The request flow is:

```text
Browser
   |
   | POST /api/appointments
   v
Nginx
   |
   | proxy_pass
   v
Spring Boot
   |
   | JDBC
   v
PostgreSQL
```

---

# 22. View Logs

Backend:

```bash
docker compose -f docker/docker-compose.yml logs backend
```

Frontend:

```bash
docker compose -f docker/docker-compose.yml logs frontend
```

PostgreSQL:

```bash
docker compose -f docker/docker-compose.yml logs postgres
```

Follow live backend logs:

```bash
docker compose -f docker/docker-compose.yml logs -f backend
```

---

# 23. Stop the Application

```bash
docker compose -f docker/docker-compose.yml down
```

This stops and removes the containers and Compose network.

The named PostgreSQL volume remains unless explicitly removed.

---

# 24. Remove Containers and Database Volume

⚠️ This removes the PostgreSQL data stored in the Compose volume.

```bash
docker compose -f docker/docker-compose.yml down -v
```

Use this carefully during development.

---

# 25. Real-Time Troubleshooting

## Issue 1 – Container Name Conflict

### Error

```text
Conflict. The container name "/velguru-postgres" is already in use
```

### Root Cause

An old stopped PostgreSQL container was still present.

### Diagnosis

```bash
docker ps -a
```

### Solution

```bash
docker rm velguru-postgres
```

Then:

```bash
docker compose -f docker/docker-compose.yml up -d
```

### Verification

```bash
docker compose -f docker/docker-compose.yml ps
```

All three containers started successfully.

---

# 26. Real-Time Troubleshooting – Docker Build Context

### Error

```text
COPY pom.xml .
COPY src ./src
```

failed because the Docker build context was incorrect.

The build context was extremely small:

```text
transferring context: 2B
```

### Root Cause

Docker was not receiving the expected `backend/` source files as its build context.

### Solution

The Compose file was configured with:

```yaml
build:
  context: ../backend
  dockerfile: ../docker/backend/Dockerfile
```

and frontend:

```yaml
build:
  context: ../frontend
  dockerfile: ../docker/frontend/Dockerfile
```

### DevOps Lesson

The Dockerfile can reference only files available inside the build context.

---

# 27. Real-Time Troubleshooting – Frontend API Failure

### Symptom

The frontend loaded successfully, but booking an appointment showed:

```text
Failed to book appointment
```

### Root Cause

Angular was initially configured with:

```text
http://localhost:8080/api/appointments
```

However, the Compose backend was exposed to the host using:

```text
localhost:8082
```

The frontend also needed a clean solution that would not hard-code environment-specific backend ports.

### Solution

Angular was changed to:

```text
/api/appointments
```

Nginx was configured to proxy:

```text
/api/
```

to:

```text
http://backend:8080/api/
```

### Final Flow

```text
Browser
   |
   | /api/appointments
   v
Nginx
   |
   | backend:8080
   v
Spring Boot
   |
   | postgres:5432
   v
PostgreSQL
```

### Verification

Appointment booking was successfully tested through the browser.

---

# 28. Docker Compose Build Warning

During the build, Docker displayed:

```text
Docker Compose is configured to build using Bake, but buildx isn't installed
```

This was a warning.

The Docker images were still built successfully.

Verification:

```bash
docker compose -f docker/docker-compose.yml ps
```

showed all services as:

```text
Up
```

---

# 29. Useful Docker Commands

List running containers:

```bash
docker ps
```

List all containers:

```bash
docker ps -a
```

List images:

```bash
docker images
```

List networks:

```bash
docker network ls
```

List volumes:

```bash
docker volume ls
```

Inspect a container:

```bash
docker inspect velguru-backend
```

Check Docker Compose configuration:

```bash
docker compose -f docker/docker-compose.yml config
```

---

# 30. Docker Learning Summary

Through this implementation we practiced:

```text
Dockerfile
   ↓
Multi-stage Build
   ↓
Docker Image
   ↓
Docker Container
   ↓
Docker Network
   ↓
Docker Volume
   ↓
Docker Compose
   ↓
Nginx Reverse Proxy
   ↓
Container-to-Container Communication
   ↓
End-to-End Testing
   ↓
Real-Time Troubleshooting
```

---

# 31. Interview Explanation

### Question

**How did you containerize your application?**

### Answer

> “In our VELGURU project, I containerized the Angular frontend, Spring Boot backend and PostgreSQL database. I used multi-stage Docker builds for the frontend and backend to separate the build and runtime layers. I used Docker Compose to run all three services together. The frontend is served through Nginx, and Nginx forwards `/api` requests to the Spring Boot backend using the Docker service name. The backend connects to PostgreSQL using the Compose service name instead of localhost. I also used a persistent Docker volume for PostgreSQL and verified the complete application flow by booking an appointment through the frontend.”

---

# 32. Next Production Evolution

Docker Compose is our **local containerization stage**.

The next architecture will move toward Kubernetes:

```text
                 Docker Compose
                       |
                       v
                  Kubernetes
                       |
          +------------+------------+
          |                         |
          v                         v
        AWS EKS                  Azure AKS
          |                         |
          v                         v
         ECR                       ACR
          |                         |
          v                         v
        RDS                   Azure PostgreSQL
```

Future DevOps implementation will include:

* Kubernetes Namespace
* ConfigMaps
* Secrets
* Deployments
* Services
* Ingress
* Health Probes
* HPA
* RBAC
* Persistent Volumes
* EKS
* AKS
* Terraform
* Jenkins
* Azure Pipelines
* SonarQube
* Trivy
* Prometheus
* Grafana
* Loki
* CloudWatch
* Azure Monitor
* CI/CD
* Blue-Green Deployment
* Canary Deployment
* Rollback

---

## VELGURU Tech

**Learn • Practice • Troubleshoot • Build • Deploy**
