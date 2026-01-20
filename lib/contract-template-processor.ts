/**
 * Helper functions for processing contract templates and replacing variables
 */

export interface ContractData {
  clientName: string
  companyName: string
  projectName: string
  scopeSummary: string
  fee: number | string
  paymentTerms: string
  startDate: string
}

/**
 * Formats a number as currency (USD)
 */
function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(numAmount)) {
    return String(amount)
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)
}

/**
 * Formats a date string to a readable format
 */
function formatDate(dateString: string): string {
  if (!dateString) return "TBD"
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  } catch {
    return dateString
  }
}

/**
 * Escapes HTML to prevent XSS attacks
 */
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

/**
 * Replaces variables in contract template
 * @param template - HTML template string with placeholders like {{clientName}}, {{fee}}, etc.
 * @param data - Contract data to replace variables with
 * @returns Template with all variables replaced
 */
export function replaceContractVariables(
  template: string,
  data: ContractData
): string {
  const {
    clientName,
    companyName,
    projectName,
    scopeSummary,
    fee,
    paymentTerms,
    startDate,
  } = data

  // Format values
  const formattedFee = formatCurrency(fee)
  const formattedStartDate = formatDate(startDate)
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Escape HTML for safety (except for scopeSummary which may contain formatted HTML)
  const safeClientName = escapeHtml(clientName)
  const safeCompanyName = escapeHtml(companyName || "N/A")
  const safeProjectName = escapeHtml(projectName)
  const safePaymentTerms = escapeHtml(paymentTerms)

  // Replace all variables in the template
  const result = template
    .replace(/\{\{clientName\}\}/g, safeClientName)
    .replace(/\{\{companyName\}\}/g, safeCompanyName)
    .replace(/\{\{projectName\}\}/g, safeProjectName)
    .replace(/\{\{scopeSummary\}\}/g, scopeSummary || "To be determined during project kickoff.")
    .replace(/\{\{fee\}\}/g, formattedFee.replace("$", "")) // Remove $ since template has it
    .replace(/\{\{paymentTerms\}\}/g, safePaymentTerms)
    .replace(/\{\{startDate\}\}/g, formattedStartDate)
    .replace(/\{\{currentDate\}\}/g, currentDate)

  return result
}
