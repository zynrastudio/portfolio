# Webhook Quick Start Guide

Get your unified Make.com scenario with instant Notion webhooks up and running in 30 minutes.

## Overview

You're replacing **two polling scenarios** with **one instant webhook scenario**:

**OLD (Slow & Inefficient):**
- Scenario 1: Polls every 5-15 minutes for Qualified/Unqualified
- Scenario 2: Polls every 5-15 minutes for Discovery Completed → Project Completion
- Total: 2 scenarios, slow triggers, higher costs

**NEW (Fast & Reliable):**
- Single unified scenario with instant webhook trigger
- Triggers in < 1 second when status changes
- 7 routes handling all status transitions
- Lower operation costs, no missed triggers

## Prerequisites (5 minutes)

### 1. Verify API Endpoints Are Working

Open terminal and test each endpoint:

```bash
# Test contract generation
curl -X POST https://zynra.studio/api/generate-contract \
  -H "Content-Type: application/json" \
  -d '{"leadData":{"clientName":"Test","companyName":"Test Co","projectName":"Test Project","scopeSummary":"Test scope","fee":5000,"paymentTerms":"50/50","startDate":"2026-02-01"}}'

# Test welcome email
curl -X POST https://zynra.studio/api/generate-welcome-email \
  -H "Content-Type: application/json" \
  -d '{"templatePageId":"2ee13f3ae6f38117b3eef77f98ce06c2","leadData":{"name":"Test","email":"test@test.com","service":"Web Development","company":"Test Co","budgetRange":"10k to 25k","timeline":"1-3 months","message":"Test message","schedulingLink":"https://cal.com/zynra.studio"}}'

# Test rejection email
curl -X POST https://zynra.studio/api/generate-rejection-email \
  -H "Content-Type: application/json" \
  -d '{"templatePageId":"2ee13f3ae6f381cca68ae4b059d8eda5","leadData":{"name":"Test","email":"test@test.com","rejectionReason":"Budget constraints"}}'
```

All should return `{"success":true,...}`. If any fail, fix them first.

### 2. Verify Notion Access

- [ ] Notion integration has access to **Leads Database** (91ba6dd0506a49e4b7f7706db990d872)
- [ ] Notion integration has access to **Email Templates Database** (b98e9d2eeeb44444bf58a71f62f95f3b)
- [ ] Welcome Email Template exists (2ee13f3ae6f38117b3eef77f98ce06c2)
- [ ] Rejection Email Template exists (2ee13f3ae6f381cca68ae4b059d8eda5)

### 3. Gather Connection Info

Have ready:
- [ ] Notion connection in Make.com
- [ ] Google Email connection in Make.com
- [ ] Slack connection (with bot token)
- [ ] Linear connection (with API key and team ID)

## Step 1: Create Unified Scenario (5 minutes)

### 1.1 Create Scenario

1. Go to Make.com
2. Click **"Create a new scenario"**
3. **Name**: `Unified Client Journey Automation`
4. **Description**: `Single instant webhook scenario handling all lead status changes`

### 1.2 Add Notion Instant Trigger

1. Click **"+"** to add first module
2. Search for **"Notion"**
3. Select **"Watch Database Items"**
4. **Important**: Look for **"Instant"** or **"Webhook"** mode
   - If you see a toggle for "Instant trigger", turn it **ON**
   - If not, select the module variant that says "instant" or "webhook"
5. Configure:
   - **Connection**: Your Notion connection
   - **Database**: Enter Data Source ID: `ce12e087-e701-4902-ae70-8ff582981d1b`
   - **Trigger Mode**: Instant/Webhook (NOT polling)
   - **Limit**: 1

**What happens**: Make.com creates a webhook URL and registers it with Notion automatically.

### 1.3 Add Router

1. Click **"+"** after Module 1
2. Search for **"Router"**
3. Select **"Router"** (Flow Control)
4. You'll now add 7 routes (next step)

## Step 2: Configure Routes (15 minutes)

### Route 1: Qualified → Welcome Email

**Filter:**
- Click the first route path
- **Label**: `Qualified → Welcome Email`
- **Condition**: `1. Properties Value: Status` = `Qualified`
- **Fallback**: No

**Modules:**

