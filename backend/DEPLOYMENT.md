# Deployment Guide - FinTrack Backend

## Environment Variables

Set these environment variables in your hosting platform (Render, Railway, etc.):

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-here"

# Frontend URL (for CORS)
FRONTEND_URL="https://your-domain.com"
# Or use Vercel production URL:
# FRONTEND_URL="https://fintrack-naz-ahtamirs-projects.vercel.app"

# Node Environment
NODE_ENV="production"

# Port (Render/Railway usually set this automatically)
PORT=3000
```

---

## CORS Configuration

### Current Setup
The backend allows requests from:
1. `http://localhost:3000` and `http://localhost:3001` (development)
2. `FRONTEND_URL` environment variable (production)
3. Vercel production URL: `https://fintrack-naz-ahtamirs-projects.vercel.app`
4. Vercel preview deployments (only in non-production mode)

### Production URLs

**Vercel URL Types:**
- **Production URL** (permanent): `fintrack-naz-ahtamirs-projects.vercel.app`
  - This URL never changes
  - Automatically points to your main branch (usually `main`)
  
- **Preview URLs** (temporary): `fintrack-qqt5ca3ce-naz-ahtamirs-projects.vercel.app`
  - Generated for each deployment/PR
  - Contains random string
  - Changes with every new deployment

### Recommended: Use Custom Domain

For production apps, use a custom domain:
1. Buy domain from Namecheap, GoDaddy, or Cloudflare
2. Add to Vercel: Project Settings → Domains → Add Domain
3. Update `FRONTEND_URL` in Render to your custom domain

Example:
```bash
FRONTEND_URL="https://fintrack.com"
```

---

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "your commit message"
git push origin main
```

### 2. Render Auto-Deploy
Render automatically deploys when you push to GitHub.

### 3. Verify Deployment
- Check Render logs for errors
- Test API: `https://your-backend.onrender.com/api/docs`
- Verify CORS by testing from frontend

---

## Troubleshooting

### CORS Error: "No 'Access-Control-Allow-Origin' header"

**Cause:** Frontend URL not in allowed origins list

**Solution:**
1. Check your frontend URL (from browser address bar)
2. Add to allowed origins in `src/main.ts`
3. Or set `FRONTEND_URL` environment variable in Render
4. Redeploy backend

### Preview Deployments Not Working

**Cause:** Preview URLs are blocked in production mode

**Solutions:**
- Use production URL for testing
- Or temporarily allow all Vercel deployments (not recommended):
  ```typescript
  if (origin.endsWith('.vercel.app')) {
    return callback(null, true);
  }
  ```

### Database Connection Issues

Check `DATABASE_URL` format:
```
postgresql://username:password@host:port/database?sslmode=require
```

---

## Security Notes

1. **Never commit secrets** to GitHub
2. **Rotate JWT_SECRET** regularly
3. **Use HTTPS** in production (automatic on Render/Vercel)
4. **Limit CORS origins** to only your frontend domains
5. **Monitor logs** for suspicious activity

---

## Performance Tips

1. **Database Connection Pooling**: Already configured in Prisma
2. **Enable Caching**: Consider adding Redis for session management
3. **Rate Limiting**: Add in future for API protection
4. **Monitor Response Times**: Use Render metrics or external monitoring

---

## Updates & Maintenance

### Update Dependencies
```bash
npm outdated
npm update
```

### Database Migrations
```bash
# After updating schema.prisma
npx prisma migrate deploy
npx prisma generate
```

### Rollback
If deployment fails:
1. Render → Manual Deploy → Select previous commit
2. Or revert commit: `git revert HEAD && git push`

---

## Support

- Backend Docs: `https://your-backend.onrender.com/api/docs`
- Prisma Docs: https://www.prisma.io/docs
- NestJS Docs: https://docs.nestjs.com
