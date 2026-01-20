# Gmail Draft Automation - Qualified/Unqualified Lead Handling

> **Note**: This scenario handles initial lead qualification (Qualified/Unqualified status changes). For the full client journey automation (Discovery Completed through Project Completion), see [Full Client Journey Automation Guide](02-full-client-journey-automation.md).

This guide provides step-by-step instructions for creating the Notion Lead Status → Gmail Draft Automation scenario in Make.com.

## Prerequisites

1. **Set up Connections in Make.com:**
   - Notion connection (for accessing Leads and Email Templates databases)
   - Google Email connection (for creating Gmail drafts)

2. **Database IDs:**
   - Leads Database ID: `91ba6dd0506a49e4b7f7706db990d872`
   - Email Templates Database ID: `b98e9d2eeeb44444bf58a71f62f95f3b`

3. **Verified Template Page IDs** (for troubleshooting):
   - Welcome Email Template: `2ee13f3ae6f38117b3eef77f98ce06c2`
   - Rejection Email Template: `2ee13f3ae6f381cca68ae4b059d8eda5`
   - ⚠️ **Important**: Delete any duplicate or blank templates from your database

4. **API Endpoints (Already Deployed):**
   - Welcome Email API: `https://zynra.studio/api/generate-welcome-email`
   - Rejection Email API: `https://zynra.studio/api/generate-rejection-email`
   - These endpoints handle template parsing and variable replacement, eliminating the need for paid Code modules in Make.com
   - **Test the APIs**: Run `npx tsx scripts/test-email-api.ts` to verify they work before setting up Make.com

5. **Notion Integration Access** (CRITICAL):
   - Both Leads and Email Templates databases MUST be shared with your Notion integration
   - In Notion: Open each database → Click `•••` → "Add connections" → Select your integration
   - Without this, API will fail with "Could not find page" errors

## Step-by-Step Scenario Creation

### Step 1: Create New Scenario

1. In Make.com, click "Create a new scenario"
2. Name it: "Notion Lead Status → Gmail Draft Automation"
3. Description: "Monitors Notion Leads database for status changes. When status changes to 'Qualified' or 'Unqualified', generates HTML emails using templates from Notion and creates Gmail drafts for manual review."

### Step 2: Module 1 - Notion Trigger (Watch Database)

1. **Add Module**: Click "+" to add first module
2. **Search for**: "Notion" → Type "watch" in the search
3. **Select the correct option**: Choose **"Watch Data Source Items"** (the first option: "DATA SOURCE / DATABASE ITEM")
   - ✅ **Correct**: "Watch Data Source Items" - Triggers when a Data source (legacy database) item is created or updated
   - ❌ **Wrong**: "Watch Objects" - This triggers on database/page-level changes, not individual item property changes
   - ❌ **Wrong**: "Watch Page Contents" - This triggers on rich text content changes, not property changes
   
   **Why this option?** Since you're monitoring changes to individual lead records (database items) and specifically their "Status" property, you need "Watch Data Source Items" which monitors item-level updates.

4. **Configure**:
   - **Connection**: Select your Notion connection
   - **Data Source ID**: `ce12e087-e701-4902-ae70-8ff582981d1b` (Leads database data source)
   - **Limit**: 2

**Note**: The trigger will fire when any item in the Leads database is created or updated. The router in Module 2 will filter to only process items where Status = "Qualified" or "Unqualified".

### Step 3: Module 2 - Router (Branch by Status)

1. **Add Module**: Click "+" after Module 1
2. **Search for**: "Router" → Select "Router" (Flow Control)
3. **Configure Route 1 (Qualified → Welcome Email)**:
   - Click on the first route path (labeled "1st" or "Route 1")
   - In the "Set up a filter" dialog:
     - **Label**: Enter `Qualified → Welcome Email`
     - **Fallback Route**: Select "No" (this is not a fallback route)
     - **Condition**:
       - **Field**: Click the first input field and select `1. Properties Value: Status`
         - This selects the "Status" property from your Notion module output
       - **Operator**: In the "Text operators" dropdown, select `Equal to`
       - **Value**: In the text input field below the operator, enter `Qualified`
     - Click "Save"
   
