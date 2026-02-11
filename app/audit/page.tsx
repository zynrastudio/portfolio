import type { Metadata } from "next";
import { generateMetadata as generatePageMetadata } from "@/lib/metadata";
import { generateBreadcrumbSchema } from "@/lib/schema-generators";
import { siteConfig } from "@/lib/seo-config";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import SectionContainer, { SectionHeading } from "@/components/ui/section-container";
import AuditForm from "@/components/ui/audit-form";

export const metadata: Metadata = generatePageMetadata({
  title: "Get a Free AI Product Activation Audit",
  description:
    "Apply for a free AI product activation audit. We review your product and send a personalized 5–8 minute breakdown on clarity, AI workflow UX, and GEO opportunities.",
  path: "/audit",
  keywords: [
    "free AI audit",
    "AI product audit",
    "product activation",
    "GEO audit",
    "AI founder",
  ],
});

export default function AuditPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: "Free Audit", url: `${siteConfig.url}/audit` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <Header />
      <main className="min-h-screen">
        <SectionContainer id="audit-hero" className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute top-1/4 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-white/[0.02] blur-[120px]" />
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-6">
              Get a Free <span className="font-extralight text-white/50">AI Product Activation Audit</span>
            </h1>
            <p className="text-xl font-light text-white/60 leading-relaxed mb-4">
              Building an AI product is hard. Making it clear, usable, and visible is harder.
            </p>
            <p className="text-lg font-light text-white/60 leading-relaxed mb-6">
              We&apos;ll review your product and send a personalized 5–8 minute breakdown covering:
            </p>
            <ul className="space-y-2 text-base font-light text-white/70 mb-6">
              <li className="flex items-center gap-3">
                <span className="h-1 w-1 rounded-full bg-white/50 shrink-0" />
                Product clarity & positioning
              </li>
              <li className="flex items-center gap-3">
                <span className="h-1 w-1 rounded-full bg-white/50 shrink-0" />
                AI workflow UX friction
              </li>
              <li className="flex items-center gap-3">
                <span className="h-1 w-1 rounded-full bg-white/50 shrink-0" />
                Activation & GEO opportunities
              </li>
            </ul>
            <p className="text-base font-light text-white/50">
              No generic advice. No fluff.
            </p>
          </div>
        </SectionContainer>

        <SectionContainer variant="dark" className="py-20 lg:py-28 overflow-hidden">
          <div className="absolute bottom-0 left-0 -z-10 h-[300px] w-[300px] bg-white/[0.02] blur-[100px] rounded-full" />
          <SectionHeading
            badge="What you get"
            title="What this audit covers"
            subtitle="A short, actionable breakdown tailored to your product — not a generic checklist."
            align="center"
          />
          <ul className="max-w-2xl mx-auto space-y-3 text-base font-light text-white/80">
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50 mt-2 shrink-0" />
              <span><strong className="text-white/90">Product clarity & positioning</strong> — Is your value clear? Who it&apos;s for and why it matters.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50 mt-2 shrink-0" />
              <span><strong className="text-white/90">AI workflow UX friction</strong> — Where users get stuck, and how to simplify the flow.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50 mt-2 shrink-0" />
              <span><strong className="text-white/90">Activation & GEO opportunities</strong> — Conversion and discoverability in AI search (ChatGPT, Perplexity).</span>
            </li>
          </ul>
        </SectionContainer>

        <SectionContainer className="py-20 lg:py-28">
          <SectionHeading
            badge="Audience"
            title="Who it's for"
            subtitle="Early-stage AI founders (pre-launch to early traction) who want to improve clarity, completion, or activation. Solo founders and small teams building AI products."
            align="center"
          />
        </SectionContainer>

        <SectionContainer variant="dark" className="py-20 lg:py-28 overflow-hidden">
          <SectionHeading
            badge="Process"
            title="What happens next"
            subtitle="Submit the form below. We review each request. If approved, you'll receive your personalized audit within 48 hours — no generic advice, tailored to your product."
            align="center"
          />
        </SectionContainer>

        <SectionContainer id="audit-form" className="py-20 lg:py-28">
          <SectionHeading
            badge="Apply"
            title="Request your audit"
            subtitle="Fill out the short form. We use it to qualify fit and tailor the audit."
            align="center"
          />
          <div className="mt-12">
            <AuditForm />
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}
