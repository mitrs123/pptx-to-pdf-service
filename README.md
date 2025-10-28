# 📄 PPTX to PDF Microservice

A production-ready microservice that converts PPTX files to PDF using LibreOffice. Features automatic S3 integration, Docker support, and seamless AWS integration.

## 🚀 Features

✅ **Automatic Conversion** - Converts PPTX files to PDF using LibreOffice  
✅ **S3 Integration** - Downloads from and uploads to AWS S3  
✅ **Error Handling** - Comprehensive error handling and cleanup  
✅ **Health Monitoring** - Built-in health check endpoint  
✅ **Docker Support** - Fully containerized with Docker  
✅ **Production Ready** - Optimized for Render and cloud deployment  
✅ **Cleanup** - Automatic temporary file cleanup  
✅ **Flexible Output** - Customizable output S3 key paths  

## 📋 API Endpoints

### 1. Welcome & Info
**GET** `/`  
Returns welcome message with service information.

### 2. Health Check
**GET** `/health`  
Returns service health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-10-26T16:50:04.000Z"
}
```

### 3. Convert PPTX to PDF
**POST** `/convert`  
Converts a PPTX file from S3 to PDF and uploads back to S3.

**Request Body:**
```json
{
  "s3Key": "dev-RE2174/proposals/RE2174_rajesh_kumar_P22.pptx",
  "outputKey": "dev-RE2174/proposals/RE2174_rajesh_kumar_P22.pdf"
}
```

**Parameters:**
- `s3Key` (required) - S3 key path to the PPTX file
- `outputKey` (optional) - Custom output path. If not provided, auto-replaces extension with `.pdf`

**Success Response:**
```json
{
  "s3PdfKey": "dev-RE2174/proposals/RE2174_rajesh_kumar_P22.pdf"
}
```

**Error Response:**
```json
{
  "error": "Error message here"
}
```

## 🛠 Installation & Setup

### Installation

```bash
# Clone or download the repository
cd pptx-to-pdf-service

# Install dependencies
npm install
```

### Run Locally with Docker

```bash
# Build Docker image
docker build -t pptx-to-pdf .

# Run container
docker run -p 3000:3000 --env-file .env pptx-to-pdf
```

### Environment Variables

Create a `.env` file:

```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET=your-bucket-name
PORT=3000
TMP_DIR=/tmp
```

## 📨 Usage Examples

### Basic Conversion Example

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{
    "s3Key": "dev-RE2174/proposals/RE2174_rajesh_kumar_P22.pptx"
  }'
```

**Response:**
```json
{
  "s3PdfKey": "dev-RE2174/proposals/RE2174_rajesh_kumar_P22.pdf"
}
```

### Custom Output Path Example

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{
    "s3Key": "input/presentation.pptx",
    "outputKey": "output/converted-presentation.pdf"
  }'
```

**Response:**
```json
{
  "s3PdfKey": "output/converted-presentation.pdf"
}
```

### Health Check Example

```bash
curl http://localhost:3000/health
```

**Response:**
```
ok
```

## 🔧 AWS S3 Setup

### S3 Bucket Configuration

1. **Create S3 Bucket:**
   - Go to AWS S3 Console
   - Create bucket in desired region (e.g., `ap-south-1`)
   - Note the bucket name

2. **IAM User Setup:**
   - Create IAM user with programmatic access
   - Attach minimal policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

3. **Get Credentials:**
   - Note the Access Key ID
   - Save the Secret Access Key

### S3 Bucket Structure

```
your-bucket/
├── dev-RE2174/
│   └── proposals/
│       ├── RE2174_rajesh_kumar_P22.pptx  ← Input
│       └── RE2174_rajesh_kumar_P22.pdf   ← Output (auto-generated)
```

## 🐳 Docker Commands

### Build Image

```bash
docker build -t pptx-to-pdf .
```

### Run Container

```bash
# Using .env file
docker run -p 3000:3000 --env-file .env pptx-to-pdf

# Or with inline env vars
docker run -p 3000:3000 \
  -e AWS_REGION=ap-south-1 \
  -e AWS_ACCESS_KEY_ID=your-key \
  -e AWS_SECRET_ACCESS_KEY=your-secret \
  -e S3_BUCKET=your-bucket \
  pptx-to-pdf
```

### View Logs

```bash
# Get container ID
docker ps

# View logs
docker logs -f <container-id>
```

### Stop Container

```bash
docker stop <container-id>
```

## 🚀 Deploy to Render

### Step 1: Push to GitHub

**Using GitHub Desktop:**
1. Download from https://desktop.github.com/
2. Open GitHub Desktop
3. File → Add Local Repository
4. Select your project folder
5. Click "Publish Repository"

**Using Git CLI:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/pptx-to-pdf-service.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `pptx-to-pdf-service`
   - **Environment:** Docker
   - **Region:** Singapore (or closest to your S3)
5. Add Environment Variables:
   ```
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   S3_BUCKET=your-bucket-name
   TMP_DIR=/tmp
   PORT=3000
   ```
6. Click **Create Web Service**
7. Wait 5-10 minutes for build

### Step 3: Test Production URL

```bash
# Health check
curl https://pptx-to-pdf-service.onrender.com/health

# Convert PPTX
curl -X POST https://pptx-to-pdf-service.onrender.com/convert \
  -H "Content-Type: application/json" \
  -d '{"s3Key":"your-file.pptx"}'
