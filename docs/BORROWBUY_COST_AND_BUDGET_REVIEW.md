# BORROWBUY — CLOUD FINOPS & COST RECONCILIATION DOSSIER

**Document Version:** 2.1.0  
**Audit Date:** November 22, 2026  
**Target AWS Region:** `ap-south-1` (Mumbai)  
**Monthly Budget Ceiling:** \$5.00 USD  
**Current Spend Recorded:** \$0.00 USD  
**Budget Health:** `HEALTHY`  

---

## 1. Resolution of EC2 Pricing & Cost Inconsistencies

A rigorous audit of AWS pricing for `ap-south-1` (Mumbai) was conducted to resolve discrepancies between continuous hosting estimates and the \$5.00 monthly budget ceiling.

### 1.1 Itemized Rate Card for `ap-south-1` (Mumbai)

| Component | Resource Specification | Unit Hourly / Monthly Rate | Continuous 24/7 (730 hrs) | On-Demand Demonstration (20 hrs) | Notes |
|---|---|---|---|---|---|
| **EC2 Compute (`t3.small`)** | 2 vCPU, 2 GiB RAM | \$0.0208 / hour | **\$15.18 / mo** | **\$0.42 / mo** | Current live instance `i-03347c2b6584c73cb` |
| **EC2 Compute (`t3.micro`)** | 2 vCPU, 1 GiB RAM | \$0.0104 / hour | \$7.59 / mo | \$0.21 / mo | Optional downgrade for additional savings |
| **Public IPv4 Address** | 1 in-use Public IPv4 | \$0.005 / hour | **\$3.65 / mo** | **\$0.10 / mo** | AWS IPv4 charge (introduced Feb 2024) |
| **EBS Storage (gp3)** | 20 GiB persistent volume | \$0.088 / GB-month | **\$1.76 / mo** | **\$1.76 / mo** | Billed continuously while allocated |
| **Amazon VPC** | Standard VPC, 4 Subnets, IGW | Free native control plane | \$0.00 | \$0.00 | 0 NAT Gateways provisioned |
| **AWS IAM** | Roles, Policies, SSM Profiles | Free native control plane | \$0.00 | \$0.00 | No charges for IAM |
| **AWS Budgets** | 1 Active Cost Budget | First 2 budgets free | \$0.00 | \$0.00 | `BorrowBuy-Monthly-Budget` (\$5 limit) |
| **S3, SQS, CloudWatch, Lambda** | Academic request volume | Free Tier allowances | < \$0.05 / mo | < \$0.01 / mo | Within 1M calls / 5GB logs limits |

---

## 2. Why Continuous 24/7 Hosting Exceeds the $5 Target

Under standard AWS billing rules:
1. **Public IPv4 Address:** \$3.65 / month (fixed continuous charge for 730 hours).
2. **20 GiB gp3 EBS Storage:** \$1.76 / month (fixed continuous charge).
3. **Subtotal Before Compute:** \$3.65 + \$1.76 = **\$5.41 / month**.

> [!IMPORTANT]
> A continuous 24/7 deployment with a public IPv4 address and 20 GiB EBS storage costs **\$5.41/month before running a single second of compute**. Adding `t3.small` compute (\$15.18) brings continuous 24/7 hosting to **\$20.59/month**. Even downgrading to `t3.micro` brings continuous hosting to **\$13.00/month**.

---

## 3. The Recommended Architecture to Stay Under $5.00/Month

To strictly honor the \$5.00 monthly budget ceiling without sacrificing academic evaluation readiness, BorrowBuy implements the **On-Demand Demonstration Lifecycle**:

### Model: On-Demand Demonstration Mode
- When not actively being evaluated or demonstrated, the EC2 instance is in `stopped` state.
- While stopped:
  - Compute charge: **\$0.00 / hour**
  - Public IPv4 charge: **\$0.00 / hour** (released while stopped)
  - EBS volume storage: **\$1.76 / month** (persists data safely)
- During active evaluation sessions (e.g. 20 hours of faculty presentations and testing per month):
  - 20 hours x (\$0.0208 compute + \$0.005 IPv4) = **\$0.52**
- **Total Monthly Spend:** \$1.76 + \$0.52 = **\$2.28 / month**  
  **Result: Well below the \$5.00 budget ceiling (54.4% safety margin remaining).**

### Demonstration Operational Commands:
```bash
# Start instance 2 minutes before evaluation (Billed rate: ~$0.026/hr)
aws ec2 start-instances --instance-ids i-03347c2b6584c73cb --profile borrowbuy-admin --region ap-south-1

# Stop instance immediately after evaluation (Stops all compute and IPv4 charges)
aws ec2 stop-instances --instance-ids i-03347c2b6584c73cb --profile borrowbuy-admin --region ap-south-1
```

---

## 4. Current Spend & Budget Evidence

Live query of `BorrowBuy-Monthly-Budget` confirms:
```json
{
    "BudgetName": "BorrowBuy-Monthly-Budget",
    "BudgetLimit": { "Amount": "5.0", "Unit": "USD" },
    "CalculatedSpend": { "ActualSpend": { "Amount": "0.0", "Unit": "USD" } },
    "HealthStatus": { "Status": "HEALTHY" }
}
```
Current actual spend is **\$0.00 USD**. Spending alerts trigger at 50% (\$2.50), 80% (\$4.00), and 100% (\$5.00).
