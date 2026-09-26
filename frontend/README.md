# VELGURU Tech – Frontend

## Angular Appointment Management Application

This directory contains the **Angular frontend** for the VELGURU Tech Hospital Appointment Management application.

The frontend is intentionally kept simple because the primary objective of this project is to demonstrate **enterprise-level AWS DevOps and Azure DevOps practices**, including CI/CD, Docker, Kubernetes, Terraform, DevSecOps, monitoring, logging, deployment strategies, and production troubleshooting.

---

## 1. Application Architecture

```text
Browser
   |
   v
Angular Frontend
   |
   | HTTP REST API
   v
Spring Boot Backend
   |
   v
PostgreSQL Database
```

The Angular application communicates with the Spring Boot backend through REST APIs.

---

## 2. Technology Stack

| Technology  | Purpose                           |
| ----------- | --------------------------------- |
| Angular     | Frontend application              |
| TypeScript  | Application programming language  |
| HTML        | Application structure             |
| CSS         | Application styling               |
| Node.js     | JavaScript runtime                |
| npm         | Package management                |
| Angular CLI | Application development and build |
| Spring Boot | Backend REST API                  |
| PostgreSQL  | Relational database               |

### Current Development Versions

```text
Angular CLI : 22.2.0
Node.js     : 24.21.0
npm         : 11.19.0
```

---

## 3. Frontend Directory Structure

```text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── app.ts
│   │   ├── app.html
│   │   ├── app.css
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   ├── main.ts
│   ├── index.html
│   └── styles.css
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

---

# 4. Application Functionality

The frontend provides a simple appointment management interface.

### Book Appointment

Users can enter:

```text
Patient Name
Doctor Name
Appointment Date
Status
```

and submit the appointment.

### View Appointments

The frontend retrieves appointments from the backend and displays them in a table.

---

# 5. Backend API Integration

The Angular frontend communicates with the Spring Boot backend running on:

```text
http://localhost:8080
```

### Get Appointments

```text
GET /api/appointments
```

Full local URL:

```text
http://localhost:8080/api/appointments
```

### Create Appointment

```text
POST /api/appointments
```

Full local URL:

```text
http://localhost:8080/api/appointments
```

### Backend Health Check

```text
GET /api/health
```

Full local URL:

```text
http://localhost:8080/api/health
```

Expected response:

```text
VELGURU Backend is UP
```

---

# 6. Angular HTTP Configuration

Angular uses `HttpClient` to communicate with the Spring Boot REST API.

The application enables HTTP support through:

```text
provideHttpClient()
```

in:

```text
src/app/app.config.ts
```

The API URL is currently configured in:

```text
src/app/app.ts
```

as:

```text
http://localhost:8080/api/appointments
```

This local configuration is used only for development and testing.

For cloud deployment, the API endpoint can be changed through environment/configuration management without changing the application architecture.

---

# 7. Local Development Setup

## Prerequisites

Install:

```text
Node.js
npm
Angular CLI
```

Verify:

```bash
node --version
npm --version
ng version
```

Example:

```text
Node.js     : v24.21.0
npm         : 11.19.0
Angular CLI : 22.2.0
```

---

# 8. Install Frontend Dependencies

Go to the frontend directory:

```bash
cd ~/Azure/velguru-project/frontend
```

Install dependencies:

```bash
npm install
```

---

# 9. Run Angular Frontend

Start the Angular development server:

```bash
npm start
```

Angular starts the application on:

```text
http://localhost:4200
```

Open a browser and visit:

```text
http://localhost:4200
```

The VELGURU Tech appointment application should be displayed.

---

# 10. Running the Complete Application Locally

The complete application requires both the frontend and backend to be running.

### Terminal 1 – Backend

```bash
cd ~/Azure/velguru-project/backend
```

Set Java 17:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
```

Start Spring Boot:

```bash
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

---

### Terminal 2 – Frontend

```bash
cd ~/Azure/velguru-project/frontend
```

Start Angular:

```bash
npm start
```

Frontend:

```text
http://localhost:4200
```

---

# 11. How We Tested the Backend Before Connecting Angular

Before testing the browser application, we verified that the Spring Boot backend was working independently.

### Health API Test

```bash
curl --max-time 5 http://localhost:8080/api/health
```

Expected:

```text
VELGURU Backend is UP
```

### Appointment API Test

```bash
curl http://localhost:8080/api/appointments
```

This verifies that Spring Boot can communicate with PostgreSQL through JPA.

---

# 12. How We Tested the Browser Application

After confirming that the backend was working, we started Angular:

```bash
npm start
```

Angular provided the local development URL:

```text
http://localhost:4200
```

We opened that URL in the browser.

The browser displays the Angular application.

The complete request flow is:

```text
Browser
   |
   | GET /api/appointments
   v
