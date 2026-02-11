'use client';

import { useRef } from "react";
import CalEmbedLazy from './cal-embed-lazy';
import SectionContainer, { SectionHeading } from './section-container';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const contactMethods = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hi@zynra.studio',
    href: 'mailto:hi@zynra.studio',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: '@zynrastudio',
    href: 'https://github.com/zynrastudio',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'Zynra Studio',
    href: 'https://linkedin.com/company/zynrastudio',
  },
  {
    icon: Twitter,
    label: 'Twitter',
    value: '@zynrastudio',
    href: 'https://twitter.com/zynrastudio',
  },
];

export default function ContactSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const calContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      gsap.from(calContainerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power2.out',
        force3D: true, // Force GPU acceleration
        scrollTrigger: {
          trigger: calContainerRef.current,
          start: 'top 85%',
        },
      });

      const items = containerRef.current.querySelectorAll('.contact-method');
      gsap.from(items, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power2.out',
        force3D: true, // Force GPU acceleration
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 90%',
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <SectionContainer id="contact" variant="gradient" animate={false} className="overflow-hidden">
      {/* Background depth spots */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-white/[0.02] blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-white/[0.01] blur-[100px]" />

      <SectionHeading
        badge="Connect"
        title="See If We're a Fit"
        subtitle="Book a Founder Strategy Call. We'll align on your situation and whether we're a fit."
      />

      <div ref={containerRef} className="mx-auto max-w-5xl space-y-16">
        {/* Cal.com Embed Container */}
        <div 
          ref={calContainerRef}
          className="relative rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-2xl overflow-hidden p-2 lg:p-4 shadow-2xl"
        >
          {/* Calendar Header Overlay */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <CalEmbedLazy
            namespace="30min"
            calLink="zynra.studio/30min"
            config={{ layout: "month_view" }}
          />
        </div>

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <a
                key={index}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="contact-method group flex flex-col items-center gap-4 rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-md hover:bg-white/[0.05] hover:border-white/10 hover:scale-105"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white/40 ring-1 ring-white/10 group-hover:bg-white/10 group-hover:text-white group-hover:scale-110 group-hover:ring-white/20">
                  <Icon size={24} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-light uppercase tracking-[0.2em] text-white/30 group-hover:text-white/50">
                    {method.label}
                  </p>
                  <p className="text-sm font-light tracking-tight text-white/60 group-hover:text-white">
                    {method.value}
                  </p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Status Indicator */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[11px] font-light uppercase tracking-widest text-white/50">
              Currently available for new projects
            </span>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
