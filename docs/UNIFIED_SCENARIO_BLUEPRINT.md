# Unified Make.com Scenario Blueprint

This document provides a complete reference for the unified client journey automation scenario in Make.com.

## Scenario Overview

**Name**: Unified Client Journey Automation
**Type**: Instant Webhook Trigger
**Database**: Notion Leads Database
**Routes**: 7 (covering all status transitions)

## Complete Module Structure

### Module 1: Notion Instant Trigger

```
Module Type: Notion - Watch Database Items (Instant)
Connection: [Your Notion Connection]
Database/Data Source ID: ce12e087-e701-4902-ae70-8ff582981d1b
Trigger Mode: Instant (Webhook)
Limit: 1
```

**Output Variables:**
- `{{1.id}}` - Page ID
- `{{1.properties_value.Status}}` - Status property
- `{{1.properties_value.Name[1].plain_text}}` - Client name
- `{{1.properties_value.Email}}` - Email
- `{{1.properties_value.Company[1].plain_text}}` - Company
- All other properties accessible via `{{1.properties_value.*}}`

---

### Module 2: Router

```
Module Type: Flow Control - Router
Routes: 7 (see below)
```

---

## Route 1: Qualified → Welcome Email

### Filter Configuration
```
Label: Qualified → Welcome Email
Condition: 1. Properties Value: Status = "Qualified"
Fallback: No
```

### Module 3A: HTTP - Generate Welcome Email
```
Method: POST
URL: https://zynra.studio/api/generate-welcome-email
Headers:
  - Content-Type: application/json
Body Type: Raw
Content Type: JSON
Body:
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

### Module 4A: Email - Create Draft
```
Module Type: Google Email - Create a Draft
Connection: [Your Email Connection]
Folder: / Drafts
To: {{1.properties_value.Email}}
Subject: {{3.Body.subject}}
Content Type: HTML
Content: {{3.Body.html}}
```

### Module 5A: Notion - Update Record
```
Module Type: Notion - Update a Data Source Item
Connection: [Your Notion Connection]
Update By: Data Source
Data Source ID: ce12e087-e701-4902-ae70-8ff582981d1b
Page ID: {{1.id}}
Fields:
  - Email Draft Created: true (Checkbox)
  - Draft Email ID: {{4.id}} (Text)
```

---

## Route 2: Unqualified → Rejection Email

### Filter Configuration
```
Label: Unqualified → Rejection Email
Condition: 1. Properties Value: Status = "Unqualified"
Fallback: No
```

### Module 3B: HTTP - Generate Rejection Email
```
Method: POST
URL: https://zynra.studio/api/generate-rejection-email
Headers:
  - Content-Type: application/json
Body Type: Raw
Content Type: JSON
Body:
{
  "templatePageId": "2ee13f3ae6f381cca68ae4b059d8eda5",
  "leadData": {
    "name": "{{1.properties_value.Name[1].plain_text}}",
    "email": "{{1.properties_value.Email}}",
    "rejectionReason": "{{1.properties_value.Rejection Reason[1].plain_text}}"
  }
}
```

### Module 4B: Email - Create Draft
```
Module Type: Google Email - Create a Draft
Connection: [Your Email Connection]
Folder: / Drafts
To: {{1.properties_value.Email}}
Subject: {{3.Body.subject}}
Content Type: HTML
Content: {{3.Body.html}}
```

### Module 5B: Notion - Update Record
```
Module Type: Notion - Update a Data Source Item
Connection: [Your Notion Connection]
Update By: Data Source
Data Source ID: ce12e087-e701-4902-ae70-8ff582981d1b
Page ID: {{1.id}}
Fields:
  - Email Draft Created: true (Checkbox)
  - Draft Email ID: {{4.id}} (Text)
```

---

## Route 3: Discovery Completed → Generate Contract

### Filter Configuration
```
Label: Discovery Completed → Generate Contract
Condition: 1. Properties Value: Status = "Discovery Completed"
Fallback: No
```

### Module 3C: HTTP - Generate Contract
```
Method: POST
URL: https://zynra.studio/api/generate-contract
Headers:
  - Content-Type: application/json
Body Type: Raw
Content Type: JSON
Body:
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

### Module 4C: Notion - Update Record
```
Module Type: Notion - Update a Data Source Item
Connection: [Your Notion Connection]
Update By: Data Source
Data Source ID: ce12e087-e701-4902-ae70-8ff582981d1b
Page ID: {{1.id}}
Fields:
  - Contract URL: {{3.Body.url}} (URL)
```

---

## Route 4: Contract Signed → Slack + Linear

