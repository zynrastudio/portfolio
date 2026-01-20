import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getEmailTemplateByPageId } from "@/lib/notion-client"
import {
  replaceWelcomeTemplateVariables,
  type WelcomeEmailData,
} from "@/lib/email-template-processor"

// Validation schema for the request body
const welcomeEmailRequestSchema = z.object({
  templatePageId: z.string().min(1, "Template page ID is required"),
  leadData: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    service: z.string().min(1, "Service is required"),
    company: z.string().optional(),
    budgetRange: z.string().optional(),
    timeline: z.string().optional(),
    message: z.string().optional(),
    schedulingLink: z.string().url().optional().or(z.literal("")),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request data
    const validationResult = welcomeEmailRequestSchema.safeParse(body)

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

    const { templatePageId, leadData } = validationResult.data

    // Check if NOTION_API_KEY is configured
    if (!process.env.NOTION_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Notion API is not configured",
        },
        { status: 500 }
      )
    }

    // Fetch template from Notion
    const template = await getEmailTemplateByPageId(templatePageId)

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: "Template not found",
          details: `No template found with page ID: ${templatePageId}`,
        },
        { status: 404 }
      )
    }

    if (template.type !== "Welcome") {
      return NextResponse.json(
        {
          success: false,
          error: "Template type mismatch",
          details: `Expected Welcome template, got ${template.type}`,
        },
        { status: 400 }
      )
    }

    if (!template.htmlTemplate) {
      return NextResponse.json(
        {
          success: false,
          error: "Template HTML not found",
          details: "The template does not contain HTML content",
        },
        { status: 404 }
      )
    }

    // Replace variables in the template
    const html = replaceWelcomeTemplateVariables(
      template.htmlTemplate,
      leadData as WelcomeEmailData
    )

    // Replace variables in the subject
    const subject = template.subject.replace(/{name}/g, leadData.name)

    return NextResponse.json(
      {
        success: true,
        html,
        subject,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("API error generating welcome email:", error)
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
