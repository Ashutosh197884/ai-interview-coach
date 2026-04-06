# AI Interview Coach - Environment Setup Guide

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```env
# Anthropic API Configuration
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# CORS Configuration
# List of allowed origins separated by commas
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Database Configuration (optional)
DATABASE_URL=sqlite:///./interview.db
# For PostgreSQL: postgresql://user:password@localhost/dbname

# API Configuration (optional)
API_PORT=8000
DEBUG=False
```

### Getting Your Anthropic API Key

1. Visit https://console.anthropic.com
2. Sign up or log in to your account
3. Go to "API Keys" section
4. Click "Create Key"
5. Copy the generated key
6. Paste it in your `.env` file

### CORS Origins

Update `ALLOWED_ORIGINS` based on where your frontend is deployed:

**Local Development:**
```
http://localhost:5173,http://localhost:3000
```

**Production with Vercel:**
```
https://your-app-name.vercel.app,https://your-api.onrender.com
```

**Include multiple domains:**
```
http://localhost:5173,https://your-app.vercel.app,https://www.your-domain.com
```

---

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# API Endpoint
VITE_API_URL=http://localhost:8000

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=false
VITE_APP_VERSION=1.0.0
```

### Configuration by Environment

**Development:**
```env
VITE_API_URL=http://localhost:8000
```

**Production (Vercel):**
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

**Staging:**
```env
VITE_API_URL=https://staging-api.onrender.com
```

---

## Docker Deployment

### Using Docker Compose

```bash
# Copy and populate .env
cp backend/.env.example backend/.env
# Edit backend/.env with your API key

# Run both services
docker-compose up --build

# Access applications:
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# Backend API Docs: http://localhost:8000/docs
```

### Using Individual Dockerfiles

**Backend:**
```bash
cd backend
docker build -t ai-interview-coach-backend .
docker run -p 8000:8000 \
  -e ANTHROPIC_API_KEY=your_key_here \
  ai-interview-coach-backend
```

**Frontend:**
```bash
cd frontend
docker build -t ai-interview-coach-frontend .
docker run -p 3000:3000 ai-interview-coach-frontend
```

---

## Vercel Deployment

### Environment Variables in Vercel

1. Go to Vercel Project Settings
2. Navigate to "Environment Variables"
3. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-render-backend.onrender.com`
   - **Environments:** Select "Production" (and Preview if needed)

After adding environment variables:
- Click "Save"
- Redeploy the project for changes to take effect

---

## Render Deployment

### Environment Variables in Render

1. Go to your Render Web Service Dashboard
2. Click "Environment" in the sidebar
3. Add environment variables:
   - `ANTHROPIC_API_KEY`: Your Claude API key
   - `ALLOWED_ORIGINS`: Your frontend URL
   - `DATABASE_URL`: (if using PostgreSQL)
   - `DEBUG`: `False`

4. Click "Save" and redeploy

### Adding Render PostgreSQL

1. In Render Dashboard, create a new PostgreSQL database
2. Render will provide a connection string
3. Add `DATABASE_URL` environment variable with the connection string
4. Update `backend/requirements.txt` to add `psycopg2-binary`
5. Update `backend/database.py` to use PostgreSQL

---

## GitHub Actions Secrets

For automatic deployments, add these secrets to GitHub:

1. Go to repository **Settings** → **Secrets and variables** → **Actions**

### Vercel Secrets
```
VERCEL_TOKEN=<get from vercel.com/account/tokens>
VERCEL_ORG_ID=<from vercel dashboard>
VERCEL_PROJECT_ID=<from vercel project settings>
```

### Render Secrets
```
RENDER_DEPLOY_TOKEN=<from render dashboard>
RENDER_SERVICE_ID=<from render service details>
```

---

## Security Best Practices

⚠️ **NEVER commit `.env` files to Git**

1. Always add `.env` to `.gitignore`:
```
# .gitignore
.env
.env.local
.env.*.local
```

2. Use `.env.example` for documentation:
```bash
# Copy .env.example and fill in actual values
cp .env.example .env
```

3. Rotate API keys regularly:
   - Render/Vercel dashboard secrets are encrypted
   - GitHub Actions secrets are masked in logs
   - Never paste keys in code comments or documentation

4. Use environment-specific secrets:
   - Development: Local `.env` file
   - Staging: Vercel/Render preview/staging environment
   - Production: Main Vercel/Render environment

---

## Troubleshooting

### CORS Errors
- Check `ALLOWED_ORIGINS` includes your frontend domain
- Ensure frontend is using correct `VITE_API_URL`
- Verify backend is running and CORS middleware is configured

### API Key Errors
- Verify `ANTHROPIC_API_KEY` is correct in backend `.env`
- Check Anthropic console for active API key
- Rate limits? Check usage in Anthropic dashboard

### Frontend Not Loading
- Verify `VITE_API_URL` points to running backend
- Check network tab in DevTools for 404/5xx errors
- Clear browser cache and rebuild frontend

### Docker Connection Issues
- Ensure services are on same Docker network
- Use service names (not localhost) in docker-compose
- Check Docker logs: `docker logs <container_id>`

---

## Reference

- [Anthropic API Docs](https://docs.anthropic.com)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Vercel Env Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Render Env Docs](https://render.com/docs/configure-environment)