### Filter Configuration
```
Label: Contract Signed → Slack + Linear
Condition: 1. Properties Value: Status = "Contract Signed"
Fallback: No
```

### Module 3D: Slack - Create Channel
```
Module Type: Slack - Create a Channel
Connection: [Your Slack Connection]
Channel Name: {{replace(replace(lower(1.properties_value.Project Name[1].plain_text); " "; "-"); "[^a-z0-9-]"; "")}}
Is Private: No
Topic: Project: {{1.properties_value.Project Name[1].plain_text}}
```

### Module 4D: Slack - Invite Users
```
Module Type: Slack - Invite Users to Channel
Connection: [Your Slack Connection]
Channel: {{3.id}}
Users: [Add team member user IDs]
```

### Module 5D: Slack - Post Welcome Message
```
Module Type: Slack - Create a Message
Connection: [Your Slack Connection]
Channel: {{3.id}}
Text: [Load from templates/slack-welcome-message.md with variables replaced]
```

### Module 6D: Linear - Create Project (GraphQL)
```
Module Type: Linear - Execute a GraphQL Query
Connection: [Your Linear Connection]
Method: POST (queries and mutations)
Advanced Settings: ON
Operation Name: ProjectCreate
Variables Data Source: JSON
Variables:
{
  "input": {
    "name": "{{1.properties_value.Project Name[1].plain_text}}",
    "teamIds": ["YOUR_LINEAR_TEAM_ID"],
    "description": "Project for {{1.properties_value.Name[1].plain_text}}",
    "state": "planned"
  }
}
Query:
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

### Module 7D-12D: Linear - Create Issues (6 issues)
```
Repeat 6 times for each issue:
- Kickoff & Onboarding
- Discovery Recap
- Milestone 1
- Milestone 2
- QA & Review
- Handover

Module Type: Linear - Create an Issue
Connection: [Your Linear Connection]
Team: [Your Linear Team ID]
Project: {{6.data.projectCreate.project.id}}
Title: [Issue Title]
Description: [Issue Description]
```

### Module 13D: Notion - Update Record
```
Module Type: Notion - Update a Data Source Item
Connection: [Your Notion Connection]
Update By: Data Source
Data Source ID: ce12e087-e701-4902-ae70-8ff582981d1b
Page ID: {{1.id}}
Fields:
  - Slack Channel URL: {{3.url}} (URL)
  - Linear Project URL: {{6.data.projectCreate.project.url}} (URL)
  - Linear Project ID: {{6.data.projectCreate.project.id}} (Text)
```

---

## Route 5: Deposit Paid → Activate Project

### Filter Configuration
```
Label: Deposit Paid → Activate Project
Condition: 1. Properties Value: Status = "Deposit Paid"
Fallback: No
```

### Module 3E: Linear - Update Project (GraphQL)
```
Module Type: Linear - Execute a GraphQL Query
Connection: [Your Linear Connection]
Method: POST (queries and mutations)
Advanced Settings: ON
Operation Name: ProjectUpdate
Variables Data Source: JSON
Variables:
{
  "id": "{{1.properties_value.Linear Project ID}}",
  "input": {
    "state": "started"
  }
}
Query:
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

### Module 4E: Slack - Post Deposit Message
```
Module Type: Slack - Create a Message
Connection: [Your Slack Connection]
Channel: [Extract from {{1.properties_value.Slack Channel URL}}]
Text: [Load from templates/slack-deposit-received.md with variables]
```

### Module 5E: Notion - Update Record
```
Module Type: Notion - Update a Data Source Item
Connection: [Your Notion Connection]
Update By: Data Source
Data Source ID: ce12e087-e701-4902-ae70-8ff582981d1b
Page ID: {{1.id}}
Fields:
  - Status: In Progress (Select)
```

---

## Route 6: Review → Instructions

### Filter Configuration
```
Label: Review → Post Instructions
Condition: 1. Properties Value: Status = "Review"
Fallback: No
```

### Module 3F: Slack - Post Review Instructions
```
Module Type: Slack - Create a Message
Connection: [Your Slack Connection]
Channel: [Extract from {{1.properties_value.Slack Channel URL}}]
Text: [Load from templates/slack-review-instructions.md with variables]
```

