import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { readFile } from "fs/promises"
import { join } from "path"
import {
  replaceContractVariables,
  type ContractData,
} from "@/lib/contract-template-processor"
import { createContractPage } from "@/lib/notion-client"

// Validation schema for the request body
const contractRequestSchema = z.object({
  leadData: z.object({
    clientName: z.string().min(1, "Client name is required"),
    companyName: z.string().optional(),
    projectName: z.string().min(1, "Project name is required"),
    scopeSummary: z.string().optional(),
    fee: z.union([z.number(), z.string()]).transform((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val.replace(/[^0-9.]/g, ""))
        return isNaN(parsed) ? 0 : parsed
      }
      return val
    }),
    paymentTerms: z.string().min(1, "Payment terms are required"),
    startDate: z.string().optional(),
    revisionsChangeRequests: z.string().optional(),
    confidentialityClause: z.string().optional(),
    liabilityLimitation: z.string().optional(),
    deliverables: z.string().optional(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request data
    const validationResult = contractRequestSchema.safeParse(body)

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

    const { leadData } = validationResult.data

    // Read contract template from file system
    const templatePath = join(process.cwd(), "templates", "contract.html")
    let template: string

    try {
      template = await readFile(templatePath, "utf-8")
    } catch (error) {
      console.error("Error reading contract template:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Contract template not found",
          details: "The contract template file could not be read",
        },
        { status: 500 }
      )
    }

    // Replace variables in the template
    const contractData: ContractData = {
      clientName: leadData.clientName,
      companyName: leadData.companyName || "",
      projectName: leadData.projectName,
      scopeSummary: leadData.scopeSummary || "To be determined during project kickoff.",
      fee: leadData.fee,
      paymentTerms: leadData.paymentTerms,
      startDate: leadData.startDate || new Date().toISOString().split("T")[0],
      revisionsChangeRequests: leadData.revisionsChangeRequests ?? undefined,
      confidentialityClause: leadData.confidentialityClause ?? undefined,
      liabilityLimitation: leadData.liabilityLimitation ?? undefined,
      deliverables: leadData.deliverables ?? undefined,
    }
    const html = replaceContractVariables(template, contractData)

    // Check if NOTION_API_KEY is configured
    if (!process.env.NOTION_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Notion API is not configured",
          details: "NOTION_API_KEY environment variable is required to create contract page",
        },
        { status: 500 }
      )
    }

    // Create contract page in Notion
    let contractUrl: string
    try {
      const parentPageId = process.env.NOTION_CONTRACTS_PARENT_PAGE_ID // Optional: parent page for contracts
      contractUrl = await createContractPage(
        html,
        {
          clientName: leadData.clientName,
          companyName: leadData.companyName,
          projectName: leadData.projectName,
        },
        parentPageId
      )
    } catch (error) {
      console.error("Error creating Notion contract page:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create contract page in Notion",
          details:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        html, // Still return HTML for reference
        url: contractUrl, // Notion page URL
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("API error generating contract:", error)
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
