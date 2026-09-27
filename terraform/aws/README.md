# VELGURU Tech — AWS DevOps Infrastructure

**AWS DevOps • Azure DevOps • Cloud • Linux • DevSecOps**

> **Learn • Practice • Troubleshoot • Build • Deploy**

---

# 🚀 AWS Infrastructure Automation with Terraform

This project provisions the AWS infrastructure required for the **VELGURU Tech DevOps CI/CD platform** using **Terraform**.

The infrastructure is designed as an enterprise-style DevOps foundation for hosting Jenkins and supporting future services such as:

* Amazon ECR
* Amazon EKS
* Amazon RDS PostgreSQL
* AWS Secrets Manager
* CloudWatch
* CI/CD pipelines
* Container security
* Kubernetes deployments

The infrastructure is created using **Infrastructure as Code (IaC)** so that the environment is repeatable, version-controlled, reviewable and maintainable.

---

# 📌 Project Objective

The objective of this project is to build a real AWS DevOps environment where infrastructure is provisioned through Terraform instead of manually creating resources through the AWS Console.

The current infrastructure provides:

```text
                         AWS
                          │
                          ▼
                  ┌───────────────┐
                  │  VELGURU VPC  │
                  │ 10.0.0.0/16   │
                  └───────┬───────┘
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
       PUBLIC SUBNETS            PRIVATE SUBNETS
       ┌─────────────┐           ┌─────────────┐
       │ Public AZ-1 │           │ Private AZ-1 │
       │ 10.0.1.0/24 │           │10.0.11.0/24  │
       └──────┬──────┘           └──────┬──────┘
              │                         │
              │                    NAT Gateway
              │                         │
              ▼                         │
        Jenkins EC2 ◄──────────────────┘
        t3.medium

              │
              ▼
        CI/CD Platform
              │
              ├── Maven
              ├── Docker
              ├── Trivy
              └── Jenkins
```

---

# 🏗️ Current Architecture

```text
Developer
    │
    ▼
GitHub
    │
    ▼
Jenkins EC2
    │
    ├── Java 21
    ├── Java 17
    ├── Maven
    ├── Docker
    ├── Docker Compose
    └── Trivy
    │
    ▼
Future CI/CD
    │
    ├── Build
    ├── Unit Test
    ├── SonarQube
    ├── Security Scan
    ├── Docker Build
    ├── ECR Push
    └── EKS Deployment
```

---

# ☁️ AWS Region

The project uses:

```text
Region: ap-south-2
```

The region was explicitly verified before provisioning the infrastructure.

The region is configured through Terraform:

```hcl
variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "ap-south-2"
}
```

---

# 📁 Project Structure

```text
velguru-aws-infrastructure/
│
└── terraform/
    │
    ├── main.tf
    ├── providers.tf
    ├── versions.tf
    ├── variables.tf
    │
    ├── jenkins-ec2.tf
    ├── jenkins-security-group.tf
    ├── jenkins-variables.tf
    │
    ├── modules/
    │   └── vpc/
    │       ├── main.tf
    │       ├── variables.tf
    │       └── outputs.tf
    │
    ├── .terraform/
    ├── .terraform.lock.hcl
    ├── terraform.tfstate
    ├── terraform.tfstate.backup
    └── velguru-infrastructure.tfplan
```

> `.terraform/`, Terraform state files and generated plan files should normally be excluded from Git and managed according to the team's Terraform state strategy.

---

# 📄 Terraform File Responsibilities

## 1. `versions.tf`

Defines Terraform and AWS provider requirements.

```hcl
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}
```

Current provider initialized:

```text
AWS Provider: 6.66.0
```

---

# 2. `providers.tf`

Configures the AWS provider.

```hcl
provider "aws" {
  region = var.aws_region
}
```

The provider gets the region from Terraform variables.

---

# 3. `variables.tf`

Defines the main infrastructure variables.

```hcl
variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "ap-south-2"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "velguru"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)

  default = [
    "10.0.1.0/24",
    "10.0.2.0/24"
  ]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)

  default = [
    "10.0.11.0/24",
    "10.0.12.0/24"
  ]
}
```

---

# 4. `main.tf`

The root Terraform configuration calls the reusable VPC module.

```hcl
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr             = var.vpc_cidr
  environment          = var.environment
  project              = var.project
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}
```

