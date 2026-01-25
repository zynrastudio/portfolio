# Troubleshooting: Webhook Not Capturing Status Changes

If your Make.com scenario is enabled but not capturing status changes from Notion, follow these steps to diagnose and fix the issue.

## Quick Diagnostic Checklist

### Step 1: Verify Cron Job is Running

The polling service must be called regularly (every 10-30 seconds) to detect changes.

**Check cron-job.org:**
1. Log into [cron-job.org](https://cron-job.org)
2. Find your cron job for `https://zynra.studio/api/poll/notion`
3. Check:
   - ✅ Is it **Active/Enabled**?
   - ✅ What's the **schedule**? (should be every 10-30 seconds)
   - ✅ Check **Execution history** - are there recent successful calls?
   - ✅ Any **error messages**?

**Test manually:**

**Using Browser:**
Simply visit: `https://zynra.studio/api/poll/notion`

**Using PowerShell:**
```powershell
Invoke-RestMethod -Uri https://zynra.studio/api/poll/notion
```

**Using curl (if installed):**
```bash
curl https://zynra.studio/api/poll/notion
```

Expected response:
```json
{
  "success": true,
  "timestamp": "2026-01-25T...",
  "checked": 7,
  "changes": 0,
  "message": "No status changes detected"
}
```

If you get an error, the polling service has an issue.

---

### Step 2: Verify Environment Variables

The polling service needs these environment variables set in **Vercel**:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Verify these are set:**
   - ✅ `NOTION_API_KEY` - Your Notion integration API key
   - ✅ `NOTION_LEADS_DATABASE_ID` - Your database ID (from `.env`: `91ba6dd0506a49e4b7f7706db990d872`)
   - ✅ `MAKE_WEBHOOK_URL` - Your Make.com webhook URL (from `.env`: `https://hook.eu1.make.com/...`)
   - ⚠️ `MAKE_WEBHOOK_API_KEY` - Only if you enabled API key authentication in Make.com

3. **Important**: After adding/updating environment variables:
   - **Redeploy your application** in Vercel
   - Environment variables are only loaded on deployment

---

### Step 3: Test Polling Service Directly

**Test the polling endpoint:**
```bash
curl https://zynra.studio/api/poll/notion
```

**Check the response:**
- If `"success": true` → Polling service is working
- If `"changes": 1` or more → It detected a change and should have forwarded to Make.com
- If `"error"` → Check the error message

**Test health check:**
```bash
curl -X POST https://zynra.studio/api/poll/notion
```

This returns diagnostics about environment variables and client initialization.

---

### Step 4: Check Polling Service Logic

The polling service only detects **status changes**, not current status. Here's how it works:

1. **First time seeing a page**: 
   - `previousStatus = null`
   - `currentStatus = "Qualified"` (for example)
   - ✅ **Will trigger** (null → "Qualified" is a change)

2. **Status changes**:
   - `previousStatus = "Qualified"`
   - `currentStatus = "Contract Signed"`
   - ✅ **Will trigger** (status changed)

3. **No change**:
   - `previousStatus = "Qualified"`
   - `currentStatus = "Qualified"`
   - ❌ **Won't trigger** (no change detected)

**Important**: If you changed a status **before** setting up the polling service, the service might have already "seen" that status and won't detect it as a change.

**Solution**: Make a **new status change** to test:
1. Change a lead's status to something else (e.g., "Qualified" → "Unqualified")
2. Wait 10-30 seconds
3. Change it back (e.g., "Unqualified" → "Qualified")
4. This should trigger the webhook

---

### Step 5: Verify Make.com Webhook is Receiving Data

**In Make.com:**
1. **Open your scenario**
2. **Check execution history**:
   - Look for any executions (even failed ones)
   - Click on an execution to see the data bundle
3. **Check webhook module**:
   - Does it show "Waiting for data" or does it have data?
   - If it has data, the webhook is receiving payloads

**Test webhook manually:**

**Using PowerShell:**
```powershell
$body = @{
    id = "test-page-id"
    database_id = "91ba6dd0506a49e4b7f7706db990d872"
    status = "Qualified"
    url = "https://notion.so/test"
    triggered_at = "2026-01-25T12:00:00.000Z"
    properties = @{}
} | ConvertTo-Json

Invoke-RestMethod -Uri https://hook.eu1.make.com/pdeb0nh0r9hzve2cscxsdzmwqf76p3sa `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Using curl (if installed):**
```bash
curl -X POST https://hook.eu1.make.com/pdeb0nh0r9hzve2cscxsdzmwqf76p3sa \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-page-id",
    "database_id": "91ba6dd0506a49e4b7f7706db990d872",
    "status": "Qualified",
    "url": "https://notion.so/test",
    "triggered_at": "2026-01-25T12:00:00.000Z",
    "properties": {}
  }'
```

**In Make.com**, check if this test payload appears in the webhook module.

---

### Step 6: Check Vercel Function Logs

The polling service logs important information:

1. **Go to Vercel Dashboard** → Your Project → Functions → `/api/poll/notion`
2. **Check recent invocations**:
   - Look for `✅ Successfully forwarded ... to Make.com`
   - Look for `❌ Make.com webhook failed` errors
   - Look for `📊 Status changed for ...` messages

**Common log messages:**
- `✅ Successfully forwarded ... to Make.com` → Webhook was sent successfully
- `❌ Make.com webhook failed` → Webhook call failed (check error message)
- `❌ Failed to process change for ...` → Error processing a specific page

---

### Step 7: Verify Status Property Name

The polling service looks for a property called **"Status"** (case-sensitive).

**In Notion:**
1. Open your Leads database
2. Check the status property name:
   - ✅ Should be exactly: **"Status"** (capital S, lowercase rest)
   - ❌ Not "status" or "STATUS" or "Lead Status"

**If your property has a different name:**
- Update the polling service code to use the correct property name
- Or rename the property in Notion to "Status"

---

### Step 8: Check Database Permissions

The Notion integration needs access to your database:

1. **In Notion**, open your Leads database
2. **Click the "..." menu** → "Connections"
3. **Verify your integration** (the one with the API key) is connected
4. **If not connected**: Click "Add connections" and add your integration

---

## Common Issues & Solutions

### Issue: Cron job not running
**Symptoms**: No executions in cron-job.org history
**Solutions**:
- Verify cron job is **Active/Enabled**
- Check schedule is correct (every 10-30 seconds)
- Verify URL is correct: `https://zynra.studio/api/poll/notion`
- Check cron-job.org account limits (free tier has limits)

### Issue: Environment variables not set
**Symptoms**: Polling service returns errors about missing config
**Solutions**:
- Add environment variables in Vercel Dashboard
- **Redeploy** after adding variables
- Verify variable names match exactly (case-sensitive)

### Issue: Status change not detected
**Symptoms**: Polling service runs but `"changes": 0`
**Solutions**:
- Make a **new status change** (change to different status, then back)
- The service only detects changes, not current state
- Check status property name is exactly "Status"

### Issue: Webhook not receiving data
**Symptoms**: Polling service logs show success, but Make.com shows no data
**Solutions**:
- Verify `MAKE_WEBHOOK_URL` is correct in Vercel
- Check if webhook requires API key authentication
- Test webhook manually with PowerShell (see Step 5 above)
- Check Make.com webhook is active (not paused)

### Issue: Make.com webhook fails
**Symptoms**: Polling service logs show `❌ Make.com webhook failed`
**Solutions**:
- Check webhook URL is correct
- If using API key, verify `MAKE_WEBHOOK_API_KEY` is set
- Check Make.com webhook is not paused/disabled
- Verify webhook URL is accessible (not blocked by firewall)

---

## Step-by-Step Debugging Process

1. **Test polling endpoint manually**:
   ```powershell
   Invoke-RestMethod -Uri https://zynra.studio/api/poll/notion
   ```
   - If error → Fix environment variables or deployment
   - If success → Continue to step 2

2. **Check cron job is running**:
   - Verify in cron-job.org
   - Check execution history
   - If not running → Fix cron job configuration

3. **Make a test status change**:
   - Change a lead status in Notion
   - Wait 30 seconds
   - Check polling endpoint response:
     ```powershell
     Invoke-RestMethod -Uri https://zynra.studio/api/poll/notion
     ```
   - Should show `"changes": 1` or more

4. **Check Vercel logs**:
   - Look for `✅ Successfully forwarded` messages
   - If errors → Fix webhook URL or API key

5. **Check Make.com**:
   - Verify scenario is **ON** (not paused)
   - Check execution history for new executions
   - If no executions → Webhook not receiving data
   - If executions but empty → Data structure issue

---

## Quick Test Procedure

Run this complete test:

1. **Change a lead status** in Notion (e.g., "Qualified" → "Discovery Completed")
2. **Wait 30 seconds** for cron job to run
3. **Check polling service**:
   ```powershell
   Invoke-RestMethod -Uri https://zynra.studio/api/poll/notion
   ```
   - Should show `"changes": 1`
4. **Check Vercel logs** for `✅ Successfully forwarded` message
5. **Check Make.com execution history** for new execution
6. **Verify data in webhook bundle** - should see `id`, `status`, `properties`

If all steps pass, the system is working! If any step fails, use the troubleshooting guide above.

---

## Still Not Working?

If you've tried all the above:

1. **Check Vercel function logs** for detailed error messages
2. **Test webhook manually** with PowerShell (see Step 5 above) to isolate the issue
3. **Verify all environment variables** are set correctly
4. **Check Make.com webhook** is active and data structure is configured
5. **Make a fresh status change** (not one that existed before setup)

---

## Related Documentation

- [Make Webhook Data Structure Guide](MAKE_WEBHOOK_DATA_STRUCTURE_GUIDE.md)
- [Cron Setup Guide](CRON_SETUP_GUIDE.md)
- [Make Scenario Setup Guide](MAKE_SCENARIO_SETUP_GUIDE.md)
