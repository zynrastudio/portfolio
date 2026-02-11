import { NextResponse } from "next/server"
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
export async function GET() {
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
      // Verify client is initialized
      if (!notion || !notion.databases) {
        return NextResponse.json(
          { 
            error: "Notion client initialization failed",
            details: "Client object is missing databases property"
          },
          { status: 500 }
        )
      }
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
    // In SDK v5.7.0, databases.query() may not exist - need to use dataSources.query()
    // First, get the data source ID from the database
    let response
    try {
      // Step 1: Retrieve the database to get its data source ID
      const dbInfo = await notion.databases.retrieve({ database_id: databaseId })
      
      // Step 2: Extract data source ID (new API) or use database ID directly (old API)
      let dataSourceId = databaseId
      interface DatabaseWithDataSources {
        data_sources?: Array<{ id: string }>
      }
      const dbInfoWithSources = dbInfo as DatabaseWithDataSources
      if (dbInfoWithSources?.data_sources && Array.isArray(dbInfoWithSources.data_sources) && dbInfoWithSources.data_sources.length > 0) {
        dataSourceId = dbInfoWithSources.data_sources[0].id
        console.log(`📋 Using data source ID: ${dataSourceId}`)
      } else {
        console.log(`⚠️ No data_sources found, using database ID as data source ID: ${dataSourceId}`)
      }
      
      // Step 3: Use dataSources.query() (new API in v5.7.0+)
      // databases.query() is deprecated and may not exist
      if (!notion.dataSources) {
        throw new Error("dataSources API not available. SDK version may be incompatible.")
      }
      
      interface DataSourcesQuery {
        query: (params: {
          data_source_id: string
          filter: {
            property: string
            select: {
              is_not_empty: boolean
            }
          }
          sorts: Array<{
            timestamp: string
            direction: string
          }>
          page_size: number
        }) => Promise<{ results: PageObjectResponse[] }>
      }
      const dataSources = notion.dataSources as unknown as DataSourcesQuery
      response = await dataSources.query({
        data_source_id: dataSourceId,
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
        page_size: 20,
      })
    } catch (queryError) {
      console.error("❌ Notion query error:", queryError)
      return NextResponse.json(
        {
          error: "Failed to query Notion database",
          details: queryError instanceof Error ? queryError.message : String(queryError),
          hint: "Check NOTION_API_KEY, database permissions, and ensure database has a data source",
        },
        { status: 500 }
      )
    }

    const changes: Array<{
      pageId: string
      oldStatus: string | null
      newStatus: string
    }> = []

    // Check each page for status changes
    for (const page of response.results) {
      const pageData = page as PageObjectResponse
      if (!("properties" in pageData)) continue

      const pageId = pageData.id
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
  try {
    const hasApiKey = !!process.env.NOTION_API_KEY
    const hasDatabaseId = !!process.env.NOTION_LEADS_DATABASE_ID
    const hasWebhookUrl = !!process.env.MAKE_WEBHOOK_URL
    
    // Try to initialize client to verify it works
    let clientInitialized = false
    let clientError = null
    try {
      const testClient = getNotionClient()
      clientInitialized = !!testClient && !!testClient.databases
    } catch (error) {
      clientError = error instanceof Error ? error.message : String(error)
    }
    
    return NextResponse.json({
      status: "healthy",
      message: "Notion polling service is running",
      timestamp: new Date().toISOString(),
      diagnostics: {
        hasApiKey,
        hasDatabaseId,
        hasWebhookUrl,
        clientInitialized,
        clientError,
      },
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Health check failed",
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
