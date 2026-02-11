'use client';

import SectionContainer, { SectionHeading } from './section-container';
import { AlertCircle } from 'lucide-react';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const painPoints: { heading: string; context: string }[] = [
  {
    heading: 'Advanced features half-built',
    context: 'You started building the hard parts — integrations, agents, APIs — but they\'re not production-ready. Shipping feels out of reach.',
  },
  {
    heading: 'AI workflow feels confusing',
    context: 'The steps users take with your AI are unclear. Inputs, outputs, and what to do next feel muddled — the product flow needs structure.',
  },
  {
    heading: 'Website looks generic',
    context: 'Your pages look like every other AI product. You need a professional, distinctive UI and design so the product feels credible and converts.',
  },
  {
    heading: 'MVP works but doesn\'t convert',
    context: 'Traffic or signups are there, but activation and conversion are low. The value isn\'t clear enough.',
  },
  {
    heading: 'No visibility in ChatGPT / Perplexity',
    context: 'When people ask AI tools for solutions in your space, your product doesn\'t show up. You\'re invisible where discovery happens.',
  },
  {
    heading: 'Technical debt slowing launch',
    context: 'Legacy code, unclear architecture, or missing tests are blocking you from moving fast or bringing in help.',
  },
];

export default function FounderProblemsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);

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

      if (cardsRef.current) {
        tl.from(
          cardsRef.current.querySelectorAll('.problem-card'),
          {
            y: 28,
            opacity: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
          },
          '-=0.4'
        );
      }

      if (closingRef.current) {
        tl.from(closingRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
        }, '-=0.3');
      }
    },
    { scope: containerRef }
  );

  return (
    <SectionContainer id="founder-problems" variant="dark" animate={false} className="overflow-hidden">
      <div ref={containerRef}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[400px] w-[400px] bg-white/[0.02] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 -z-10 h-[300px] w-[300px] bg-white/[0.02] blur-[100px] rounded-full" />

        <div ref={headingRef} className="flex flex-col items-center text-center">
          <p className="text-xl font-light tracking-tight text-white/90 sm:text-2xl mb-2">
            You&apos;ve built something powerful.
          </p>
          <p className="text-xl font-light tracking-tight text-white/90 sm:text-2xl mb-8">
            It just needs clarity, completion and activation.
          </p>
          <SectionHeading
            badge="Sound familiar?"
            title="Where Early AI Founders Get Stuck"
            subtitle="Common pain points we help solve."
            align="center"
          />
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-14 lg:mb-16"
        >
          {painPoints.map((item, index) => (
            <div
              key={index}
              className="problem-card group relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:p-6 backdrop-blur-md hover:bg-white/[0.06] hover:border-white/15 transition-colors duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/50 ring-1 ring-white/10 group-hover:bg-white/10 group-hover:text-white/70 group-hover:ring-white/20 transition-colors duration-300">
                  <AlertCircle size={18} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-light leading-snug text-white pt-0.5 group-hover:text-white">
                  {item.heading}
                </h3>
              </div>
              <p className="text-sm font-light leading-relaxed text-white/65 pl-[52px] group-hover:text-white/75">
                {item.context}
              </p>
            </div>
          ))}
        </div>

        <div
          ref={closingRef}
          className="relative mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-6 text-center backdrop-blur-sm"
        >
          <p className="text-xl font-light tracking-tight text-white sm:text-2xl">
            That&apos;s where we step in.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