This keeps the root configuration clean and allows the VPC implementation to remain reusable.

---

# 🌐 VPC Module

Location:

```text
modules/vpc/
```

Files:

```text
modules/vpc/
├── main.tf
├── variables.tf
└── outputs.tf
```

---

# 5. `modules/vpc/variables.tf`

Defines inputs required by the VPC module.

Typical inputs include:

```text
vpc_cidr
environment
project
public_subnet_cidrs
private_subnet_cidrs
```

This makes the VPC module independent from hard-coded project values.

---

# 6. `modules/vpc/main.tf`

The VPC module provisions:

```text
VPC
│
├── Internet Gateway
│
├── Public Subnet 1
├── Public Subnet 2
│
├── Private Subnet 1
├── Private Subnet 2
│
├── Public Route Table
│
├── Private Route Table
│
├── Elastic IP
│
└── NAT Gateway
```

### Network CIDR

```text
VPC
10.0.0.0/16
```

### Public Subnets

```text
10.0.1.0/24
10.0.2.0/24
```

### Private Subnets

```text
10.0.11.0/24
10.0.12.0/24
```

---

# 🌍 Public Network

The public subnets use an Internet Gateway.

```text
Internet
   │
   ▼
Internet Gateway
   │
   ▼
Public Route Table
   │
   ├── Public Subnet 1
   └── Public Subnet 2
```

Public subnets automatically assign public IPv4 addresses to instances launched into them.

---

# 🔒 Private Network

Private subnets do not directly use the Internet Gateway for outbound Internet access.

Instead:

```text
Private Subnet
      │
      ▼
Private Route Table
      │
      ▼
NAT Gateway
      │
      ▼
Internet Gateway
      │
      ▼
Internet
```

This allows private resources to access the Internet for outbound operations without assigning public IP addresses directly to those resources.

---

# 🌐 NAT Gateway

The environment currently uses:

```text
1 × NAT Gateway
1 × Elastic IP
```

The NAT Gateway is deployed in a public subnet.

Private subnet traffic is routed through the NAT Gateway.

> **Cost consideration:** NAT Gateway is a billable AWS service and should be destroyed when the environment is no longer required for practice.

---

# 7. `modules/vpc/outputs.tf`

The VPC module exposes important infrastructure information to the root Terraform configuration.

Examples:

```text
VPC ID
Public subnet IDs
Private subnet IDs
```

These outputs can later be consumed by:

```text
Jenkins
EKS
RDS
Load Balancers
Security Groups
```

---

# 🧑‍💻 Jenkins Infrastructure

Jenkins is currently deployed on:

```text
EC2
Ubuntu 24.04
t3.medium
30 GB gp3
```

The instance is placed in a public subnet because Jenkins currently requires direct administrative and web access.

---

# 8. `jenkins-variables.tf`

Defines Jenkins-specific configuration.

```hcl
variable "jenkins_instance_type" {
  description = "EC2 instance type for Jenkins"
  type        = string
  default     = "t3.medium"
}

variable "jenkins_key_name" {
  description = "Existing EC2 key pair name for Jenkins"
  type        = string
  default     = "hotfixdevops"
}

variable "jenkins_ssh_cidr" {
  description = "CIDR allowed to access Jenkins EC2 through SSH"
  type        = string
  default     = "<ADMIN_PUBLIC_IP>/32"
}

variable "jenkins_http_cidr" {
  description = "CIDR allowed to access Jenkins web UI"
  type        = string
  default     = "0.0.0.0/0"
}

variable "jenkins_root_volume_size" {
  description = "Jenkins EC2 root EBS volume size in GB"
  type        = number
  default     = 30
}
```

> The SSH CIDR is restricted to the administrator's current public IP using `/32` rather than opening SSH to the entire Internet.

---

# 9. `jenkins-security-group.tf`

The Jenkins security group controls inbound and outbound network traffic.

### SSH

```text
Port: 22
Protocol: TCP
Source: Administrator IP /32
```

### Jenkins

```text
Port: 8080
Protocol: TCP
Source: 0.0.0.0/0
```

### Outbound

```text
All outbound traffic allowed
```

For a production environment, Jenkins access should preferably be further protected using mechanisms such as:

* VPN
* Private access
* Bastion
* Load balancer
* Identity-aware access
* Restricted source networks

