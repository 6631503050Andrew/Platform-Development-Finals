# 🚀 Quick Start Guide - Lost & Found Tracker

## ⚡ 5-Minute Deployment to Vercel

### Step 1: Prepare Your Project

1. Open terminal in the project folder:
```powershell
cd "c:\Users\andre\Desktop\Platform Development Finals"
```

2. Initialize git (if not already done):
```powershell
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI (Fastest)**

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel auto-detects Next.js - click "Deploy"

### Step 3: Add Vercel KV Database

1. After deployment, go to your project dashboard
2. Click **Storage** tab
3. Click **Create Database** → **KV**
4. Give it a name (e.g., "lost-found-kv")
5. Click **Create**
6. Click **Connect** to link it to your project
7. Environment variables are automatically injected!

### Step 4: Verify Deployment

1. Visit your Vercel URL (e.g., `your-project.vercel.app`)
2. Allow location access when prompted
3. Submit a test item
4. Check the dashboard at `/dashboard`

## 🧪 Local Development

### Setup

1. **Install dependencies**:
```powershell
npm install
```

2. **Get Vercel KV credentials**:
   - Go to https://vercel.com/dashboard
   - Click Storage → Create KV Database
   - Copy credentials from `.env.local` tab

3. **Create `.env.local`**:
```env
KV_REST_API_URL=https://your-kv-url.upstash.io
KV_REST_API_TOKEN=your-token-here
```

4. **Run dev server**:
```powershell
npm run dev
```

5. **Open browser**: http://localhost:3000

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Vercel KV database created
- [ ] Environment variables configured
- [ ] App deployed successfully
- [ ] Geolocation working (HTTPS required)
- [ ] Can submit items
- [ ] Dashboard shows items
- [ ] Can delete items

## 🐛 Quick Fixes

**Geolocation not working?**
- Vercel deployments use HTTPS automatically ✓
- For localhost, use `http://localhost:3000` (browser allows it)

**"Cannot connect to KV"?**
- Verify environment variables in Vercel dashboard
- Make sure KV database is connected to your project

**Build failing?**
- Check that all dependencies are in `package.json`
- Run `npm install` again
- Clear Next.js cache: `rm -r .next`

## 📱 Testing the App

### Submit an Item
1. Go to homepage
2. Allow location access
3. Fill in form:
   - Item Name: "Test Wallet"
   - Description: "Found in library"
   - Image URL: (optional)
4. Click Submit

### View Dashboard
1. Go to `/dashboard`
2. See your submitted item
3. Click delete to remove it

## 🎯 Production URLs

After deployment, you'll have:
- **Homepage**: `https://your-project.vercel.app`
- **Dashboard**: `https://your-project.vercel.app/dashboard`
- **API**: `https://your-project.vercel.app/api/items`

## 📞 Support

If you encounter issues:
1. Check the Troubleshooting section in README.md
2. Verify environment variables in Vercel dashboard
3. Check Vercel deployment logs
4. Ensure Vercel KV database is properly connected

---

**Ready to deploy?** Run `vercel --prod` and you're live! 🎉
