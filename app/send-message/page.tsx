"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle, Plus, Trash2, Eye, Mail, Paperclip, X, FileText, FileCheck, Download } from "lucide-react"
import { generateClientMessageEmail } from "@/lib/email-templates-client-message"
import Header from "@/components/ui/header"
import Footer from "@/components/ui/footer"
import { type ContractData } from "@/lib/contract-template-processor"

// Form validation schema
const clientMessageSchema = z.object({
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
const contractSchema = z.object({
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
const proposalSchema = z.object({
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

type ClientMessageFormData = z.infer<typeof clientMessageSchema>
type ContractFormData = z.infer<typeof contractSchema>
type ProposalFormData = z.infer<typeof proposalSchema>

type TabType = "message" | "contract" | "proposal"

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

  // Generate message preview
  React.useEffect(() => {
    if (showPreview && activeTab === "message" && watchedMessageValues.name && watchedMessageValues.message) {
      try {
        const ctaButton = watchedMessageValues.ctaButton?.text && watchedMessageValues.ctaButton?.url
          ? {
              text: watchedMessageValues.ctaButton.text,
              url: watchedMessageValues.ctaButton.url,
            }
          : undefined

        const { html } = generateClientMessageEmail({
          name: watchedMessageValues.name || "Preview Name",
          subject: watchedMessageValues.subject,
          greeting: watchedMessageValues.greeting,
          message: watchedMessageValues.message || "",
          additionalSections: watchedMessageValues.additionalSections,
          ctaButton,
          additionalInfo: watchedMessageValues.additionalInfo,
          signature: watchedMessageValues.signature || "Zynra Studio Team",
        })
        setPreviewHtml(html)
      } catch (error) {
        console.error("Preview generation error:", error)
      }
    }
  }, [showPreview, activeTab, watchedMessageValues])

  // Generate contract preview
  React.useEffect(() => {
    if (showPreview && activeTab === "contract" && watchedContractValues.clientName && watchedContractValues.projectName) {
      generateContractPreview(watchedContractValues)
    }
  }, [showPreview, activeTab, watchedContractValues])

  // Generate proposal preview
  React.useEffect(() => {
    if (showPreview && activeTab === "proposal" && watchedProposalValues.clientName && watchedProposalValues.projectName) {
      generateProposalPreview(watchedProposalValues)
    }
  }, [showPreview, activeTab, watchedProposalValues])

  const generateContractPreview = async (data: ContractFormData) => {
    try {
      const response = await fetch("/api/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadData: data }),
      })
      const result = await response.json()
      if (result.success && result.html) {
        setPreviewHtml(result.html)
        setGeneratedContractHtml(result.html)
      }
    } catch (error) {
      console.error("Error generating contract preview:", error)
    }
  }

  const generateProposalPreview = async (data: ProposalFormData) => {
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
        setGeneratedProposalHtml(result.html)
      }
    } catch (error) {
      console.error("Error generating proposal preview:", error)
    }
  }

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
      ctaButton: data.ctaButton?.text && data.ctaButton?.url 
        ? data.ctaButton 
        : undefined,
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
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
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
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
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
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
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

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-white/10">
            <button
              onClick={() => {
                setActiveTab("message")
                setShowPreview(false)
              }}
              className={`px-6 py-3 text-sm font-light transition-colors border-b-2 ${
                activeTab === "message"
                  ? "border-white text-white"
                  : "border-transparent text-white/60 hover:text-white/80"
              }`}
            >
              <Mail className="inline h-4 w-4 mr-2" />
              Message
            </button>
            <button
              onClick={() => {
                setActiveTab("contract")
                setShowPreview(false)
              }}
              className={`px-6 py-3 text-sm font-light transition-colors border-b-2 ${
                activeTab === "contract"
                  ? "border-white text-white"
                  : "border-transparent text-white/60 hover:text-white/80"
              }`}
            >
              <FileText className="inline h-4 w-4 mr-2" />
              Contract
            </button>
            <button
              onClick={() => {
                setActiveTab("proposal")
                setShowPreview(false)
              }}
              className={`px-6 py-3 text-sm font-light transition-colors border-b-2 ${
                activeTab === "proposal"
                  ? "border-white text-white"
                  : "border-transparent text-white/60 hover:text-white/80"
              }`}
            >
              <FileCheck className="inline h-4 w-4 mr-2" />
              Proposal
            </button>
          </div>

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
                    form={messageForm}
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
              {showPreview && previewHtml && (
                <div className="lg:sticky lg:top-8 h-fit">
                  <div className="bg-white rounded-lg shadow-lg p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-light text-black">
                        {activeTab === "message" ? "Email Preview" : activeTab === "contract" ? "Contract Preview" : "Proposal Preview"}
                      </h3>
                      <div className="flex gap-2">
                        {(activeTab === "contract" || activeTab === "proposal") && (
                          <Button
                            type="button"
                            onClick={() => {
                              const html = activeTab === "contract" ? generatedContractHtml : generatedProposalHtml
                              downloadPDF(html)
                            }}
                            size="sm"
                            className="bg-black text-white hover:bg-black/80"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={togglePreview}
                          className="text-black/60 hover:text-black"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded overflow-hidden">
                      <iframe
                        srcDoc={previewHtml}
                        className="w-full h-[600px] border-0"
                        title="Preview"
                      />
                    </div>
                    {attachments.length > 0 && activeTab === "message" && (
                      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Paperclip className="h-4 w-4 text-gray-600" />
                          <h4 className="text-sm font-medium text-gray-700">
                            Attachments ({attachments.length})
                          </h4>
                        </div>
                        <div className="space-y-1">
                          {attachments.map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center justify-between text-xs text-gray-600"
                            >
                              <span className="truncate flex-1">{att.file.name}</span>
                              <span className="ml-2 text-gray-400">
                                {(att.file.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Note: Attachments will be included with the email but cannot be previewed here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
        </div>
      </main>
      <Footer />
    </>
  )
}

// Message Form Component
function MessageForm({
  form,
  fields,
  addSection,
  remove,
  attachments,
  handleFileSelect,
  removeAttachment,
  onSubmit,
  isSubmitting,
  errors,
  watchedValues,
  submitStatus,
  errorMessage,
  togglePreview,
  showPreview,
}: {
  form: {
    register: ReturnType<typeof useForm<ClientMessageFormData>>["register"]
  }
  fields: Array<{ id: string }>
  addSection: () => void
  remove: (index: number) => void
  attachments: Array<{ file: File; id: string }>
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeAttachment: (id: string) => void
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  isSubmitting: boolean
  errors: ReturnType<typeof useForm<ClientMessageFormData>>["formState"]["errors"]
  watchedValues: ClientMessageFormData
  submitStatus: "idle" | "success" | "error"
  errorMessage: string
  togglePreview: () => void
  showPreview: boolean
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="to">
          Recipient Email <span className="text-white/40">*</span>
        </Label>
        <Input
          id="to"
          type="email"
          placeholder="client@example.com"
          {...form.register("to")}
          disabled={isSubmitting}
        />
        {errors.to && (
          <p className="text-sm text-red-400">{errors.to.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">
          Client Name <span className="text-white/40">*</span>
        </Label>
        <Input
          id="name"
          placeholder="John Doe"
          {...form.register("name")}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="subject">Email Subject</Label>
        <Input
          id="subject"
          placeholder="Message from Zynra Studio"
          {...form.register("subject")}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="greeting">Greeting (optional)</Label>
        <Input
          id="greeting"
          placeholder="Hi John,"
          {...form.register("greeting")}
          disabled={isSubmitting}
        />
        <p className="text-xs text-white/40">
          Leave empty to use default: &quot;Hi {watchedValues.name || "[Name]"},&quot;
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">
          Message <span className="text-white/40">*</span>
        </Label>
        <Textarea
          id="message"
          placeholder="Your message here... (supports **bold**, *italic*, [links](url), and line breaks)"
          rows={6}
          {...form.register("message")}
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="text-sm text-red-400">{errors.message.message}</p>
        )}
        <p className="text-xs text-white/40">
          Supports markdown: **bold**, *italic*, [links](url)
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Additional Sections (optional)</Label>
          <Button
            type="button"
            size="sm"
            onClick={addSection}
            disabled={isSubmitting}
            className="bg-black text-white border border-white/20 hover:bg-black/80"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Section
          </Button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label className="text-sm">Section {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                disabled={isSubmitting}
                className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Section Title (optional)"
              {...form.register(`additionalSections.${index}.title`)}
              disabled={isSubmitting}
            />
            <Textarea
              placeholder="Section content..."
              rows={3}
              {...form.register(`additionalSections.${index}.content`)}
              disabled={isSubmitting}
            />
            {errors.additionalSections?.[index]?.content && (
              <p className="text-sm text-red-400">
                {errors.additionalSections[index]?.content?.message}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
        <Label>Call-to-Action Button (optional)</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="ctaText" className="text-sm">
              Button Text
            </Label>
            <Input
              id="ctaText"
              placeholder="View Project"
              {...form.register("ctaButton.text")}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ctaUrl" className="text-sm">
              Button URL
            </Label>
            <Input
              id="ctaUrl"
              type="url"
              placeholder="https://..."
              {...form.register("ctaButton.url")}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="additionalInfo">Additional Info (optional)</Label>
        <Textarea
          id="additionalInfo"
          placeholder="Any additional information to include..."
          rows={3}
          {...form.register("additionalInfo")}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="signature">Signature (optional)</Label>
        <Input
          id="signature"
          placeholder="Zynra Studio Team"
          {...form.register("signature")}
          disabled={isSubmitting}
        />
        <p className="text-xs text-white/40">
          Leave empty to use default: &quot;Zynra Studio Team&quot;
        </p>
      </div>

      <div className="space-y-3">
        <Label>Attachments (optional)</Label>
        <div className="flex items-center gap-3">
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 px-4 py-2 bg-black text-white border border-white/20 rounded-md hover:bg-black/80 cursor-pointer transition-colors"
          >
            <Paperclip className="h-4 w-4" />
            <span className="text-sm">Add Files</span>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={isSubmitting}
            className="hidden"
          />
          {attachments.length > 0 && (
            <span className="text-sm text-white/60">
              {attachments.length} file{attachments.length > 1 ? "s" : ""} attached
            </span>
          )}
        </div>
        {attachments.length > 0 && (
          <div className="space-y-2 p-3 bg-white/5 rounded-lg border border-white/10">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-white/80 truncate flex-1">
                  {att.file.name}
                </span>
                <span className="text-white/40 text-xs mr-2">
                  {(att.file.size / 1024).toFixed(1)} KB
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(att.id)}
                  disabled={isSubmitting}
                  className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {submitStatus === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <p className="text-sm text-red-400">
            {errorMessage || "Failed to send email. Please try again."}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={togglePreview}
          disabled={isSubmitting || !watchedValues.name || !watchedValues.message}
          className="flex-1 bg-black text-white border border-white/20 hover:bg-black/80"
        >
          <Eye className="h-4 w-4 mr-2" />
          {showPreview ? "Hide Preview" : "Preview"}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-white text-black hover:bg-white/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// Contract Form Component
function ContractForm({
  form,
  onSubmit,
  isSubmitting,
  errors,
  submitStatus,
  errorMessage,
  togglePreview,
  showPreview,
  watchedValues,
}: {
  form: {
    register: ReturnType<typeof useForm<ContractFormData>>["register"]
  }
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  isSubmitting: boolean
  errors: ReturnType<typeof useForm<ContractFormData>>["formState"]["errors"]
  submitStatus: "idle" | "success" | "error"
  errorMessage: string
  togglePreview: () => void
  showPreview: boolean
  watchedValues: ContractFormData
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="contract-clientName">
          Client Name <span className="text-white/40">*</span>
        </Label>
        <Input
          id="contract-clientName"
          placeholder="John Doe"
          {...form.register("clientName")}
          disabled={isSubmitting}
        />
        {errors.clientName && (
          <p className="text-sm text-red-400">{errors.clientName.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contract-companyName">Company Name (optional)</Label>
        <Input
          id="contract-companyName"
          placeholder="Acme Inc."
          {...form.register("companyName")}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contract-projectName">
          Project Name <span className="text-white/40">*</span>
        </Label>
        <Input
          id="contract-projectName"
          placeholder="Website Redesign"
          {...form.register("projectName")}
          disabled={isSubmitting}
        />
        {errors.projectName && (
          <p className="text-sm text-red-400">{errors.projectName.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contract-scopeSummary">Scope Summary (optional)</Label>
        <Textarea
          id="contract-scopeSummary"
          placeholder="Detailed description of the project scope..."
          rows={5}
          {...form.register("scopeSummary")}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contract-fee">
          Fee <span className="text-white/40">*</span>
        </Label>
        <Input
          id="contract-fee"
          type="number"
          placeholder="50000"
          {...form.register("fee", { valueAsNumber: true })}
          disabled={isSubmitting}
        />
        {errors.fee && (
          <p className="text-sm text-red-400">{errors.fee.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contract-paymentTerms">
          Payment Terms <span className="text-white/40">*</span>
        </Label>
        <Textarea
          id="contract-paymentTerms"
          placeholder="50% upfront, 50% on completion"
          rows={3}
          {...form.register("paymentTerms")}
          disabled={isSubmitting}
        />
        {errors.paymentTerms && (
          <p className="text-sm text-red-400">{errors.paymentTerms.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contract-startDate">Start Date (optional)</Label>
        <Input
          id="contract-startDate"
          type="date"
          {...form.register("startDate")}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contract-revisionsChangeRequests">Revisions / Change Requests (optional)</Label>
        <Textarea
          id="contract-revisionsChangeRequests"
          rows={4}
          {...form.register("revisionsChangeRequests")}
          disabled={isSubmitting}
        />
        <p className="text-xs text-white/40">
          Edit the default text above as needed
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contract-confidentialityClause">Confidentiality Clause (optional)</Label>
        <Textarea
          id="contract-confidentialityClause"
          rows={4}
          {...form.register("confidentialityClause")}
          disabled={isSubmitting}
        />
        <p className="text-xs text-white/40">
          Edit the default text above as needed
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contract-liabilityLimitation">Liability Limitation (optional)</Label>
        <Textarea
          id="contract-liabilityLimitation"
          rows={4}
          {...form.register("liabilityLimitation")}
          disabled={isSubmitting}
        />
        <p className="text-xs text-white/40">
          Edit the default text above as needed
        </p>
      </div>

      {submitStatus === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <p className="text-sm text-red-400">
            {errorMessage || "Failed to generate contract. Please try again."}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={togglePreview}
          disabled={isSubmitting || !watchedValues.clientName || !watchedValues.projectName}
          className="flex-1 bg-black text-white border border-white/20 hover:bg-black/80"
        >
          <Eye className="h-4 w-4 mr-2" />
          {showPreview ? "Hide Preview" : "Preview"}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-white text-black hover:bg-white/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Contract
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// Proposal Form Component
function ProposalForm({
  form,
  onSubmit,
  isSubmitting,
  errors,
  submitStatus,
  errorMessage,
  togglePreview,
  showPreview,
  watchedValues,
}: {
  form: {
    register: ReturnType<typeof useForm<ProposalFormData>>["register"]
  }
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  isSubmitting: boolean
  errors: ReturnType<typeof useForm<ProposalFormData>>["formState"]["errors"]
  submitStatus: "idle" | "success" | "error"
  errorMessage: string
  togglePreview: () => void
  showPreview: boolean
  watchedValues: ProposalFormData
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="proposal-clientName">
          Client Name <span className="text-white/40">*</span>
        </Label>
        <Input
          id="proposal-clientName"
          placeholder="John Doe"
          {...form.register("clientName")}
          disabled={isSubmitting}
        />
        {errors.clientName && (
          <p className="text-sm text-red-400">{errors.clientName.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="proposal-companyName">Company Name (optional)</Label>
        <Input
          id="proposal-companyName"
          placeholder="Acme Inc."
          {...form.register("companyName")}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="proposal-projectName">
          Project Name <span className="text-white/40">*</span>
        </Label>
        <Input
          id="proposal-projectName"
          placeholder="Website Redesign"
          {...form.register("projectName")}
          disabled={isSubmitting}
        />
        {errors.projectName && (
          <p className="text-sm text-red-400">{errors.projectName.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="proposal-projectDescription">
          Project Description <span className="text-white/40">*</span>
        </Label>
        <Textarea
          id="proposal-projectDescription"
          placeholder="Detailed description of the project..."
          rows={5}
          {...form.register("projectDescription")}
          disabled={isSubmitting}
        />
        {errors.projectDescription && (
          <p className="text-sm text-red-400">{errors.projectDescription.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="proposal-deliverables">
          Deliverables <span className="text-white/40">*</span>
        </Label>
        <Textarea
          id="proposal-deliverables"
          placeholder="List of deliverables..."
          rows={4}
          {...form.register("deliverables")}
          disabled={isSubmitting}
        />
        {errors.deliverables && (
          <p className="text-sm text-red-400">{errors.deliverables.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="proposal-timeline">
          Timeline <span className="text-white/40">*</span>
        </Label>
        <Input
          id="proposal-timeline"
          placeholder="3-6 months"
          {...form.register("timeline")}
          disabled={isSubmitting}
        />
        {errors.timeline && (
          <p className="text-sm text-red-400">{errors.timeline.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="proposal-fee">
          Fee <span className="text-white/40">*</span>
        </Label>
        <Input
          id="proposal-fee"
          type="number"
          placeholder="50000"
          {...form.register("fee", { valueAsNumber: true })}
          disabled={isSubmitting}
        />
        {errors.fee && (
          <p className="text-sm text-red-400">{errors.fee.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="proposal-paymentTerms">
          Payment Terms <span className="text-white/40">*</span>
        </Label>
        <Textarea
          id="proposal-paymentTerms"
          placeholder="50% upfront, 50% on completion"
          rows={3}
          {...form.register("paymentTerms")}
          disabled={isSubmitting}
        />
        {errors.paymentTerms && (
          <p className="text-sm text-red-400">{errors.paymentTerms.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="proposal-startDate">Start Date (optional)</Label>
        <Input
          id="proposal-startDate"
          type="date"
          {...form.register("startDate")}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="proposal-additionalNotes">Additional Notes (optional)</Label>
        <Textarea
          id="proposal-additionalNotes"
          placeholder="Any additional information..."
          rows={3}
          {...form.register("additionalNotes")}
          disabled={isSubmitting}
        />
      </div>

      {submitStatus === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <p className="text-sm text-red-400">
            {errorMessage || "Failed to generate proposal. Please try again."}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={togglePreview}
          disabled={isSubmitting || !watchedValues.clientName || !watchedValues.projectName}
          className="flex-1 bg-black text-white border border-white/20 hover:bg-black/80"
        >
          <Eye className="h-4 w-4 mr-2" />
          {showPreview ? "Hide Preview" : "Preview"}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-white text-black hover:bg-white/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileCheck className="mr-2 h-4 w-4" />
              Generate Proposal
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
