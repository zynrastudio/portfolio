"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import Header from "@/components/ui/header"
import Footer from "@/components/ui/footer"
import { type ContractData } from "@/lib/contract-template-processor"
import { clientMessageSchema, contractSchema, proposalSchema } from "./schemas/form-schemas"
import type { ClientMessageFormData, ContractFormData, ProposalFormData, TabType } from "./types"
import { MessageForm } from "./components/message-form"
import { ContractForm } from "./components/contract-form"
import { ProposalForm } from "./components/proposal-form"
import { FormTabs } from "./components/form-tabs"
import { PreviewPanel } from "./components/preview-panel"
import { useMessagePreview } from "./hooks/use-message-preview"
import { useContractPreview } from "./hooks/use-contract-preview"
import { useProposalPreview } from "./hooks/use-proposal-preview"

export default function SendMessagePage() {
  const [activeTab, setActiveTab] = React.useState<TabType>("message")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = React.useState<string>("")
  const [showPreview, setShowPreview] = React.useState(false)
  const [previewHtml, setPreviewHtml] = React.useState<string>("")
  const [attachments, setAttachments] = React.useState<Array<{ file: File; id: string }>>([])
  const [generatedContractHtml, setGeneratedContractHtml] = React.useState<string>("")
  const [generatedProposalHtml, setGeneratedProposalHtml] = React.useState<string>("")

  // Message form
  const messageForm = useForm<ClientMessageFormData>({
    resolver: zodResolver(clientMessageSchema),
    defaultValues: {
      additionalSections: [],
      ctaButton: undefined,
    },
  })

  // Contract form
  const contractForm = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
      revisionsChangeRequests: "This agreement includes up to 2 rounds of revisions per deliverable. Additional revisions or significant scope changes will be billed at our standard hourly rate of $150/hour and require written approval before work begins.",
      confidentialityClause: "Both parties agree to maintain confidentiality of all proprietary information shared during the course of this project. This agreement remains in effect indefinitely.",
      liabilityLimitation: "Zynra Studio's total liability under this agreement shall not exceed the total project fee. We are not liable for any indirect, incidental, or consequential damages.",
    },
  })

  // Proposal form
  const proposalForm = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: messageForm.control,
    name: "additionalSections",
  })

  const watchedMessageValues = messageForm.watch()
  const watchedContractValues = contractForm.watch()
  const watchedProposalValues = proposalForm.watch()

  // Use preview hooks
  const messagePreviewHtml = useMessagePreview(showPreview, activeTab, watchedMessageValues)
  const { previewHtml: contractPreviewHtml, generatePreview: generateContractPreview } = useContractPreview(
    showPreview,
    activeTab,
    watchedContractValues
  )
  const { previewHtml: proposalPreviewHtml, generatePreview: generateProposalPreview } = useProposalPreview(
    showPreview,
    activeTab,
    watchedProposalValues
  )

  // Update preview HTML based on active tab
  React.useEffect(() => {
    if (activeTab === "message") {
      setPreviewHtml(messagePreviewHtml)
    } else if (activeTab === "contract") {
      setPreviewHtml(contractPreviewHtml)
    } else if (activeTab === "proposal") {
      setPreviewHtml(proposalPreviewHtml)
    }
  }, [activeTab, messagePreviewHtml, contractPreviewHtml, proposalPreviewHtml])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const maxSize = 10 * 1024 * 1024 // 10MB per file

    const validFiles: File[] = []
    const invalidFiles: string[] = []

    files.forEach((file) => {
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      } else {
        validFiles.push(file)
      }
    })

    if (invalidFiles.length > 0) {
      setErrorMessage(`Files too large (max 10MB): ${invalidFiles.join(", ")}`)
      setSubmitStatus("error")
      setTimeout(() => {
        setSubmitStatus("idle")
        setErrorMessage("")
      }, 5000)
    }

    const newAttachments = validFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
    }))
    setAttachments((prev) => [...prev, ...newAttachments])
    // Reset input
    e.target.value = ""
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id))
  }

  const downloadPDF = async (html: string) => {
    try {
      // Open print dialog for PDF generation
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(html)
        printWindow.document.close()
        printWindow.print()
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
      setErrorMessage("Failed to generate PDF. Please try printing the preview instead.")
      setSubmitStatus("error")
    }
  }

  const onMessageSubmit = async (data: ClientMessageFormData) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    // Validate CTA button - both fields must be present if one is filled
    if (data.ctaButton && (data.ctaButton.text || data.ctaButton.url)) {
      if (!data.ctaButton.text || !data.ctaButton.url) {
        setSubmitStatus("error")
        setErrorMessage("Both button text and URL are required for CTA button")
        setIsSubmitting(false)
        return
      }
    }

    // Clean up data - remove ctaButton if not fully filled
    const cleanedData = {
      ...data,
      ctaButton: data.ctaButton?.text && data.ctaButton?.url ? data.ctaButton : undefined,
    }

    // Convert attachments to base64
    const attachmentPromises = attachments.map(async (att) => {
      const arrayBuffer = await att.file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      return {
        filename: att.file.name,
        content: base64,
        type: att.file.type || "application/octet-stream",
      }
    })

    const attachmentData = await Promise.all(attachmentPromises)

    try {
      const response = await fetch("/api/send-client-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...cleanedData,
          attachments: attachmentData.length > 0 ? attachmentData : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email")
      }

      setSubmitStatus("success")
      messageForm.reset()
      setAttachments([])

      setTimeout(() => {
        setSubmitStatus("idle")
      }, 3000)
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSection = () => {
    append({ title: "", content: "" })
  }

  const onContractSubmit = async (data: ContractFormData) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadData: data }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate contract")
      }

      setGeneratedContractHtml(result.html)
      setSubmitStatus("success")

      setTimeout(() => {
        setSubmitStatus("idle")
      }, 3000)
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onProposalSubmit = async (data: ProposalFormData) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const contractData: ContractData = {
        clientName: data.clientName,
        companyName: data.companyName || "",
        projectName: data.projectName,
        scopeSummary:
          data.projectDescription +
          (data.timeline ? "\n\nTimeline: " + data.timeline : "") +
          (data.additionalNotes ? "\n\nNotes: " + data.additionalNotes : ""),
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

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate proposal")
      }

      setGeneratedProposalHtml(result.html)
      setSubmitStatus("success")

      setTimeout(() => {
        setSubmitStatus("idle")
      }, 3000)
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setShowPreview(false)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto pt-32 pb-8 px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-light tracking-tight mb-2">
              Client Communication
            </h1>
            <p className="text-white/60">
              Send messages, generate contracts, or create proposals for your clients.
            </p>
          </div>

          <FormTabs activeTab={activeTab} onTabChange={handleTabChange} />

          {submitStatus === "success" && activeTab === "message" ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-16 w-16 text-green-400" />
              <div className="text-center space-y-2">
                <p className="text-xl font-light text-white">
                  Email sent successfully!
                </p>
                <p className="text-sm text-white/60">
                  Your message has been delivered to the client.
                </p>
              </div>
            </div>
          ) : submitStatus === "success" && (activeTab === "contract" || activeTab === "proposal") ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-16 w-16 text-green-400" />
              <div className="text-center space-y-4">
                <p className="text-xl font-light text-white">
                  {activeTab === "contract" ? "Contract" : "Proposal"} generated successfully!
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      const html = activeTab === "contract" ? generatedContractHtml : generatedProposalHtml
                      downloadPDF(html)
                    }}
                    className="bg-white text-black hover:bg-white/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPreview(true)
                      if (activeTab === "contract") {
                        setPreviewHtml(generatedContractHtml)
                      } else {
                        setPreviewHtml(generatedProposalHtml)
                      }
                    }}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="space-y-6">
                {activeTab === "message" && (
                  <MessageForm
                    form={{ register: messageForm.register, control: messageForm.control }}
                    fields={fields}
                    addSection={addSection}
                    remove={remove}
                    attachments={attachments}
                    handleFileSelect={handleFileSelect}
                    removeAttachment={removeAttachment}
                    onSubmit={messageForm.handleSubmit(onMessageSubmit)}
                    isSubmitting={isSubmitting}
                    errors={messageForm.formState.errors}
                    watchedValues={watchedMessageValues}
                    submitStatus={submitStatus}
                    errorMessage={errorMessage}
                    togglePreview={togglePreview}
                    showPreview={showPreview}
                  />
                )}

                {activeTab === "contract" && (
                  <ContractForm
                    form={contractForm}
                    onSubmit={contractForm.handleSubmit(onContractSubmit)}
                    isSubmitting={isSubmitting}
                    errors={contractForm.formState.errors}
                    submitStatus={submitStatus}
                    errorMessage={errorMessage}
                    togglePreview={togglePreview}
                    showPreview={showPreview}
                    watchedValues={watchedContractValues}
                  />
                )}

                {activeTab === "proposal" && (
                  <ProposalForm
                    form={proposalForm}
                    onSubmit={proposalForm.handleSubmit(onProposalSubmit)}
                    isSubmitting={isSubmitting}
                    errors={proposalForm.formState.errors}
                    submitStatus={submitStatus}
                    errorMessage={errorMessage}
                    togglePreview={togglePreview}
                    showPreview={showPreview}
                    watchedValues={watchedProposalValues}
                  />
                )}
              </div>

              {/* Preview */}
              <PreviewPanel
                previewHtml={previewHtml}
                activeTab={activeTab}
                showPreview={showPreview}
                onTogglePreview={togglePreview}
                attachments={activeTab === "message" ? attachments : []}
                onDownloadPDF={
                  activeTab === "contract" || activeTab === "proposal"
                    ? () => {
                        const html = activeTab === "contract" ? generatedContractHtml : generatedProposalHtml
                        downloadPDF(html)
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
