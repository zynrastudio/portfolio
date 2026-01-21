"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { quoteSchema, type QuoteFormData, budgetRanges, timelines, services } from "@/lib/types/quote"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface QuoteDialogProps {
  service: string
  children: React.ReactNode
}

// Helper function to play success sound using Web Audio API
const playSuccessSound = () => {
  if (typeof window === "undefined") return

  try {
    // Type for webkit prefixed AudioContext
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audioContext = new AudioContextClass()
    
    // Create a pleasant two-tone success sound
    const playTone = (frequency: number, startTime: number, duration: number, volume: number = 0.15) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = "sine"
      
      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }
    
    // Play two pleasant tones (C and E notes creating a major third interval)
    const now = audioContext.currentTime
    playTone(523.25, now, 0.15) // C5
    playTone(659.25, now + 0.08, 0.2) // E5
    
  } catch (error) {
    console.log("Could not play success sound:", error)
  }
}

export function QuoteDialog({ service, children }: QuoteDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = React.useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      service,
    },
  })

  // Set service value when dialog opens
  React.useEffect(() => {
    if (open) {
      setValue("service", service)
      reset({ service })
    }
  }, [open, service, setValue, reset])

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send quote request")
      }

      setSubmitStatus("success")
      reset()
      
      // Play success sound
      playSuccessSound()
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setOpen(false)
        setSubmitStatus("idle")
      }, 2000)
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const budgetValue = watch("budgetRange")
  const timelineValue = watch("timeline")
  const serviceValue = watch("service")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light tracking-tight">
            Get a Quote
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Fill out the form below and we&apos;ll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>

        {submitStatus === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-400" />
            <div className="text-center space-y-2">
              <p className="text-lg font-light text-white">
                Quote request sent successfully!
              </p>
              <p className="text-sm text-white/60">
                We&apos;ll be in touch soon.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Name <span className="text-white/40">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register("name")}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email <span className="text-white/40">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Acme Inc."
                    {...register("company")}
                    disabled={isSubmitting}
                  />
                  {errors.company && (
                    <p className="text-sm text-red-400">
                      {errors.company.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    {...register("phone")}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-400">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service">
                  Service <span className="text-white/40">*</span>
                </Label>
                <Select
                  value={serviceValue}
                  onValueChange={(value) => setValue("service", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((svc) => (
                      <SelectItem key={svc.value} value={svc.value}>
                        {svc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service && (
                  <p className="text-sm text-red-400">{errors.service.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="budgetRange">
                    Budget Range <span className="text-white/40">*</span>
                  </Label>
                  <Select
                    value={budgetValue}
                    onValueChange={(value) => setValue("budgetRange", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="budgetRange">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.budgetRange && (
                    <p className="text-sm text-red-400">
                      {errors.budgetRange.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="timeline">
                    Timeline <span className="text-white/40">*</span>
                  </Label>
                  <Select
                    value={timelineValue}
                    onValueChange={(value) => setValue("timeline", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="timeline">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {timelines.map((timeline) => (
                        <SelectItem key={timeline.value} value={timeline.value}>
                          {timeline.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.timeline && (
                    <p className="text-sm text-red-400">
                      {errors.timeline.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">
                  Message <span className="text-white/40">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your project..."
                  rows={5}
                  {...register("message")}
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p className="text-sm text-red-400">{errors.message.message}</p>
                )}
              </div>
            </div>

            {submitStatus === "error" && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-sm text-red-400">
                  {errorMessage || "Failed to send quote request. Please try again."}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setOpen(false)
                  reset()
                  setSubmitStatus("idle")
                  setErrorMessage("")
                }}
                disabled={isSubmitting}
                className="text-white/60 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-black hover:bg-white/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Request"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
