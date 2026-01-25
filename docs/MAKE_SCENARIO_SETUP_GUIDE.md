# Make.com Scenario Setup Guide

This guide walks you through setting up the Unified Client Journey Automation scenario in Make.com step-by-step.

## Prerequisites

✅ **Completed:**
- [x] Polling service deployed (`/api/poll/notion`)
- [x] Cron job configured (cron-job.org)
- [x] Module 1: Custom Webhook created
- [x] **Data structure configured** (See [Make Webhook Data Structure Guide](MAKE_WEBHOOK_DATA_STRUCTURE_GUIDE.md))

**⚠️ CRITICAL**: Before proceeding, ensure you've configured the data structure in your Custom Webhook module. Without it, Make.com cannot parse the incoming JSON payload.

## Next Steps

### Step 1: Configure Webhook Data Structure (REQUIRED)

**⚠️ This step is CRITICAL and must be done before building routes.**

If you haven't configured the data structure yet, Make.com cannot parse the incoming JSON payload. See the detailed guide: [Make Webhook Data Structure Guide](MAKE_WEBHOOK_DATA_STRUCTURE_GUIDE.md)

**Quick Setup:**
1. **Open your Custom Webhook module** in Make.com
2. **Click "Advanced settings"**
3. **Click "Data structure"** → "Add data structure"
4. **Add these fields:**
   - `id` (Text, Required)
   - `database_id` (Text, Required)
   - `status` (Text, Required)
   - `url` (Text, Optional)
   - `triggered_at` (Text, Optional)
   - `properties` (Object, Required)
5. **Save the data structure**

### Step 2: Verify Webhook Data Structure

After configuring the data structure, verify it's working:

1. **In Make.com, open your scenario**
2. **Turn ON the scenario** (toggle switch at top)
3. **Trigger a test**: Change a status in Notion (e.g., set a lead to "Qualified")
4. **Wait 10-30 seconds** for the polling service to detect the change
5. **Check execution history**: Click on the execution to see the data structure
6. **Verify data is visible**: You should see `id`, `status`, `properties`, etc. in the bundle
7. **Note the data paths**: Look for how status is accessed:
   - Should be `{{1.status}}` (if data structure is configured correctly)
   - Properties: `{{1.properties.Name[0].plain_text}}`

**If data is empty**: The data structure is not configured correctly. Review [Make Webhook Data Structure Guide](MAKE_WEBHOOK_DATA_STRUCTURE_GUIDE.md)

---

### Step 2: Add Router Module

1. **In your Make.com scenario**, click the "+" button after Module 1 (Custom Webhook)
2. **Search for**: "Router" or "Flow Control"
3. **Select**: "Router" module
4. **Configure**: 
   - **Routes**: 7
   - **Fallback route**: No (optional, but recommended to catch unexpected statuses)

---

### Step 4: Configure Route Filters

For each route, you'll configure a filter condition. The exact syntax depends on your webhook data structure (from Step 1).

#### Route 1: Qualified → Welcome Email

1. **Click on Route 1** in the Router
2. **Set Label**: "Qualified → Welcome Email"
3. **Add Filter**:
   - **Condition**: `1. Status` equals `Qualified` 
   - OR if data is nested: `1. data.status` equals `Qualified`
   - **Case sensitive**: Yes (must match exactly: "Qualified")
4. **Save route**

#### Route 2: Unqualified → Rejection Email

1. **Click on Route 2**
2. **Set Label**: "Unqualified → Rejection Email"
3. **Add Filter**: `1. Status` equals `Unqualified` (or `1. data.status`)
4. **Save route**

#### Route 3: Discovery Completed → Generate Contract

1. **Click on Route 3**
2. **Set Label**: "Discovery Completed → Generate Contract"
3. **Add Filter**: `1. Status` equals `Discovery Completed` (or `1. data.status`)
4. **Save route**

#### Route 4: Contract Signed → Slack + Linear

