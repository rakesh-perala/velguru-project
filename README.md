# VELGURU Tech – AWS & Azure DevOps Project

## AWS DevOps • Azure DevOps • Cloud • Linux • DevSecOps

A hands-on DevOps project designed by **VELGURU Tech** to demonstrate how the same application can be developed, containerized, automated, secured, deployed, and monitored across **AWS and Microsoft Azure**.

The application is intentionally simple so that the primary focus remains on **DevOps, CI/CD, Cloud, Infrastructure as Code, Containers, Kubernetes, Security, Monitoring, and Troubleshooting**.

---

## 📌 Project Overview

This project is a simple appointment management application consisting of:

* Angular Frontend
* Spring Boot Backend
* PostgreSQL Database

The same application source code is designed to run on both AWS and Azure.

### Application Architecture

```text
                    ┌─────────────────────┐
                    │       Browser       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Angular Frontend    │
                    └──────────┬──────────┘
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │ Spring Boot Backend │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ PostgreSQL Database │
                    └─────────────────────┘
```

---

# 🎯 Project Objectives

The main objective is to demonstrate a real-world DevOps workflow from source code to cloud deployment.

### Application

* Build a simple three-tier application
* Develop frontend using Angular
* Develop REST APIs using Spring Boot
* Store application data in PostgreSQL

### DevOps

* Git and GitHub
* Azure Repos
* CI/CD pipelines
* Docker
* Kubernetes
* Infrastructure as Code
* Automated deployments
* Monitoring
* Logging
* Security scanning
* Troubleshooting
* Rollback strategies

### Cloud

Deploy the same application on:

* AWS
* Microsoft Azure

---

# 🏗️ Technology Stack

| Layer                    | Technology                    |
| ------------------------ | ----------------------------- |
| Frontend                 | Angular                       |
| Backend                  | Java 17                       |
| Backend Framework        | Spring Boot                   |
| API                      | REST API                      |
| Database                 | PostgreSQL                    |
| Source Control           | Git / GitHub / Azure Repos    |
| Containerization         | Docker                        |
| AWS Container Registry   | Amazon ECR                    |
| Azure Container Registry | Azure Container Registry      |
| AWS Kubernetes           | Amazon EKS                    |
| Azure Kubernetes         | Azure AKS                     |
| AWS Database             | Amazon RDS PostgreSQL         |
| Azure Database           | Azure Database for PostgreSQL |
| IaC                      | Terraform                     |
| CI/CD AWS                | Jenkins                       |
| CI/CD Azure              | Azure Pipelines               |
| Security                 | Trivy / SonarQube / OWASP ZAP |
| Monitoring               | Prometheus / Grafana          |
| Logging                  | Loki                          |
| AWS Monitoring           | CloudWatch                    |
| Azure Monitoring         | Azure Monitor / Log Analytics |

---

# 📂 Project Structure

```text
velguru-project/
│
├── frontend/
│   └── Angular application
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── README.md
│
├── database/
│   ├── schema.sql
│   ├── data.sql
│   └── README.md
│
├── docker/
│   └── docker-compose.yml
│
├── k8s/
│   ├── namespace.yaml
│   ├── ingress.yaml
│   │
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   └── backend/
│       ├── deployment.yaml
│       └── service.yaml
│
├── terraform/
│   ├── aws/
│   │   ├── providers.tf
│   │   ├── variables.tf
│   │   ├── main.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   │
│   └── azure/
│       ├── providers.tf
│       ├── variables.tf
│       ├── main.tf
│       ├── outputs.tf
│       └── README.md
│
├── docs/
│
├── .gitignore
├── README.md
└── LICENSE
```

---

# 🔄 Application Flow

```text
User
 │
 ▼
Angular Frontend
 │
 │ REST API
 ▼
Spring Boot Backend
 │
 │ JPA
 ▼
PostgreSQL
```

Example:

```text
POST /api/appointments
```

Request:

```json
{
  "patientName": "Rakesh",
  "doctorName": "Dr. Kumar",
  "appointmentDate": "2026-09-27",
  "status": "BOOKED"
}
```

