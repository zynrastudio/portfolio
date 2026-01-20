# Make.com Email Draft Automation Setup Guide

This guide walks you through setting up the automation that monitors Notion Leads database for status changes and creates Gmail drafts based on email templates.

## Prerequisites

1. **Notion Setup**
   - Leads database created (ID: `91ba6dd0506a49e4b7f7706db990d872`)
   - Email Templates database (to be created)
   - Notion API key configured in Make.com

2. **Make.com Setup**
   - Organization ID: `6335974`
   - Team ID: `875233`
   - Notion connection configured
   - Google Email (Gmail) connection configured

3. **Environment Variables**
   - `NOTION_LEADS_DATABASE_ID=91ba6dd0506a49e4b7f7706db990d872`
   - `NOTION_EMAIL_TEMPLATES_DATABASE_ID=b98e9d2eeeb44444bf58a71f62f95f3b` 

## Step 1: Create Email Templates Database in Notion

### Option A: Using the Setup Script

1. Run the setup script:
   ```bash
   npx tsx scripts/setup-notion-email-templates.ts
   ```

2. You'll need to provide `NOTION_WORKSPACE_PAGE_ID` in your `.env.local`:
   - Open Notion and navigate to the page where you want to create the database
   - Click 'Share' → 'Copy link'
   - Extract the page ID from the URL (the long string between workspace name and page title)
   - Add to `.env.local`: `NOTION_WORKSPACE_PAGE_ID=your-page-id`

### Option B: Manual Creation

1. In Notion, create a new database called "Email Templates"
2. Add the following properties:
   - **Name** (Title) - Template name
   - **Type** (Select) - Options: "Welcome", "Rejection"
   - **Subject** (Rich Text) - Email subject line template
   - **HTML Template** (Rich Text) - HTML email template with placeholders
   - **Plain Text Template** (Rich Text) - Plain text fallback template
   - **Variables** (Rich Text) - Documentation of available variables

3. Create two template entries:
   - **Welcome Email - Qualified Lead**
     - Type: Welcome
     - Subject: `Thanks for reaching out — let's talk about your project`
     - HTML Template: Copy from `lib/email-templates-welcome.ts` (use the HTML structure)
     - Variables: `name, service, company, budgetRange, timeline, message, schedulingLink`
   
   - **Rejection Email - Unqualified Lead**
     - Type: Rejection
     - Subject: `Thank you for your interest - Zynra Studio`
     - HTML Template: Copy from `lib/email-templates-rejection.ts` (use the HTML structure)
     - Variables: `name, reason`

4. Copy the database ID and add to `.env.local`: `NOTION_EMAIL_TEMPLATES_DATABASE_ID=your-database-id`

## Step 2: Update Leads Database Schema

### Option A: Using the Setup Script

1. Run the schema update script:
   ```bash
   npx tsx scripts/update-leads-database-schema.ts
   ```

2. Follow the manual instructions provided by the script

### Option B: Manual Update

1. Open your Leads database in Notion
2. Click the '...' menu → 'Add a property'
3. Add the following properties:

   **Rejection Reason**
   - Type: Text (Rich Text)
   - Description: Manual field for rejection reason (only used when Unqualified)

   **Email Draft Created**
   - Type: Checkbox
   - Description: Track if draft has been created

   **Draft Email ID**
   - Type: Text (Rich Text)
   - Description: Store Gmail draft ID for reference

## Step 3: Create Make.com Scenario

### Scenario Structure

1. **Module 1: Notion Trigger - Watch Database Items**
   - App: Notion
   - Module: Watch Objects (watchDatabasesPages)
   - Database: Leads database ID
   - Filter: Status property equals "Qualified" OR "Unqualified"
   - Trigger: When item is updated

2. **Module 2: Router - Branch by Status**
   - App: Flow Control
   - Module: Router
   - Routes:
     - Route 1: `{{1.Status}} = "Qualified"` → Welcome Email Path
     - Route 2: `{{1.Status}} = "Unqualified"` → Rejection Email Path

### Path A: Qualified Lead (Welcome Email)

3. **Module 3A: Get Welcome Template**
   - App: Notion
   - Module: Search Objects
   - Database: Email Templates database ID
   - Filter: Type = "Welcome"
   - Page Size: 1

4. **Module 4A: Generate Welcome Email HTML**
   - App: Tools
   - Module: Set Variables or Code
   - Action: Replace template variables with lead data
   - Variables to replace:
     - `{name}` → `{{1.Name}}`
     - `{service}` → `{{1.Service}}`
     - `{company}` → `{{1.Company}}` (if available)
     - `{budgetRange}` → `{{1.Budget Range}}` (human-readable)
     - `{timeline}` → `{{1.Timeline}}` (human-readable)
     - `{message}` → `{{1.Message}}` (if available)
     - `{schedulingLink}` → `https://cal.com/zynra-studio` (or your Cal.com link)
   - Use Make.com's Text Parser or Code module to replace variables in the HTML template

