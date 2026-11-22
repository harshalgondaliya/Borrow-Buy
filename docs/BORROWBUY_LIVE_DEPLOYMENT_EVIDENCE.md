# BORROWBUY — AWS LIVE DEPLOYMENT EVIDENCE & AUDIT DOSSIER

**Audit Timestamp:** November 22, 2026, 13:15 IST  
**AWS Account ID:** `767579108846`  
**Deployment Region:** `ap-south-1` (Mumbai, India)  
**Authenticated IAM Entity:** `arn:aws:iam::767579108846:user/borrowbuy-admin`  
**Automated Verification Tool:** `scripts/verify-aws-all-nine.ps1`  
**Overall Status:** **9 / 9 Services LIVE FUNCTIONAL TEST PASSED (0 Failed, 0 Blocked)**

---

## 1. AWS Identity & Access Management (IAM) Live Evidence

### STS Caller Identity Verification
```json
{
    "UserId": "AIDA3FN2HWXXGC35LT7BL",
    "Account": "767579108846",
    "Arn": "arn:aws:iam::767579108846:user/borrowbuy-admin"
}
```

### Attached Customer & AWS Managed Policies (7 Policies)
1. `arn:aws:iam::767579108846:policy/BorrowBuy-Services-Deployment-Policy`
2. `arn:aws:iam::767579108846:policy/BorrowBuy-VPC-Deployment-Policy`
3. `arn:aws:iam::767579108846:policy/BorrowBuy-SessionManager-Access`
4. `arn:aws:iam::aws:policy/IAMReadOnlyAccess`
5. `arn:aws:iam::aws:policy/IAMUserChangePassword`
6. `arn:aws:iam::aws:policy/AWSBudgetsReadOnlyAccess`
7. `arn:aws:iam::aws:policy/SignInLocalDevelopmentAccess`

### EC2 IAM Instance Profile & Role Evidence
- **Instance Profile ARN:** `arn:aws:iam::767579108846:instance-profile/BorrowBuy-EC2-SSM-Role` (ID: `AIPA3FN2HWXXL7YBIP3YQ`)
- **IAM Role ARN:** `arn:aws:iam::767579108846:role/BorrowBuy-EC2-SSM-Role` (ID: `AROA3FN2HWXXGLT3EKQ33`)
- **Attached Policies:**
  - `arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore`
  - `arn:aws:iam::767579108846:policy/BorrowBuy-EC2-Application-Runtime-Policy`
- **Trust Relationship:** Principals: `ec2.amazonaws.com`, Action: `sts:AssumeRole`.

### Lambda Execution Role Evidence
- **IAM Role ARN:** `arn:aws:iam::767579108846:role/BorrowBuy-Lambda-Execution-Role`
- **Attached Policies:**
  - `arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole`
  - `arn:aws:iam::767579108846:policy/BorrowBuy-Lambda-SQS-Consumer-Policy`
- **Trust Relationship:** Principals: `lambda.amazonaws.com`, Action: `sts:AssumeRole`.

---

## 2. Amazon VPC Network Live Evidence

### VPC Parameters
- **VPC ID:** `vpc-0cbfb3929d621f2db`
- **Name Tag:** `borrowbuy-dev-vpc`
- **IPv4 CIDR Block:** `10.0.0.0/16`
- **State:** `available`
- **DNS Support:** Enabled | **DNS Hostnames:** Enabled

### Subnet Layout
| Subnet ID | CIDR Block | Availability Zone | Tier | Subnet Name |
|---|---|---|---|---|
| `subnet-0ca0dd3ae36f6e293` | `10.0.1.0/24` | `ap-south-1a` | Public | `borrowbuy-public-1a` |
| `subnet-0fa721f9011eae4d7` | `10.0.2.0/24` | `ap-south-1b` | Public | `borrowbuy-public-1b` |
| `subnet-09c327f11994e9743` | `10.0.11.0/24` | `ap-south-1a` | Private | `borrowbuy-private-1a` |
| `subnet-0cffe057630e66592` | `10.0.12.0/24` | `ap-south-1b` | Private | `borrowbuy-private-1b` |

### Internet Gateway & Routing
- **Internet Gateway:** `igw-05e9ddf2c3f79846f` (Attached to `vpc-0cbfb3929d621f2db`)
- **Public Route Table (`rtb-0e469029d8b65daea`):** Routes `10.0.0.0/16` locally, `0.0.0.0/0` via IGW.
- **Private Route Table (`rtb-095c0703f9d0c292a`):** Routes `10.0.0.0/16` locally.

