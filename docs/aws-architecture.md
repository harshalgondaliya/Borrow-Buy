# BorrowBuy – Cloud Architecture & System Design Document

**Target Region**: `ap-south-1` (Asia Pacific – Mumbai)  
**System Architecture**: Multi-Tier Decoupled Web Application with Serverless Messaging  
**Deployment Tier**: Student Budget Optimized (Zero-ALB, Zero-NAT Gateway Baseline)  
**Project**: BorrowBuy – Product Rental and Management Platform  
**Academic Target**: Production-Grade Cloud Hosting & AWS Service Demonstration  

---

## 1. High-Level Architecture Overview

BorrowBuy's cloud architecture decouples client-facing static presentation from dynamic transactional compute and asynchronous event processing. The architecture is explicitly engineered to minimize recurring student costs while maximizing security, observability, and modularity.

```mermaid
flowchart TD
    subgraph Users["End Users & Gujarat Renters"]
        Browser["Desktop & Mobile Web Browsers"]
    end

    subgraph Edge["Global Edge Tier (AWS Free Tier)"]
        CF["Amazon CloudFront CDN (HTTPS Distribution)"]
        WAF["AWS WAF (Rate Limiting & Geo-Filtering)"]
    end

    subgraph Storage["Storage & Static Hosting Tier"]
        S3Frontend["S3 Static Website Bucket (borrowbuy-frontend-dist)"]
        S3Uploads["S3 Private Upload Bucket (borrowbuy-user-uploads)"]
    end

    subgraph Compute["Compute & Backend Tier (ap-south-1 Mumbai)"]
        subgraph VPC["VPC (10.0.0.0/16) - Public Subnet (10.0.1.0/24)"]
            EC2["Amazon EC2 Host (t3.micro / t4g.small)"]
            subgraph DockerCompose["Docker Compose Container Sandbox"]
                NginxProxy["Nginx Reverse Proxy (:80/:443)"]
                API["Express REST API (:5000)"]
                DB["PostgreSQL 16 Engine (:5432)"]
            end
        end
    end

    subgraph Serverless["Asynchronous Messaging & Event Bus (Always Free Tier)"]
        SQS["Amazon SQS Event Queue (borrowbuy-events)"]
        DLQ["Amazon SQS Dead-Letter Queue (borrowbuy-events-dlq)"]
        SNS["Amazon SNS Notification Topic (borrowbuy-notifications)"]
        EventBridge["Amazon EventBridge (Scheduled Sweepers & Cron Triggers)"]
    end

    subgraph Observability["Observability, Security & Cost Governance"]
        CW["Amazon CloudWatch (Logs, Alarms & Metrics)"]
        Budgets["AWS Budgets ($5.00 USD Spending Cap)"]
        SSM["AWS Systems Manager (Session Manager - No Open SSH)"]
        IAM["IAM Least-Privilege Execution Roles"]
    end

    %% Connections
    Browser -->|HTTPS :443| CF
    CF -->|Origin: SPA Index| S3Frontend
    CF -->|Origin: API Proxy| NginxProxy
    NginxProxy -->|Internal Proxy| API
    API -->|TCP Pool| DB
    API -->|Pre-Signed URLs| S3Uploads
    API -->|Dispatches Events| SQS
    SQS -->|Redrive on Failure| DLQ
    API -->|Broadcasts Alerts| SNS
    EventBridge -->|Cron Invocations| API
    EC2 -.->|Pushes Metrics & Logs| CW
    Budgets -.->|Email Alerts ($2.50 / $4.00 / $5.00)| Users
    SSM -.->|Secure Terminal Access| EC2
```

---

## 2. Component Breakdown

### A. Edge & Delivery Tier
- **Amazon CloudFront**: Acts as the global HTTPS entrypoint. Automatically terminates SSL/TLS using AWS Certificate Manager (ACM). Delivers compiled frontend assets, WebP images, and routes `/api/*` traffic transparently to the backend.
- **Amazon S3 (Frontend)**: Stores the Vite-compiled static bundle (`index.html`, minified CSS/JS). Public access is completely blocked using S3 Origin Access Control (OAC), ensuring all traffic flows through CloudFront.

### B. Compute Tier (Docker Compose on EC2)
- **Host**: Single `t3.micro` (or `t4g.small`) instance running Amazon Linux 2023.
- **Why Single-Host Docker Compose?**:
  1. Incurs **\$0.00** extra networking charges (no NAT Gateway needed).
  2. Eliminates Application Load Balancer costs (saving **\$16.20/month**).
  3. Colocates PostgreSQL with persistent EBS volume mount, eliminating Managed RDS baseline fees (saving **\$15.50/month**).
- **Nginx Reverse Proxy**: Receives incoming requests on port 80/443, handles Gzip compression, injects strict HTTP security headers, and proxies `/api/*` requests to the Node.js container on port 5000.

### C. Persistent Storage Tier
- **Amazon S3 (Uploads Bucket)**: Stores product photos uploaded by equipment owners and inspection photos.
- **Pre-Signed URLs**: The backend generates short-lived (5-minute expiration) pre-signed PUT URLs. Renter/Owner browsers upload directly to S3 without passing heavy binary payloads through the Node.js API server.

### D. Asynchronous Event-Driven Messaging Tier
- **Amazon SQS**: Decouples non-blocking transactional workflows (such as sending booking confirmation emails, updating owner trust scores, and triggering background invoice generation).
- **Dead-Letter Queue (DLQ)**: Retains malformed or repeatedly failed messages up to 14 days for debugging.
- **Amazon SNS**: Broadcasts critical notifications to subscribers (email/SMS/HTTP endpoints).
- **Amazon EventBridge**: Triggers periodic background sweeps (e.g. freeing expired 15-minute temporary reservation holds, detecting overdue rental returns).

### E. Security, Management & Observability
- **AWS Systems Manager (Session Manager)**: Replaces traditional SSH keys. System administrators open interactive shell sessions directly through the AWS Console or `aws ssm start-session`, allowing port 22 to remain completely closed.
- **Amazon CloudWatch**: Gathers container stdout/stderr logs and monitors server CPU, memory, and disk usage.
- **AWS Budgets**: Enforces strict cost guardrails with three alarm thresholds (\$2.50, \$4.00, and \$5.00 forecasted).
