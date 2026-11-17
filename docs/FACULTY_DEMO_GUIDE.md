# BorrowBuy – Academic Faculty Demonstration Script & Defense Guide

**Subject:** Cloud Computing Capstone Project Evaluation  
**Project:** BorrowBuy – Enterprise Equipment Rental Platform  
**Target Architecture:** 16-Service AWS Hybrid Cloud (ap-south-1 Mumbai)  
**Estimated Presentation Duration:** 12 – 15 Minutes

---

## 1. Step-by-Step Presentation Script

### Act 1: Introduction & Problem Context (2 Minutes)
- **Opening Statement:** *"Respected faculty members, today we present BorrowBuy, a peer-to-peer and B2C equipment rental platform localized for Gujarat, India. In India, creators, college students, and small contractors frequently need high-value equipment like cinema cameras, MacBook Pros, power tools, and camping gear for short durations. Buying outright is financially prohibitive. BorrowBuy provides a trusted digital marketplace backed by refundable escrow security deposits, single-use cryptographic QR handover passes, and an enterprise AWS cloud architecture."*
- **Highlight Live Application:** Show the clean Midnight Navy & Coral design system, 25 specialized categories, and 116 active equipment listings verified across Gujarat cities.

### Act 2: Architecture & The 16 AWS Services (3 Minutes)
- **Open `/cloud`:** Navigate to the **Cloud Operations Console** (`http://localhost:5000/cloud`).
- **Showcase the 16 Services Matrix:** Point out that all 16 mandatory AWS services are categorized into Foundational, Application, and Advanced Infrastructure tiers.
- **Explain Separation of Concerns:**
  - *Relational ACID Data:* PostgreSQL 16 via Prisma ORM for products, active bookings, user trust scores, and financial balances.
  - *Immutable High-Throughput Stream:* Amazon DynamoDB for rental audit trails (`BorrowBuy-RentalAuditLogs`).
  - *Serverless Burst Compute:* AWS Lambda + Amazon API Gateway for rental quote computations and EventBridge-triggered reservation hold cleanups.
  - *Edge Caching:* Amazon CloudFront CDN + Amazon S3 with Origin Access Control.

### Act 3: Live Interactive Demonstration (5 Minutes)
1. **Explore the Equipment Catalog (`/browse`):**
   - Filter by location (Ahmedabad, Surat, Gandhinagar) and category (Cameras, Laptops, Tools).
   - Show instantaneous client-side updates and smooth pagination across 116 canonical products.
2. **Serverless Lambda Quote Execution (`/cloud`):**
   - In the Serverless Sandbox, enter `Daily Rate: ₹2,800`, `Duration: 7 Days`, `Deposit: ₹15,000`.
   - Click **"Execute Lambda Function"**.
   - Show live response: execution duration (~1.5ms), memory consumption (18MB), 15% volume discount (-₹2,940), 18% GST (₹2,998.80), and escrow deposit breakdown.
3. **Horizontal Auto Scaling Simulation (`/cloud`):**
   - Click **"Simulate Traffic Spike (Test ASG Target Tracking)"**.
   - Explain how Target Tracking monitors average cluster CPU (> 70%) and dynamically scales out instances from 1 &rarr; 2 &rarr; 3 nodes before returning to baseline.
4. **DynamoDB Audit Ledger Stream (`/cloud`):**
   - Expand an audit event JSON payload to show the Primary Key (`RENTAL#<id>`), Sort Key (`EVENT#<timestamp>`), and event payload.
5. **Digital QR Pass Handover (`/bookings`):**
   - Demonstrate the customer booking pass with single-use cryptographic token, pickup validation, and condition verification photos.

### Act 4: FinOps, Security & Conclusion (2 Minutes)
- **Explain Profile A vs Profile B:** How the architecture achieves \$0.00 – \$1.50/mo Free Tier compliance while maintaining enterprise readiness.
- **Show AWS Budgets:** Hard stop at \$5.00 limit.
- **Show Test Pass Rate:** 95/95 automated tests passing (100%).

---

## 2. Natural Language Faculty Q&A Defense Guide

