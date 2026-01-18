import type { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import SectionContainer, { SectionHeading } from '@/components/ui/section-container';
import { projects } from '@/lib/projects-data';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';

export const metadata: Metadata = generateMetadata({
  title: 'Our Projects',
  description: 'Explore Zynra Studio\'s portfolio of high-impact digital products. From enterprise AI systems to sleek mobile applications and high-performance web platforms.',
  path: '/projects',
  keywords: [
    'zynra studio projects',
    'portfolio',
    'case studies',
    'web development examples',
    'mobile app portfolio',
    'AI agent examples',
  ],
});

export default function ProjectsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <SectionContainer id="projects-hero" className="pt-32 pb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-6">
              Our <span className="font-extralight text-white/50">Case Studies</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-white/60 leading-relaxed">
              A curated selection of our most impactful work, demonstrating our commitment to engineering excellence and thoughtful design.
            </p>
          </div>
        </SectionContainer>

        <SectionContainer className="py-12 lg:py-20" variant="darker">
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {projects.map((project, index) => (
              <div
                key={index}
                className="project-card group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl transition-all duration-700 hover:bg-white/[0.05] hover:border-white/20"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-40" />

                  {/* Impact Badge */}
                  <div className="absolute top-6 right-6 z-10">
                    <div className="rounded-full border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-md transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/30">
                      <span className="text-[10px] font-light tracking-wider text-white">
                        {project.impact}
                      </span>
                    </div>
                  </div>

                  {/* Category Overlay (Center) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 translate-y-4 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="flex gap-3">
                      <a
                        href={project.demoUrl}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black transition-all duration-300 hover:scale-110"
                      >
                        <ExternalLink size={20} />
                      </a>
                      <a
                        href={project.codeUrl}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:scale-110"
                      >
                        <Github size={20} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Content Container */}
                <div className="flex flex-col gap-6 p-8 lg:p-10">
                  <div className="space-y-3">
                    <span className="text-[10px] font-light uppercase tracking-[0.15em] text-white/50 group-hover:text-white/80 transition-colors duration-300">
                      {project.category}
                    </span>
                    <h3 className="text-2xl lg:text-3xl font-light tracking-tight text-white">
                      {project.title}
                    </h3>
                    <p className="text-base font-light leading-relaxed text-white/60 group-hover:text-white/80 transition-colors duration-500">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="rounded-full border border-white/5 bg-white/[0.03] px-4 py-1.5 text-[10px] font-light tracking-tight text-white/60 backdrop-blur-sm transition-all duration-300 group-hover:border-white/10 group-hover:text-white/90"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Read More Link */}
                  <div className="pt-4 mt-auto">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-light tracking-tight text-white/40 transition-all duration-300 group-hover:text-white group-hover:gap-3"
                    >
                      Explore Case Study
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>

        <SectionContainer className="py-20">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white">
              Have a Project in Mind?
            </h2>
            <p className="text-lg font-light text-white/70 leading-relaxed">
              We&apos;re always looking for new challenges and opportunities to build something extraordinary.
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
