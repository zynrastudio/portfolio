"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Plus, Trash2, Eye, Mail, Paperclip, X } from "lucide-react"
import { RichTextEditor } from "./rich-text-editor"
import type { ClientMessageFormData } from "../types"

interface MessageFormProps {
  form: {
    register: ReturnType<typeof useForm<ClientMessageFormData>>["register"]
    control: ReturnType<typeof useForm<ClientMessageFormData>>["control"]
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
}

export function MessageForm({
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
}: MessageFormProps) {
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
        <Controller
          name="message"
          control={form.control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value || ""}
              onChange={field.onChange}
              disabled={isSubmitting}
              placeholder="Your message here... Use the toolbar to format your text."
            />
          )}
        />
        {errors.message && (
          <p className="text-sm text-red-400">{errors.message.message}</p>
        )}
        <p className="text-xs text-white/40">
          Use the toolbar above to format your message with bold, italic, lists, links, and more.
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
