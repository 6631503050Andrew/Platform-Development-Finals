# Vercel KV Setup Instructions

## Setting up Vercel KV for your project

### 1. Create a Vercel KV Database

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Click on "Storage" in the top navigation
3. Click "Create Database"
4. Select "KV" (Key-Value Store)
5. Choose a name for your database (e.g., "mfu-lost-found-db")
6. Select a region close to your users (e.g., Singapore for Thailand)
7. Click "Create"

### 2. Connect KV to Your Project

1. After creating the database, you'll see a list of your KV databases
2. Click on the database you just created
3. Go to the "Settings" tab
4. Scroll down to "Connect Project"
5. Select your project from the dropdown (e.g., "Platform-Development-Finals")
6. Click "Connect"

### 3. Environment Variables

Vercel will automatically add these environment variables to your project:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL`

These are automatically injected into your production and preview deployments.

### 4. Local Development

For local development, you need to pull the environment variables:

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local
```

### 5. Verify Connection

Visit `/api/health` on your deployed site to check if KV is connected:
- Production: `https://your-site.vercel.app/api/health`
- Local: `http://localhost:3000/api/health`

You should see:
```json
{
  "status": "ok",
  "kv": {
    "connected": true,
    "hasUrl": true,
    "hasToken": true
  }
}
```

### 6. Redeploy

After connecting the KV database:
1. Go to your Vercel project dashboard
2. Click "Deployments"
3. Find the latest deployment
4. Click the three dots menu
5. Click "Redeploy"

This ensures the environment variables are properly loaded.

## Troubleshooting

### Error: "Failed to fetch items"

1. Check if KV database is connected to your project
2. Visit `/api/health` to verify connection
3. Check Vercel project settings → Environment Variables
4. Ensure `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
5. Redeploy your application

### KV not working locally

1. Make sure you've run `vercel env pull .env.local`
2. Restart your dev server: `npm run dev`
3. Check if `.env.local` file exists in your project root

### Still having issues?

1. Check Vercel function logs in the dashboard
2. Visit `/api/health` to see detailed error messages
3. Ensure your Vercel KV plan has sufficient quota
4. Try creating a new KV database and reconnecting

## Next Steps

Once KV is set up:
1. Visit your deployed site
2. Try creating a found item
3. Check if items appear in the browse page
4. Use the admin dashboard to manage items

Your MFU Lost & Found app should now be fully functional! 🎓
