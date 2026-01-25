import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Validation schema
const pdfRequestSchema = z.object({
  html: z.string().min(1, "HTML content is required"),
  filename: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = pdfRequestSchema.safeParse(body)

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

    const { html, filename = "document.pdf" } = validationResult.data

    // For now, return HTML that can be printed to PDF
    // In production, you'd use puppeteer or similar to generate actual PDF
    // This is a client-side PDF generation approach
    return NextResponse.json(
      {
        success: true,
        html,
        filename,
        message: "Use browser print-to-PDF functionality. Install puppeteer for server-side PDF generation.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("API error generating PDF:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
