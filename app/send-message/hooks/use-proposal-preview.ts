import * as React from "react"
import type { ProposalFormData } from "../types"
import type { ContractData } from "@/lib/contract-template-processor"

export function useProposalPreview(
  showPreview: boolean,
  activeTab: "message" | "contract" | "proposal",
  watchedValues: ProposalFormData
) {
  const [previewHtml, setPreviewHtml] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(false)

  const generatePreview = React.useCallback(async (data: ProposalFormData) => {
    setIsLoading(true)
    try {
      const contractData: ContractData = {
        clientName: data.clientName,
        companyName: data.companyName || "",
        projectName: data.projectName,
        scopeSummary: data.projectDescription + (data.timeline ? "\n\nTimeline: " + data.timeline : "") + (data.additionalNotes ? "\n\nNotes: " + data.additionalNotes : ""),
        deliverables: data.deliverables,
        fee: data.fee,
        paymentTerms: data.paymentTerms,
        startDate: data.startDate || new Date().toISOString().split("T")[0],
      }
      const response = await fetch("/api/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadData: contractData }),
      })
      const result = await response.json()
      if (result.success && result.html) {
        setPreviewHtml(result.html)
      }
    } catch (error) {
      console.error("Error generating proposal preview:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (showPreview && activeTab === "proposal" && watchedValues.clientName && watchedValues.projectName) {
      generatePreview(watchedValues)
    }
  }, [showPreview, activeTab, watchedValues, generatePreview])

  return { previewHtml, isLoading, generatePreview }
}
