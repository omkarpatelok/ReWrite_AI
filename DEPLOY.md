# Vercel Deployment Guide

## Prerequisites
- Vercel account (free at https://vercel.com)
- GitHub account with this repository pushed
- Your OpenRouter API key

## Step-by-Step Deployment

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Easiest)
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Vercel will auto-detect your project settings
5. Click "Environment Variables" and add:
   - **Name**: `API_KEY`
   - **Value**: Your OpenRouter API key
6. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### 3. Configure Environment Variables in Vercel Dashboard

After deployment, go to your project settings:
1. Project → Settings → Environment Variables
2. Add variable:
   - **Name**: `API_KEY`
   - **Value**: Your OpenRouter API key (from https://openrouter.ai)
   - **Environments**: Check all (Production, Preview, Development)

### 4. Test Your Deployment

Visit your Vercel URL (e.g., `https://your-project.vercel.app`):
- ✅ Frontend should load
- ✅ Try rewriting text - should work via `/api/rewrite`
- ✅ Try scoring text - should work via `/api/score`

## File Structure
```
ai-rewriter4/
├── api/
│   ├── rewrite.js    (Serverless function)
│   ├── score.js      (Serverless function)
├── client/
│   ├── .env.local    (Local dev - points to localhost:3001)
│   ├── .env.production (Production - points to /api)
│   └── src/App.jsx   (Updated to use VITE_API_URL)
├── server/           (Optional - kept for local dev)
│   └── index.js
└── vercel.json       (Build configuration)
```

## Local Development

### Start Backend (Local Only)
```bash
cd server
npm install
npm run dev
```

### Start Frontend (Vite)
```bash
cd client
npm install
npm run dev
```

Frontend will automatically use `http://localhost:3001` from `.env.local`

## Production URLs

| Component | URL |
|-----------|-----|
| Frontend | `https://your-project.vercel.app` |
| API - Rewrite | `https://your-project.vercel.app/api/rewrite` |
| API - Score | `https://your-project.vercel.app/api/score` |

## Troubleshooting

### "API Key not found"
- Check Vercel project settings → Environment Variables
- Make sure `API_KEY` is set
- Redeploy after adding env vars: Click "Deployments" → "..." → "Redeploy"

### "CORS errors"
- Check that CORS headers are set in api/*.js files (already included)

### Frontend shows blank or 404
- Check that build output is `client/dist`
- Verify `vercel.json` has correct `outputDirectory`

## Advanced: Custom Domain

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Follow DNS setup instructions from your domain registrar

## Redeploy Changes

After making changes:
```bash
git add .
git commit -m "Your message"
git push origin main
```

Vercel will automatically trigger a new deployment from the linked GitHub repository.
