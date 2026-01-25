import { NextRequest, NextResponse } from "next/server"
import { Client } from "@notionhq/client"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

// Store last seen statuses in memory (in production, use Redis or database)
const seenStatuses = new Map<string, { status: string; lastChecked: Date }>()

// Initialize Notion client - create inside function to ensure env vars are loaded
function getNotionClient() {
  const apiKey = process.env.NOTION_API_KEY
  if (!apiKey) {
    throw new Error("NOTION_API_KEY is not configured")
  }
  return new Client({ auth: apiKey })
}

/**
 * Notion Polling Service
 * 
 * This endpoint polls the Notion database for status changes and forwards
 * them to Make.com via webhook. Should be called every 5-10 seconds via:
 * - Vercel Cron Jobs
 * - External cron service (cron-job.org, EasyCron, etc.)
 * - Make.com's HTTP module in a loop scenario
 * 
 * Flow:
 * 1. Poll Notion database for recent changes
 * 2. Compare current status with last known status
 * 3. If status changed, forward to Make.com webhook
 */
export async function GET(request: NextRequest) {
  try {
    const databaseId = process.env.NOTION_LEADS_DATABASE_ID
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL

    if (!databaseId) {
      return NextResponse.json(
        { error: "NOTION_LEADS_DATABASE_ID not configured" },
        { status: 500 }
      )
    }

    if (!makeWebhookUrl) {
      return NextResponse.json(
        { error: "MAKE_WEBHOOK_URL not configured" },
        { status: 500 }
      )
    }

    // Initialize Notion client
    let notion: Client
    try {
      notion = getNotionClient()
    } catch (error) {
      return NextResponse.json(
        { 
          error: "Failed to initialize Notion client",
          details: error instanceof Error ? error.message : "NOTION_API_KEY not configured"
        },
        { status: 500 }
      )
    }

    // Query the database for recent changes
    // Note: Using type assertion since TypeScript types may be incomplete
    const databases = notion.databases as any
    if (!databases || typeof databases.query !== 'function') {
      return NextResponse.json(
        { 
          error: "Notion client not properly initialized",
          details: "databases.query method not available. Check NOTION_API_KEY and SDK version."
        },
        { status: 500 }
      )
    }

    const response = await databases.query({
      database_id: databaseId,
      filter: {
        property: "Status",
        select: {
          is_not_empty: true,
        },
      },
      sorts: [
        {
          timestamp: "last_edited_time",
          direction: "descending",
        },
      ],
      page_size: 20, // Check last 20 items
    })

    const changes: Array<{
      pageId: string
      oldStatus: string | null
      newStatus: string
    }> = []

    // Check each page for status changes
    for (const page of response.results) {
      if (!("properties" in page)) continue

      const pageId = page.id
      const pageData = page as PageObjectResponse
      const statusProperty = pageData.properties.Status

      // Extract current status
      let currentStatus: string | null = null
      if (statusProperty && "select" in statusProperty && statusProperty.select) {
        currentStatus = statusProperty.select.name
      } else if (statusProperty && "status" in statusProperty && statusProperty.status) {
        currentStatus = statusProperty.status.name
      }

      if (!currentStatus) continue

      // Get previous status
      const previous = seenStatuses.get(pageId)
      const previousStatus = previous?.status || null

      // If status changed, record it
      if (previousStatus !== currentStatus) {
        changes.push({
          pageId,
          oldStatus: previousStatus,
          newStatus: currentStatus,
        })

        // Update seen status
        seenStatuses.set(pageId, {
          status: currentStatus,
          lastChecked: new Date(),
        })

        // Fetch full page data and forward to Make.com
        try {
          const notionClient = getNotionClient()
          const fullPage = await notionClient.pages.retrieve({ page_id: pageId })
          const fullPageData = fullPage as PageObjectResponse

          console.log(`📊 Status changed for ${pageId}: ${previousStatus || "null"} → ${currentStatus}`)

          // Forward to Make.com webhook
          const headers: HeadersInit = {
            "Content-Type": "application/json",
          }

          // Add API key authentication if configured
          const makeWebhookApiKey = process.env.MAKE_WEBHOOK_API_KEY
          if (makeWebhookApiKey) {
            headers["x-make-apikey"] = makeWebhookApiKey
          }

          const makeResponse = await fetch(makeWebhookUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
              id: pageId,
              database_id: databaseId,
              status: currentStatus,
              properties: fullPageData.properties,
              url: `https://notion.so/${pageId.replace(/-/g, "")}`,
              triggered_at: new Date().toISOString(),
            }),
          })

          if (!makeResponse.ok) {
            const errorText = await makeResponse.text()
            console.error(`❌ Make.com webhook failed for ${pageId}:`, errorText)
          } else {
            console.log(`✅ Successfully forwarded ${pageId} to Make.com`)
          }
        } catch (error) {
          console.error(`❌ Failed to process change for ${pageId}:`, error)
        }
      } else {
        // Update last checked time even if no change
        if (previous) {
          seenStatuses.set(pageId, {
            status: currentStatus,
            lastChecked: new Date(),
          })
        } else {
          // First time seeing this page, just record it
          seenStatuses.set(pageId, {
            status: currentStatus,
            lastChecked: new Date(),
          })
        }
      }
    }

    // Clean up old entries (older than 24 hours)
    const now = new Date()
    for (const [pageId, data] of seenStatuses.entries()) {
      const hoursSinceCheck = (now.getTime() - data.lastChecked.getTime()) / (1000 * 60 * 60)
      if (hoursSinceCheck > 24) {
        seenStatuses.delete(pageId)
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checked: response.results.length,
      changes: changes.length,
      changes_detail: changes,
      message: changes.length > 0 
        ? `Found ${changes.length} status change(s)` 
        : "No status changes detected",
    })
  } catch (error) {
    console.error("❌ Polling error:", error)
    return NextResponse.json(
      {
        error: "Failed to poll Notion database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Health check
export async function POST() {
  return NextResponse.json({
    status: "healthy",
    message: "Notion polling service is running",
    timestamp: new Date().toISOString(),
  })
}
