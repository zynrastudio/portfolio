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
    
    const emailTextContent = `
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

    // HTML email content for notification (helps avoid spam)
    const emailHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Quote Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="padding: 0 0 32px 0; border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
              <h1 style="margin: 0; font-size: 24px; font-weight: 400; color: #000000;">New Quote Request</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(0, 0, 0, 0.6);">Received from your portfolio website</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 32px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(0, 0, 0, 0.4);">Contact Information</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="font-weight: 500; color: #000000;">Name:</strong>
                          <span style="color: rgba(0, 0, 0, 0.8); margin-left: 8px;">${data.name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="font-weight: 500; color: #000000;">Email:</strong>
                          <a href="mailto:${data.email}" style="color: #0066cc; text-decoration: none; margin-left: 8px;">${data.email}</a>
                        </td>
                      </tr>
                      ${data.company ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="font-weight: 500; color: #000000;">Company:</strong>
                          <span style="color: rgba(0, 0, 0, 0.8); margin-left: 8px;">${data.company}</span>
                        </td>
                      </tr>
                      ` : ""}
                      ${data.phone ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="font-weight: 500; color: #000000;">Phone:</strong>
                          <a href="tel:${data.phone}" style="color: #0066cc; text-decoration: none; margin-left: 8px;">${data.phone}</a>
                        </td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 0 32px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(0, 0, 0, 0.4);">Project Details</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="font-weight: 500; color: #000000;">Service:</strong>
                          <span style="color: rgba(0, 0, 0, 0.8); margin-left: 8px;">${data.service}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="font-weight: 500; color: #000000;">Budget Range:</strong>
                          <span style="color: rgba(0, 0, 0, 0.8); margin-left: 8px;">${getBudgetLabel(data.budgetRange)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="font-weight: 500; color: #000000;">Timeline:</strong>
                          <span style="color: rgba(0, 0, 0, 0.8); margin-left: 8px;">${getTimelineLabel(data.timeline)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 0 32px 0;">
              <h2 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(0, 0, 0, 0.4);">Message</h2>
              <p style="margin: 0; padding: 16px; background-color: rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 8px; font-size: 15px; line-height: 1.6; color: rgba(0, 0, 0, 0.8); white-space: pre-wrap;">${data.message}</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 32px 0 0 0; border-top: 1px solid rgba(0, 0, 0, 0.1);">
              <p style="margin: 0; font-size: 12px; color: rgba(0, 0, 0, 0.4); text-align: center;">This email was sent from your portfolio contact form</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()

    // Send quote request email to contact@zynra.studio
    const { data: emailData, error } = await resend.emails.send({
      from: "Zynra Studio <hi@zynra.studio>",
      to: "contact@zynra.studio",
      replyTo: data.email,
      subject: emailSubject,
      html: emailHtmlContent,
      text: emailTextContent,
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
        console.log("✅ Successfully created Notion lead record for:", data.name)
      } catch (notionError) {
        // Log the error but don't fail the request
        console.error("❌ Failed to create Notion record:", notionError)
        if (notionError instanceof Error) {
          console.error("Error details:", {
            message: notionError.message,
            stack: notionError.stack,
          })
        }
      }
    } else {
      console.warn("⚠️ NOTION_LEADS_DATABASE_ID not configured - skipping Notion record creation")
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
