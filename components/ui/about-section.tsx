'use client';

import SectionContainer, { SectionHeading } from './section-container';
import { Code2, Smartphone, Puzzle, Bot, CheckCircle2 } from 'lucide-react';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

const highlights = [
  {
    icon: Code2,
    title: 'Web Development',
    description: 'Scalable web architectures using React and Next.js.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'High-performance iOS and Android applications.',
  },
  {
    icon: Puzzle,
    title: 'Chrome Extensions',
    description: 'Specialized browser tools for workflow automation.',
  },
  {
    icon: Bot,
    title: 'AI Solutions',
    description: 'Intelligent agents and LLM-powered integrations.',
  },
];

const stats = [
  'Clean & Maintainable Code',
  'Performance-First Approach',
  'User-Centric Design',
  'Innovative Problem Solving',
];

export default function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardsRef.current) return;

      gsap.from(cardsRef.current.children, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 85%',
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <SectionContainer id="about" variant="darker" animate={false} className="overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[120px]" />
      <div className="absolute -right-20 top-0 -z-10 h-[300px] w-[300px] rounded-full bg-white/5 blur-[100px]" />

      <SectionHeading
        badge="About Me"
        title="Engineering with Purpose"
        subtitle="Bridging the gap between complex logic and seamless user experience."
      />

      <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left: Content (7 columns on large) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-light tracking-tight text-white/90">
              The Journey of <span className="font-normal text-white">Bright Akolade</span>
            </h3>
            <p className="text-base font-light leading-relaxed tracking-tight text-white/75 sm:text-lg">
              I am a results-driven developer dedicated to building elegant digital solutions. 
              My expertise isn&apos;t just in writing code; it&apos;s in <span className="text-white">architecting experiences</span> that 
              empower users and businesses alike. From the intricate logic of AI agents to the precise pixels 
              of mobile interfaces, I bring a holistic view to every project.
            </p>
            <p className="text-base font-light leading-relaxed tracking-tight text-white/75 sm:text-lg">
              In a rapidly evolving landscape, I specialize in staying ahead of the curve, utilizing 
              modern tech stacks to deliver robust, scalable, and future-proof applications.
            </p>
          </div>

          {/* Professional Stats / Bullets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/60">
                  <CheckCircle2 size={12} />
                </div>
                <span className="text-sm font-light tracking-tight text-white/70">{stat}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/projects"
              className="group relative flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-light tracking-tight text-black transition-all duration-300 hover:scale-105 hover:bg-white/90"
            >
              Explore Projects
            </Link>
            <Link
              href="/contact"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-light tracking-tight text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20"
            >
              Get In Touch
            </Link>
          </div>
        </div>

        {/* Right: Highlights Grid (5 columns on large) */}
        <div ref={cardsRef} className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col items-center text-center rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md transition-all duration-500 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-white/5"
              >
                {/* Subtle card glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-white/60 ring-1 ring-white/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/10 group-hover:text-white group-hover:ring-white/20">
                  <Icon size={28} />
                </div>
                
                <div className="relative">
                  <h4 className="mb-2 text-base font-light tracking-tight text-white group-hover:text-white">
                    {highlight.title}
                  </h4>
                  <p className="text-xs font-light leading-relaxed text-white/60 group-hover:text-white/80">
                    {highlight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
}

