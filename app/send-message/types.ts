import { z } from "zod"
import { clientMessageSchema, contractSchema, proposalSchema } from "./schemas/form-schemas"

export type ClientMessageFormData = z.infer<typeof clientMessageSchema>
export type ContractFormData = z.infer<typeof contractSchema>
export type ProposalFormData = z.infer<typeof proposalSchema>

export type TabType = "message" | "contract" | "proposal"
