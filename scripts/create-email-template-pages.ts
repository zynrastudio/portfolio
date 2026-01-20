/**
 * Script to create email template pages in Notion Email Templates database
 * Run this script to create the Welcome and Rejection email templates
 * 
 * Usage: npx tsx scripts/create-email-template-pages.ts
 */

import { Client } from "@notionhq/client"
import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"

if (!process.env.NOTION_API_KEY) {
  throw new Error("NOTION_API_KEY environment variable is required")
}

if (!process.env.NOTION_EMAIL_TEMPLATES_DATABASE_ID) {
  throw new Error("NOTION_EMAIL_TEMPLATES_DATABASE_ID environment variable is required")
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Use database ID (b98e9d2eeeb44444bf58a71f62f95f3b) instead of data source ID
const databaseId = process.env.NOTION_EMAIL_TEMPLATES_DATABASE_ID || "b98e9d2eeeb44444bf58a71f62f95f3b"

// Welcome Email HTML Template
const welcomeEmailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Thanks for reaching out — let's talk about your project</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a;">
          <tr>
            <td style="padding: 0 0 40px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 300; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2;">
                      Zynra <span style="font-weight: 200; color: rgba(255, 255, 255, 0.5);">Studio</span>
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 0 24px 0;">
              <p style="margin: 0; font-size: 18px; font-weight: 300; color: #ffffff; line-height: 1.6; letter-spacing: -0.2px;">
                Hi {name},
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 32px 0;">
              <p style="margin: 0; font-size: 16px; font-weight: 300; color: rgba(255, 255, 255, 0.8); line-height: 1.7; letter-spacing: -0.1px;">
                Thank you for reaching out to Zynra Studio! We're genuinely excited about the opportunity to work with you{company} on your project.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 32px 0;">
              <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255, 255, 255, 0.4);">
                What We Understand
              </p>
              <p style="margin: 0; font-size: 16px; font-weight: 300; color: rgba(255, 255, 255, 0.8); line-height: 1.7; letter-spacing: -0.1px;">
                Based on your inquiry, you're looking for <strong style="color: #ffffff; font-weight: 400;">{service}</strong>{budgetRange} {timeline}.{message}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 32px 0;">
              <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255, 255, 255, 0.4);">
                What We'll Discuss
              </p>
              <p style="margin: 0; font-size: 16px; font-weight: 300; color: rgba(255, 255, 255, 0.8); line-height: 1.7; letter-spacing: -0.1px;">
                During our call, we'll dive deeper into your project goals, discuss the specific requirements and challenges, explore how we can best serve your needs, and answer any questions you might have about our process and approach.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 32px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ffffff; border-radius: 8px;">
                    <a href="{schedulingLink}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 300; letter-spacing: -0.2px; color: #000000; text-decoration: none; line-height: 1.5;">
                      Schedule a Call
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 40px 0;">
              <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255, 255, 255, 0.4);">
                What Happens Next
              </p>
              <p style="margin: 0; font-size: 16px; font-weight: 300; color: rgba(255, 255, 255, 0.8); line-height: 1.7; letter-spacing: -0.1px;">
                After our call, we'll send you a detailed proposal tailored to your specific needs within <strong style="color: #ffffff; font-weight: 400;">48 hours</strong>. We're committed to making this process smooth and transparent, and we're here to answer any questions along the way.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 40px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 32px 0 0 0; font-size: 14px; font-weight: 300; color: rgba(255, 255, 255, 0.6); line-height: 1.6;">
                If you have any questions before our call, feel free to reach out directly at <a href="mailto:contact@zynra.studio" style="color: #ffffff; text-decoration: underline;">contact@zynra.studio</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 0 0 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 300; color: #ffffff; line-height: 1.5;">
                Best regards,<br>
                <span style="font-weight: 400;">The Zynra Studio Team</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const welcomeEmailText = `Hi {name},

Thank you for reaching out to Zynra Studio! We're genuinely excited about the opportunity to work with you{company} on your project.

What We Understand:
Based on your inquiry, you're looking for {service}{budgetRange} {timeline}.{message}

What We'll Discuss:
During our call, we'll dive deeper into your project goals, discuss the specific requirements and challenges, explore how we can best serve your needs, and answer any questions you might have about our process and approach.

Schedule a Call:
{schedulingLink}

What Happens Next:
After our call, we'll send you a detailed proposal tailored to your specific needs within 48 hours. We're committed to making this process smooth and transparent, and we're here to answer any questions along the way.

If you have any questions before our call, feel free to reach out directly at contact@zynra.studio.

Best regards,
The Zynra Studio Team`

