'use client';

import SectionContainer, { SectionHeading } from './section-container';
import { ExternalLink, Github, ArrowRight, Building2, Globe, Cpu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '@/lib/projects-data';

gsap.registerPlugin(ScrollTrigger);

const companies = [
  { name: 'TechVision', logo: Building2 },
  { name: 'GlobalApps', logo: Globe },
  { name: 'AI Research', logo: Cpu },
  { name: 'DevStudio', logo: Building2 },
  { name: 'FutureTech', logo: Cpu },
];

export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const projectCards = containerRef.current.querySelectorAll('.project-card');
      const companyLogos = containerRef.current.querySelectorAll('.company-logo');

      gsap.from(companyLogos, {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 95%',
        },
      });

      gsap.from(projectCards, {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.projects-grid',
          start: 'top 90%',
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <SectionContainer id="projects" variant="darker" animate={false} className="overflow-hidden">
      {/* Atmosphere Background */}
      <div className="absolute top-1/2 left-0 -z-10 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-white/[0.02] blur-[150px]" />

      <SectionHeading
        badge="Past Experience"
        title="Proven Track Record"
        subtitle="Exploring the frontier of technology through impactful projects that deliver real-world results."
      />

      <div ref={containerRef} className="space-y-24 lg:space-y-32">
        {/* Featured Companies Section */}
        <div className="flex flex-col items-center gap-10">
          <p className="text-[10px] font-light uppercase tracking-[0.2em] text-white/40">
            Collaborated with & Trusted By
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
            {companies.map((company, i) => {
              const Icon = company.logo;
              return (
                <div key={i} className="company-logo flex items-center gap-3 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:ring-white/20">
                    <Icon size={18} className="text-white/40 group-hover:text-white" />
                  </div>
                  <span className="text-sm font-light tracking-tight text-white/30 group-hover:text-white/60">
                    {company.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
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

        {/* Bottom CTA */}
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h4 className="text-xl font-light tracking-tight text-white/80 max-w-lg mx-auto">
            Ready to build your next breakthrough project?
          </h4>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-light tracking-tight text-white backdrop-blur-sm transition-all duration-500 hover:bg-white hover:text-black hover:scale-105"
          >
            Explore All Projects
            <ArrowRight size={18} className="transition-transform duration-500 group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}
