# Setup on GitHub and Render

## Step 1: Push to GitHub

### Option A: Using GitHub Desktop (Easiest) ⭐

1. **Download GitHub Desktop:**
   - Go to: https://desktop.github.com/
   - Download and install
   - Login with your GitHub account

2. **Add Repository:**
   - Open GitHub Desktop
   - Click **File → Add Local Repository**
   - Browse to: `D:\Enersol Lead Managment\Prod + Dev\pptx-to-pdf-service`
   - Click **Add**

3. **Publish:**
   - Click **"Publish repository"** button (center or top)
   - Repository name: `pptx-to-pdf-service`
   - Choose public or private
   - Click **"Publish"**
   - ✅ Done! Your code is on GitHub

### Option B: Install Git Command Line

1. **Download Git:**
   - Go to: https://git-scm.com/download/win
   - Download and install

2. **Open Git Bash and run:**
```bash
cd "D:\Enersol Lead Managment\Prod + Dev\pptx-to-pdf-service"
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/pptx-to-pdf-service.git
git push -u origin main
```

---

## Step 2: Deploy on Render

### 1. Go to Render
Visit: https://dashboard.render.com
Sign up or login

### 2. Create New Web Service
- Click **"New +"** button (top right)
- Select **"Web Service"**

### 3. Connect GitHub
- Connect your GitHub account (if not already)
- Search for `pptx-to-pdf-service`
- Click **"Connect"**

### 4. Configure Service

**Basic Settings:**
- **Name:** `pptx-to-pdf-service`
- **Environment:** `Docker`
- **Region:** `Singapore` (or closest to your S3)
- **Branch:** `main`

**Advanced Settings:**
Click **"Advanced"** and add these environment variables:

```
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=YOUR_ACTUAL_AWS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_ACTUAL_AWS_SECRET
S3_BUCKET=your-bucket-name
TMP_DIR=/tmp
PORT=3000
```

⚠️ Replace with your actual AWS credentials!

### 5. Deploy
- Click **"Create Web Service"**
- Wait 5-10 minutes for first build
- Render will show build logs in real-time

---

## Step 3: Test

Once deployed, Render gives you a URL like:
```
https://pptx-to-pdf-service.onrender.com
```

### Test Health:
```
GET https://pptx-to-pdf-service.onrender.com/health
```

### Test Convert:
```
POST https://pptx-to-pdf-service.onrender.com/convert
Content-Type: application/json

{
  "s3Key": "dev-RE2174/proposals/RE2174_rajesh_kumar_P22.pptx"
}
```

---

## Quick Commands (if using Git CLI)

### After installing Git:

```bash
# Navigate to project
cd "D:\Enersol Lead Managment\Prod + Dev\pptx-to-pdf-service"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: PPTX to PDF microservice"

# Set branch name
git branch -M main

# Add GitHub remote (after creating repo on GitHub)
git remote add origin https://github.com/YOUR_USERNAME/pptx-to-pdf-service.git

# Push to GitHub
git push -u origin main
```

---

## Create GitHub Repo First

Before pushing, create the repository on GitHub:

1. Go to: https://github.com/new
2. Repository name: `pptx-to-pdf-service`
3. Description: "Microservice to convert PPTX to PDF"
4. Choose Public or Private
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"
7. Copy the repository URL
8. Use it in the git commands above

---

## Environment Variables for Render

When deploying on Render, you need to set these:

| Variable | Value | Description |
|----------|-------|-------------|
| `AWS_REGION` | `ap-south-1` | Your AWS region |
| `AWS_ACCESS_KEY_ID` | Your key | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your secret | AWS secret key |
| `S3_BUCKET` | Your bucket | S3 bucket name |
| `TMP_DIR` | `/tmp` | Temp directory |
| `PORT` | `3000` | Server port |

---

## Troubleshooting

### "Repository not found"
- Make sure you created the repo on GitHub first
- Check the repository URL is correct

### "Authentication failed"
- Check your GitHub credentials
- Try using Personal Access Token

### "Build fails on Render"
- Check the build logs
- Verify Dockerfile is correct
- Make sure all files are pushed to GitHub

### "Service won't start"
- Check environment variables are set correctly
- Verify AWS credentials
- Check S3 bucket permissions

---

## Summary

1. ✅ Push code to GitHub (use GitHub Desktop or Git CLI)
2. ✅ Deploy on Render (connect GitHub repo)
3. ✅ Set environment variables
4. ✅ Test your service URL

**Done! Your microservice is live! 🎉**

