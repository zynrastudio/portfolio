import type { Metadata } from 'next';
import { generateMetadata as generatePageMetadata } from '@/lib/metadata';
import { generateBreadcrumbSchema } from '@/lib/schema-generators';
import { siteConfig } from '@/lib/seo-config';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import SectionContainer, { SectionHeading } from '@/components/ui/section-container';
import Link from 'next/link';
import { Wrench, Sparkles, Search, Zap, Rocket, Globe, Repeat } from 'lucide-react';

export const metadata: Metadata = generatePageMetadata({
  title: 'For AI Founders',
  description: 'Zynra Studio works with early-stage AI founders: pre-launch to early traction. Product completion, AI UX, and GEO visibility. We don\'t do enterprise.',
  path: '/for-founders',
  keywords: [
    'AI founders',
    'early-stage AI startup',
    'product completion',
    'AI UX',
    'GEO',
    'founder strategy call',
    'AI product launch',
  ],
});

const caseScenarios = [
  'You\'re technical but stuck on UX.',
  'You\'re non-technical and need help finishing features.',
  'You launched but nobody understands your product.',
  'You built something powerful but invisible in AI search.',
];

const pillars = [
  {
    icon: Wrench,
    title: 'Product Completion & Advanced Builds',
    message: 'We help you finish what you started.',
    includes: [
      'Advanced feature implementation',
      'AI agent architecture',
      'Integrations (OpenAI, Supabase, Stripe)',
      'Performance optimization',
    ],
    color: 'from-blue-500/10',
  },
  {
    icon: Sparkles,
    title: 'UI/UX & Conversion Activation',
    message: 'Make your product intuitive and usable.',
    includes: [
      'UI/UX design',
      'Conversion-focused landing pages',
      'Onboarding redesign',
      'Demo experience design',
    ],
    color: 'from-purple-500/10',
  },
  {
    icon: Search,
    title: 'GEO & SEO Visibility',
    message: 'Be visible where AI search happens.',
    includes: [
      'Generative engine optimization',
      'Entity structure',
      'Answer-based content',
      'AI engine discoverability',
    ],
    color: 'from-green-500/10',
  },
];

const engagementModels = [
  {
    icon: Zap,
    title: 'AI Product Completion Sprint (2–4 weeks)',
    description: 'Focused sprint to finish advanced features, integrations, or architecture so you can ship.',
  },
  {
    icon: Rocket,
    title: 'Launch Activation Package',
    description: 'Get your product launch-ready — UI/UX, onboarding, and conversion-focused pages.',
  },
  {
    icon: Globe,
    title: 'GEO Foundation Setup',
    description: 'Foundation for visibility in ChatGPT, Perplexity, and AI search (entity structure, answer-based content).',
  },
  {
    icon: Repeat,
    title: 'Ongoing AI Partner Retainer',
    description: 'Ongoing support for product, UX, or GEO in a retainer model.',
  },
];

export default function ForFoundersPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'For Founders', url: `${siteConfig.url}/for-founders` },
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
        <SectionContainer id="for-founders-hero" className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute top-1/4 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-white/[0.02] blur-[120px]" />
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-6">
              For <span className="font-extralight text-white/50">AI Founders</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-white/60 leading-relaxed">
              We help early-stage founders launch, complete, and activate their AI products.
            </p>
          </div>
        </SectionContainer>

        <SectionContainer id="pillars" variant="gradient" className="py-20 lg:py-28 overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-white/[0.02] blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-white/[0.02] blur-[100px] rounded-full" />
          <SectionHeading
            badge="How we help"
            title="Activation Pillars"
            subtitle="Outcome-focused support for early AI founders."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-12">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={index}
                  className="group relative flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:p-10 backdrop-blur-md hover:bg-white/[0.08] hover:border-white/20 transition-colors duration-300"
                >
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${pillar.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white/80 ring-1 ring-white/20 group-hover:scale-110 group-hover:bg-white/10 group-hover:text-white group-hover:ring-white/30 transition-all duration-300">
                      <Icon size={28} />
                    </div>
                    <h3 className="mb-2 text-xl font-light tracking-tight text-white">
                      {pillar.title}
                    </h3>
                    <p className="mb-6 text-base font-light leading-relaxed text-white/80">
                      {pillar.message}
                    </p>
                    <ul className="space-y-2">
                      {pillar.includes.map((item, i) => (
                        <li key={i} className="text-sm font-light text-white/70 flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-white/40 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionContainer>

        <SectionContainer variant="dark" className="py-20 lg:py-28 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[400px] w-[400px] bg-white/[0.02] blur-[120px] rounded-full" />
          <SectionHeading
            badge="How we work"
            title="Engagement Models"
            subtitle="We work in focused engagements. No long lock-in."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mt-12">
            {engagementModels.map((model, index) => {
              const Icon = model.icon;
              return (
                <div
                  key={index}
                  className="group relative flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:p-10 backdrop-blur-md hover:bg-white/[0.06] hover:border-white/15 transition-colors duration-300"
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/70 ring-1 ring-white/10 group-hover:bg-white/10 group-hover:text-white group-hover:ring-white/20 transition-all duration-300">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-light tracking-tight text-white mb-3">
                    {model.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-white/70">
                    {model.description}
                  </p>
                </div>
              );
            })}
          </div>
        </SectionContainer>

        <SectionContainer className="py-20 lg:py-28">
          <div className="max-w-3xl mx-auto">
            <SectionHeading
              badge="Audience"
              title="Who we work with"
              subtitle="Pre-launch to early traction. Solo founders and small teams building AI products. We focus on early-stage — not enterprise."
              align="left"
            />
          </div>
        </SectionContainer>

        <SectionContainer variant="dark" className="py-20 lg:py-28 overflow-hidden">
          <div className="absolute bottom-0 right-0 -z-10 h-[300px] w-[300px] bg-white/[0.02] blur-[100px] rounded-full" />
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-light tracking-tight text-white mb-4">
              What we don&apos;t do
            </h2>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:p-8 backdrop-blur-md">
              <p className="text-base font-light text-white/70 leading-relaxed">
                We don&apos;t target enterprise. We don&apos;t do long-term staff augmentation or large RFP-style projects. We work with founders who have a product in progress and need clarity, completion, or activation.
              </p>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer className="py-20 lg:py-28 overflow-hidden">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              badge="Sound like you?"
              title="Case scenarios"
              subtitle="Common situations we help with."
              align="left"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {caseScenarios.map((scenario, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:p-6 backdrop-blur-md hover:bg-white/[0.06] hover:border-white/15 transition-colors duration-300"
                >
                  <p className="text-base font-light leading-snug text-white/90">
                    {scenario}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionContainer>

        <SectionContainer className="py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-6">
              Ready to get unstuck?
            </h2>
            <p className="text-lg font-light text-white/70 leading-relaxed mb-8">
              Book a Founder Strategy Call. We&apos;ll align on your situation and whether we&apos;re a fit.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 rounded-2xl bg-white text-black font-light tracking-tight hover:bg-white/90 transition-colors duration-300"
            >
              Book Founder Strategy Call
            </Link>
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}
