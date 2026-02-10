# Deployment Guide - Fixing "Failed to fetch" Error

## Problem
After deploying to Vercel, you get "Failed to fetch" because:
1. Frontend tries to connect to `localhost:5173` (doesn't exist in production)
2. Backend is not deployed (only runs locally)
3. No CORS configuration for production URLs

## Solution: Complete Deployment Steps

### Step 1: Deploy Backend First

#### Option A: Deploy on Vercel (Same as Frontend)
1. Push your `/backend` folder to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New..." → "Project"
4. Import your repository
5. Select the `/backend` folder as the source
6. Add Environment Variables:
   - `GROQ_API_KEY`: Your Groq API key (get from [console.groq.com](https://console.groq.com))
   - `PORT`: `3000` (Vercel uses dynamic ports)
7. Deploy
8. Copy the deployed backend URL (e.g., `https://ai-study-buddy-backend.vercel.app`)

#### Option B: Deploy on Other Platforms
- **Railway**: [railway.app](https://railway.app) - Easiest for Node.js
- **Render**: [render.com](https://render.com) - Free tier available
- **Heroku**: [heroku.com](https://heroku.com) - Paid plans

### Step 2: Update Frontend with Backend URL

#### In Vercel Dashboard:
1. Go to your frontend project settings
2. Go to "Environment Variables"
3. Add: `REACT_APP_BACKEND_URL=https://your-backend-url.vercel.app`
4. Redeploy

#### OR Update in code:
Edit `config.js` and update the URL:
```javascript
window.__BACKEND_URL__ = 'https://your-backend-url.vercel.app';
```

### Step 3: Update Server CORS (if needed)

Edit `backend/server.js` - your CORS is already good:
```javascript
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
```

## Quick Checklist

✅ Backend deployed with `GROQ_API_KEY` env var set  
✅ Copied backend URL  
✅ Updated `config.js` with backend URL  
✅ Frontend redeployed  
✅ Test: Open deployed frontend and click "Explain"  

## Testing Locally Before Deployment

```bash
# Terminal 1: Start backend
cd backend
npm install
node server.js

# Terminal 2: Open index.html
# Open http://localhost:5500/ in browser
# (or use Live Server extension in VS Code)
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| Failed to fetch | Backend not deployed or URL incorrect |
| 404 error | Backend endpoint missing (check `/api/explain`, `/api/summarize`, `/api/quiz`) |
| CORS error | Add `Access-Control-Allow-Origin` header in backend |
| Blank loading | Check browser console (F12) for detailed errors |

## Files Updated

- ✅ `app.js` - Now reads backend URL from config
- ✅ `config.js` - New file with environment detection
- ✅ `index.html` - Loads config.js before app.js
- ✅ `backend/vercel.json` - Configuration for Vercel deployment
- ✅ `backend/.env.example` - Template for environment variables
