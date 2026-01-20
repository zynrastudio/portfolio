/**
 * Helper functions for processing email templates and replacing variables
 */

export interface WelcomeEmailData {
  name: string
  email: string
  service: string
  company?: string
  budgetRange?: string
  timeline?: string
  message?: string
  schedulingLink?: string
}

export interface RejectionEmailData {
  name: string
  email: string
  rejectionReason?: string
}

/**
 * Gets human-readable label for budget range
 */
export function getBudgetLabel(value: string): string {
  const budgetRanges = [
    { value: "under-10k", label: "Under $10,000" },
    { value: "10k-25k", label: "$10,000 - $25,000" },
    { value: "25k-50k", label: "$25,000 - $50,000" },
    { value: "50k-100k", label: "$50,000 - $100,000" },
    { value: "100k-plus", label: "$100,000+" },
    { value: "not-sure", label: "Not sure yet" },
  ]
  return budgetRanges.find((r) => r.value === value)?.label || value
}

/**
 * Gets human-readable label for timeline
 */
export function getTimelineLabel(value: string): string {
  const timelines = [
    { value: "asap", label: "ASAP" },
    { value: "1-3-months", label: "1-3 months" },
    { value: "3-6-months", label: "3-6 months" },
    { value: "6-12-months", label: "6-12 months" },
    { value: "flexible", label: "Flexible" },
  ]
  return timelines.find((t) => t.value === value)?.label || value
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
 * Replaces variables in Welcome email template
 * @param template - HTML template string with placeholders like {name}, {service}, etc.
 * @param data - Lead data to replace variables with
 * @returns Template with all variables replaced
 */
export function replaceWelcomeTemplateVariables(
  template: string,
  data: WelcomeEmailData
): string {
  const {
    name,
    service,
    company,
    budgetRange,
    timeline,
    message,
    schedulingLink,
  } = data

  // Default scheduling link if not provided
  const scheduleLink = schedulingLink || "https://cal.com/zynra.studio"

  // Build replacement strings
  const companyText = company ? ` and ${escapeHtml(company)}` : ""
  const budgetText = budgetRange
    ? ` with a budget around ${escapeHtml(getBudgetLabel(budgetRange))}`
    : ""
  const timelineText = timeline
    ? ` and a timeline of ${escapeHtml(getTimelineLabel(timeline))}`
    : ""
  const messageText = message
    ? ` We noted your message about ${escapeHtml(
        message.substring(0, 100)
      )}${message.length > 100 ? "..." : ""}.`
    : ""

  // Replace all variables in the template
  const result = template
    .replace(/{name}/g, escapeHtml(name))
    .replace(/{service}/g, escapeHtml(service))
    .replace(/{company}/g, companyText)
    .replace(/{budgetRange}/g, budgetText)
    .replace(/{timeline}/g, timelineText)
    .replace(/{message}/g, messageText)
    .replace(/{schedulingLink}/g, escapeHtml(scheduleLink))

  return result
}

/**
 * Replaces variables in Rejection email template
 * @param template - HTML template string with placeholders like {name}, {reason}
 * @param data - Lead data to replace variables with
 * @returns Template with all variables replaced
 */
export function replaceRejectionTemplateVariables(
  template: string,
  data: RejectionEmailData
): string {
  const { name, rejectionReason } = data

  const reasonText = rejectionReason
    ? ` ${escapeHtml(rejectionReason)}`
    : " We appreciate your understanding."

  // Replace all variables in the template
  const result = template
    .replace(/{name}/g, escapeHtml(name))
    .replace(/{reason}/g, reasonText)

  return result
}
