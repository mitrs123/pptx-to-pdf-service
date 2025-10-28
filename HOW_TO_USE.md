# 📖 How to Use PPTX to PDF Microservice

A simple step-by-step guide to use the PPTX to PDF conversion microservice.

## 🎯 Quick Start

### 1. Start the Service

#### Using Docker (Recommended)
```bash
# Build the image
docker build -t pptx-to-pdf .

# Run the service
docker run -p 3000:3000 --env-file .env pptx-to-pdf
```

Service will be available at: `http://localhost:3000`

---

## 📧 Using the API

### Health Check

Check if the service is running:

```bash
curl http://localhost:3000/health
```

**Response:**
```
ok
```

---

### Convert PPTX to PDF

Send a POST request to convert your PPTX file:

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

---

## 📝 Request Format

### Required Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `s3Key` | string | ✅ Yes | S3 path to your PPTX file |

### Optional Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `outputKey` | string | ❌ No | Custom output path for PDF |

---

## 💡 Usage Examples

### Example 1: Basic Conversion

Convert a PPTX file to PDF (auto-named):

**Request:**
```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{
    "s3Key": "documents/presentation.pptx"
  }'
```

**S3 File:** `documents/presentation.pptx`  
**Result:** `documents/presentation.pdf`

---

### Example 2: Custom Output Location

Save PDF to a specific location:

**Request:**
```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{
    "s3Key": "input/presentation.pptx",
    "outputKey": "output/converted.pdf"
  }'
```

**S3 Input File:** `input/presentation.pptx`  
**S3 Output File:** `output/converted.pdf`

---

### Example 3: Multiple Conversions

Convert multiple files:

```bash
# File 1
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"s3Key": "file1.pptx"}'

# File 2
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"s3Key": "file2.pptx"}'

# File 3
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"s3Key": "folder/file3.pptx"}'
```

---

## 🌐 Using Production URL (Render)

Once deployed on Render, your service will have a URL like:

```
https://pptx-to-pdf-service.onrender.com
```

### Health Check:
```bash
curl https://pptx-to-pdf-service.onrender.com/health
```

### Convert:
```bash
curl -X POST https://pptx-to-pdf-service.onrender.com/convert \
  -H "Content-Type: application/json" \
  -d '{
    "s3Key": "dev-RE2174/proposals/RE2174_rajesh_kumar_P22.pptx"
  }'
```

---

## 🔧 Using with Different Tools

### Postman

1. **Method:** `POST`
2. **URL:** `http://localhost:3000/convert`
3. **Headers:**
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body (raw JSON):**
   ```json
   {
     "s3Key": "your-file.pptx"
   }
   ```
5. Click **Send**

---

### JavaScript (Node.js)

```javascript
const response = await fetch('http://localhost:3000/convert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    s3Key: 'dev-RE2174/proposals/RE2174_rajesh_kumar_P22.pptx'
  })
});

const result = await response.json();
console.log(result.s3PdfKey);
```

---

### Python

```python
import requests

response = requests.post(
    'http://localhost:3000/convert',
    headers={'Content-Type': 'application/json'},
    json={'s3Key': 'dev-RE2174/proposals/RE2174_rajesh_kumar_P22.pptx'}
)

result = response.json()
print(result['s3PdfKey'])
```

---

### cURL (Windows PowerShell)

```powershell
$body = @{
    s3Key = "dev-RE2174/proposals/RE2174_rajesh_kumar_P22.pptx"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/convert `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

---

## ✅ Success Response

When conversion is successful:

```json
{
  "s3PdfKey": "path/to/your/file.pdf"
}
```

The PDF is now available in your S3 bucket at the returned key.

---

## ❌ Error Responses

### Missing s3Key

**Request:**
```json
{
  "wrongParam": "file.pptx"
}
```

**Response:**
```json
{
  "error": "s3Key required"
}
```

---

### File Not Found

**Request:**
```json
{
  "s3Key": "nonexistent-file.pptx"
}
```

**Response:**
```json
{
  "error": "The specified key does not exist"
}
```

---

### Conversion Failed

**Response:**
```json
{
  "error": "LibreOffice exited with code 1"
}
```

