# BorrowBuy — Public Deployment, Reverse Proxy & Production Hosting Guide

**Target Cloud Provider:** Amazon Web Services (AWS)  
**Primary Host:** Amazon EC2 `i-03347c2b6584c73cb` (AWS Mumbai `ap-south-1`)  
**Public Ingress IP:** `13.206.100.236`  
**Web Server & Reverse Proxy:** Nginx 1.24  
**Application Server:** Node.js 20 Express (Port 5000, Systemd Unit `borrowbuy-backend.service`)  
**Database Cluster:** PostgreSQL 16 (Port 5432, Docker Container `borrowbuy-postgres`)  
**Frontend Bundle:** Vite 6 Single Page Application (`/var/www/borrowbuy/dist`)

---

## 1. Production Hosting Topology

```
[Public Web Client] (Browser / Mobile)
        │
        │ HTTP (Port 80) / HTTPS (Port 443)
        ▼
[Security Group: sg-01fa4e0c3ce367339] (ap-south-1)
        │
        ▼
[Nginx Reverse Proxy] (Listening on 0.0.0.0:80)
   ├── /api/*          ───> Reverse Proxy ──> http://127.0.0.1:5000 (Express Backend)
   ├── /images/*       ───> Static Files  ──> /var/www/borrowbuy/uploads
   └── / (All other)   ───> Static SPA    ──> /var/www/borrowbuy/dist/index.html
                                                     │
                                                     ▼
                                      [Node.js Express Backend] (Port 5000)
                                                     │
                                                     ▼
                                      [PostgreSQL 16 Database] (Port 5432)
                                      (EBS Volume: vol-0e48159e9bb02b52c)
```

---

## 2. Nginx Reverse Proxy Configuration

The authoritative Nginx configuration deployed at `/etc/nginx/conf.d/borrowbuy.conf`:

```nginx
server {
    listen 80;
    server_name 13.206.100.236 localhost;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss text/javascript;

    # Frontend Single Page Application Root
    root /var/www/borrowbuy/dist;
    index index.html;

    # Static Media Uploads / Local S3 Fallback
    location /images/ {
        alias /home/ec2-user/app/backend/uploads/;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    # Backend REST API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # SPA Client-Side Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

---

## 3. Systemd Backend Service (`borrowbuy-backend.service`)

The Node.js Express server is managed as a continuous background system daemon:

```ini
[Unit]
Description=BorrowBuy Express Backend Service
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/app/backend
Environment=NODE_ENV=production
Environment=PORT=5000
Environment=DATABASE_URL=postgresql://borrowbuy:BorrowBuySecret2026@localhost:5432/borrowbuy?schema=public
Environment=JWT_SECRET=borrowbuy-production-jwt-token-secret-mumbai-2026
Environment=AWS_REGION=ap-south-1
Environment=S3_BUCKET_NAME=borrowbuy-product-assets-767579108846
Environment=SQS_QUEUE_URL=https://sqs.ap-south-1.amazonaws.com/767579108846/borrowbuy-booking-events
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
StandardOutput=append:/var/log/borrowbuy-backend.log
StandardError=append:/var/log/borrowbuy-backend-error.log

[Install]
WantedBy=multi-user.target
```

---

## 4. Production Environment Isolation & Zero Hardcoded URLs

To eliminate environment collisions and broken asset loading:
1. **Dynamic API Routing:** Frontend requests utilize relative path `/api` (or `VITE_API_BASE_URL`), routed transparently by Nginx. No hardcoded `http://localhost:5000` appears in client production bundles.
2. **Dynamic Asset Resolution:** `resolveImageUrl()` utility checks asset origins:
   - S3 URLs (`https://borrowbuy-product-assets-...`) load directly from Amazon S3.
   - Relative media paths (`/images/products/...`) resolve against origin domain.
   - External Unsplash demo images resolve via HTTPS CDN.

---

## 5. Security Group Ingress & Port Hardening

- **Port 80 (HTTP):** Open to `0.0.0.0/0` for web browser traffic.
- **Port 443 (HTTPS):** Open to `0.0.0.0/0` for TLS traffic.
- **Port 22 (SSH):** **CLOSED / RESTRICTED.** Shell access is executed exclusively through AWS Systems Manager (SSM) Session Manager using authenticated IAM credentials.
- **Port 5000 (Express):** Bound to `127.0.0.1` (Internal loopback only; inaccessible from outside VPC).
- **Port 5432 (PostgreSQL):** Bound to `127.0.0.1` (Internal loopback only).
