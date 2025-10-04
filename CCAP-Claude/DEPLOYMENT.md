# Deployment Guide - Chess Club Admin Portal

This guide covers deploying your Chess Club Portal to production.

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Tested all features locally
- [ ] Changed the default admin password
- [ ] Generated a secure `NEXTAUTH_SECRET`
- [ ] Decided on a production database (PostgreSQL recommended)
- [ ] Reviewed and updated environment variables
- [ ] Tested the build process locally

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

### Steps:

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Sign up for Vercel**: Visit [vercel.com](https://vercel.com)

3. **Import your repository**:
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

4. **Configure Environment Variables**:
   Add these in the Vercel dashboard:
   ```
   DATABASE_URL=<your-production-database-url>
   NEXTAUTH_SECRET=<generated-secure-secret>
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

5. **Add Vercel Postgres (Optional)**:
   - Go to Storage tab in your project
   - Create a Postgres database
   - Connection string is automatically added as `DATABASE_URL`

6. **Update Prisma Schema** for PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

7. **Add Build Script** to package.json:
   ```json
   "scripts": {
     "vercel-build": "prisma generate && prisma db push && next build"
   }
   ```

8. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your app

9. **Seed the database** (one-time):
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login
   vercel login

   # Link your project
   vercel link

   # Run seed command
   vercel exec -- npm run db:seed
   ```

## Option 2: Deploy to Railway

Railway provides a simple deployment with integrated PostgreSQL.

### Steps:

1. **Sign up for Railway**: Visit [railway.app](https://railway.app)

2. **Create a New Project**:
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

3. **Add PostgreSQL Database**:
   - Click "New"
   - Select "Database"
   - Choose "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

4. **Update Prisma Schema**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

5. **Add Environment Variables**:
   - Go to your service settings
   - Add variables:
     ```
     NEXTAUTH_SECRET=<your-secret>
     NEXTAUTH_URL=https://<your-railway-domain>.railway.app
     ```

6. **Configure Build**:
   Railway auto-detects Next.js. Add this to package.json:
   ```json
   "scripts": {
     "build": "prisma generate && prisma db push && next build"
   }
   ```

7. **Deploy**:
   - Railway will automatically deploy
   - Your app will be available at the provided domain

8. **Seed Database**:
   - Go to your project settings
   - Open the service terminal
   - Run: `npm run db:seed`

## Option 3: Deploy to Render

Render offers free hosting with PostgreSQL.

### Steps:

1. **Sign up for Render**: Visit [render.com](https://render.com)

2. **Create PostgreSQL Database**:
   - Click "New +"
   - Select "PostgreSQL"
   - Choose free tier
   - Copy the Internal Database URL

3. **Create Web Service**:
   - Click "New +"
   - Select "Web Service"
   - Connect your repository
   - Configure:
     - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
     - **Start Command**: `npm start`

4. **Add Environment Variables**:
   ```
   DATABASE_URL=<your-postgres-internal-url>
   NEXTAUTH_SECRET=<your-secret>
   NEXTAUTH_URL=https://<your-service-name>.onrender.com
   NODE_ENV=production
   ```

5. **Update Prisma Schema**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

6. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy

7. **Seed Database**:
   - Open the web service shell
   - Run: `npm run db:seed`

## Option 4: Self-Hosted (VPS/DigitalOcean/AWS)

For complete control, deploy to your own server.

### Requirements:

- Ubuntu 20.04+ server
- Node.js 18+
- PostgreSQL 14+
- Nginx (for reverse proxy)

### Steps:

1. **Install Dependencies**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib

   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Set Up PostgreSQL**:
   ```bash
   # Create database and user
   sudo -u postgres psql
   CREATE DATABASE chessclub;
   CREATE USER chessuser WITH ENCRYPTED PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE chessclub TO chessuser;
   \q
   ```

3. **Clone Your Repository**:
   ```bash
   cd /var/www
   git clone <your-repo-url> chess-club-portal
   cd chess-club-portal
   ```

4. **Install and Build**:
   ```bash
   npm install
   npm run build
   ```

5. **Set Up Environment**:
   ```bash
   # Create .env file
   cat > .env << EOF
   DATABASE_URL="postgresql://chessuser:your-password@localhost:5432/chessclub"
   NEXTAUTH_SECRET="$(openssl rand -base64 32)"
   NEXTAUTH_URL="https://your-domain.com"
   EOF
   ```

6. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

7. **Set Up PM2** (Process Manager):
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "chess-club" -- start
   pm2 startup
   pm2 save
   ```

8. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/chess-club
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. **Enable Site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/chess-club /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Set Up SSL with Let's Encrypt**:
    ```bash
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

## Post-Deployment Steps

After deploying to any platform:

1. **Test the Application**:
   - Visit your deployment URL
   - Test login functionality
   - Create a test member
   - Verify all CRUD operations

2. **Change Admin Password**:
   - Login with default credentials
   - Create a new admin user with a strong password
   - Delete or update the default admin

3. **Set Up Monitoring**:
   - Enable error tracking (Sentry, etc.)
   - Set up uptime monitoring
   - Configure alerts

4. **Backup Strategy**:
   - Set up automated database backups
   - Test backup restoration
   - Document backup procedures

5. **Security Review**:
   - Ensure HTTPS is enabled
   - Review CORS settings
   - Enable rate limiting if needed
   - Review all environment variables

## Database Migration from SQLite to PostgreSQL

If you're moving from development (SQLite) to production (PostgreSQL):

1. **Export data from SQLite**:
   ```bash
   npx prisma db pull
   ```

2. **Update schema for PostgreSQL**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Push to new database**:
   ```bash
   npx prisma db push
   ```

4. **Re-seed with production data**:
   ```bash
   npm run db:seed
   ```

## Environment Variables Reference

Required for all deployments:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret for session encryption | `$(openssl rand -base64 32)` |
| `NEXTAUTH_URL` | Full URL of your deployment | `https://yoursite.com` |
| `NODE_ENV` | Environment | `production` |

## Troubleshooting

### Build Fails

- Check Node.js version (18+)
- Clear `.next` and `node_modules`, reinstall
- Check build logs for specific errors

### Database Connection Fails

- Verify `DATABASE_URL` is correct
- Check database is accessible from your server
- Ensure firewall allows database connections

### Authentication Issues

- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

### Performance Issues

- Enable caching in Next.js config
- Use CDN for static assets
- Optimize database queries
- Consider database connection pooling

## Updating Your Deployment

### For Vercel/Railway/Render:

Simply push to your main branch:
```bash
git add .
git commit -m "Update"
git push
```

### For Self-Hosted:

```bash
cd /var/www/chess-club-portal
git pull
npm install
npm run build
pm2 restart chess-club
```

## Rollback Strategy

Always keep previous versions:

### Vercel:
- Use Vercel dashboard to rollback to previous deployment

### Self-Hosted:
```bash
# Tag before deployment
git tag v1.0.0

# Rollback
git checkout v1.0.0
npm install
npm run build
pm2 restart chess-club
```

## Support

For deployment issues:
- Check platform-specific documentation
- Review application logs
- Check database connectivity
- Verify environment variables

---

Good luck with your deployment! ♟️