---

# 10. `jenkins-ec2.tf`

Creates the Jenkins EC2 instance.

Configuration:

```text
AMI:
Ubuntu 24.04 AMD64

Instance:
t3.medium

Root Volume:
30 GB gp3

Encryption:
Enabled

Key Pair:
hotfixdevops

Subnet:
Public subnet

Public IP:
Enabled
```

The instance is tagged:

```text
Name        = velguru-jenkins
Environment = dev
Project     = velguru
Service     = jenkins
```

---

# 🔑 EC2 Key Pair Management

During infrastructure preparation, the existing EC2 key pair was found in another AWS region.

The key pair existed in:

```text
ap-south-1
```

but was not present in:

```text
ap-south-2
```

Because EC2 key pairs are region-specific, the key needed to be imported into the target region.

The existing private key remained local.

A public key was derived locally:

```bash
ssh-keygen -y \
  -f ~/.ssh/hotfixdevops.pem \
  > ~/.ssh/hotfixdevops.pub
```

Only the public key was imported into the target AWS region.

This resulted in:

```text
Key Name: hotfixdevops
Region:   ap-south-2
```

The private key was never uploaded.

---

# 🚀 Jenkins Bootstrap

The EC2 instance uses Terraform `user_data` to automatically install and configure the DevOps toolchain.

The bootstrap process installs:

```text
Ubuntu
   │
   ├── Git
   ├── Java 17
   ├── Java 21
   ├── Maven
   ├── Docker
   ├── Docker Compose
   ├── Trivy
   └── Jenkins
```

---

# ☕ Java Configuration

The Jenkins controller runs using Java 21.

Java 17 is also installed for applications that require Java 17.

Current configuration:

```text
Default Java
Java 21

Jenkins Runtime
Java 21

Application Build JDK
Java 17 available
```

The system environment includes:

```text
JAVA_17_HOME
JAVA_21_HOME
JAVA_HOME
```

---

# 🧰 Maven

Maven is installed for Java application builds.

Current version:

```text
Apache Maven 3.8.7
```

Maven works with Java 21:

```text
Maven → Java 21
```

and can also explicitly run with Java 17:

```bash
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH \
mvn -version
```

This is useful for Spring Boot applications that target Java 17.

---

# 🐳 Docker

Docker is installed on the Jenkins server.

Current version:

```text
Docker 29.8.1
```

Docker Compose:

```text
Docker Compose 5.5.1
```

Jenkins was added to the Docker group:

```bash
usermod -aG docker jenkins
```

Docker access was verified using:

```bash
sudo -u jenkins docker ps
```

The command completed successfully without a permission error.

This confirms that Jenkins can communicate with the Docker daemon.

---

# 🔐 Trivy

Trivy is installed for container and filesystem security scanning.

Current version:

```text
Trivy 0.74.0
```

Future CI/CD pipelines can use Trivy to scan:

```text
Docker images
Filesystem
Dependencies
Configuration
Infrastructure
```

Example future pipeline stage:

```text
Build Docker Image
        │
        ▼
Trivy Scan
        │
   ┌────┴────┐
   │         │
 PASS       FAIL
   │         │
   ▼         X
 Push ECR
```

---

# 🔧 Jenkins Service

Jenkins is enabled as a system service:

```bash
sudo systemctl status jenkins
```

Current state:

```text
Active: active (running)
```

Jenkins is running using:

```text
Java 21
```

The service is configured to start automatically after server reboot.

---

# 📊 Infrastructure Provisioning Workflow

The Terraform deployment followed the standard workflow:

```text
1. Create Terraform project
          │
          ▼
2. Configure provider
          │
          ▼
3. Configure variables
          │
          ▼
4. Create reusable VPC module
          │
          ▼
5. Configure Jenkins EC2
          │
          ▼
6. Configure Security Group
          │
          ▼
7. terraform fmt
          │
          ▼
8. terraform init
          │
          ▼
9. terraform validate
          │
          ▼
10. terraform plan
          │
          ▼
11. Save Terraform plan
          │
          ▼
12. terraform apply
          │
          ▼
13. Verify AWS resources
          │
          ▼
14. SSH into Jenkins
          │
          ▼
15. Verify DevOps tools
```

---

# 🧪 Terraform Validation

