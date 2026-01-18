'use client';

import SectionContainer, { SectionHeading } from './section-container';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

const teamMembers = [
  {
    name: 'Bright Akolade',
    role: 'Founder & Lead Engineer',
    avatar: '/image/team/brightakolade.png',
    socials: {
      github: 'https://github.com/brightakolade',
      linkedin: 'https://linkedin.com/in/brightakolade',
      twitter: 'https://twitter.com/brightakolade'
    }
  },
  {
    name: 'Michael Brum',
    role: 'Co-Founder & Creative Director',
    avatar: '/image/team/Michael.jpeg',
    socials: {
      github: 'https://github.com/michaelbrum',
      linkedin: 'https://linkedin.com/in/michaelbrum',
      twitter: 'https://twitter.com/michaelbrum'
    }
  },
  {
    name: 'Brem Chevy',
    role: 'Lead Designer',
    avatar: '/image/team/bremchevy.png',
    socials: {
      github: 'https://github.com/bremchevy',
      linkedin: 'https://linkedin.com/in/bremchevy',
      twitter: 'https://twitter.com/bremchevy'
    }
  }
];

export default function TeamSection() {
  return (
    <SectionContainer id="team" variant="dark" className="py-20">
      <SectionHeading
        badge="Our Team"
        title="The Minds Behind Zynra"
        subtitle="A small, focused team of engineers and designers dedicated to building the future of digital experiences."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative flex flex-col items-center"
          >
            {/* Avatar Container */}
            <div className="relative mb-6 w-full aspect-square max-w-[280px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl transition-all duration-700 group-hover:border-white/20 group-hover:scale-[1.02] shadow-2xl shadow-black/50">
              <img
                src={member.avatar}
                alt={member.name}
                className="h-full w-full object-cover grayscale opacity-70 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
              />
              
              {/* Social Overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <a
                  href={member.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  aria-label={`${member.name}'s GitHub`}
                >
                  <Github size={20} />
                </a>
                <a
                  href={member.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  aria-label={`${member.name}'s LinkedIn`}
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href={member.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  aria-label={`${member.name}'s Twitter`}
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>

            {/* Member Info */}
            <div className="text-center">
              <h3 className="text-xl font-light text-white mb-1 group-hover:text-white/90 transition-colors">
                {member.name}
              </h3>
              <p className="text-sm font-light uppercase tracking-widest text-white/40">
                {member.role}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
