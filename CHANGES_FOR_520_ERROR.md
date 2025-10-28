# Changes Made to Fix 520 Error

## Problem
The PPTX-to-PDF service was returning 520 errors due to:
1. Service spinning down on Render free tier (15 min inactivity)
2. No timeout handling for long conversions
3. Memory issues causing crashes
4. No retry logic
5. Limited error handling

## Changes Made

### 1. Enhanced Timeout Handling (`src/index.js`)

**Added conversion timeout (3 minutes):**
```javascript
const TIMEOUT_MS = 180000; // 3 minutes
const timeout = setTimeout(() => {
  proc.kill('SIGTERM');
  reject(new Error('Conversion timeout: exceeded 3 minutes'));
}, TIMEOUT_MS);
```

**Added request timeout (4 minutes):**
```javascript
const REQUEST_TIMEOUT = 240000; // 4 minutes total timeout
const timeout = setTimeout(() => {
  if (!res.headersSent) {
    res.status(504).json({ error: 'Request timeout: service took too long to respond' });
  }
}, REQUEST_TIMEOUT);
```

### 2. Improved LibreOffice Configuration

**Added optimization flags:**
```javascript
'--nodefault',
'--nolockcheck',
'--nofirststartwizard',
```

**Added environment variables for stability:**
```javascript
env: {
  ...process.env,
  OPENOFFICE_HOME: '',
  OO_SKIP_NATIVITY_LOADER: '1',
  SAL_USE_VCLPLUGIN: 'sv',
}
```

### 3. Enhanced Logging

**Added timestamped logging:**
```javascript
console.log(`[${new Date().toISOString()}] ⬇️ Downloading from S3:`, s3Key);
console.log(`[${new Date().toISOString()}] ⬇️ Downloaded in ${Date.now() - downloadStart}ms`);
console.log(`[${new Date().toISOString()}] 🔄 Converting with LibreOffice:`, localPptx);
// etc.
```

### 4. Better Error Handling

**Proper HTTP status codes:**
```javascript
const statusCode = err.message.includes('timeout') ? 504 
                 : err.message.includes('does not exist') ? 404
                 : 500;
```

### 5. Memory Monitoring

**Added periodic memory checks:**
```javascript
setInterval(async () => {
  const used = process.memoryUsage();
  const usedMB = Math.round((used.heapUsed / 1024 / 1024) * 100) / 100;
  console.log(`💾 Memory: ${usedMB} MB`);
}, 60000); // Every minute
```

### 6. New Documentation

**Created comprehensive troubleshooting guide:**
- `TROUBLESHOOTING_520_ERROR.md` - Complete guide to fix 520 errors
- Updated `README.md` with 520 error section
- Created `scripts/keep-alive.js` for automatic keep-alive

### 7. Render Configuration

**Created `render.yaml` for better deployment:**
```yaml
services:
  - type: web
    name: pptx-to-pdf-service
    env: docker
    plan: free
    region: singapore
    healthCheckPath: /health
    autoDeploy: true
```

### 8. Keep-Alive Script

**Created `scripts/keep-alive.js`:**
- Automatic pinging every 10 minutes
- Prevents service from spinning down
- Can be run on any server/cron job

## How to Use the Fixes

### Option 1: Quick Fix (Immediate)
```bash
# Warm up the service before use
curl https://pptx-to-pdf-service.onrender.com/health
```

### Option 2: Automatic Keep-Alive
```bash
# Run keep-alive script
export SERVICE_URL=https://pptx-to-pdf-service.onrender.com
node scripts/keep-alive.js
```

### Option 3: Upgrade to Paid Plan
- Go to Render dashboard
- Upgrade to Starter plan ($7/month)
- Service stays always-on, never spins down

### Option 4: External Cron Job
Use services like [cron-job.org](https://cron-job.org) to ping `/health` endpoint every 10 minutes.

## Expected Improvements

✅ **No more 520 errors** from timeout issues  
✅ **Better error messages** with proper HTTP codes  
✅ **Faster debugging** with detailed timestamps in logs  
✅ **Memory monitoring** to catch issues early  
✅ **Automatic cleanup** of timeouts  
✅ **More reliable conversions** with optimized LibreOffice settings  

## Testing

After deploying, test with:
```bash
# 1. Check service is running
curl https://pptx-to-pdf-service.onrender.com/health

# 2. Test conversion
curl -X POST https://pptx-to-pdf-service.onrender.com/convert \
  -H "Content-Type: application/json" \
  -d '{"s3Key":"dev-RE2174/proposals/RE2174_rajesh_kumar_P23.pptx"}'
```

## Next Steps

1. **Deploy the changes:**
   ```bash
   git add .
   git commit -m "Fix 520 error with timeouts and better error handling"
   git push
   ```

2. **Setup keep-alive** (choose one):
   - Use cron-job.org (free)
   - Run keep-alive script on a server
   - Upgrade to paid plan

3. **Monitor logs:**
   - Check Render dashboard logs
   - Look for memory warnings
   - Watch for timeout errors

## Files Changed

- `src/index.js` - Enhanced with timeouts and better error handling
- `README.md` - Added 520 error troubleshooting section
- `TROUBLESHOOTING_520_ERROR.md` - Complete troubleshooting guide
- `scripts/keep-alive.js` - Keep-alive script
- `render.yaml` - Render configuration

## Additional Recommendations

1. **Upgrade to paid plan** for production use ($7/month)
2. **Use keep-alive service** if staying on free tier
3. **Monitor file sizes** (keep under 15MB for free tier)
4. **Add retry logic** in client code
5. **Check Render logs** regularly


