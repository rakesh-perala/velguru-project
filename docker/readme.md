# 🐳 VELGURU Tech – Docker & Docker Compose

## Overview

This module containerizes the VELGURU Tech Appointment Management System using Docker and Docker Compose.

### Application Stack

* **Frontend:** Angular + Nginx
* **Backend:** Spring Boot + Java 17
* **Database:** PostgreSQL 17
* **Container Orchestration:** Docker Compose

## Architecture

```text
                    Browser
                       |
                       | :8081
                       v
              +----------------+
              | Angular + Nginx|
              +-------+--------+
                      |
                   /api/*
                      |
                      v
              +----------------+
              | Spring Boot    |
              | Backend :8080  |
              +-------+--------+
                      |
                     JDBC
                      |
                      v
              +----------------+
              | PostgreSQL :5432|
              +----------------+
```

## Docker Components

### Frontend

* Multi-stage Docker build
* Angular application built using Node.js
* Nginx used as the runtime web server
* Nginx reverse-proxies `/api/` requests to the backend

### Backend

* Multi-stage Docker build
* Maven used for application build
* Java 17 JRE used for runtime
* Exposes port `8080` inside the container

### PostgreSQL

* PostgreSQL 17 official image
* Database: `velgurudb`
* Persistent Docker volume: `postgres_data`

## Docker Compose

Start the complete application:

```bash
docker compose -f docker/docker-compose.yml up -d
```

Check containers:

```bash
docker compose -f docker/docker-compose.yml ps
```

View backend logs:

```bash
docker compose -f docker/docker-compose.yml logs backend
```

Stop the application:

```bash
docker compose -f docker/docker-compose.yml down
```

Rebuild and start:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

## Application Ports

| Component  | Host Port | Container Port |
| ---------- | --------: | -------------: |
| Frontend   |      8081 |             80 |
| Backend    |      8082 |           8080 |
| PostgreSQL |      5432 |           5432 |

Frontend:

```text
http://localhost:8081
```

Backend health:

```bash
curl http://localhost:8082/api/health
```

Expected:

```text
VELGURU Backend is UP
```

## Docker Networking

Docker Compose automatically creates a network for the services.

Containers communicate using **service names**, not localhost.

```text
frontend → backend:8080
backend  → postgres:5432
```

Nginx configuration:

```nginx
location /api/ {
    proxy_pass http://backend:8080/api/;
}
```

This allows the browser to call:

```text
/api/appointments
```

instead of hard-coding the backend container address.

## Real-Time Troubleshooting

### Issue: Appointment booking failed

**Symptom:**

```text
Failed to book appointment
```

**Root Cause:**

Angular was configured with:

```text
http://localhost:8080/api/appointments
```

The frontend was running through Docker/Nginx, while the backend was exposed on host port `8082`.

**Solution:**

Changed Angular API URL to:

```text
/api/appointments
```

and configured Nginx to proxy:

```text
/api → backend:8080
```

**Result:**

```text
Browser
   ↓
Nginx
   ↓
backend:8080
   ↓
postgres:5432
```

Appointment booking was successfully verified.

### Issue: Container name conflict

**Error:**

```text
Conflict. The container name "/velguru-postgres" is already in use
```

**Root Cause:**

An old stopped PostgreSQL container was still present.

**Solution:**

```bash
docker ps -a
docker rm velguru-postgres
```

Then restarted Docker Compose.

## DevOps Learning

This Docker implementation demonstrates:

* Dockerfiles
* Multi-stage builds
* Docker Compose
* Container networking
* Persistent volumes
* Environment variables
* Nginx reverse proxy
* Service-to-service communication
* Container troubleshooting
* End-to-end application testing

## Next Phase

The Docker environment is a local containerization stage.

The application will later be deployed using:

```text
Docker
   ↓
Kubernetes
   ↓
AWS EKS / Azure AKS
```

The same application will be extended with CI/CD, Terraform, security scanning, monitoring, secrets management and production deployment strategies.

---

**VELGURU Tech**

*Learn • Practice • Troubleshoot • Build • Deploy*

