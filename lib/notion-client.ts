import { Client } from "@notionhq/client"
import type { QuoteFormData } from "./types/quote"
import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"

export interface EmailTemplate {
  id: string
  name: string
  type: "Welcome" | "Rejection"
  subject: string
  htmlTemplate: string
  plainTextTemplate: string
  variables: string[]
}

/**
 * Maps quote form budget range values to Notion select option names
 */
export function mapBudgetRangeToNotion(budgetRange: string): string {
  const mapping: Record<string, string> = {
    "under-10k": "Under 10k",
    "10k-25k": "10k to 25k",
    "25k-50k": "25k to 50k",
    "50k-100k": "50k to 100k",
    "100k-plus": "100k Plus",
    "not-sure": "Not Sure",
  }
  return mapping[budgetRange] || budgetRange
}

/**
 * Maps quote form timeline values to Notion select option names
 */
export function mapTimelineToNotion(timeline: string): string {
  const mapping: Record<string, string> = {
    "asap": "ASAP",
    "1-3-months": "1-3 months",
    "3-6-months": "3-6 months",
    "6-12-months": "6-12 months",
    "flexible": "Flexible",
  }
  return mapping[timeline] || timeline
}

/**
 * Creates a lead record in Notion database
 * This function should be called from the API route after email is sent
 */
export async function createLeadRecord(
  data: QuoteFormData,
  databaseId: string
): Promise<void> {
  if (!databaseId) {
    throw new Error("NOTION_LEADS_DATABASE_ID is not configured")
  }

  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not configured")
  }

  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  })

  // Prepare properties for Notion page
  const properties: Record<string, unknown> = {
    Name: {
      title: [
        {
          text: {
            content: data.name,
          },
        },
      ],
    },
    Email: {
      email: data.email,
    },
    Status: {
      select: {
        name: "Discovery",
      },
    },
    Service: {
      select: {
        name: data.service,
      },
    },
    Source: {
      select: {
        name: "Website Quote Form",
      },
    },
    BudgetRange: {
      select: {
        name: mapBudgetRangeToNotion(data.budgetRange),
      },
    },
    Timeline: {
      select: {
        name: mapTimelineToNotion(data.timeline),
      },
    },
    Message: {
      rich_text: [
        {
          text: {
            content: data.message,
          },
        },
      ],
    },
  }

  // Add optional fields if provided
  if (data.company) {
    properties.Company = {
      rich_text: [
        {
          text: {
            content: data.company,
          },
        },
      ],
    }
  }

  if (data.phone) {
    properties.Phone = {
      phone_number: data.phone,
    }
  }

  try {
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: properties as Parameters<typeof notion.pages.create>[0]['properties'],
    })
    console.log("✅ Notion page created successfully:", response.id)
  } catch (error) {
    console.error("❌ Notion API error:", error)
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
      })
    }
    // Log the properties we tried to send for debugging
    console.error("Properties sent to Notion:", JSON.stringify(properties, null, 2))
    throw error
  }
}

/**
 * Fetches an email template from Notion by type
 * Reads HTML and plain text templates from page content (code blocks) instead of properties
 * @param templateType - "Welcome" or "Rejection"
 * @param databaseId - Email Templates database ID
 * @returns Email template or null if not found
 */
