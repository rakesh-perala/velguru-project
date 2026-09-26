# VELGURU Tech – Backend

## Spring Boot REST API

This module contains the backend service for the VELGURU Tech DevOps project.

The backend provides REST APIs for appointment management and communicates with the PostgreSQL database using Spring Data JPA.

---

## 🛠️ Technology Stack

| Technology           | Version / Tool     |
| -------------------- | ------------------ |
| Java                 | 17                 |
| Spring Boot          | 3.5.6              |
| Spring Web           | REST APIs          |
| Spring Data JPA      | Database access    |
| PostgreSQL           | Database           |
| Maven                | Build tool         |
| Spring Boot Actuator | Application health |

---

## 📂 Project Structure

```text
backend/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── velguru/
│   │   │           └── project/
│   │   │               ├── VelguruProjectApplication.java
│   │   │               │
│   │   │               ├── controller/
│   │   │               │   ├── HealthController.java
│   │   │               │   └── AppointmentController.java
│   │   │               │
│   │   │               ├── entity/
│   │   │               │   └── Appointment.java
│   │   │               │
│   │   │               ├── repository/
│   │   │               │   └── AppointmentRepository.java
│   │   │               │
│   │   │               └── service/
│   │   │                   └── AppointmentService.java
│   │   │
│   │   └── resources/
│   │       └── application.yml
│   │
│   └── test/
│
├── pom.xml
├── target/
└── README.md
```

---

# 🏗️ Backend Architecture

```text
Client
  │
  ▼
REST Controller
  │
  ▼
Service Layer
  │
  ▼
Repository
  │
  ▼
PostgreSQL
```

### Request Flow

```text
HTTP Request
     ↓
AppointmentController
     ↓
AppointmentService
     ↓
AppointmentRepository
     ↓
PostgreSQL
```

---

# 🔌 REST APIs

## 1. Health Check

### Request

```text
GET /api/health
```

### Example

```bash
curl http://localhost:8080/api/health
```

### Response

```text
VELGURU Backend is UP
```

---

## 2. Get Appointments

### Request

```text
GET /api/appointments
```

### Example

```bash
curl http://localhost:8080/api/appointments
```

### Example Response

```json
[
  {
    "id": 1,
    "patientName": "Rakesh",
    "doctorName": "Dr. Kumar",
    "appointmentDate": "2026-09-27",
    "status": "BOOKED"
  }
]
```

---

## 3. Create Appointment

### Request

```text
POST /api/appointments
```

### Example

```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Rakesh",
    "doctorName": "Dr. Kumar",
    "appointmentDate": "2026-09-27",
    "status": "BOOKED"
  }'
```

### Example Response

```json
{
  "id": 1,
  "patientName": "Rakesh",
  "doctorName": "Dr. Kumar",
  "appointmentDate": "2026-09-27",
  "status": "BOOKED"
}
```

---

# 🗄️ Database Configuration

The backend connects to PostgreSQL using environment variables.

Example configuration:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:velgurudb}
    username: ${DB_USERNAME:velguru}
    password: ${DB_PASSWORD:velguru123}

  jpa:
    hibernate:
      ddl-auto: update
```

### Local Environment

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=velgurudb
DB_USERNAME=velguru
DB_PASSWORD=velguru123
```

The default values are intended only for local development.

Production credentials should be provided through a secure secrets-management solution.

---

# 🐳 Local PostgreSQL

For local development, PostgreSQL runs as a Docker container.

Example:

```bash
docker run -d \
  --name velguru-postgres \
  -e POSTGRES_DB=velgurudb \
  -e POSTGRES_USER=velguru \
  -e POSTGRES_PASSWORD=velguru123 \
  -p 5432:5432 \
  postgres:17
```

Verify:

```bash
docker ps
```

Check logs:

```bash
docker logs velguru-postgres
```

Expected:

```text
database system is ready to accept connections
```

---

# ▶️ Running the Backend

Navigate to the backend directory:

```bash
cd ~/Azure/velguru-project/backend
```

Make sure Java 17 is active:

```bash
java -version
```

Expected:

```text
openjdk version "17..."
```

Build the application:

