export interface Project {
  title: string;
  slug: string;
  category: string;
  description: string;
  fullDescription: string;
  image: string;
  videoUrl?: string;
  videoId?: string;
  tags: string[];
  impact: string;
  demoUrl: string;
  codeUrl: string;
  client: string;
  date: string;
  role: string;
  challenges: string[];
  solutions: string[];
  results: string[];
}

export const projects: Project[] = [
  {
    title: 'VoiceVenture AI',
    slug: 'voiceventure-ai',
    category: 'AI Agents & Automation',
    description: 'Reclaim 5–7 hours per staff member, every week. AI Co-Workers handle K-12 SPED documentation, HR workflows, and compliance—through simple conversation.',
    fullDescription: 'We built a comprehensive ecosystem for VoiceVenture AI, including a high-converting marketing website, a robust web application for administrative tasks, and a mobile app for on-the-go documentation. The platform utilizes advanced AI agents to automate tedious K-12 administrative workflows, ensuring compliance and efficiency.',
    image: '/image/portfolio/voiceventure.PNG',
    videoId: '1156069133',
    tags: ['Next.js', 'React Native', 'OpenAI', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
    impact: 'Reclaimed 5-7 hrs/week per staff',
    demoUrl: 'https://www.voiceventure.ai/',
    codeUrl: '#',
    client: 'VoiceVenture AI',
    date: 'January 2026',
    role: 'Full-Stack Agency Partner',
    challenges: [
      'Creating a seamless voice-to-text documentation engine for educators.',
      'Ensuring strict FERPA and HIPAA compliance for student data.',
      'Building a unified experience across web, mobile, and marketing platforms.'
    ],
    solutions: [
      'Developed specialized AI agents for different administrative roles.',
      'Implemented enterprise-grade encryption and role-based access control.',
      'Utilized a shared design system to maintain brand consistency across all platforms.'
    ],
    results: [
      'Successfully deployed across multiple school districts.',
      'Significant reduction in administrative burnout among staff.',
      '100% compliance rating in recent educational audits.'
    ]
  },
  {
    title: 'Esplit',
    slug: 'esplit',
    category: 'Web3 & Fintech',
    description: 'The Future of Decentralized Splits. Create transparent, secure splits for betting, crowdfunding, and community decisions. Powered by smart contracts.',
    fullDescription: 'Esplit is a revolutionary Web3 staking and splitting platform. We engineered the smart contracts and the frontend interface to allow users to create decentralized splits for various purposes. The platform ensures automatic execution and instant settlements, bringing transparency to community-driven financial decisions.',
    image: '/image/portfolio/esplit.PNG',
    tags: ['Solidity', 'Polygon', 'Ethers.js', 'Next.js', 'Web3.js', 'Tailwind CSS'],
    impact: 'Instant On-Chain Settlements',
    demoUrl: 'https://www.esplitting.io/',
    codeUrl: '#',
    client: 'eSplitting.io',
    date: 'November 2025',
    role: 'Web3 Development Lead',
    challenges: [
      'Designing gas-efficient smart contracts for complex splitting logic.',
      'Providing a user-friendly interface for non-crypto native users.',
      'Ensuring the security of staked assets through rigorous auditing.'
    ],
    solutions: [
      'Optimized Solidity contracts using latest EIP standards.',
      'Integrated social login and gasless transactions for easier onboarding.',
      'Conducted multiple rounds of internal and external security audits.'
    ],
    results: [
      'Over $1M in total value locked (TVL) within months of launch.',
      'Zero smart contract vulnerabilities reported.',
      'High user retention rate due to platform transparency.'
    ]
  },
  {
    title: 'Spacel',
    slug: 'spacel',
    category: 'Marketplace & PropTech',
    description: 'The only workspace marketplace that guarantees success for both space seekers and Space Partners. Flexible hourly bookings without long-term commitments.',
    fullDescription: 'Based in Sydney, Australia, Spacel is a workspace marketplace that we helped bring to life by building their mobile app and website. The platform connects space seekers with flexible hourly bookings, removing the friction of long-term commitments and empowering space partners to monetize their unused square footage.',
    image: '/image/portfolio/spacel.PNG',
    tags: ['React Native', 'Next.js', 'Google Maps API', 'Stripe', 'PostgreSQL', 'Redis'],
    impact: 'Disrupted Sydney Workspace Market',
    demoUrl: 'https://www.spacel.app/',
    codeUrl: '#',
    client: 'Spacel App',
    date: 'September 2025',
    role: 'Lead Product Agency',
    challenges: [
      'Developing a complex booking and availability engine.',
      'Implementing real-time location-based search and filtering.',
      'Integrating a secure and flexible payment system for multi-party payouts.'
    ],
    solutions: [
      'Built a robust calendar-based booking system with sub-hour precision.',
      'Optimized Google Maps integration for performance on mobile devices.',
      'Leveraged Stripe Connect for seamless automated payouts to space partners.'
    ],
    results: [
      'Successfully launched in the Sydney market with rapid partner onboarding.',
      'High user satisfaction ratings for both seekers and partners.',
      'Scalable architecture ready for nationwide expansion.'
    ]
  },
  {
    title: 'Project Sync',
    slug: 'project-sync',
    category: 'Productivity & SaaS',
    description: 'A modern task management platform designed for teams that value simplicity and efficiency. Smart workflows, real-time collaboration, and intuitive design.',
    fullDescription: 'Project Sync is a next-generation task management platform currently under active development. We are crafting an elegant UI/UX experience and building a powerful web application that streamlines team collaboration. The platform focuses on reducing friction in project management with smart workflows, real-time updates, and an intuitive interface that teams actually enjoy using.',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=800&fit=crop',
    tags: ['Next.js', 'TypeScript', 'Figma', 'Tailwind CSS', 'WebSockets', 'PostgreSQL'],
    impact: 'Simplifying Team Collaboration',
    demoUrl: '#',
    codeUrl: '#',
    client: 'Project Sync',
    date: 'In Development',
    role: 'UI/UX Design & Web Development',
    challenges: [
      'Creating an intuitive interface that works for both novice and power users.',
      'Implementing real-time collaboration without overwhelming complexity.',
      'Designing a flexible system that adapts to different team workflows.'
    ],
    solutions: [
      'Developed a clean, minimalist UI with progressive disclosure of advanced features.',
      'Implemented WebSocket-based real-time sync with optimistic UI updates.',
      'Created customizable workflow templates while maintaining simplicity.'
    ],
    results: [
      'Currently in active development with positive early feedback.',
      'Designed for scalability from small teams to enterprise organizations.',
      'Focus on performance and user experience at every level.'
    ]
  },
];