export async function getEmailTemplate(
  templateType: "Welcome" | "Rejection",
  databaseId: string
): Promise<EmailTemplate | null> {
  if (!databaseId) {
    throw new Error("NOTION_EMAIL_TEMPLATES_DATABASE_ID is not configured")
  }

  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not configured")
  }

  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  })

  try {
    // Search for template by type
    // @ts-expect-error - Notion SDK types may not include query method in some versions
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Type",
        select: {
          equals: templateType,
        },
      },
      page_size: 1,
    })

    if (response.results.length === 0) {
      return null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = response.results[0] as any
    const properties = page.properties

    // Extract basic template data from properties
    const name =
      properties.Name?.title?.[0]?.plain_text || "Unknown Template"
    const type = properties.Type?.select?.name as "Welcome" | "Rejection"
    const subject =
      properties.Subject?.rich_text?.[0]?.plain_text || ""
    const variablesString =
      properties.Variables?.rich_text?.[0]?.plain_text || ""
    const variables = variablesString
      .split(",")
      .map((v: string) => v.trim())
      .filter((v: string) => v.length > 0)

    // Fetch page content to get HTML and plain text templates from code blocks
    let htmlTemplate = ""
    let plainTextTemplate = ""
    let htmlSectionFound = false
    let plainTextSectionFound = false

    let hasMore = true
    let startCursor: string | undefined = undefined

    while (hasMore) {
      const blocksResponse = await notion.blocks.children.list({
        block_id: page.id,
        start_cursor: startCursor,
        page_size: 100,
      })

      for (const block of blocksResponse.results) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blockAny = block as any

        // Check if this is a heading_2 block
        if (blockAny.type === "heading_2") {
          const headingText =
            blockAny.heading_2?.rich_text?.[0]?.plain_text || ""
          if (headingText === "HTML Template") {
            htmlSectionFound = true
            plainTextSectionFound = false
          } else if (headingText === "Plain Text Template") {
            plainTextSectionFound = true
            htmlSectionFound = false
          }
          continue
        }

        // Collect code blocks
        if (blockAny.type === "code") {
          const codeContent =
            blockAny.code?.rich_text?.[0]?.plain_text || ""
          const language = blockAny.code?.language || ""

          if (htmlSectionFound && language === "html") {
            htmlTemplate += codeContent
          } else if (plainTextSectionFound && language === "plain text") {
            plainTextTemplate += codeContent
          }
        }
      }

      hasMore = blocksResponse.has_more
      startCursor = blocksResponse.next_cursor || undefined
    }

    // If templates weren't found in page content, try properties as fallback
    if (!htmlTemplate && properties["HTML Template"]) {
      htmlTemplate =
        properties["HTML Template"]?.rich_text?.[0]?.plain_text || ""
    }
    if (!plainTextTemplate && properties["Plain Text Template"]) {
      plainTextTemplate =
        properties["Plain Text Template"]?.rich_text?.[0]?.plain_text || ""
    }

    return {
      id: page.id,
      name,
      type,
      subject,
      htmlTemplate,
      plainTextTemplate,
      variables,
    }
  } catch (error) {
    console.error("Notion API error fetching template:", error)
    throw error
  }
}

/**
 * Fetches an email template from Notion by page ID
 * Reads HTML and plain text templates from page content (code blocks) instead of properties
 * @param pageId - Notion page ID of the template
 * @returns Email template or null if not found
 */
export async function getEmailTemplateByPageId(
  pageId: string
): Promise<EmailTemplate | null> {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not configured")
  }

  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  })

  try {
    // Get the page directly by ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = (await notion.pages.retrieve({ page_id: pageId })) as any
    const properties = page.properties

    // Extract basic template data from properties
    const name =
      properties.Name?.title?.[0]?.plain_text || "Unknown Template"
    const type = properties.Type?.select?.name as "Welcome" | "Rejection"
    const subject =
      properties.Subject?.rich_text?.[0]?.plain_text || ""
    const variablesString =
      properties.Variables?.rich_text?.[0]?.plain_text || ""
    const variables = variablesString
      .split(",")
      .map((v: string) => v.trim())
      .filter((v: string) => v.length > 0)

    // Fetch page content to get HTML and plain text templates from code blocks
    let htmlTemplate = ""
    let plainTextTemplate = ""
    let htmlSectionFound = false
    let plainTextSectionFound = false

    let hasMore = true
    let startCursor: string | undefined = undefined

    while (hasMore) {
      const blocksResponse = await notion.blocks.children.list({
        block_id: page.id,
        start_cursor: startCursor,
        page_size: 100,
      })

      for (const block of blocksResponse.results) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blockAny = block as any

        // Check if this is a heading_2 block
        if (blockAny.type === "heading_2") {
          const headingText =
            blockAny.heading_2?.rich_text?.[0]?.plain_text || ""
          if (headingText === "HTML Template") {
            htmlSectionFound = true
            plainTextSectionFound = false
          } else if (headingText === "Plain Text Template") {
            plainTextSectionFound = true
            htmlSectionFound = false
          }
          continue
        }

        // Collect code blocks
        if (blockAny.type === "code") {
          const codeContent =
            blockAny.code?.rich_text?.[0]?.plain_text || ""
          const language = blockAny.code?.language || ""

          if (htmlSectionFound && language === "html") {
            htmlTemplate += codeContent
          } else if (plainTextSectionFound && language === "plain text") {
            plainTextTemplate += codeContent
          }
        }
      }

      hasMore = blocksResponse.has_more
      startCursor = blocksResponse.next_cursor || undefined
    }

    // If templates weren't found in page content, try properties as fallback
    if (!htmlTemplate && properties["HTML Template"]) {
      htmlTemplate =
        properties["HTML Template"]?.rich_text?.[0]?.plain_text || ""
    }
    if (!plainTextTemplate && properties["Plain Text Template"]) {
      plainTextTemplate =
        properties["Plain Text Template"]?.rich_text?.[0]?.plain_text || ""
    }

    return {
      id: page.id,
      name,
      type,
      subject,
      htmlTemplate,
      plainTextTemplate,
      variables,
    }
  } catch (error) {
    console.error("Notion API error fetching template by page ID:", error)
    throw error
  }
}

