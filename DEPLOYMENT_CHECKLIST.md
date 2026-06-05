# 📋 Pre-Deployment Checklist

## Backend Configuration ✅

- [x] `.env.example` updated with Supabase option
- [x] Database config accepts DATABASE_URL (Supabase)
- [x] Logger handles file creation automatically
- [x] Server uses logger instead of console.log
- [x] JWT configuration in environment
- [x] CORS configured with CLIENT_URL environment variable
- [x] Rate limiting in place
- [x] Error handling middleware configured
- [x] Socket.IO uses CLIENT_URL
- [x] Connection pooling configured for production

## Frontend Configuration ✅

- [x] `.env.example` with VITE_API_URL and VITE_SOCKET_URL
- [x] API service uses environment variables
- [x] Socket.IO hook uses VITE_SOCKET_URL
- [x] Token refresh uses correct API URL
- [x] Vite config optimized for production
- [x] Code splitting configured
- [x] Environment detection for localhost

## Deployment Files ✅

- [x] `render.yaml` created for Render deployment
- [x] `vercel.json` configured for SPA routing
- [x] `.gitignore` includes .env files
- [x] `DEPLOYMENT_GUIDE.md` with step-by-step instructions
- [x] `LOCAL_SETUP.md` for development

## Security ⚠️ TODO Before Deployment

- [ ] Generate unique JWT_SECRET
- [ ] Generate unique JWT_REFRESH_SECRET
- [ ] Set strong database password
- [ ] Update CLIENT_URL to production frontend URL
- [ ] Verify HTTPS URLs in production
- [ ] Enable rate limiting (already in code)
- [ ] Setup CORS properly for production domain
- [ ] Remove console.log from production code
- [ ] Add API key validation if needed
- [ ] Setup HTTPS certificates (Vercel/Render handle this)

## Testing Checklist 🧪

### Local Testing
- [ ] Run `docker compose up --build`
- [ ] Database syncs without errors
- [ ] Seed completes successfully
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend responds at http://localhost:5000/health
- [ ] Socket.IO connects without errors
- [ ] Login works with demo credentials
- [ ] Refresh token works
- [ ] API calls return correct data

### Pre-Production
- [ ] Created Supabase project
- [ ] Created Render account
- [ ] Created Vercel account
- [ ] GitHub repository is public/accessible
- [ ] All environment variables documented

### Post-Deployment
- [ ] Frontend loads from Vercel URL
- [ ] Backend responds from Render URL
- [ ] Database connection works
- [ ] Login with test account works
- [ ] API calls succeed
- [ ] Socket.IO connections established
- [ ] No CORS errors in console
- [ ] No 401 token errors
- [ ] Images/assets load correctly

## Environment Variables by Platform

### Render (Backend)
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=[GENERATED]
JWT_REFRESH_SECRET=[GENERATED]
CLIENT_URL=https://[vercel-url].vercel.app
```

### Vercel (Frontend)
```
VITE_API_URL=https://[render-url].onrender.com/api
VITE_SOCKET_URL=https://[render-url].onrender.com
```

### Supabase
- Database created
- SSL enabled
- Connection string copied

## Troubleshooting Links

- [Render Troubleshooting](https://render.com/docs/troubleshooting)
- [Vercel Troubleshooting](https://vercel.com/docs/troubleshooting)
- [Supabase Issues](https://supabase.com/docs/guides/resources/troubleshooting)

## Quick Deploy Commands

```bash
# Deploy backend to Render
git push origin main

# Deploy frontend to Vercel
git push origin main

# (Both auto-deploy when GitHub is connected)
```

## Post-Deployment Monitoring

- Monitor Render logs for errors
- Check Vercel deployment logs
- Monitor database connections
- Track API response times
- Setup error tracking (Sentry, etc.)

---

**Status**: 🟢 Ready for Deployment  
**Last Updated**: June 2024
