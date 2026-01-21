interface AcknowledgmentEmailData {
  name: string
  service: string
  budgetRange: string
  timeline: string
  company?: string
}

interface HelperFunctions {
  getBudgetLabel: (value: string) => string
  getTimelineLabel: (value: string) => string
}

export function generateAcknowledgmentEmail(
  data: AcknowledgmentEmailData,
  helpers: HelperFunctions
): { html: string; text: string } {
  const { name, service, budgetRange, timeline, company } = data
  const { getBudgetLabel, getTimelineLabel } = helpers

  // HTML Email Template
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Thank you for your quote request</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
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
                  <td>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 300; letter-spacing: -0.5px; color: #000000; line-height: 1.2;">
                      Zynra <span style="font-weight: 200; color: rgba(0, 0, 0, 0.4);">Studio</span>
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 40px 0 24px 0;">
              <p style="margin: 0; font-size: 18px; font-weight: 300; color: #000000; line-height: 1.6; letter-spacing: -0.2px;">
                Hi ${escapeHtml(name)},
              </p>
            </td>
          </tr>

          <!-- Thank You Message -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              <p style="margin: 0; font-size: 16px; font-weight: 300; color: rgba(0, 0, 0, 0.8); line-height: 1.7; letter-spacing: -0.1px;">
                Thank you for reaching out to Zynra Studio! We've received your quote request for <strong style="color: #000000; font-weight: 400;">${escapeHtml(service)}</strong> and truly appreciate your interest in working with us.
              </p>
            </td>
          </tr>

          <!-- Request Summary Card -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin: 0 0 20px 0; font-size: 11px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(0, 0, 0, 0.4);">
                      Your Request Summary
                    </p>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 0 0 16px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 120px; padding: 0 16px 0 0; vertical-align: top;">
                                <p style="margin: 0; font-size: 12px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(0, 0, 0, 0.4);">
                                  Service
                                </p>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 15px; font-weight: 300; color: #000000; line-height: 1.5;">
                                  ${escapeHtml(service)}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0 0 16px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 120px; padding: 0 16px 0 0; vertical-align: top;">
                                <p style="margin: 0; font-size: 12px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(0, 0, 0, 0.4);">
                                  Budget
                                </p>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 15px; font-weight: 300; color: #000000; line-height: 1.5;">
                                  ${escapeHtml(getBudgetLabel(budgetRange))}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0 0 ${company ? '16px' : '0'} 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 120px; padding: 0 16px 0 0; vertical-align: top;">
                                <p style="margin: 0; font-size: 12px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(0, 0, 0, 0.4);">
                                  Timeline
                                </p>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 15px; font-weight: 300; color: #000000; line-height: 1.5;">
                                  ${escapeHtml(getTimelineLabel(timeline))}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      ${company ? `
                      <tr>
                        <td style="padding: 16px 0 0 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 120px; padding: 0 16px 0 0; vertical-align: top;">
                                <p style="margin: 0; font-size: 12px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(0, 0, 0, 0.4);">
                                  Company
                                </p>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 15px; font-weight: 300; color: #000000; line-height: 1.5;">
                                  ${escapeHtml(company)}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Message -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              <p style="margin: 0; font-size: 16px; font-weight: 300; color: rgba(0, 0, 0, 0.8); line-height: 1.7; letter-spacing: -0.1px;">
                We're excited about the possibility of bringing your project to life. Our team will review your request and get back to you within <strong style="color: #000000; font-weight: 400;">24 hours</strong> with more details and next steps.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 0 40px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #000000; border-radius: 8px;">
                    <a href="https://zynra.studio/projects" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 300; letter-spacing: -0.2px; color: #ffffff; text-decoration: none; line-height: 1.5;">
                      View Our Work
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Additional Info -->
          <tr>
            <td style="padding: 0 0 40px 0; border-top: 1px solid rgba(0, 0, 0, 0.1);">
              <p style="margin: 32px 0 0 0; font-size: 14px; font-weight: 300; color: rgba(0, 0, 0, 0.6); line-height: 1.6;">
                In the meantime, feel free to explore our work to see examples of what we've built. If you have any urgent questions, you can always reach us directly at <a href="mailto:contact@zynra.studio" style="color: #000000; text-decoration: underline;">contact@zynra.studio</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 40px 0 0 0; border-top: 1px solid rgba(0, 0, 0, 0.1);">
              <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 300; color: #000000; line-height: 1.5;">
                Best regards,<br>
                <span style="font-weight: 400;">The Zynra Studio Team</span>
              </p>
              <p style="margin: 24px 0 0 0; font-size: 11px; font-weight: 300; color: rgba(0, 0, 0, 0.3); line-height: 1.5; text-transform: uppercase; letter-spacing: 0.1em;">
                This is an automated confirmation email. Please do not reply to this message.
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
Hi ${name},

Thank you for reaching out to Zynra Studio! We've received your quote request for ${service} and truly appreciate your interest in working with us.

Here's a summary of your request:
- Service: ${service}
- Budget Range: ${getBudgetLabel(budgetRange)}
- Timeline: ${getTimelineLabel(timeline)}
${company ? `- Company: ${company}` : ""}

We're excited about the possibility of bringing your project to life. Our team will review your request and get back to you within 24 hours with more details and next steps.

In the meantime, feel free to explore our work at https://zynra.studio/projects to see examples of what we've built.

If you have any urgent questions, you can always reach us directly at contact@zynra.studio.

Best regards,
The Zynra Studio Team

---
This is an automated confirmation email. Please do not reply to this message.
  `.trim()

  return { html, text }
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
