import type { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';
import { generateServiceSchema, generateFAQPageSchema, generateBreadcrumbSchema } from '@/lib/schema-generators';
import { siteConfig } from '@/lib/seo-config';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import SectionContainer from '@/components/ui/section-container';
import Link from 'next/link';

export const metadata: Metadata = generateMetadata({
  title: 'Services for AI Founders',
  description: 'Product completion, UI/UX and conversion, GEO visibility. We help early-stage AI founders launch, complete, and activate their products.',
  path: '/services',
  keywords: [
    'product completion',
    'UI/UX',
    'GEO',
    'AI founders',
    'generative engine optimization',
    'founder strategy call',
  ],
});

const services = [
  {
    title: 'Product Completion & Advanced Builds',
    description: 'We help you finish what you started. For non-technical or overwhelmed founders.',
    features: [
      'Advanced feature implementation',
      'AI agent architecture',
      'Integrations (OpenAI, Supabase, Stripe)',
      'Performance optimization',
    ],
    tech: ['React', 'Next.js', 'TypeScript', 'OpenAI', 'Supabase'],
  },
  {
    title: 'AI UX & Conversion Activation',
    description: 'Make your AI product intuitive and usable. From onboarding to conversion.',
    features: [
      'AI workflow simplification',
      'Onboarding redesign',
      'Demo experience design',
      'Conversion-focused landing pages',
    ],
    tech: ['Figma', 'Prototyping', 'User flows', 'Analytics'],
  },
  {
    title: 'GEO & SEO Visibility',
    description: 'Be visible where AI search happens. ChatGPT, Perplexity, and beyond.',
    features: [
      'Generative engine optimization',
      'Entity structure',
      'Answer-based content',
      'AI engine discoverability',
    ],
    tech: ['Structured data', 'Entity SEO', 'Content strategy'],
  },
];

export default function ServicesPage() {
  // Generate Service schemas for each service
  const serviceSchemas = services.map((service) =>
    generateServiceSchema(
      service.title,
      service.description,
      service.title
    )
  );

  // Generate FAQPage schema
  const faqSchema = generateFAQPageSchema([
    {
      question: 'Who do you work with?',
      answer: 'Early-stage AI founders: pre-launch to early traction. We focus on product completion, AI UX, and GEO. We don\'t target enterprise.',
    },
    {
      question: 'What does product completion include?',
      answer: 'Advanced feature implementation, AI agent architecture, integrations (OpenAI, Supabase, Stripe), and performance optimization. We help you ship what you started.',
    },
    {
      question: 'What is GEO?',
      answer: 'Generative Engine Optimization — being discoverable where AI answers are generated (ChatGPT, Perplexity). We work on entity structure, answer-based content, and AI engine discoverability.',
    },
    {
      question: 'How does the engagement work?',
      answer: 'We start with a Founder Strategy Call to align on where you\'re stuck. Then we scope a focused engagement in clear phases. No long lock-in; you stay in control of scope and budget.',
    },
    {
      question: 'How do I get started?',
      answer: 'Book a Founder Strategy Call via our contact page. We\'ll discuss your situation and whether we\'re a fit, then define next steps.',
    },
  ]);

  // Generate BreadcrumbList schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Services', url: `${siteConfig.url}/services` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {serviceSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <Header />
      <main className="min-h-screen">
        <SectionContainer id="services-hero" className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-6">
              How we <span className="font-extralight text-white/50">help</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-white/60 leading-relaxed">
              We help early-stage AI founders launch, complete, and activate their products. 
              Product completion, AI UX and conversion, GEO visibility. Focused engagements, clear outcomes.
            </p>
          </div>
        </SectionContainer>

        <SectionContainer className="py-20">
          <div className="max-w-6xl mx-auto space-y-20">
            {services.map((service, index) => (
              <div 
                key={service.title}
                className="grid md:grid-cols-2 gap-12 items-start"
              >
                <div>
                  <div className="text-sm font-light uppercase tracking-[0.2em] text-white/40 mb-4">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4">
                    {service.title}
                  </h2>
                  <p className="text-lg font-light text-white/70 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.tech.map((tech) => (
                      <span 
                        key={tech}
                        className="px-3 py-1 text-xs font-light uppercase tracking-wider bg-white/5 border border-white/10 rounded-full text-white/70"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <Link
                    href="/contact"
                    className="inline-block text-sm font-light text-white/60 hover:text-white underline"
                  >
                    Book Founder Strategy Call →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {service.features.map((feature) => (
                    <div 
                      key={feature}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300"
                    >
                      <p className="text-sm font-light text-white/80">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>

        <SectionContainer className="py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-6">
              How we work
            </h2>
            <p className="text-lg font-light text-white/70 leading-relaxed mb-12">
              Strategy call first. Then we scope a focused engagement. No vague retainers.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { phase: 'Strategy call', desc: 'Align on where you\'re stuck and what would move the needle' },
                { phase: 'Scope', desc: 'Define outcomes and phases. You stay in control of scope and budget' },
                { phase: 'Build / Activate', desc: 'Execute. Product completion, AI UX, or GEO — whatever you need' },
              ].map((item, index) => (
                <div key={item.phase} className="relative">
                  <div className="text-4xl font-extralight text-white/20 mb-4">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-light text-white mb-2">{item.phase}</h3>
                  <p className="text-sm font-light text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionContainer>

        <SectionContainer className="py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-6">
              Ready to get unstuck?
            </h2>
            <p className="text-lg font-light text-white/70 leading-relaxed mb-8">
              Book a Founder Strategy Call. We&apos;ll align on your situation and next steps.
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
