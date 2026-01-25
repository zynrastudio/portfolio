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

4. **Advanced settings**: Leave off for now (default is fine)

5. Click **"Save"** to create the webhook

6. **Copy the webhook URL** - it will look something like:
   ```
   https://hook.make.com/xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
7. **Important**: Save both the webhook URL and API key (if you enabled authentication yeah)

### Step 4: Save the Webhook URL

1. Click **"Save"** on the webhook module
2. The webhook is now active and ready to receive data

### Step 5: Add to Environment Variables

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

After getting the webhook URL:

1. ✅ Add it to `.env` as `MAKE_WEBHOOK_URL`
2. ✅ Add it to Vercel environment variables
3. ✅ Deploy your application
4. ✅ The polling service will start forwarding Notion changes to this webhook
5. ✅ Add the Router module after the webhook to route by status

## Important Notes

- **Keep the webhook URL secret** - don't commit it to git
- **The webhook is active immediately** after saving the module
- **You can regenerate the URL** if needed (but you'll need to update environment variables)
- **The webhook will show "Waiting for data"** until it receives its first request
