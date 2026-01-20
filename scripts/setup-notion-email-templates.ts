/**
 * Script to create Email Templates database in Notion
 * Run this script to set up the database structure for email templates
 * 
 * Usage: npx tsx scripts/setup-notion-email-templates.ts
 */

import { Client } from "@notionhq/client"
import type { CreateDatabaseParameters } from "@notionhq/client/build/src/api-endpoints"

if (!process.env.NOTION_API_KEY) {
  throw new Error("NOTION_API_KEY environment variable is required")
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

/**
 * Creates the Email Templates database in Notion
 * This should be created in the same workspace as the Leads database
 */
async function createEmailTemplatesDatabase() {
  try {
    // You'll need to provide the parent page ID where the database should be created
    // This should be in the same workspace as your Leads database
    const parentPageId = process.env.NOTION_WORKSPACE_PAGE_ID

    if (!parentPageId) {
      console.error("NOTION_WORKSPACE_PAGE_ID environment variable is required")
      console.log("\nTo find your workspace page ID:")
      console.log("1. Open Notion and navigate to the page where you want to create the database")
      console.log("2. Click 'Share' → 'Copy link'")
      console.log("3. The page ID is the long string in the URL (between the workspace name and the page title)")
      console.log("4. Add it to your .env.local as NOTION_WORKSPACE_PAGE_ID")
      process.exit(1)
    }

    const response = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: parentPageId,
      },
      title: [
        {
          type: "text",
          text: {
            content: "Email Templates",
          },
        },
      ],
      properties: {
        Name: {
          title: {},
        },
        Type: {
          select: {
            options: [
              { name: "Welcome", color: "blue" },
              { name: "Rejection", color: "red" },
            ],
          },
        },
        Subject: {
          rich_text: {},
        },
        "HTML Template": {
          rich_text: {},
        },
        "Plain Text Template": {
          rich_text: {},
        },
        Variables: {
          rich_text: {},
        },
        "Created Date": {
          created_time: {},
        },
        "Last Updated": {
          last_edited_time: {},
        },
      },
    } as CreateDatabaseParameters)

    console.log("✅ Email Templates database created successfully!")
    console.log(`Database ID: ${response.id}`)
    console.log(`\nAdd this to your .env.local:`)
    console.log(`NOTION_EMAIL_TEMPLATES_DATABASE_ID=${response.id}`)
    
    return response.id
  } catch (error) {
    console.error("❌ Error creating Email Templates database:", error)
    throw error
  }
}

/**
 * Creates initial email template entries in the database
 */
async function createInitialTemplates(databaseId: string) {
  try {
    // Welcome Email Template
    const welcomeTemplate = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: "Welcome Email - Qualified Lead",
              },
            },
          ],
        },
        Type: {
          select: {
            name: "Welcome",
          },
        },
        Subject: {
          rich_text: [
            {
              text: {
                content: "Thanks for reaching out — let's talk about your project",
              },
            },
          ],
        },
        "HTML Template": {
          rich_text: [
            {
              text: {
                content: `Use the following variables in your template:
{name} - Client's name
{service} - Service requested
{company} - Company name (optional)
{budgetRange} - Budget range (human-readable)
{timeline} - Timeline (human-readable)
{message} - Client's original message
{schedulingLink} - Link to schedule a call (default: https://cal.com/zynra-studio)

Template structure:
1. Personal acknowledgement
2. What you understood from their request
3. What the call will clarify
4. Scheduling link
5. Reassurance (timeline / next steps)

Design should match acknowledgment email (dark theme, glassmorphism style).`,
              },
            },
          ],
        },
        "Plain Text Template": {
          rich_text: [
            {
              text: {
                content: `Hi {name},

Thank you for reaching out to Zynra Studio! We're genuinely excited about the opportunity to work with you{company} on your project.

What We Understand:
Based on your inquiry, you're looking for {service}{budgetRange} {timeline}.

What We'll Discuss:
During our call, we'll dive deeper into your project goals, discuss the specific requirements and challenges, explore how we can best serve your needs, and answer any questions you might have about our process and approach.

Schedule a Call:
{schedulingLink}

What Happens Next:
After our call, we'll send you a detailed proposal tailored to your specific needs within 48 hours. We're committed to making this process smooth and transparent, and we're here to answer any questions along the way.

Best regards,
The Zynra Studio Team`,
              },
            },
          ],
        },
        Variables: {
          rich_text: [
            {
              text: {
                content: "name, service, company, budgetRange, timeline, message, schedulingLink",
              },
            },
          ],
        },
      },
    })

    // Rejection Email Template
    const rejectionTemplate = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: "Rejection Email - Archived Lead",
              },
            },
          ],
        },
        Type: {
          select: {
            name: "Rejection",
          },
        },
        Subject: {
          rich_text: [
            {
              text: {
                content: "Thank you for your interest - Zynra Studio",
              },
            },
          ],
        },
        "HTML Template": {
          rich_text: [
            {
              text: {
                content: `Use the following variables in your template:
{name} - Client's name
{reason} - Rejection reason (from Notion field)

Template structure:
- Professional rejection message
- Reason section (from Notion field)
- Thank you message
- Professional closing

Design should match acknowledgment email (dark theme, glassmorphism style).`,
              },
            },
          ],
        },
        "Plain Text Template": {
          rich_text: [
            {
              text: {
                content: `Hi {name},

Thank you for taking the time to reach out to Zynra Studio and for your interest in working with us. We truly appreciate you considering us for your project.

Our Decision:
After careful consideration, we've decided that we're not the right fit for your project at this time. {reason}

We wish you the very best with your project and hope you find the perfect partner to bring your vision to life.

Best regards,
The Zynra Studio Team`,
              },
            },
          ],
        },
        Variables: {
          rich_text: [
            {
              text: {
                content: "name, reason",
              },
            },
          ],
        },
      },
    })

    console.log("✅ Initial email templates created successfully!")
    console.log(`Welcome Template ID: ${welcomeTemplate.id}`)
    console.log(`Rejection Template ID: ${rejectionTemplate.id}`)
  } catch (error) {
    console.error("❌ Error creating initial templates:", error)
    throw error
  }
}

// Main execution
async function main() {
  console.log("🚀 Setting up Email Templates database in Notion...\n")
  
  const databaseId = await createEmailTemplatesDatabase()
  await createInitialTemplates(databaseId)
  
  console.log("\n✅ Setup complete!")
  console.log("\nNext steps:")
  console.log("1. Update the HTML templates in Notion with the actual HTML from lib/email-templates-welcome.ts and lib/email-templates-rejection.ts")
  console.log("2. Add NOTION_EMAIL_TEMPLATES_DATABASE_ID to your .env.local")
  console.log("3. Update the Leads database schema (add Rejection Reason, Email Draft Created, Draft Email ID properties)")
  console.log("4. Create the Make.com scenario")
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