1. **HTTP - Generate Welcome Email**
   - Add module: HTTP → Make a Request
   - Method: POST
   - URL: `https://zynra.studio/api/generate-welcome-email`
   - Headers: `Content-Type: application/json`
   - Body (copy exactly):
   ```json
   {
     "templatePageId": "2ee13f3ae6f38117b3eef77f98ce06c2",
     "leadData": {
       "name": "{{1.properties_value.Name[1].plain_text}}",
       "email": "{{1.properties_value.Email}}",
       "service": "{{1.properties_value.Service.name}}",
       "company": "{{1.properties_value.Company[1].plain_text}}",
       "budgetRange": "{{1.properties_value.BudgetRange.name}}",
       "timeline": "{{1.properties_value.Timeline.name}}",
       "message": "{{1.properties_value.Message[1].plain_text}}",
       "schedulingLink": "https://cal.com/zynra.studio"
     }
   }
   ```

2. **Email - Create Draft**
   - Add module: Google Email → Create a Draft
   - To: `{{1.properties_value.Email}}`
   - Subject: `{{3.Body.subject}}`
   - Content Type: HTML
   - Content: `{{3.Body.html}}`

3. **Notion - Update Record**
   - Add module: Notion → Update a Data Source Item
   - Data Source ID: `ce12e087-e701-4902-ae70-8ff582981d1b`
   - Page ID: `{{1.id}}`
   - Fields:
     - Email Draft Created: `true` (Checkbox)
     - Draft Email ID: `{{4.id}}` (Text)

### Route 2: Unqualified → Rejection Email

**Filter:**
- **Label**: `Unqualified → Rejection Email`
- **Condition**: `1. Properties Value: Status` = `Unqualified`

**Modules:** (Same structure as Route 1, but with rejection endpoint)

1. **HTTP**: URL = `https://zynra.studio/api/generate-rejection-email`
   - Body:
   ```json
   {
     "templatePageId": "2ee13f3ae6f381cca68ae4b059d8eda5",
     "leadData": {
       "name": "{{1.properties_value.Name[1].plain_text}}",
       "email": "{{1.properties_value.Email}}",
       "rejectionReason": "{{1.properties_value.Rejection Reason[1].plain_text}}"
     }
   }
   ```

2. **Email**: Create Draft (same as Route 1)
3. **Notion**: Update Record (same as Route 1)

### Route 3: Discovery Completed → Generate Contract

**Filter:**
- **Label**: `Discovery Completed → Generate Contract`
- **Condition**: `1. Properties Value: Status` = `Discovery Completed`

**Modules:**

1. **HTTP - Generate Contract**
   - Method: POST
   - URL: `https://zynra.studio/api/generate-contract`
   - Body:
   ```json
   {
     "leadData": {
       "clientName": "{{1.properties_value.Name[1].plain_text}}",
       "companyName": "{{1.properties_value.Company[1].plain_text}}",
       "projectName": "{{1.properties_value.Project Name[1].plain_text}}",
       "scopeSummary": "{{1.properties_value.Scope Summary[1].plain_text}}",
       "fee": {{1.properties_value.Fee}},
       "paymentTerms": "{{1.properties_value.Payment Terms.name}}",
       "startDate": "{{1.properties_value.Start Date}}"
     }
   }
   ```

2. **Notion - Update Record**
   - Page ID: `{{1.id}}`
   - Fields:
     - Contract URL: `{{3.Body.url}}` (URL)

### Route 4: Contract Signed → Slack + Linear

**Filter:**
- **Label**: `Contract Signed → Slack + Linear`
- **Condition**: `1. Properties Value: Status` = `Contract Signed`

**Modules:**

1. **Slack - Create Channel**
   - Channel Name: `{{replace(replace(lower(1.properties_value.Project Name[1].plain_text); " "; "-"); "[^a-z0-9-]"; "")}}`
   - Is Private: No

2. **Slack - Invite Users**
   - Channel: `{{3.id}}`
   - Users: [Your team member IDs]

3. **Slack - Post Welcome Message**
   - Channel: `{{3.id}}`
   - Text: [Load from `templates/slack-welcome-message.md`]

4. **Linear - Create Project**
   - Use: Execute a GraphQL Query
   - Advanced Settings: ON
   - Operation Name: `ProjectCreate`
   - Variables: (see full blueprint)
   - Query: (see full blueprint)

