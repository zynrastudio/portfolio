# How to Get Your Make.com Webhook URL

## Step-by-Step Instructions

### Step 1: Create the Scenario in Make.com

1. Log in to [Make.com](https://www.make.com)
2. Click **"Create a new scenario"** (or **"Scenarios"** → **"Create a new scenario"**)
3. Name it: **"Unified Client Journey Automation"**

### Step 2: Add Custom Webhook Module

1. Click the **"+"** button to add the first module
2. In the search box, type: **"webhook"** or **"custom webhook"**
3. You'll see 3 options - **Select the correct one**:
   - ✅ **"Custom webhook (INSTANT)"** - **USE THIS ONE** - Triggers when webhook receives data
   - ❌ "Custom mailhook (INSTANT)" - For email/webhooks (NOT this one)
   - ❌ "Webhook response" - For responding to webhooks (NOT this one)
4. Select: **"Webhooks"** → **"Custom webhook (INSTANT)"**

### Step 3: Configure the Webhook

1. Click **"Add a webhook"** button
2. **Webhook name**: Enter a descriptive name (1-128 characters)
   - Suggested name: `Notion Status Change Webhook` or `Unified Client Journey Webhook`
   - This is just for your reference in Make.com

3. **API Key authentication** (Recommended for security):
   - Click **"+ Add API key"** under "API keys"
   - Generate a secure random API key (e.g., use a password generator)
   - **Save this API key** - you'll need it for `MAKE_WEBHOOK_API_KEY` environment variable
   - The API key will be sent using the `x-make-apikey` HTTP header
   - You can add multiple API keys - if any matches, access is granted

4. **Advanced settings**: 
   - **Get request headers**: `No` (default)
   - **Get request HTTP method**: `No` (default)
   - **JSON pass through**: `No` (default - we'll use data structure instead)
   - **Data structure**: ⚠️ **REQUIRED** - See Step 4 below

5. Click **"Save"** to create the webhook

6. **Copy the webhook URL** - it will look something like:
   ```
   https://hook.make.com/xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
7. **Important**: Save both the webhook URL and API key (if you enabled authentication yeah)

### Step 4: Configure Data Structure (REQUIRED)

**⚠️ CRITICAL**: Without configuring the data structure, Make.com cannot parse the incoming JSON payload, and you'll see empty bundles in execution history.

1. **After saving the webhook**, click on the webhook module again
2. **Click "Advanced settings"** to expand
3. **Click "Data structure"** → **"Add data structure"**
4. **Configure the structure**:

   **Data structure name**: `Notion Polling Webhook Data`

   **Option A: Generate from JSON (Easiest!):**
   - Look for **"Generate from JSON"** or similar button
   - Paste the sample JSON from [Make Webhook Data Structure Guide](MAKE_WEBHOOK_DATA_STRUCTURE_GUIDE.md)
   - Click "Generate" - Make.com will create the structure automatically
   
   **Option B: Manual Setup:**
   - Add these fields (as "New item" entries):
     - **`id`**: Type `Text`, Required: `Yes`
     - **`database_id`**: Type `Text`, Required: `Yes`
     - **`status`**: Type `Text`, Required: `Yes`
     - **`url`**: Type `Text`, Required: `No`
     - **`triggered_at`**: Type `Text`, Required: `No`
     - **`properties`**: Type `Collection`, Required: `Yes` ⚠️ (Make.com uses Collection, not Object)

5. **Click "Save"** on the data structure
6. **Click "Save"** on the webhook module again

**📖 For detailed instructions**, see: [Make Webhook Data Structure Guide](MAKE_WEBHOOK_DATA_STRUCTURE_GUIDE.md)

### Step 5: Save the Webhook URL

1. The webhook is now active and ready to receive data
2. Verify the webhook URL is still visible (copy it if needed)

### Step 6: Add to Environment Variables

Add the webhook URL (and API key if enabled) to your `.env` file:

```bash
MAKE_WEBHOOK_URL=https://hook.make.com/your-actual-webhook-url-here
MAKE_WEBHOOK_API_KEY=your-api-key-here  # Only if you enabled API key authentication
```

**For Vercel deployment**, also add both to:
- Vercel Dashboard → Your Project → Settings → Environment Variables
- Add `MAKE_WEBHOOK_URL` with your webhook URL value
- Add `MAKE_WEBHOOK_API_KEY` with your API key value (if enabled)

## Testing the Webhook

After setting up, you can test it:

1. **In Make.com**: The webhook module will show "Waiting for data"
2. **Test manually**: Use curl or Postman to send a test payload:
   
   **Without API key:**
   ```bash
   curl -X POST https://hook.make.com/your-webhook-url \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```
   
   **With API key (if enabled):**
   ```bash
   curl -X POST https://hook.make.com/your-webhook-url \
     -H "Content-Type: application/json" \
     -H "x-make-apikey: your-api-key-here" \
     -d '{"test": "data"}'
   ```
3. **Check Make.com**: You should see the data appear in the webhook module

## Next Steps

After getting the webhook URL and configuring the data structure:

1. ✅ Add webhook URL to `.env` as `MAKE_WEBHOOK_URL`
2. ✅ Add webhook URL to Vercel environment variables
3. ✅ Configure data structure in Make.com (Step 4 above) ⚠️ **REQUIRED**
4. ✅ Deploy your application
5. ✅ Test the webhook by changing a status in Notion
6. ✅ Verify data is captured in Make.com execution history
7. ✅ Add the Router module after the webhook to route by status

## Important Notes

- **Keep the webhook URL secret** - don't commit it to git
- **The webhook is active immediately** after saving the module
- **You can regenerate the URL** if needed (but you'll need to update environment variables)
- **The webhook will show "Waiting for data"** until it receives its first request
