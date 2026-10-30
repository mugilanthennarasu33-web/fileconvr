import React, { useEffect } from 'react';
import { SITE_CONFIG, type ToolSeoContent } from '../data/seoData';

export interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: string;
  toolContent?: ToolSeoContent;
  breadcrumbs?: Array<{ name: string; path: string }>;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title = SITE_CONFIG.defaultTitle,
  description = SITE_CONFIG.defaultDescription,
  canonicalPath = '/',
  noindex = false,
  ogType = 'website',
  toolContent,
  breadcrumbs,
}) => {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to set or create meta tag
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag(
      'name',
      'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    );
    setMetaTag('name', 'theme-color', SITE_CONFIG.themeColor);

    // 3. Canonical URL
    const canonicalUrl = `${SITE_CONFIG.baseUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 4. Open Graph Meta Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', SITE_CONFIG.name);
    setMetaTag('property', 'og:image', `${SITE_CONFIG.baseUrl}/og-image.png`);

    // 5. Twitter / X Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', `${SITE_CONFIG.baseUrl}/og-image.png`);
    setMetaTag('name', 'twitter:site', SITE_CONFIG.twitterHandle);

    // 6. JSON-LD Structured Data
    // Remove any previously injected structured data scripts
    const existingJsonLd = document.querySelectorAll('script[data-seo="fileconvr-jsonld"]');
    existingJsonLd.forEach((el) => el.remove());

    if (!noindex) {
      const schemas: object[] = [];

      // Always include WebSite schema
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.baseUrl,
        description: SITE_CONFIG.defaultDescription,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_CONFIG.baseUrl}/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      });

      // Organization Schema
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.baseUrl,
        logo: `${SITE_CONFIG.baseUrl}/favicon.svg`,
        sameAs: ['https://twitter.com/fileconvr', 'https://github.com/fileconvr'],
      });

      // BreadcrumbList Schema if breadcrumbs are present
      if (breadcrumbs && breadcrumbs.length > 0) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((crumb, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: crumb.name,
            item: `${SITE_CONFIG.baseUrl}${crumb.path}`,
          })),
        });
      }

      // Tool-specific schemas (SoftwareApplication & FAQPage)
      if (toolContent) {
        // SoftwareApplication schema
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: toolContent.h1,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'All (Web Browser)',
          browserRequirements: 'Requires JavaScript and HTML5 Canvas support',
          offers: {
            '@type': 'Offer',
            price: '0.00',
            priceCurrency: 'USD',
          },
          description: toolContent.metaDescription,
          url: canonicalUrl,
        });

        // FAQPage schema if FAQs exist
        if (toolContent.faqs && toolContent.faqs.length > 0) {
          schemas.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: toolContent.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          });
        }
      }

      // Inject JSON-LD script tag
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', 'fileconvr-jsonld');
      script.text = JSON.stringify(schemas);
      document.head.appendChild(script);
    }
  }, [title, description, canonicalPath, noindex, ogType, toolContent, breadcrumbs]);

  return null;
};
