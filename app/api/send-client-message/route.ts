import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { z } from "zod"
import { generateClientMessageEmail } from "@/lib/email-templates-client-message"

const resend = new Resend(process.env.RESEND_API_KEY)

// Validation schema for the request body
const clientMessageSchema = z.object({
  to: z.string().email("Valid recipient email is required"),
  name: z.string().min(1, "Name is required"),
  subject: z.string().optional(),
  greeting: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  additionalSections: z
    .array(
      z.object({
        title: z.string().optional(),
        content: z.string(),
      })
    )
    .optional(),
  ctaButton: z
    .object({
      text: z.string(),
      url: z.string().url(),
    })
    .optional(),
  additionalInfo: z.string().optional(),
  signature: z.string().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(), // base64 encoded
        type: z.string().optional(),
      })
    )
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request data
    const validationResult = clientMessageSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Email service is not configured",
        },
        { status: 500 }
      )
    }

    // Generate email HTML and text
    const { html, text } = generateClientMessageEmail({
      name: data.name,
      subject: data.subject,
      greeting: data.greeting,
      message: data.message,
      additionalSections: data.additionalSections,
      ctaButton: data.ctaButton,
      additionalInfo: data.additionalInfo,
      signature: data.signature || "Zynra Studio Team",
    })

    // Prepare attachments for Resend
    const resendAttachments = data.attachments?.map((att) => ({
      filename: att.filename,
      content: Buffer.from(att.content, "base64"),
      type: att.type,
    }))

    // Send email via Resend
    const { data: emailData, error } = await resend.emails.send({
      from: "Zynra Studio <contact@zynra.studio>",
      to: data.to,
      subject: data.subject || "Message from Zynra Studio",
      html,
      text,
      attachments: resendAttachments,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send email",
          details: error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        messageId: emailData?.id,
        message: "Email sent successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("API error sending client message:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