5. **Module 5A: Create Gmail Draft**
   - App: Google Email (or Gmail)
   - Module: Create a Draft
   - To: `{{1.Email}}`
   - Subject: Replace variables in `{{3A.Subject}}`
   - Body: `{{4A.emailHtml}}`
   - Format: HTML

### Path B: Unqualified Lead (Rejection Email)

6. **Module 3B: Get Rejection Template**
   - App: Notion
   - Module: Search Objects
   - Database: Email Templates database ID
   - Filter: Type = "Rejection"
   - Page Size: 1

7. **Module 4B: Generate Rejection Email HTML**
   - App: Tools
   - Module: Set Variables or Code
   - Action: Replace template variables with lead data
   - Variables to replace:
     - `{name}` → `{{1.Name}}`
     - `{reason}` → `{{1.Rejection Reason}}` (from Notion field)
   - Use Make.com's Text Parser or Code module to replace variables in the HTML template

8. **Module 5B: Create Gmail Draft**
   - App: Google Email (or Gmail)
   - Module: Create a Draft
   - To: `{{1.Email}}`
   - Subject: Replace variables in `{{3B.Subject}}`
   - Body: `{{4B.emailHtml}}`
   - Format: HTML

### Final Module: Update Notion Record

9. **Module 6: Update Lead Record**
   - App: Notion
   - Module: Update a Data Source Item
   - Database: Leads database ID
   - Item: `{{1.id}}`
   - Properties to update:
     - Email Draft Created: `true`
     - Draft Email ID: `{{5A.id}}` or `{{5B.id}}` (depending on route)

## Step 4: Template Variable Replacement Logic

In Make.com, you'll need to use a Code module or Text Parser to replace template variables. Here's example JavaScript code for the Code module:

```javascript
// For Welcome Email (Module 4A)
const template = bundle.inputData.htmlTemplate; // From Module 3A
const lead = bundle.inputData.lead; // From Module 1

const html = template
  .replace(/{name}/g, lead.Name || '')
  .replace(/{service}/g, lead.Service || '')
  .replace(/{company}/g, lead.Company || '')
  .replace(/{budgetRange}/g, lead['Budget Range'] || '')
  .replace(/{timeline}/g, lead.Timeline || '')
  .replace(/{message}/g, lead.Message || '')
  .replace(/{schedulingLink}/g, 'https://cal.com/zynra-studio');

return { html };

// For Rejection Email (Module 4B)
const template = bundle.inputData.htmlTemplate; // From Module 3B
const lead = bundle.inputData.lead; // From Module 1

const html = template
  .replace(/{name}/g, lead.Name || '')
  .replace(/{reason}/g, lead['Rejection Reason'] || 'We appreciate your understanding.');

return { html };
```

## Step 5: Testing

1. **Test Qualified Status:**
   - Update a lead in Notion to status "Qualified"
   - Verify the scenario triggers
   - Check that a welcome email draft is created in Gmail
   - Verify the Notion record is updated with "Email Draft Created" = true

2. **Test Unqualified Status:**
   - Update a lead in Notion to status "Unqualified"
   - Add a rejection reason in the "Rejection Reason" field
   - Verify the scenario triggers
   - Check that a rejection email draft is created in Gmail
   - Verify the Notion record is updated

3. **Verify Email Design:**
   - Open the Gmail drafts
   - Check that the HTML emails match the acknowledgment email design (dark theme, glassmorphism style)
   - Verify all template variables are replaced correctly

## Error Handling

- If template not found: Log error, skip draft creation
- If Gmail fails: Log error, don't update Notion
- If Notion update fails: Log error but draft is still created
- All errors should be logged but not block the workflow

## Troubleshooting

1. **Scenario not triggering:**
   - Check Notion connection in Make.com
   - Verify database IDs are correct
   - Check filter conditions in the trigger module

2. **Template variables not replacing:**
   - Verify variable names match exactly (case-sensitive)
   - Check that the Code module is correctly accessing bundle data
   - Test variable replacement with sample data

3. **Gmail draft not created:**
   - Verify Google Email connection in Make.com
   - Check that the email format is set to HTML
   - Verify recipient email address is valid

4. **Notion record not updating:**
   - Check property names match exactly
   - Verify the item ID is correct
   - Check Notion API permissions

## Next Steps

After setup is complete:
1. Activate the scenario in Make.com
2. Test with a real lead status change
3. Review and send the Gmail drafts manually
4. Monitor scenario executions for any errors
