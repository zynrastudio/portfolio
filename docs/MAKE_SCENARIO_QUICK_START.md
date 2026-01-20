# Make.com Scenario Quick Start Guide

## Prerequisites Checklist

- [ ] Notion connection configured in Make.com
- [ ] Google Email connection configured in Make.com
- [ ] Leads Database ID: `91ba6dd0506a49e4b7f7706db990d872`
- [ ] Email Templates Database ID: `b98e9d2eeeb44444bf58a71f62f95f3b`
- [ ] API endpoints deployed (already done):
  - Welcome: `https://zynra.studio/api/generate-welcome-email`
  - Rejection: `https://zynra.studio/api/generate-rejection-email`

## Quick Setup Steps

### 1. Create Scenario

1. Go to Make.com → Create a new scenario
2. Name: "Notion Lead Status → Gmail Draft Automation"

### 2. Add Trigger Module

**Module 1: Notion Watch Data Source Items**
- App: Notion
- Module: **Watch Data Source Items** (NOT "Watch Objects")
  - ✅ Choose: "Watch Data Source Items" (DATA SOURCE / DATABASE ITEM)
  - ❌ Don't choose: "Watch Objects" (too broad, triggers on database-level changes)
  - ❌ Don't choose: "Watch Page Contents" (triggers on content, not properties)
- Connection: [Select your Notion connection]
- Data Source ID: `ce12e087-e701-4902-ae70-8ff582981d1b`
- Limit: 2

**Why?** You need to watch individual database items (lead records) for property changes (like Status updates), not the entire database or page content.

### 3. Add Router

**Module 2: Router**
- App: Flow Control
- Module: Router

**Route 1 Setup (Qualified → Welcome Email):**
- Click on Route 1 path
- Label: `Qualified → Welcome Email`
- Fallback: No
- Condition:
  - Field: `1. Properties Value: Status`
  - Operator: `Equal to` (Text operators)
  - Value: `Qualified`
- Click Save

**Route 2 Setup (Unqualified → Rejection Email):**
- Click on Route 2 path
- Label: `Unqualified → Rejection Email`
- Fallback: No
- Condition:
  - Field: `1. Properties Value: Status`
  - Operator: `Equal to` (Text operators)
  - Value: `Unqualified`
- Click Save

### 4. Qualified Path (Route 1)

**Module 3: Get Welcome Template**
- App: Notion
- Module: Search Objects
- Connection: [Your Notion connection]
- Search Objects: Data Source Items
- Data Source ID: `ac3ca188-2c71-4c83-85ea-7392d7fbe8ec`
- Filter: Type = "Welcome"
- Limit: 1

**Module 4: Generate Welcome Email HTML (HTTP Module)**
- App: Tools
- Module: Make an HTTP Request
- Method: POST
- URL: `https://zynra.studio/api/generate-welcome-email`
- Headers: `Content-Type: application/json`
- Body (JSON):
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
- **Output**: `Body.html`, `Body.subject`, `Body.success`

**Module 5: Create Gmail Draft**
- App: Google Email or Email
- Module: Create a Draft
- Connection: Your email connection (e.g., "privateemail")
- Folder: `/ Drafts`
- To: `{{1.properties.Email.email}}` (or `{{1.properties.Email.rich_text[0].plain_text}}`)
- **Subject**: 
  - ✅ **Map**: `{{4.Body.subject}}` (from HTTP module)
  - ❌ **DO NOT** map `{{4.Body}}` (entire object)
  - **How**: Expand HTTP module output → Select `Body.subject`
- **Content Type**: HTML
- **Content (Body)**: 
  - ✅ **Map**: `{{4.Body.html}}` (from HTTP module)
  - ❌ **DO NOT** map `{{4.Body}}` (entire object)
  - **How**: Expand HTTP module output → Select `Body.html`

### 5. Unqualified Path (Route 2)

**Module 7: Get Rejection Template**
- App: Notion
- Module: Search Objects
- Search Objects: Data Source Items
- Data Source ID: `ac3ca188-2c71-4c83-85ea-7392d7fbe8ec`
- Filter: Type = "Rejection"
- Limit: 1

**Module 8: Get Template HTML**
- App: Notion
- Module: List Page Contents
- Page ID: `{{7.id}}`
- Use Code module to parse and concatenate HTML code blocks

**Module 9: Generate Email HTML**
- App: Tools
- Module: Code
- Language: JavaScript
- See code in `docs/make-scenarios/01-gmail-draft-automation.md` (Module 4B)

**Module 10: Create Gmail Draft**
- App: Google Email
- Module: Create a Draft
- To: `{{1.Email}}`
- Subject: `{{9.emailSubject}}`
- Body: `{{9.emailHtml}}`
- Format: HTML

### 6. Update Notion Record

**Important**: The Router creates two separate paths that do NOT converge. Add the Update module to BOTH paths.

**For Qualified Path (after Module 6/Email 9):**
- App: Notion
- Module: Update a Data Source Item
- Update By: Data Source
- Data Source ID: `ce12e087-e701-4902-ae70-8ff582981d1b`
- Page ID: `{{1.id}}` or `1. Database Item ID`
- **Fields** (Click to expand, then Add Item):
  - **Field 1:**
    - Key: `Email Draft Created`
    - Value Type: `Checkbox`
    - Value: `true`
  - **Field 2:**
    - Key: `Draft Email ID`
    - Value Type: `Text`
    - Value: `{{9.id}}` or `9. ID` (from Email 9)

**For Unqualified Path (after Module 10/Email 14):**
- App: Notion
- Module: Update a Data Source Item
- Update By: Data Source
- Data Source ID: `ce12e087-e701-4902-ae70-8ff582981d1b`
- Page ID: `{{1.id}}` or `1. Database Item ID`
- **Fields** (Click to expand, then Add Item):
  - **Field 1:**
    - Key: `Email Draft Created`
    - Value Type: `Checkbox`
    - Value: `true`
  - **Field 2:**
    - Key: `Draft Email ID`
    - Value Type: `Text`
    - Value: `{{14.id}}` or `14. ID` (from Email 14)

## Important: Using API Endpoints Instead of Code Modules

**Why API Endpoints?** Make.com's Code modules require a paid plan. Our custom API endpoints handle all template processing for free.

**How it works:**
1. **HTTP Module** (Module 4/8): Sends template page ID and lead data to your API endpoint
2. **API Endpoint** (on your server): 
   - Fetches template from Notion
   - Parses HTML from code blocks automatically
   - Replaces all template variables
   - Returns final HTML and subject
3. **Email Module** (Module 5/9): Uses `Body.html` and `Body.subject` directly from HTTP response

**Benefits:**
- ✅ Works with Make.com's free plan
- ✅ No Code modules needed
- ✅ All processing happens on your server
- ✅ Easier to maintain and debug

See `docs/make-scenarios/01-gmail-draft-automation.md` for detailed HTTP module configuration.

## Testing

1. Update a lead in Notion to "Qualified" → Check Gmail drafts
2. Update a lead in Notion to "Unqualified" → Check Gmail drafts
3. Verify Notion record is updated with draft status
