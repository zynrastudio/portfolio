# Notion Webhook Setup Guide

This guide explains how to set up instant webhooks for Notion database changes using our custom webhook receiver and Make.com's instant webhook trigger.

## Architecture Overview

```
Notion Database Status Change
    ↓
Make.com Instant Webhook Trigger (listens for changes)
    ↓
Unified Automation Scenario (single scenario with 7 routes)
    ├─→ Route 1: Qualified → Welcome Email Draft
    ├─→ Route 2: Unqualified → Rejection Email Draft
    ├─→ Route 3: Discovery Completed → Generate Contract
    ├─→ Route 4: Contract Signed → Slack + Linear Setup
    ├─→ Route 5: Deposit Paid → Activate Project
    ├─→ Route 6: Review → Post Instructions
    └─→ Route 7: Project Completion → Final Handover
```

## Why This Approach?

**Make.com's "Watch Database Items" has limitations:**
- ⏰ Polls every 5-15 minutes (slow)
- ❌ Can miss rapid changes
- 💰 Uses operations even when no changes

**Make.com's "Instant" Webhook Trigger (New) is better:**
- ⚡ Triggers instantly (< 1 second)
- ✅ Never misses changes
- 💰 Only uses operations when changes occur
- 🎯 More reliable than polling

## Implementation Options

### Option 1: Make.com Instant Trigger (RECOMMENDED)

Make.com now supports instant triggers for Notion databases through their "Watch Database Items" module with instant trigger mode.

**Pros:**
- ✅ Built-in to Make.com
- ✅ No custom code needed
- ✅ Instant notifications
- ✅ Officially supported

**Setup Steps:**

1. **In Make.com, create a new scenario**
2. **Add the Notion "Watch Database Items" module**
   - Connection: Your Notion connection
   - Choose: "Watch Database Items (instant)"
   - Database: Select your Leads database
   - This creates a webhook URL that Make.com registers with Notion
3. **Make.com automatically sets up the webhook with Notion**
4. **Continue building your unified scenario** (see Step-by-Step Setup below)

### Option 2: Custom Webhook Receiver (ADVANCED)

If you need more control or custom logic before triggering Make.com:

1. **Deploy this portfolio app** (includes webhook receiver at `/api/webhooks/notion`)
2. **Set up a polling service** to check for changes (every 5 seconds)
3. **Forward changes to Make.com** webhook URL

**Note:** This option is more complex and only needed if you require custom pre-processing.

## Step-by-Step: Unified Make.com Scenario Setup

### Prerequisites

1. **Notion Integration** must have access to:
   - Leads Database
   - Email Templates Database
   
2. **Environment Variables** configured:
   ```bash
   NOTION_API_KEY=
   NOTION_LEADS_DATABASE_ID=91ba6dd0506a49e4b7f7706db990d872
   NOTION_EMAIL_TEMPLATES_DATABASE_ID=b98e9d2eeeb44444bf58a71f62f95f3b
   ```

3. **API Endpoints** deployed and working:
   - `https://zynra.studio/api/generate-welcome-email`
   - `https://zynra.studio/api/generate-rejection-email`
   - `https://zynra.studio/api/generate-contract`

### Module Structure

```
Module 1: Notion Watch Database Items (Instant)
    ↓
Module 2: Router (7 Routes - based on Status)
    ├─→ Route 1: Status = "Qualified"
    │   ├─→ HTTP: Generate Welcome Email
    │   ├─→ Email: Create Gmail Draft
    │   └─→ Notion: Update Record (Email Draft Created)
    │
    ├─→ Route 2: Status = "Unqualified"
    │   ├─→ HTTP: Generate Rejection Email
    │   ├─→ Email: Create Gmail Draft
    │   └─→ Notion: Update Record (Email Draft Created)
    │
    ├─→ Route 3: Status = "Discovery Completed"
    │   ├─→ HTTP: Generate Contract
    │   └─→ Notion: Update Record (Contract URL)
    │
    ├─→ Route 4: Status = "Contract Signed"
    │   ├─→ Slack: Create Channel
    │   ├─→ Slack: Invite Users
    │   ├─→ Slack: Post Welcome Message
    │   ├─→ Linear: Create Project (GraphQL)
    │   ├─→ Linear: Create Issues (6 issues)
    │   └─→ Notion: Update Record (Slack URL, Linear URL, Linear Project ID)
    │
    ├─→ Route 5: Status = "Deposit Paid"
    │   ├─→ Linear: Update Project (GraphQL - Active)
    │   ├─→ Slack: Post Deposit Message
    │   └─→ Notion: Update Record (Status: In Progress)
    │
    ├─→ Route 6: Status = "Review"
    │   ├─→ Slack: Post Review Instructions
    │   └─→ Linear: Update Issues (GraphQL - Review)
    │
    └─→ Route 7: Status = "Project Completion"
        ├─→ Slack: Post Handover Message
        └─→ Notion: Update Record (Archive)
```

