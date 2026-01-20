# Full Client Journey Automation - Make.com Scenario Setup

> **Note**: This scenario handles the complete client lifecycle from Discovery Completed through Project Completion. For initial lead qualification (Qualified/Unqualified), see [Gmail Draft Automation Guide](01-gmail-draft-automation.md).

This guide provides step-by-step instructions for creating the Full Client Journey Automation scenario in Make.com, which handles contract generation, Slack channel creation, Linear project setup, and project lifecycle management.

## Prerequisites

1. **Set up Connections in Make.com:**
   - Notion connection (for accessing Leads database)
   - Slack connection (for creating channels and posting messages)
   - Linear connection (for creating projects and issues)
   - Google Email connection (optional, for notifications)

2. **Understanding Linear GraphQL Module in Make.com:**
   - The Linear "Execute a GraphQL Query" module has two modes:
     - **Basic Mode**: Single "Query" field where you put everything as JSON
     - **Advanced Mode** (Recommended): Separate fields for Operation Name, Variables Data Source, and Variables
   - **We'll use Advanced Mode** for cleaner configuration and better variable management
   - To enable: Toggle "Advanced settings" switch in the module configuration

2. **Database IDs:**
   - Leads Database ID: `91ba6dd0506a49e4b7f7706db990d872`
   - Data Source ID: `ce12e087-e701-4902-ae70-8ff582981d1b`

3. **API Endpoints (Already Deployed):**
   - Contract Generation API: `https://zynra.studio/api/generate-contract`
   - This endpoint generates contracts and creates Notion pages automatically
   - **Test the API**: Verify it works before setting up Make.com

4. **Notion Integration Access** (CRITICAL):
   - Leads database MUST be shared with your Notion integration
   - Contracts parent page (optional): `2ee13f3ae6f3816f92f5e797392ec4bc`
   - In Notion: Open database → Click `•••` → "Add connections" → Select your integration

5. **Slack Setup:**
   - Slack Bot Token (for API access)
   - Slack Team ID
   - Internal team member IDs (for channel invites)

6. **Linear Setup:**
   - Linear API Key
   - Linear Team ID (for project creation)
     - **How to find**: In Linear app, press Cmd/Ctrl+K → Search for your team → Select "Copy model UUID"
     - This is the UUID you'll use in the `teamIds` array in GraphQL mutations
   - Delivery team identifier

## Step-by-Step Scenario Creation

### Step 1: Create New Scenario

1. In Make.com, click "Create a new scenario"
2. Name it: "Full Client Journey Automation"
3. Description: "Monitors Notion Leads database for status changes. Handles Discovery Completed (contract generation), Contract Signed (Slack + Linear setup), Deposit Paid (project activation), Review (client instructions), and Project Completion (final handover)."

### Step 2: Module 1 - Notion Trigger (Watch Database)

1. **Add Module**: Click "+" to add first module
2. **Search for**: "Notion" → Type "watch" in the search
3. **Select**: **"Watch Data Source Items"** (the first option: "DATA SOURCE / DATABASE ITEM")
   
   **Why this option?** This monitors individual lead record updates, specifically the "Status" property changes.

4. **Configure**:
   - **Connection**: Select your Notion connection
   - **Data Source ID**: `ce12e087-e701-4902-ae70-8ff582981d1b` (Leads database data source)
   - **Limit**: 2

**Note**: The trigger fires when any item in the Leads database is created or updated. The router in Module 2 will filter to only process specific status changes.

### Step 3: Module 2 - Router (Branch by Status)

1. **Add Module**: Click "+" after Module 1
2. **Search for**: "Router" → Select "Router" (Flow Control)
3. **Configure Routes** (5 routes total):

#### Route 1: Discovery Completed

- Click on the first route path
- **Label**: `Discovery Completed → Generate Contract`
- **Fallback Route**: No
- **Condition**:
  - **Field**: `1. Properties Value: Status`
  - **Operator**: `Equal to`
  - **Value**: `Discovery Completed`

#### Route 2: Contract Signed

- Click on the second route path
- **Label**: `Contract Signed → Slack + Linear Setup`
- **Fallback Route**: No
- **Condition**:
  - **Field**: `1. Properties Value: Status`
  - **Operator**: `Equal to`
  - **Value**: `Contract Signed`

#### Route 3: Deposit Paid

