# Tools Subdomain Deployment Checklist

Use this checklist to deploy the tools subdomain configuration for your portfolio.

## Pre-Deployment

- [ ] Code changes committed and pushed to repository
- [ ] Reviewed middleware configuration in `middleware.ts`
- [ ] Verified TOOLS_ROUTES array includes all necessary routes

## Step 1: Configure DNS

**Provider:** (Your DNS provider, e.g., Cloudflare, Namecheap, etc.)

- [ ] Log into DNS provider
- [ ] Navigate to DNS records for `zynra.studio`
- [ ] Add CNAME record:
  - **Type:** CNAME
  - **Name:** `tools` (or `tools.zynra.studio` depending on provider)
  - **Target:** `cname.vercel-dns.com`
  - **TTL:** Auto or 3600
- [ ] Save DNS record
- [ ] Note: DNS propagation may take 5-10 minutes

### Alternative: A Records (if CNAME not available)

If your DNS provider doesn't support CNAME for subdomains:

- [ ] Add A record pointing to Vercel IPs:
  - `76.76.21.21`
  - Verify current IPs in [Vercel documentation](https://vercel.com/docs/concepts/edge-network/regions)

## Step 2: Deploy Code Changes

- [ ] Deploy to Vercel:
  ```bash
  vercel --prod
  ```
- [ ] Or push to main branch if auto-deploy is configured
- [ ] Wait for deployment to complete
- [ ] Note deployment URL: `___________________`

## Step 3: Configure Vercel Domain

- [ ] Open Vercel Dashboard: https://vercel.com/dashboard
- [ ] Select project: `portfolio` (or your project name)
- [ ] Navigate to **Settings** → **Domains**
- [ ] Click **Add Domain**
- [ ] Enter: `tools.zynra.studio`
- [ ] Click **Add**
- [ ] Wait for domain verification (should be automatic if DNS configured correctly)
- [ ] Wait for SSL certificate provisioning (1-5 minutes)
- [ ] Verify SSL status shows "Valid"

## Step 4: Set Environment Variables

- [ ] In Vercel Dashboard → Settings → Environment Variables
- [ ] Add new variable:
  - **Name:** `NEXT_PUBLIC_TOOLS_URL`
  - **Value:** `https://tools.zynra.studio`
  - **Environment:** Production, Preview, Development (select all)
- [ ] Click **Save**
- [ ] Trigger a new deployment to apply environment variables:
  ```bash
  vercel --prod --force
  ```

## Step 5: Local Development Setup

- [ ] Create/update `.env.local` file:
  ```bash
  NEXT_PUBLIC_TOOLS_URL=http://localhost:3000
  ```
- [ ] Restart development server:
  ```bash
  npm run dev
  ```
- [ ] Verify send-message page loads at: http://localhost:3000/send-message

## Step 6: Testing

### Test Tools Subdomain (Should Work ✅)

- [ ] Open browser: `https://tools.zynra.studio/send-message`
  - **Expected:** Page loads successfully
- [ ] Test API endpoint:
  ```bash
  curl https://tools.zynra.studio/api/send-client-message \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"to":"test@example.com","name":"Test","message":"Test"}'
  ```
  - **Expected:** Returns validation error (because email service requires valid data)
  - **Not expected:** 404 error

### Test Main Domain (Should Block ❌)

- [ ] Open browser: `https://zynra.studio/send-message`
  - **Expected:** 404 Not Found
- [ ] Test API endpoint:
  ```bash
  curl https://zynra.studio/api/send-client-message \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"to":"test@example.com","name":"Test","message":"Test"}'
  ```
  - **Expected:** 404 Not Found

### Test Main Domain Functionality (Should Work ✅)

- [ ] Homepage: `https://zynra.studio`
  - **Expected:** Loads normally
- [ ] About page: `https://zynra.studio/about`
  - **Expected:** Loads normally
- [ ] Projects page: `https://zynra.studio/projects`
  - **Expected:** Loads normally
- [ ] Quote form submission: `https://zynra.studio` (submit quote form)
  - **Expected:** Works normally
- [ ] Public API:
  ```bash
  curl https://zynra.studio/api/webhooks/notion
  ```
  - **Expected:** Returns webhook health check response

### Full Send Message Test

- [ ] Navigate to: `https://tools.zynra.studio/send-message`
- [ ] Fill out form with test data:
  - Recipient: Your email
  - Name: Test Client
  - Subject: Test Message
  - Message: This is a test
- [ ] Click **Send Email**
- [ ] Verify email received in inbox
- [ ] Check email formatting looks correct

## Step 7: Update Bookmarks/Documentation

- [ ] Update any internal team bookmarks to use `tools.zynra.studio`
- [ ] Notify team members of new URL
- [ ] Update any automation scripts or Make.com scenarios that reference old URLs

## Step 8: Monitor

**First 24 hours after deployment:**

- [ ] Check Vercel logs for any 404 errors on tools routes
- [ ] Monitor email deliverability
- [ ] Verify all team members can access tools subdomain
- [ ] Check for any CORS or cookie issues

## Troubleshooting

### Issue: DNS not resolving

```bash
# Check DNS propagation
nslookup tools.zynra.studio

# Or use online tool
# https://dnschecker.org/#A/tools.zynra.studio
```

**If not resolving:**
- Wait 10-15 minutes for propagation
- Verify CNAME record is correct in DNS provider
- Try flushing local DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### Issue: SSL Certificate Error

**Solution:**
- Wait up to 10 minutes for certificate provisioning
- Verify domain is properly added in Vercel
- Check Vercel domain status page for errors

### Issue: 404 on tools subdomain

**Check:**
- [ ] Middleware deployed successfully
- [ ] Domain added in Vercel
- [ ] DNS pointing to correct Vercel endpoint
- [ ] Check Vercel function logs for errors

### Issue: Tools accessible on main domain

**Check:**
- [ ] Clear browser cache
- [ ] Middleware properly deployed
- [ ] Check middleware.ts TOOLS_ROUTES array
- [ ] Verify latest deployment is live

## Rollback Plan

If issues arise and you need to rollback:

1. [ ] In Vercel, revert to previous deployment
2. [ ] Or remove middleware.ts and redeploy:
   ```bash
   git revert HEAD
   git push
   ```
3. [ ] Remove domain from Vercel if needed

## Completion

- [ ] All tests passing
- [ ] Team notified of new URLs
- [ ] Documentation updated
- [ ] Monitoring in place
- [ ] Deployment successful ✅

**Deployment Date:** _______________

**Deployed By:** _______________

**Notes:**
```
(Add any notes about issues encountered or special considerations)
```