/**
 * Updates a lead record in Notion with draft information
 * @param leadId - Lead page ID
 * @param databaseId - Leads database ID
 * @param draftEmailId - Gmail draft ID
 */
export async function updateLeadDraftStatus(
  leadId: string,
  databaseId: string,
  draftEmailId: string
): Promise<void> {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not configured")
  }

  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  })

  try {
    await notion.pages.update({
      page_id: leadId,
      properties: {
        "Email Draft Created": {
          checkbox: true,
        },
        "Draft Email ID": {
          rich_text: [
            {
              text: {
                content: draftEmailId,
              },
            },
          ],
        },
      },
    })
  } catch (error) {
    console.error("Notion API error updating draft status:", error)
    throw error
  }
}

/**
 * Creates a contract page in Notion with the provided HTML content
 * @param contractHtml - The rendered HTML contract
 * @param contractData - Contract metadata (client name, project name, etc.)
 * @param parentPageId - Optional parent page ID. If not provided, creates a standalone page
 * @returns The Notion page URL
 */
export async function createContractPage(
  contractHtml: string,
  contractData: {
    clientName: string
    companyName?: string
    projectName: string
  },
  parentPageId?: string
): Promise<string> {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not configured")
  }

  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  })

  try {
    // Determine parent - use provided parentPageId or workspace
    const parent: { type: "page_id"; page_id: string } | { type: "workspace"; workspace: true } = parentPageId
      ? { type: "page_id" as const, page_id: parentPageId }
      : { type: "workspace" as const, workspace: true as const }

    // Create the page with title
    const pageTitle = `Contract - ${contractData.projectName} - ${contractData.clientName}`
    const page = await notion.pages.create({
      parent,
      properties: {
        title: {
          title: [
            {
              text: {
                content: pageTitle,
              },
            },
          ],
        },
      },
    })

    // Add contract content as HTML in code blocks
    // Split HTML into chunks (Notion has 2000 char limit per code block)
    const chunkSize = 1900 // Leave buffer
    const htmlChunks: BlockObjectRequest[] = []

    // Add header
    const headerBlocks: BlockObjectRequest[] = [
      {
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: [
            {
              text: {
                content: "Service Agreement",
              },
            },
          ],
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              text: {
                content: `Contract for ${contractData.clientName}${contractData.companyName ? ` (${contractData.companyName})` : ""} - ${contractData.projectName}`,
              },
            },
          ],
        },
      },
      {
        object: "block",
        type: "divider",
        divider: {},
      },
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              text: {
                content: "Contract Document",
              },
            },
          ],
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              text: {
                content: "The contract HTML is provided below. You can copy this HTML and view it in a browser, or use it to generate a PDF.",
              },
            },
          ],
        },
      },
    ]

    // Split HTML into chunks
    for (let i = 0; i < contractHtml.length; i += chunkSize) {
      htmlChunks.push({
        object: "block",
        type: "code",
        code: {
          rich_text: [
            {
              text: {
                content: contractHtml.substring(i, i + chunkSize),
              },
            },
          ],
          language: "html",
        },
      })
    }

    const children: BlockObjectRequest[] = [
      ...headerBlocks,
      ...htmlChunks,
    ]

    // Append blocks in batches (Notion API limit is 100 blocks per request)
    const batchSize = 100
    for (let i = 0; i < children.length; i += batchSize) {
      await notion.blocks.children.append({
        block_id: page.id,
        children: children.slice(i, i + batchSize),
      })
    }

    // Get the shareable URL
    // Notion page URLs are in format: https://notion.so/{page_id}
    // We need to convert the page ID to the proper format
    const pageIdFormatted = page.id.replace(/-/g, "")
    const notionUrl = `https://notion.so/${pageIdFormatted}`

    return notionUrl
  } catch (error) {
    console.error("Notion API error creating contract page:", error)
    throw error
  }
}