- Click on the third route path
- **Label**: `Deposit Paid → Activate Project`
- **Fallback Route**: No
- **Condition**:
  - **Field**: `1. Properties Value: Status`
  - **Operator**: `Equal to`
  - **Value**: `Deposit Paid`

#### Route 4: Review

- Click on the fourth route path
- **Label**: `Review → Post Instructions`
- **Fallback Route**: No
- **Condition**:
  - **Field**: `1. Properties Value: Status`
  - **Operator**: `Equal to`
  - **Value**: `Review`

#### Route 5: Project Completion

- Click on the fifth route path
- **Label**: `Project Completion → Final Handover`
- **Fallback Route**: No
- **Condition**:
  - **Field**: `1. Properties Value: Status`
  - **Operator**: `Equal to`
  - **Value**: `Project Completion`

**Visual Guide:**
- All routes filter on: `1. Properties Value: Status` → `Equal to` → `[Status Value]`

### Step 4: Route 1 - Discovery Completed (Contract Generation)

#### Module 3: Generate Contract & Create Notion Page (HTTP Module)

1. **Add Module**: Click "+" on Route 1 (Discovery Completed)
2. **Search for**: "HTTP" → Select "Make an HTTP Request" (Tools)
3. **Configure**:
   - **Method**: POST (select "POST" from dropdown, NOT GET)
   - **URL**: `https://zynra.studio/api/generate-contract`
   - **Authentication type**: No authentication
   - ⚠️ **IMPORTANT**: Ensure Method is set to "POST", not "GET" - "Method Not Allowed" error usually means GET was selected
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
       "leadData": {
         "clientName": "{{1.properties_value.Name[1].plain_text}}",
         "companyName": "{{1.properties_value.Company[1].plain_text}}",
         "projectName": "{{1.properties_value.Project Name[1].plain_text}}",
         "scopeSummary": "{{1.properties_value.Scope Summary[1].plain_text}}",
         "fee": {{1.properties_value.Fee}},
         "paymentTerms": "{{1.properties_value.Payment Terms.name}}",
         "startDate": "{{1.properties_value.Start Date}}"
       }
     }
     ```

**CRITICAL - Property Mapping Syntax**:
- **Array Indexing**: MUST use `[1]` (1-based), NOT `[0]` or `[]`
- **Property Names with Spaces**: Use spaces directly, NO backticks
  - ✅ Correct: `{{1.properties_value.Project Name[1].plain_text}}`
  - ❌ Wrong: `{{1.properties_value.`Project Name`[1].plain_text}}`
  - ❌ Wrong: `{{1.properties_value.Project Name[].plain_text}}`
- **Rich Text Properties**: Require `[1].plain_text` (Name, Company, Project Name, Scope Summary)
- **Select Properties**: Require `.name` (Payment Terms)
- **Number Properties**: NO quotes, NO array access (Fee)
- **Date Properties**: Access directly, no array, no `.name` (Start Date)

**Common Mistakes to Avoid**:
- ❌ `{{1.properties_value.Name[].plain_text}}` → Missing `[1]` index
- ❌ `{{1.properties_value.`Project Name`[1].plain_text}}` → No backticks around property names
- ❌ `"fee": "{{1.properties_value.Fee}}"` → Fee should be number (no quotes), not string
- ❌ `{{1.properties_value.Start Date.start}}` → Date accessed directly (no `.start`)
- ❌ `{{1.properties_value.ProjectName[1].plain_text}}` → Missing space if property name has space

**Example of Correct vs Incorrect**:
```json
// ✅ CORRECT:
{
  "leadData": {
    "clientName": "{{1.properties_value.Name[1].plain_text}}",
    "projectName": "{{1.properties_value.Project Name[1].plain_text}}",
    "fee": {{1.properties_value.Fee}},
    "startDate": "{{1.properties_value.Start Date}}"
  }
}

