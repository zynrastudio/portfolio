import type { Metadata } from 'next';
import { generateMetadata as generatePageMetadata } from '@/lib/metadata';
import { generateWebSiteSchema, generateFAQPageSchema } from '@/lib/schema-generators';
import { faqs } from '@/lib/faq-data';
import dynamic from 'next/dynamic';
import Hero from "@/components/ui/neural-network-hero";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

// Lazy load below-the-fold components for better initial page load
const FounderProblemsSection = dynamic(() => import("@/components/ui/founder-problems-section"), {
  loading: () => <div className="min-h-[300px]" />,
});
const ActivationPillarsSection = dynamic(() => import("@/components/ui/activation-pillars-section"), {
  loading: () => <div className="min-h-[400px]" />,
});
const ProjectsSection = dynamic(() => import("@/components/ui/projects-section"), {
  loading: () => <div className="min-h-[600px]" />,
});
const TestimonialsSection = dynamic(() => import("@/components/ui/testimonials-section"), {
  loading: () => <div className="min-h-[400px]" />,
});
const FAQSection = dynamic(() => import("@/components/ui/faq-section"), {
  loading: () => <div className="min-h-[400px]" />,
});
const ContactSection = dynamic(() => import("@/components/ui/contact-section"), {
  loading: () => <div className="min-h-[400px]" />,
});

export const metadata: Metadata = generatePageMetadata({
  title: 'Zynra Studio - For Early AI Founders | Launch, Complete & Activate Your Product',
  description: 'We help early AI founders launch, complete, and activate their products. Product completion, AI UX, and GEO visibility for generative search.',
  path: '/',
  keywords: [
    'AI founders',
    'AI product launch',
    'product completion',
    'AI UX',
    'GEO',
    'generative engine optimization',
    'early-stage founders',
    'AI startup',
  ],
});

export default function Home() {
  const websiteSchema = generateWebSiteSchema();
  const faqSchema = generateFAQPageSchema(faqs);
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <Header />
      <main>
        <Hero 
          title="Launch Your Product With Clarity, Speed & Traction"
          description="Zynra Studio partners with early-stage founders to complete advanced features, refine UI/UX, and activate products for real users — including GEO visibility inside generative search engines."
          badgeText="For AI Founders"
          badgeLabel="Strategy calls open"
          ctaButtons={[
            { text: "Book Founder Strategy Call", href: "/contact", primary: true }
          ]}
          microDetails={["Product Completion", "UI/UX Activation", "GEO & Discoverability"]}
        />
        <FounderProblemsSection />
        <ActivationPillarsSection />
        <ProjectsSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