### Module 4F: Linear - Update Issues (GraphQL)
```
Module Type: Linear - Execute a GraphQL Query
[Repeat for each issue or query all issues first]
Connection: [Your Linear Connection]
Method: POST (queries and mutations)
Advanced Settings: ON
Operation Name: IssueUpdate
Variables Data Source: JSON
Variables:
{
  "id": "[Issue ID]",
  "input": {
    "stateId": "[Review State ID]"
  }
}
Query:
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

---

## Route 7: Project Completion → Handover

### Filter Configuration
```
Label: Project Completion → Final Handover
Condition: 1. Properties Value: Status = "Project Completion"
Fallback: No
```

### Module 3G: Slack - Post Handover Message
```
Module Type: Slack - Create a Message
Connection: [Your Slack Connection]
Channel: [Extract from {{1.properties_value.Slack Channel URL}}]
Text: [Load from templates/slack-handover-message.md with variables]
Variables:
  - {{clientName}}: {{1.properties_value.Name[1].plain_text}}
  - {{projectName}}: {{1.properties_value.Project Name[1].plain_text}}
  - {{companyName}}: {{1.properties_value.Company[1].plain_text}}
  - {{completionDate}}: {{formatDate(now(); "MMMM DD, YYYY")}}
```

### Module 4G: Notion - Update Record
```
Module Type: Notion - Update a Data Source Item
Connection: [Your Notion Connection]
Update By: Data Source
Data Source ID: ce12e087-e701-4902-ae70-8ff582981d1b
Page ID: {{1.id}}
Fields:
  - [Any final status updates or archive flags]
```

---

## Property Mapping Reference

### Rich Text Properties (Use [1].plain_text)
```
{{1.properties_value.Name[1].plain_text}}
{{1.properties_value.Company[1].plain_text}}
{{1.properties_value.Project Name[1].plain_text}}
{{1.properties_value.Scope Summary[1].plain_text}}
{{1.properties_value.Message[1].plain_text}}
{{1.properties_value.Rejection Reason[1].plain_text}}
```

### Select Properties (Use .name)
```
{{1.properties_value.Status.name}}
{{1.properties_value.Service.name}}
{{1.properties_value.Payment Terms.name}}
{{1.properties_value.Timeline.name}}
{{1.properties_value.BudgetRange.name}}
```

### Direct Access Properties
```
{{1.properties_value.Email}}
{{1.properties_value.Phone}}
{{1.properties_value.Fee}}
{{1.properties_value.Start Date}}
{{1.properties_value.Slack Channel URL}}
{{1.properties_value.Linear Project URL}}
{{1.properties_value.Linear Project ID}}
{{1.properties_value.Contract URL}}
```

---

## Testing Checklist

### Pre-Flight Checks
- [ ] All 3 API endpoints are deployed and working
- [ ] Notion integration has access to Leads & Email Templates databases
- [ ] Slack bot token configured with correct permissions
- [ ] Linear API key configured with correct team ID
- [ ] All template files exist and have correct variables

### Route Testing Order
1. [ ] Route 3: Discovery Completed (simplest, tests HTTP + Notion)
2. [ ] Route 1: Qualified (tests email draft creation)
3. [ ] Route 2: Unqualified (tests email draft creation)
4. [ ] Route 4: Contract Signed (most complex, tests Slack + Linear)
5. [ ] Route 5: Deposit Paid (tests Linear GraphQL updates)
6. [ ] Route 6: Review (tests issue updates)
7. [ ] Route 7: Project Completion (tests final handover)

### Per-Route Test Steps
1. Turn ON scenario in Make.com
2. Change lead status in Notion to test status
3. Verify webhook triggers within 1-2 seconds
4. Check Make.com execution history for success
5. Verify Notion fields updated correctly
6. Check Slack/Linear/Email as applicable

---

## Common Issues & Solutions

### Issue: Webhook not triggering
**Solution**: Re-save Module 1 to re-register webhook

### Issue: Route not executing
**Solution**: Check router filter condition spelling/capitalization

### Issue: Property mapping empty
**Solution**: Verify array indexing [1] and .plain_text/.name

### Issue: GraphQL mutation fails
**Solution**: Check variable types and format (JSON string)

### Issue: Slack channel not created
**Solution**: Verify bot permissions and channel name sanitization

---

## Maintenance Notes

### Monthly Tasks
- Review execution history for failures
- Update templates as needed
- Audit Notion database for data quality
- Check operation usage (should be lower than polling)

### When Adding New Status
1. Add new route to Router (Module 2)
2. Configure filter condition
3. Add necessary modules for new route
4. Test independently
5. Update this blueprint

---

## Related Documentation

- [Notion Webhook Setup Guide](NOTION_WEBHOOK_SETUP.md)
- [Gmail Draft Automation](make-scenarios/01-gmail-draft-automation.md)
- [Full Client Journey Automation](make-scenarios/02-full-client-journey-automation.md)
- [Quick Reference](QUICK_REFERENCE.md)
