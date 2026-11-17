# BorrowBuy – Load Balancer & Horizontal Auto Scaling Architecture

**Services:** Elastic Load Balancing (ALB) & Amazon EC2 Auto Scaling  
**Module Paths:** `infra/terraform/modules/alb` & `infra/terraform/modules/autoscaling`  
**Live UI Demonstration:** `/cloud` (Horizontal Elasticity Panel)

---

## 1. Application Load Balancer (ALB) Configuration

### Architecture & Placement
- **Type:** Layer-7 Application Load Balancer (`aws_lb`).
- **Subnets:** Deployed across two public subnets (`ap-south-1a` & `ap-south-1b`).
- **Scheme:** Internet-facing (`internal = false`).
- **Security:** Ingress managed via AWS WAFv2 Web ACL (`RateLimit1000Per5Min` & `CommonRuleSet`).

### Target Group & Health Probing
```hcl
resource "aws_lb_target_group" "api" {
  name        = "borrowbuy-api-tg-prod"
  port        = 5000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance"

  health_check {
    enabled             = true
    path                = "/api/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }
}
```

- **Health Endpoint:** `GET /api/health`
- **Probe Interval:** 30 seconds.
- **Failover Threshold:** 3 consecutive failures (90s) marks instance as `unhealthy` and stops routing traffic.
- **Recovery Threshold:** 2 consecutive successes (60s) returns instance to active pool.

---

## 2. Horizontal Auto Scaling Group (ASG)

### Launch Template Specifications
- **Base AMI:** Amazon Linux 2023 (`al2023-ami-*-kernel-6.1-x86_64`).
- **Instance Type:** `t3.micro` (2 vCPUs, 1GB RAM) — Free Tier eligible.
- **IAM Profile:** Attached role with S3, DynamoDB, CloudWatch, and SSM access.
- **User Data:** Automatically bootstraps Docker, pulls BorrowBuy API containers, and initializes application.

### Elasticity Parameters
- **Minimum Capacity:** 1 instance (Maintains single-node baseline).
- **Desired Capacity:** 1 instance (Normal operating condition).
- **Maximum Capacity:** 3 instances (Absorbs peak festival & wedding equipment booking surges in Gujarat).

### Dynamic Target Tracking Scaling Policy
```hcl
resource "aws_autoscaling_policy" "cpu_target_tracking" {
  name                   = "borrowbuy-cpu-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.backend.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value     = 70.0
    disable_scale_in = false
  }
}
```

- **Metric:** `ASGAverageCPUUtilization`
- **Threshold:** 70% average CPU across the cluster.
- **Scale-Out Behavior:** When CPU sustained > 70% for 2 minutes, ASG launches +1 instance (1 &rarr; 2 &rarr; 3).
- **Scale-In Behavior:** When traffic subsides and CPU < 70% for 5 minutes, ASG terminates surplus nodes down to 1 instance.

---

## 3. Faculty Traffic Spike Demonstration Guide

To demonstrate horizontal auto scaling to academic examiners, execute one of the following methods:

### Method A: Interactive UI Trigger (Recommended for Live Demo)
1. Open the BorrowBuy application and navigate to the **Cloud Operations Console** (`/cloud`).
2. Locate the **Horizontal Elasticity & Auto Scaling** card.
3. Click the **"Simulate Traffic Spike (Test ASG Target Tracking)"** button.
4. **Observed Results:**
   - Simulated CPU surges to 88% (triggering High CPU alarm).
   - Node count visually scales out from `node-01` &rarr; `node-02` &rarr; `node-03`.
   - Health status confirms `200 OK` across all nodes.
   - Traffic surge stabilizes and cluster gracefully scales back to 1 node.

### Method B: Live HTTP Benchmarking (Autocannon / k6)
Run this command from your terminal:
```bash
# Stress test health and catalog API endpoints for 30 seconds with 100 concurrent connections
npx autocannon -c 100 -d 30 http://localhost:5000/api/health
```

**Faculty Verification Points:**
1. Zero dropped requests (`0 errors`, 100% 200 OK responses).
2. p95 and p99 latency remains under 25ms.
3. In AWS CloudWatch, observe the `CPUUtilization` metric climb in real time on the System Observability Dashboard.
