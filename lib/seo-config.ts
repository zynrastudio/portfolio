import { Metadata } from 'next';

export const siteConfig = {
  name: 'Zynra Studio',
  description: 'We help early AI founders launch, complete, and activate their products. Product completion, AI UX, and GEO visibility for generative search.',
  url: 'https://zynra.studio',
  ogImage: 'https://zynra.studio/logo-og.svg', // TODO: Replace with og-image.png (1200x630px) when ready
  keywords: [
    'AI founders',
    'AI product launch',
    'product completion',
    'AI UX',
    'GEO',
    'generative engine optimization',
    'early-stage founders',
    'AI startup',
    'founder strategy call',
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
    'AI Product Development',
    'Product Completion',
    'AI UX',
    'GEO',
    'Generative Engine Optimization',
    'Early-Stage Founders',
  ],
};