### Q1: "Why do you use both PostgreSQL and DynamoDB instead of just one database?"
> **Defense Answer:**  
> *"That is an architectural decision based on AWS Well-Architected Data Tiering principles. PostgreSQL with Prisma ORM handles our core relational entities—users, products, bookings, reviews—which require ACID transactions, foreign keys, and complex relational filtering (such as price ranges, categories, and date availability overlap checks).  
> However, rental audit logs are immutable, append-only, high-volume event streams (such as reservations created, payments held, QR check-ins, and return inspections). Persisting these high-throughput events into PostgreSQL would bloat relational tables and degrade transactional query performance. Amazon DynamoDB provides single-digit millisecond latency, infinite horizontal scalability, automatic TTL expiration, and $0 idle cost on demand, making it the optimal engine for immutable audit trails."*

### Q2: "How did you ensure you wouldn't get billed unexpectedly while using 16 AWS services?"
> **Defense Answer:**  
> *"We implemented a strict FinOps framework with two distinct profiles:  
> 1. Profile A (Academic Demonstration Baseline): We disabled NAT Gateways (saving \$32.40/mo) and ALBs (saving \$18/mo) by utilizing a single Free Tier EC2 host with an Elastic IP and Amazon CloudFront CDN. Services like Lambda (1M free req/mo), DynamoDB (25GB free), SQS/SNS (1M free req/mo), and Cognito (50K MAUs) are permanently free under AWS Always-Free Tier.  
> 2. Hard Cost Controls: In Terraform (`modules/budgets`), we provisioned an AWS Budget alert with a \$5.00 hard ceiling, sending automated email alerts at 50%, 80%, and 100% of the threshold.  
> 3. Profile B (Production): All high-availability resources (Multi-AZ ALB, ASG, Multi-AZ RDS, WAF) are fully declared and validated in Terraform, ready for immediate deployment when enterprise funding is approved."*

### Q3: "How does horizontal auto scaling work if user sessions or database state are involved?"
> **Defense Answer:**  
> *"Our backend follows a completely stateless Twelve-Factor App architecture. User sessions are verified using stateless cryptographic JWTs and AWS Cognito ID tokens, meaning any EC2 backend node behind the Application Load Balancer can process any incoming request without sticky sessions.  
> Relational state resides centrally in the PostgreSQL database, and media uploads go directly to Amazon S3. The Auto Scaling Group utilizes an EC2 Launch Template with Amazon Linux 2023 and a Target Tracking Policy monitoring `ASGAverageCPUUtilization` at 70%. When traffic surges during holiday festivals in Gujarat, ASG launches up to 3 instances; once the surge subsides, it automatically scales back down."*

### Q4: "How is the digital QR handover pass secure against forgery or replay attacks?"
> **Defense Answer:**  
> *"The QR code is not a static database ID or plain text link. It contains a cryptographically signed, single-use token generated using HMAC-SHA256 with a secret salt, embedding the booking ID, renter ID, action (`PICKUP` or `RETURN`), and an expiration timestamp (15 minutes TTL).  
> When the owner scans the QR pass, the backend verifies the signature, confirms the owner is the authorized equipment owner for that booking, checks that the booking is in `CONFIRMED` status, transitions it to `ACTIVE`, and immediately marks the token as consumed in DynamoDB. Even if someone took a screenshot of the QR pass, it cannot be reused after verification or expiration."*

### Q5: "Where are rental discounts and pricing calculated, and why?"
> **Defense Answer:**  
> *"Pricing is calculated serverless via AWS Lambda (`backend/src/lambda/quote-calculator.ts`) exposed through Amazon API Gateway. Rather than burdening the main EC2 application server with pricing math, or trusting client-side frontend inputs which could be manipulated in the browser console, the quote engine is an isolated pure serverless function. It calculates tiered volume discounts (5% for 3+ days, 15% for weekly, 20% for 14 days, 30% for monthly), applies standard 18% GST according to Indian tax regulations, computes refundable escrow security deposits, and returns a verified financial breakdown in under 2 milliseconds."*
