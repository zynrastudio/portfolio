"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  auditSchema,
  type AuditFormData,
  stageOptions,
  productTypeOptions,
  timelineOptions,
  investingIntentOptions,
} from "@/lib/types/audit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuditForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AuditFormData>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      productType: [],
    },
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const stageValue = watch("stage");
  const timelineValue = watch("timeline");
  const investingValue = watch("investingIntent");
  const productTypeValue = watch("productType") ?? [];

  const toggleProductType = (value: string) => {
    const next = productTypeValue.includes(value)
      ? productTypeValue.filter((v) => v !== value)
      : [...productTypeValue, value];
    setValue("productType", next, { shouldValidate: true });
  };

  const onSubmit = async (data: AuditFormData) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to submit");
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 lg:p-10 text-center backdrop-blur-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-white/80 mb-6" />
        <p className="text-xl font-light text-white sm:text-2xl">
          Thanks — we&apos;re reviewing your product.
        </p>
        <p className="mt-3 text-base font-light text-white/70">
          If approved, you&apos;ll receive your personalized audit within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      <div className="grid gap-2">
        <Label htmlFor="audit-email">Email <span className="text-white/40">*</span></Label>
        <Input
          id="audit-email"
          type="email"
          placeholder="you@company.com"
          {...register("email")}
          disabled={isSubmitting}
        />
        {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="audit-what">What are you building? <span className="text-white/40">*</span></Label>
        <Textarea
          id="audit-what"
          placeholder="Briefly describe your product and who it's for."
          rows={4}
          {...register("whatBuilding")}
          disabled={isSubmitting}
        />
        {errors.whatBuilding && <p className="text-sm text-red-400">{errors.whatBuilding.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label>What stage are you at? <span className="text-white/40">*</span></Label>
        <Select
          value={stageValue}
          onValueChange={(v) => setValue("stage", v as AuditFormData["stage"])}
          disabled={isSubmitting}
        >
          <SelectTrigger id="audit-stage">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {stageOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.stage && <p className="text-sm text-red-400">{errors.stage.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label>What type of product is this? <span className="text-white/40">*</span></Label>
        <div className="flex flex-wrap gap-4 rounded-md border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          {productTypeOptions.map((o) => (
            <label key={o.value} className="flex items-center gap-2 cursor-pointer text-sm font-light text-white/90">
              <input
                type="checkbox"
                checked={productTypeValue.includes(o.value)}
                onChange={() => toggleProductType(o.value)}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/20"
              />
              {o.label}
            </label>
          ))}
        </div>
        {errors.productType && <p className="text-sm text-red-400">{errors.productType.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="audit-bottleneck">What is your biggest bottleneck right now? <span className="text-white/40">*</span></Label>
        <Textarea
          id="audit-bottleneck"
          placeholder="e.g. Confusing onboarding, Advanced feature implementation, Low conversion, Not ranking in AI search, Technical performance"
          rows={3}
          {...register("biggestBottleneck")}
          disabled={isSubmitting}
        />
        {errors.biggestBottleneck && <p className="text-sm text-red-400">{errors.biggestBottleneck.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label>Timeline for improvement? <span className="text-white/40">*</span></Label>
        <Select
          value={timelineValue}
          onValueChange={(v) => setValue("timeline", v as AuditFormData["timeline"])}
          disabled={isSubmitting}
        >
          <SelectTrigger id="audit-timeline">
            <SelectValue placeholder="Select timeline" />
          </SelectTrigger>
          <SelectContent>
            {timelineOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.timeline && <p className="text-sm text-red-400">{errors.timeline.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label>Are you open to investing in improving your product if we identify clear opportunities? <span className="text-white/40">*</span></Label>
        <Select
          value={investingValue}
          onValueChange={(v) => setValue("investingIntent", v as AuditFormData["investingIntent"])}
          disabled={isSubmitting}
        >
          <SelectTrigger id="audit-investing">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {investingIntentOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.investingIntent && <p className="text-sm text-red-400">{errors.investingIntent.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="audit-url">Website URL <span className="text-white/40">*</span></Label>
        <Input
          id="audit-url"
          type="url"
          placeholder="https://yourproduct.com"
          {...register("websiteUrl")}
          disabled={isSubmitting}
        />
        {errors.websiteUrl && <p className="text-sm text-red-400">{errors.websiteUrl.message}</p>}
      </div>

      {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full rounded-2xl bg-white text-black font-light hover:bg-white/90 h-12",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Apply for Audit"
        )}
      </Button>
    </form>
  );
}