// Rejection Email HTML Template
const rejectionEmailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Thank you for your interest - Zynra Studio</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a;">
          <tr>
            <td style="padding: 0 0 40px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 300; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2;">
                      Zynra <span style="font-weight: 200; color: rgba(255, 255, 255, 0.5);">Studio</span>
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 0 24px 0;">
              <p style="margin: 0; font-size: 18px; font-weight: 300; color: #ffffff; line-height: 1.6; letter-spacing: -0.2px;">
                Hi {name},
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 32px 0;">
              <p style="margin: 0; font-size: 16px; font-weight: 300; color: rgba(255, 255, 255, 0.8); line-height: 1.7; letter-spacing: -0.1px;">
                Thank you for taking the time to reach out to Zynra Studio and for your interest in working with us. We truly appreciate you considering us for your project.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 32px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin: 0 0 20px 0; font-size: 11px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255, 255, 255, 0.4);">
                      Our Decision
                    </p>
                    <p style="margin: 0; font-size: 16px; font-weight: 300; color: rgba(255, 255, 255, 0.8); line-height: 1.7; letter-spacing: -0.1px;">
                      After careful consideration, we've decided that we're not the right fit for your project at this time. {reason}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 32px 0;">
              <p style="margin: 0; font-size: 16px; font-weight: 300; color: rgba(255, 255, 255, 0.8); line-height: 1.7; letter-spacing: -0.1px;">
                We wish you the very best with your project and hope you find the perfect partner to bring your vision to life. If your needs change in the future, we'd be happy to hear from you again.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 40px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 32px 0 0 0; font-size: 14px; font-weight: 300; color: rgba(255, 255, 255, 0.6); line-height: 1.6;">
                If you have any questions, feel free to reach out at <a href="mailto:contact@zynra.studio" style="color: #ffffff; text-decoration: underline;">contact@zynra.studio</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 0 0 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 300; color: #ffffff; line-height: 1.5;">
                Best regards,<br>
                <span style="font-weight: 400;">The Zynra Studio Team</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const rejectionEmailText = `Hi {name},

Thank you for taking the time to reach out to Zynra Studio and for your interest in working with us. We truly appreciate you considering us for your project.

Our Decision:
After careful consideration, we've decided that we're not the right fit for your project at this time. {reason}

We wish you the very best with your project and hope you find the perfect partner to bring your vision to life. If your needs change in the future, we'd be happy to hear from you again.

If you have any questions, feel free to reach out at contact@zynra.studio.

Best regards,
The Zynra Studio Team`

