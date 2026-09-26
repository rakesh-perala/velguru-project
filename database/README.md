# VELGURU Tech – Database

## PostgreSQL Database

This directory contains the database-related files for the VELGURU Tech AWS and Azure DevOps project.

The application uses **PostgreSQL** as its relational database.

The database is intentionally kept simple because the main purpose of this project is to demonstrate the complete DevOps lifecycle.

---

# 🗄️ Database Architecture

The application consists of:

```text
Angular Frontend
       ↓
Spring Boot Backend
       ↓
PostgreSQL Database
```

The backend communicates with PostgreSQL using:

```text
Spring Data JPA
       ↓
Hibernate
       ↓
PostgreSQL JDBC Driver
       ↓
PostgreSQL
```

---

# 🛠️ Technology

| Component      | Technology      |
| -------------- | --------------- |
| Database       | PostgreSQL      |
| Local Version  | PostgreSQL 17   |
| Database Name  | velgurudb       |
| Database User  | velguru         |
| Port           | 5432            |
| Backend Access | Spring Data JPA |
| Local Runtime  | Docker          |

---

# 📂 Directory Structure

```text
database/
│
├── schema.sql
├── data.sql
└── README.md
```

---

# 📋 Database Schema

The application currently uses one main table:

```text
appointments
```

### Table Structure

| Column           | Type    | Description           |
| ---------------- | ------- | --------------------- |
| id               | BIGINT  | Unique appointment ID |
| patient_name     | VARCHAR | Patient name          |
| doctor_name      | VARCHAR | Doctor name           |
| appointment_date | DATE    | Appointment date      |
| status           | VARCHAR | Appointment status    |

---

# 🏗️ Appointment Table

Logical structure:

```text
appointments
│
├── id
├── patient_name
├── doctor_name
├── appointment_date
└── status
```

Example record:

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

# 📝 Schema SQL

The database schema is maintained in:

```text
schema.sql
```

Example:

```sql
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL
);
```

---

# 🌱 Sample Data

Sample/test records can be maintained in:

```text
data.sql
```

Example:

```sql
INSERT INTO appointments
    (patient_name, doctor_name, appointment_date, status)
VALUES
    ('Rakesh', 'Dr. Kumar', '2026-09-27', 'BOOKED');
```

---

# 🐳 Local PostgreSQL

For local development, PostgreSQL runs inside a Docker container.

Container name:

```text
velguru-postgres
```

Image:

```text
postgres:17
```

Port:

```text
5432
```

---

# ▶️ Create PostgreSQL Container

Run:

```bash
docker run -d \
  --name velguru-postgres \
  -e POSTGRES_DB=velgurudb \
  -e POSTGRES_USER=velguru \
  -e POSTGRES_PASSWORD=velguru123 \
  -p 5432:5432 \
  postgres:17
```

---

# 🔍 Verify PostgreSQL Container

Check running containers:

```bash
docker ps
```

Expected:

```text
velguru-postgres
```

Check container logs:

```bash
docker logs velguru-postgres
```

The following message confirms that PostgreSQL is ready:

```text
database system is ready to accept connections
```

---

# 🔌 Database Connection Details

For local development:

```text
Host       : localhost
Port       : 5432
Database   : velgurudb
Username   : velguru
Password   : velguru123
```

The Spring Boot backend uses these values through environment variables.

Example:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:velgurudb}
    username: ${DB_USERNAME:velguru}
    password: ${DB_PASSWORD:velguru123}
```

---

# 🔐 Database Credentials

The credentials shown in this README are intended only for the **local development environment**.

Production database credentials must not be committed to Git.

For cloud environments, credentials will be managed securely.

AWS:

```text
AWS Secrets Manager
```

Azure:

```text
Azure Key Vault
```

---

# 🧪 Database Testing

The backend can verify database connectivity through the appointment APIs.

### Get appointments

```bash
curl http://localhost:8080/api/appointments
```

Example:

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

---

# 🔄 Database Request Flow

```text
HTTP Request
     ↓
Angular Frontend
     ↓
Spring Boot REST API
     ↓
Service Layer
     ↓
Spring Data JPA
     ↓
Hibernate
     ↓
PostgreSQL
```

---

# ☁️ AWS Database

For the AWS environment, the local PostgreSQL container will be replaced by:

```text
Amazon RDS for PostgreSQL
```

Architecture:

```text
Angular
   ↓
