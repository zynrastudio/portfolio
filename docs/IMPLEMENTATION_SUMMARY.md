# Make.com Email Draft Automation - Implementation Summary

## Overview

This implementation sets up an automation workflow that monitors the Notion Leads database for status changes. When a lead is marked as "Qualified" or "Unqualified", the system generates HTML emails using templates stored in Notion and creates Gmail drafts for manual review and sending.

## What Has Been Implemented

### 1. Email Template Functions ✅

Created two email template generators matching the acknowledgment email design:

- **`lib/email-templates-welcome.ts`**
  - Generates welcome email for qualified leads
  - Follows the 5-section structure:
    1. Personal acknowledgement
    2. What you understood from their request
    3. What the call will clarify
    4. Scheduling link (CTA button)
    5. Reassurance (timeline / next steps)
  - Subject: "Thanks for reaching out — let's talk about your project"
  - Variables: `{name}`, `{service}`, `{company}`, `{budgetRange}`, `{timeline}`, `{message}`, `{schedulingLink}`

- **`lib/email-templates-rejection.ts`**
  - Generates rejection email for unqualified leads
  - Professional rejection message with reason placeholder
  - Subject: "Thank you for your interest - Zynra Studio"
  - Variables: `{name}`, `{reason}`

Both templates use the same dark theme design (#0a0a0a background, glassmorphism style) as the acknowledgment email.

### 2. Notion Database Setup Scripts ✅

- **`scripts/setup-notion-email-templates.ts`**
  - Creates Email Templates database in Notion
  - Adds initial Welcome and Rejection template entries
  - Provides database ID for environment variable

- **`scripts/update-leads-database-schema.ts`**
  - Checks current Leads database schema
  - Provides instructions for manually adding new properties:
    - Rejection Reason (Rich Text)
    - Email Draft Created (Checkbox)
    - Draft Email ID (Rich Text)

### 3. Make.com Scenario Documentation ✅

- **`docs/make-scenario-blueprint.json`**
  - Complete scenario structure with 9 modules
  - Module flow: Trigger → Router → Template Fetch → Email Generation → Gmail Draft → Notion Update

- **`docs/MAKE_AUTOMATION_SETUP.md`**
  - Comprehensive setup guide
  - Step-by-step instructions for:
    - Creating Email Templates database
    - Updating Leads database schema
    - Creating Make.com scenario
    - Template variable replacement logic
    - Testing procedures
    - Troubleshooting guide

## Architecture

```
Notion Leads DB (Status Change)
    ↓
Make.com Trigger (Watch Database)
    ↓
Router (Qualified vs Unqualified)
    ↓
    ├─→ Qualified Path
    │   ├─→ Get Welcome Template (Notion)
    │   ├─→ Generate Welcome Email HTML (Replace Variables)
    │   └─→ Create Gmail Draft (Welcome)
    │
    └─→ Unqualified Path
        ├─→ Get Rejection Template (Notion)
        ├─→ Generate Rejection Email HTML (Replace Variables)
        └─→ Create Gmail Draft (Rejection)
    ↓
Update Notion Record (Draft Created Status)
```

## Next Steps for User

### 1. Run Setup Scripts

```bash
# Create Email Templates database
npx tsx scripts/setup-notion-email-templates.ts

# Check Leads database schema
npx tsx scripts/update-leads-database-schema.ts
```

### 2. Manual Notion Setup

- Add the three new properties to Leads database (if not done automatically)
- Copy HTML templates from the generated functions into Notion Email Templates database
- Note the database IDs for Make.com configuration

### 3. Create Make.com Scenario

Follow the detailed guide in `docs/MAKE_AUTOMATION_SETUP.md`:
- Set up Notion connection
- Set up Google Email (Gmail) connection
- Create scenario using the blueprint structure
- Configure template variable replacement logic
- Test with sample lead status changes

### 4. Test the Automation

- Update a lead to "Qualified" status → Verify welcome email draft created
- Update a lead to "Unqualified" status → Verify rejection email draft created
- Check that Notion records are updated correctly
- Review email designs match the acknowledgment email aesthetic

## Files Created

1. `lib/email-templates-welcome.ts` - Welcome email template generator
2. `lib/email-templates-rejection.ts` - Rejection email template generator
3. `scripts/setup-notion-email-templates.ts` - Notion database setup script
4. `scripts/update-leads-database-schema.ts` - Schema update checker script
5. `docs/make-scenario-blueprint.json` - Make.com scenario structure
6. `docs/MAKE_AUTOMATION_SETUP.md` - Complete setup guide
7. `docs/IMPLEMENTATION_SUMMARY.md` - This file

## Environment Variables Needed

Add to `.env.local`:

```env
NOTION_API_KEY=your-notion-api-key
NOTION_LEADS_DATABASE_ID=91ba6dd0506a49e4b7f7706db990d872
NOTION_WORKSPACE_PAGE_ID=your-workspace-page-id (for script)
NOTION_EMAIL_TEMPLATES_DATABASE_ID=your-email-templates-db-id (after creation)
```

## Key Features

- ✅ Dark theme email design matching acknowledgment email
- ✅ Welcome email with 5-section structure as specified
- ✅ Rejection email with professional messaging
- ✅ Template variable system for dynamic content
- ✅ Make.com automation blueprint
- ✅ Comprehensive setup documentation
- ✅ Error handling and troubleshooting guides

## Notes

- The HTML templates need to be manually copied into Notion's Email Templates database
- Make.com scenario requires manual creation using the blueprint as a guide
- Template variable replacement uses Make.com's Code module or Text Parser
- Gmail drafts are created for manual review before sending
- Notion records are updated to track draft creation status

## Support

Refer to `docs/MAKE_AUTOMATION_SETUP.md` for detailed setup instructions and troubleshooting.
