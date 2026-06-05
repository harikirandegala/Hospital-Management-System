# 🏥 Local Development Setup Guide

## Prerequisites

- Node.js 20+ (https://nodejs.org)
- PostgreSQL 16 (or Docker)
- Git

---

## Option A: Using Docker Compose (Recommended)

### 1. Install Docker

- **Windows/Mac**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: Install Docker and Docker Compose from package manager

### 2. Start Services

```bash
cd hms
docker compose up --build
```

Wait for all services to be healthy (~2-3 minutes).

**Services will be available at:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/health
- Database: localhost:5432 (postgres/postgres123)

### 3. Seed Demo Data

```bash
# In a new terminal
docker compose exec backend npm run db:seed
```

---

## Option B: Local Development (Manual)

### 1. Setup Backend

```bash
cd backend
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with local database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=hms_db
# DB_USER=postgres
# DB_PASSWORD=postgres123
```

### 2. Create Database

```bash
# Using PostgreSQL (ensure PostgreSQL is running)
createdb hms_db

# Or using Docker (without full compose)
docker run --name hms-postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=hms_db -p 5432:5432 -d postgres:16-alpine
```

### 3. Run Database Setup

```bash
# In backend directory
npm run db:migrate
npm run db:seed
```

### 4. Start Backend

```bash
npm run dev
# Backend starts at http://localhost:5000
```

### 5. Setup Frontend

```bash
# In new terminal, from project root
cd frontend
npm install

# No .env needed for local development
# It will use proxy to http://localhost:5000
```

### 6. Start Frontend

```bash
npm run dev
# Frontend starts at http://localhost:5173
```

---

## 🔐 Demo Credentials

After seeding, use these to login:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | password123 |
| Doctor | priya@hospital.com | password123 |
| Patient | hari@example.com | password123 |
| Receptionist | kavitha@hospital.com | password123 |

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
psql -U postgres -h localhost

# If using Docker, check container
docker ps | grep postgres
```

### CORS Errors

```bash
# Ensure CLIENT_URL matches frontend URL
# Check .env has: CLIENT_URL=http://localhost:5173
```

### Socket.IO Not Connecting

```bash
# Open DevTools (F12) → Network tab
# Look for WebSocket connection to /socket.io
# Check browser console for errors
```

---

## 📊 Architecture

```
Frontend (React)
    ↓
Vite Dev Server (localhost:5173)
    ↓
Axios API Client
    ↓
Express Backend (localhost:5000)
    ↓
PostgreSQL Database (localhost:5432)
```

---

## 🔄 Development Workflow

### Make Backend Changes

```bash
# Backend auto-reloads with nodemon
# Edit files in backend/src/
```

### Make Frontend Changes

```bash
# Frontend auto-reloads via Vite HMR
# Edit files in frontend/src/
```

### Add New Package

```bash
# Backend
cd backend && npm install <package-name>

# Frontend
cd frontend && npm install <package-name>
```

---

## 📝 Debugging

### View Logs

```bash
# Backend logs
docker compose logs backend -f

# PostgreSQL logs
docker compose logs db -f
```

### Open Database

```bash
# Using psql
psql -h localhost -U postgres -d hms_db

# Or use database GUI (DBeaver, pgAdmin)
# URL: postgresql://postgres:postgres123@localhost:5432/hms_db
```

### Debug Frontend

```bash
# DevTools (F12)
# Check Network tab for API calls
# Check Console for JS errors
# React DevTools extension helpful
```

---

## 🚀 Next Steps

1. ✅ Code locally with auto-reload
2. ✅ Test features across roles
3. ✅ Check API in Postman/Thunder Client
4. ✅ Review logs for errors
5. ✅ Ready to deploy to Vercel/Render (see DEPLOYMENT_GUIDE.md)

---

**Last Updated**: June 2024