Response:

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

# 🔌 Application APIs

## Health Check

```text
GET /api/health
```

Example response:

```text
VELGURU Backend is UP
```

## Get Appointments

```text
GET /api/appointments
```

## Create Appointment

```text
POST /api/appointments
```

---

# 🐳 Containerization

Each application component will be containerized where appropriate.

```text
Angular
   ↓
Docker Image

Spring Boot
   ↓
Docker Image

PostgreSQL
   ↓
Managed Database in Cloud
```

For local development, PostgreSQL runs using Docker.

---

# ☁️ AWS Architecture

The AWS deployment will use:

```text
GitHub
   │
   ▼
Jenkins
   │
   ├── Build
   ├── Test
   ├── SonarQube
   ├── Trivy
   └── Docker Build
          │
          ▼
       Amazon ECR
          │
          ▼
       Amazon EKS
          │
          ▼
   Angular + Spring Boot
          │
          ▼
     Amazon RDS
      PostgreSQL
```

### AWS Services

* Amazon VPC
* IAM
* EC2
* Elastic Load Balancing
* Amazon ECR
* Amazon EKS
* Amazon RDS
* AWS Secrets Manager
* CloudWatch

Infrastructure will be provisioned using Terraform.

---

# ☁️ Azure Architecture

The Azure deployment will use:

```text
Azure Repos
    │
    ▼
Azure Pipelines
    │
    ├── Build
    ├── Test
    ├── Security Scan
    └── Docker Build
           │
           ▼
          ACR
           │
           ▼
          AKS
           │
           ▼
    Angular + Spring Boot
           │
           ▼
 Azure PostgreSQL
```

### Azure Services

* Azure Resource Group
* Azure Virtual Network
* Azure Subnets
* Network Security Groups
* Azure Container Registry
* Azure Kubernetes Service
* Azure Database for PostgreSQL
* Azure Key Vault
* Azure Monitor
* Log Analytics

Infrastructure will be provisioned using Terraform.

---

# 🔐 DevSecOps

Security will be integrated into the CI/CD process.

```text
Developer
    ↓
Git
    ↓
Build
    ↓
Unit Tests
    ↓
SonarQube
    ↓
Dependency / Image Scan
    ↓
Docker Build
    ↓
Trivy Scan
    ↓
Container Registry
    ↓
Kubernetes Deployment
```

Security tools planned for the project:

* SonarQube
* Trivy
* OWASP ZAP

Secrets should not be stored directly in Git repositories.

AWS:

```text
AWS Secrets Manager
```

Azure:

```text
Azure Key Vault
```

---

# ☸️ Kubernetes

The application will be deployed to Kubernetes.

### Frontend

```text
Deployment
    ↓
Frontend Pods
    ↓
Service
```

### Backend

```text
Deployment
    ↓
Backend Pods
    ↓
Service
```

### External Traffic

```text
Internet
    ↓
Load Balancer / Ingress
    ↓
Frontend
    ↓
Backend
```

The production database will be a managed cloud PostgreSQL service rather than a PostgreSQL pod inside the application cluster.

---

# 🏗️ Infrastructure as Code

Terraform will be used to provision cloud infrastructure.

### AWS

```text
terraform/aws/
```

Planned infrastructure:

* VPC
* Subnets
* Security configuration
* ECR
* EKS
* RDS

### Azure

```text
terraform/azure/
```

Planned infrastructure:

* Resource Group
* VNet
* Subnets
* NSG
* ACR
* AKS
* PostgreSQL

---

# 📊 Monitoring

Application and infrastructure monitoring will be implemented using:

### Kubernetes Monitoring

* Prometheus
* Grafana

### Logging

* Loki

### AWS

* CloudWatch

### Azure

* Azure Monitor
* Log Analytics

The objective is to monitor:

* Application health
* CPU and memory
* Pod status
* Deployment status
* API availability
* Application errors
* Infrastructure metrics

---

# 🔁 CI/CD Strategy

