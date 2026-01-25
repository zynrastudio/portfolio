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

## Implementation: Custom Webhook Solution

**IMPORTANT**: Make.com's Notion "Watch Database Items" module does NOT support instant webhooks. It only offers polling-based triggers (Created Time/Updated Time) which have 5-15 minute delays.

We use a **Custom Webhook Solution** for instant triggers:

### Architecture

```
Notion Database (Status Changes)
    ↓
Polling Service (/api/poll/notion) - Runs every 10 seconds
    ↓
Detects Status Changes
    ↓
Forwards to Make.com Custom Webhook
    ↓
Unified Automation Scenario (7 Routes)
```

### Setup Steps

1. **Deploy the Polling Service**
   - The polling endpoint is at `/api/poll/notion`
   - Set up a cron job to call it every 10 seconds (see options below)

2. **Create Make.com Custom Webhook**
   - In Make.com, add "Webhooks > **Custom webhook (INSTANT)**" module
   - ⚠️ Make sure to select **"Custom webhook (INSTANT)"** - the one that "Triggers when webhook receives data"
   - ⚠️ **NOT** "Custom mailhook" or "Webhook response"
   - Copy the generated webhook URL
   - Add it to environment variable: `MAKE_WEBHOOK_URL`

3. **Configure Environment Variables**
   ```bash
   NOTION_API_KEY=your_notion_api_key
   NOTION_LEADS_DATABASE_ID=ce12e087-e701-4902-ae70-8ff582981d1b
   MAKE_WEBHOOK_URL=your_make_webhook_url
   ```

4. **Set Up Polling** (Choose one):

   **Option A: Vercel Cron Jobs** (Minimum 1 minute)
   - ⚠️ **Limitation**: Vercel cron jobs can only run every 1 minute minimum (5-field format, no seconds)
   - Already configured in `vercel.json` to run every 1 minute
   - Status changes may take up to 1 minute to be detected

   **Option B: External Cron Service**
   - Use cron-job.org, EasyCron, or similar
   - Set to call: `https://zynra.studio/api/poll/notion` every 10 seconds

   **Option C: Make.com HTTP Module Loop**
   - Create a separate Make.com scenario
   - Use "Schedule" trigger to run every 10 seconds
   - Add HTTP module to call `/api/poll/notion`

### How It Works

1. Polling service checks Notion database every 10 seconds
2. Compares current status with last known status (stored in memory)
3. When status changes detected:
   - Fetches full page data from Notion
   - Forwards to Make.com webhook URL
   - Updates internal status tracking
4. Make.com receives webhook and triggers automation scenario

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

### Step 2: Module 1 - Custom Webhook Trigger

1. **Add Module**: Click "+"
2. **Search**: "Webhooks"
3. **Select**: **"Custom webhook"**
4. **Configure**:
   - **Method**: POST
   - **Data Structure**: JSON
   - **Copy the webhook URL** - You'll need this for `MAKE_WEBHOOK_URL` environment variable

**What Happens:**
- Make.com generates a unique webhook URL
- Polling service forwards status changes to this URL
- When status changes are detected, webhook triggers immediately (< 1 second delay)
- Your scenario runs with the webhook payload data

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
2. ✅ Polling service is running (check `/api/poll/notion` endpoint)
3. ✅ `MAKE_WEBHOOK_URL` environment variable is set correctly
4. ✅ Cron job is configured and running (check Vercel logs or cron service)
5. ✅ Notion API key has access to Leads database

**Fix:**
- Test polling endpoint: `GET https://zynra.studio/api/poll/notion`
- Check Vercel function logs for polling errors
- Verify `MAKE_WEBHOOK_URL` matches the webhook URL from Make.com
- Ensure cron job is actually calling the endpoint (check cron service logs)

### Multiple Scenarios Triggering

**Symptoms**: Old scenario and new scenario both run

**Fix:**
- Turn OFF the old scenarios
- Only keep the unified scenario ON

### Delayed Triggers (> 5 seconds)

**Symptoms**: Webhook triggers but with delay

**Check:**
- Polling interval should be 10 seconds or less
- Check if cron job is running on schedule
- Verify no rate limiting on Notion API
- Check Make.com execution history for queue delays
- Ensure polling service is detecting changes (check response from `/api/poll/notion`)

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
