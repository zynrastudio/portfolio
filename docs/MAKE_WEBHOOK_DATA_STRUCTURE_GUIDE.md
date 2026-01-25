# Make.com Webhook Data Structure Setup Guide

This guide explains how to configure the data structure for your Custom Webhook module in Make.com so it can properly parse the JSON payload from the polling service.

## Why Data Structure is Required

Without defining the data structure, Make.com cannot parse the incoming JSON payload, resulting in:
- ❌ Empty bundles in execution history
- ❌ No data accessible in subsequent modules
- ❌ Routes not triggering properly

## Option 1: Generate from JSON (Recommended - Easiest!)

Make.com can automatically generate the data structure from a JSON sample. This is the easiest method!

### Step-by-Step Setup with JSON Generation

1. **Open your Custom Webhook module** in Make.com
2. **Click "Advanced settings"** to expand
3. **Click "Data structure"** → "Add data structure"
4. **Look for "Generate from JSON" or similar option** (usually a button or tab)
5. **Paste this sample JSON payload:**

```json
{
  "id": "2ee13f3a-e6f3-8175-b106-fd7021242ee4",
  "database_id": "ce12e087-e701-4902-ae70-8ff582981d1b",
  "status": "Qualified",
  "url": "https://notion.so/2ee13f3ae6f38175b106fd7021242ee4",
  "triggered_at": "2026-01-25T12:00:00.000Z",
  "properties": {
    "Name": {
      "id": "title",
      "type": "title",
      "title": [
        {
          "type": "text",
          "text": {
            "content": "John Doe"
          },
          "plain_text": "John Doe"
        }
      ]
    },
    "Email": {
      "id": "email",
      "type": "email",
      "email": "john@example.com"
    },
    "Status": {
      "id": "status",
      "type": "select",
      "select": {
        "id": "option-id",
        "name": "Qualified",
        "color": "blue"
      }
    },
    "Company": {
      "id": "company",
      "type": "rich_text",
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "Acme Corp"
          },
          "plain_text": "Acme Corp"
        }
      ]
    },
    "Service": {
      "id": "service",
      "type": "select",
      "select": {
        "name": "Web Development"
      }
    },
    "Fee": {
      "id": "fee",
      "type": "number",
      "number": 5000
    },
    "Start Date": {
      "id": "start-date",
      "type": "date",
      "date": {
        "start": "2026-02-01"
      }
    }
  }
}
```

6. **Click "Generate" or "Create"** - Make.com will automatically create the data structure
7. **Review the generated structure** - it should include all fields
8. **For the `properties` field**: Make.com will likely set it as `Collection` type, which is correct
9. **Click "Save"**

**✅ Done!** The data structure is now configured automatically.

---

## Option 2: Manual Setup (If JSON Generation Not Available)

If Make.com doesn't have JSON generation, manually add each field:

### Step-by-Step Manual Setup

1. **Open your Custom Webhook module** in Make.com
2. **Click "Advanced settings"** to expand
3. **Click "Data structure"** → "Add data structure"
4. **Configure the data structure:**

#### Data Structure Name
```
Notion Polling Webhook Data
```

#### Add Items (Fields)

Add each field as a "New item":

**Item 1: `id`**
- **Name**: `id`
- **Description**: `Notion page ID`
- **Type**: `Text`
- **Default value**: (leave empty)
- **Required**: `Yes`

**Item 2: `database_id`**
- **Name**: `database_id`
- **Description**: `Notion database ID`
- **Type**: `Text`
- **Default value**: (leave empty)
- **Required**: `Yes`

**Item 3: `status`**
- **Name**: `status`
- **Description**: `Current status value (e.g., "Qualified", "Contract Signed")`
- **Type**: `Text`
- **Default value**: (leave empty)
- **Required**: `Yes`

**Item 4: `url`**
- **Name**: `url`
- **Description**: `Notion page URL`
- **Type**: `Text`
- **Default value**: (leave empty)
- **Required**: `No`