Terraform formatting was checked using:

```bash
terraform fmt -check
```

Terraform initialization:

```bash
terraform init
```

Terraform validation:

```bash
terraform validate
```

Expected result:

```text
Success! The configuration is valid.
```

---

# 📋 Terraform Plan

Before creating AWS infrastructure:

```bash
terraform plan
```

The reviewed plan showed:

```text
Plan: 16 to add, 0 to change, 0 to destroy.
```

The plan was then saved:

```bash
terraform plan -out=velguru-infrastructure.tfplan
```

This creates a reviewed execution plan.

---

# 🚀 Terraform Apply

The saved plan was applied using:

```bash
terraform apply "velguru-infrastructure.tfplan"
```

Final result:

```text
Apply complete! Resources:
16 added,
0 changed,
0 destroyed.
```

---

# 🔍 Terraform State

Terraform state was verified using:

```bash
terraform state list
```

The state tracks resources including:

```text
aws_instance.jenkins
aws_security_group.jenkins

module.vpc.aws_vpc.this
module.vpc.aws_subnet.public
module.vpc.aws_subnet.private
module.vpc.aws_internet_gateway.this
module.vpc.aws_nat_gateway.this
module.vpc.aws_eip.nat
module.vpc.aws_route_table.public
module.vpc.aws_route_table.private
```

Data sources are also represented in Terraform state.

---

# 🖥️ Jenkins EC2 Verification

The Jenkins EC2 instance was successfully created and entered the running state.

Configuration:

```text
Instance Type : t3.medium
OS            : Ubuntu 24.04
Region        : ap-south-2
AZ            : ap-south-2a
Key Pair      : hotfixdevops
```

EC2 health checks:

```text
Instance State : running
Instance Status: ok
System Status  : ok
```

---

# 🔐 SSH Verification

SSH access was successfully tested using:

```bash
ssh -i ~/.ssh/hotfixdevops.pem ubuntu@<JENKINS_PUBLIC_IP>
```

The server returned:

```text
Welcome to Ubuntu 24.04
```

This confirmed:

```text
Terraform
   │
   ▼
EC2
   │
   ▼
Network
   │
   ▼
Security Group
   │
   ▼
SSH
   │
   ▼
Administrator
```

---

# 🧪 Jenkins Server Validation

The following components were validated directly on the EC2 server.

### Jenkins

```bash
sudo systemctl status jenkins
```

Result:

```text
active (running)
```

### Java 21

```bash
java -version
```

Result:

```text
OpenJDK 21
```

### Java 17

```bash
/usr/lib/jvm/java-17-openjdk-amd64/bin/java -version
```

Result:

```text
OpenJDK 17
```

### Maven

```bash
mvn -version
```

Result:

```text
Apache Maven 3.8.7
```

### Docker

```bash
docker --version
```

Result:

```text
Docker 29.8.1
```

### Docker Compose

```bash
docker compose version
```

Result:

```text
Docker Compose 5.5.1
```

### Trivy

```bash
trivy --version
```

Result:

```text
Trivy 0.74.0
```

### Jenkins Docker Permission

```bash
sudo -u jenkins docker ps
```

Result:

```text
CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES
```

No Docker permission error was observed.

---

# 🧱 Current AWS Resources

```text
16 AWS infrastructure resources
        │
        ├── 1 VPC
        ├── 4 Subnets
        ├── 1 Internet Gateway
        ├── 1 NAT Gateway
        ├── 1 Elastic IP
        ├── 2 Route Tables
        ├── 4 Route Associations
        ├── 1 Jenkins Security Group
        └── 1 Jenkins EC2
```

---

# 🔮 Future Infrastructure

The current Terraform foundation will be extended with:

```text
AWS
│
├── VPC
│
├── Jenkins EC2
│
├── ECR
│
├── EKS
│
├── RDS PostgreSQL
│
├── Secrets Manager
│
├── CloudWatch
│
└── IAM
```

---

# 🔄 Future CI/CD Architecture

```text
Developer
    │
    ▼
GitHub
    │
    ▼
Jenkins
    │
    ├── Checkout
    │
    ├── Maven Build
    │
    ├── Unit Tests
    │
    ├── SonarQube
    │
    ├── Docker Build
    │
    ├── Trivy Scan
    │
    ├── ECR Push
    │
    └── EKS Deploy
             │
             ▼
        Kubernetes
             │
             ▼
        Spring Boot
             │
             ▼
        PostgreSQL RDS
```

