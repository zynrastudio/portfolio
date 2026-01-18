import type { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import SectionContainer from '@/components/ui/section-container';
import ContactSection from '@/components/ui/contact-section';

export const metadata: Metadata = generateMetadata({
  title: 'Contact Us',
  description: "Get in touch with Zynra Studio. We're ready to discuss your project and help transform your ideas into elegant digital solutions. Contact us today to start your journey.",
  path: '/contact',
  keywords: [
    'contact zynra studio',
    'get in touch',
    'web development inquiry',
    'project consultation',
    'hire developers',
    'contact agency',
  ],
});

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <SectionContainer id="contact-hero" className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-6">
              Let&apos;s Work <span className="font-extralight text-white/50">Together</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-white/60 leading-relaxed">
              Have a project in mind? We&apos;d love to hear about it. 
              Reach out and let&apos;s create something amazing together.
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
