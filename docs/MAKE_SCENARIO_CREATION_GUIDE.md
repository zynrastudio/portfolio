# Make.com Scenario Creation Guide

This guide provides step-by-step instructions for creating the Notion Lead Status → Gmail Draft Automation scenario in Make.com.

## Prerequisites

1. **Set up Connections in Make.com:**
   - Notion connection (for accessing Leads and Email Templates databases)
   - Google Email connection (for creating Gmail drafts)

2. **Database IDs:**
   - Leads Database ID: `91ba6dd0506a49e4b7f7706db990d872`
   - Email Templates Database ID: `b98e9d2eeeb44444bf58a71f62f95f3b`

3. **API Endpoints (Already Deployed):**
   - Welcome Email API: `https://zynra.studio/api/generate-welcome-email`
   - Rejection Email API: `https://zynra.studio/api/generate-rejection-email`
   - These endpoints handle template parsing and variable replacement, eliminating the need for paid Code modules in Make.com

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

#### Module 3A: Get Welcome Template

1. **Add Module**: Click "+" on Route 1
2. **Search for**: "Notion" → Select "Search Objects"
3. **Configure**:
   - **Connection**: Select your Notion connection
   - **Search Objects**: Select "Data Source Items"
   - **Data Source ID**: `ac3ca188-2c71-4c83-85ea-7392d7fbe8ec` (Email Templates database data source)
   - **Limit**: 1
   - **Filter** (if available):
     - Property: `Type`
     - Select: `equals` → `Welcome`

#### Module 4A-2: Generate Welcome Email HTML (HTTP Module)

**Important**: Instead of using Code modules (which require a paid plan), we'll use a custom API endpoint that handles template parsing and variable replacement.