---

# 🔐 Security Considerations

The current environment is designed for DevOps learning and project implementation.

For production, additional controls should be implemented.

Recommended improvements:

```text
✔ Use IAM roles instead of long-lived root credentials
✔ Store Terraform state remotely
✔ Enable state locking
✔ Restrict Jenkins access
✔ Use HTTPS
✔ Store application secrets in Secrets Manager
✔ Use IAM roles for EC2
✔ Use least-privilege IAM policies
✔ Add ECR image scanning
✔ Add Trivy security gates
✔ Add SonarQube quality gates
✔ Use private subnets for production workloads
✔ Enable CloudWatch monitoring
✔ Implement backup and disaster recovery
✔ Use multiple NAT Gateways for high availability where required
```

---

# 💰 AWS Cost Considerations

The environment contains resources that can generate AWS charges.

Important resources include:

```text
EC2
NAT Gateway
Elastic IP
EBS
Data Transfer
Future EKS
Future RDS
```

The NAT Gateway is particularly important to monitor because it can generate ongoing charges even when application workloads are minimal.

For temporary DevOps practice environments:

```bash
terraform destroy
```

can be used after confirming that the infrastructure is no longer required.

> Always review `terraform plan` before destroying infrastructure.

---

# 🧹 Destroy Infrastructure

When the environment is no longer required:

```bash
terraform plan -destroy
```

Review the plan carefully.

Then:

```bash
terraform destroy
```

Terraform will remove resources managed by the current state.

---

# 🛠️ Useful Terraform Commands

### Format

```bash
terraform fmt
```

### Initialize

```bash
terraform init
```

### Validate

```bash
terraform validate
```

### Plan

```bash
terraform plan
```

### Save Plan

```bash
terraform plan -out=velguru-infrastructure.tfplan
```

### Apply Saved Plan

```bash
terraform apply "velguru-infrastructure.tfplan"
```

### Show State

```bash
terraform state list
```

### Show Resource

```bash
terraform state show aws_instance.jenkins
```

### Show Outputs

```bash
terraform output
```

### Destroy

```bash
terraform destroy
```

---

# 🧯 Troubleshooting

## Terraform says key pair does not exist

Example:

```text
InvalidKeyPair.NotFound
```

Check the target region:

```bash
aws ec2 describe-key-pairs \
  --region ap-south-2 \
  --key-names hotfixdevops
```

Remember:

> EC2 key pairs are region-specific.

If the private key already exists locally, derive its public key:

```bash
ssh-keygen -y \
  -f ~/.ssh/hotfixdevops.pem \
  > ~/.ssh/hotfixdevops.pub
```

Import the public key:

```bash
aws ec2 import-key-pair \
  --region ap-south-2 \
  --key-name hotfixdevops \
  --public-key-material fileb://$HOME/.ssh/hotfixdevops.pub
```

Never expose the private key.

---

# 🧯 Jenkins Not Running

Check:

```bash
sudo systemctl status jenkins
```

Check logs:

```bash
sudo journalctl -u jenkins -n 100 --no-pager
```

Check bootstrap log:

```bash
sudo cat /var/log/velguru-user-data.log
```

---

# 🧯 Docker Permission Error

Check:

```bash
groups jenkins
```

The Jenkins user should belong to:

```text
docker
```

Test:

```bash
sudo -u jenkins docker ps
```

---

# 🧯 Jenkins Web Access

Jenkins normally listens on:

```text
8080
```

Check:

```bash
sudo ss -lntp | grep 8080
```

Check the service:

```bash
sudo systemctl status jenkins
```

Check the AWS Security Group and ensure TCP 8080 is allowed according to the intended access policy.

---

# 📚 DevOps Concepts Demonstrated

This project demonstrates practical experience with:

```text
Infrastructure as Code
Terraform
AWS VPC
CIDR
Public Subnets
Private Subnets
Internet Gateway
NAT Gateway
Route Tables
Elastic IP
Security Groups
EC2
SSH
Linux
Java
Maven
Docker
Docker Compose
Trivy
Jenkins
CI/CD Architecture
Infrastructure Validation
Terraform State
Terraform Plan
Terraform Apply
Cloud Security
DevSecOps
```

