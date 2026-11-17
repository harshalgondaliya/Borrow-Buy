# BorrowBuy – Service Level Agreement (SLA) & Operational Readiness

**Document Status**: Academic Proposed SLA (Realistic Single-Instance Deployment)  
**Project**: BorrowBuy – Product Rental and Management Platform  
**Target Environment**: AWS `ap-south-1` (Mumbai)  
**Author**: Lead Systems Administrator & Site Reliability Specialist  

---

## 1. Scope & System Definition

This Service Level Agreement defines the operational availability, performance benchmarks, incident classification, and recovery targets for the BorrowBuy product rental platform.

> [!IMPORTANT]
> This SLA reflects a **student-funded, cost-controlled single-instance architecture**. It explicitly documents architectural single points of failure rather than making unrealistic enterprise 99.99% availability claims that cannot be achieved without expensive multi-AZ redundant infrastructure.

---

## 2. Service Availability Commitments

| Architecture Component | AWS Infrastructure SLA | BorrowBuy Target Availability | Allowed Monthly Downtime | Single Point of Failure (SPOF)? |
|---|---|---|---|:---:|
| **Frontend UI (CloudFront + S3)** | 99.9% (AWS CDN SLA) | **99.9%** | ~43.8 minutes / month | **No** (Multi-AZ / Global Edge) |
| **Backend REST API (EC2 Host)** | 99.5% (Single EC2 SLA) | **99.0%** | ~7.2 hours / month | **Yes** (Single instance host) |
| **PostgreSQL Relational Database** | N/A (Self-hosted on EC2 EBS) | **99.0%** | ~7.2 hours / month | **Yes** (Single EBS volume) |
| **Product Photos (S3 Private Bucket)** | 99.9% (S3 Standard SLA) | **99.9%** | ~43.8 minutes / month | **No** (Redundant across 3+ AZs) |
| **Messaging & Queues (SQS / SNS)** | 99.9% (AWS Serverless SLA) | **99.9%** | ~43.8 minutes / month | **No** (Managed serverless) |

---

## 3. Incident Severity Levels & Response Targets

| Severity | Definition | Target Response (MTTA) | Target Resolution (MTTR) | Communication Channel |
|:---:|---|:---:|:---:|---|
| **P1 - Critical** | Platform completely inaccessible; users unable to view catalogue or process bookings. | $\le 15$ minutes | $\le 2$ hours | Immediate developer notification & status banner |
| **P2 - Major** | Core feature degraded (e.g. payment simulation failing, S3 uploads failing), but catalogue browsing works. | $\le 45$ minutes | $\le 4$ hours | In-app announcement |
| **P3 - Minor** | Non-critical bug (e.g. notification delay, minor UI rendering glitch on edge viewports). | $\le 4$ hours | $\le 24$ hours | GitHub issue tracker |
| **P4 - Low** | Cosmetic defect or enhancement suggestion. | $\le 24$ hours | Next scheduled sprint | Backlog review |

---

## 4. Recovery Objectives (RTO & RPO)

- **Recovery Point Objective (RPO)**: **24 hours**. Database backups are snapshot daily to Amazon S3. Maximum potential data loss in a catastrophic volume failure is limited to 24 hours of transactions.
- **Recovery Time Objective (RTO)**: **30 minutes**. In the event of an EC2 host termination, a fresh instance can be reprovisioned via `terraform apply` and database restored from the latest S3 backup within 30 minutes.

---

## 5. Architectural Single Points of Failure (SPOF) Disclosures

1. **Single EC2 Host**: In the student budget baseline, API and PostgreSQL containers reside on one EC2 instance. If the AWS hypervisor experiences hardware failure, downtime occurs until the instance is restarted or reprovisioned.
2. **Maintenance Windows**: Software updates requiring Docker restart will incur 10–30 seconds of brief service unavailability. Maintenance is scheduled during low-traffic periods (02:00 – 04:00 IST).
3. **AWS Dependency**: Outages in the AWS `ap-south-1` region itself are beyond the application's control and are governed by the AWS Customer Agreement.
