"use client"

import { Button } from "@/components/ui/button"
import { Download, Paperclip } from "lucide-react"
import type { TabType } from "../types"

interface PreviewPanelProps {
  previewHtml: string
  activeTab: TabType
  showPreview: boolean
  onTogglePreview: () => void
  attachments?: Array<{ file: File; id: string }>
  onDownloadPDF?: () => void
}

export function PreviewPanel({
  previewHtml,
  activeTab,
  showPreview,
  onTogglePreview,
  attachments = [],
  onDownloadPDF,
}: PreviewPanelProps) {
  if (!showPreview || !previewHtml) {
    return null
  }

  const previewTitle =
    activeTab === "message"
      ? "Email Preview"
      : activeTab === "contract"
        ? "Contract Preview"
        : "Proposal Preview"

  return (
    <div className="lg:sticky lg:top-8 h-fit">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-light text-black">{previewTitle}</h3>
          <div className="flex gap-2">
            {(activeTab === "contract" || activeTab === "proposal") && onDownloadPDF && (
              <Button
                type="button"
                onClick={onDownloadPDF}
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
              onClick={onTogglePreview}
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
  )
}