4. **Configure Route 2 (Unqualified → Rejection Email)**:
   - Click on the second route path (labeled "2nd" or "Route 2")
   - In the "Set up a filter" dialog:
     - **Label**: Enter `Unqualified → Rejection Email`
     - **Fallback Route**: Select "No"
     - **Condition**:
       - **Field**: Select `1. Properties Value: Status`
       - **Operator**: Select `Equal to`
       - **Value**: Enter `Unqualified`
     - Click "Save"

**Visual Guide:**
- Route 1 Condition: `1. Properties Value: Status` → `Equal to` → `Qualified`
- Route 2 Condition: `1. Properties Value: Status` → `Equal to` → `Unqualified`

### Step 4: Path A - Qualified Lead (Welcome Email)

#### Module 3A: Generate Welcome Email HTML (HTTP Module)

**Important**: Instead of using Code modules (which require a paid plan), we'll use a custom API endpoint that handles template parsing and variable replacement. We'll hardcode the template ID for reliability.

1. **Add Module**: Click "+" on Route 1 (right after the Router)
2. **Search for**: "HTTP" → Select "Make an HTTP Request" (Tools)
3. **Configure**:
   - **Method**: POST
   - **URL**: `https://zynra.studio/api/generate-welcome-email`
   - **Authentication type**: No authentication
   - **Headers**:
     - Click "Add header"
     - **Name**: `Content-Type`
     - **Value**: `application/json`
   - **Request Body**:
     - **Body Type**: Raw
     - **Content Type**: JSON (application/json)
     - **Request Content**: 
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

**Important Notes**:
- Template ID is **hardcoded** (`2ee13f3ae6f38117b3eef77f98ce06c2`) - no Search Objects module needed
- Property mappings use `properties_value` from Module 1 (Watch Data Source Items)
- **CRITICAL**: Make.com uses **1-based indexing** for arrays, so use `[1]` not `[0]`
- Rich text properties (Name, Company, Message) require `.plain_text` after array access
- Select properties (Service, Timeline, BudgetRange) require `.name` to get the selected option
- `BudgetRange` has no space (property was renamed to simplify mapping)

**Output**: The HTTP module will return:
- `Body.html`: The final HTML email with all variables replaced
- `Body.subject`: The final email subject with variables replaced
- `Body.success`: Boolean indicating success

**Important**: 
- Template ID is hardcoded - no need for a separate Search Objects module
- Map the lead data from Module 1 using `properties_value` paths shown above
- The API endpoint handles all template parsing and variable replacement automatically

#### Module 4A: Create Welcome Email Draft

1. **Add Module**: Click "+" after Module 3A (the HTTP module)
2. **Search for**: "Google Email" or "Email" → Select "Create a Draft"
3. **Configure**:
   - **Connection**: Select your email connection (e.g., "privateemail" or Google Email)
   - **Folder**: `/ Drafts` (or your drafts folder)
   - **To**: `{{1.properties_value.Email}}`
   - **Subject**: 
     - **DO NOT** select the entire HTTP response object
     - **Instead**, expand the HTTP module's output in the data mapping panel and select `Body.subject`
     - Or type manually: `{{3.Body.subject}}` (Module 3 is now the HTTP module)
     - **Note**: The HTTP module returns `{success: true, html: "...", subject: "..."}`, so access `Body.subject`
   - **Content Type**: `HTML`
   - **Content (Body)**: 
     - **DO NOT** select the entire HTTP response object
     - **Instead**, expand the HTTP module's output and select `Body.html`
     - Or type manually: `{{3.Body.html}}` (Module 3 is now the HTTP module)

**How to Map HTTP Response in Make.com:**
1. Click in the **Subject** field
2. In the data mapping panel, find your HTTP module (e.g., "HTTP 3 - Make an HTTP Request")
3. Expand it to see: `Body`
4. **Expand `Body`** to see: `html`, `subject`, `success`
5. Click on `Body.subject` for the Subject field
6. Click on `Body.html` for the Content field