### Step 1: Create New Unified Scenario

1. In Make.com, click **"Create a new scenario"**
2. Name: **"Unified Client Journey Automation"**
3. Description: **"Single scenario handling all lead status changes from Qualified through Project Completion, with instant Notion webhook trigger"**

### Step 2: Module 1 - Notion Instant Trigger

1. **Add Module**: Click "+"
2. **Search**: "Notion"
3. **Select**: **"Watch Database Items"**
4. **Important**: Look for the option to enable "Instant" mode
   - This may be labeled as "Instant trigger", "Use webhook", or similar
   - If not visible, ensure you have the latest Make.com Notion integration
5. **Configure**:
   - **Connection**: Your Notion connection
   - **Database**: Select your Leads database (or enter Data Source ID: `ce12e087-e701-4902-ae70-8ff582981d1b`)
   - **Trigger mode**: Select "Instant" or "Webhook" (NOT polling)
   - **Limit**: 1 (we process one change at a time)

**What Happens:**
- Make.com generates a webhook URL
- Make.com automatically registers this webhook with Notion
- When any lead status changes, Notion instantly notifies Make.com
- Your scenario runs immediately (< 1 second delay)

### Step 3: Module 2 - Router (7 Routes)

1. **Add Module**: Click "+" after Module 1
2. **Search**: "Router"
3. **Select**: "Router" (Flow Control)
4. **Configure 7 Routes** (see below)

#### Route 1: Qualified → Welcome Email

**Filter:**
- Label: `Qualified → Welcome Email`
- Condition: `1. Properties Value: Status` → `Equal to` → `Qualified`

**Modules:**
1. **HTTP**: Generate Welcome Email
   - Method: POST
   - URL: `https://zynra.studio/api/generate-welcome-email`
   - Headers: `Content-Type: application/json`
   - Body: (see Gmail Draft Automation guide)
2. **Email**: Create Gmail Draft
3. **Notion**: Update Record (Email Draft Created = true)

#### Route 2: Unqualified → Rejection Email

**Filter:**
- Label: `Unqualified → Rejection Email`
- Condition: `1. Properties Value: Status` → `Equal to` → `Unqualified`

**Modules:**
1. **HTTP**: Generate Rejection Email
2. **Email**: Create Gmail Draft
3. **Notion**: Update Record (Email Draft Created = true)

#### Route 3: Discovery Completed → Generate Contract

**Filter:**
- Label: `Discovery Completed → Generate Contract`
- Condition: `1. Properties Value: Status` → `Equal to` → `Discovery Completed`

**Modules:**
1. **HTTP**: Generate Contract
   - Method: POST
   - URL: `https://zynra.studio/api/generate-contract`
   - Body: (see Full Client Journey guide)
2. **Notion**: Update Record (Contract URL)

#### Route 4: Contract Signed → Slack + Linear

**Filter:**
- Label: `Contract Signed → Slack + Linear`
- Condition: `1. Properties Value: Status` → `Equal to` → `Contract Signed`

**Modules:**
1. **Slack**: Create Channel
2. **Slack**: Invite Users
3. **Slack**: Post Welcome Message
4. **Linear**: Create Project (GraphQL)
5. **Linear**: Create Issues (6 issues)
6. **Notion**: Update Record (Slack URL, Linear URL, Linear Project ID)

#### Route 5: Deposit Paid → Activate Project

**Filter:**
- Label: `Deposit Paid → Activate Project`
- Condition: `1. Properties Value: Status` → `Equal to` → `Deposit Paid`

**Modules:**
1. **Linear**: Update Project (GraphQL - state: "started")
2. **Slack**: Post Deposit Message
3. **Notion**: Update Record (Status: "In Progress")

#### Route 6: Review → Instructions

**Filter:**
- Label: `Review → Post Instructions`
- Condition: `1. Properties Value: Status` → `Equal to` → `Review`

**Modules:**
1. **Slack**: Post Review Instructions
2. **Linear**: Update Issues (GraphQL - state: review)

#### Route 7: Project Completion → Handover

**Filter:**
- Label: `Project Completion → Final Handover`
- Condition: `1. Properties Value: Status` → `Equal to` → `Project Completion`

**Modules:**
1. **Slack**: Post Handover Message
2. **Notion**: Update Record (Archive/Complete)

