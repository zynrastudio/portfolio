# Cron Job Setup Guide

## Vercel Plan Limitations

**Vercel Hobby Plan**: Only supports daily cron jobs (once per day)
- ❌ Cannot run every minute or every 10 seconds
- ✅ Can run once per day (e.g., `0 0 * * *` for midnight)

**Vercel Pro Plan**: Supports all cron job frequencies
- ✅ Can run every minute: `*/1 * * * *`
- ✅ Can run every 10 seconds (using external service recommended)

## Recommended Solution: External Cron Service

Since we need to poll every 10 seconds for instant triggers, use an external cron service.

### Option 1: cron-job.org (Free - Recommended)

1. **Sign up**: Go to https://cron-job.org and create a free account
2. **Create cronjob**:
   - Click "Create cronjob" button
   - **Title**: `Notion Status Polling`
   - **Address (URL)**: `https://zynra.studio/api/poll/notion`
   - **Schedule**: 
     - Select "Every X seconds"
     - Enter `10` (for 10 seconds)
   - **Request method**: `GET`
   - **Timeout**: `30` seconds
   - Click "Create cronjob"

3. **Verify**:
   - The cron job will start immediately
   - Check the "Execution log" to see if it's running successfully
   - You should see successful requests every 10 seconds

**Free tier limits**:
- Up to 2 cron jobs
- Unlimited executions
- Perfect for this use case

### Option 2: EasyCron (Paid)

1. Sign up at https://www.easycron.com
2. Create new cron job
3. URL: `https://zynra.studio/api/poll/notion`
4. Schedule: `*/10 * * * * *` (every 10 seconds)
5. Method: GET

### Option 3: UptimeRobot (Free)

1. Sign up at https://uptimerobot.com
2. Add new monitor
3. Monitor type: HTTP(s)
4. URL: `https://zynra.studio/api/poll/notion`
5. Monitoring interval: 5 minutes (minimum)
   - ⚠️ Note: UptimeRobot minimum is 5 minutes, not ideal for 10-second polling

### Option 4: Make.com HTTP Module Loop

Create a separate Make.com scenario:

1. **Trigger**: Schedule → Every 10 seconds
2. **Module 1**: HTTP → Make a request
   - Method: GET
   - URL: `https://zynra.studio/api/poll/notion`
3. **Save and activate** the scenario

**Pros**: No external service needed
**Cons**: Uses Make.com operations (may have cost implications)

## Testing Your Cron Job

After setting up, test the endpoint manually:

```bash
curl https://zynra.studio/api/poll/notion
```

You should get a JSON response like:
```json
{
  "success": true,
  "timestamp": "2026-01-25T12:00:00.000Z",
  "checked": 20,
  "changes": 0,
  "message": "No status changes detected"
}
```

## Monitoring

- Check cron service logs to ensure it's running
- Monitor Vercel function logs for any errors
- Check Make.com execution history to see if webhooks are being triggered

## Troubleshooting

**Cron job not running**:
- Verify the URL is correct
- Check if the endpoint is accessible (test with curl)
- Review cron service logs

**No status changes detected**:
- Verify `NOTION_API_KEY` and `NOTION_LEADS_DATABASE_ID` are set correctly
- Check Vercel function logs for errors
- Ensure the database has pages with Status property

**Webhook not triggering in Make.com**:
- Verify `MAKE_WEBHOOK_URL` is set correctly
- Check if API key is configured (if you enabled authentication)
- Review Make.com execution history
