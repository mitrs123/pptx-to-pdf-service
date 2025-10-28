/**
 * Keep-Alive Script for Render Free Tier
 * 
 * This script pings your Render service every 10 minutes
 * to prevent it from spinning down due to inactivity.
 * 
 * Run this on a separate server or as a scheduled job:
 * - AWS Lambda with CloudWatch Events
 * - Cron job on a VPS
 * - GitHub Actions scheduled workflow
 * - Any hosting service that can run cron jobs
 */

const SERVICE_URL = process.env.SERVICE_URL || 'https://pptx-to-pdf-service.onrender.com';
const PING_INTERVAL = 600000; // 10 minutes (Render spins down after 15 min)

async function pingService() {
  try {
    const response = await fetch(`${SERVICE_URL}/health`);
    const text = await response.text();
    
    if (text === 'ok') {
      console.log(`✅ [${new Date().toISOString()}] Service is alive`);
    } else {
      console.log(`⚠️ [${new Date().toISOString()}] Unexpected response: ${text}`);
    }
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Error pinging service:`, error.message);
  }
}

// Ping immediately
console.log(`🚀 Starting keep-alive for: ${SERVICE_URL}`);
pingService();

// Then ping every 10 minutes
setInterval(pingService, PING_INTERVAL);

console.log(`⏰ Will ping every ${PING_INTERVAL / 1000 / 60} minutes`);


