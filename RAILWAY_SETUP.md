# Railway Deployment Guide

## Setup Steps

### 1. Sign up for Railway
1. Go to https://railway.app/
2. Click "Login" and sign in with your **GitHub account**
3. Authorize Railway to access your repositories

### 2. Create a New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `Udit004/ai-agent-backend`
4. Railway will automatically detect the Dockerfile and start deploying

### 3. Add Environment Variables
In the Railway dashboard:
1. Click on your service
2. Go to "Variables" tab
3. Add these variables:
   ```
   MONGO_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=<your_gemini_api_key>
   LANGSMITH_API_KEY=<your_langsmith_api_key>
   NODE_ENV=production
   ```

**Important:** For MongoDB, use MongoDB Atlas (free):
- Go to https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get the connection string
- Add it to Railway's `MONGO_URI` variable

### 4. Setup GitHub Actions CI/CD (Optional but Recommended)

#### Get Railway Token:
1. In Railway dashboard, click your profile (bottom left)
2. Go to "Account Settings" → "Tokens"
3. Click "Create Token" and copy it

#### Get Service ID:
1. In your Railway project, click on your service
2. Go to "Settings" tab
3. Copy the "Service ID"

#### Add GitHub Secrets:
1. Go to your GitHub repo: https://github.com/Udit004/ai-agent-backend
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add these secrets:
   - `RAILWAY_TOKEN`: (paste your Railway token)
   - `RAILWAY_SERVICE_ID`: (paste your Service ID)

### 5. Deploy!

**Manual Deploy (First Time):**
- Railway automatically deploys when you connect the repo

**Automatic Deploy (After GitHub Actions setup):**
- Just push to main branch:
  ```bash
  git add .
  git commit -m "Deploy to Railway"
  git push origin main
  ```
- GitHub Actions will automatically deploy to Railway

### 6. Access Your App
1. In Railway dashboard, go to "Settings" tab
2. Under "Networking", click "Generate Domain"
3. Your app will be available at: `https://your-app.railway.app`

## Benefits of Railway
- ✅ $5 free credit per month (no credit card needed initially)
- ✅ No cold starts or sleeping
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ Built-in metrics and logs
- ✅ Direct GitHub integration

## Monitoring
- **Logs:** Click "Deployments" → Select deployment → View logs
- **Metrics:** Click "Metrics" tab to see CPU, memory, network usage
- **Health:** Your app has a `/health` endpoint for monitoring

## Troubleshooting
- If deployment fails, check the logs in Railway dashboard
- Make sure all environment variables are set correctly
- Verify MongoDB Atlas connection string is correct and IP whitelist includes 0.0.0.0/0
