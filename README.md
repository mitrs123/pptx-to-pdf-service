# PPTX to PDF Microservice

A microservice that converts PPTX files to PDF using LibreOffice.

## Features

- ✅ Converts PPTX to PDF using LibreOffice
- ✅ AWS S3 integration (download and upload)
- ✅ Dockerized for easy deployment
- ✅ Health check endpoint
- ✅ Automatic cleanup

## Environment Variables

```bash
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=your-bucket-name
PORT=3000
TMP_DIR=/tmp
```

## Endpoints

### GET /health
Health check endpoint

### POST /convert
Convert PPTX to PDF

**Request:**
```json
{
  "s3Key": "path/to/file.pptx",
  "outputKey": "path/to/output.pdf"
}
```

**Response:**
```json
{
  "s3PdfKey": "path/to/output.pdf"
}
```

## Local Development

```bash
npm install
docker build -t pptx-to-pdf .
docker run -p 3000:3000 --env-file .env pptx-to-pdf
```

## Deploy to Render

1. Push this repo to GitHub
2. Go to https://dashboard.render.com
3. New → Web Service
4. Connect GitHub repository
5. Select Docker environment
6. Set environment variables
7. Deploy!