5. **Linear - Create Issues** (6 times for 6 issues)
   - Kickoff & Onboarding
   - Discovery Recap
   - Milestone 1
   - Milestone 2
   - QA & Review
   - Handover

6. **Notion - Update Record**
   - Fields:
     - Slack Channel URL: `{{3.url}}`
     - Linear Project URL: `{{6.data.projectCreate.project.url}}`
     - Linear Project ID: `{{6.data.projectCreate.project.id}}`

### Routes 5-7: Deposit Paid, Review, Project Completion

See the complete blueprint in `UNIFIED_SCENARIO_BLUEPRINT.md` for detailed configuration of these routes.

**Quick Summary:**

**Route 5 (Deposit Paid):**
- Linear: Update project to "started"
- Slack: Post deposit message
- Notion: Update status to "In Progress"

**Route 6 (Review):**
- Slack: Post review instructions
- Linear: Update issues to review state

**Route 7 (Project Completion):**
- Slack: Post handover message
- Notion: Final updates

## Step 3: Test Each Route (5 minutes)

### Testing Order

1. **Test Route 3 first** (simplest):
   - Turn scenario ON
   - In Notion, change a lead status to "Discovery Completed"
   - Should trigger within 1-2 seconds
   - Check Make.com execution history
   - Verify Contract URL added to Notion

2. **Test Route 1** (Qualified):
   - Change status to "Qualified"
   - Check Gmail drafts folder
   - Verify email has subject and content

3. **Test Route 2** (Unqualified):
   - Change status to "Unqualified"
   - Check Gmail drafts folder

4. **Test Route 4** (Contract Signed) - Most complex:
   - Fill all required fields in Notion (Project Name, Fee, etc.)
   - Change status to "Contract Signed"
   - Verify Slack channel created
   - Verify Linear project created
   - Check Notion for URLs

5. **Test Routes 5-7** (remaining routes)

## Step 4: Disable Old Scenarios (2 minutes)

Once all routes work:

1. Go to your old scenarios
2. Turn them **OFF**
3. Archive or delete them
4. Keep only the unified scenario **ON**

## Step 5: Monitor (3 minutes)

### First 24 Hours

- Check Make.com execution history regularly
- Verify all status changes trigger correctly
- Look for any failed modules

### Ongoing

- Review weekly for any issues
- Update templates as needed
- Monitor operation usage (should be lower)

## Troubleshooting

### Webhook Not Triggering

**Symptom**: Status changes but Make.com doesn't run

**Fix:**
1. Ensure scenario is **ON**
2. Re-save Module 1 (Watch Database Items)
3. This re-registers the webhook with Notion

### Route Not Executing

**Symptom**: Scenario runs but skips certain routes

**Fix:**
1. Check router filter condition
2. Verify status spelling/capitalization matches Notion exactly
3. Check Make.com execution history → Router output

### Empty Values in Modules

**Symptom**: Property mappings return empty strings

**Fix:**
1. Ensure using `[1]` for array properties (not `[0]` or `[]`)
2. Add `.plain_text` for rich text properties
3. Add `.name` for select properties
4. No array/modifiers for email, phone, URL properties

### Specific Module Fails

**Fix:**
1. Check Make.com execution history
2. Look at the error message
3. Verify all required fields in Notion are filled
4. Test the API endpoint independently (curl)

## Next Steps

After setup is complete:

- [ ] Document your Linear Team ID
- [ ] Save Slack team member IDs
- [ ] Update templates with your branding
- [ ] Train team on new workflow
- [ ] Set up error notifications in Make.com

## Support Resources

- **Complete Blueprint**: `docs/UNIFIED_SCENARIO_BLUEPRINT.md`
- **Detailed Setup**: `docs/NOTION_WEBHOOK_SETUP.md`
- **Property Mappings**: `docs/QUICK_REFERENCE.md`
- **Troubleshooting**: All scenario guides in `docs/make-scenarios/`

## Success Checklist

- [ ] Unified scenario created and ON
- [ ] All 7 routes configured
- [ ] Each route tested independently
- [ ] Old scenarios disabled
- [ ] Webhook triggers instantly (< 2 seconds)
- [ ] No errors in execution history
- [ ] Team trained on new workflow

Congratulations! You now have instant, reliable automation for your entire client journey. 🎉