// ❌ INCORRECT (what you had):
{
  "leadData": {
    "clientName": "{{1.properties_value.Name[].plain_text}}",  // Missing [1]
    "projectName": "{{1.properties_value.`Project Name`[].plain_text}}",  // Backticks + missing [1]
    "fee": "{{1.properties_value.Fee}}",  // Should be number, not string
    "startDate": "{{1.properties_value.`Start Date`.start}}"  // Backticks + wrong access
  }
}
```

**Output**: The HTTP module returns:
- `Body.url`: Notion page URL (use this for Contract URL)
- `Body.html`: Contract HTML (for reference)
- `Body.success`: Boolean indicating success

#### Module 4: Update Notion Record (Contract URL)

1. **Add Module**: Click "+" after Module 3
2. **Search for**: "Notion" → Select "Update a Data Source Item"
3. **Configure**:
   - **Connection**: Select your Notion connection
   - **Update By**: Data Source
   - **Data Source ID**: `ce12e087-e701-4902-ae70-8ff582981d1b`
   - **Page ID**: `{{1.id}}` (from Module 1)
   
   **Fields Section**:
   - **Contract URL**:
     - **Key**: `Contract URL`
     - **Value Type**: URL
     - **Value**: `{{3.Body.url}}` (from HTTP module response)

### Step 5: Route 2 - Contract Signed (CRITICAL TRIGGER)

This route creates Slack channel and Linear project. This is the most important automation point.

#### Module 3: Slack - Create Channel

1. **Add Module**: Click "+" on Route 2 (Contract Signed)
2. **Search for**: "Slack" → Select "Create a Channel"
3. **Configure**:
   - **Connection**: Select your Slack connection
   - **Channel name**: 
     - Use Make.com's `replace()` function to sanitize project name
     - Example: `{{replace(replace(lower(1.properties_value.Project Name[1].plain_text); " "; "-"); "[^a-z0-9-]"; "")}}`
     - Or manually sanitize: lowercase, replace spaces with hyphens, remove special chars
   - **Is private**: No (unless you want private channels)
   - **Topic**: Optional - e.g., `Project: {{1.properties_value.Project Name[1].plain_text}}`

**Channel Naming Convention**:
- Format: `projectname-client` (e.g., `website-acme`)
- Sanitization: Lowercase, hyphens for spaces, remove special characters

#### Module 4: Slack - Invite Users

1. **Add Module**: Click "+" after Module 3
2. **Search for**: "Slack" → Select "Invite Users to Channel"
3. **Configure**:
   - **Connection**: Select your Slack connection
   - **Channel**: `{{5.id}}` (from Create Channel module)
   - **Users**: 
     - Add internal team members (hardcoded user IDs)
     - Add client via email: `{{1.properties_value.Email}}` (if using Slack Connect)

**Note**: For Slack Connect, you may need to use a different module or invite via email separately.

#### Module 5: Slack - Post Welcome Message

1. **Add Module**: Click "+" after Module 4
2. **Search for**: "Slack" → Select "Create a Message"
3. **Configure**:
   - **Connection**: Select your Slack connection
   - **Channel**: `{{5.id}}` (from Create Channel module)
   - **Text**: 
     - Load content from `templates/slack-welcome-message.md`
     - Replace variables:
       - `{{projectName}}` → `{{1.properties_value.Project Name[1].plain_text}}`
       - `{{clientName}}` → `{{1.properties_value.Name[1].plain_text}}`
       - `{{companyName}}` → `{{1.properties_value.Company[1].plain_text}}`
       - `{{startDate}}` → `{{1.properties_value.Start Date}}`
       - `{{paymentTerms}}` → `{{1.properties_value.Payment Terms.name}}`
       - `{{fee}}` → `{{1.properties_value.Fee}}`

**Template Variables**: See `templates/slack-welcome-message.md` for full template

#### Module 6: Linear - Create Project (GraphQL Query)

**Important**: Linear's Make.com integration doesn't have a direct "Create Project" module. We'll use the GraphQL query module instead.

1. **Add Module**: Click "+" after Module 5
2. **Search for**: "Linear" → Select "Other" → "Execute a GraphQL Query"
3. **Configure Basic Settings**:
   - **Connection**: Select your Linear connection
   - **Method**: Select "POST (queries and mutations)"
   - **Query**: 
     ```graphql
     mutation ProjectCreate($input: ProjectCreateInput!) {
       projectCreate(input: $input) {
         success
         project {
           id
           name
           description
           url
         }
       }
     }
     ```

4. **Enable Advanced Settings**: Toggle "Advanced settings" to ON

5. **Configure Advanced Settings**:
   - **Operation name**: `ProjectCreate`
   - **Variables data source**: Select "Form" (default)
   - **Variables**: Click "+ Add item" to add variables:
     
     **Item 1:**
     - **Key**: `input`
     - **Value**: 
       ```json
       {
         "name": "{{1.properties_value.Project Name[1].plain_text}}",
         "teamIds": ["YOUR_TEAM_ID"],
         "description": "Project for {{1.properties_value.Name[1].plain_text}}",
         "state": "planned"
       }
       ```
       **Important**: The Value must be a JSON string. In Make.com, you can:
       - Type the JSON directly (with Make.com mappings like `{{1.properties_value.Project Name[1].plain_text}}`)
       - Or use Make.com's JSON builder if available
       - Replace `YOUR_TEAM_ID` with your actual Linear team ID

**Important Notes**:
- **Team ID**: Replace `YOUR_TEAM_ID` with your actual Linear team ID (find it in Linear app: Cmd/Ctrl+K → "Copy model UUID" for your team)
- **Team IDs Format**: Must be an array: `["team-id"]` not `"team-id"`
- **State Values**: Use lowercase: `"planned"`, `"started"`, `"paused"`, `"completed"`, or `"canceled"`
- **For "Planned" status**: Use `"planned"` (lowercase)
- **Value Field**: The `input` variable value should be a JSON object/string containing all the project creation fields
- **Response Structure**: The response will be in `data.projectCreate.project` with fields: `id`, `name`, `url`

**Response Mapping**:
- Project ID: `{{6.data.projectCreate.project.id}}`
- Project URL: `{{6.data.projectCreate.project.url}}`
- Project Name: `{{6.data.projectCreate.project.name}}`

**Alternative: Using Variables Data Source = JSON**

If "Form" mode doesn't work well with nested objects, you can:
1. Set **Variables data source** to "JSON"
2. In the Variables field, provide the entire variables object:
   ```json
   {
     "input": {
       "name": "{{1.properties_value.Project Name[1].plain_text}}",
       "teamIds": ["YOUR_TEAM_ID"],
       "description": "Project for {{1.properties_value.Name[1].plain_text}}",
       "state": "planned"
     }
   }
   ```

#### Module 7: Linear - Create Issues (Bulk)

Create placeholder issues for the project. You'll need to repeat this module for each issue, or use Linear's bulk create if available.

**Issue 1: Kickoff & Onboarding**
1. **Add Module**: Click "+" after Module 6
2. **Search for**: "Linear" → Select "Create an Issue"
3. **Configure**:
   - **Connection**: Select your Linear connection
   - **Team**: Same as project team (use team ID from Module 6)
   - **Project**: `{{6.data.projectCreate.project.id}}` (from GraphQL response)
   - **Title**: `Kickoff & Onboarding`
   - **Description**: `Initial project setup, team introductions, and onboarding tasks.`
   - **Priority**: High (optional)

**Issue 2-6**: Repeat for each issue from `config/linear-project-template.json`:
- Discovery Recap
- Milestone 1
- Milestone 2
- QA & Review
- Handover

**Note**: If Linear supports bulk creation, use that instead of individual modules.

#### Module 8: Update Notion Record (Slack & Linear URLs)

1. **Add Module**: Click "+" after all Linear issue modules
2. **Search for**: "Notion" → Select "Update a Data Source Item"
3. **Configure**:
   - **Connection**: Select your Notion connection
   - **Update By**: Data Source
   - **Data Source ID**: `ce12e087-e701-4902-ae70-8ff582981d1b`
   - **Page ID**: `{{1.id}}`
   
   **Fields Section**:
   - **Slack Channel URL**:
     - **Key**: `Slack Channel URL`
     - **Value Type**: URL
     - **Value**: `{{3.url}}` or construct from `{{3.id}}`
   
   - **Linear Project URL**:
     - **Key**: `Linear Project URL`
     - **Value Type**: URL
     - **Value**: `{{8.data.projectCreate.project.url}}` (from GraphQL response)
   
   - **Linear Project ID** (Required - for easier updates later):
     - **Key**: `Linear Project ID`
     - **Value Type**: Text
     - **Value**: `{{8.data.projectCreate.project.id}}` (from GraphQL response)
     
     **Why store this?** This field is now part of the Notion Leads database schema. It makes it much easier to update the project later (Route 3) and reference it in other routes without parsing the URL.

### Step 6: Route 3 - Deposit Paid (Project Activation)

#### Module 3: Linear - Update Project Status (GraphQL Query)

**Important**: Linear's Make.com integration doesn't have a direct "Update Project" module. We'll use the GraphQL query module instead.

1. **Add Module**: Click "+" on Route 3 (Deposit Paid)
2. **Search for**: "Linear" → Select "Other" → "Execute a GraphQL Query"
3. **Configure Basic Settings**:
   - **Connection**: Select your Linear connection
   - **Method**: Select "POST (queries and mutations)"
   - **Query**: 
     ```graphql
     mutation ProjectUpdate($id: String!, $input: ProjectUpdateInput!) {
       projectUpdate(id: $id, input: $input) {
         success
         project {
           id
           name
           state
           url
         }
       }
     }
     ```

4. **Enable Advanced Settings**: Toggle "Advanced settings" to ON

5. **Configure Advanced Settings**:
   - **Operation name**: `ProjectUpdate`
   - **Variables data source**: Select "Form"
   - **Variables**: Click "+ Add item" to add two variables:
     
     **Item 1:**
     - **Key**: `id`
     - **Value**: `{{1.properties_value.Linear Project ID}}` (recommended - if stored in Notion)
       - **OR**: Extract from `{{1.properties_value.Linear Project URL}}` (requires parsing)
     
     **Item 2:**
     - **Key**: `input`
     - **Value**: 
       ```json
       {
         "state": "started"
       }
       ```

**Important Notes**:
- **Project ID**: 
  - **Recommended**: Store `Linear Project ID` in Notion during Module 8 (Route 2), then use: `{{1.properties_value.Linear Project ID}}`
  - **Alternative**: Parse the Linear Project URL to extract the project ID (more complex)
- **State Values**: Use lowercase: `"planned"`, `"started"`, `"paused"`, `"completed"`, or `"canceled"`
- **For "Active" status**: Use `"started"` (not "Active")
- **Value Field**: The `input` variable value should be a JSON object/string

**Alternative: Using Variables Data Source = JSON**

If "Form" mode doesn't work well, you can:
1. Set **Variables data source** to "JSON"
2. In the Variables field, provide:
   ```json
   {
     "id": "{{1.properties_value.Linear Project ID}}",
     "input": {
       "state": "started"
     }
   }
   ```

#### Module 4: Slack - Post Deposit Message

1. **Add Module**: Click "+" after Module 3
2. **Search for**: "Slack" → Select "Create a Message"
3. **Configure**:
   - **Connection**: Select your Slack connection
   - **Channel**: Extract channel ID from `{{1.properties_value.Slack Channel URL}}`
   - **Text**: 
     - Load from `templates/slack-deposit-received.md`
     - Replace variables:
       - `{{clientName}}` → `{{1.properties_value.Name[1].plain_text}}`
       - `{{projectName}}` → `{{1.properties_value.Project Name[1].plain_text}}`

#### Module 5: Update Notion Record (Status to In Progress)

1. **Add Module**: Click "+" after Module 4
2. **Search for**: "Notion" → Select "Update a Data Source Item"
3. **Configure**:
   - **Connection**: Select your Notion connection
   - **Update By**: Data Source
   - **Data Source ID**: `ce12e087-e701-4902-ae70-8ff582981d1b`
   - **Page ID**: `{{1.id}}`
   
   **Fields Section**:
   - **Status**:
     - **Key**: `Status`
     - **Value Type**: Select
     - **Value**: `In Progress`

### Step 7: Route 4 - Review (Client Instructions)

#### Module 3: Slack - Post Review Instructions

1. **Add Module**: Click "+" on Route 4 (Review)
2. **Search for**: "Slack" → Select "Create a Message"
3. **Configure**:
   - **Connection**: Select your Slack connection
   - **Channel**: Extract from `{{1.properties_value.Slack Channel URL}}`
   - **Text**: 
     - Load from `templates/slack-review-instructions.md`
     - Replace variables:
       - `{{clientName}}` → `{{1.properties_value.Name[1].plain_text}}`
       - `{{projectName}}` → `{{1.properties_value.Project Name[1].plain_text}}`

#### Module 4: Linear - Update Issues to Review (GraphQL Query)

**Important**: To update multiple issues, you'll need to use GraphQL queries. Linear doesn't support bulk updates through the standard Make.com modules.

**Option 1: Update Each Issue Individually (Simpler)**

For each issue created in Module 7, create a separate GraphQL query module:

1. **Add Module**: Click "+" after Module 3
2. **Search for**: "Linear" → Select "Other" → "Execute a GraphQL Query"
3. **Configure Basic Settings**:
   - **Connection**: Select your Linear connection
   - **Method**: Select "POST (queries and mutations)"
   - **Query**: 
     ```graphql
     mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
       issueUpdate(id: $id, input: $input) {
         success
         issue {
           id
           title
           state {
             name
           }
         }
       }
     }
     ```

4. **Enable Advanced Settings**: Toggle "Advanced settings" to ON

5. **Configure Advanced Settings**:
   - **Operation name**: `IssueUpdate`
   - **Variables data source**: Select "Form"
   - **Variables**: Click "+ Add item" to add two variables:
     
     **Item 1:**
     - **Key**: `id`
     - **Value**: `ISSUE_ID_FROM_MODULE_7` (the issue ID from when it was created)
     
     **Item 2:**
     - **Key**: `input`
     - **Value**: 
       ```json
       {
         "stateId": "REVIEW_STATE_ID"
       }
       ```

**Important Notes**:
- **Issue IDs**: You'll need the issue IDs from Module 7 (when issues were created). Consider storing them in Notion for easier reference.
- **State ID**: You'll need the Linear "Review" state ID. Find it by:
  - Querying Linear's workflow states via GraphQL
  - Or using Linear app: Cmd/Ctrl+K → Search for "Review" state → "Copy model UUID"
- **Repeat**: Repeat this module for each of the 6 issues created
- **Value Field**: The `input` variable value should be a JSON object/string

**Alternative: Using Variables Data Source = JSON**

If "Form" mode doesn't work well, you can:
1. Set **Variables data source** to "JSON"
2. In the Variables field, provide:
   ```json
   {
     "id": "ISSUE_ID_FROM_MODULE_7",
     "input": {
       "stateId": "REVIEW_STATE_ID"
     }
   }
   ```

**Option 2: Query Issues by Project, Then Update (More Complex)**

1. First, query all issues in the project:
   ```graphql
   query {
     project(id: "PROJECT_ID") {
       issues {
         nodes {
           id
           title
         }
       }
     }
   }
   ```

2. Then update each issue using the IDs from step 1

**Recommendation**: For simplicity, store issue IDs in Notion when creating them (Module 7), then reference them here. Alternatively, use Linear's webhook or polling to track issue creation.

### Step 8: Route 5 - Project Completion (Final Handover)

#### Module 3: Slack - Post Handover Message

1. **Add Module**: Click "+" on Route 5 (Project Completion)
2. **Search for**: "Slack" → Select "Create a Message"
3. **Configure**:
   - **Connection**: Select your Slack connection
   - **Channel**: Extract from `{{1.properties_value.Slack Channel URL}}`
   - **Text**: 
     - Load from `templates/slack-handover-message.md`
     - Replace variables:
       - `{{clientName}}` → `{{1.properties_value.Name[1].plain_text}}`
       - `{{projectName}}` → `{{1.properties_value.Project Name[1].plain_text}}`
       - `{{companyName}}` → `{{1.properties_value.Company[1].plain_text}}`
       - `{{completionDate}}` → Use current date or `{{1.properties_value.Start Date}}` (or create a date field for completion)

**Template Variables**: See `templates/slack-handover-message.md` for full template

**Note**: The `{{completionDate}}` variable can be:
- Set to current date using Make.com's date functions
- Or use a Notion field if you track completion dates
- Or simply use today's date: `{{formatDate(now(); "MMMM DD, YYYY")}}`

#### Module 4: Update Notion Record (Archive/Complete)

1. **Add Module**: Click "+" after Module 3
2. **Search for**: "Notion" → Select "Update a Data Source Item"
3. **Configure**:
   - **Connection**: Select your Notion connection
   - **Update By**: Data Source
   - **Data Source ID**: `ce12e087-e701-4902-ae70-8ff582981d1b`
   - **Page ID**: `{{1.id}}`
   
   **Fields Section**:
   - Add any final status updates or archive flags as needed

**Note**: Future enhancement - Generate final invoice via HTTP module.

## Property Mapping Reference

### Rich Text Properties (Arrays)
- **Name**: `{{1.properties_value.Name[1].plain_text}}`
- **Company**: `{{1.properties_value.Company[1].plain_text}}`
- **Project Name**: `{{1.properties_value.Project Name[1].plain_text}}`
- **Scope Summary**: `{{1.properties_value.Scope Summary[1].plain_text}}`
- **Message**: `{{1.properties_value.Message[1].plain_text}}`

### Select Properties (Use .name)
- **Status**: `{{1.properties_value.Status.name}}`
- **Service**: `{{1.properties_value.Service.name}}`
- **Payment Terms**: `{{1.properties_value.Payment Terms.name}}`
- **Timeline**: `{{1.properties_value.Timeline.name}}`
- **BudgetRange**: `{{1.properties_value.BudgetRange.name}}`

### Direct Properties (No Array, No .name)
- **Email**: `{{1.properties_value.Email}}`
- **Phone**: `{{1.properties_value.Phone}}`
- **Fee**: `{{1.properties_value.Fee}}` (number, no quotes)

### Date Properties
- **Start Date**: `{{1.properties_value.Start Date}}`

### URL Properties
- **Slack Channel URL**: `{{1.properties_value.Slack Channel URL}}`
- **Linear Project URL**: `{{1.properties_value.Linear Project URL}}`
- **Contract URL**: `{{1.properties_value.Contract URL}}`

### ID Properties (Text Fields)
- **Linear Project ID**: `{{1.properties_value.Linear Project ID}}` (stored when project is created, used for GraphQL updates)

## Module Flow Summary

```
Module 1: Notion Watch Data Source Items (Trigger)
    ↓
