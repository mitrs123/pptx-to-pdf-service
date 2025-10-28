# ❌ 520 Error - Quick Fix Guide

## What is a 520 Error?

A **520 error** is a Cloudflare error that occurs when:
- The origin server (Render) is not responding
- The service crashed during request
- The service spun down due to inactivity (free tier)
- Service timeout or memory issues

## 🚨 Immediate Solutions

### Solution 1: Warm Up the Service (Fastest Fix)

Before using the service, ping the health endpoint:

```bash
curl https://pptx-to-pdf-service.onrender.com/health
```

Wait for "ok" response, then try your conversion again.

---

### Solution 2: Setup Automatic Keep-Alive

Prevent the service from spinning down by pinging it every 10 minutes.

#### Option A: Use cron-job.org (Free)

1. Go to [cron-job.org](https://cron-job.org)
2. Create free account
3. Add new cron job:
   - **Title:** Keep PPTX service alive
   - **URL:** `https://pptx-to-pdf-service.onrender.com/health`
   - **Schedule:** Every 10 minutes
   - **Request Method:** GET

#### Option B: Use GitHub Actions (Free)

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Service Alive

on:
  schedule:
    - cron: '*/10 * * * *' # Every 10 minutes
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Service
        run: |
          curl https://pptx-to-pdf-service.onrender.com/health
```

#### Option C: Run Keep-Alive Script

```bash
# Install dependencies
npm install

# Run keep-alive script (keep it running)
node scripts/keep-alive.js
```

---

### Solution 3: Upgrade Render Service (Best Long-term)

Free tier limitation:
- ❌ Spins down after 15 min inactivity
- ❌ 256MB memory limit
- ❌ Slow cold starts

Upgrade to **Starter Plan ($7/month)**:
- ✅ Always-on (never spins down)
- ✅ 512MB memory
- ✅ Faster response times
- ✅ Better reliability

**How to upgrade:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your service
3. Click "Manual Deploy" → Select "Starter" plan
4. Click "Apply"

---

### Solution 4: Increase Render Memory

If using free tier and hitting memory limits:

1. Go to Render Dashboard
2. Click on your service
3. Go to "Settings" tab
4. Find "Memory Limit" (if available)
5. Increase to maximum (varies by plan)

---

## 🔍 Diagnosing the Issue

### Step 1: Check Service Status

```bash
# Test health endpoint
curl https://pptx-to-pdf-service.onrender.com/health

# Expected response: "ok"
# If no response or error: Service is down
```

### Step 2: Check Render Logs

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your service
3. Click "Logs" tab
4. Look for:
   - ✅ "PPTX->PDF service listening on 3000" - Service is running
   - ❌ "ERROR" or "CRASH" - Service is crashing
   - ❌ "out of memory" - Need more RAM
   - ❌ "timeout" - Request took too long

### Step 3: Check File Size

Large PPTX files can cause 520 errors due to:
- Timeout (service takes too long to convert)
- Memory issues (service runs out of RAM)

**File size recommendations:**
- ✅ Under 5MB: Should work fine
- ⚠️ 5-15MB: May timeout on free tier
- ❌ Over 15MB: Likely to crash on free tier

---

## 🛠 Technical Fixes

### Fix 1: Increase Request Timeout

The service now has a 4-minute timeout. If your files need more time:

Edit `src/index.js`:
```javascript
const REQUEST_TIMEOUT = 600000; // 10 minutes (was 4 minutes)
```

### Fix 2: Add Retry Logic in Your Client Code

```javascript
async function convertWithRetry(s3Key, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // First, ensure service is awake
      await fetch('https://pptx-to-pdf-service.onrender.com/health');
      
      // Wait a moment for service to fully wake up
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Now do the conversion
      const response = await fetch(
        'https://pptx-to-pdf-service.onrender.com/convert',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ s3Key })
        }
      );
      
      if (response.ok) {
        return await response.json();
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
```

### Fix 3: Use Different Free Hosting

If Render is too problematic, consider alternatives:

**Railway (Free tier):**
- Better free tier than Render
- More reliable

**Fly.io (Free tier):**
- Generous free tier
- Always-on available

**Render Paid ($7/month):**
- Best option for production use
- Guaranteed uptime

---

## 📊 Error Codes Reference

| Code | Meaning | Solution |
|------|---------|----------|
| 520 | Origin error | Service crashed or timed out |
| 521 | Web server down | Service spun down (free tier) |
| 522 | Connection timeout | Request took too long |
| 503 | Service unavailable | Service starting up (cold start) |

---

## ✅ Prevention Checklist

1. ✅ Setup automatic keep-alive (ping every 10 minutes)
2. ✅ Check file sizes (keep under 15MB)
3. ✅ Add retry logic in client code
4. ✅ Monitor Render logs regularly
5. ✅ Upgrade to paid plan if used frequently
6. ✅ Test with small files first

---

## 🆘 Still Having Issues?

1. **Check service is running:**
   ```bash
   curl https://pptx-to-pdf-service.onrender.com/health
   ```

2. **Restart the service:**
   - Go to Render Dashboard
   - Click "Manual Deploy"
   - Click "Apply"

3. **Check AWS credentials:**
   - Verify AWS credentials are correct
   - Ensure IAM permissions allow S3 access

4. **Test with smaller file:**
   - Try with a small PPTX (< 1MB) first
   - If works, issue is file-specific

5. **Contact support:**
   - Check Render support
   - Check AWS support (if S3 issue)

---

**Pro Tip:** The best solution is to upgrade to Render's paid plan ($7/month) for production use. Free tier is only suitable for testing/demo purposes.


