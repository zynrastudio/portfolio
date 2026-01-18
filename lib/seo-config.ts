import { Metadata } from 'next';

export const siteConfig = {
  name: 'Zynra Studio',
  description: 'Zynra Studio is a modern web and mobile development agency specializing in building elegant, scalable digital solutions. We transform ideas into powerful applications.',
  url: 'https://zynra.studio',
  ogImage: 'https://zynra.studio/og-image.png',
  keywords: [
    'web development agency',
    'mobile app development',
    'software development',
    'custom web applications',
    'React development',
    'Next.js development',
    'mobile app design',
    'UI/UX design',
    'full-stack development',
    'digital solutions',
    'software agency',
    'web design agency',
  ],
  links: {
    twitter: 'https://twitter.com/zynrastudio',
    github: 'https://github.com/zynrastudio',
    linkedin: 'https://linkedin.com/company/zynrastudio',
    email: 'hi@zynra.studio',
  },
  creator: 'Zynra Studio',
  authors: [
    {
      name: 'Zynra Studio',
      url: 'https://zynra.studio',
    },
  ],
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@zynrastudio',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Structured Data for Organization
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  description: siteConfig.description,
  email: siteConfig.links.email,
  sameAs: [
    siteConfig.links.twitter,
    siteConfig.links.github,
    siteConfig.links.linkedin,
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: siteConfig.links.email,
    contactType: 'customer service',
    availableLanguage: ['English'],
  },
  founder: {
    '@type': 'Person',
    name: 'Zynra Studio Team',
  },
  foundingDate: '2024',
  knowsAbout: [
    'Web Development',
    'Mobile App Development',
    'Software Engineering',
    'UI/UX Design',
    'Full-Stack Development',
  ],
};