async function createWelcomeTemplate() {
  try {
    // Create the page first with basic properties
    const page = await notion.pages.create({
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

    // Add HTML Template as code blocks in page content (split into chunks due to 2000 char limit)
    const htmlChunks: BlockObjectRequest[] = []
    const chunkSize = 1900 // Leave some buffer
    for (let i = 0; i < welcomeEmailHTML.length; i += chunkSize) {
      htmlChunks.push({
        object: "block",
        type: "code",
        code: {
          rich_text: [
            {
              text: {
                content: welcomeEmailHTML.substring(i, i + chunkSize),
              },
            },
          ],
          language: "html",
        },
      })
    }

    const textChunks: BlockObjectRequest[] = []
    for (let i = 0; i < welcomeEmailText.length; i += chunkSize) {
      textChunks.push({
        object: "block",
        type: "code",
        code: {
          rich_text: [
            {
              text: {
                content: welcomeEmailText.substring(i, i + chunkSize),
              },
            },
          ],
          language: "plain text",
        },
      })
    }

    const children: BlockObjectRequest[] = [
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              text: {
                content: "HTML Template",
              },
            },
          ],
        },
      },
      ...htmlChunks,
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              text: {
                content: "Plain Text Template",
              },
            },
          ],
        },
      },
      ...textChunks,
    ]

    // Append in batches (Notion API has limits on batch size)
    const batchSize = 100
    for (let i = 0; i < children.length; i += batchSize) {
      await notion.blocks.children.append({
        block_id: page.id,
        children: children.slice(i, i + batchSize),
      })
    }

    // Update the properties with references (we'll store a note that HTML is in page content)
    await notion.pages.update({
      page_id: page.id,
      properties: {
        "HTML Template": {
          rich_text: [
            {
              text: {
                content: "See page content below for full HTML template",
              },
            },
          ],
        },
        "Plain Text Template": {
          rich_text: [
            {
              text: {
                content: "See page content below for plain text template",
              },
            },
          ],
        },
      },
    })

    console.log("✅ Welcome Email template created successfully!")
    console.log(`Page ID: ${page.id}`)
    console.log("Note: Full HTML and plain text templates are stored in page content as code blocks")
    return page.id
  } catch (error) {
    console.error("❌ Error creating Welcome template:", error)
    throw error
  }
}

async function createRejectionTemplate() {
  try {
    // Create the page first with basic properties
    const page = await notion.pages.create({
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

    // Add HTML Template as code blocks in page content (split into chunks due to 2000 char limit)
    const htmlChunks: BlockObjectRequest[] = []
    const chunkSize = 1900 // Leave some buffer
    for (let i = 0; i < rejectionEmailHTML.length; i += chunkSize) {
      htmlChunks.push({
        object: "block",
        type: "code",
        code: {
          rich_text: [
            {
              text: {
                content: rejectionEmailHTML.substring(i, i + chunkSize),
              },
            },
          ],
          language: "html",
        },
      })
    }

    const textChunks: BlockObjectRequest[] = []
    for (let i = 0; i < rejectionEmailText.length; i += chunkSize) {
      textChunks.push({
        object: "block",
        type: "code",
        code: {
          rich_text: [
            {
              text: {
                content: rejectionEmailText.substring(i, i + chunkSize),
              },
            },
          ],
          language: "plain text",
        },
      })
    }

    const children: BlockObjectRequest[] = [
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              text: {
                content: "HTML Template",
              },
            },
          ],
        },
      },
      ...htmlChunks,
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              text: {
                content: "Plain Text Template",
              },
            },
          ],
        },
      },
      ...textChunks,
    ]

    // Append in batches (Notion API has limits on batch size)
    const batchSize = 100
    for (let i = 0; i < children.length; i += batchSize) {
      await notion.blocks.children.append({
        block_id: page.id,
        children: children.slice(i, i + batchSize),
      })
    }

    // Update the properties with references
    await notion.pages.update({
      page_id: page.id,
      properties: {
        "HTML Template": {
          rich_text: [
            {
              text: {
                content: "See page content below for full HTML template",
              },
            },
          ],
        },
        "Plain Text Template": {
          rich_text: [
            {
              text: {
                content: "See page content below for plain text template",
              },
            },
          ],
        },
      },
    })

    console.log("✅ Rejection Email template created successfully!")
    console.log(`Page ID: ${page.id}`)
    console.log("Note: Full HTML and plain text templates are stored in page content as code blocks")
    return page.id
  } catch (error) {
    console.error("❌ Error creating Rejection template:", error)
    throw error
  }
}

// Main execution
async function main() {
  console.log("🚀 Creating email template pages in Notion...\n")
  console.log(`Database ID: ${databaseId}\n`)

  const welcomeId = await createWelcomeTemplate()
  console.log("")
  const rejectionId = await createRejectionTemplate()

  console.log("\n✅ All templates created successfully!")
  console.log(`\nWelcome Template ID: ${welcomeId}`)
  console.log(`Rejection Template ID: ${rejectionId}`)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
