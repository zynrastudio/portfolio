# Quick Reference - Notion Lead Automation

## Database IDs

### Notion Databases
- **Leads Database**: `91ba6dd0506a49e4b7f7706db990d872`
  - Data Source ID: `ce12e087-e701-4902-ae70-8ff582981d1b`
- **Email Templates Database**: `b98e9d2eeeb44444bf58a71f62f95f3b`
  - Data Source ID: `ac3ca188-2c71-4c83-85ea-7392d7fbe8ec`

### Email Template Page IDs
- **Welcome Email Template**: `2ee13f3ae6f38117b3eef77f98ce06c2`
- **Rejection Email Template**: `2ee13f3ae6f381cca68ae4b059d8eda5`

### Contract Organization
- **Contracts Parent Page**: `2ee13f3ae6f3816f92f5e797392ec4bc`
  - Optional: Set `NOTION_CONTRACTS_PARENT_PAGE_ID=2ee13f3ae6f3816f92f5e797392ec4bc` to organize contracts under this page
  - If not set, contracts are created as standalone pages in workspace

## API Endpoints

### Production URLs
- **Welcome Email Generator**: `https://zynra.studio/api/generate-welcome-email`
- **Rejection Email Generator**: `https://zynra.studio/api/generate-rejection-email`
- **Contract Generator**: `https://zynra.studio/api/generate-contract`
  - Creates Notion page automatically
  - Returns Notion page URL in response

### Authentication
- **Type**: No authentication (public endpoints)
- **Headers Required**: `Content-Type: application/json`
- **Method**: POST

### Request Format

**Welcome Email**:
```json
{
  "templatePageId": "2ee13f3ae6f38117b3eef77f98ce06c2",
  "leadData": {
    "name": "Client Name",
    "email": "client@example.com",
    "service": "Website Development",
    "company": " and your team at CompanyName",
    "budgetRange": " with a budget of $10k-$25k",
    "timeline": "You're looking to launch in 3-4 months",
    "message": "\n\nYou mentioned: 'original message here'",
    "schedulingLink": "https://cal.com/zynra-studio"
  }
}
```

**Rejection Email**:
```json
{
  "templatePageId": "2ee13f3ae6f381cca68ae4b059d8eda5",
  "leadData": {
    "name": "Client Name",
    "email": "client@example.com",
    "rejectionReason": "Your project scope is outside our current offerings."
  }
}
```

### Response Format
```json
{
  "success": true,
  "html": "<html>...</html>",
  "subject": "Email subject line"
}
```

## Make.com Scenario Structure

### Module Flow
```
1. Notion Watch Data Source Items (Trigger)
   ↓
2. Router (Filter by Status)
   ├─→ Route 1: Status = "Qualified"
   │   ├─→ 3A. HTTP Request (Generate Welcome Email)
   │   ├─→ 4A. Create Email Draft
   │   └─→ 5A. Update Notion Record
   │
   ├─→ Route 2: Status = "Unqualified"
   │   ├─→ 3B. HTTP Request (Generate Rejection Email)
   │   ├─→ 4B. Create Email Draft
   │   └─→ 5B. Update Notion Record
   │
   ├─→ Route 3: Status = "Discovery Completed"
   │   ├─→ 3C. HTTP Request (Generate Contract)
   │   ├─→ 4C. HTTP Request (Upload to DocSend)
   │   └─→ 5C. Update Notion Record (Contract URL)
   │
   ├─→ Route 4: Status = "Contract Signed" (CRITICAL)
   │   ├─→ 3D. Slack Create Channel
   │   ├─→ 4D. Slack Invite Users
   │   ├─→ 5D. Slack Post Welcome Message
   │   ├─→ 6D. Linear Create Project
   │   ├─→ 7D. Linear Create Issues (6 issues)
   │   └─→ 8D. Update Notion Record (Slack URL, Linear URL)
   │
   ├─→ Route 5: Status = "Deposit Paid"
   │   ├─→ 3E. Linear Update Project (Active)
   │   ├─→ 4E. Slack Post Deposit Message
   │   └─→ 5E. Update Notion Record (Status: In Progress)
   │
   ├─→ Route 6: Status = "Review"
   │   ├─→ 3F. Slack Post Review Instructions
   │   └─→ 4F. Linear Update Issues (Review status)
   │
   └─→ Route 7: Status = "Project Completion"
       ├─→ 3G. HTTP Request (Generate Invoice - future)
       ├─→ 4G. Slack Post Handover Message
       └─→ 5G. Update Notion Record (Archive)
```

