# Pawn Broker System - Deployment Guide

This guide provides step-by-step instructions for deploying the Pawn Broker Management System to production.

## Table of Contents
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Database Setup](#database-setup)
- [Monitoring](#monitoring)
- [Security](#security)

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment Variables**
   Create `.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   REACT_APP_ENVIRONMENT=production
   ```

3. **Build and Deploy**
   ```bash
   cd frontend
   npm run build
   vercel --prod
   ```

4. **Or Connect GitHub Repository**
   - Push code to GitHub
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables in project settings
   - Deploy automatically on push

### Option 2: Docker

1. **Build Docker Image**
   ```bash
   cd frontend
   docker build -t pawn-broker-frontend .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:80 pawn-broker-frontend
   ```

## Backend Deployment

### Option 1: Render.com (Recommended)

1. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/pawn-broker-system.git
   git push -u origin main
   ```

2. **Create Render Account**
   - Go to [Render.com](https://render.com)
   - Sign up and connect GitHub

3. **Create Web Service**
   - Click "New" → "Web Service"
   - Select your repository
   - Configure settings:
     - **Name**: pawn-broker-backend
     - **Region**: Choose nearest region
     - **Branch**: main
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Instance Type**: Free (or paid for better performance)

4. **Configure Environment Variables**
   Add these in Render dashboard:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@host:5432/pawn_broker
   JWT_SECRET=your_strong_secret_key_here
   PORT=5000
   FRONTEND_URL=https://your-frontend-url.com
   LOG_LEVEL=error
   SENTRY_DSN=your_sentry_dsn (optional)
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy

### Option 2: Docker

1. **Build Docker Image**
   ```bash
   cd backend
   docker build -t pawn-broker-backend .
   ```

2. **Run Container**
   ```bash
   docker run -p 5000:5000 \
     -e DATABASE_URL=postgresql://user:pass@host:5432/pawn_broker \
     -e JWT_SECRET=your_secret \
     -e NODE_ENV=production \
     pawn-broker-backend
   ```

### Option 3: Docker Compose (Local)

1. **Configure Environment Variables**
   Create `.env` in project root:
   ```
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:3000
   ```

2. **Start Services**
   ```bash
   docker-compose up -d
   ```

3. **Run Database Migration**
   ```bash
   docker-compose exec backend node src/database/migrate.js
   ```

## Database Setup

### Option 1: Neon.tech (Recommended - Free Tier)

1. **Create Neon Account**
   - Go to [Neon.tech](https://neon.tech)
   - Sign up for free account

2. **Create Database**
   - Click "Create Project"
   - Choose name: pawn-broker
   - Select region
   - Copy connection string

3. **Update Environment Variables**
   Replace `DATABASE_URL` with your Neon connection string

4. **Run Migration**
   ```bash
   cd backend
   node src/database/migrate.js
   ```

### Option 2: Supabase

1. **Create Supabase Account**
   - Go to [Supabase.com](https://supabase.com)
   - Sign up for free account

2. **Create Project**
   - Click "New Project"
   - Enter project details
   - Copy connection string

3. **Run Migration**
   - Use Supabase SQL editor to run `schema.sql`

### Option 3: Railway.app

1. **Create Railway Account**
   - Go to [Railway.app](https://railway.app)
   - Sign up and connect GitHub

2. **Add PostgreSQL Service**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Copy connection string

3. **Run Migration**
   - Use Railway console to run migration script

## Monitoring

### Sentry Integration

1. **Install Sentry**
   ```bash
   cd backend
   npm install @sentry/node
   ```

2. **Configure Sentry**
   Add to `.env.production`:
   ```
   SENTRY_DSN=your_sentry_dsn
   ```

3. **Monitoring is automatically enabled**
   - Errors are tracked in Sentry dashboard
   - Performance metrics are collected
   - Alerts can be configured

### Health Check

Access health endpoint:
```
GET https://your-backend-url.com/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "memory": {...},
  "cpu": {...}
}
```

## Security

### HTTPS

All deployment platforms (Vercel, Render) automatically enable HTTPS with valid SSL certificates.

### Rate Limiting

The following rate limits are configured:
- **Login**: 5 attempts per 15 minutes
- **API**: 100 requests per 15 minutes
- **Sensitive operations**: 10 requests per hour

### Database Security

1. **Use Strong Passwords**
   - Generate random passwords for database
   - Use password manager to store credentials

2. **Enable SSL**
   - PostgreSQL connections use SSL by default on cloud platforms

3. **Automatic Backups**
   - Neon: 7-day retention on free tier
   - Supabase: Daily backups
   - Render: Automatic backups

4. **IP Whitelist (Optional)**
   Add to environment variables:
   ```
   ALLOWED_IPS=1.2.3.4,5.6.7.8
   ```

### Environment Variables

**Required Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random string for token signing
- `FRONTEND_URL`: Frontend URL for CORS

**Optional Variables:**
- `SENTRY_DSN`: Sentry error tracking
- `ALLOWED_IPS`: Comma-separated allowed IP addresses
- `ALLOWED_ORIGINS`: Comma-separated allowed CORS origins

## Post-Deployment Checklist

- [ ] Verify frontend loads correctly
- [ ] Test login functionality
- [ ] Test bill creation
- [ ] Test bill closure
- [ ] Verify database connectivity
- [ ] Check health endpoint
- [ ] Monitor error logs
- [ ] Setup Sentry alerts
- [ ] Verify rate limiting works
- [ ] Test SSL certificate
- [ ] Configure backups
- [ ] Update documentation with production URLs

## Troubleshooting

### Frontend Issues

**Build fails:**
- Check environment variables are set
- Verify API URL is correct
- Check for missing dependencies

**API calls fail:**
- Verify CORS configuration
- Check backend is running
- Check network connectivity

### Backend Issues

**Database connection fails:**
- Verify DATABASE_URL is correct
- Check database is accessible
- Verify SSL configuration

**Server won't start:**
- Check port is not in use
- Verify all dependencies are installed
- Check logs for errors

### Database Issues

**Migration fails:**
- Verify database exists
- Check connection string
- Run schema manually

**Performance issues:**
- Check database indexes
- Monitor query performance
- Consider upgrading database tier

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   cd backend
   npm update
   cd ../frontend
   npm update
   ```

2. **Monitor Logs**
   - Check error logs regularly
   - Review performance metrics
   - Address issues promptly

3. **Backup Database**
   - Ensure automatic backups are running
   - Test restore process periodically

4. **Security Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Apply patches promptly

### Scaling

**When to scale:**
- Response times > 500ms
- Database CPU > 80%
- Memory usage > 80%
- Error rate increases

**Scaling options:**
- Upgrade database tier
- Add read replicas
- Use CDN for static assets
- Implement caching

## Support

For issues or questions:
- Check logs in respective platforms
- Review error messages in Sentry
- Consult platform documentation
- Check GitHub issues