```

## 🛡 Security Features

- ✅ **No Hardcoded Secrets** - All AWS credentials from environment variables
- ✅ **Input Validation** - Validates S3 key paths
- ✅ **Error Handling** - Proper error handling and informative messages
- ✅ **Cleanup** - Automatic temporary file removal
- ✅ **IAM Security** - Use IAM roles with minimal permissions
- ✅ **HTTPS** - Render provides HTTPS by default

## 📊 Response Formats

### Success Response

```json
{
  "s3PdfKey": "dev-RE2174/proposals/RE2174_rajesh_kumar_P22.pdf"
}
```

### Error Response

```json
{
  "error": "s3Key required"
}
```

**Common Errors:**
- `s3Key required` - Missing s3Key parameter
- `The specified key does not exist` - File not found in S3
- `LibreOffice exited with code 1` - Conversion failed
- `PDF not found after conversion` - Conversion didn't produce output

### Health Response

```
ok
```

## 🚦 Environment Variables

| Variable | Required | Default | Description |
|----------|-----------|---------|-------------|
| `AWS_REGION` | ✅ Yes | - | AWS region (e.g., ap-south-1) |
| `AWS_ACCESS_KEY_ID` | ✅ Yes | - | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | ✅ Yes | - | AWS secret key |
| `S3_BUCKET` | ✅ Yes | - | S3 bucket name |
| `PORT` | ❌ No | 3000 | Server port |
| `TMP_DIR` | ❌ No | /tmp | Temporary directory |

## 📝 Project Structure

```
pptx-to-pdf-service/
├── src/
│   └── index.js           # Main Express server
├── Dockerfile             # Docker configuration
├── package.json           # Dependencies
├── package-lock.json     # Lock file
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore rules
├── .dockerignore         # Docker ignore rules
└── README.md             # This file
```

## 🐛 Troubleshooting

### Common Issues

**1. Docker Build Fails**
```
Error: Package 'ttf-dejavu-core' has no installation candidate
```
**Solution:** Already fixed in Dockerfile - use latest version.

**2. Service Won't Start**
```
Error: AWS_REGION and S3_BUCKET must be set in env
```
**Solution:** Check `.env` file has all required variables.

**3. Conversion Fails**
```
LibreOffice exited with code 1
```
**Solutions:**
- Verify PPTX file is not corrupted
- Check file exists in S3
- Ensure LibreOffice has proper permissions
- Check Docker logs for details

**4. S3 Upload/Download Error**
```
Error: The specified key does not exist
```
**Solutions:**
- Verify AWS credentials are correct
- Check IAM permissions (s3:GetObject, s3:PutObject)
- Verify bucket name and region
- Ensure file exists at specified S3 key

**5. Memory Issues**
```
Error: Process killed (out of memory)
```
**Solutions:**
- Large PPTX files need more RAM
- Increase Docker/Render memory limits
- Use smaller files or split presentations

**6. 520 Error on Render (Cloudflare)**
```
Error 520: Web server is returning an unknown error
```
**This is the most common issue!** It happens because:
- Render free tier services spin down after 15 minutes of inactivity
- The service crashes during conversion (memory issue)
- Service takes too long to start up (cold start)

**Solutions:**

**A. Immediate Fix (Recommended):**
```bash
# Call the health endpoint every 10 minutes to keep service alive
curl https://pptx-to-pdf-service.onrender.com/health
```

**B. Automated Keep-Alive:**
Use the provided keep-alive script:
```bash
# Set environment variable
export SERVICE_URL=https://pptx-to-pdf-service.onrender.com

# Run keep-alive script
node scripts/keep-alive.js
```

**C. Upgrade Render Service:**
- Go to Render dashboard
- Upgrade to a paid plan ($7/month) to get:
  - Always-on service (never spins down)
  - More memory (512MB vs 256MB)
  - Faster response times
  - Better reliability

**D. Alternative: Setup External Keep-Alive:**
Use a free cron service to ping your service:
- [cron-job.org](https://cron-job.org) - Free cron jobs
- AWS Lambda with CloudWatch Events
- GitHub Actions scheduled workflow
- Any VPS with cron

**E. Check Service Logs:**
```bash
# If service is crashing, check Render logs for errors
# Go to: Render Dashboard → Your Service → Logs
```

### View Logs

**Local (Docker):**
```bash
docker logs -f <container-id>
```

**Render:**
- Go to Render dashboard
- Click on your service
- Click "Logs" tab
- See real-time logs

### Debug Mode

Add logging to see detailed process:

The service logs:
- ⬇️ Downloading from S3
- 🔄 Converting with LibreOffice
- 📤 Uploading PDF to S3

## 🔄 How It Works

1. **Download:** Service downloads PPTX file from S3 to temporary location
2. **Convert:** LibreOffice converts PPTX to PDF in headless mode
3. **Upload:** Converted PDF is uploaded back to S3
4. **Cleanup:** Temporary files are automatically deleted
5. **Response:** Returns S3 key of converted PDF

## 📈 Performance

- **Small PPTX (< 1MB):** 2-5 seconds
- **Medium PPTX (1-10MB):** 5-15 seconds
- **Large PPTX (10-50MB):** 15-60 seconds
- **Memory Usage:** 200MB - 1GB (depends on file complexity)

## 📦 Dependencies

- **express:** Web server framework
- **@aws-sdk/client-s3:** AWS S3 integration
- **dotenv:** Environment variable management
- **LibreOffice:** Document conversion (via Docker)

## 🤝 Contributing

This is a simple microservice template. Feel free to extend with:
- Queue management for concurrent conversions
- Rate limiting
- Authentication middleware
- Multiple format support (DOCX, XLSX, etc.)
- Direct file upload endpoint
- Webhook notifications
- Conversion progress tracking
- Database integration for logging

## 📝 License

MIT License - Feel free to use and modify as needed.

## 📧 Support

For issues or questions:
1. Check logs for error messages
2. Verify AWS credentials and permissions
3. Test with simpler PPTX files first
4. Check Docker/container resources

---

**Built with ❤️ using Node.js, Express, LibreOffice, and Docker**
