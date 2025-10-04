# Deployment Guide

This guide covers multiple deployment options for your Small Business Inventory & Sales Dashboard.

## Table of Contents
- [Option 1: Simple VPS Deployment (Recommended)](#option-1-simple-vps-deployment-recommended)
- [Option 2: Free Hosting (Render + Vercel)](#option-2-free-hosting-render--vercel)
- [Option 3: Docker Deployment](#option-3-docker-deployment)
- [Option 4: Platform as a Service (PaaS)](#option-4-platform-as-a-service-paas)

---

## Option 1: Simple VPS Deployment (Recommended)

Best for: Full control, production use, multiple users

### Providers
- **DigitalOcean** ($6-12/month)
- **Linode/Akamai** ($5-10/month)
- **Vultr** ($6-12/month)
- **AWS Lightsail** ($5-10/month)

### Setup Steps

#### 1. Prepare Your Server (Ubuntu 22.04)

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx

# Install Certbot (for SSL)
apt install -y certbot python3-certbot-nginx
```

#### 2. Upload Your Application

```bash
# On your local machine, from project root
scp -r . root@your-server-ip:/var/www/inventory-dashboard

# Or use Git
ssh root@your-server-ip
cd /var/www
git clone your-repo-url inventory-dashboard
```

#### 3. Configure the Application

```bash
# SSH into server
cd /var/www/inventory-dashboard

# Install dependencies
npm run install:all

# Configure environment
cd server
nano .env
```

Set production values:
```env
PORT=5001
JWT_SECRET=YOUR_SUPER_SECRET_RANDOM_STRING_HERE_CHANGE_THIS
NODE_ENV=production
```

#### 4. Build Frontend

```bash
cd /var/www/inventory-dashboard/client
npm run build
```

#### 5. Start Backend with PM2

```bash
cd /var/www/inventory-dashboard/server
pm2 start src/index.js --name inventory-api
pm2 save
pm2 startup
```

#### 6. Configure Nginx

```bash
nano /etc/nginx/sites-available/inventory-dashboard
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve frontend
    root /var/www/inventory-dashboard/client/dist;
    index index.html;

    # Frontend routes (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/inventory-dashboard /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 7. Add SSL Certificate (HTTPS)

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 8. Set Up Automatic Backups

```bash
# Create backup script
nano /root/backup-inventory.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/inventory-dashboard/server/data/inventory.db $BACKUP_DIR/inventory_$DATE.db

# Keep only last 30 days
find $BACKUP_DIR -name "inventory_*.db" -mtime +30 -delete
```

```bash
chmod +x /root/backup-inventory.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup-inventory.sh
```

**Done!** Access your app at `https://yourdomain.com`

---

## Option 2: Free Hosting (Render + Vercel)

Best for: Testing, low traffic, budget-conscious

### Backend on Render.com (Free Tier)

1. **Create account** at render.com
2. **New → Web Service**
3. **Connect your GitHub repo**
4. Configure:
   - **Name**: inventory-api
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `JWT_SECRET=your-secret-key`
     - `PORT=10000` (Render requires this)

5. Deploy

**Note**: Free tier sleeps after inactivity. Consider upgrading to $7/mo for 24/7 availability.

### Frontend on Vercel (Free)

1. **Create account** at vercel.com
2. **Import Project** from GitHub
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL=https://your-render-app.onrender.com`

4. Update `client/src/services/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || '/api';
```

5. Deploy

**Done!** Your app will be at `https://your-app.vercel.app`

### Important: Database Persistence on Render

Render's free tier has **ephemeral storage** - data resets on restart. Solutions:

1. **Upgrade to paid tier** ($7/mo for persistent disk)
2. **Use external database**:
   - Railway.app (PostgreSQL free tier)
   - Supabase (PostgreSQL free tier)
   - MongoDB Atlas (free tier)

---

## Option 3: Docker Deployment

Best for: Containerized environments, scalability

### Create Docker Files

#### `Dockerfile` (root)

```dockerfile
# Backend
FROM node:18 AS backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# Frontend
FROM node:18 AS frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Final image
FROM node:18-slim
WORKDIR /app

# Copy backend
COPY --from=backend /app/server /app/server

# Copy frontend build
COPY --from=frontend /app/client/dist /app/client/dist

# Install nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["sh", "-c", "node /app/server/src/index.js & nginx -g 'daemon off;'"]
```

#### `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-secret-key
      - PORT=5001
    volumes:
      - ./data:/app/server/data
    restart: unless-stopped
```

#### `nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    include mime.types;
    default_type application/octet-stream;

    server {
        listen 80;

        root /app/client/dist;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://localhost:5001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Option 4: Platform as a Service (PaaS)

### Railway.app

1. Import from GitHub
2. Add both `server` and `client` as services
3. Configure environment variables
4. Deploy

**Cost**: ~$5-10/month

### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch
flyctl launch

# Deploy
flyctl deploy
```

**Cost**: Free tier available, ~$3-5/month for production

### Heroku

```bash
# Install Heroku CLI
# Create app
heroku create your-app-name

# Add buildpacks
heroku buildpacks:add heroku/nodejs

# Deploy
git push heroku main
```

**Cost**: Starts at $7/month (no free tier anymore)

---

## Database Upgrade for Production

For better performance and multi-user concurrency, upgrade from SQLite:

### PostgreSQL Migration

1. **Install pg package**:
```bash
cd server
npm install pg
```

2. **Update database.js** to use PostgreSQL instead of SQLite

3. **Use managed database**:
   - **Supabase** (free tier available)
   - **Railway** (free tier available)
   - **DigitalOcean Managed DB** ($15/month)
   - **AWS RDS** (various pricing)

---

## Security Checklist for Production

- ✅ Change default admin password immediately
- ✅ Use strong JWT_SECRET (generate with `openssl rand -base64 32`)
- ✅ Enable HTTPS (SSL certificate)
- ✅ Set up firewall (ufw on Ubuntu)
- ✅ Configure CORS properly (whitelist your domain)
- ✅ Set up database backups
- ✅ Use environment variables (never commit .env)
- ✅ Enable rate limiting on API
- ✅ Keep Node.js and dependencies updated
- ✅ Monitor logs with PM2 or similar

---

## Monitoring & Maintenance

### With PM2
```bash
pm2 status              # Check status
pm2 logs inventory-api  # View logs
pm2 restart inventory-api  # Restart
pm2 monit               # Real-time monitoring
```

### Update Application
```bash
cd /var/www/inventory-dashboard
git pull
cd client && npm run build
pm2 restart inventory-api
```

---

## Cost Comparison

| Option | Monthly Cost | Best For |
|--------|-------------|----------|
| VPS (DigitalOcean) | $6-12 | Production, full control |
| Render Free + Vercel | $0 | Testing, low traffic |
| Render Paid + Vercel | $7 | Small business |
| Railway | $5-10 | Easy deployment |
| Docker on VPS | $6-12 | Containerized apps |
| Fly.io | $3-5 | Global edge deployment |

---

## Recommended Setup for Small Business

**Best Value**: DigitalOcean VPS + Nginx + PM2 + PostgreSQL
- **Cost**: ~$12/month (includes managed PostgreSQL)
- **Benefits**: Full control, scalable, reliable
- **Supports**: 50-100+ concurrent users easily

---

## Need Help?

Common issues and solutions:

1. **Port already in use**: Change PORT in .env
2. **Database locked**: Use PostgreSQL for multiple users
3. **502 Bad Gateway**: Check backend is running (`pm2 status`)
4. **SSL issues**: Run `certbot renew` and restart nginx
5. **Out of memory**: Upgrade VPS or optimize queries

For more help, check server logs:
```bash
pm2 logs inventory-api
tail -f /var/log/nginx/error.log
```
