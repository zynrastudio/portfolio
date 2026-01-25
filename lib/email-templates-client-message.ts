interface ClientMessageData {
  name: string
  subject?: string
  greeting?: string
  message: string
  additionalSections?: Array<{
    title?: string
    content: string
  }>
  ctaButton?: {
    text: string
    url: string
  }
  additionalInfo?: string
  signature?: string
  company?: string
}

/**
 * Generates a flexible client message email template
 * Follows the same design system as acknowledgment, welcome, and rejection emails
 * Use this for custom client communications that need to match your brand style
 */
export function generateClientMessageEmail(
  data: ClientMessageData
): { html: string; text: string } {
  const {
    name,
    subject = "Message from Zynra Studio",
    greeting,
    message,
    additionalSections = [],
    ctaButton,
    additionalInfo,
    signature,
    company,
  } = data

  // Default signature - always use "Zynra Studio Team" if empty or not provided
  const signatureText = (signature && signature.trim() !== "") ? signature : "Zynra Studio Team"

  // Default greeting if not provided
  const greetingText = greeting || `Hi ${escapeHtml(name)},`

  // HTML Email Template
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    p {margin: 0 !important; padding: 0 !important; text-indent: 0 !important;}
    div {margin: 0 !important; padding: 0 !important; text-indent: 0 !important;}
    td {text-indent: 0 !important; padding-left: 0 !important;}
  </style>
  <![endif]-->
  <style type="text/css">
    p {margin: 0; padding: 0; text-indent: 0;}
    div {margin: 0; padding: 0; text-indent: 0;}
    td {text-indent: 0;}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 0 0 40px 0; border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: left;">
                    <h1 style="margin: 0; padding: 0; font-size: 24px; font-weight: 300; letter-spacing: -0.5px; color: #000000; line-height: 1.2; text-align: left;">
                      Zynra <span style="font-weight: 200; color: rgba(0, 0, 0, 0.4);">Studio</span>
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 40px 0 24px 0; text-align: left;">
              <p style="margin: 0; padding: 0; font-size: 18px; font-weight: 300 !important; color: #000000; line-height: 1.6; letter-spacing: -0.2px; text-align: left;">
                ${greetingText}
              </p>
            </td>
          </tr>

          <!-- Main Message -->
          <tr>
            <td style="padding: 0 0 32px 0; text-align: left; margin: 0;">
              <div style="margin: 0 !important; padding: 0 !important; font-size: 16px; font-weight: 300; color: rgba(0, 0, 0, 0.8); line-height: 1.7; letter-spacing: -0.1px; text-indent: 0 !important; white-space: pre-wrap; text-align: left !important; display: block;">${formatMessage(message)}</div>
            </td>
          </tr>

          ${additionalSections
            .map(
              (section) => `
          <!-- Additional Section -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              ${section.title ? `
              <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(0, 0, 0, 0.4);">
                ${escapeHtml(section.title)}
              </p>
              ` : ""}
              <p style="margin: 0; font-size: 16px; font-weight: 300; color: rgba(0, 0, 0, 0.8); line-height: 1.7; letter-spacing: -0.1px; white-space: pre-wrap;">
                ${formatMessage(section.content)}
              </p>
            </td>
          </tr>
          `
            )
            .join("")}

          ${ctaButton ? `
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 0 40px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #000000; border-radius: 8px;">
                    <a href="${escapeHtml(ctaButton.url)}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 300; letter-spacing: -0.2px; color: #ffffff; text-decoration: none; line-height: 1.5;">
                      ${escapeHtml(ctaButton.text)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ""}

          ${additionalInfo ? `
          <!-- Additional Info -->
          <tr>
            <td style="padding: 0 0 40px 0; border-top: 1px solid rgba(0, 0, 0, 0.1);">
              <p style="margin: 32px 0 0 0; font-size: 14px; font-weight: 300; color: rgba(0, 0, 0, 0.6); line-height: 1.6;">
                ${formatMessage(additionalInfo)}
              </p>
            </td>
          </tr>
          ` : ""}

          <!-- Footer -->
          <tr>
            <td style="padding: 40px 0 0 0; border-top: 1px solid rgba(0, 0, 0, 0.1);">
              <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 300; color: #000000; line-height: 1.5;">
                Best regards,<br>
                <span style="font-weight: 400;">${escapeHtml(signatureText)}</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  // Plain Text Fallback
  const text = `
${greetingText}

${message}

${additionalSections
  .map((section) => `${section.title ? `${section.title}:\n` : ""}${section.content}\n`)
  .join("\n")}

${ctaButton ? `\n${ctaButton.text}: ${ctaButton.url}\n` : ""}

${additionalInfo ? `\n${additionalInfo}\n` : ""}

Best regards,
${signatureText}
  `.trim()

  return { html, text }
}

/**
 * Formats message text, preserving line breaks and escaping HTML
 * Supports basic formatting like bold (**text**) and italic (*text*)
 */
function formatMessage(text: string): string {
  // Trim leading and trailing whitespace, but preserve internal formatting
  let formatted = text.trim()

  // Escape HTML first
  formatted = escapeHtml(formatted)

  // Normalize multiple consecutive newlines to maximum of 2 (one blank line)
  formatted = formatted.replace(/\n{3,}/g, "\n\n")

  // Convert line breaks to <br> tags
  formatted = formatted.replace(/\n/g, "<br>")

  // Convert markdown-style bold (**text** or __text__) to HTML
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #000000; font-weight: 400;">$1</strong>')
  formatted = formatted.replace(/__(.+?)__/g, '<strong style="color: #000000; font-weight: 400;">$1</strong>')

  // Convert markdown-style italic (*text* or _text_) to HTML
  formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  formatted = formatted.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>')

  // Convert markdown links [text](url) to HTML links
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #000000; text-decoration: underline;">$1</a>')

  return formatted
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
