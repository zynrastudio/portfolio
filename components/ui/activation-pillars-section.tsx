'use client';

import SectionContainer, { SectionHeading } from './section-container';
import { Wrench, Sparkles, Search } from 'lucide-react';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

const pillars: Array<{
  icon: typeof Wrench;
  title: string;
  message: string;
  audience?: string;
  includes: string[];
  color: string;
}> = [
  {
    icon: Wrench,
    title: 'Product Completion & Advanced Builds',
    message: 'We help you finish what you started.',
    includes: [
      'Advanced feature implementation',
      'AI agent architecture',
      'Integrations (OpenAI, Supabase, Stripe)',
      'Performance optimization',
    ],
    color: 'from-blue-500/10',
  },
  {
    icon: Sparkles,
    title: 'UI/UX & Conversion Activation',
    message: 'Make your product intuitive and usable.',
    includes: [
      'UI/UX design',
      'Conversion-focused landing pages',
      'Onboarding redesign',
      'Demo experience design',
    ],
    color: 'from-purple-500/10',
  },
  {
    icon: Search,
    title: 'GEO & SEO Visibility',
    message: 'Be visible where AI search happens.',
    includes: [
      'Generative engine optimization',
      'Entity structure',
      'Answer-based content',
      'AI engine discoverability',
    ],
    color: 'from-green-500/10',
  },
];

export default function ActivationPillarsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
        },
      });

      if (headingRef.current) {
        tl.from(headingRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        });
      }

      const cards = containerRef.current.querySelectorAll('.pillar-card');
      tl.from(
        cards,
        {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
        },
        '-=0.4'
      );
    },
    { scope: containerRef }
  );

  return (
    <SectionContainer id="pillars" variant="gradient" animate={false} className="overflow-hidden">
      <div ref={containerRef}>
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-white/[0.02] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-white/[0.02] blur-[100px] rounded-full" />

        <div ref={headingRef}>
          <SectionHeading
            badge="How we help"
            title="Activation Pillars"
            subtitle="Outcome-focused support for early AI founders."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className="pillar-card group relative flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:p-10 backdrop-blur-md hover:bg-white/[0.08] hover:border-white/20"
              >
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${pillar.color} to-transparent opacity-0 group-hover:opacity-100`} />
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white/80 ring-1 ring-white/20 group-hover:scale-110 group-hover:bg-white/10 group-hover:text-white group-hover:ring-white/30">
                    <Icon size={28} />
                  </div>
                  <h3 className="mb-2 text-xl font-light tracking-tight text-white">
                    {pillar.title}
                  </h3>
                  {pillar.audience && (
                    <p className="mb-3 text-xs font-light text-white/50">
                      {pillar.audience}
                    </p>
                  )}
                  <p className="mb-6 text-base font-light leading-relaxed text-white/80">
                    {pillar.message}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {pillar.includes.map((item, i) => (
                      <li key={i} className="text-sm font-light text-white/70 flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-white/40 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/for-founders"
                    className="inline-block text-sm font-light text-white/60 hover:text-white underline"
                  >
                    Learn more →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
}
