import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { quoteSchema } from "@/lib/types/quote"
import { generateAcknowledgmentEmail } from "@/lib/email-templates"
import { createLeadRecord } from "@/lib/notion-client"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request data
    const validationResult = quoteSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid form data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured")
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      )
    }

    // Format the email content
    const emailSubject = `New Quote Request - ${data.service}`
    
    const emailContent = `
New quote request received from your portfolio website.

Contact Information:
- Name: ${data.name}
- Email: ${data.email}
${data.company ? `- Company: ${data.company}` : ""}
${data.phone ? `- Phone: ${data.phone}` : ""}

Project Details:
- Service: ${data.service}
- Budget Range: ${getBudgetLabel(data.budgetRange)}
- Timeline: ${getTimelineLabel(data.timeline)}

Message:
${data.message}

---
This email was sent from your portfolio contact form.
    `.trim()

    // Send quote request email to contact@zynra.studio
    const { data: emailData, error } = await resend.emails.send({
      from: "Zynra Studio <hi@zynra.studio>",
      to: "contact@zynra.studio",
      replyTo: data.email,
      subject: emailSubject,
      text: emailContent,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      )
    }

    // Create Notion lead record (don't fail if this fails - the main email was sent)
    if (process.env.NOTION_LEADS_DATABASE_ID) {
      try {
        await createLeadRecord(data, process.env.NOTION_LEADS_DATABASE_ID)
      } catch (notionError) {
        // Log the error but don't fail the request
        console.error("Failed to create Notion record:", notionError)
      }
    }

    // Generate acknowledgment email (HTML + plain text)
    const acknowledgmentSubject = "Thank you for your quote request - Zynra Studio"
    const acknowledgmentEmail = generateAcknowledgmentEmail(
      {
        name: data.name,
        service: data.service,
        budgetRange: data.budgetRange,
        timeline: data.timeline,
        company: data.company,
      },
      {
        getBudgetLabel,
        getTimelineLabel,
      }
    )

    // Send acknowledgment email (don't fail if this fails - the main email was sent)
    try {
      await resend.emails.send({
        from: "Zynra Studio <hi@zynra.studio>",
        to: data.email,
        subject: acknowledgmentSubject,
        html: acknowledgmentEmail.html,
        text: acknowledgmentEmail.text,
      })
    } catch (ackError) {
      // Log the error but don't fail the request
      console.error("Failed to send acknowledgment email:", ackError)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Quote request sent successfully",
        emailId: emailData?.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Helper functions to get human-readable labels
function getBudgetLabel(value: string): string {
  const budgetRanges = [
    { value: "under-10k", label: "Under $10,000" },
    { value: "10k-25k", label: "$10,000 - $25,000" },
    { value: "25k-50k", label: "$25,000 - $50,000" },
    { value: "50k-100k", label: "$50,000 - $100,000" },
    { value: "100k-plus", label: "$100,000+" },
    { value: "not-sure", label: "Not sure yet" },
  ]
  return budgetRanges.find((r) => r.value === value)?.label || value
}

function getTimelineLabel(value: string): string {
  const timelines = [
    { value: "asap", label: "ASAP" },
    { value: "1-3-months", label: "1-3 months" },
    { value: "3-6-months", label: "3-6 months" },
    { value: "6-12-months", label: "6-12 months" },
    { value: "flexible", label: "Flexible" },
  ]
  return timelines.find((t) => t.value === value)?.label || value
}
