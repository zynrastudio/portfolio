# Zynra Studio Portfolio

A modern Next.js portfolio with automated client journey management, from lead capture through project completion.

## Features

- **Modern Portfolio Site**: Showcase projects, services, and team
- **Lead Capture Form**: Quote request system with instant email notifications
- **Automated Client Journey**: Complete workflow automation from lead to completion
- **Instant Webhooks**: Real-time triggers (< 1 second) via Make.com integration
- **Notion Integration**: Lead database with automated contract generation
- **Slack Integration**: Auto-create project channels and send updates
- **Linear Integration**: Auto-create projects and manage issues
- **Email Automation**: Welcome emails, rejection emails, and acknowledgments

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the portfolio.

## Automation Setup

This portfolio includes a complete client journey automation system:

### 1. Lead Capture → Notion
- Quote form submission creates Notion lead record
- Instant email notification to team
- Acknowledgment email sent to client

### 2. Unified Make.com Scenario (7 Routes)
**Instant webhook trigger** - no polling delays!

- **Route 1**: Qualified → Generate welcome email draft
- **Route 2**: Unqualified → Generate rejection email draft
- **Route 3**: Discovery Completed → Generate contract in Notion
- **Route 4**: Contract Signed → Create Slack channel + Linear project
- **Route 5**: Deposit Paid → Activate project, update status
- **Route 6**: Review → Post review instructions
- **Route 7**: Project Completion → Final handover message

### Quick Setup Guides

- **30-Minute Setup**: [`docs/WEBHOOK_QUICK_START.md`](docs/WEBHOOK_QUICK_START.md)
- **Complete Blueprint**: [`docs/UNIFIED_SCENARIO_BLUEPRINT.md`](docs/UNIFIED_SCENARIO_BLUEPRINT.md)
- **Detailed Guide**: [`docs/NOTION_WEBHOOK_SETUP.md`](docs/NOTION_WEBHOOK_SETUP.md)

## Environment Variables

```bash
# Next.js
NEXT_PUBLIC_URL=https://zynra.studio

# Email (Resend)
RESEND_API_KEY=

# Notion
NOTION_API_KEY=
NOTION_LEADS_DATABASE_ID=91ba6dd0506a49e4b7f7706db990d872
NOTION_EMAIL_TEMPLATES_DATABASE_ID=b98e9d2eeeb44444bf58a71f62f95f3b
NOTION_CONTRACTS_PARENT_PAGE_ID=2ee13f3ae6f3816f92f5e797392ec4bc

# Webhooks (Optional - for custom webhook receiver)
MAKE_WEBHOOK_URL=
NOTION_WEBHOOK_SECRET=

# Slack (for automation)
SLACK_BOT_TOKEN=
SLACK_TEAM_ID=

# Linear (for automation)
LINEAR_API_KEY=
LINEAR_TEAM_ID=
```

## API Endpoints

### Public Endpoints
- `POST /api/quote` - Submit quote request (creates lead + sends emails)

### Automation Endpoints (for Make.com)
- `POST /api/generate-welcome-email` - Generate welcome email from template
- `POST /api/generate-rejection-email` - Generate rejection email from template
- `POST /api/generate-contract` - Generate contract in Notion

### Webhook Endpoints
- `POST /api/webhooks/notion` - Receive Notion database change webhooks
- `GET /api/webhooks/notion` - Health check

## Project Structure

```
app/
├── api/
│   ├── quote/              # Lead capture endpoint
│   ├── generate-welcome-email/
│   ├── generate-rejection-email/
│   ├── generate-contract/
│   └── webhooks/
│       └── notion/         # Webhook receiver
├── about/
├── projects/
├── services/
└── contact/

components/
├── ui/                     # UI components
│   ├── quote-dialog.tsx   # Quote request form
│   ├── header.tsx
│   ├── footer.tsx
│   └── ...

lib/
├── notion-client.ts       # Notion API utilities
├── notion-webhooks.ts     # Webhook management
├── email-templates.ts     # Email generation
└── types/

docs/
├── WEBHOOK_QUICK_START.md       # 30-min setup guide
├── UNIFIED_SCENARIO_BLUEPRINT.md # Complete Make.com blueprint
├── NOTION_WEBHOOK_SETUP.md      # Detailed webhook guide
└── make-scenarios/              # Individual route guides
    ├── 01-gmail-draft-automation.md
    └── 02-full-client-journey-automation.md

templates/
├── contract.html                 # Contract template
└── slack-*.md                    # Slack message templates
```

## Testing

### Test API Endpoints
```bash
# Test contract generation
npm run test:email-api

# Or manually test with curl
curl -X POST http://localhost:3000/api/quote \
  -H "Content-Type: application/json" \
  -d @test-data/quote-request.json
```

### Test Webhook Receiver
```bash
curl -X GET http://localhost:3000/api/webhooks/notion
```

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Important**: Set all environment variables in Vercel dashboard before deploying.

### After Deployment

1. Test all API endpoints with production URLs
2. Set up Make.com unified scenario with instant webhook trigger
3. Test each route independently
4. Disable old polling scenarios
5. Monitor execution history for 24 hours

## Documentation

### Setup Guides
- [Webhook Quick Start](docs/WEBHOOK_QUICK_START.md) - Get started in 30 minutes
- [Unified Scenario Blueprint](docs/UNIFIED_SCENARIO_BLUEPRINT.md) - Complete module reference
- [Notion Webhook Setup](docs/NOTION_WEBHOOK_SETUP.md) - Detailed webhook guide

### Reference
- [Quick Reference](docs/QUICK_REFERENCE.md) - Common patterns and mappings
- [Gmail Draft Automation](docs/make-scenarios/01-gmail-draft-automation.md) - Routes 1-2
- [Full Client Journey](docs/make-scenarios/02-full-client-journey-automation.md) - Routes 3-7

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Email**: Resend
- **Database**: Notion (via official API)
- **Automation**: Make.com
- **Project Management**: Linear (via GraphQL)
- **Communication**: Slack
- **Deployment**: Vercel

## Key Benefits

✅ **Instant Triggers**: Webhook-based automation (< 1 second)
✅ **Single Scenario**: All automation in one unified scenario
✅ **Lower Costs**: No duplicate polling, operations only on changes
✅ **More Reliable**: Never miss status changes
✅ **Easier Maintenance**: One place to update all automation
✅ **Better Monitoring**: Single execution history to review

## Support

For issues or questions:
1. Check the [Quick Start Guide](docs/WEBHOOK_QUICK_START.md)
2. Review Make.com execution history
3. Check Notion database for missing fields
4. Verify all API endpoints are working

## License

Private project - All rights reserved.