1. **Add Module**: Click "+" after Module 3A
2. **Search for**: "HTTP" → Select "Make an HTTP Request" (Tools)
3. **Configure**:
   - **Method**: POST
   - **URL**: `https://zynra.studio/api/generate-welcome-email`
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
       "templatePageId": "{{3.id}}",
       "leadData": {
         "name": "{{1.properties.Name.title[0].plain_text}}",
         "email": "{{1.properties.Email.email}}",
         "service": "{{1.properties.Service.select.name}}",
         "company": "{{1.properties.Company.rich_text[0].plain_text}}",
         "budgetRange": "{{1.properties.Budget Range.select.name}}",
         "timeline": "{{1.properties.Timeline.select.name}}",
         "message": "{{1.properties.Message.rich_text[0].plain_text}}",
         "schedulingLink": "https://cal.com/zynra-studio"
       }
     }
     ```
     - **Note**: For optional fields (company, budgetRange, timeline, message), you can use Make.com's conditional mapping or leave them out if empty

**Output**: The HTTP module will return:
- `Body.html`: The final HTML email with all variables replaced
- `Body.subject`: The final email subject with variables replaced
- `Body.success`: Boolean indicating success

**Important**: 
- Map the lead data from Module 1 using the Notion property paths shown above
- Adjust property paths based on your actual Notion database structure
- The API endpoint handles all template parsing and variable replacement automatically

#### Module 5A: Create Welcome Email Draft

1. **Add Module**: Click "+" after Module 4A-2 (the HTTP module)
2. **Search for**: "Google Email" or "Email" → Select "Create a Draft"
3. **Configure**:
   - **Connection**: Select your email connection (e.g., "privateemail" or Google Email)
   - **Folder**: `/ Drafts` (or your drafts folder)
   - **To**: `{{1.properties.Email.email}}` or `{{1.properties.Email.rich_text[0].plain_text}}` (depending on your Notion property type)
   - **Subject**: 
     - **DO NOT** select the entire HTTP response object
     - **Instead**, expand the HTTP module's output in the data mapping panel and select `Body.subject`
     - Or type manually: `{{4.Body.subject}}` (adjust module number as needed)
     - **Note**: The HTTP module returns `{success: true, html: "...", subject: "..."}`, so access `Body.subject`
   - **Content Type**: `HTML`
   - **Content (Body)**: 
     - **DO NOT** select the entire HTTP response object
     - **Instead**, expand the HTTP module's output and select `Body.html`
     - Or type manually: `{{4.Body.html}}` (adjust module number as needed)

**How to Map HTTP Response in Make.com:**
1. Click in the **Subject** field
2. In the data mapping panel, find your HTTP module (e.g., "HTTP 4 - Make an HTTP Request")
3. Expand it to see: `Body`
4. **Expand `Body`** to see: `html`, `subject`, `success`
5. Click on `Body.subject` for the Subject field
6. Click on `Body.html` for the Content field

**Summary for Module 5A:**
- **Subject**: `{{4.Body.subject}}` (from HTTP module response)
- **Body**: `{{4.Body.html}}` (from HTTP module response)
- **Why HTTP module?** It handles template parsing and variable replacement on your server, avoiding the need for paid Code modules

### Step 5: Path B - Unqualified Lead (Rejection Email)

#### Module 3B: Get Rejection Template

1. **Add Module**: Click "+" on Route 2
2. **Search for**: "Notion" → Select "Search Objects"
3. **Configure**:
   - **Connection**: Select your Notion connection
   - **Search Objects**: Select "Data Source Items"
   - **Data Source ID**: `ac3ca188-2c71-4c83-85ea-7392d7fbe8ec` (Email Templates database data source)
   - **Limit**: 1
   - **Filter** (if available):
     - Property: `Type`
     - Select: `equals` → `Rejection`

#### Module 4B-2: Generate Rejection Email HTML (HTTP Module)

**Important**: Instead of using Code modules (which require a paid plan), we'll use a custom API endpoint that handles template parsing and variable replacement.

1. **Add Module**: Click "+" after Module 3B
2. **Search for**: "HTTP" → Select "Make an HTTP Request" (Tools)
3. **Configure**:
   - **Method**: POST
   - **URL**: `https://zynra.studio/api/generate-rejection-email`
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
       "templatePageId": "{{3.id}}",
       "leadData": {
         "name": "{{1.properties.Name.title[0].plain_text}}",
         "email": "{{1.properties.Email.email}}",
         "rejectionReason": "{{1.properties.Rejection Reason.rich_text[0].plain_text}}"
       }
     }
     ```
     - **Note**: `rejectionReason` is optional - if not provided, a default message will be used

**Output**: The HTTP module will return:
- `Body.html`: The final HTML email with all variables replaced
- `Body.subject`: The final email subject with variables replaced
- `Body.success`: Boolean indicating success

**Important**: 
- Map the lead data from Module 1 using the Notion property paths shown above
- Adjust property paths based on your actual Notion database structure
- The API endpoint handles all template parsing and variable replacement automatically

#### Module 5B: Create Rejection Email Draft

1. **Add Module**: Click "+" after Module 4B-2 (the HTTP module)
2. **Search for**: "Google Email" or "Email" → Select "Create a Draft"
3. **Configure**:
   - **Connection**: Select your email connection (e.g., "privateemail" or Google Email)
   - **Folder**: `/ Drafts` (or your drafts folder)
   - **To**: `{{1.properties.Email.email}}` or `{{1.properties.Email.rich_text[0].plain_text}}`
   - **Subject**: 
     - **DO NOT** select the entire HTTP response object
     - **Instead**, expand the HTTP module's output in the data mapping panel and select `Body.subject`
     - Or type manually: `{{4.Body.subject}}` (adjust module number as needed)
   - **Content Type**: `HTML`
   - **Content (Body)**: 
     - **DO NOT** select the entire HTTP response object
     - **Instead**, expand the HTTP module's output and select `Body.html`
     - Or type manually: `{{4.Body.html}}` (adjust module number as needed)

**Summary for Module 5B:**
- **Subject**: `{{4.Body.subject}}` (from HTTP module response)
- **Body**: `{{4.Body.html}}` (from HTTP module response)
- **Why HTTP module?** It handles template parsing and variable replacement on your server, avoiding the need for paid Code modules

### Step 6: Final Module - Update Notion Record

**Important**: The two routes from the Router do NOT automatically converge. You have two options:

#### Option A: Add Update Module to Both Paths (Recommended)

Add the Update module to **each route separately** so it runs after either path completes:

**For Qualified Path (after Email 9):**
1. **Add Module**: Click the "+" sign after "Email 9: Create a Draft"
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
     - Map `{{9.id}}` or select `9. ID` from the data mapping panel
     - This is the Gmail draft ID from Email 9

**For Unqualified Path (after Email 14):**
1. **Add Module**: Click the "+" sign after "Email 14: Create a Draft"
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
     - **Value**: Map `{{14.id}}` or select `14. ID` from the data mapping panel

#### Option B: Use Flow Control Aggregator (Alternative)

If you prefer a single Update module that runs after either path:

1. **Add Aggregator Module**: After both Email modules (9 and 14), add a "Flow Control" → "Aggregator" module
2. **Configure Aggregator**: Set it to wait for both paths (or use "First" mode to run after either completes)
3. **Add Update Module**: After the Aggregator, add the Update module as described above

**Recommendation**: Use **Option A** (duplicate the Update module on both paths) as it's simpler and more straightforward.

## Important Notes

1. **API Endpoints for Template Processing**: 
   - Instead of using Code modules (which require a paid plan), we use custom API endpoints:
     - `/api/generate-welcome-email` - Handles Welcome email template processing
     - `/api/generate-rejection-email` - Handles Rejection email template processing
   - These endpoints:
     - Fetch templates from Notion by page ID
     - Parse HTML from code blocks automatically
     - Replace all template variables with lead data
     - Return final HTML and subject ready for Gmail drafts
   - **Benefits**: Works with Make.com's free plan, no Code modules needed

2. **HTTP Module Configuration**: 
   - Use "Make an HTTP Request" module (free) instead of Code modules
   - Map lead data from Module 1 to the simplified structure expected by the API
   - Access response via `Body.html` and `Body.subject` in subsequent modules

3. **Error Handling**: Consider adding error handlers:
   - If template not found, log error and skip draft creation
   - If Gmail fails, log error but don't fail the scenario
   - If Notion update fails, log error but draft is still created

4. **Testing**: After creating the scenario:
   - Test with a lead status change to "Qualified"
   - Test with a lead status change to "Unqualified"
   - Verify Gmail drafts are created correctly
   - Check Notion records are updated

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
Module 2 (Router 3): Router
    ├─→ Route 1 (Qualified - Welcome Email)
    │   ├─→ Module 3: Search Objects (Get Welcome Template)
    │   ├─→ Module 4: HTTP Request (Generate Welcome Email) ⚠️ Replaces Code modules
    │   ├─→ Module 5: Create Email Draft
    │   └─→ Module [X]: Update Data Source Item (Update Notion record) ⚠️ Add to this path
    │
    └─→ Route 2 (Unqualified - Rejection Email)
        ├─→ Module 3: Search Objects (Get Rejection Template)
        ├─→ Module 4: HTTP Request (Generate Rejection Email) ⚠️ Replaces Code modules
        ├─→ Module 5: Create Email Draft
        └─→ Module [Y]: Update Data Source Item (Update Notion record) ⚠️ Add to this path

Note: The two routes do NOT converge. Add the Update module to BOTH paths separately.
Note: HTTP modules replace Code modules, making this work with Make.com's free plan.
```
