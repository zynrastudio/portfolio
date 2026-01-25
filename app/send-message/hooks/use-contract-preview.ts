import * as React from "react"
import type { ContractFormData } from "../types"

export function useContractPreview(
  showPreview: boolean,
  activeTab: "message" | "contract" | "proposal",
  watchedValues: ContractFormData
) {
  const [previewHtml, setPreviewHtml] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(false)

  const generatePreview = React.useCallback(async (data: ContractFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadData: data }),
      })
      const result = await response.json()
      if (result.success && result.html) {
        setPreviewHtml(result.html)
      }
    } catch (error) {
      console.error("Error generating contract preview:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (showPreview && activeTab === "contract" && watchedValues.clientName && watchedValues.projectName) {
      generatePreview(watchedValues)
    }
  }, [showPreview, activeTab, watchedValues, generatePreview])

  return { previewHtml, isLoading, generatePreview }
}