**Summary for Module 4A:**
- **To**: `{{1.properties_value.Email}}` (from Watch module)
- **Subject**: `{{3.Body.subject}}` (from HTTP module response)
- **Body**: `{{3.Body.html}}` (from HTTP module response)
- **Content Type**: Must be set to `HTML`
- **Why hardcoded template ID?** More reliable than filtering, eliminates Search Objects module complexity

### Step 5: Path B - Unqualified Lead (Rejection Email)

#### Module 3B: Generate Rejection Email HTML (HTTP Module)

**Important**: Instead of using Code modules (which require a paid plan), we'll use a custom API endpoint that handles template parsing and variable replacement. We'll hardcode the template ID for reliability.

1. **Add Module**: Click "+" on Route 2 (right after the Router)
2. **Search for**: "HTTP" → Select "Make an HTTP Request" (Tools)
3. **Configure**:
   - **Method**: POST
   - **URL**: `https://zynra.studio/api/generate-rejection-email`
   - **Authentication type**: No authentication
   - **Headers**:
     - Click "Add header"
     - **Name**: `Content-Type`
     - **Value**: `application/json`
   - **Request Body**:
     - **Body Type**: Raw
     - **Content Type**: JSON (application/json)
     - **Request Content**: 
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

**Important Notes**:
- Template ID is **hardcoded** (`2ee13f3ae6f381cca68ae4b059d8eda5`) - no Search Objects module needed
- Property mappings use `properties_value` from Module 1 (Watch Data Source Items)
- **CRITICAL**: Make.com uses **1-based indexing** for arrays, so use `[1]` not `[0]`
- `rejectionReason` is optional - if not provided or empty, a default message will be used
- Make sure "Rejection Reason" field exists in your Leads database
- Rich text properties (Name, Rejection Reason) require `.plain_text` after array access

**Output**: The HTTP module will return:
- `Body.html`: The final HTML email with all variables replaced
- `Body.subject`: The final email subject with variables replaced
- `Body.success`: Boolean indicating success

**Important**: 
- Template ID is hardcoded - no need for a separate Search Objects module
- Map the lead data from Module 1 using `properties_value` paths shown above
- The API endpoint handles all template parsing and variable replacement automatically

#### Module 4B: Create Rejection Email Draft

1. **Add Module**: Click "+" after Module 3B (the HTTP module)
2. **Search for**: "Google Email" or "Email" → Select "Create a Draft"
3. **Configure**:
   - **Connection**: Select your email connection (e.g., "privateemail" or Google Email)
   - **Folder**: `/ Drafts` (or your drafts folder)
   - **To**: `{{1.properties_value.Email}}`
   - **Subject**: 
     - **DO NOT** select the entire HTTP response object
     - **Instead**, expand the HTTP module's output in the data mapping panel and select `Body.subject`
     - Or type manually: `{{3.Body.subject}}` (Module 3 is now the HTTP module)
   - **Content Type**: `HTML`
   - **Content (Body)**: 
     - **DO NOT** select the entire HTTP response object
     - **Instead**, expand the HTTP module's output and select `Body.html`
     - Or type manually: `{{3.Body.html}}` (Module 3 is now the HTTP module)

**Summary for Module 4B:**
- **To**: `{{1.properties_value.Email}}` (from Watch module)
- **Subject**: `{{3.Body.subject}}` (from HTTP module response)
- **Body**: `{{3.Body.html}}` (from HTTP module response)
- **Content Type**: Must be set to `HTML`
- **Why hardcoded template ID?** More reliable than filtering, eliminates Search Objects module complexity

### Step 6: Final Module - Update Notion Record

**Important**: The two routes from the Router do NOT automatically converge. You have two options:

#### Option A: Add Update Module to Both Paths (Recommended)

Add the Update module to **each route separately** so it runs after either path completes:

