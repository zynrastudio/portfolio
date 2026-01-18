import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/services', '/contact', '/projects'].map(
    (route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: route === '' ? ('daily' as const) : ('weekly' as const),
      priority: route === '' ? 1 : 0.8,
    })
  );

  return routes;
}
