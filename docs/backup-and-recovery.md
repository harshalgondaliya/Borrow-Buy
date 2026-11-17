# BorrowBuy – Backup, Disaster Recovery & Data Retention Policy

**Target Region**: `ap-south-1` (Asia Pacific – Mumbai)  
**Project**: BorrowBuy – Product Rental and Management Platform  
**Compliance Standard**: Zero Data Loss for Historical Rental Transactions  

---

## 1. Backup Strategy Overview

BorrowBuy's backup policy guarantees the preservation of all user accounts, equipment listings, bookings, inspection photographs, and simulated payments across four tiers:

| Asset Category | Backup Mechanism | Frequency | Storage Location | Retention Window |
|---|---|---|---|---|
| **PostgreSQL Database** | Automated `pg_dump` compressed archive | Daily at 02:30 IST | Amazon S3 (`backups/db/`) | 30 days |
| **Product & Inspection Photos** | S3 Cross-Region / Versioning | Continuous | Amazon S3 Standard | Indefinite |
| **Terraform State** | Versioned S3 backend with locking | On every commit | S3 State Bucket | Indefinite |
| **Server Configuration** | Infrastructure as Code (Terraform) | Git version-controlled | GitHub repository | Indefinite |

---

## 2. Automated PostgreSQL Backup Script

On the EC2 host, an automated cron job executes the following backup routine daily:

```bash
#!/bin/bash
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/borrowbuy/backups"
BACKUP_FILE="${BACKUP_DIR}/borrowbuy_db_${TIMESTAMP}.sql.gz"
S3_DESTINATION="s3://borrowbuy-backups-ap-south-1/database/"

mkdir -p "$BACKUP_DIR"

# Execute pg_dump from inside the Docker container and compress with gzip
docker exec borrowbuy-prod-postgres pg_dump -U borrowbuy_user -d borrowbuy_production | gzip > "$BACKUP_FILE"

# Upload to Amazon S3 Private Backup Bucket
aws s3 cp "$BACKUP_FILE" "${S3_DESTINATION}borrowbuy_db_${TIMESTAMP}.sql.gz"

# Clean up local archives older than 7 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete

echo "[$(date)] Backup completed successfully: ${BACKUP_FILE}"
```

---

## 3. Disaster Recovery Walkthrough (Restoration Procedure)

In the event of database corruption or accidental data loss, execute the following commands:

### Step 1: Download the desired backup from Amazon S3
```bash
aws s3 cp s3://borrowbuy-backups-ap-south-1/database/borrowbuy_db_20261114_023000.sql.gz /tmp/restore.sql.gz
```

### Step 2: Stop application traffic to prevent inconsistent writes
```bash
docker stop borrowbuy-prod-backend
```

### Step 3: Restore the database schema and table data
```bash
gunzip -c /tmp/restore.sql.gz | docker exec -i borrowbuy-prod-postgres psql -U borrowbuy_user -d borrowbuy_production
```

### Step 4: Restart the backend API container and verify integrity
```bash
docker start borrowbuy-prod-backend
curl http://localhost/api/health
```