**Possible causes:**
- Corrupted PPTX file
- Unsupported format
- Insufficient memory

---

## 🎓 Step-by-Step Tutorial

### Prerequisites

1. ✅ S3 bucket created in AWS
2. ✅ PPTX file uploaded to S3
3. ✅ Environment variables configured
4. ✅ Service running (local or Render)

---

### Step 1: Upload PPTX to S3

Upload your PPTX file to S3, for example:
```
s3://your-bucket/dev-RE2174/proposals/presentation.pptx
```

Remember the key path: `dev-RE2174/proposals/presentation.pptx`

---

### Step 2: Send Conversion Request

Call the API with the S3 key:

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"s3Key": "dev-RE2174/proposals/presentation.pptx"}'
```

---

### Step 3: Get Response

You'll receive:

```json
{
  "s3PdfKey": "dev-RE2174/proposals/presentation.pdf"
}
```

---

### Step 4: Download PDF from S3

The PDF is now in your S3 bucket. Download it or use it in your application.

---

## 🧪 Testing

### Test with Valid File

```bash
# Health check
curl http://localhost:3000/health

# Convert (replace with your actual S3 key)
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"s3Key": "test/presentation.pptx"}'
```

### Test Error Handling

```bash
# Missing parameter
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{}'

# Invalid S3 key
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"s3Key": "does-not-exist.pptx"}'
```

---

## 📊 Response Examples

### Successful Conversion

```json
{
  "s3PdfKey": "dev-RE2174/proposals/RE2174_rajesh_kumar_P22.pdf"
}
```

### Auto-Named Output

**Input:** `presentation.pptx`  
**Output:** `presentation.pdf`

---

## 🎯 Best Practices

### 1. Use Meaningful S3 Keys

✅ **Good:**
```
dev-RE2174/proposals/project-name.pptx
```

❌ **Bad:**
```
file1.pptx
```

### 2. Check Response

Always check if the request was successful:

```javascript
const response = await fetch('http://localhost:3000/convert', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({s3Key: 'file.pptx'})
});

if (response.ok) {
  const result = await response.json();
  console.log('PDF created:', result.s3PdfKey);
} else {
  const error = await response.json();
  console.error('Error:', error.error);
}
```

### 3. Handle Errors

```javascript
try {
  const response = await fetch('http://localhost:3000/convert', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({s3Key: 'file.pptx'})
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  console.log('Success:', result.s3PdfKey);
} catch (error) {
  console.error('Conversion failed:', error);
}
```

---

## 🔍 Troubleshooting

### Service Not Responding

**Check:**
```bash
# 1. Is service running?
curl http://localhost:3000/health

# 2. Check Docker logs
docker logs <container-id>

# 3. Verify environment variables
docker exec <container-id> env | grep AWS
```

---

### Conversion Fails

**Check:**
1. PPTX file is valid (not corrupted)
2. File exists in S3 at specified key
3. AWS credentials are correct
4. Sufficient memory/resources

---

### Slow Conversions

Large PPTX files take longer to convert:

- **Small (< 1MB):** 2-5 seconds
- **Medium (1-10MB):** 5-15 seconds  
- **Large (10-50MB):** 15-60 seconds

---

## 📋 Common Use Cases

### 1. Convert Single File

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"s3Key": "file.pptx"}'
```

### 2. Batch Conversion

```bash
for file in file1.pptx file2.pptx file3.pptx; do
  curl -X POST http://localhost:3000/convert \
    -H "Content-Type: application/json" \
    -d "{\"s3Key\": \"$file\"}"
done
```

### 3. Frontend Integration

```html
<button onclick="convertPPTX()">Convert to PDF</button>

<script>
async function convertPPTX() {
  const response = await fetch('http://localhost:3000/convert', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({s3Key: 'presentation.pptx'})
  });
  
  const result = await response.json();
  alert('PDF created: ' + result.s3PdfKey);
}
</script>
```

---

## 📞 Need Help?

- **Full Documentation:** See `README.md`
- **Deployment Guide:** See `GITHUB_SETUP.md`
- **Check Logs:** `docker logs <container-id>`

---

**Happy Converting! 🎉**


