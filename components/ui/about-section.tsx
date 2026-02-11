'use client';

import SectionContainer, { SectionHeading } from './section-container';
import { Wrench, Sparkles, Search, CheckCircle2 } from 'lucide-react';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

const highlights = [
  {
    icon: Wrench,
    title: 'Product Completion',
    description: 'Finish advanced features, integrations, and architecture so you can ship.',
  },
  {
    icon: Sparkles,
    title: 'AI UX & Conversion',
    description: 'Make your AI product intuitive and conversion-ready.',
  },
  {
    icon: Search,
    title: 'GEO & Discoverability',
    description: 'Visible where AI search happens — ChatGPT, Perplexity, and beyond.',
  },
];

const stats = [
  'Ship faster with focused engagements',
  'Clear AI UX that converts',
  'Visible in AI search',
  'No long lock-in — defined outcomes',
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
        badge="About Us"
        title="Partner with early-stage AI founders"
        subtitle="We help you launch, complete, and activate your AI product — with clarity and speed."
      />

      <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left: Content (7 columns on large) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-light tracking-tight text-white/90">
              Who <span className="font-normal text-white">we work with</span>
            </h3>
            <p className="text-base font-light leading-relaxed tracking-tight text-white/75 sm:text-lg">
              Zynra Studio partners with early-stage founders building AI products. We focus on 
              <span className="text-white"> product completion</span>, <span className="text-white">AI UX and conversion</span>, and 
              <span className="text-white"> GEO visibility</span> so you can ship, get users, and show up where AI search happens.
            </p>
            <p className="text-base font-light leading-relaxed tracking-tight text-white/75 sm:text-lg">
              We work in clear phases with defined outcomes. No vague retainers. You stay in control of scope and budget. 
              We don&apos;t do enterprise — we work with founders from pre-launch to early traction.
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
              className="group relative flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-light tracking-tight text-black hover:scale-105 hover:bg-white/90"
            >
              View Our Work
            </Link>
            <Link
              href="/contact"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-light tracking-tight text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/20"
            >
              Book Founder Strategy Call
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
                className="group relative flex flex-col items-center text-center rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-white/5"
              >
                {/* Subtle card glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100" />
                
                <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-white/60 ring-1 ring-white/10 group-hover:scale-110 group-hover:bg-white/10 group-hover:text-white group-hover:ring-white/20">
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