**Note**: No Search Objects modules needed - template IDs are hardcoded for reliability.

### Critical Module Configurations

**Module 3A/3B (HTTP Request)**:
- URL: See API Endpoints above
- Method: POST
- Authentication: No authentication
- Headers: `Content-Type: application/json`
- Body Type: Raw
- Content Type: JSON (application/json)
- **Template ID**: Hardcoded (Welcome: `2ee13f3ae6f38117b3eef77f98ce06c2`, Rejection: `2ee13f3ae6f381cca68ae4b059d8eda5`)
- **Lead Data Mapping** (⚠️ CRITICAL - Make.com uses 1-based indexing):
  - Rich Text: `{{1.properties_value.Name[1].plain_text}}` (use `[1]` not `[0]`)
  - Select: `{{1.properties_value.Service.name}}` (use `.name`)
  - Email/Phone/URL: `{{1.properties_value.Email}}` (no array, no .name)

**Module 4A/4B (Create Email Draft)**:
- To: `{{1.properties_value.Email}}`
- Subject: `{{3.Body.subject}}` ⚠️ NOT `{{3}}` or `{{3.Body}}`
- Content: `{{3.Body.html}}` ⚠️ NOT `{{3}}` or `{{3.Body}}`
- Content Type: HTML

## Testing Commands

### Test API Endpoints
```bash
# Test both Welcome and Rejection email APIs
npx tsx scripts/test-email-api.ts
```

### Get Template IDs
```bash
# Fetch template IDs from Notion database
npx tsx scripts/get-template-ids.ts
```

### Create Email Templates
```bash
# Create initial email template pages
npx tsx scripts/create-email-template-pages.ts
```

### Update Leads Database Schema
```bash
# Add required fields to Leads database
npx tsx scripts/update-leads-database-schema.ts
```

## Common Issues & Quick Fixes

### Empty Email Drafts
**Problem**: Draft created but no subject/body
**Solution**: 
1. Check Module 5 mappings use `{{4.Body.html}}` and `{{4.Body.subject}}`
2. Delete duplicate/blank templates from Email Templates database
3. Verify templates have HTML code blocks

### Invalid JSON Error
**Problem**: HTTP module fails with "The provided JSON body content is not valid JSON"
**Solution**: 
1. Use `[1]` not `[0]` for array indexing (Make.com uses 1-based indexing)
2. Add `.plain_text` after rich text arrays: `{{1.properties_value.Name[1].plain_text}}`
3. Add `.name` after select properties: `{{1.properties_value.Service.name}}`
4. Don't use `first()` function - it returns the entire object, not the text

**Correct Mappings**:
- ✅ `{{1.properties_value.Name[1].plain_text}}`
- ✅ `{{1.properties_value.Service.name}}`
- ❌ `{{1.properties_value.Name[0].plain_text}}` (wrong index)
- ❌ `{{first(1.properties_value.Name).plain_text}}` (returns object)

### Template Not Found Error
**Problem**: API returns "Could not find page"
**Solution**: Share Email Templates database with Notion integration
- Database → `•••` → "Add connections" → Select integration

### Template HTML Not Found
**Problem**: API returns "Template HTML not found"
**Solution**: 
1. Open template page in Notion
2. Verify HTML code blocks exist
3. Delete blank templates, keep only templates with content

