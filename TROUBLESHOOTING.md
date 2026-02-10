# Fix "Failed to fetch" Error - Debugging Steps

## The Real Problem

You likely have **one of these issues**:

1. ❌ **Backend is NOT deployed** on Vercel yet
2. ❌ **Backend URL is wrong** in index.html
3. ❌ **GROQ_API_KEY** not set in backend Vercel environment variables

## Quick Fix Steps

### Step 1: Check Vercel Dashboard
Go to [vercel.com/dashboard](https://vercel.com/dashboard)

**Verify you have 2 projects:**
- ✅ `ai-study-buddy` (frontend)
- ✅ `ai-study-buddy-backend` (backend) ← **IS THIS MISSING?**

**If backend is missing:**
1. Click **"Add New" → "Project"**
2. Select your GitHub repo
3. Set Root Directory to `./backend`
4. Deploy
5. Add Environment Variable: `GROQ_API_KEY` = (your key from .env)
6. Redeploy

### Step 2: Get Actual Backend URL
In Vercel backend project, copy the URL (top of deployment page)
Example: `https://ai-study-buddy-backend-abc123.vercel.app`

### Step 3: Update Frontend
Edit `index.html` line 5:
```html
<meta name="backend-url" content="https://YOUR-BACKEND-URL.vercel.app" />
```

### Step 4: Test Backend Directly
Open in browser:
```
https://YOUR-BACKEND-URL.vercel.app/api/health
```

Should show JSON like:
```json
{
  "status": "ok",
  "backend": "running",
  "hasGROQ_API_KEY": true
}
```

### Step 5: Test Frontend
1. Refresh your frontend app
2. Open DevTools (F12) → Console
3. Should see: `🔌 Backend URL: https://...`
4. Enter "DSA" and click "Explain"
5. Should work! ✅

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `/api/health` returns 404 | Backend not deployed |
| `"hasGROQ_API_KEY": false` | Add env var in Vercel backend settings |
| Still shows "Failed to fetch" | Backend URL in index.html is wrong |
| Blank page | Check browser console for errors (F12) |

## Local Testing (Optional)

```bash
# Terminal 1: Start backend locally
cd backend
npm install
node server.js
# Should say "Server listening on http://localhost:5173"

# Terminal 2: Open frontend  
# Use VS Code Live Server
# http://localhost:5500/
```

Then in browser console, you should see working requests logging.
