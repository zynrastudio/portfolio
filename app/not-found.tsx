'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.from(containerRef.current.children, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div ref={containerRef} className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-8xl md:text-9xl font-extralight text-white/20">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white">
            Page Not Found
          </h2>
          <p className="text-lg font-light text-white/60 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="px-8 py-4 rounded-full bg-white text-black font-light tracking-tight hover:bg-white/90 transition-colors duration-300"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 rounded-full border border-white/20 text-white font-light tracking-tight hover:bg-white/5 transition-colors duration-300"
          >
            Contact Us
          </Link>
        </div>

        <div className="pt-12">
          <p className="text-xs font-light uppercase tracking-[0.3em] text-white/30">
            Zynra Studio
          </p>
        </div>
      </div>
    </div>
  );
}