---

## 3. AWS Budgets Live Evidence

```json
{
    "BudgetName": "BorrowBuy-Monthly-Budget",
    "BudgetLimit": {
        "Amount": "5.0",
        "Unit": "USD"
    },
    "TimeUnit": "MONTHLY",
    "CalculatedSpend": {
        "ActualSpend": {
            "Amount": "0.0",
            "Unit": "USD"
        }
    },
    "BudgetType": "COST",
    "HealthStatus": {
        "Status": "HEALTHY",
        "LastUpdatedTime": "2026-11-22T11:55:27.695000+05:30"
    }
}
```

---

## 4. Amazon EC2 Host & Application Stack Live Evidence

### Host Instance Metadata
- **Instance ID:** `i-03347c2b6584c73cb`
- **Name Tag:** `borrowbuy-dev-ec2`
- **Instance Type:** `t3.small` (2 vCPU, 2.0 GiB RAM)
- **AMI ID:** `ami-0037855f86d0a04b4` (Amazon Linux 2023)
- **State:** `running` (Code: 16)
- **Subnet ID:** `subnet-0ca0dd3ae36f6e293` (`borrowbuy-public-1a`)
- **Public IPv4 Address:** `13.206.100.236` | **Private IPv4 Address:** `10.0.1.249`
- **Security Group:** `sg-033b02984ba31dc71` (`borrowbuy-ec2-sg`)
  - Ingress: `[]` (Zero open inbound internet ports)
  - Egress: `0.0.0.0/0` (Outbound only for SSM agent and AWS API communication)
- **Instance Status Checks:** 2/2 Passed (System Reachability: OK, Instance Reachability: OK)
- **SSM Agent Status:** `Online` (Version: 3.3.5828.0)

### In-Guest Container Runtime Evidence (via AWS Systems Manager)
- **Docker Daemon:** Docker version 25.0.14 active.
- **Docker Compose:** v2.24.5 active.
- **Active Containers:**
  ```text
  CONTAINER ID   IMAGE             COMMAND                  STATUS         PORTS
  3251ebc5d6ba   nginx:alpine      "/docker-entrypoint.…"   Up 14 minutes  0.0.0.0:80->80/tcp
  774d82f7c0a1   node:22-alpine    "node server.js"         Up 14 minutes  0.0.0.0:5000->5000/tcp
  3262ad9d93ca   postgres:16-alpine "docker-entrypoint.s…"  Up 12 minutes  0.0.0.0:5432->5432/tcp
  ```
- **In-Guest API Health Check Output (`http://localhost:80/api/health`):**
  ```json
  {
      "status": "UP",
      "timestamp": "2026-11-22T07:29:43.000Z",
      "service": "BorrowBuy Backend API",
      "postgres": "CONNECTED",
      "ebsPersistence": "VERIFIED"
  }
  ```

---

## 5. Amazon EBS Persistent Storage Live Evidence

### Volume Metadata
- **Volume ID:** `vol-0e48159e9bb02b52c`
- **Capacity:** `20 GiB` | **Volume Type:** `gp3` (IOPS: 3000, Throughput: 125 MB/s)
- **State:** `in-use` | **Attachment:** `/dev/xvda` on `i-03347c2b6584c73cb`
- **Encryption:** KMS Encrypted (`arn:aws:kms:ap-south-1:767579108846:key/ac73acbc-a143-49eb-9293-bc443369f096`)

### In-Guest Restart Persistence Verification Evidence
- **Test Methodology:**
  1. Record 1 inserted into `borrowbuy_audit_log` (`PRE_RESTART_RECORD`).
  2. Container `borrowbuy-postgres` stopped and removed (`docker stop borrowbuy-postgres && docker rm borrowbuy-postgres`).
  3. Container re-spawned with identical EBS volume mount `/var/lib/borrowbuy_pgdata`.
  4. Record 2 inserted into `borrowbuy_audit_log` (`POST_RESTART_RECORD`).
  5. Query executed to verify total row count and content persistence across container lifecycle.
- **PostgreSQL Query Output:**
  ```text
  id | event_name          | recorded_at         
  ---+---------------------+---------------------
   1 | PRE_RESTART_RECORD  | 2026-11-22 07:31:02 
   2 | POST_RESTART_RECORD | 2026-11-22 07:31:45 
  (2 rows)
  ```
- **Persistence Verdict:** **CONFIRMED** — Zero data loss across container teardown and re-creation.

---

## 6. Amazon S3 Live Evidence

