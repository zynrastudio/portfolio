import { NextRequest, NextResponse } from "next/server"
import { Client } from "@notionhq/client"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY })

/**
 * Notion Webhook Receiver
 * 
 * This endpoint receives webhook events from Notion when a lead's status changes.
 * It then forwards the event to Make.com for processing.
 * 
 * Flow:
 * 1. Notion detects status change → Sends webhook to this endpoint
 * 2. This endpoint validates and enriches the data
 * 3. Forwards to Make.com webhook URL for automation processing
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (optional but recommended for security)
    const signature = request.headers.get("notion-webhook-signature")
    const webhookSecret = process.env.NOTION_WEBHOOK_SECRET
    
    if (webhookSecret && signature) {
      // TODO: Implement signature verification if Notion supports it
      // For now, we'll use a simple token check
      if (signature !== webhookSecret) {
        console.error("❌ Invalid webhook signature")
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        )
      }
    }

    // Parse the webhook payload
    const payload = await request.json()
    
    console.log("📥 Received Notion webhook:", JSON.stringify(payload, null, 2))

    // Notion webhook payload structure (custom implementation)
    // You'll need to extract the page ID from the payload
    const { page_id, database_id } = payload

    if (!page_id) {
      console.error("❌ Missing page_id in webhook payload")
      return NextResponse.json(
        { error: "Missing page_id" },
        { status: 400 }
      )
    }

    // Fetch the full page data from Notion (to get all properties)
    let pageData: PageObjectResponse
    try {
      const page = await notion.pages.retrieve({ page_id })
      pageData = page as PageObjectResponse
    } catch (notionError) {
      console.error("❌ Failed to fetch page from Notion:", notionError)
      return NextResponse.json(
        { error: "Failed to fetch page data", details: notionError },
        { status: 500 }
      )
    }

    // Extract the Status property to determine which automation to trigger
    const statusProperty = pageData.properties.Status
    let status: string | null = null
    
    // Type guard for select property
    if (statusProperty && "select" in statusProperty && statusProperty.select) {
      status = statusProperty.select.name
    } else if (statusProperty && "status" in statusProperty && statusProperty.status) {
      status = statusProperty.status.name
    }

    if (!status) {
      console.log("⚠️ No status found, skipping automation")
      return NextResponse.json({ 
        success: true, 
        message: "No status change detected" 
      })
    }

    console.log(`📊 Status changed to: ${status}`)

    // Forward to Make.com webhook for processing
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL

    if (!makeWebhookUrl) {
      console.warn("⚠️ MAKE_WEBHOOK_URL not configured - skipping Make.com trigger")
      return NextResponse.json({
        success: true,
        message: "Webhook received but Make.com URL not configured",
        status,
        page_id,
      })
    }

    // Send to Make.com with enriched data
    try {
      const makeResponse = await fetch(makeWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: page_id,
          database_id: database_id || process.env.NOTION_LEADS_DATABASE_ID,
          status,
          properties: pageData.properties,
          url: `https://notion.so/${page_id.replace(/-/g, "")}`,
          triggered_at: new Date().toISOString(),
        }),
      })

      if (!makeResponse.ok) {
        const errorText = await makeResponse.text()
        console.error("❌ Make.com webhook failed:", errorText)
        throw new Error(`Make.com returned ${makeResponse.status}: ${errorText}`)
      }

      const makeResult = await makeResponse.json().catch(() => ({}))
      console.log("✅ Successfully triggered Make.com automation:", makeResult)

      return NextResponse.json({
        success: true,
        message: "Webhook processed and forwarded to Make.com",
        status,
        page_id,
        make_response: makeResult,
      })
    } catch (makeError) {
      console.error("❌ Failed to forward to Make.com:", makeError)
      // Don't fail the request - we received the webhook successfully
      return NextResponse.json({
        success: true,
        warning: "Webhook received but failed to forward to Make.com",
        error: makeError instanceof Error ? makeError.message : "Unknown error",
        status,
        page_id,
      })
    }
  } catch (error) {
    console.error("❌ Webhook processing error:", error)
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    message: "Notion webhook receiver is running",
    timestamp: new Date().toISOString(),
  })
}
