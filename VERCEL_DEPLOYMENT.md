# Vercel Deployment Guide for Nexus

## Understanding the Error
```
Environment Variable "DATABASE_URL" references Secret "DATABASE_URL", which does not exist.
```

### Root Cause
The `vercel.json` file was using the `@SECRET_NAME` syntax to reference environment variables/secrets that didn't exist yet. This syntax only works if the secret is already created in Vercel.

### Solution ✅
Removed the `env` section from `vercel.json`. Instead, you'll set environment variables directly in the Vercel Dashboard.

## How to Deploy to Vercel

### Step 1: Create/Link Your GitHub Repository
1. Commit and push your code to GitHub:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment configuration"
   git push origin main
   ```

### Step 2: Add Project to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Choose "Next.js" as the framework (auto-detected)
5. Click "Deploy"

### Step 3: Set Environment Variables in Vercel Dashboard

After creating the project in Vercel:

1. Go to your project's **Settings** → **Environment Variables**
2. Add each variable by clicking "Add New"

#### Required Environment Variables:

| Variable Name | Value | Type |
|---|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string from .env | Regular (or Secret if contains credentials) |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` OR your custom domain | Regular |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` | Secret |
| `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` | From your .env | Regular (starts with `pk_`) |
| `LIVEBLOCKS_SECRET_KEY` | From your .env | Secret |
| `UPLOADTHING_SECRET` | From your .env | Secret |
| `UPLOADTHING_APP_ID` | From your .env | Regular |

### Step 4: Configure Deployment Environments

Set which environments each variable applies to:
- **Development**: When developing locally
- **Preview**: When deploying PR/branches
- **Production**: Your main branch

For now, set all to **Production** (you can configure more later).

### Step 5: Redeploy

After adding all environment variables:
1. Click "Redeploy" in the Vercel dashboard
2. Or push a new commit to trigger auto-deploy

## Important Notes

### NEXTAUTH_URL for Production
Your `.env` has:
```
NEXTAUTH_URL="http://localhost:3000"
```

**This must change for production!** Set it to:
- If using Vercel domain: `https://your-project-name.vercel.app`
- If using custom domain: `https://your-custom-domain.com`

### DATABASE_URL in Production
Make sure your Neon PostgreSQL connection string in `.env`:
```
DATABASE_URL='postgresql://neondb_owner:npg_Betl6TE0SmCi@...'
```

Is set in Vercel as a **Secret** (not Regular) for security.

## Verification Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and linked
- [ ] All 7 environment variables added in Vercel dashboard
- [ ] NEXTAUTH_URL is set to production domain
- [ ] Build succeeded (check Vercel logs)
- [ ] Application is running at your domain

## Troubleshooting

### "Environment Variable X references Secret Y, which does not exist"
✅ **Fixed** - We removed the `@SECRET` syntax from vercel.json

### Build still fails
1. Check Vercel build logs for specific errors
2. Verify all environment variables are added in Vercel Dashboard
3. Make sure DATABASE_URL is correct and accessible
4. Try redeploying from Vercel dashboard

### Authentication not working in production
1. Verify `NEXTAUTH_URL` matches your actual domain
2. Check `NEXTAUTH_SECRET` is set (should be random 32-byte string)
3. Verify NextAuth callbacks allow your domain

### Database not connecting
1. Test the DATABASE_URL locally: `npm run build`
2. Verify Neon database allows connections from Vercel IPs
3. Check connection string format is correct

## Next Steps

1. Push changes to GitHub
2. Create Vercel project
3. Add environment variables
4. Deploy!

For more help: [Vercel Documentation](https://vercel.com/docs) | [Next.js Deployment](https://nextjs.org/learn/deployment/vercel)
