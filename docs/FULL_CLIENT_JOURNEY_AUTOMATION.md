# Full Client Journey Automation Guide

This guide documents the complete automation workflow for managing clients from initial lead through project completion.

## Overview

The automation extends the existing lead qualification workflow to handle the entire client lifecycle:

1. **Discovery Completed** → Prepare proposal & contract drafts
2. **Contract Signed** → Create Slack channel + Linear project (CRITICAL TRIGGER)
3. **Deposit Paid** → Activate project, post Slack message
4. **In Progress** → Manual work (light automation)
5. **Review** → Client review instructions
6. **Project Completion** → Final invoice, handover, testimonial request

## Architecture

```
Notion Watch Status Changes
    ↓
Router (by Status)
    ├─→ Discovery Completed → Generate Contract → Create Notion Page
    ├─→ Contract Signed → Create Slack Channel + Linear Project
    ├─→ Deposit Paid → Activate Project + Slack Message
    ├─→ Review → Post Review Instructions
    └─→ Project Completion → Final Handover
```

## Status Flow

### 1. Discovery Completed

**Trigger**: Status changes to "Discovery Completed"

**What Happens**:
- ✅ Contract draft generated from template
- ✅ Contract page created in Notion
- ✅ Notion page URL stored in Leads database
- ❌ NO Slack channel yet
- ❌ NO Linear project yet

**Make.com Route**:
1. HTTP: POST to `/api/generate-contract` with lead data
2. Notion: Update record with Contract URL (from API response)

**Required Notion Fields**:
- Project Name
- Scope Summary
- Fee
- Payment Terms
- Start Date
- Client Name (from Name field)
- Company Name (from Company field)

### 2. Contract Signed (CRITICAL TRIGGER)

**Trigger**: Status changes to "Contract Signed"

**What Happens**:
- ✅ Slack channel created (named after project)
- ✅ Client invited to Slack channel
- ✅ Welcome message posted
- ✅ Linear project created
- ✅ Placeholder issues added to Linear
- ✅ URLs stored in Notion

**Make.com Route**:
1. Slack: Create Channel (`{{projectName}}` sanitized)
2. Slack: Invite Users (team + client email)
3. Slack: Post Welcome Message (from template)
4. Linear: Create Project (status: "Planned")
5. Linear: Create Issues (6 placeholder issues)
6. Notion: Update record (Slack URL, Linear URL)

**Channel Naming**:
- Format: `projectname-client` (e.g., `website-acme`)
- Sanitization: Lowercase, hyphens for spaces, remove special chars

**Linear Issues Created**:
- Kickoff & Onboarding
- Discovery Recap
- Milestone 1
- Milestone 2
- QA & Review
- Handover

### 3. Deposit Paid

**Trigger**: Status changes to "Deposit Paid"

**What Happens**:
- ✅ Linear project status → "Active"
- ✅ Slack message posted ("Deposit received, work started")
- ✅ Notion status → "In Progress"

**Make.com Route**:
1. Linear: Update Project (status: "Active")
2. Slack: Post Message (deposit received template)
3. Notion: Update Record (status: "In Progress")

### 4. In Progress

**Status**: Manual work phase

**What Happens**:
- Team works on project
- Updates shared in Slack
- Progress tracked in Linear

**Automation**: Light - mainly manual updates

### 5. Review

**Trigger**: Status changes to "Review"

**What Happens**:
- ✅ Slack message with review instructions
- ✅ Linear issues moved to "Review" status

**Make.com Route**:
1. Slack: Post Message (review instructions template)
2. Linear: Update Issues (status: "Review")

### 6. Project Completion

**Trigger**: Status changes to "Project Completion"

**What Happens**:
- ✅ Final invoice generated (future API)
- ✅ Slack handover message
- ✅ Notion record archived/updated

**Make.com Route**:
1. HTTP: Generate final invoice (future)
2. Slack: Post handover message (from `templates/slack-handover-message.md`)
3. Notion: Update record (archive/complete)

