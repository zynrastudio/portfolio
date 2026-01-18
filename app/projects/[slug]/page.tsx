'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRef, useEffect } from 'react';
import SectionContainer from '@/components/ui/section-container';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  User, 
  Tag,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '@/lib/projects-data';

gsap.registerPlugin(ScrollTrigger);

export default function CaseStudyPage() {
  const { slug } = useParams();
  const project = projects.find(p => p.slug === slug);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!project) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-content > *', {
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
      delay: 0.5
    });

    tl.from('.hero-image', {
      scale: 1.1,
      opacity: 0,
      duration: 1.5
    }, 0.2);

    gsap.from('.section-animate', {
      y: 40,
      opacity: 0,
      stagger: 0.2,
      duration: 1,
      scrollTrigger: {
        trigger: '.content-wrapper',
        start: 'top 80%',
      }
    });
  }, { scope: containerRef });

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-light tracking-tighter">Project Not Found</h1>
          <Link href="/projects" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden flex items-end pb-20">
        <div className="hero-image absolute inset-0 -z-10">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        <div className="hero-content relative mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16 z-10">
          <Link 
            href="/projects" 
            className="mb-8 inline-flex items-center gap-2 text-sm font-light tracking-tight text-white/50 hover:text-white transition-all duration-300"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Link>
          <div className="space-y-4">
            <span className="text-[10px] font-light uppercase tracking-[0.2em] text-white/60">
              {project.category}
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight tracking-tighter leading-[1.1]">
              {project.title}
            </h1>
            <p className="max-w-2xl text-lg font-light leading-relaxed tracking-tight text-white/60 sm:text-xl">
              {project.description}
            </p>
          </div>
        </div>
      </section>

      {/* Project Meta Info */}
      <section className="border-y border-white/5 bg-white/[0.01] backdrop-blur-sm py-12">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/30">
                <User size={14} />
                <span className="text-[10px] font-light uppercase tracking-widest">Client</span>
              </div>
              <p className="text-sm font-light text-white/80">{project.client}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/30">
                <Calendar size={14} />
                <span className="text-[10px] font-light uppercase tracking-widest">Date</span>
              </div>
              <p className="text-sm font-light text-white/80">{project.date}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/30">
                <Tag size={14} />
                <span className="text-[10px] font-light uppercase tracking-widest">Role</span>
              </div>
              <p className="text-sm font-light text-white/80">{project.role}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/30">
                <CheckCircle2 size={14} />
                <span className="text-[10px] font-light uppercase tracking-widest">Impact</span>
              </div>
              <p className="text-sm font-light text-white/80">{project.impact}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="content-wrapper mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-24 space-y-32">
        
        {/* Overview */}
        <div className="section-animate grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <h2 className="text-2xl font-light tracking-tight text-white">Project Overview</h2>
          </div>
          <div className="lg:col-span-8">
            <p className="text-lg font-light leading-relaxed text-white/60">
              {project.fullDescription}
            </p>
          </div>
        </div>

        {/* Challenges & Solutions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div className="section-animate space-y-8">
            <h2 className="text-2xl font-light tracking-tight text-white">The Challenges</h2>
            <ul className="space-y-6">
              {project.challenges.map((challenge, i) => (
                <li key={i} className="flex gap-4 group">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/20 transition-all duration-300 group-hover:bg-white/60" />
                  <p className="text-base font-light leading-relaxed text-white/60 group-hover:text-white/80 transition-colors">
                    {challenge}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="section-animate space-y-8">
            <h2 className="text-2xl font-light tracking-tight text-white">Our Solutions</h2>
            <ul className="space-y-6">
              {project.solutions.map((solution, i) => (
                <li key={i} className="flex gap-4 group">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/20 transition-all duration-300 group-hover:bg-white/60" />
                  <p className="text-base font-light leading-relaxed text-white/60 group-hover:text-white/80 transition-colors">
                    {solution}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Results */}
        <div className="section-animate rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-12 lg:p-20 backdrop-blur-md">
          <div className="flex flex-col items-center text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-light tracking-tight text-white">The Results</h2>
              <p className="text-base font-light text-white/50 max-w-xl">
                The impact delivered through this collaboration exceeded expectations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
              {project.results.map((result, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-px w-8 bg-white/20 mx-auto" />
                  <p className="text-lg font-light text-white/80">{result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Founder Video Review */}
        {project.videoUrl && (
          <div className="section-animate space-y-12">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-xl font-light tracking-tight text-white/40 uppercase tracking-[0.2em]">Founder Review</h2>
              <div className="h-px w-12 bg-white/10" />
            </div>
            <div className="relative mx-auto max-w-4xl aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/[0.02] shadow-2xl">
              <iframe
                src={project.videoUrl}
                title={`Founder review for ${project.title}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Tech Stack used */}
        <div className="section-animate space-y-12">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-light tracking-tight text-white/40 uppercase tracking-[0.2em]">Tech Stack Used</h2>
            <div className="h-px w-12 bg-white/10" />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {project.tags.map((tag, i) => (
              <span key={i} className="rounded-full border border-white/5 bg-white/[0.02] px-6 py-2 text-sm font-light tracking-tight text-white/60 backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Next Project Link */}
        <div className="section-animate pt-12 text-center">
          <div className="inline-flex flex-col items-center gap-8">
            <p className="text-[10px] font-light uppercase tracking-[0.3em] text-white/30">Next Project</p>
            <Link 
              href="/projects" 
              className="group flex items-center gap-4 text-3xl font-light tracking-tighter text-white/60 hover:text-white transition-all duration-500"
            >
              Explore More Work
              <ArrowRight size={24} className="transition-transform duration-500 group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
