/**
 * Script to get template page IDs from Notion Email Templates database
 */

import { Client } from "@notionhq/client"

if (!process.env.NOTION_API_KEY) {
  throw new Error("NOTION_API_KEY environment variable is required")
}

if (!process.env.NOTION_EMAIL_TEMPLATES_DATABASE_ID) {
  throw new Error("NOTION_EMAIL_TEMPLATES_DATABASE_ID environment variable is required")
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const databaseId = process.env.NOTION_EMAIL_TEMPLATES_DATABASE_ID

async function getTemplateIds() {
  try {
    console.log("🔍 Fetching templates from Email Templates database...")
    console.log(`Database ID: ${databaseId}\n`)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (notion.databases as any).query({
      database_id: databaseId,
    })

    if (response.results.length === 0) {
      console.log("❌ No templates found in database")
      console.log("\nYou need to create templates first:")
      console.log("Run: npx tsx scripts/create-email-template-pages.ts")
      return
    }

    console.log(`✅ Found ${response.results.length} templates:\n`)

    for (const page of response.results) {
      if ("properties" in page) {
        const nameProperty = page.properties.Name
        const typeProperty = page.properties.Type

        let name = "Untitled"
        if ("title" in nameProperty && nameProperty.title.length > 0) {
          name = nameProperty.title[0].plain_text
        }

        let type = "Unknown"
        if ("select" in typeProperty && typeProperty.select) {
          type = typeProperty.select.name
        }

        console.log(`📧 ${type} Template:`)
        console.log(`   Name: ${name}`)
        console.log(`   Page ID: ${page.id}`)
        console.log(`   Use in test script: "${page.id.replace(/-/g, '')}"`)
        console.log()
      }
    }

    console.log("\n📝 Update test-email-api.ts with these IDs:")
    console.log("=" .repeat(60))
  } catch (error) {
    console.error("❌ Error fetching templates:", error)
    throw error
  }
}

getTemplateIds().catch(console.error)
