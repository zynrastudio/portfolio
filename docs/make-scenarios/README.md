# Make.com Scenario Guides

This directory contains detailed step-by-step guides for setting up Make.com automation scenarios.

## Available Scenarios

### 1. Gmail Draft Automation
**File**: [01-gmail-draft-automation.md](01-gmail-draft-automation.md)

**Purpose**: Handles initial lead qualification by creating Gmail drafts when leads are marked as Qualified or Unqualified.

**Status Handled**:
- `Qualified` → Generate welcome email draft
- `Unqualified` → Generate rejection email draft

**Key Features**:
- Uses custom API endpoints (no paid Code modules needed)
- Hardcoded template IDs for reliability
- Automatic Notion record updates

**When to Use**: Set up this scenario first for basic lead qualification workflow.

### 2. Full Client Journey Automation
**File**: [02-full-client-journey-automation.md](02-full-client-journey-automation.md)

**Purpose**: Handles the complete client lifecycle from discovery call through project completion.

**Status Handled**:
- `Discovery Completed` → Generate contract and create Notion page
- `Contract Signed` → Create Slack channel + Linear project (CRITICAL TRIGGER)
- `Deposit Paid` → Activate project and post Slack message
- `Review` → Post review instructions
- `Project Completion` → Final handover

**Key Features**:
- Contract generation with Notion page creation
- Automated Slack channel setup with client invites
- Linear project creation with placeholder issues
- Project lifecycle management

**When to Use**: Set up this scenario after Gmail Draft Automation is working. This handles the full project lifecycle.

## Scenario Independence

**Important**: These scenarios are completely independent:

- ✅ Both use the same Notion Watch trigger
- ✅ Each scenario filters different status values in the router
- ✅ They can run simultaneously without conflicts
- ✅ Updating one scenario won't affect the other
- ✅ Each scenario has its own module numbering

## Scenario Comparison

| Feature | Gmail Draft Automation | Full Client Journey |
|---------|----------------------|---------------------|
| **Trigger** | Notion Watch (same) | Notion Watch (same) |
| **Router Filters** | Qualified, Unqualified | Discovery Completed, Contract Signed, Deposit Paid, Review, Project Completion |
| **Modules** | 5 modules | 8+ modules (varies by route) |
| **Integrations** | Notion, Gmail | Notion, Slack, Linear |
| **Complexity** | Simple | Complex |
| **Setup Time** | ~30 minutes | ~2-3 hours |

## Setup Order

1. **First**: Set up [Gmail Draft Automation](01-gmail-draft-automation.md)
   - Test with Qualified/Unqualified status changes
   - Verify email drafts are created correctly
   - Ensure Notion records update properly

2. **Second**: Set up [Full Client Journey Automation](02-full-client-journey-automation.md)
   - Start with Discovery Completed route
   - Then Contract Signed route (most complex)
   - Test each route independently
   - Finally add Deposit Paid, Review, and Completion routes

## Prerequisites

### Common to Both Scenarios
- Notion connection in Make.com
- Leads database shared with Notion integration
- API endpoints deployed and accessible

### Gmail Draft Automation Only
- Google Email connection in Make.com
- Email Templates database shared with Notion integration

### Full Client Journey Only
- Slack connection in Make.com
- Linear connection in Make.com
- Slack bot token and team ID
- Linear API key and team ID

## Quick Links

- **Gmail Draft Automation Guide**: [01-gmail-draft-automation.md](01-gmail-draft-automation.md)
- **Full Client Journey Guide**: [02-full-client-journey-automation.md](02-full-client-journey-automation.md)
- **Overview Document**: [../FULL_CLIENT_JOURNEY_AUTOMATION.md](../FULL_CLIENT_JOURNEY_AUTOMATION.md)
- **Quick Reference**: [../QUICK_REFERENCE.md](../QUICK_REFERENCE.md)
- **Troubleshooting**: [../DEBUGGING_EMPTY_DRAFTS.md](../DEBUGGING_EMPTY_DRAFTS.md)

## Troubleshooting

If you encounter issues:

1. **Check Scenario Execution**: Review Make.com execution history
2. **Verify Router Filters**: Ensure status values match exactly (case-sensitive)
3. **Test API Endpoints**: Use test scripts to verify APIs work independently
4. **Check Notion Integration**: Ensure databases are shared with integration
5. **Review Property Mappings**: Verify array indexing (`[1]` not `[0]`) and property paths

For detailed troubleshooting, see the individual scenario guides.

## Best Practices

1. **Test Independently**: Test each scenario separately before running both
2. **Monitor Execution History**: Check Make.com logs regularly
3. **Verify Notion Fields**: Ensure all required fields are populated
4. **Start Simple**: Get Gmail Draft Automation working first
5. **Add Routes Gradually**: Build Full Client Journey route by route
6. **Document Changes**: Note any customizations or manual steps

## Support

For issues or questions:
- Check individual scenario guides for detailed troubleshooting
- Review Make.com execution history for error details
- Verify API endpoints are accessible
- Consult [Quick Reference Guide](../QUICK_REFERENCE.md) for IDs and endpoints
