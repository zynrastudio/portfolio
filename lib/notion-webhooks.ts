/**
 * Notion Webhook Management Utilities
 * 
 * These utilities help manage Notion database page update subscriptions
 * to trigger instant webhooks when lead status changes.
 */

import { Client } from "@notionhq/client"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

// Initialize Notion client - use inside functions to avoid module-level initialization issues
function getNotionClient() {
  return new Client({ auth: process.env.NOTION_API_KEY })
}

/**
 * Since Notion doesn't have native webhook support yet, we'll use polling
 * with a very short interval, or implement a custom solution.
 * 
 * For true instant webhooks, you have 3 options:
 * 
 * 1. Use a third-party service like Zapier/Make.com webhook trigger
 * 2. Implement database polling with short intervals (1-5 seconds)
 * 3. Use Notion's unofficial webhook API (if available)
 * 
 * For this implementation, we'll document how to set up Make.com's
 * instant webhook trigger, which is the most reliable approach.
 */

/**
 * Interface for webhook event payload
 */
export interface NotionWebhookEvent {
  id: string // Page ID
  database_id: string // Database ID
  status: string // New status value
  properties: Record<string, unknown> // All page properties
  url: string // Notion page URL
  triggered_at: string // ISO timestamp
}

/**
 * Validates a webhook event payload
 */
export function validateWebhookEvent(payload: unknown): payload is NotionWebhookEvent {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "id" in payload &&
    typeof payload.id === "string" &&
    "status" in payload &&
    typeof payload.status === "string" &&
    "properties" in payload &&
    typeof payload.properties === "object"
  )
}

/**
 * Gets a human-readable description of the status
 */
export function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    "Discovery": "Initial discovery phase",
    "Qualified": "Lead is qualified, send welcome email",
    "Unqualified": "Lead is not qualified, send rejection email",
    "Discovery Completed": "Discovery complete, generate contract",
    "Contract Signed": "Contract signed, create Slack + Linear",
    "Deposit Paid": "Deposit received, activate project",
    "In Progress": "Project is actively being worked on",
    "Review": "Project in client review phase",
    "Project Completion": "Project completed, final handover",
  }
  return descriptions[status] || "Unknown status"
}

/**
 * Determines which automation routes should be triggered for a given status
 */
export function getAutomationRoutes(status: string): string[] {
  const routes: Record<string, string[]> = {
    "Qualified": ["welcome-email"],
    "Unqualified": ["rejection-email"],
    "Discovery Completed": ["generate-contract"],
    "Contract Signed": ["create-slack-linear"],
    "Deposit Paid": ["activate-project"],
    "Review": ["review-instructions"],
    "Project Completion": ["final-handover"],
  }
  return routes[status] || []
}

/**
 * Fetches the latest status of a page from Notion
 */
export async function getPageStatus(pageId: string): Promise<string | null> {
  try {
    const notion = getNotionClient()
    const page = await notion.pages.retrieve({ page_id: pageId }) as PageObjectResponse
    const statusProperty = page.properties.Status
    
    // Type guard for select property
    if (statusProperty && "select" in statusProperty && statusProperty.select) {
      return statusProperty.select.name
    }
    
    // Type guard for status property
    if (statusProperty && "status" in statusProperty && statusProperty.status) {
      return statusProperty.status.name
    }
    
    return null
  } catch (error) {
    console.error("Failed to fetch page status:", error)
    return null
  }
}

/**
 * Polls the Notion database for status changes
 * This is a fallback if webhooks aren't available
 * 
 * @param databaseId - The Notion database ID
 * @param interval - Polling interval in milliseconds (default: 5000ms)
 * @param onStatusChange - Callback when status changes
 */
export async function pollDatabaseForChanges(
  databaseId: string,
  interval: number = 5000,
  onStatusChange: (event: NotionWebhookEvent) => void | Promise<void>
): Promise<() => void> {
  const seenStatuses = new Map<string, string>() // pageId -> status
  
  const poll = async () => {
    try {
      const notion = getNotionClient()
      // Query the database for recent changes
      // @ts-expect-error - The Notion SDK has this method but TypeScript types are incomplete
      const response = await notion.databases.query({
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
        page_size: 10, // Only check recent changes
      })
      
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
        
        const previousStatus = seenStatuses.get(pageId)
        
        // If status changed, trigger the callback
        if (previousStatus && previousStatus !== currentStatus) {
          console.log(`📊 Status changed for ${pageId}: ${previousStatus} → ${currentStatus}`)
          
          await onStatusChange({
            id: pageId,
            database_id: databaseId,
            status: currentStatus,
            properties: pageData.properties,
            url: `https://notion.so/${pageId.replace(/-/g, "")}`,
            triggered_at: new Date().toISOString(),
          })
        }
        
        // Update the seen status
        seenStatuses.set(pageId, currentStatus)
      }
    } catch (error) {
      console.error("Polling error:", error)
    }
  }
  
  // Initial poll
  await poll()
  
  // Set up interval
  const intervalId = setInterval(poll, interval)
  
  // Return cleanup function
  return () => clearInterval(intervalId)
}