## Notion Database Schema

### Required Properties

**Status** (select):
- Discovery
- Qualified
- Unqualified
- **Discovery Completed** (new)
- **Contract Signed** (new)
- **Deposit Paid** (new)
- **In Progress** (new)
- **Review** (new)
- **Project Completion** (new)

**Project Fields**:
- **Project Name** (text) - For Slack channel and Linear project naming
- **Scope Summary** (rich text) - Brief project description
- **Fee** (number) - Total project fee
- **Payment Terms** (select) - Options: "50/50", "30/70", "Full upfront"
- **Start Date** (date) - Project start date

**URL Fields** (auto-populated):
- **Slack Channel URL** (URL) - Set after channel creation
- **Linear Project URL** (URL) - Set after project creation
- **Contract URL** (URL) - Notion page link
- **Invoice URL** (URL) - Final invoice link

**ID Fields** (auto-populated):
- **Linear Project ID** (text) - Set after project creation, used for GraphQL updates

**Other Fields**:
- **Owner** (person) - Internal project owner
- **Company** (text) - Already exists
- **Name** (title) - Client name
- **Email** (email) - Client email

## API Endpoints

### Contract Generation

**Endpoint**: `POST /api/generate-contract`

**Request**:
```json
{
  "leadData": {
    "clientName": "John Doe",
    "companyName": "Acme Corp",
    "projectName": "Website Redesign",
    "scopeSummary": "Complete website redesign with new branding",
    "fee": 25000,
    "paymentTerms": "50/50",
    "startDate": "2026-02-01"
  }
}
```

**Response**:
```json
{
  "success": true,
  "html": "<html>...</html>",
  "url": "https://notion.so/abc123def456..."
}
```

**Note**: The API automatically creates a Notion page with the contract content and returns the shareable URL.

## Templates

### Contract Template

**Location**: `templates/contract.html`

**Variables**:
- `{{clientName}}`
- `{{companyName}}`
- `{{projectName}}`
- `{{scopeSummary}}`
- `{{fee}}`
- `{{paymentTerms}}`
- `{{startDate}}`
- `{{currentDate}}`

### Slack Message Templates

**Location**: `templates/slack-*.md`

**Templates**:
- `slack-welcome-message.md` - Welcome to project channel
- `slack-deposit-received.md` - Deposit confirmation
- `slack-review-instructions.md` - Review instructions
- `slack-handover-message.md` - Project completion handover

**Variables**: 
- `{{clientName}}` - Client name
- `{{projectName}}` - Project name
- `{{companyName}}` - Company name
- `{{completionDate}}` - Project completion date (or current date)
- Additional variables vary by template (see individual template files)

### Linear Project Template

**Location**: `config/linear-project-template.json`

**Default Issues**:
1. Kickoff & Onboarding
2. Discovery Recap
3. Milestone 1
4. Milestone 2
5. QA & Review
6. Handover

## Make.com Scenario Setup

> **For detailed step-by-step Make.com scenario creation instructions, see [Full Client Journey Automation - Make.com Setup Guide](make-scenarios/02-full-client-journey-automation.md)**

This automation requires a separate Make.com scenario that handles all status transitions from Discovery Completed through Project Completion.

### Scenario Overview

**Scenario Name**: "Full Client Journey Automation"

**Trigger**: Notion Watch Data Source Items (same as Gmail Draft scenario, but different router filters)

**Routes**:
1. **Discovery Completed** → Generate Contract → Create Notion Page
2. **Contract Signed** → Create Slack Channel + Linear Project (CRITICAL TRIGGER)
3. **Deposit Paid** → Activate Project + Slack Message
4. **Review** → Post Review Instructions
5. **Project Completion** → Final Handover

### Key Automation Points

**Discovery Completed Route**:
- HTTP: POST to `/api/generate-contract`
- Notion: Update Contract URL field