```bash
mvn clean package
```

Run the application:

```bash
mvn spring-boot:run
```

The application runs on:

```text
http://localhost:8080
```

---

# 🧪 Testing

### Health API

```bash
curl http://localhost:8080/api/health
```

### Get appointments

```bash
curl http://localhost:8080/api/appointments
```

### Create appointment

```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Rakesh",
    "doctorName": "Dr. Kumar",
    "appointmentDate": "2026-09-27",
    "status": "BOOKED"
  }'
```

### Actuator Health

```bash
curl http://localhost:8080/actuator/health
```

---

# 📦 Build Artifact

After a successful Maven build:

```bash
mvn clean package
```

The executable JAR is generated under:

```text
target/velguru-backend-1.0.0.jar
```

It can also be started directly:

```bash
java -jar target/velguru-backend-1.0.0.jar
```

---

# 🐳 Docker

The backend will later be packaged as a Docker image.

Planned flow:

```text
Source Code
    ↓
Maven Build
    ↓
JAR
    ↓
Docker Image
    ↓
Container Registry
```

AWS:

```text
Docker Image
    ↓
Amazon ECR
    ↓
Amazon EKS
```

Azure:

```text
Docker Image
    ↓
Azure Container Registry
    ↓
Azure Kubernetes Service
```

---

# ☁️ Cloud Database

The local PostgreSQL database is only for development and testing.

For cloud deployment:

### AWS

```text
Spring Boot
     ↓
Amazon RDS
     ↓
PostgreSQL
```

### Azure

```text
Spring Boot
     ↓
Azure Database for PostgreSQL
```

The application configuration will remain environment-based so that the same application can run against different database environments.

---

# 🔐 Security

Database passwords and other sensitive configuration values should not be committed to Git.

The production architecture will use:

### AWS

```text
AWS Secrets Manager
```

### Azure

```text
Azure Key Vault
```

The CI/CD pipeline should inject required configuration securely during deployment.

---

# 🚀 CI/CD Integration

The backend will be included in both DevOps pipelines.

## AWS

```text
GitHub
   ↓
Jenkins
   ↓
Maven Build
   ↓
Unit Tests
   ↓
SonarQube
   ↓
Docker Build
   ↓
Trivy Scan
   ↓
Amazon ECR
   ↓
Amazon EKS
```

## Azure

```text
Azure Repos
   ↓
Azure Pipelines
   ↓
Maven Build
   ↓
Unit Tests
   ↓
Security Scan
   ↓
Docker Build
   ↓
Azure Container Registry
   ↓
AKS
```

---

# 📊 Monitoring

The backend will expose application health through Spring Boot Actuator.

Planned monitoring:

* Application health
* API availability
* JVM metrics
* CPU and memory
* Container metrics
* Kubernetes metrics

Monitoring tools:

* Prometheus
* Grafana
* CloudWatch
* Azure Monitor

---

# 🔧 Troubleshooting

## Port 8080 already in use

Check:

```bash
sudo lsof -i :8080
```

Stop the process:

```bash
kill <PID>
```

Then restart:

```bash
mvn spring-boot:run
```

---

## PostgreSQL connection issue

Check the container:

```bash
docker ps
```

Check PostgreSQL logs:

```bash
docker logs velguru-postgres
```

Verify that port `5432` is available:

```bash
sudo lsof -i :5432
```

---

## Java version issue

Check:

```bash
java -version
javac -version
mvn -version
```

The project requires Java 17.

Set Java 17 if required:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
```

---

# 🎯 DevOps Focus

The backend is intentionally simple.

The main learning focus is not application complexity.

The backend will be used to demonstrate:

* Git workflow
* Maven builds
* Unit testing
* Docker
* CI/CD
* Container image scanning
* Container registries
* Kubernetes deployments
* Infrastructure as Code
* Secrets management
* Monitoring
* Logging
* Troubleshooting
* Rollbacks
* AWS deployment
* Azure deployment

---

## VELGURU Tech

### AWS DevOps • Azure DevOps • Cloud • Linux • DevSecOps

**Learn • Practice • Troubleshoot • Build • Deploy**
