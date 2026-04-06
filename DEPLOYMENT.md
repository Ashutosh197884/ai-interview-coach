# Deployment Guide

This guide covers deploying the AI Interview Coach application to GitHub, Vercel (frontend), and Render (backend).

## Prerequisites

- GitHub account (https://github.com)
- Vercel account (https://vercel.com) - free tier available
- Render account (https://render.com) - free tier available
- Anthropic API key (for Claude AI integration)

## Step 1: Push to GitHub

### Initial Setup (if not done already)

```bash
cd ai-interview-coach
git init
git add .
git commit -m "Initial commit: AI Interview Coach with professional UI"
```

### Connect to GitHub Repository

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `ai-interview-coach`
   - Description: "AI-powered mock interview platform with real-time feedback"
   - Choose Public for open source project
   - **Don't** initialize with README/gitignore (we have these)
   - Click "Create repository"

2. **Push code to GitHub:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-interview-coach.git
git branch -M main
git push -u origin main
```

3. **Verify:** Visit `https://github.com/YOUR_USERNAME/ai-interview-coach` to confirm your code is there.

---

## Step 2: Deploy Frontend to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to https://vercel.com/dashboard**
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select `frontend` as the root directory
5. Add environment variables:
   - `VITE_API_URL`: (leave blank to use default http://localhost:8000, or set to your backend URL after deploying backend)
6. Click "Deploy"
7. Your frontend will be live at: `https://your-project-name.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel --prod

# Follow prompts and link to your GitHub project
```

### Configure Environment Variables

After deploying:
1. Go to your Vercel project settings
2. Add environment variable: `VITE_API_URL` = `https://your-backend-url.com`
3. Redeploy for changes to take effect

---

## Step 3: Deploy Backend to Render

### 1. Prepare Your Backend

Make sure `backend/.env.example` exists with:
```
ANTHROPIC_API_KEY=your_key_here
ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-app.vercel.app
```

### 2. Deploy to Render

1. **Go to https://dashboard.render.com**
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the repository `ai-interview-coach`
5. Configure the service:
   - **Name:** `ai-interview-coach-api`
   - **Environment:** `Python 3.10`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0`
   - **Root Directory:** `backend`
6. Click "Advanced" and add environment variables:
   - `ANTHROPIC_API_KEY`: Your Claude API key
   - `ALLOWED_ORIGINS`: `https://your-vercel-app.vercel.app,http://localhost:5173`
7. Click "Create Web Service"
8. Your backend will be live at: `https://your-app-name.onrender.com`

### 3. Update Frontend with Backend URL

1. Go to your Vercel project settings
2. Update `VITE_API_URL` environment variable with your Render backend URL
3. Trigger a redeploy in Vercel

---

## Step 4: Setup GitHub Actions CI/CD

The `.github/workflows/deploy.yml` file is already configured. To enable automatic deployments:

### Add GitHub Secrets

1. **Go to repository Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

**For Vercel:**
- `VERCEL_TOKEN`: Get from https://vercel.com/account/tokens
- `VERCEL_ORG_ID`: From Vercel dashboard
- `VERCEL_PROJECT_ID`: From Vercel project settings

**For Render:**
- `RENDER_DEPLOY_TOKEN`: Get from Render dashboard settings
- `RENDER_SERVICE_ID`: From your web service details

### How It Works

- Every push to `main` branch automatically:
  1. Runs tests on Python backend (syntax check)
  2. Builds frontend (npm run build)
  3. Deploys frontend to Vercel (if tests pass)
  4. Deploys backend to Render (if tests pass)

---

## Testing Your Deployment

### Test Frontend

1. Visit your Vercel deployment URL
2. Fill in the setup form
3. Should connect to your Render backend

### Test Backend

```bash
curl https://your-render-backend.onrender.com/docs
```

You should see the FastAPI Swagger documentation.

### Test API Communication

1. Open browser DevTools (F12)
2. Go to Network tab
3. Start an interview
4. Verify API calls go to your Render backend URL
5. Check responses in DevTools → Application → Console

---

## Troubleshooting

### Frontend not connecting to backend
- Check `VITE_API_URL` environment variable in Vercel
- Verify backend `ALLOWED_ORIGINS` includes your Vercel domain
- Check browser console for CORS errors

### Backend deployment fails
- Verify `ANTHROPIC_API_KEY` is set in Render environment
- Check build logs in Render dashboard
- Ensure `requirements.txt` is up to date

### CI/CD not running
- Verify GitHub Actions is enabled in repository settings
- Check workflow file syntax in `.github/workflows/deploy.yml`
- Verify all secrets are set correctly in GitHub Settings

---

## Database Persistence

Currently using SQLite. To persist data across deployments:

**Option 1: Use Render PostgreSQL** (Recommended)
- In Render dashboard, create PostgreSQL instance
- Update backend `requirements.txt` to include `psycopg2-binary`
- Update `database.py` to use PostgreSQL connection string

**Option 2: Render Persistent Disk**
- Configure in Render service settings
- Sets up persistent storage for SQLite database

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy frontend to Vercel
3. ✅ Deploy backend to Render
4. ✅ Setup GitHub Actions
5. 🔄 Enable auto-deployment on push
6. 📊 Monitor deployments in respective dashboards
7. 📈 Scale up when needed (Render/Vercel paid plans)

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **GitHub Actions:** https://docs.github.com/en/actions
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment/