**For Qualified Path (after Module 4A - Create Draft):**
1. **Add Module**: Click the "+" sign after "Email 4A: Create a Draft"
2. **Search for**: "Notion" → Select "Update a Data Source Item"
3. **Configure**:
   - **Connection**: Select your Notion connection
   - **Update By**: Select "Data Source" (dropdown)
   - **Data Source ID**: `ce12e087-e701-4902-ae70-8ff582981d1b` (Leads database data source)
   - **Page ID**: Map `{{1.id}}` or select `1. Database Item ID` from the data mapping panel
     - This is the ID of the lead record from Module 1
   
   **Fields Section** (Click to expand):
   - Click the "Fields" section to expand it
   - Click "Add Item" or the "+" button to add fields
   
   **Field 1: Email Draft Created**
   - **Key**: Type `Email Draft Created` (exact property name from your Notion database)
   - **Value Type**: Select "Checkbox" from the dropdown
   - **Value**: 
     - Toggle the "Map" switch to ON (if available)
     - Enter `true` or select the checkbox
   
   **Field 2: Draft Email ID**
   - Click "Add Item" again to add another field
   - **Key**: Type `Draft Email ID` (exact property name from your Notion database)
   - **Value Type**: Select "Text" from the dropdown
   - **Value**: 
     - Toggle the "Map" switch to ON (if available)
     - Map `{{4.id}}` or select `4. ID` from the data mapping panel
     - This is the Gmail draft ID from Module 4A

**For Unqualified Path (after Module 4B - Create Draft):**
1. **Add Module**: Click the "+" sign after "Email 4B: Create a Draft"
2. **Search for**: "Notion" → Select "Update a Data Source Item"
3. **Configure**:
   - **Connection**: Select your Notion connection
   - **Update By**: Select "Data Source" (dropdown)
   - **Data Source ID**: `ce12e087-e701-4902-ae70-8ff582981d1b` (Leads database data source)
   - **Page ID**: Map `{{1.id}}` or select `1. Database Item ID` from the data mapping panel
   
   **Fields Section**:
   - **Field 1: Email Draft Created**
     - **Key**: `Email Draft Created`
     - **Value Type**: "Checkbox"
     - **Value**: `true`
   
   - **Field 2: Draft Email ID**
     - **Key**: `Draft Email ID`
     - **Value Type**: "Text"
     - **Value**: Map `{{4.id}}` or select `4. ID` from the data mapping panel

#### Option B: Use Flow Control Aggregator (Alternative)

If you prefer a single Update module that runs after either path:

1. **Add Aggregator Module**: After both Email modules (4A and 4B), add a "Flow Control" → "Aggregator" module
2. **Configure Aggregator**: Set it to wait for both paths (or use "First" mode to run after either completes)
3. **Add Update Module**: After the Aggregator, add the Update module as described above

**Recommendation**: Use **Option A** (duplicate the Update module on both paths) as it's simpler and more straightforward.

## Important Notes

