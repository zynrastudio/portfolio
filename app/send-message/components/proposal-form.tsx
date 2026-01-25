"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Eye, FileCheck } from "lucide-react"
import type { ProposalFormData } from "../types"

interface ProposalFormProps {
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
}

export function ProposalForm({
  form,
  onSubmit,
  isSubmitting,
  errors,
  submitStatus,
  errorMessage,
  togglePreview,
  showPreview,
  watchedValues,
}: ProposalFormProps) {
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