Module 2 (Router): Router
    ├─→ Route 1: Discovery Completed
    │   ├─→ Module 3: HTTP Request (Generate Contract)
    │   └─→ Module 4: Update Notion (Contract URL)
    │
    ├─→ Route 2: Contract Signed (CRITICAL)
    │   ├─→ Module 3: Slack Create Channel
    │   ├─→ Module 4: Slack Invite Users
    │   ├─→ Module 5: Slack Post Welcome Message
    │   ├─→ Module 6: Linear Create Project (GraphQL)
    │   ├─→ Module 7: Linear Create Issues (6 issues)
    │   └─→ Module 8: Update Notion (Slack URL, Linear URL)
    │
    ├─→ Route 3: Deposit Paid
    │   ├─→ Module 3: Linear Update Project (GraphQL - Active)
    │   ├─→ Module 4: Slack Post Deposit Message
    │   └─→ Module 5: Update Notion (Status: In Progress)
    │
    ├─→ Route 4: Review
    │   ├─→ Module 3: Slack Post Review Instructions
    │   └─→ Module 4: Linear Update Issues (GraphQL - Review)
    │
    └─→ Route 5: Project Completion
        ├─→ Module 3: Slack Post Handover Message
        └─→ Module 4: Update Notion (Archive)
```

## Important Notes

1. **Scenario Independence**:
   - This scenario is completely separate from the Gmail Draft Automation
   - Both scenarios can run simultaneously without conflicts
   - Each scenario filters different status values in the router

2. **Notion Integration Access**:
   - **CRITICAL**: Leads database MUST be shared with your Notion integration
   - Contracts parent page (if used) must also be shared
   - Integration type can be "Internal" (doesn't need to be "Public")

3. **Slack Channel Naming**:
   - Channels must be unique
   - Use sanitization to avoid conflicts
   - Consider appending timestamp if duplicates are possible

4. **Linear Project Setup**:
   - Verify team ID is correct
   - Ensure API key has permissions to create projects
   - Project status "Planned" will be changed to "Active" when deposit is paid

5. **Error Handling**:
   - Add error handlers to critical modules
   - Log errors but don't fail entire scenario
   - Consider retry logic for API calls

## Troubleshooting

### "Method Not Allowed" Error

**Symptoms**: HTTP module returns "Method Not Allowed" error

**Common Causes**:
1. **HTTP Method is GET instead of POST**
   - **Fix**: In HTTP module, ensure "Method" dropdown is set to "POST", not "GET"
   - The contract generation API only accepts POST requests

2. **Empty Body Content** (all fields are empty strings)
   - **Cause**: Property mappings are incorrect (missing `[1]` index, wrong syntax)
   - **Fix**: Verify all property mappings use correct syntax:
     - ✅ `{{1.properties_value.Name[1].plain_text}}` (with `[1]`)
     - ❌ `{{1.properties_value.Name[].plain_text}}` (missing index)
     - ❌ `{{1.properties_value.`Project Name`[1].plain_text}}` (no backticks)

3. **Property Names with Spaces**
   - **Correct**: `{{1.properties_value.Project Name[1].plain_text}}` (space, no backticks)
   - **Wrong**: `{{1.properties_value.`Project Name`[1].plain_text}}` (backticks)
   - **Wrong**: `{{1.properties_value.ProjectName[1].plain_text}}` (no space if property has space)

**Diagnostic Steps**:
1. Check HTTP module execution output - look at "Body content" to see if values are empty
2. Verify property names match Notion database exactly (case-sensitive, including spaces)
3. Ensure all rich text properties use `[1].plain_text`
4. Ensure Fee is a number (no quotes): `{{1.properties_value.Fee}}` not `"{{1.properties_value.Fee}}"`

### Contract Not Generated
- Check API endpoint is accessible
- Verify all required fields in Notion (Project Name, Fee, Payment Terms, etc.)
- Check Make.com execution logs for HTTP module errors
- Ensure NOTION_API_KEY is configured on server
- **If body content is empty**: See "Method Not Allowed" troubleshooting above

### Slack Channel Not Created
- Verify Slack bot token is valid
- Check channel name sanitization (no special chars, spaces become hyphens)
- Ensure bot has `channels:write` permission
- Check for duplicate channel names

### Linear Project Not Created
- Verify Linear API key is valid
- Check team ID is correct (use Cmd/Ctrl+K in Linear app → "Copy model UUID")
- Ensure GraphQL query syntax is correct
- Verify mutation variables are properly formatted (JSON)
- Check GraphQL response for error messages
- Verify project name is valid (no special characters)
- **Common Issue**: Team ID must be in array format: `["team-id"]` not `"team-id"`

### Property Mapping Issues
- **Empty values**: Check array indexing (`[1]` not `[0]`)
- **Wrong values**: Verify property names match Notion database exactly
- **Type errors**: Ensure correct value types (text vs select vs number)

### GraphQL Query Issues
- **"Field not found"**: Verify GraphQL mutation syntax matches Linear API schema
- **"Invalid input"**: Check variable types (strings in quotes, arrays in brackets)
- **"Team not found"**: Verify team ID is correct and in array format: `["team-id"]`
- **"State invalid"**: Use lowercase state values: `"planned"`, `"started"`, not `"Planned"` or `"Active"`
- **Response structure**: Access project data via `{{module.data.projectCreate.project.id}}` not `{{module.id}}`

### URL Extraction Issues
- Slack/Linear URLs may need parsing to extract IDs
- Store IDs separately in Notion if URL parsing is complex
- Use Make.com's text functions to extract IDs from URLs

## Testing Checklist

### Phase 1: Discovery Completed
- [ ] Status → "Discovery Completed"
- [ ] Contract generated successfully
- [ ] Notion page created with contract content
- [ ] Contract URL stored in Notion

### Phase 2: Contract Signed
- [ ] Status → "Contract Signed"
- [ ] Slack channel created with correct name
- [ ] Client invited to Slack
- [ ] Welcome message posted
- [ ] Linear project created
- [ ] All 6 issues created
- [ ] URLs stored in Notion

### Phase 3: Deposit Paid
- [ ] Status → "Deposit Paid"
- [ ] Linear project activated
- [ ] Slack message posted
- [ ] Notion status → "In Progress"

### Phase 4: Review
- [ ] Status → "Review"
- [ ] Review instructions posted
- [ ] Linear issues moved to Review

### Phase 5: Completion
- [ ] Status → "Project Completion"
- [ ] Handover message posted
- [ ] Notion record updated

## Environment Variables

```bash
# Notion
NOTION_API_KEY=
NOTION_LEADS_DATABASE_ID=91ba6dd0506a49e4b7f7706db990d872
NOTION_CONTRACTS_PARENT_PAGE_ID=2ee13f3ae6f3816f92f5e797392ec4bc

# Slack
SLACK_BOT_TOKEN=
SLACK_TEAM_ID=

# Linear
LINEAR_API_KEY=
LINEAR_TEAM_ID=
```

## Best Practices

1. **Test Each Route Independently**: Don't test all routes at once
2. **Monitor Execution History**: Check Make.com logs for each module
3. **Verify Notion Fields**: Ensure all required fields are populated before testing
4. **Sanitize Channel Names**: Prevent conflicts and errors
5. **Store IDs Separately**: Consider storing Slack/Linear IDs in Notion for easier access
6. **Add Error Handlers**: Prevent scenario failures from breaking workflow
7. **Document Manual Steps**: Note any steps that require manual intervention

## Related Documentation

- **Overview**: See [Full Client Journey Automation Overview](../FULL_CLIENT_JOURNEY_AUTOMATION.md)
- **Gmail Draft Automation**: See [Gmail Draft Automation Guide](01-gmail-draft-automation.md)
- **Quick Reference**: See [Quick Reference Guide](../QUICK_REFERENCE.md)