1. **Notion Integration Access**:
   - **CRITICAL**: Both Leads and Email Templates databases MUST be shared with your Notion integration
   - Go to each database → Click `•••` → "Add connections" → Select your integration
   - Without this, the API will return errors like "Could not find page"
   - Integration type can be "Internal" (this is fine, doesn't need to be "Public")

2. **Email Template Setup**:
   - **CRITICAL**: Ensure you have ONLY ONE template of each type (Welcome, Rejection) in your Email Templates database
   - Each template MUST have HTML content stored in code blocks within the page
   - Delete any duplicate or blank templates to avoid Make.com selecting the wrong one
   - To verify templates have content, open each template page in Notion and check for HTML code blocks
   - Verified Template Page IDs (for troubleshooting):
     - Welcome Email: `2ee13f3ae6f38117b3eef77f98ce06c2`
     - Rejection Email: `2ee13f3ae6f381cca68ae4b059d8eda5`

3. **API Endpoints for Template Processing**: 
   - Instead of using Code modules (which require a paid plan), we use custom API endpoints:
     - `/api/generate-welcome-email` - Handles Welcome email template processing
     - `/api/generate-rejection-email` - Handles Rejection email template processing
   - These endpoints:
     - Fetch templates from Notion by page ID
     - Parse HTML from code blocks automatically
     - Replace all template variables with lead data
     - Return final HTML and subject ready for Gmail drafts
   - **Benefits**: Works with Make.com's free plan, no Code modules needed
   - **Test the APIs**: Run `npx tsx scripts/test-email-api.ts` to verify they work

4. **HTTP Module Configuration**: 
   - Use "Make an HTTP Request" module (free) instead of Code modules
   - **Authentication Type**: Select "No authentication" (endpoints are public)
   - **Headers**: Must include `Content-Type: application/json`
   - Map lead data from Module 1 to the simplified structure expected by the API
   - Access response via `Body.html` and `Body.subject` in subsequent modules
   - **CRITICAL**: Map ONLY `Body.html` and `Body.subject`, NOT the entire response object

5. **Common Issues & Troubleshooting**:
   - **Empty email drafts**: Usually caused by wrong template page ID or missing template content
   - **"Template not found" error**: Database not shared with integration or wrong page ID
   - **"Template HTML not found" error**: Template page is blank or has no code blocks
   - **Empty subject/body in draft**: Mapped entire HTTP response instead of `Body.html` and `Body.subject`
   - **Invalid JSON error**: Using `[0]` instead of `[1]` for array indexing (Make.com uses 1-based indexing)
   - **"Module references non-existing module NaN"**: Old mappings reference deleted modules - re-map all fields
   - **Empty name/company/message fields**: Missing `.plain_text` after array access or wrong array index
   - Run `npx tsx scripts/test-email-api.ts` to test API endpoints independently
   - Check Make.com execution history for detailed error messages
   - Refer to `docs/DEBUGGING_EMPTY_DRAFTS.md` for comprehensive troubleshooting guide

6. **Error Handling**: Consider adding error handlers:
   - If template not found, log error and skip draft creation
   - If Gmail fails, log error but don't fail the scenario
   - If Notion update fails, log error but draft is still created

7. **Testing**: After creating the scenario:
   - **Before testing in Make.com**, verify API endpoints work: `npx tsx scripts/test-email-api.ts`
   - Test with a lead status change to "Qualified"
   - Test with a lead status change to "Unqualified"
   - Verify Gmail drafts are created correctly with subject and body content
   - Check Notion records are updated with "Email Draft Created" checkbox and "Draft Email ID"
   - Review Make.com execution history to verify each module output
   - Ensure Module 3 (HTTP) returns `success: true` and has HTML content
   - Ensure Module 4 (Email) receives proper subject and body (not empty)

## Data Source IDs Reference

- **Leads Database**: 
  - Database ID: `91ba6dd0506a49e4b7f7706db990d872`
  - Data Source ID: `ce12e087-e701-4902-ae70-8ff582981d1b`

- **Email Templates Database**:
  - Database ID: `b98e9d2eeeb44444bf58a71f62f95f3b`
  - Data Source ID: `ac3ca188-2c71-4c83-85ea-7392d7fbe8ec`

## Module Flow Summary

```
Module 1: Notion Watch Data Source Items (Trigger)
    ↓
Module 2 (Router): Router
    ├─→ Route 1 (Qualified - Welcome Email)
    │   ├─→ Module 3A: HTTP Request (Generate Welcome Email) ⚠️ Template ID hardcoded
    │   ├─→ Module 4A: Create Email Draft
    │   └─→ Module 5A: Update Data Source Item (Update Notion record)
    │
    └─→ Route 2 (Unqualified - Rejection Email)
        ├─→ Module 3B: HTTP Request (Generate Rejection Email) ⚠️ Template ID hardcoded
        ├─→ Module 4B: Create Email Draft
        └─→ Module 5B: Update Data Source Item (Update Notion record)

Note: The two routes do NOT converge. Add the Update module to BOTH paths separately.
Note: Template IDs are hardcoded - NO Search Objects modules needed.
Note: HTTP modules replace Code modules, making this work with Make.com's free plan.
```

## Troubleshooting Guide

### Issue: Empty Email Drafts (No Subject or Body)

**Symptoms**: Gmail draft is created but has no subject or content

**Most Common Causes**:

1. **Wrong Template Page ID** (Most Likely)
   - Module 3 (Search Objects) is finding a blank or duplicate template
   - **Fix**: Delete duplicate/blank templates from Email Templates database
   - Keep only ONE Welcome and ONE Rejection template
   - Verify templates have HTML code blocks inside

2. **Incorrect HTTP Response Mapping**
   - Mapped entire HTTP response instead of specific fields
   - **Fix in Module 4 (Create Draft)**:
     - Subject: Must map to `{{3.Body.subject}}` (NOT `{{3}}` or `{{3.Body}}`)
     - Content: Must map to `{{3.Body.html}}` (NOT `{{3}}` or `{{3.Body}}`)
   - Click in field → Expand HTTP module → Expand Body → Select specific field

3. **Database Not Shared with Integration**
   - API returns "Could not find page" error
   - **Fix**: Share Email Templates database with your Notion integration
   - In Notion: Database → `•••` → "Add connections" → Select integration

4. **Template Has No Content**
   - Template page exists but is blank
   - **Fix**: Open template in Notion, verify HTML code blocks exist
   - If blank, delete it and keep the template with content

**Diagnostic Steps**:

1. **Test API Endpoints**:
   ```bash
   npx tsx scripts/test-email-api.ts
   ```
   - Should return `Success: true` with HTML content
   - If fails, issue is with Notion setup (not Make.com)

2. **Check Make.com Execution History**:
   - Module 3: Verify correct template ID is returned
   - Module 3: Verify `Body.success = true` and `Body.html` has content (several KB)
   - Module 4: Verify Subject and Content fields show mapped values, not objects

3. **Verify Template IDs** (for reference):
   - Welcome Email (correct): `2ee13f3ae6f38117b3eef77f98ce06c2`
   - Rejection Email (correct): `2ee13f3ae6f381cca68ae4b059d8eda5`

**For comprehensive troubleshooting**, see: `docs/DEBUGGING_EMPTY_DRAFTS.md`

### Issue: "Template not found" Error

**Cause**: Email Templates database not shared with Notion integration

**Fix**:
1. Open Email Templates database in Notion
2. Click `•••` (three dots) → "Add connections"
3. Select your Notion integration
4. Click "Confirm"

### Issue: "Template HTML not found" Error

**Cause**: Template page is blank or has no HTML code blocks

**Fix**:
1. Open the template page in Notion
2. Verify it has sections titled "HTML Template" with HTML code blocks
3. If blank, delete this template and use the one with content
4. Ensure only ONE template of each type exists

### Issue: HTTP Module Returns Error

**Check**:
1. URL is correct: `https://zynra.studio/api/generate-welcome-email`
2. Method is `POST`
3. Headers include: `Content-Type: application/json`
4. Request body is valid JSON
5. Lead data is properly mapped from Module 1

**Test**: Run the test script to verify API works independently of Make.com

### Issue: Invalid JSON Error / "Expected ',' or '}' after property value"

**Symptoms**: HTTP module fails with "The provided JSON body content is not valid JSON"

**Cause**: Using `[0]` for array indexing or missing `.plain_text` on rich text properties

**Common Mistakes**:
- `{{1.properties_value.Name[0].plain_text}}` ❌ (0-based indexing doesn't work)
- `{{first(1.properties_value.Name).plain_text}}` ❌ (returns entire object, not plain text)
- `{{1.properties_value.Name}}` ❌ (returns array, not string)

**Correct Syntax**:
- `{{1.properties_value.Name[1].plain_text}}` ✅ (Make.com uses 1-based indexing)
- For select properties: `{{1.properties_value.Service.name}}` ✅
- For email/phone/URL: `{{1.properties_value.Email}}` ✅ (no array, no .name)

**Why This Happens**:
- Make.com uses **1-based indexing** (first item is `[1]`, not `[0]`)
- Rich text properties are arrays of objects with `plain_text` field
- Select properties have a `name` field for the selected option value
- Using wrong syntax embeds the entire JSON object as a string, breaking JSON structure

**Fix**: Update all array property mappings to use `[1]` instead of `[0]` and ensure `.plain_text` is appended
