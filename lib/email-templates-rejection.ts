interface RejectionEmailData {
  name: string
  reason?: string
}

/**
 * Generates a rejection email template for archived leads
 * Professional rejection message matching acknowledgment email design
 */
export function generateRejectionEmailTemplate(
  data: RejectionEmailData
): { html: string; text: string } {
  const { name, reason } = data

  // HTML Email Template
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Thank you for your interest - Zynra Studio</title>
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
                Thank you for taking the time to reach out to Zynra Studio and for your interest in working with us. We truly appreciate you considering us for your project.
              </p>
            </td>
          </tr>

          <!-- Rejection Message -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin: 0 0 20px 0; font-size: 11px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(0, 0, 0, 0.4);">
                      Our Decision
                    </p>
                    <p style="margin: 0; font-size: 16px; font-weight: 300; color: rgba(0, 0, 0, 0.8); line-height: 1.7; letter-spacing: -0.1px;">
                      After careful consideration, we've decided that we're not the right fit for your project at this time.${reason ? ` ${escapeHtml(reason)}` : " We appreciate your understanding."}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Thank You & Closing -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              <p style="margin: 0; font-size: 16px; font-weight: 300; color: rgba(0, 0, 0, 0.8); line-height: 1.7; letter-spacing: -0.1px;">
                We wish you the very best with your project and hope you find the perfect partner to bring your vision to life. If your needs change in the future, we'd be happy to hear from you again.
              </p>
            </td>
          </tr>

          <!-- Additional Info -->
          <tr>
            <td style="padding: 0 0 40px 0; border-top: 1px solid rgba(0, 0, 0, 0.1);">
              <p style="margin: 32px 0 0 0; font-size: 14px; font-weight: 300; color: rgba(0, 0, 0, 0.6); line-height: 1.6;">
                If you have any questions, feel free to reach out at <a href="mailto:contact@zynra.studio" style="color: #000000; text-decoration: underline;">contact@zynra.studio</a>.
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

Thank you for taking the time to reach out to Zynra Studio and for your interest in working with us. We truly appreciate you considering us for your project.

Our Decision:
After careful consideration, we've decided that we're not the right fit for your project at this time.${reason ? ` ${reason}` : " We appreciate your understanding."}

We wish you the very best with your project and hope you find the perfect partner to bring your vision to life. If your needs change in the future, we'd be happy to hear from you again.

If you have any questions, feel free to reach out at contact@zynra.studio.

Best regards,
The Zynra Studio Team
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
