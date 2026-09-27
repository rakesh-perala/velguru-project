
# VELGURU Tech - Enterprise DevOps Git Workflow

## 1. Overview

VELGURU Tech follows an enterprise-style Git branching and CI/CD workflow.

The objective is to maintain:

- Controlled code changes
- Separate development and production branches
- Pull Request based code review
- Automated CI validation
- Controlled releases
- Kubernetes-based deployment
- Reliable rollback and troubleshooting

## 2. Git Branching Strategy

main
  |
  | Production
  |
develop
  |
  +-- feature/*
  |
  +-- bugfix/*
  |
  +-- hotfix/*

## 3. Main Branch

The `main` branch contains production-ready code.

Developers should not directly push application changes to `main`.

Changes should reach `main` through an approved Pull Request and release process.

Purpose:

- Production-ready code
- Stable release version
- Production deployment source

## 4. Develop Branch

The `develop` branch is the integration branch.

Completed features are merged into `develop` after Pull Request review and CI validation.

Purpose:

- Integrate multiple features
- Run integration testing
- Validate the next release
- Prepare code for release

## 5. Feature Branches

Feature branches are created from `develop`.

Naming convention:

`feature/<description>`

Examples:

- feature/appointment-api
- feature/frontend-ui
- feature/database-validation
- feature/devops-documentation

Development flow:

develop
  |
  ↓
feature/*
  |
  ↓
Development
  |
  ↓
Local Testing
  |
  ↓
Commit
  |
  ↓
Push
  |
  ↓
Pull Request
  |
  ↓
Code Review
  |
  ↓
CI Validation
  |
  ↓
Merge → develop

## 6. Bugfix Branches

Bugfix branches are used for issues discovered during development or testing.

Naming convention:

`bugfix/<description>`

Examples:

- bugfix/appointment-validation
- bugfix/frontend-api-error
- bugfix/database-connection

Flow:

develop
  |
  ↓
bugfix/*
  |
  ↓
Fix
  |
  ↓
Test
  |
  ↓
Pull Request
  |
  ↓
Code Review
  |
  ↓
CI
  |
  ↓
develop

## 7. Hotfix Branches

Hotfix branches are used for urgent production issues.

Hotfix branches are created from `main`.

Naming convention:

`hotfix/<description>`

Examples:

- hotfix/production-api-failure
- hotfix/security-vulnerability
- hotfix/database-connection

Flow:

main
 |
 ↓
hotfix/*
 |
 ↓
Fix + Test
 |
 ↓
Pull Request
 |
 +------→ main
 |
 +------→ develop

The fix should also be synchronized back to `develop`.

## 8. Release Branches

Release branches are created when features in `develop` are ready for a release.

Naming convention:

`release/<version>`

Examples:

- release/v1.0.0
- release/v1.1.0

Flow:

develop
   |
   ↓
release/v1.0.0
   |
   +-- Final Testing
   +-- Bug Fixes
   +-- Release Validation
   |
   ↓
main

Release changes should also be synchronized back to `develop`.

## 9. Complete Enterprise Git Workflow

Developer
    |
    ↓
GitHub
    |
    ↓
develop
    |
    ↓
feature/*
    |
    ↓
Code Changes
    |
    ↓
Local Testing
    |
    ↓
Git Commit
    |
    ↓
Push Feature Branch
    |
    ↓
Pull Request
    |
    ↓
Code Review
    |
    ↓
CI Validation
    |
    +----------------------+
    |                      |
    ↓                      ↓
  Failed                 Passed
    |                      |
Fix Issues                 ↓
    |                   Approval
    |                      |
    +----------------------+
                           ↓
                      Merge → develop
                           |
                           ↓
                    Integration Testing
                           |
                           ↓
                       release/*
                           |
                           ↓
                          main
                           |
                           ↓
                    Production / EKS

## 10. Pull Request Workflow

Developers should not directly merge feature branches into `main`.

Pull Request flow:

feature/*
    |
    ↓
GitHub Pull Request
    |
    ↓
Code Review
    |
    ↓
CI Pipeline
    |
    ↓
Quality Checks
    |
    ↓
Approval
    |
    ↓
Merge → develop

A Pull Request should contain:

- What was changed
- Why it was changed
- Testing performed
- Related issue or ticket
- Screenshots when required
- Deployment considerations when applicable

## 11. CI Pipeline

The CI pipeline validates source code before it moves forward.

Source Code
    |
    ↓
Checkout
    |
    ↓
Maven Build
    |
    ↓
Unit Tests
    |
    ↓
SonarQube
    |
    ↓
Quality Gate
    |
    ↓
Docker Build
    |
    ↓
Trivy Image Scan
    |
    ↓
Docker Image
    |
    +-------------+
    ↓             ↓
Docker Hub      AWS ECR

The objective is to prevent defective or vulnerable code from moving forward.

## 12. CD Pipeline

The CD pipeline deploys an approved container image to Kubernetes.

Docker Image
     |
     ↓
Container Registry
     |
     ↓
Kubernetes
     |
     ↓
Deployment
     |
     ↓
Service
     |
     ↓
Ingress / Load Balancer
     |
     ↓
Application

The CD process will include:

- Kubernetes manifests
- ConfigMaps
- Secrets
- Readiness probes
- Liveness probes
- Resource limits
- HPA
- Rolling deployments
- Smoke testing
- Rollback

## 13. Kubernetes Deployment

Target Kubernetes architecture:

Internet
   |
   ↓
Load Balancer
   |
   ↓
Ingress
   |
   +-------------------+
   |                   |
   ↓                   ↓
Frontend Service    Backend Service
   |                   |
   ↓                   ↓
Frontend Pods       Backend Pods
                       |
                       ↓
                  PostgreSQL

Kubernetes components:

- Namespace
- Deployment
- Service
- ConfigMap
- Secret
- Ingress
- Liveness Probe
- Readiness Probe
- HPA
- RBAC

## 14. Local Kubernetes Phase

Before moving to AWS and Azure, the complete DevOps workflow will be validated locally.

GitHub
   |
   ↓
Git Branching
   |
   ↓
Pull Request
   |
   ↓
Code Review
   |
   ↓
CI
   |
   ↓
Docker
   |
   ↓
Container Registry
   |
   ↓
Kubernetes
   |
   ↓
Application Testing

## 15. AWS Phase

After completing the local enterprise workflow, the same application will be deployed to AWS.

Target architecture:

                         AWS
                          |
                         EKS
                          |
              +-----------+-----------+
              |                       |
        Frontend Pods            Backend Pods
                                      |
                                      ↓
                              Amazon RDS
                              PostgreSQL

Planned AWS services:

- Amazon VPC
- Public and private subnets
- Internet Gateway
- NAT Gateway
- Route Tables
- Security Groups
- Amazon EKS
- Amazon ECR
- Amazon RDS PostgreSQL
- IAM
- Load Balancer
- CloudWatch

Terraform will be used to provision the AWS infrastructure.

AWS delivery flow:

GitHub
   |
   ↓
CI Pipeline
   |
   ↓
Docker Build
   |
   ↓
Security Scan
   |
   ↓
Amazon ECR
   |
   ↓
Amazon EKS
   |
   ↓
Amazon RDS PostgreSQL

## 16. Azure Phase

After completing the AWS implementation, the same application will be implemented on Azure.

Target architecture:

                        AZURE
                          |
                         AKS
                          |
              +-----------+-----------+
              |                       |
        Frontend Pods            Backend Pods
                                      |
                                      ↓
                           Azure PostgreSQL

Planned Azure services:

- Resource Group
- VNet
- Subnets
- NSG
- AKS
- ACR
- Azure PostgreSQL
- Managed Identity
- Load Balancer
- Azure Monitor
- Log Analytics

Terraform will be used to provision Azure infrastructure.

Azure delivery flow:

GitHub / Azure Repos
        |
        ↓
Azure Pipelines
        |
        ↓
Docker Build
        |
        ↓
Security Scan
        |
        ↓
Azure Container Registry
        |
        ↓
AKS
        |
        ↓
Azure PostgreSQL

## 17. Security and DevSecOps

Security validation will be integrated into the CI/CD lifecycle.

Code
 |
 ↓
SonarQube
 |
 ↓
Code Quality
 |
 ↓
Docker Build
 |
 ↓
Trivy
 |
 ↓
Container Security
 |
 ↓
OWASP
 |
 ↓
Application Security
 |
 ↓
Deployment

Production secrets must not be hard-coded.

AWS:

AWS Secrets Manager

Azure:

Azure Key Vault

## 18. Monitoring and Logging

AWS monitoring:

- CloudWatch
- Prometheus
- Grafana
- Loki

Azure monitoring:

- Azure Monitor
- Log Analytics
- Application Insights
- Prometheus
- Grafana

## 19. Rollback Strategy

New Version
     |
     ↓
Deployment
     |
     ↓
Health Check
     |
     ↓
Failure
     |
     ↓
Rollback
     |
     ↓
Previous Stable Version

Kubernetes rollout history will be used for controlled rollback.

## 20. Commit Message Convention

Use clear and meaningful commit messages.

Examples:

- feat: add appointment validation
- fix: resolve backend database connection
- docs: update Docker documentation
- test: add appointment service tests
- refactor: improve appointment service
- ci: add Jenkins CI pipeline
- cd: add Kubernetes deployment pipeline
- security: add Trivy image scanning

Avoid unclear messages such as:

- update
- changes
- test
- final
- new
- working

## 21. Developer Rules

1. Do not directly push feature changes to `main`.
2. Create feature branches from `develop`.
3. Keep commits small and meaningful.
4. Test changes locally before creating a Pull Request.
5. Create a Pull Request for review.
6. CI must pass before merging.
7. Resolve review comments before merging.
8. Do not commit passwords or secrets.
9. Keep branch names meaningful.
10. Keep production code stable.

## 22. VELGURU Tech DevOps Lifecycle

PLAN
  ↓
CODE
  ↓
PULL REQUEST
  ↓
CODE REVIEW
  ↓
BUILD
  ↓
TEST
  ↓
SONARQUBE
  ↓
SECURITY SCAN
  ↓
DOCKER BUILD
  ↓
IMAGE SCAN
  ↓
DOCKER HUB / ECR / ACR
  ↓
KUBERNETES
  ↓
DEPLOY
  ↓
SMOKE TEST
  ↓
MONITOR
  ↓
ROLLBACK IF REQUIRED

## 23. Final Project Goal

The VELGURU Tech project demonstrates an enterprise-style DevOps implementation using the same application across local, AWS and Azure environments.

Application:

Angular
   ↓
Spring Boot
   ↓
PostgreSQL

Local:

Docker
   ↓
Kubernetes

AWS:

ECR
   ↓
EKS
   ↓
RDS PostgreSQL

Azure:

ACR
   ↓
AKS
   ↓
Azure PostgreSQL

The project demonstrates:

- Git branching strategy
- Pull Requests
- Code reviews
- CI/CD
- Docker
- Docker Compose
- Docker Hub
- Amazon ECR
- Azure ACR
- Kubernetes
- Amazon EKS
- Azure AKS
- Terraform
- SonarQube
- Trivy
- OWASP
- Secrets management
- Monitoring
- Logging
- Deployment strategies
- Rollback
- Real-time troubleshooting

---

# VELGURU Tech

AWS DevOps • Azure DevOps • Cloud • Linux • DevSecOps

Learn • Practice • Troubleshoot • Build • Deploy

