'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Link from 'next/link';

const navItems = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!headerRef.current) return;

      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
        delay: 0.2,
      });
    },
    { scope: headerRef }
  );

  useGSAP(
    () => {
      if (!mobileMenuOpen || !mobileMenuRef.current) return;

      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );

      gsap.from(mobileMenuRef.current.querySelectorAll('a'), {
        x: -10,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power3.out',
      });
    },
    { dependencies: [mobileMenuOpen], scope: mobileMenuRef }
  );

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only prevent default and scroll for hash links
    if (href.startsWith('#') || href.includes('/#')) {
      e.preventDefault();
      
      // Extract the hash from the href
      const hash = href.includes('/#') ? href.split('/#')[1] : href.substring(1);
      const element = document.querySelector(`#${hash}`);
      
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
    // For regular routes, let Next.js handle navigation
    setMobileMenuOpen(false);
  };

  // Check if a nav item is active based on current pathname
  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5"
    >
      <nav className="mx-auto flex h-16 lg:h-20 max-w-7xl items-center justify-between px-6 md:px-10 lg:px-16">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-light tracking-tighter text-white transition-all duration-500 hover:opacity-70"
        >
          Zynra <span className="font-extralight text-white/50">Studio</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`text-[13px] font-light uppercase tracking-[0.1em] transition-all duration-500 relative py-2 ${
                isActive(item.href)
                  ? 'text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {item.label}
              <span className={`absolute bottom-0 left-0 h-px bg-white transition-all duration-500 ${
                isActive(item.href) ? 'w-full opacity-100' : 'w-0 opacity-0'
              }`} />
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white/80 hover:text-white transition-colors duration-300"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-black/95 backdrop-blur-lg border-b border-white/10"
        >
          <div className="flex flex-col gap-1 px-6 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`py-3 px-4 rounded-xl text-sm font-light tracking-tight transition-colors duration-300 ${
                  isActive(item.href)
                    ? 'text-white bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