**Contract Signed Route** (Most Important):
- Slack: Create channel, invite users, post welcome message
- Linear: Create project with 6 placeholder issues
- Notion: Store Slack and Linear URLs

**Deposit Paid Route**:
- Linear: Activate project
- Slack: Post deposit confirmation
- Notion: Update status to "In Progress"

**Review Route**:
- Slack: Post review instructions
- Linear: Move issues to Review status

**Project Completion Route**:
- Slack: Post handover message
- Notion: Final status updates

### Property Mapping

All routes use the same Notion Watch trigger (Module 1) and access properties via:
- Rich text: `{{1.properties_value.PropertyName[1].plain_text}}`
- Select: `{{1.properties_value.PropertyName.name}}`
- Direct: `{{1.properties_value.PropertyName}}`

See the [detailed guide](make-scenarios/02-full-client-journey-automation.md) for complete module configurations and property mappings.

## Environment Variables

```bash
# Existing
NOTION_API_KEY=
NOTION_LEADS_DATABASE_ID=91ba6dd0506a49e4b7f7706db990d872
NOTION_EMAIL_TEMPLATES_DATABASE_ID=b98e9d2eeeb44444bf58a71f62f95f3b
NEXT_PUBLIC_URL=https://zynra.studio

# Optional: Parent page for contracts (if you want contracts in a specific location)
# Contracts page ID: 2ee13f3ae6f3816f92f5e797392ec4bc
NOTION_CONTRACTS_PARENT_PAGE_ID=2ee13f3ae6f3816f92f5e797392ec4bc

# New (for full client journey)
SLACK_BOT_TOKEN=
SLACK_TEAM_ID=
LINEAR_API_KEY=
LINEAR_TEAM_ID=
```

## Testing Checklist

### Phase 1: Contract Generation
- [ ] Status → "Discovery Completed"
- [ ] Contract generated successfully
- [ ] Notion page created with contract content
- [ ] Contract URL stored in Notion

### Phase 2: Contract Signed
- [ ] Status → "Contract Signed"
- [ ] Slack channel created with correct name
- [ ] Client invited to Slack
- [ ] Welcome message posted
- [ ] Linear project created
- [ ] All 6 issues created
- [ ] URLs stored in Notion

### Phase 3: Deposit Paid
- [ ] Status → "Deposit Paid"
- [ ] Linear project activated
- [ ] Slack message posted
- [ ] Notion status → "In Progress"

### Phase 4: Review
- [ ] Status → "Review"
- [ ] Review instructions posted
- [ ] Linear issues moved to Review

### Phase 5: Completion
- [ ] Status → "Project Completion"
- [ ] Handover message posted
- [ ] Notion record updated

## Troubleshooting

For detailed troubleshooting steps and solutions, see the [Full Client Journey Automation - Make.com Setup Guide](make-scenarios/02-full-client-journey-automation.md).

### Common Issues

**Contract Not Generated**:
- Check API endpoint is accessible
- Verify all required fields in Notion (Project Name, Fee, Payment Terms, etc.)
- Check Make.com execution logs

**Slack Channel Not Created**:
- Verify Slack bot token and permissions
- Check channel name sanitization
- Ensure client email is valid

**Linear Project Not Created**:
- Verify Linear API key and team ID
- Check project creation permissions
- Ensure project name is valid

**Contract Page Creation Fails**:
- Verify NOTION_API_KEY is valid
- Check Notion integration permissions
- Ensure parent page (if set) is accessible

## Best Practices

1. **Always verify Notion fields** before triggering automation
2. **Test each route independently** before full workflow
3. **Monitor Make.com execution history** for errors
4. **Keep templates updated** as project needs change
5. **Document any manual overrides** needed

## Support

For issues or questions:
- Check Make.com execution logs
- Review Notion database for missing fields
- Verify API endpoints are accessible
- Consult individual API documentation
