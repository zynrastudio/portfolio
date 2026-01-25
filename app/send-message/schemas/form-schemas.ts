import { z } from "zod"

// Form validation schema
export const clientMessageSchema = z.object({
  to: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required"),
  subject: z.string().optional(),
  greeting: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  additionalSections: z
    .array(
      z.object({
        title: z.string().optional(),
        content: z.string().min(1, "Section content is required"),
      })
    )
    .optional(),
  ctaButton: z
    .object({
      text: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
  additionalInfo: z.string().optional(),
  signature: z.string().optional(),
})

// Contract form schema
export const contractSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  companyName: z.string().optional(),
  projectName: z.string().min(1, "Project name is required"),
  scopeSummary: z.string().optional(),
  fee: z.number(),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  startDate: z.string().optional(),
  revisionsChangeRequests: z.string().optional(),
  confidentialityClause: z.string().optional(),
  liabilityLimitation: z.string().optional(),
})

// Proposal form schema
export const proposalSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  companyName: z.string().optional(),
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().min(1, "Project description is required"),
  deliverables: z.string().min(1, "Deliverables are required"),
  timeline: z.string().min(1, "Timeline is required"),
  fee: z.number(),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  startDate: z.string().optional(),
  additionalNotes: z.string().optional(),
})
