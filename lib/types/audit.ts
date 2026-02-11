import { z } from "zod"

export const auditSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  whatBuilding: z.string().min(1, "Required"),
  stage: z.enum(["idea", "mvp-built", "launched-low-traction", "generating-revenue"]),
  productType: z.array(z.string()).min(1, "Select at least one"),
  biggestBottleneck: z.string().min(1, "Required"),
  timeline: z.enum(["immediately", "1-3-months", "exploring", "not-sure"]),
  investingIntent: z.enum(["yes", "maybe", "just-exploring"]),
  websiteUrl: z.string().url("Enter a valid URL"),
})

export type AuditFormData = z.infer<typeof auditSchema>

export const stageOptions = [
  { value: "idea", label: "Idea (pre-build)" },
  { value: "mvp-built", label: "MVP built" },
  { value: "launched-low-traction", label: "Launched but low traction" },
  { value: "generating-revenue", label: "Generating revenue" },
] as const

export const productTypeOptions = [
  { value: "ai-saas", label: "AI SaaS" },
  { value: "ai-agent", label: "AI Agent" },
  { value: "ai-web-app", label: "AI-powered Web App" },
  { value: "marketplace", label: "Marketplace" },
  { value: "internal-tool", label: "Internal Tool" },
  { value: "other", label: "Other" },
] as const

export const timelineOptions = [
  { value: "immediately", label: "Immediately (0–1 month)" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "exploring", label: "Exploring options" },
  { value: "not-sure", label: "Not sure yet" },
] as const

export const investingIntentOptions = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "just-exploring", label: "Just exploring" },
] as const