---

# 🎯 Project Status

## Phase 1 — Application Foundation

```text
Angular Frontend          ✅
Spring Boot Backend       ✅
PostgreSQL                ✅
Docker                    ✅
Docker Compose            ✅
Nginx                     ✅
Git/GitHub                ✅
Branching/PR Workflow     ✅
```

## Phase 2 — AWS Infrastructure

```text
AWS Authentication        ✅
AWS Region Verification   ✅
Terraform Project         ✅
VPC                       ✅
Public Subnets            ✅
Private Subnets           ✅
Internet Gateway          ✅
NAT Gateway               ✅
Route Tables              ✅
Jenkins Security Group    ✅
Jenkins EC2               ✅
SSH Access                ✅
Java 17                   ✅
Java 21                   ✅
Maven                     ✅
Docker                    ✅
Docker Compose            ✅
Trivy                     ✅
Jenkins                   ✅
```

## Phase 3 — CI/CD

```text
Jenkins Pipeline          🔄
GitHub Webhook            🔄
Maven Build               🔄
Unit Testing              🔄
SonarQube                 🔄
Docker Build              🔄
Trivy Security Gate       🔄
ECR                       🔄
```

## Phase 4 — Kubernetes

```text
EKS                       🔜
Deployment                🔜
Service                   🔜
Ingress                   🔜
ConfigMap                 🔜
Secrets                   🔜
HPA                       🔜
Rolling Deployment        🔜
Rollback                  🔜
```

## Phase 5 — Database & Operations

```text
RDS PostgreSQL            🔜
Secrets Manager           🔜
CloudWatch                🔜
Prometheus                🔜
Grafana                   🔜
Loki                      🔜
Alerting                  🔜
```

---

# 👨‍💻 Real-Time DevOps Project Narrative

The VELGURU Tech platform is being developed as a practical three-tier application and AWS DevOps implementation.

The infrastructure is provisioned using Terraform.

The environment contains a custom VPC with public and private subnets, Internet Gateway, NAT Gateway, route tables and security controls.

A Jenkins EC2 server is provisioned automatically through Terraform user data.

The Jenkins server contains the required DevOps toolchain including Java 17, Java 21, Maven, Docker, Docker Compose and Trivy.

The infrastructure was validated using Terraform formatting, initialization, validation and planning before applying the reviewed Terraform plan.

After deployment, EC2 health checks and SSH connectivity were verified.

Jenkins was then validated as a running system service, and its ability to communicate with Docker was verified using the Jenkins operating-system user.

The next phase is to integrate GitHub with Jenkins and build the complete CI/CD pipeline for the VELGURU Tech application.

---

# 💼 Interview Explanation

A concise interview explanation:

> "I created the AWS infrastructure for the VELGURU Tech application using Terraform. I designed a VPC with public and private subnets, Internet Gateway, NAT Gateway, route tables and security controls. I then provisioned a Jenkins EC2 instance using Terraform and automated the installation of Java 17, Java 21, Maven, Docker, Docker Compose and Trivy through user data. I validated the Terraform configuration using fmt, init, validate and plan before applying the infrastructure. After deployment, I verified EC2 health, SSH connectivity, Jenkins service status and Jenkins-to-Docker communication. The next stage is integrating GitHub with Jenkins and implementing the complete CI/CD pipeline."

---

# 🏷️ VELGURU Tech

**AWS DevOps • Azure DevOps • Cloud • Linux • DevSecOps**

### Learn • Practice • Troubleshoot • Build • Deploy

**Project:** VELGURU Tech DevOps Platform

**Infrastructure:** Terraform + AWS

**CI/CD:** Jenkins

**Containers:** Docker

**Security:** Trivy

**Application:** Angular + Spring Boot + PostgreSQL

**Kubernetes:** Amazon EKS — Planned

---

## ⭐ Project Philosophy

This project follows a practical DevOps approach:

```text
Learn
  ↓
Practice
  ↓
Build
  ↓
Automate
  ↓
Troubleshoot
  ↓
Secure
  ↓
Deploy
  ↓
Monitor
```

The goal is not simply to provision AWS resources, but to build a complete, reproducible and interview-ready DevOps implementation based on real infrastructure, automation, troubleshooting and deployment practices.
