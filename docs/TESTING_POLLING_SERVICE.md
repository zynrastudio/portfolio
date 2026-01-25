# Testing the Polling Service

## Quick Test Commands

### Using Browser
Simply visit: `https://zynra.studio/api/poll/notion`

### Using PowerShell
```powershell
# Use Invoke-WebRequest instead of curl
Invoke-WebRequest -Uri https://zynra.studio/api/poll/notion -UseBasicParsing | Select-Object -ExpandProperty Content

# Or use Invoke-RestMethod for JSON parsing
Invoke-RestMethod -Uri https://zynra.studio/api/poll/notion
```

### Using curl (if installed separately)
```bash
curl https://zynra.studio/api/poll/notion
```

## Expected Response

**When no changes detected:**
```json
{
  "success": true,
  "timestamp": "2026-01-25T07:37:47.094Z",
  "checked": 7,
  "changes": 0,
  "changes_detail": [],
  "message": "No status changes detected"
}
```

**When changes are detected:**
```json
{
  "success": true,
  "timestamp": "2026-01-25T07:37:47.094Z",
  "checked": 7,
  "changes": 1,
  "changes_detail": [
    {
      "pageId": "2ee13f3a-e6f3-8175-b106-fd7021242ee4",
      "oldStatus": "Qualified",
      "newStatus": "Contract Signed"
    }
  ],
  "message": "Found 1 status change(s)"
}
```

## Testing Status Change Detection

1. **Make a status change in Notion**:
   - Open your Leads database
   - Change a lead's status (e.g., "Qualified" → "Discovery Completed")
   - Save the change

2. **Wait 30 seconds** for the cron job to run

3. **Check the polling service**:
   - Visit: `https://zynra.studio/api/poll/notion`
   - Should show `"changes": 1` or more

4. **Check Vercel logs**:
   - Look for: `✅ Successfully forwarded ... to Make.com`
   - Or: `📊 Status changed for ...`

5. **Check Make.com**:
   - Open your scenario
   - Check execution history
   - Should see a new execution with data

## Health Check Endpoint

Test the diagnostic endpoint:
```powershell
Invoke-RestMethod -Uri https://zynra.studio/api/poll/notion -Method POST
```

This returns:
```json
{
  "status": "healthy",
  "message": "Notion polling service is running",
  "timestamp": "2026-01-25T07:37:47.094Z",
  "diagnostics": {
    "hasApiKey": true,
    "hasDatabaseId": true,
    "hasWebhookUrl": true,
    "clientInitialized": true,
    "clientError": null
  }
}
```

## Troubleshooting

### If "changes": 0 but you made a change
- **Wait longer** - Cron job may not have run yet (runs every 10-30 seconds)
- **Make a different change** - Change to a different status, then back
- **Check status property name** - Must be exactly "Status" (case-sensitive)

### If service returns error
- Check environment variables in Vercel
- Verify database ID is correct
- Check Notion API key permissions
- Review Vercel function logs
