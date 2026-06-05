# 🚀 HMS DEPLOYMENT GUIDE

Complete guide to deploy MediCore HMS across Vercel, Render, and Supabase.

---

## 📋 Prerequisites

- GitHub account with repository pushed
- [Vercel account](https://vercel.com)
- [Render account](https://render.com)
- [Supabase account](https://supabase.com)

---

## 🗄️ STEP 1: Setup Supabase Database

### 1.1 Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: `hms-production` (or preferred name)
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait for database creation (5-10 minutes)

### 1.2 Get Database Connection String

1. Go to **Settings** → **Database**
2. Copy the **PostgreSQL Connection String** (looks like: `postgresql://postgres:password@...`)
3. Replace `[YOUR-PASSWORD]` with your database password
4. Save this URL securely - you'll need it for Render

### 1.3 Create Database Tables

1. Go to **SQL Editor** in Supabase
2. Create a new query and run the initialization script
3. Or let Render/Backend auto-sync (via Sequelize)

---

## 🌐 STEP 2: Deploy Backend on Render

### 2.1 Connect GitHub Repository

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Click **Connect GitHub account** and authorize
4. Select your `hms` repository
5. Choose **Branch**: `main` (or your main branch)

### 2.2 Configure Web Service

Fill in:

- **Name**: `hms-backend` (or preferred)
- **Runtime**: `Node`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2.3 Set Environment Variables

Click **Environment** and add:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=[Your Supabase Connection String]
JWT_SECRET=[Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_REFRESH_SECRET=[Generate another secure string]
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=https://your-frontend-vercel-url.vercel.app
```

⚠️ **Generate JWT secrets locally**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run this command twice for JWT_SECRET and JWT_REFRESH_SECRET.

### 2.4 Deploy

1. Click **Create Web Service**
2. Wait for deployment to complete (2-5 minutes)
3. Copy your backend URL: `https://hms-backend.onrender.com` (exact URL shown in dashboard)
4. ✅ Save this URL for frontend configuration

---

## 🎨 STEP 3: Deploy Frontend on Vercel

### 3.1 Connect GitHub

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Search for your repository and click **Import**
4. Select **Framework**: `Vite`
5. **Root Directory**: `frontend`

### 3.2 Set Environment Variables

Before deploying, add:

```
VITE_API_URL=https://hms-backend.onrender.com/api
VITE_SOCKET_URL=https://hms-backend.onrender.com
```

Replace `hms-backend.onrender.com` with your actual Render backend URL.

### 3.3 Deploy

1. Click **Deploy**
2. Wait for build to complete (~3-5 minutes)
3. Copy your frontend URL: `https://your-project.vercel.app`
4. ✅ Note this for backend update

---

## 🔄 STEP 4: Update Backend with Frontend URL

### 4.1 In Render Dashboard

1. Go to your `hms-backend` service
2. Click **Environment** → **Edit**
3. Update `CLIENT_URL` to your Vercel frontend URL: `https://your-project.vercel.app`
4. Click **Save**
5. Backend automatically redeploys (~1-2 minutes)

---

## ✅ STEP 5: Verify Deployment

### 5.1 Test Backend

```bash
# Check health endpoint
curl https://hms-backend.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-...","uptime":...}
```

### 5.2 Test Frontend

1. Open your Vercel URL: `https://your-project.vercel.app`
2. Try to **Register** or **Login**
3. Check browser console for any errors (F12)
4. Verify Socket.IO connection in Network tab

### 5.3 Test Database Connection

1. In browser, open **DevTools** (F12)
2. Go to **Console**
3. Check for connection errors
4. Try creating/reading data through the app

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

```bash
# Check VITE_API_URL
# Should be: https://hms-backend.onrender.com/api

# Check CORS headers
# Backend should have CLIENT_URL set to your Vercel URL
```

### Database connection fails

```bash
# Verify DATABASE_URL format:
postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DB]?sslmode=require

# Check Supabase credentials are correct
# Check Render logs for connection errors
```

### Socket.IO not working

```bash
# Verify VITE_SOCKET_URL is set correctly
# Check Network tab for WebSocket connections
# Ensure CLIENT_URL matches in backend
```

### Login returns 401

```bash
# Check JWT_SECRET matches on backend
# Clear browser localStorage and try again
# Check backend logs: Render → Logs tab
```

---

## 📊 Project URLs After Deployment

| Component | URL |
|-----------|-----|
| Frontend | `https://your-project.vercel.app` |
| Backend API | `https://hms-backend.onrender.com` |
| API Health | `https://hms-backend.onrender.com/health` |
| Database | Supabase (no direct URL needed) |

---

## 🔐 Security Checklist

- [ ] JWT_SECRET changed from default
- [ ] DATABASE_URL has SSL enabled (`?sslmode=require`)
- [ ] CLIENT_URL set to production frontend URL
- [ ] Environment variables NOT committed to git
- [ ] Backend logs monitored for errors
- [ ] CORS properly configured

---

## 📱 Environment Files Summary

### Backend (.env on Render)
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...?sslmode=require
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
CLIENT_URL=https://your-vercel-url.vercel.app
```

### Frontend (Vercel Environment Variables)
```
VITE_API_URL=https://hms-backend.onrender.com/api
VITE_SOCKET_URL=https://hms-backend.onrender.com
```

---

## 🔄 Redeploy Instructions

### Update Backend Code
```bash
git push origin main
# Render auto-deploys from GitHub
```

### Update Frontend Code
```bash
git push origin main
# Vercel auto-deploys from GitHub
```

### Update Environment Variables
- Vercel: Dashboard → Project → Settings → Environment Variables
- Render: Dashboard → Web Service → Environment

---

## 📞 Support

- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
- Check logs in respective dashboards

---

**Last Updated**: June 2024
