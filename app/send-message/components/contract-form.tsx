"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Eye, FileText } from "lucide-react"
import type { ContractFormData } from "../types"

interface ContractFormProps {
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
}

export function ContractForm({
  form,
  onSubmit,
  isSubmitting,
  errors,
  submitStatus,
  errorMessage,
  togglePreview,
  showPreview,
  watchedValues,
}: ContractFormProps) {
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
