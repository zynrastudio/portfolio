/**
 * Script to update Leads database schema in Notion
 * Adds new properties: Rejection Reason, Email Draft Created, Draft Email ID
 * 
 * Usage: npx tsx scripts/update-leads-database-schema.ts
 */

import { Client } from "@notionhq/client"

if (!process.env.NOTION_API_KEY) {
  throw new Error("NOTION_API_KEY environment variable is required")
}

if (!process.env.NOTION_LEADS_DATABASE_ID) {
  throw new Error("NOTION_LEADS_DATABASE_ID environment variable is required")
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

/**
 * Updates the Leads database to add new properties
 * Note: Notion API doesn't support adding properties directly
 * This script provides instructions for manual setup
 */
async function updateLeadsDatabaseSchema() {
  const databaseId = process.env.NOTION_LEADS_DATABASE_ID

  try {
    // Get current database structure
    console.log(`Retrieving database with ID: ${databaseId}`)
    const databaseResponse = await notion.databases.retrieve({
      database_id: databaseId!,
    })

    console.log("Database retrieved:", JSON.stringify(databaseResponse, null, 2).substring(0, 500))

    if (!databaseResponse) {
      throw new Error("Failed to retrieve database - response was null")
    }

    // Type guard to check if we have properties
    if (!("properties" in databaseResponse)) {
      throw new Error("Database response does not include properties field")
    }

    // Now TypeScript knows properties exists
    const database = databaseResponse as typeof databaseResponse & { 
      properties: Record<string, unknown> 
    }

    console.log("📋 Current Leads database properties:")
    console.log(Object.keys(database.properties).join(", "))
    console.log("\n")

    // Check which properties already exist
    const existingProperties = Object.keys(database.properties)
    const requiredProperties = [
      "Rejection Reason",
      "Email Draft Created",
      "Draft Email ID",
    ]

    const missingProperties = requiredProperties.filter(
      (prop) => !existingProperties.includes(prop)
    )

    if (missingProperties.length === 0) {
      console.log("✅ All required properties already exist!")
      return
    }

    console.log("⚠️  The following properties need to be added manually in Notion:")
    console.log("   (Notion API doesn't support adding properties to existing databases)\n")

    missingProperties.forEach((prop) => {
      console.log(`   - ${prop}`)
    })

    console.log("\n📝 Manual Setup Instructions:")
    console.log("1. Open your Leads database in Notion")
    console.log("2. Click the '...' menu in the top right → 'Add a property'")
    console.log("3. Add the following properties:\n")

    console.log("   Property: Rejection Reason")
    console.log("   Type: Text (Rich Text)")
    console.log("   Description: Manual field for rejection reason (only used when Archived)\n")

    console.log("   Property: Email Draft Created")
    console.log("   Type: Checkbox")
    console.log("   Description: Track if draft has been created\n")

    console.log("   Property: Draft Email ID")
    console.log("   Type: Text (Rich Text)")
    console.log("   Description: Store Gmail draft ID for reference\n")

    console.log("✅ After adding these properties, the database will be ready for the automation!")
  } catch (error) {
    console.error("❌ Error retrieving database:", error)
    throw error
  }
}

// Main execution
async function main() {
  console.log("🚀 Checking Leads database schema...\n")
  await updateLeadsDatabaseSchema()
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