1. **Click on Route 4**
2. **Set Label**: "Contract Signed → Slack + Linear"
3. **Add Filter**: `1. Status` equals `Contract Signed` (or `1. data.status`)
4. **Save route**

#### Route 5: Deposit Paid → Activate Project

1. **Click on Route 5**
2. **Set Label**: "Deposit Paid → Activate Project"
3. **Add Filter**: `1. Status` equals `Deposit Paid` (or `1. data.status`)
4. **Save route**

#### Route 6: Review → Instructions

1. **Click on Route 6**
2. **Set Label**: "Review → Post Instructions"
3. **Add Filter**: `1. Status` equals `Review` (or `1. data.status`)
4. **Save route**

#### Route 7: Project Completion → Handover

1. **Click on Route 7**
2. **Set Label**: "Project Completion → Final Handover"
3. **Add Filter**: `1. Status` equals `Project Completion` (or `1. data.status`)
4. **Save route**

---

### Step 5: Build Routes (Start with Simplest)

**Recommended order**: Start with Route 3 (simplest), then Route 1, Route 2, then the more complex routes.

#### Route 3: Discovery Completed → Generate Contract

This is the simplest route - just HTTP call + Notion update.

**Module 3C: HTTP - Generate Contract**

1. **In Route 3**, click "+" to add a module
2. **Search for**: "HTTP"
3. **Select**: "Make an HTTP Request"
4. **Configure**:
   - **Method**: POST
   - **URL**: `https://zynra.studio/api/generate-contract`
   - **Headers**:
     - `Content-Type`: `application/json`
   - **Body type**: Raw
   - **Content type**: JSON
   - **Request content**:
   ```json
   {
     "leadData": {
       "clientName": "{{1.properties.Name[0].plain_text}}",
       "companyName": "{{1.properties.Company[0].plain_text}}",
       "projectName": "{{1.properties.Project Name[0].plain_text}}",
       "scopeSummary": "{{1.properties.Scope Summary[0].plain_text}}",
       "fee": {{1.properties.Fee.number}},
       "paymentTerms": "{{1.properties.Payment Terms.select.name}}",
       "startDate": "{{1.properties.Start Date.date.start}}"
     }
   }
   ```
   **Note**: Adjust property paths based on your webhook data structure from Step 1. Use Make.com's data mapper (click the field to see available options).

5. **Save module**

**Module 4C: Notion - Update Record**

1. **After Module 3C**, click "+"
2. **Search for**: "Notion"
3. **Select**: "Update a Data Source Item"
4. **Configure**:
   - **Connection**: [Your Notion connection]
   - **Update By**: Data Source
   - **Data Source ID**: `ce12e087-e701-4902-ae70-8ff582981d1b`
   - **Page ID**: `{{1.id}}` (or `{{1.data.id}}`)
   - **Fields**:
     - **Contract URL**: `{{3.url}}` (from HTTP response)
5. **Save module**

**Test Route 3:**
1. Turn ON scenario
2. Change a lead status to "Discovery Completed" in Notion
3. Wait 10-30 seconds
4. Check execution history - should see Route 3 executed
5. Verify contract URL was added to Notion

---

#### Route 1: Qualified → Welcome Email

**Module 3A: HTTP - Generate Welcome Email**

1. **In Route 1**, add "Make an HTTP Request"
2. **Configure**:
   - **Method**: POST
   - **URL**: `https://zynra.studio/api/generate-welcome-email`
   - **Headers**: `Content-Type: application/json`
   - **Body type**: Raw, JSON
   - **Request content**:
   ```json
   {
     "templatePageId": "2ee13f3ae6f38117b3eef77f98ce06c2",
     "leadData": {
       "name": "{{1.properties.Name[0].plain_text}}",
       "email": "{{1.properties.Email.email}}",
       "service": "{{1.properties.Service.select.name}}",
       "company": "{{1.properties.Company[0].plain_text}}",
       "budgetRange": "{{1.properties.BudgetRange.select.name}}",
       "timeline": "{{1.properties.Timeline.select.name}}",
       "message": "{{1.properties.Message[0].plain_text}}",
       "schedulingLink": "https://cal.com/zynra.studio"
     }
   }
   ```
