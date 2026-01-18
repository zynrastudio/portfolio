import type { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import SectionContainer from '@/components/ui/section-container';
import Link from 'next/link';

export const metadata: Metadata = generateMetadata({
  title: 'Our Services',
  description: 'Zynra Studio offers comprehensive web and mobile development services. From custom web applications to mobile apps, we deliver scalable, elegant digital solutions tailored to your needs.',
  path: '/services',
  keywords: [
    'web development services',
    'mobile app development services',
    'custom software development',
    'React development',
    'Next.js development',
    'UI/UX design services',
    'full-stack development',
  ],
});

const services = [
  {
    title: 'Web Development',
    description: 'Custom web applications built with modern technologies and best practices',
    features: [
      'Responsive Design',
      'Performance Optimization',
      'SEO Best Practices',
      'Progressive Web Apps',
      'E-commerce Solutions',
      'Content Management Systems',
    ],
    tech: ['React', 'Next.js', 'TypeScript', 'Node.js'],
  },
  {
    title: 'Mobile Development',
    description: 'Native and cross-platform mobile applications for iOS and Android',
    features: [
      'Native iOS & Android',
      'Cross-Platform Solutions',
      'Offline Functionality',
      'Push Notifications',
      'App Store Optimization',
      'Maintenance & Support',
    ],
    tech: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
  },
  {
    title: 'UI/UX Design',
    description: 'User-centered design that combines aesthetics with functionality',
    features: [
      'User Research',
      'Wireframing & Prototyping',
      'Visual Design',
      'Design Systems',
      'Accessibility (WCAG)',
      'Usability Testing',
    ],
    tech: ['Figma', 'Adobe XD', 'Sketch', 'Framer'],
  },
  {
    title: 'Consulting & Strategy',
    description: 'Technical guidance and strategic planning for your digital initiatives',
    features: [
      'Technical Architecture',
      'Technology Selection',
      'Code Audits',
      'Performance Analysis',
      'Team Training',
      'Project Planning',
    ],
    tech: ['Agile', 'DevOps', 'Cloud Infrastructure', 'CI/CD'],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <SectionContainer id="services-hero" className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-6">
              Our <span className="font-extralight text-white/50">Services</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-white/60 leading-relaxed">
              Comprehensive digital solutions tailored to bring your vision to life. 
              From concept to deployment, we handle every aspect of your project.
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
                  <div className="flex flex-wrap gap-2">
                    {service.tech.map((tech) => (
                      <span 
                        key={tech}
                        className="px-3 py-1 text-xs font-light uppercase tracking-wider bg-white/5 border border-white/10 rounded-full text-white/70"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
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
              Our Development Process
            </h2>
            <p className="text-lg font-light text-white/70 leading-relaxed mb-12">
              We follow a proven methodology to ensure successful project delivery
            </p>
            <div className="grid md:grid-cols-4 gap-8">
              {['Discovery', 'Design', 'Development', 'Deployment'].map((phase, index) => (
                <div key={phase} className="relative">
                  <div className="text-4xl font-extralight text-white/20 mb-4">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-light text-white mb-2">{phase}</h3>
                  <p className="text-sm font-light text-white/60">
                    {index === 0 && 'Understanding your needs and goals'}
                    {index === 1 && 'Creating intuitive user experiences'}
                    {index === 2 && 'Building with quality and precision'}
                    {index === 3 && 'Launching and ongoing support'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionContainer>

        <SectionContainer className="py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg font-light text-white/70 leading-relaxed mb-8">
              Let&apos;s discuss how we can help bring your project to life
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 rounded-full bg-white text-black font-light tracking-tight hover:bg-white/90 transition-colors duration-300"
            >
              Book a Call
            </Link>
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}