### Step 4: Test Each Route

**Testing Strategy:**

1. **Test Route 3 first** (Discovery Completed) - simplest
2. **Then Route 1 & 2** (Qualified/Unqualified)
3. **Then Route 4** (Contract Signed) - most complex
4. **Finally Routes 5, 6, 7**

**How to Test:**

1. Turn ON the scenario in Make.com
2. In Notion, change a lead's status to the test status
3. Check Make.com execution history (should appear within 1-2 seconds)
4. Verify all modules ran successfully
5. Check Notion for updated fields

### Step 5: Disable Old Scenarios

Once the unified scenario is working:

1. **Disable** the old "Gmail Draft Automation" scenario
2. **Disable** the old "Full Client Journey Automation" scenario (if separate)
3. **Archive** or delete the old scenarios
4. **Update documentation** to reference the new unified scenario

## Environment Variables

Add to your `.env.local`:

```bash
# Existing
NOTION_API_KEY=your_notion_api_key
NOTION_LEADS_DATABASE_ID=91ba6dd0506a49e4b7f7706db990d872
NOTION_EMAIL_TEMPLATES_DATABASE_ID=b98e9d2eeeb44444bf58a71f62f95f3b

# New (Optional - only if using custom webhook receiver)
MAKE_WEBHOOK_URL=your_make_webhook_url
NOTION_WEBHOOK_SECRET=random_secret_string_for_security

# Slack (for Routes 4, 5, 6, 7)
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_TEAM_ID=your_slack_team_id

# Linear (for Routes 4, 5, 6)
LINEAR_API_KEY=your_linear_api_key
LINEAR_TEAM_ID=your_linear_team_id
```

## Troubleshooting

### Webhook Not Triggering

**Symptoms**: Status changes but Make.com doesn't run

**Check:**
1. ✅ Make.com scenario is **ON** (not off)
2. ✅ Notion integration has access to Leads database
3. ✅ "Instant" mode is enabled in the Watch module
4. ✅ Make.com webhook is registered with Notion (check Make.com logs)

**Fix:**
- Re-save the Watch Database Items module in Make.com
- This re-registers the webhook with Notion

### Multiple Scenarios Triggering

**Symptoms**: Old scenario and new scenario both run

**Fix:**
- Turn OFF the old scenarios
- Only keep the unified scenario ON

### Delayed Triggers (> 5 seconds)

**Symptoms**: Webhook triggers but with delay

**Check:**
- Ensure "Instant" mode is enabled (not polling)
- Check Make.com execution history for queue delays
- Verify no rate limiting on Make.com account

### Specific Route Not Working

**Symptoms**: Scenario runs but skips certain routes

**Check:**
1. ✅ Router filter condition matches exactly
2. ✅ Status value spelling/capitalization matches Notion
3. ✅ All modules in route are configured correctly

**Debug:**
- Check Make.com execution history
- Look at the router output to see which routes were evaluated
- Verify the Status property value from Module 1

## Benefits of Unified Scenario

✅ **Instant Triggers**: No more 5-15 minute delays
✅ **Single Source of Truth**: All automation in one place
✅ **Lower Costs**: Fewer operations, no duplicate polling
✅ **Easier Maintenance**: Update one scenario, not multiple
✅ **Better Reliability**: No race conditions between scenarios
✅ **Clearer Monitoring**: One execution history to review

## Monitoring & Maintenance

### Daily Checks
- Review Make.com execution history
- Check for any failed routes
- Verify Notion fields are being updated

### Weekly Checks
- Review operation usage (should be lower than before)
- Test one route end-to-end
- Check for any stuck or incomplete automations

### Monthly Checks
- Review all routes for improvements
- Update templates as needed
- Audit Notion database for data quality

## Related Documentation

- [Gmail Draft Automation Guide](make-scenarios/01-gmail-draft-automation.md) - Module configurations for Routes 1-2
- [Full Client Journey Automation Guide](make-scenarios/02-full-client-journey-automation.md) - Module configurations for Routes 3-7
- [Quick Reference Guide](QUICK_REFERENCE.md) - Property mappings and common patterns

## Next Steps

After setting up the unified scenario:

1. ✅ Test each route independently
2. ✅ Verify instant trigger performance (< 1 second)
3. ✅ Disable old polling scenarios
4. ✅ Monitor for 24 hours to ensure stability
5. ✅ Document any custom modifications
6. ✅ Train team on new workflow

## Support

For issues:
1. Check Make.com execution history
2. Review Notion database for missing fields
3. Verify webhook registration in Make.com
4. Consult this guide for troubleshooting steps