3. **Save module**

**Module 4A: Email - Create Draft**

1. **Add module**: "Google Gmail - Create a Draft"
2. **Configure**:
   - **Connection**: [Your Gmail connection]
   - **Folder**: `/Drafts`
   - **To**: `{{1.properties.Email.email}}`
   - **Subject**: `{{3.Body.subject}}`
   - **Content type**: HTML
   - **Content**: `{{3.Body.html}}`
3. **Save module**

**Module 5A: Notion - Update Record**

1. **Add module**: "Notion - Update a Data Source Item"
2. **Configure**:
   - **Data Source ID**: `ce12e087-e701-4902-ae70-8ff582981d1b`
   - **Page ID**: `{{1.id}}`
   - **Fields**:
     - **Email Draft Created**: `true` (Checkbox)
     - **Draft Email ID**: `{{4.id}}` (Text)
3. **Save module**

---

#### Route 2: Unqualified → Rejection Email

Similar to Route 1, but uses rejection email template:

**Module 3B: HTTP - Generate Rejection Email**
- **URL**: `https://zynra.studio/api/generate-rejection-email`
- **templatePageId**: `2ee13f3ae6f381cca68ae4b059d8eda5`
- **Body**: Similar to Route 1, but include `rejectionReason` field

**Module 4B & 5B**: Same as Route 1 (Email Draft + Notion Update)

---

### Step 5: Complex Routes (Routes 4-7)

These routes involve Slack and Linear integrations. Set up connections first:

#### Prerequisites for Routes 4-7:
- [ ] Slack bot token configured in Make.com
- [ ] Linear API key configured in Make.com
- [ ] Linear Team ID identified

#### Route 4: Contract Signed → Slack + Linear

This is the most complex route. See `UNIFIED_SCENARIO_BLUEPRINT.md` for full details.

**Key modules:**
1. **Slack - Create Channel**
2. **Slack - Invite Users**
3. **Slack - Post Welcome Message**
4. **Linear - Create Project** (GraphQL)
5. **Linear - Create Issues** (6 issues)
6. **Notion - Update Record**

---

## Testing Checklist

After setting up each route:

- [ ] Route 3: Discovery Completed → Contract generated
- [ ] Route 1: Qualified → Email draft created
- [ ] Route 2: Unqualified → Rejection email draft created
- [ ] Route 4: Contract Signed → Slack channel + Linear project created
- [ ] Route 5: Deposit Paid → Linear project activated
- [ ] Route 6: Review → Instructions posted
- [ ] Route 7: Project Completion → Handover message sent

---

## Troubleshooting

### Filter Not Matching
- **Check spelling**: Status must match exactly (case-sensitive)
- **Verify data path**: Use Make.com's data mapper to find correct path
- **Test with execution**: Run a test execution and check the data structure

### Property Paths Not Working
- **Use data mapper**: Click the field in Make.com to see available options
- **Check array indices**: May be `[0]` instead of `[1]`
- **Verify property names**: Must match Notion property names exactly

### HTTP Errors
- **Check API endpoints**: Verify endpoints are deployed and accessible
- **Verify environment variables**: Ensure all required env vars are set
- **Check logs**: Review Vercel function logs for errors

---

## Next Steps After Setup

1. **Test all routes** with sample data
2. **Monitor execution history** for first few days
3. **Set up error notifications** in Make.com
4. **Document any customizations** you made
5. **Update blueprint** if you changed any configurations

---

## Reference

- **Full Blueprint**: `UNIFIED_SCENARIO_BLUEPRINT.md`
- **Webhook Setup**: `MAKE_WEBHOOK_URL_GUIDE.md`
- **Data Structure Setup**: `MAKE_WEBHOOK_DATA_STRUCTURE_GUIDE.md` ⚠️ **REQUIRED**
- **Cron Setup**: `CRON_SETUP_GUIDE.md`