## AWS Pipeline

```text
Developer
   ↓
GitHub
   ↓
Jenkins
   ↓
Maven Build
   ↓
Unit Test
   ↓
SonarQube
   ↓
Docker Build
   ↓
Trivy Scan
   ↓
ECR
   ↓
EKS
   ↓
Application
```

## Azure Pipeline

```text
Developer
   ↓
Azure Repos
   ↓
Azure Pipelines
   ↓
Maven Build
   ↓
Unit Test
   ↓
Security Scan
   ↓
Docker Build
   ↓
ACR
   ↓
AKS
   ↓
Application
```

---

# 🔄 Deployment Strategies

The project can be extended to demonstrate:

* Rolling deployment
* Blue-Green deployment
* Canary deployment
* Rollback

Kubernetes deployment history will be used to demonstrate application rollback.

---

# 🧪 Local Development

The application can be tested locally before cloud deployment.

### Backend

```text
Spring Boot
localhost:8080
```

### Database

```text
PostgreSQL
localhost:5432
```

### Frontend

The Angular application will run locally using the Angular development server.

---

# 🐳 Local Docker Environment

The project will use Docker Compose for local multi-container testing.

Planned architecture:

```text
Docker Compose
│
├── Frontend
│
├── Backend
│
└── PostgreSQL
```

---

# 🌍 Same Application – Two Clouds

One of the main objectives of this project is to demonstrate that the **same application source code** can be deployed on different cloud platforms.

```text
                 Same Application
                       │
             ┌─────────┴─────────┐
             │                   │
            AWS                Azure
             │                   │
            EKS                 AKS
             │                   │
            ECR                 ACR
             │                   │
            RDS             Azure PostgreSQL
```

The application code remains the same while the cloud infrastructure and CI/CD implementation differ.

---

# 🎓 DevOps Learning Outcomes

This project provides practical experience with:

### Source Control

* Git
* GitHub
* Azure Repos
* Branching
* Pull Requests

### CI/CD

* Jenkins
* Azure Pipelines
* Build automation
* Deployment automation

### Containers

* Docker
* Dockerfiles
* Docker Compose
* Container registries

### Kubernetes

* Pods
* Deployments
* Services
* Ingress
* ConfigMaps
* Secrets
* Rolling deployments
* Rollbacks

### Infrastructure

* Terraform
* AWS infrastructure
* Azure infrastructure

### Security

* SonarQube
* Trivy
* OWASP ZAP
* Secrets management

### Observability

* Prometheus
* Grafana
* Loki
* CloudWatch
* Azure Monitor

---

# 🚀 Project Roadmap

```text
Phase 1
Application Development
        ↓
Frontend + Backend + Database
        ↓
Phase 2
GitHub Repository
        ↓
Phase 3
Docker
        ↓
Phase 4
Docker Compose
        ↓
Phase 5
Kubernetes
        ↓
Phase 6
AWS Deployment
        ↓
ECR + EKS + RDS
        ↓
Phase 7
Azure Deployment
        ↓
ACR + AKS + PostgreSQL
        ↓
Phase 8
CI/CD
        ↓
Jenkins + Azure Pipelines
        ↓
Phase 9
Terraform
        ↓
AWS + Azure Infrastructure
        ↓
Phase 10
DevSecOps + Monitoring
```

---

# 👨‍💻 Project Purpose

This project is created as a practical **AWS DevOps and Azure DevOps learning project** by VELGURU Tech.

The application is intentionally kept simple so learners can concentrate on the complete DevOps lifecycle:

```text
Learn
   ↓
Practice
   ↓
Automate
   ↓
Deploy
   ↓
Monitor
   ↓
Troubleshoot
   ↓
Improve
```

---

# 🏷️ VELGURU Tech

### AWS DevOps • Azure DevOps • Cloud • Linux • DevSecOps

**Learn • Practice • Troubleshoot • Build • Deploy**

Designed for:

* Freshers
* Working Professionals
* Software Engineers
* Career Switchers

---

## License

This project is intended for educational and training purposes.
