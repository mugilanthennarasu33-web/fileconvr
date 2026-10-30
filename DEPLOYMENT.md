# fileconvr — Production & Staging Deployment Guide

This guide details the exact procedures for deploying **fileconvr** to staging and production environments, including database persistence, native dependency provisioning, security hardening, reverse proxy configuration, health monitoring, and disaster recovery.

---

## 1. System Architecture & Recommended Topology

```
                         [ Internet / Clients ]
                                   │
                                   ▼ (HTTPS:443)
                 ┌───────────────────────────────────┐
                 │    Nginx / Caddy Reverse Proxy    │
                 │   - TLS Termination (Let's Encrypt)│
                 │   - HTTP/2 & Strict CORS           │
                 │   - Max Body Size: 100MB           │
                 └──────────────┬────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼ (Static Assets / SPA)                         ▼ (API Proxy:5000)
 ┌──────────────┐                              ┌─────────────────────────┐
 │   Frontend   │                              │     Backend API Service │
 │  Vite / Nginx│                              │       Node.js v20+ / v22│
 │  Single-Page │                              │    Express + TypeScript │
 └──────────────┘                              └───────────┬─────────────┘
                                                           │
              ┌────────────────────────┬───────────────────┴────────────────────┐
              ▼                        ▼                                        ▼
    ┌──────────────────┐    ┌─────────────────────┐                  ┌────────────────────┐
    │  PostgreSQL 15+  │    │ Temporary Storage   │                  │ Native Processing  │
    │  Prisma ORM      │    │ Local Disk / NVMe   │                  │ - PyMuPDF (Python3)│
    │  Users, Sessions,│    │ TTL Cleanup Worker  │                  │ - Chrome/Chromium  │
    │  Jobs, Quotas    │    │ Isolated UUID Dirs  │                  │ - Tesseract OCR    │
    └──────────────────┘    └─────────────────────┘                  └────────────────────┘
```

---

## 2. Infrastructure & Runtime Requirements

### Hardware Sizing (Minimum Staging / Production Node)
- **CPU**: 2 vCPU minimum (4+ vCPU recommended for concurrent OCR and PDF rasterization)
- **RAM**: 4 GB minimum (8 GB recommended for simultaneous headless browser and PyMuPDF conversions)
- **Disk**: 40 GB+ NVMe SSD (fast I/O for temporary PDF rendering and manipulation)
- **Operating System**: Ubuntu 22.04 LTS / Debian 12 / Rocky Linux 9 or Windows Server 2022

### Native Runtime Dependencies

Install the required operating system packages on the host or in the Docker container:

```bash
# Ubuntu / Debian
sudo apt-get update && sudo apt-get install -y \
  curl \
  build-essential \
  python3 \
  python3-pip \
  python3-venv \
  chromium-browser \
  tesseract-ocr \
  tesseract-ocr-eng

# Install Python PyMuPDF (fitz)
pip3 install --no-cache-dir pymupdf==1.25.3
```

---

## 3. Environment Configuration

Copy the template from `.env.example` to `.env` in the `backend` directory:

```bash
cp backend/.env.example backend/.env
```

### Production `.env` Variable Reference

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Refuses in-memory fallback; enforces secure cookies and strict CORS. |
| `PORT` | No | `5000` | Port for the backend Express server. |
| `CLIENT_URL` | **Yes** | `https://fileconvr.com` | Primary URL of the frontend web application. |
| `ALLOWED_ORIGINS` | **Yes** | `https://fileconvr.com` | Comma-separated list of origins permitted by CORS policy. |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string with connection pooling. |
| `TEMP_STORAGE_DIR` | No | `./storage/temp` | Directory for task-isolated temporary files. |
| `FILE_TTL_MINUTES` | No | `60` | Lifespan of generated download files before automated disk sweep. |
| `MAX_FILE_SIZE_BYTES` | No | `104857600` | Hard upload cap per request (100 MB). |
| `PYTHON_PATH` | No | `python3` | Path to Python 3 binary with PyMuPDF installed. |
| `CHROME_PATH` | No | Auto-detected | Path to Chromium / Chrome executable for HTML-to-PDF rendering. |
| `AI_PROVIDER` | No | `gemini` | AI Intelligence engine (`gemini` or `openai`). |
| `GEMINI_API_KEY` | If AI enabled | — | Google Gemini API key. Stored only in backend environment. |
| `OPENAI_API_KEY` | If AI enabled | — | OpenAI API key. Stored only in backend environment. |

---

## 4. PostgreSQL Database Persistence & Migrations

### A. Database Provisioning
Create a dedicated user and database in PostgreSQL:

```sql
CREATE USER fileconvr_user WITH ENCRYPTED PASSWORD 'your_strong_password_here';
CREATE DATABASE fileconvr OWNER fileconvr_user;
GRANT ALL PRIVILEGES ON DATABASE fileconvr TO fileconvr_user;
```

### B. Applying Prisma Migrations
In production, **never** run `prisma db push` or destructive migration commands. Use the idempotent migration deployment command:

```bash
cd backend
npx prisma migrate deploy
```