EKS
   ↓
Spring Boot
   ↓
Amazon RDS
   ↓
PostgreSQL
```

The application code does not need to change.

Only the database connection configuration changes.

Example:

```text
DB_HOST=<RDS-ENDPOINT>
DB_PORT=5432
DB_NAME=velgurudb
DB_USERNAME=<secure-user>
DB_PASSWORD=<secure-password>
```

---

# ☁️ Azure Database

For the Azure environment, the local PostgreSQL container will be replaced by:

```text
Azure Database for PostgreSQL
```

Architecture:

```text
Angular
   ↓
AKS
   ↓
Spring Boot
   ↓
Azure Database for PostgreSQL
```

Example configuration:

```text
DB_HOST=<AZURE-POSTGRES-ENDPOINT>
DB_PORT=5432
DB_NAME=velgurudb
DB_USERNAME=<secure-user>
DB_PASSWORD=<secure-password>
```

---

# 🔁 Same Application – Different Databases

The application source code remains the same.

Only the database environment changes.

```text
                 Spring Boot
                     │
             Environment Variables
                     │
          ┌──────────┴──────────┐
          │                     │
        AWS                   Azure
          │                     │
       RDS PostgreSQL      Azure PostgreSQL
```

This allows the same application to be deployed across multiple cloud platforms.

---

# 🐳 Docker Compose

Later, local development will use Docker Compose to run the application components together.

Planned architecture:

```text
Docker Compose
│
├── Angular Frontend
│
├── Spring Boot Backend
│
└── PostgreSQL
```

The PostgreSQL service will be reachable by the backend using the Docker Compose service name rather than `localhost`.

Example:

```text
backend
   ↓
postgres:5432
```

---

# ☸️ Kubernetes and Database

For cloud deployment, PostgreSQL will **not** run as a normal application pod.

Instead, the application will use managed cloud PostgreSQL.

### AWS

```text
EKS
 │
 └── Spring Boot
          │
          ▼
       Amazon RDS
```

### Azure

```text
AKS
 │
 └── Spring Boot
          │
          ▼
 Azure PostgreSQL
```

Benefits of managed databases include:

* Automated backups
* High availability options
* Monitoring
* Maintenance
* Security controls
* Scaling options

---

# 🔐 Database Security

Production database access should follow these principles:

* Never commit passwords to Git
* Use secrets management
* Restrict database network access
* Do not expose PostgreSQL directly to the public internet
* Allow application workloads to access the database
* Use encrypted connections where required
* Apply least-privilege database permissions
* Use private networking for production databases

---

# 💾 Backup and Recovery

Cloud database environments will use managed backup capabilities.

The DevOps workflow will cover:

* Backup configuration
* Recovery planning
* Database availability
* Disaster recovery considerations

For local development, the database can be recreated using:

```text
schema.sql
+
data.sql
```

---

# 🔧 Troubleshooting

## PostgreSQL container is not running

Check:

```bash
docker ps -a
```

Start the container:

```bash
docker start velguru-postgres
```

---

## Check PostgreSQL logs

```bash
docker logs velguru-postgres
```

Look for:

```text
database system is ready to accept connections
```

---

## Port 5432 already in use

Check:

```bash
sudo lsof -i :5432
```

If another PostgreSQL container is using the port, identify it:

```bash
docker ps -a
```

---

## Backend cannot connect to PostgreSQL

Verify:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USERNAME
DB_PASSWORD
```

Also verify:

```bash
docker ps
```

and:

```bash
docker logs velguru-postgres
```

---

# 🎯 Database Learning Objectives

This database component is designed to demonstrate:

* PostgreSQL
* Relational database concepts
* SQL
* Database schema
* Dockerized databases
* Application-to-database connectivity
* Environment-based configuration
* Database security
* Managed cloud databases
* AWS RDS
* Azure Database for PostgreSQL
* Backup and recovery concepts
* Cloud database migration

---

# 🚀 Future Database Roadmap

```text
Local PostgreSQL
       ↓
Docker PostgreSQL
       ↓
Docker Compose
       ↓
AWS RDS PostgreSQL
       │
       └── OR
       │
       ▼
Azure Database for PostgreSQL
```

---

## VELGURU Tech

### AWS DevOps • Azure DevOps • Cloud • Linux • DevSecOps

**Learn • Practice • Troubleshoot • Build • Deploy**
