/**
 * DocSend API Client
 * 
 * ⚠️ DEPRECATED: We now use Notion pages for contract sharing instead of DocSend.
 * This file is kept for reference but is no longer used in the workflow.
 * 
 * DocSend API Documentation: https://docs.docsend.com/
 * 
 * Note: DocSend API requires Advanced plan or higher, which is why we switched to Notion pages.
 */

export interface DocSendUploadOptions {
  fileName: string
  content: string | Buffer
  contentType?: string
  recipientEmail?: string
  requireEmail?: boolean
  password?: string
  expiresInDays?: number
}

export interface DocSendDocument {
  id: string
  url: string
  trackingUrl: string
  createdAt: string
}

/**
 * Uploads a document to DocSend
 * 
 * @param options - Upload options including file content and access settings
 * @returns DocSend document with shareable URL
 */
export async function uploadContractToDocSend(
  options: DocSendUploadOptions
): Promise<DocSendDocument> {
  const apiKey = process.env.DOCSEND_API_KEY
  const teamId = process.env.DOCSEND_TEAM_ID

  if (!apiKey || !teamId) {
    throw new Error(
      "DocSend API credentials not configured. Set DOCSEND_API_KEY and DOCSEND_TEAM_ID environment variables."
    )
  }

  // DocSend API endpoint
  const apiUrl = "https://api.docsend.com/v1/documents"

  // Prepare form data for file upload
  const formData = new FormData()
  
  // Convert content to Blob
  const blob = typeof options.content === "string"
    ? new Blob([options.content], { type: options.contentType || "text/html" })
    : new Blob([Uint8Array.from(options.content)], { type: options.contentType || "application/pdf" })
  
  formData.append("file", blob, options.fileName)
  
  if (options.recipientEmail) {
    formData.append("recipient_email", options.recipientEmail)
  }
  
  if (options.requireEmail !== undefined) {
    formData.append("require_email", String(options.requireEmail))
  }
  
  if (options.password) {
    formData.append("password", options.password)
  }
  
  if (options.expiresInDays) {
    formData.append("expires_in_days", String(options.expiresInDays))
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-DocSend-Team-Id": teamId,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `DocSend API error: ${response.status} ${response.statusText}. ${errorText}`
      )
    }

    const data = await response.json()

    return {
      id: data.id,
      url: data.url || data.shareable_url,
      trackingUrl: data.tracking_url || data.analytics_url,
      createdAt: data.created_at || new Date().toISOString(),
    }
  } catch (error) {
    console.error("DocSend upload error:", error)
    throw error
  }
}

/**
 * Helper function to upload HTML contract to DocSend
 * 
 * @param contractHtml - HTML content of the contract
 * @param recipientEmail - Client email address
 * @param projectName - Project name for file naming
 * @returns DocSend document URL
 */
export async function uploadContract(
  contractHtml: string,
  recipientEmail: string,
  projectName: string
): Promise<string> {
  const sanitizedProjectName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  const document = await uploadContractToDocSend({
    fileName: `contract-${sanitizedProjectName}.html`,
    content: contractHtml,
    contentType: "text/html",
    recipientEmail,
    requireEmail: true, // Require email verification to view
  })

  return document.url
}

/**
 * Note for Make.com Integration:
 * 
 * Instead of using this client directly, you can use Make.com's HTTP module:
 * 
 * 1. Method: POST
 * 2. URL: https://api.docsend.com/v1/documents
 * 3. Headers:
 *    - Authorization: Bearer {{DOCSEND_API_KEY}}
 *    - X-DocSend-Team-Id: {{DOCSEND_TEAM_ID}}
 *    - Content-Type: multipart/form-data
 * 4. Body (form-data):
 *    - file: [HTML content from contract API]
 *    - recipient_email: {{1.properties_value.Email}}
 *    - require_email: true
 * 
 * The response will contain:
 * - url: Shareable DocSend link
 * - tracking_url: Analytics URL
 * - id: Document ID
 */