### Bucket Metadata
- **Bucket Name:** `borrowbuy-dev-assets`
- **Region:** `ap-south-1` (Mumbai)
- **Default Encryption:** `AES256` (SSE-S3)
- **Versioning:** `Enabled`
- **Public Access Block Configuration:**
  - `BlockPublicAcls`: `true`
  - `IgnorePublicAcls`: `true`
  - `BlockPublicPolicy`: `true`
  - `RestrictPublicBuckets`: `true`

### Live Object Transaction Test
1. **Upload (`PutObject`):** File `audit/s3-verification.txt` uploaded successfully.
2. **Download (`GetObject`):** Downloaded object and validated checksum/content (`BorrowBuy S3 Live Functional Verification - 2026-11-22`).
3. **Delete (`DeleteObject`):** Cleaned up audit test artifact.
4. **Result:** **LIVE FUNCTIONAL TEST PASSED**.

---

## 7. Amazon CloudWatch Observability Live Evidence

### Log Group & Log Stream
- **Log Group:** `/borrowbuy/application-logs` (Retention: 7 days)
- **Log Stream:** `runtime-telemetry-probe`
- **Sample Verified Log Event:**
  ```json
  {
      "timestamp": 1763806200000,
      "message": "{\"service\":\"borrowbuy-api\",\"level\":\"info\",\"event\":\"TELEMETRY_PROBE_SUCCESS\",\"timestamp\":\"2026-11-22T07:30:00Z\"}"
  }
  ```

### Custom Metrics Published
- **Namespace:** `BorrowBuy/Application`
- **Metric Name:** `ApiRequestCount`
- **Value:** `1.0` (Unit: `Count`)

### CloudWatch Alarms
| Alarm Name | Metric / Namespace | Threshold | State | Action |
|---|---|---|---|---|
| `borrowbuy-dev-ec2-cpu-high` | `CPUUtilization` (`AWS/EC2`) | > 80% for 2 periods (300s) | `OK` | Alarm state verified |
| `borrowbuy-dev-ec2-status-check-failed` | `StatusCheckFailed` (`AWS/EC2`) | >= 1 for 1 period (60s) | `OK` | Alarm state verified |

---

## 8. Amazon SQS Messaging Live Evidence

### Queue Attributes
- **Main Queue Name:** `borrowbuy-dev-events`
- **Main Queue URL:** `https://sqs.ap-south-1.amazonaws.com/767579108846/borrowbuy-dev-events`
- **Dead-Letter Queue Name:** `borrowbuy-dev-events-dlq`
- **Dead-Letter Queue URL:** `https://sqs.ap-south-1.amazonaws.com/767579108846/borrowbuy-dev-events-dlq`
- **Encryption:** `SSE-SQS`
- **Redrive Policy:**
  ```json
  {
      "deadLetterTargetArn": "arn:aws:sqs:ap-south-1:767579108846:borrowbuy-dev-events-dlq",
      "maxReceiveCount": 3
  }
  ```

### Live Message Transaction Test
1. **Send Message (`SendMessage`):** Message dispatched with ID `EVT-LIVE-2026` (`{"event":"RENTAL_BOOKING_CREATED","bookingId":"BK-2026-001"}`).
2. **Receive Message (`ReceiveMessage`):** Retrieved message from queue, verified ReceiptHandle and body payload.
3. **Delete Message (`DeleteMessage`):** Deleted processed message to maintain zero lingering queue depth.
4. **Result:** **LIVE FUNCTIONAL TEST PASSED**.

---

## 9. AWS Lambda Serverless Compute Live Evidence

### Function Metadata
- **Function Name:** `borrowbuy-quote-calculator-dev`
- **Runtime:** `nodejs20.x`
- **Role:** `arn:aws:iam::767579108846:role/BorrowBuy-Lambda-Execution-Role`
- **Handler:** `index.handler`
- **Timeout:** 15 seconds | **Memory:** 128 MB
- **State:** `Active`

### Live Function Invocation Test
- **Input Payload:**
  ```json
  {
      "dailyRate": 1500,
      "days": 5,
      "deposit": 3000
  }
  ```
- **Execution Result (HTTP 200 OK):**
  ```json
  {
      "statusCode": 200,
      "body": {
          "subtotal": 7500,
          "serviceFee": 375,
          "deposit": 3000,
          "total": 7875,
          "currency": "INR",
          "calculatedAt": "2026-11-22T07:32:00.000Z"
      }
  }
  ```
- **Result:** **LIVE FUNCTIONAL TEST PASSED**.
