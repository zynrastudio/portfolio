# Tools Subdomain Setup Guide

This guide explains how the tools subdomain (`tools.zynra.studio`) is configured and how to set it up for your deployment.

## Overview

The send-message functionality and related tools are isolated to a separate subdomain for security purposes. This means:

- ✅ **Main domain** (`zynra.studio`): Public portfolio, services, projects, and quote form
- ✅ **Tools subdomain** (`tools.zynra.studio`): Client communication tools, contract generation, and internal APIs

## Architecture

The project uses **Next.js middleware** to implement domain-based routing within a single codebase. Both domains point to the same Vercel deployment, but middleware restricts access based on the requesting domain.

```
┌─────────────────────────────────────────────────────┐
│                  Vercel Deployment                  │
│                                                     │
│  ┌──────────────┐              ┌──────────────┐   │
│  │  Main Domain │              │ Tools Domain │   │
│  │ zynra.studio │              │ tools.zynra  │   │
│  │              │              │   .studio    │   │
│  └──────┬───────┘              └──────┬───────┘   │
│         │                             │            │
│         │        ┌────────────┐       │            │
│         └────────┤ Middleware ├───────┘            │
│                  └─────┬──────┘                    │
│                        │                           │
│         ┌──────────────┼──────────────┐            │
│         │              │              │            │
│    ┌────▼─────┐   ┌───▼────┐   ┌────▼─────┐      │
│    │ Public   │   │ Tools  │   │ Shared   │      │
│    │ Routes   │   │ Routes │   │ APIs     │      │
│    └──────────┘   └────────┘   └──────────┘      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Restricted Routes

The following routes are **only accessible** on `tools.zynra.studio`:

### Pages
- `/send-message` - Client communication tool with rich text editor

### API Endpoints
- `/api/send-client-message` - Send custom emails to clients
- `/api/generate-contract` - Generate contract HTML
- `/api/generate-welcome-email` - Generate welcome email templates
- `/api/generate-rejection-email` - Generate rejection email templates
- `/api/generate-audit-pdf` - Generate audit report PDFs
- `/api/generate-audit-preview` - Preview audit reports
- `/api/generate-pdf` - General PDF generation

### Public Routes (Available on Both Domains)
- `/api/quote` - Quote request submission
- `/api/webhooks/notion` - Webhook receiver
- All other pages and routes

## Setup Instructions

### 1. DNS Configuration

Add a CNAME record in your DNS provider (e.g., Cloudflare, Namecheap):

```
Type:   CNAME
Name:   tools
Target: cname.vercel-dns.com
TTL:    Auto
```

Or if CNAME is not available, use A records pointing to Vercel IPs.

### 2. Vercel Domain Configuration

1. Go to your Vercel Dashboard
2. Select your project
3. Navigate to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `tools.zynra.studio`
6. Click **Add**
7. Wait for SSL certificate provisioning (usually 1-5 minutes)

### 3. Environment Variables

Add the following environment variable in Vercel:

```bash
NEXT_PUBLIC_TOOLS_URL=https://tools.zynra.studio
```

For local development:

```bash
NEXT_PUBLIC_TOOLS_URL=http://localhost:3000
```

### 4. Deployment

The middleware is automatically deployed with your Next.js application. No additional configuration needed!

```bash
# Deploy to Vercel
vercel --prod
```

## Local Development

During local development, the middleware allows access to all routes regardless of domain. You can test the send-message functionality at:

```
http://localhost:3000/send-message
```

To test the production domain-based routing locally, you can:

1. **Use `localhost` (default)**: All routes are accessible
2. **Test with host override**: Use browser dev tools or curl with Host header

```bash
# Test blocking (simulates main domain)
curl -H "Host: zynra.studio" http://localhost:3000/send-message

# Test allowing (simulates tools subdomain)
curl -H "Host: tools.zynra.studio" http://localhost:3000/send-message
```

## Testing After Deployment

### 1. Verify Subdomain Accessibility

✅ **Should work:**
```bash
curl https://tools.zynra.studio/send-message
# Should return the send-message page HTML
```

❌ **Should be blocked:**
```bash
curl https://zynra.studio/send-message
# Should return 404
```

### 2. Test API Endpoints

✅ **Should work:**
```bash
curl -X POST https://tools.zynra.studio/api/send-client-message \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","name":"Test","message":"Test message"}'
```

❌ **Should be blocked:**
```bash
curl -X POST https://zynra.studio/api/send-client-message \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","name":"Test","message":"Test message"}'
# Should return 404
```

### 3. Verify Main Site Unaffected

```bash
curl https://zynra.studio
# Should work normally
```

## How It Works

### Middleware (`middleware.ts`)

```typescript
// Pseudo-code showing the logic
if (route is in TOOLS_ROUTES) {
  if (hostname includes 'tools.zynra.studio') {
    allow()
  } else {
    return 404
  }
} else {
  allow()
}
```

The middleware:
1. Checks if the requested path is a tools-only route
2. Verifies the request is coming from the tools subdomain
3. Blocks access with 404 if from main domain
4. Allows all requests from tools subdomain

### Benefits

1. ✅ **Single Codebase**: No code duplication
2. ✅ **Single Deployment**: One Vercel project for both domains
3. ✅ **Complete Isolation**: Tools inaccessible from main domain
4. ✅ **Cost Effective**: No additional hosting costs
5. ✅ **Easy Maintenance**: Update both domains simultaneously
6. ✅ **Better Security**: Hide internal tools from public

## Troubleshooting

### Issue: "404 Not Found" on tools subdomain

**Causes:**
- DNS not configured correctly
- Domain not added in Vercel
- SSL certificate still provisioning

**Solutions:**
1. Verify DNS CNAME record points to `cname.vercel-dns.com`
2. Check domain is added in Vercel Dashboard
3. Wait 5-10 minutes for DNS propagation
4. Check SSL certificate status in Vercel

### Issue: Tools accessible on main domain

**Causes:**
- Middleware not deployed
- Environment not using production build

**Solutions:**
1. Verify `middleware.ts` exists in project root
2. Redeploy to Vercel
3. Check middleware logs in Vercel dashboard

### Issue: Main site features broken

**Causes:**
- Public routes accidentally blocked by middleware

**Solutions:**
1. Verify TOOLS_ROUTES array only includes tools routes
2. Check middleware config matcher excludes static files
3. Test public endpoints directly

## Maintenance

### Adding New Tool Routes

To add a new route that should be tools-only:

1. Edit `middleware.ts`
2. Add route to `TOOLS_ROUTES` array:

```typescript
const TOOLS_ROUTES = [
  '/send-message',
  '/api/send-client-message',
  // Add new route here
  '/api/your-new-tool',
]
```

3. Deploy the changes

### Removing Subdomain Restriction

If you need to make a route public again:

1. Remove it from `TOOLS_ROUTES` array in `middleware.ts`
2. Deploy the changes

## Security Considerations

- ✅ Routes return 404 (not 403) to hide existence
- ✅ Middleware runs before route handlers (efficient)
- ✅ Local development remains convenient
- ⚠️ Consider adding authentication for extra security
- ⚠️ Monitor access logs in Vercel

## Additional Resources

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Vercel Domain Configuration](https://vercel.com/docs/concepts/projects/domains)
- [Client Message Template Usage](./CLIENT_MESSAGE_TEMPLATE_USAGE.md)