Angular
   |
   | HTTP Request
   v
Spring Boot :8080
   |
   | JPA
   v
PostgreSQL :5432
   |
   | Appointment Data
   v
Spring Boot
   |
   v
Angular
   |
   v
Browser
```

---

# 13. End-to-End Appointment Test

We also tested appointment creation through the backend.

Example appointment:

```json
{
  "patientName": "Rakesh",
  "doctorName": "Dr. Kumar",
  "appointmentDate": "2026-09-27",
  "status": "BOOKED"
}
```

The backend returned:

```json
{
  "id": 1,
  "patientName": "Rakesh",
  "doctorName": "Dr. Kumar",
  "appointmentDate": "2026-09-27",
  "status": "BOOKED"
}
```

We then verified the appointment using:

```bash
curl http://localhost:8080/api/appointments
```

The appointment was returned successfully.

This confirmed the application flow:

```text
Request
   ↓
Spring Boot
   ↓
JPA
   ↓
PostgreSQL
   ↓
Response
```

---

# 14. Browser Testing Objective

The browser test is not only a UI test.

It validates the complete application integration:

```text
Angular
   ↓
REST API
   ↓
Spring Boot
   ↓
JPA
   ↓
PostgreSQL
```

This gives us a working application that can later be containerized and deployed to Kubernetes.

---

# 15. Development Ports

| Component   | Port |
| ----------- | ---: |
| Angular     | 4200 |
| Spring Boot | 8080 |
| PostgreSQL  | 5432 |

Local URLs:

```text
Frontend:
http://localhost:4200

Backend:
http://localhost:8080

Health:
http://localhost:8080/api/health

Appointments:
http://localhost:8080/api/appointments
```

---

# 16. Production Architecture

The Angular frontend will later be containerized and served through Nginx.

### AWS

```text
Browser
   ↓
Load Balancer / Ingress
   ↓
Angular Container
   ↓
Spring Boot Container
   ↓
Amazon RDS PostgreSQL
```

### Azure

```text
Browser
   ↓
Load Balancer / Ingress
   ↓
Angular Container
   ↓
Spring Boot Container
   ↓
Azure Database for PostgreSQL
```

---

# 17. DevOps Roadmap

The frontend is intentionally simple. The main focus of this project is enterprise DevOps.

Upcoming implementation:

```text
Git / GitHub
      ↓
CI Pipeline
      ↓
Maven + Angular Build
      ↓
Unit Testing
      ↓
SonarQube
      ↓
Trivy / Security Scanning
      ↓
Docker Build
      ↓
AWS ECR / Azure ACR
      ↓
Kubernetes
      ↓
AWS EKS / Azure AKS
      ↓
Ingress
      ↓
PostgreSQL
      ↓
Monitoring
      ↓
Logging
      ↓
Alerting
      ↓
Deployment / Rollback
```

Infrastructure will be automated using:

```text
Terraform
```

---

# 18. Important DevOps Principle

The application is deliberately small.

The objective is **not** to demonstrate complicated application development.

The objective is to demonstrate how a software application can be:

```text
Developed
   ↓
Tested
   ↓
Secured
   ↓
Containerized
   ↓
Provisioned
   ↓
Deployed
   ↓
Monitored
   ↓
Troubleshot
   ↓
Rolled Back
```

across both AWS and Azure.

---

# 19. Current Project Status

```text
Angular Project Created       ✅
Node.js Installed             ✅
Angular CLI Installed         ✅
Frontend Running              ✅
Browser Testing               ✅
Spring Boot Backend           ✅
PostgreSQL Database           ✅
REST API                      ✅
Frontend → Backend Integration 🚧
Docker                        ⏳
Kubernetes                    ⏳
Terraform AWS                 ⏳
Terraform Azure               ⏳
CI/CD                         ⏳
DevSecOps                     ⏳
Monitoring                    ⏳
Logging                       ⏳
```

---

## VELGURU Tech

**AWS DevOps • Azure DevOps • Cloud • Linux • DevSecOps**

**Learn • Practice • Troubleshoot • Build • Deploy**
