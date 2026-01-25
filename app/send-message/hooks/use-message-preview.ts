import * as React from "react"
import { generateClientMessageEmail } from "@/lib/email-templates-client-message"
import type { ClientMessageFormData } from "../types"

export function useMessagePreview(
  showPreview: boolean,
  activeTab: "message" | "contract" | "proposal",
  watchedValues: ClientMessageFormData
) {
  const [previewHtml, setPreviewHtml] = React.useState<string>("")

  React.useEffect(() => {
    if (showPreview && activeTab === "message" && watchedValues.name && watchedValues.message) {
      try {
        const ctaButton = watchedValues.ctaButton?.text && watchedValues.ctaButton?.url
          ? {
              text: watchedValues.ctaButton.text,
              url: watchedValues.ctaButton.url,
            }
          : undefined

        const { html } = generateClientMessageEmail({
          name: watchedValues.name || "Preview Name",
          subject: watchedValues.subject,
          greeting: watchedValues.greeting,
          message: watchedValues.message || "",
          additionalSections: watchedValues.additionalSections,
          ctaButton,
          additionalInfo: watchedValues.additionalInfo,
          signature: watchedValues.signature || "Zynra Studio Team",
        })
        setPreviewHtml(html)
      } catch (error) {
        console.error("Preview generation error:", error)
      }
    }
  }, [showPreview, activeTab, watchedValues])

  return previewHtml
}
