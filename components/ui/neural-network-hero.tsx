'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

interface HeroProps {
  title: string;
  description: string;
  badgeText?: string;
  badgeLabel?: string;
  ctaButtons?: Array<{ text: string; href: string; primary?: boolean }>;
  microDetails?: Array<string>;
}

function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const spots = containerRef.current.querySelectorAll('.bg-spot');
      gsap.to(spots, {
        x: 'random(-40, 40)',
        y: 'random(-40, 40)',
        duration: 'random(10, 20)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        force3D: true, // Force GPU acceleration
        stagger: {
          each: 2,
          from: 'random',
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-black" aria-hidden="true">
      {/* Dynamic atmospheric spots */}
      <div className="bg-spot absolute left-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px] will-change-transform" />
      <div className="bg-spot absolute right-[10%] top-[10%] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px] will-change-transform" />
      <div className="bg-spot absolute bottom-[10%] left-[20%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[150px] will-change-transform" />
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* Main radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}

export default function Hero({
  title,
  description,
  badgeText = "Available for Work",
  badgeLabel = "Open",
  ctaButtons = [
    { text: "View Projects", href: "#projects", primary: true },
    { text: "Get in Touch", href: "#contact" }
  ],
  microDetails = ["Web Development", "Mobile Apps", "AI Solutions"]
}: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const paraRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const microRef = useRef<HTMLUListElement | null>(null);
  const microItem1Ref = useRef<HTMLLIElement | null>(null);
  const microItem2Ref = useRef<HTMLLIElement | null>(null);
  const microItem3Ref = useRef<HTMLLIElement | null>(null);

  useGSAP(
    () => {
      if (!headerRef.current) return;

      // Set LCP element (description) to visible immediately for faster LCP
      if (paraRef.current) {
        gsap.set(paraRef.current, { opacity: 1, y: 0 });
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(badgeRef.current, {
        y: -10,
        opacity: 0,
        duration: 0.4,
        force3D: true,
      }, 0);

      // Optimize header animation for faster LCP
      tl.from(headerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        force3D: true,
      }, 0);

      // LCP element - minimal animation, already visible
      tl.from(paraRef.current, {
        y: 10,
        opacity: 0.5, // Start partially visible
        duration: 0.4,
        force3D: true,
      }, 0.1);

      tl.from(ctaRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        force3D: true,
      }, '-=0.4');

      const microItems = [microItem1Ref.current, microItem2Ref.current, microItem3Ref.current].filter(Boolean);
      tl.from(microItems, {
        y: 10,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        force3D: true,
      }, '-=0.3');
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden flex items-center">
      <HeroBackground />

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16 z-10">
        <div className="flex flex-col items-start gap-8 max-w-4xl">
          <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <span className="text-[10px] font-light uppercase tracking-[0.2em] text-white/60">{badgeLabel}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-light tracking-tight text-white/80">{badgeText}</span>
          </div>

          <h1 ref={headerRef} className="text-left text-4xl font-extralight leading-[1.12] tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl will-change-transform">
            {title}
          </h1>

          <p ref={paraRef} className="max-w-2xl text-left text-lg font-light leading-relaxed tracking-tight text-white/60 sm:text-xl will-change-transform" style={{ opacity: 1 }}>
            {description}
          </p>

          <div ref={ctaRef} className="flex flex-wrap items-center gap-4 pt-4">
            {ctaButtons.map((button, index) => (
              <a
                key={index}
                href={button.href}
                className={`rounded-2xl px-8 py-4 text-sm font-light tracking-tight transition-all duration-500 ${
                  button.primary
                    ? "bg-white text-black hover:scale-105 hover:bg-white/90"
                    : "border border-white/10 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/20"
                }`}
              >
                {button.text}
              </a>
            ))}
          </div>

          <ul ref={microRef} className="mt-12 flex flex-wrap gap-8 text-[11px] font-extralight uppercase tracking-[0.2em] text-white/30">
            {microDetails.map((detail, index) => {
              const refMap = [microItem1Ref, microItem2Ref, microItem3Ref];
              return (
                <li key={index} ref={refMap[index]} className="flex items-center gap-3">
                  <div className="h-px w-4 bg-white/20" /> {detail}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Bottom fade for smoother section transitions */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
