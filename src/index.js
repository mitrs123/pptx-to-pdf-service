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
    const args = [
      '--headless',
      '--invisible',
      '--nologo',
      '--convert-to',
      'pdf',
      inputPath,
      '--outdir',
      outputDir,
    ];

    const proc = spawn('soffice', args, { stdio: 'ignore' });

    proc.on('error', (err) => reject(err));
    proc.on('exit', (code) => {
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
  const { s3Key, outputKey } = req.body;
  if (!s3Key) return res.status(400).json({ error: 's3Key required' });

  const localPptx = tmpFileName('input', path.extname(s3Key) || '.pptx');
  const localOutDir = path.dirname(localPptx); // same temp dir
  let pdfLocalPath;
  try {
    console.log('⬇️ Downloading from S3:', s3Key);
    await downloadFromS3(s3Key, localPptx);
    console.log('🔄 Converting with LibreOffice:', localPptx);
    pdfLocalPath = await convertPptxToPdf(localPptx, localOutDir);
    const destKey = outputKey || s3Key.replace(/\.[^/.]+$/, '.pdf');
    console.log('📤 Uploading PDF to S3:', destKey);
    await uploadToS3(pdfLocalPath, destKey);
    safeUnlink(localPptx, pdfLocalPath);
    return res.json({ s3PdfKey: destKey });
  } catch (err) {
    console.error('Conversion error:', err);
    safeUnlink(localPptx, pdfLocalPath);
    return res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`PPTX->PDF service listening on ${PORT}`);
});