### "Module references non-existing module NaN"
**Problem**: Warning about NaN module reference
**Solution**: Old mappings reference deleted modules
1. Open each module and clear all fields with warnings
2. Re-map using visual mapper (don't type manually)
3. Ensure all module references use correct numbers

## Status Values

### Notion Leads Database Status Options
- **Discovery** - Initial lead status
- **Qualified** - Lead qualified for welcome email
- **Unqualified** - Lead rejected, send rejection email
- **Discovery Completed** - Discovery call finished, prepare contract
- **Contract Signed** - Contract signed, create Slack + Linear (CRITICAL TRIGGER)
- **Deposit Paid** - Deposit received, activate project
- **In Progress** - Active project work
- **Review** - Client review phase
- **Project Completion** - Project finished, final handover

## Notion Database Fields

### Auto-Populated Fields (Set by Automation)
- **Linear Project ID** (text) - Stored when Linear project is created (Route 2: Contract Signed)
  - Used for GraphQL project updates (Route 3: Deposit Paid)
  - Access in Make.com: `{{1.properties_value.Linear Project ID}}`
- **Linear Project URL** (URL) - Set after project creation
- **Slack Channel URL** (URL) - Set after channel creation
- **Contract URL** (URL) - Set after contract page creation
- **Email Draft Created** (checkbox) - Set after email draft creation
- **Draft Email ID** (text) - Gmail draft ID

## Environment Variables

Required in `.env` file:
```bash
# Existing
NOTION_API_KEY=your_notion_api_key
NOTION_LEADS_DATABASE_ID=91ba6dd0506a49e4b7f7706db990d872
NOTION_EMAIL_TEMPLATES_DATABASE_ID=b98e9d2eeeb44444bf58a71f62f95f3b
NEXT_PUBLIC_URL=https://zynra.studio

# Optional: Parent page for contracts (if you want contracts in a specific location)
# Contracts page ID: 2ee13f3ae6f3816f92f5e797392ec4bc
NOTION_CONTRACTS_PARENT_PAGE_ID=2ee13f3ae6f3816f92f5e797392ec4bc

# New (for full client journey)
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_TEAM_ID=your-slack-team-id
LINEAR_API_KEY=your_linear_api_key
LINEAR_TEAM_ID=your_linear_team_id
```

## Important Reminders

✅ **Before Testing**:
- [ ] Both databases shared with Notion integration
- [ ] Only ONE Welcome and ONE Rejection template exist
- [ ] Templates have HTML content in code blocks
- [ ] API endpoints tested successfully
- [ ] Module 5 maps `Body.html` and `Body.subject` correctly

⚠️ **Don't Forget**:
- Integration access is REQUIRED for API to work
- Delete duplicate templates to avoid wrong template selection
- Map specific fields from HTTP response, not entire object
- Content Type in email module must be set to HTML

## Documentation Files

### Make.com Scenario Guides
- **Gmail Draft Automation**: `docs/make-scenarios/01-gmail-draft-automation.md` - Qualified/Unqualified lead handling
- **Full Client Journey Automation**: `docs/make-scenarios/02-full-client-journey-automation.md` - Complete client lifecycle setup

### Overview & Reference
- **Full Journey Overview**: `docs/FULL_CLIENT_JOURNEY_AUTOMATION.md` - Complete client lifecycle automation overview
- **Quick Reference**: `docs/QUICK_REFERENCE.md` - This file
- **Debugging Guide**: `docs/DEBUGGING_EMPTY_DRAFTS.md` - Troubleshooting empty drafts
- **Automation Setup**: `docs/MAKE_AUTOMATION_SETUP.md` - Overview of automation
- **Implementation Summary**: `docs/IMPLEMENTATION_SUMMARY.md` - Project overview
- **Template Setup**: `docs/NOTION_TEMPLATES_SETUP.md` - Email template configuration

## Support Scripts

All scripts are in `scripts/` directory:
- `test-email-api.ts` - Test API endpoints
- `get-template-ids.ts` - Fetch template page IDs
- `create-email-template-pages.ts` - Create initial templates
- `setup-notion-email-templates.ts` - Setup Email Templates database
- `update-leads-database-schema.ts` - Add required fields to Leads DB

## Make.com Scenario Info

- **Scenario Name**: Notion Lead Status → Gmail Draft Automation
- **Scenario ID**: `4205086`
- **Team ID**: `875233`
- **Organization**: Zynra Studio
- **Plan**: Free (1000 operations/month)
- **Scheduling**: Every 15 minutes

## Next Steps After Setup

1. Delete the blank Welcome Email template from Notion
2. Test the scenario with a test lead
3. Verify Gmail drafts are created with content
4. Check Notion records are updated
5. Monitor Make.com execution history
