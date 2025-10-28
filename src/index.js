import express from 'express';
import dotenv from 'dotenv';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { spawn } from 'child_process';
import crypto from 'crypto';

dotenv.config();

const PORT = process.env.PORT || 3000;
const TMP_DIR = process.env.TMP_DIR || '/tmp';
const REGION = process.env.AWS_REGION;
const BUCKET = process.env.S3_BUCKET;

if (!REGION || !BUCKET) {
  console.error('AWS_REGION and S3_BUCKET must be set in env');
  process.exit(1);
}

const s3 = new S3Client({ region: REGION });

// util: create unique temp file
function tmpFileName(prefix, ext) {
  const id = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
  return path.join(TMP_DIR, `${prefix}-${id}${ext}`);
}

// download object to local path
async function downloadFromS3(key, localPath) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const res = await s3.send(cmd);
  await pipeline(res.Body, fs.createWriteStream(localPath));
}

// upload local file to s3
async function uploadToS3(localPath, destKey) {
  const fileStream = fs.createReadStream(localPath);
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: destKey,
    Body: fileStream,
    ContentType: 'application/pdf',
  });
  await s3.send(cmd);
}

// convert using libreoffice (soffice)
async function convertPptxToPdf(inputPath, outputDir) {
  // soffice will create file in same dir by default when used with --outdir
  return new Promise((resolve, reject) => {
    const TIMEOUT_MS = 180000; // 3 minutes timeout

    const args = [
      '--headless',
      '--invisible',
      '--nologo',
      '--nodefault',
      '--nolockcheck',
      '--nofirststartwizard',
      '--convert-to',
      'pdf',
      inputPath,
      '--outdir',
      outputDir,
    ];

    const proc = spawn('soffice', args, { 
      stdio: 'ignore',
      env: {
        ...process.env,
        OPENOFFICE_HOME: '',
        OO_SKIP_NATIVITY_LOADER: '1',
        SAL_USE_VCLPLUGIN: 'sv',
        SAL_DISABLE_OPENCL: '1',        // Consistent rendering
        SAL_DISABLE_FONTCONFIG: '0',    // Better font matching
        GDK_SCALE: '1',                 // Prevent scaling issues
        GDK_DPI_SCALE: '1',              // Normal DPI
      }
    });

    const timeout = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error('Conversion timeout: exceeded 3 minutes'));
    }, TIMEOUT_MS);

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
    
    proc.on('exit', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        // build pdf path
        const baseName = path.basename(inputPath, path.extname(inputPath));
        const pdfPath = path.join(outputDir, `${baseName}.pdf`);
        if (fs.existsSync(pdfPath)) resolve(pdfPath);
        else reject(new Error('PDF not found after conversion'));
      } else {
        reject(new Error(`LibreOffice exited with code ${code}`));
      }
    });
  });
}

// cleanup files
function safeUnlink(...files) {
  for (const f of files) {
    try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (e) { /* ignore */ }
  }
}

// Express app
const app = express();
app.use(express.json());

// POST /convert
// body: { s3Key: "path/to/file.pptx", outputKey?: "path/to/out.pdf" }
// returns: { s3PdfKey, url? }
app.post('/convert', async (req, res) => {
  const REQUEST_TIMEOUT = 240000; // 4 minutes total timeout
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ error: 'Request timeout: service took too long to respond' });
    }
  }, REQUEST_TIMEOUT);

  const { s3Key, outputKey } = req.body;
  if (!s3Key) {
    clearTimeout(timeout);
    return res.status(400).json({ error: 's3Key required' }); 
  }

  const localPptx = tmpFileName('input', path.extname(s3Key) || '.pptx');
  const localOutDir = path.dirname(localPptx); // same temp dir
  let pdfLocalPath;
  try {
    console.log(`[${new Date().toISOString()}] ⬇️ Downloading from S3:`, s3Key);
    const downloadStart = Date.now();
    await downloadFromS3(s3Key, localPptx);
    console.log(`[${new Date().toISOString()}] ⬇️ Downloaded in ${Date.now() - downloadStart}ms`);

    console.log(`[${new Date().toISOString()}] 🔄 Converting with LibreOffice:`, localPptx);
    const convertStart = Date.now();
    pdfLocalPath = await convertPptxToPdf(localPptx, localOutDir);
    console.log(`[${new Date().toISOString()}] 🔄 Converted in ${Date.now() - convertStart}ms`);

    const destKey = outputKey || s3Key.replace(/\.[^/.]+$/, '.pdf');
    console.log(`[${new Date().toISOString()}] 📤 Uploading PDF to S3:`, destKey);
    const uploadStart = Date.now();
    await uploadToS3(pdfLocalPath, destKey);
    console.log(`[${new Date().toISOString()}] 📤 Uploaded in ${Date.now() - uploadStart}ms`);
    
    safeUnlink(localPptx, pdfLocalPath);
    clearTimeout(timeout);
    return res.json({ s3PdfKey: destKey });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Conversion error:`, err.message);
    safeUnlink(localPptx, pdfLocalPath);
    clearTimeout(timeout);
    
    // Determine appropriate status code
    const statusCode = err.message.includes('timeout') ? 504 
                     : err.message.includes('does not exist') ? 404
                     : 500;
    
    return res.status(statusCode).json({ error: err.message || 'Conversion failed' });
  }
});

app.get('/health', (req, res) => res.send('ok'));

app.get('/', (req, res) => {
  res.json({
    service: 'PPTX to PDF Converter',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      convert: 'POST /convert'
    }
  });
});

app.listen(PORT, () => {
  console.log(`PPTX->PDF service listening on ${PORT}`);
  
  // Keep service alive by setting up a periodic health check
  // This helps prevent Render free tier from spinning down
  setInterval(async () => {
    try {
      // Light memory check
      const used = process.memoryUsage();
      const usedMB = Math.round((used.heapUsed / 1024 / 1024) * 100) / 100;
      console.log(`💾 Memory: ${usedMB} MB`);
    } catch (e) {
      // Ignore
    }
  }, 60000); // Log memory every minute
});