This applies `backend/prisma/migrations/20261029000000_init/migration.sql` and creates:
- `User` table (unique email index, bcrypt hash, tier, role)
- `Session` table (unique SHA-256 tokenHash index, userId cascade, expiration)
- `ProcessingJob` table (taskId index, status index, ownership reference)
- `UsageRecord` table (operationType index, daily aggregation index)
- `Subscription` table (tier, period, status)

### C. Validating Database Connection
Run the database status verification check:
```bash
node -e "
const { getDatabaseStatus } = require('./dist/db/index.js');
console.log(getDatabaseStatus());
"
```
The output must show `mode: 'postgresql'`, `isPostgresConfigured: true`, and `error: null`.

---

## 5. Reverse Proxy & Web Server Configuration

### Nginx Configuration (`/etc/nginx/sites-available/fileconvr`)

```nginx
# Rate Limiting Zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

server {
    listen 80;
    server_name fileconvr.com www.fileconvr.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fileconvr.com www.fileconvr.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/fileconvr.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fileconvr.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://fileconvr.com;" always;

    # Max Upload Size (matches backend limit)
    client_max_body_size 105M;

    # Frontend Static SPA
    root /var/www/fileconvr/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        limit_req zone=api_limit burst=50 nodelay;
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 10s;
    }

    # Strict Rate Limit for Auth Endpoints
    location /api/auth/login {
        limit_req zone=auth_limit burst=10 nodelay;
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 6. Process Management with Systemd

### Backend Service Unit (`/etc/systemd/system/fileconvr-backend.service`)

```ini
[Unit]
Description=fileconvr PDF Platform Backend Service
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=fileconvr
WorkingDirectory=/var/www/fileconvr/backend
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/var/www/fileconvr/backend/.env

# Security Sandbox
ProtectSystem=full
ProtectHome=true
NoNewPrivileges=true
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

To enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable fileconvr-backend
sudo systemctl start fileconvr-backend
sudo systemctl status fileconvr-backend
```

---

## 7. Operational Health Checks & Monitoring

### Liveness & Readiness Endpoint
```http
GET /api/health
```

**Healthy Response (HTTP 200)**:
```json
{
  "status": "ok",
  "timestamp": "2026-10-29T15:58:13.896Z",
  "service": "fileconvr-backend",
  "version": "1.0.0",
  "uptimeSeconds": 1420,
  "environment": "production",
  "features": {
    "mergePdf": true,
    "splitPdf": true,
    "rotatePdf": true,
    "compressPdf": true,
    "imgToPdf": true,
    "pdfToImg": true,
    "wordToPdf": true,
    "excelToPdf": true,
    "pptToPdf": true,
    "pdfToWord": true,
    "organizePdf": true,
    "watermarkPdf": true,
    "pageNumbersPdf": true,
    "protectPdf": true,
    "unlockPdf": true,
    "autoCleanup": true
  }
}
```

### Automated Monitoring Script (Cron or Health Checker)
```bash
# Verify health every 2 minutes
curl -sf https://fileconvr.com/api/health > /dev/null || systemctl restart fileconvr-backend
```

---

## 8. Backup and Disaster Recovery Runbook

### A. Automated Daily Database Backup
Schedule a cron job to take daily compressed PostgreSQL dumps:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/fileconvr"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/fileconvr_db_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Perform backup with gzip compression
pg_dump -U fileconvr_user -h localhost fileconvr | gzip > "$BACKUP_FILE"

# Retain backups for 30 days
find "$BACKUP_DIR" -type f -name "fileconvr_db_*.sql.gz" -mtime +30 -delete

echo "[$(date)] Backup completed: $BACKUP_FILE"
```

### B. Recovery / Restore Procedure
To restore the database from a backup file:

```bash
# 1. Stop backend service
sudo systemctl stop fileconvr-backend

# 2. Terminate existing connections and recreate database
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'fileconvr';"
sudo -u postgres dropdb fileconvr
sudo -u postgres createdb -O fileconvr_user fileconvr

# 3. Restore from compressed dump
gunzip -c /var/backups/fileconvr/fileconvr_db_20261029_120000.sql.gz | psql -U fileconvr_user -h localhost -d fileconvr

# 4. Restart backend service
sudo systemctl start fileconvr-backend
```

---

## 9. Staging Deployment Checklist

- [ ] **System Dependencies**: Node.js v20+, Python 3, PyMuPDF, Chromium browser, Tesseract OCR installed.
- [ ] **PostgreSQL**: PostgreSQL 15+ running, database and user created.
- [ ] **Migrations**: `npx prisma migrate deploy` executed with 0 errors.
- [ ] **Environment**: `.env` created from `.env.example` with strong `SESSION_SECRET` and valid `DATABASE_URL`.
- [ ] **CORS**: `CLIENT_URL` and `ALLOWED_ORIGINS` set to the exact staging domain.
- [ ] **Builds**: `npm run build` executed successfully in both `backend` and `frontend`.
- [ ] **Tests**: `npm test` runs with 100% passing rate (87 of 87 tests).
- [ ] **Reverse Proxy**: Nginx/Caddy configured with SSL certificates and 105MB upload ceiling.
- [ ] **Storage Sweeper**: `TEMP_STORAGE_DIR` writable and periodic background cleanup running.
- [ ] **AI Fallback**: Confirmed that unconfigured AI provider returns HTTP 503 instead of crashing.
- [ ] **Monitoring**: Health check endpoint `/api/health` responding with status `ok`.
