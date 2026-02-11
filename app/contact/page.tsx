import type { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';
import { generateBreadcrumbSchema, generateContactPageSchema } from '@/lib/schema-generators';
import { siteConfig } from '@/lib/seo-config';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import SectionContainer from '@/components/ui/section-container';
import ContactSection from '@/components/ui/contact-section';

export const metadata: Metadata = generateMetadata({
  title: 'Book a Founder Strategy Call',
  description: "Book a Founder Strategy Call with Zynra Studio. We'll align on your situation and whether we're a fit. For early-stage AI founders.",
  path: '/contact',
  keywords: [
    'founder strategy call',
    'AI founders',
    'contact zynra studio',
    'book a call',
    'early-stage startup',
  ],
});

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Contact', url: `${siteConfig.url}/contact` },
  ]);

  const contactPageSchema = generateContactPageSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactPageSchema),
        }}
      />
      <Header />
      <main className="min-h-screen">
        <SectionContainer id="contact-hero" className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-6">
              Book a <span className="font-extralight text-white/50">Founder Strategy Call</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-white/60 leading-relaxed">
              We&apos;ll align on your situation and whether we&apos;re a fit. 
              No pitch — just a clear conversation. For early-stage AI founders.
            </p>
          </div>
        </SectionContainer>

        <ContactSection />

        <SectionContainer className="py-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="text-sm font-light uppercase tracking-[0.2em] text-white/40 mb-3">
                  Email
                </div>
                <a 
                  href="mailto:hi@zynra.studio"
                  className="text-lg font-light text-white hover:text-white/70 transition-colors duration-300"
                >
                  hi@zynra.studio
                </a>
              </div>
              <div className="text-center">
                <div className="text-sm font-light uppercase tracking-[0.2em] text-white/40 mb-3">
                  Response Time
                </div>
                <p className="text-lg font-light text-white/70">
                  Within 24 hours
                </p>
              </div>
              <div className="text-center">
                <div className="text-sm font-light uppercase tracking-[0.2em] text-white/40 mb-3">
                  Social
                </div>
                <div className="flex justify-center gap-4">
                  <a 
                    href="https://twitter.com/zynrastudio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-light text-white hover:text-white/70 transition-colors duration-300"
                  >
                    Twitter
                  </a>
                  <a 
                    href="https://linkedin.com/company/zynrastudio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-light text-white hover:text-white/70 transition-colors duration-300"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}