**Item 5: `triggered_at`**
- **Name**: `triggered_at`
- **Description**: `ISO timestamp when status change was detected`
- **Type**: `Text`
- **Default value**: (leave empty)
- **Required**: `No`

**Item 6: `properties`** (Most Important!)
- **Name**: `properties`
- **Description**: `Full Notion page properties object (nested structure)`
- **Type**: `Collection` ⚠️ (Make.com uses Collection, not Object)
- **Default value**: (leave empty)
- **Required**: `Yes`

**Note**: When you set `properties` as `Collection`, Make.com will handle it as a dynamic object. You don't need to define all nested properties - Make.com will parse them automatically when data arrives.

5. **Click "Save"**

---

## Option 2: JSON Pass-Through (Alternative)

If defining the structure is too complex, you can use JSON pass-through:

1. **In Advanced settings**, set **"JSON pass through"** to **"Yes"**
2. **Leave data structure empty** (or don't define it)
3. **Access data using JSON functions** in Make.com:
   - Use `{{json(1.body)}}` to parse the entire payload
   - Access fields like: `{{json(1.body).status}}`
   - Access properties: `{{json(1.body).properties.Name[0].plain_text}}`

**Note**: JSON pass-through requires using Make.com's JSON functions, which can be more complex in router filters.

---

## Option 3: Simplified Properties Structure (Advanced)

If you need to define the `properties` structure explicitly, you can add nested items:

**For `properties` item:**
1. Click on the `properties` item
2. Add nested items for each property type you use:

**Example nested items within `properties`:**

- **Name** (Rich Text):
  - Type: `Collection`
  - Nested: `title` → `Collection` → `plain_text` → `Text`

- **Status** (Select):
  - Type: `Object`
  - Nested: `select` → `Object` → `name` → `Text`

- **Email** (Email):
  - Type: `Object`
  - Nested: `email` → `Text`

**This is very complex** and may not be necessary if you use Option 1 or 2.

---

## Recommended Configuration

**For most users, use Option 1 (JSON Generation)** - it's the easiest and most accurate:

### Advanced Settings:
- **Get request headers**: `No`
- **Get request HTTP method**: `No`
- **JSON pass through**: `No` (unless using Option 2)
- **Data structure**: `Notion Polling Webhook Data` (the structure you defined)

### Data Structure:
```
✅ id (Text, Required)
✅ database_id (Text, Required)
✅ status (Text, Required)
✅ url (Text, Optional)
✅ triggered_at (Text, Optional)
✅ properties (Collection, Required) ⚠️ Note: Make.com uses "Collection" type, not "Object"
```

---

## Accessing Data After Setup

Once the data structure is defined, you can access fields in Make.com:

### Top-Level Fields:
```
{{1.id}}                    → Page ID
{{1.database_id}}           → Database ID
{{1.status}}                → Status value
{{1.url}}                   → Notion page URL
{{1.triggered_at}}          → Timestamp
```

### Properties (Nested):
The exact path depends on how Make.com structures the `properties` object. Common patterns:

**Rich Text (Name, Company, etc.):**
```
{{1.properties.Name[0].plain_text}}
{{1.properties.Company[0].plain_text}}
{{1.properties.Project Name[0].plain_text}}
```

**Select (Status, Service, etc.):**
```
{{1.properties.Status.select.name}}
{{1.properties.Service.select.name}}
{{1.properties.Payment Terms.select.name}}
```

**Email:**
```
{{1.properties.Email.email}}
```

**Number:**
```
{{1.properties.Fee.number}}
```

**Date:**
```
{{1.properties.Start Date.date.start}}
```

---

## Testing the Data Structure

1. **Save the data structure** in your webhook module
2. **Turn ON your scenario**
3. **Trigger a test**: Change a status in Notion
4. **Wait 10-30 seconds** for polling service to detect
5. **Check execution history**:
   - Click on the execution
   - Look at the data bundle from Module 1 (Custom Webhook)
   - Verify you can see:
     - `id`
     - `status`
     - `properties` (as an object)
   - Click on `properties` to see nested structure

6. **If data is visible**: ✅ Data structure is working!
7. **If data is empty**: ❌ Check:
   - Data structure matches payload exactly
   - Field names are case-sensitive
   - `properties` type is set correctly

---

## Troubleshooting

### Issue: Still seeing empty bundles
**Solutions:**
1. **Re-save the webhook module** after defining data structure
2. **Verify field names** match exactly (case-sensitive): `id`, `database_id`, `status`, `properties`
3. **Check JSON pass-through**: If enabled, disable it and use data structure instead
4. **Test with a manual webhook call**: Use curl or Postman to send test data

### Issue: Properties field is empty
**Solutions:**
1. **Change `properties` type** to `Object` or `Collection`
2. **Use JSON pass-through** (Option 2) if structure is too complex
3. **Check polling service logs** to verify `properties` is being sent

### Issue: Can't access nested properties
**Solutions:**
1. **Use Make.com's data mapper**: Click the field in a module to see available paths
2. **Check execution history**: Look at actual data structure in bundle
3. **Verify property names**: Must match Notion property names exactly (case-sensitive, including spaces)

---

## Example: Complete Data Structure Setup

Here's a visual guide for the "Add data structure" modal:

```
Data structure name: Notion Polling Webhook Data

Specification:
┌─────────────────────────────────────────┐
│ New item                                │
│ Name: id                                │
│ Description: Notion page ID             │
│ Type: Text                              │
│ Required: Yes                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ New item                                │
│ Name: database_id                       │
│ Description: Notion database ID         │
│ Type: Text                              │
│ Required: Yes                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ New item                                │
│ Name: status                            │
│ Description: Current status value       │
│ Type: Text                              │
│ Required: Yes                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ New item                                │
│ Name: url                               │
│ Description: Notion page URL           │
│ Type: Text                              │
│ Required: No                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ New item                                │
│ Name: triggered_at                      │
│ Description: ISO timestamp             │
│ Type: Text                              │
│ Required: No                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ New item                                │
│ Name: properties                        │
│ Description: Full Notion properties    │
│ Type: Collection                        │
│ Required: Yes                           │
└─────────────────────────────────────────┘
```

---

## Next Steps

After setting up the data structure:

1. ✅ **Test the webhook** by changing a status in Notion
2. ✅ **Verify data is captured** in execution history
3. ✅ **Set up Router module** with filters using `{{1.status}}`
4. ✅ **Build routes** using the property paths from this guide

---

## Troubleshooting: Webhook Not Capturing Changes

If you've configured the data structure but Make.com isn't capturing status changes:

1. **Verify cron job is running** - The polling service must be called every 10-30 seconds
2. **Check environment variables** - Ensure `MAKE_WEBHOOK_URL` is set in Vercel
3. **Test polling endpoint** - Call `https://zynra.studio/api/poll/notion` manually
4. **Make a new status change** - The service only detects changes, not current state
5. **Check Vercel logs** - Look for `✅ Successfully forwarded` messages

**📖 For detailed troubleshooting**, see: [Troubleshooting Webhook Not Capturing](TROUBLESHOOTING_WEBHOOK_NOT_CAPTURING.md)

---

## Related Documentation

- [Make.com Scenario Setup Guide](MAKE_SCENARIO_SETUP_GUIDE.md)
- [Unified Scenario Blueprint](UNIFIED_SCENARIO_BLUEPRINT.md)
- [Make Webhook URL Guide](MAKE_WEBHOOK_URL_GUIDE.md)
- [Troubleshooting Guide](TROUBLESHOOTING_WEBHOOK_NOT_CAPTURING.md)
