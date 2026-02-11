import type { Metadata } from 'next';
import { generateMetadata as generatePageMetadata } from '@/lib/metadata';
import { generateBreadcrumbSchema } from '@/lib/schema-generators';
import { siteConfig } from '@/lib/seo-config';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import SectionContainer, { SectionHeading } from '@/components/ui/section-container';
import Link from 'next/link';

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
        <SectionContainer id="for-founders-hero" className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-6">
              For <span className="font-extralight text-white/50">AI Founders</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-white/60 leading-relaxed">
              We help early-stage founders launch, complete, and activate their AI products.
            </p>
          </div>
        </SectionContainer>

        <SectionContainer className="py-16 lg:py-20">
          <div className="max-w-3xl mx-auto space-y-16">
            <section>
              <SectionHeading
                badge="Audience"
                title="Who we work with"
                subtitle="Pre-launch to early traction. Solo founders and small teams building AI products. We focus on early-stage — not enterprise."
                align="left"
              />
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight text-white mb-4">
                What we don&apos;t do
              </h2>
              <p className="text-base font-light text-white/70 leading-relaxed">
                We don&apos;t target enterprise. We don&apos;t do long-term staff augmentation or large RFP-style projects. We work with founders who have a product in progress and need clarity, completion, or activation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight text-white mb-4">
                Engagement model
              </h2>
              <p className="text-base font-light text-white/70 leading-relaxed mb-4">
                We start with a Founder Strategy Call to align on where you&apos;re stuck and what would move the needle. From there we scope a focused engagement: product completion, AI UX and conversion, or GEO and discoverability. We work in clear phases so you stay in control of scope and budget.
              </p>
              <p className="text-base font-light text-white/70 leading-relaxed">
                No long lock-in. No vague retainers. We define outcomes, then execute.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight text-white mb-6">
                Case scenarios
              </h2>
              <p className="text-base font-light text-white/70 leading-relaxed mb-6">
                Sound like you?
              </p>
              <ul className="space-y-4">
                {caseScenarios.map((scenario, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 text-lg font-light text-white/90"
                  >
                    <span className="h-px flex-1 max-w-[40px] mt-3 bg-white/30 shrink-0" />
                    {scenario}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </SectionContainer>

        <SectionContainer className="py-20">
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
