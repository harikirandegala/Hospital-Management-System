# ⚡ Quick Reference - HMS Deployment & Development

## 🚀 Deploy in 3 Steps

```
Step 1: Supabase Setup
→ Visit https://app.supabase.com
→ New Project → Copy DATABASE_URL

Step 2: Deploy Backend (Render)
→ Connect GitHub → Select 'backend' folder
→ Add DATABASE_URL to env vars
→ Deploy → Copy backend URL

Step 3: Deploy Frontend (Vercel)
→ Connect GitHub → Select 'frontend' folder
→ Add VITE_API_URL & VITE_SOCKET_URL
→ Deploy → Done! ✅
```

---

## 🔐 Generate JWT Secrets

```bash
# Run these commands (one at a time)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy outputs to JWT_SECRET and JWT_REFRESH_SECRET

---

## 📋 Environment Variables

### Backend (Render)
```
NODE_ENV=production
DATABASE_URL=[From Supabase]
JWT_SECRET=[Generated above]
JWT_REFRESH_SECRET=[Generated above]
CLIENT_URL=https://[your-vercel-url].vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://[your-render-url].onrender.com/api
VITE_SOCKET_URL=https://[your-render-url].onrender.com
```

---

## 🧪 Local Development

### Start Everything
```bash
docker compose up --build
```

Wait 2-3 minutes, then visit:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000/health

### Demo Login
```
Email: admin@hospital.com
Password: password123
```

---

## 🔍 Debugging

| Issue | Check |
|-------|-------|
| 401 Unauthorized | JWT_SECRET matches, token in localStorage |
| CORS Error | CLIENT_URL set correctly on backend |
| Socket.IO Not Connecting | VITE_SOCKET_URL set correctly |
| 502 Bad Gateway | Check Render logs, DATABASE_URL valid |
| Blank Page | Check browser console (F12) for JS errors |

---

## 📁 File Structure

```
backend/
├── src/
│   ├── server.js          ← Entry point
│   ├── config/
│   │   ├── database.js    ← Supabase config
│   │   ├── logger.js
│   │   └── socket.js
│   ├── controllers/       ← API logic
│   ├── routes/            ← API endpoints
│   └── middleware/        ← Auth, validation

frontend/
├── src/
│   ├── main.jsx           ← Entry point
│   ├── App.jsx            ← Routes
│   ├── services/
│   │   └── api.js         ← API client
│   ├── pages/             ← Screen components
│   ├── components/        ← Reusable UI
│   └── context/           ← Auth store (Zustand)

docker-compose.yml        ← Local dev config
```

---

## 🔄 Common Tasks

### Push to Deploy
```bash
git add .
git commit -m "message"
git push origin main
# Auto-deploys to Vercel & Render
```

### View Logs

**Render Backend**
```
Dashboard → Select 'hms-backend' → Logs tab
```

**Vercel Frontend**
```
Dashboard → Select project → Deployments → Logs
```

**Database**
```
Supabase → Project → Logs
```

### Update Environment Variables

**Render**: Dashboard → Web Service → Environment
**Vercel**: Dashboard → Project → Settings → Environment Variables

### Rollback Deployment

**Render**: Dashboard → Redeploys tab → Select older version
**Vercel**: Dashboard → Deployments → Select previous deployment

---

## 🆘 Emergency Commands

### Reset Frontend Build Cache
```bash
# In Vercel: Settings → Advanced → Clear Build Cache
```

### Check Backend Health
```bash
curl https://your-backend.onrender.com/health
```

### Test Database Connection
```bash
# From any terminal with psql installed
psql [DATABASE_URL]
```

---

## 📚 Full Documentation Links

- **DEPLOYMENT_GUIDE.md** - Complete deployment walkthrough
- **LOCAL_SETUP.md** - Development environment setup
- **DEPLOYMENT_CHECKLIST.md** - Pre/post deployment verification
- **DEPLOYMENT_SUMMARY.md** - Configuration summary

---

## 🎯 Quick Checklist Before Going Live

- [ ] Generated JWT secrets (not defaults)
- [ ] Supabase project created
- [ ] Render service deployed
- [ ] Vercel project deployed
- [ ] Environment variables set on both platforms
- [ ] Frontend can login and fetch data
- [ ] Socket.IO connects without errors
- [ ] No 401 errors in console
- [ ] No CORS errors

---

## 📞 Quick Support

**Render Issues**: https://render.com/docs  
**Vercel Issues**: https://vercel.com/docs  
**Supabase Issues**: https://supabase.com/docs  
**Express Docs**: https://expressjs.com  

---

**Status**: 🟢 READY TO DEPLOY  
**Last Updated**: June 2024
