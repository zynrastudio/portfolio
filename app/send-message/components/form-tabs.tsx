"use client"

import { Mail, FileText, FileCheck } from "lucide-react"
import type { TabType } from "../types"

interface FormTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function FormTabs({ activeTab, onTabChange }: FormTabsProps) {
  return (
    <div className="flex gap-2 mb-8 border-b border-white/10">
      <button
        onClick={() => onTabChange("message")}
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
        onClick={() => onTabChange("contract")}
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
        onClick={() => onTabChange("proposal")}
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
  )
}
