import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = 'Philz Signature | Luxury Perfumes & Artisanal Fragrances Nigeria';
const DEFAULT_DESCRIPTION = "Discover Philz Signature — Nigeria's premier luxury fragrance house. Shop artisanal parfums, signature scents, and bespoke fragrances. Free delivery available.";
const DEFAULT_IMAGE = 'https://www.philzsignature.com/brand/philz-favicon.png';
const BASE_URL = 'https://www.philzsignature.com';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  ogTitle,
  ogDescription,
  structuredData,
}) => {
  const finalTitle = title ? title : DEFAULT_TITLE;
  const finalDesc = description;
  const finalOgTitle = ogTitle || finalTitle;
  const finalOgDesc = ogDescription || finalDesc;
  const finalUrl = canonical ? (canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical}`) : window.location.href;

  useEffect(() => {
    // 1. Title
    document.title = finalTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Meta description
    setMetaTag('name', 'description', finalDesc);

    // 3. Open Graph
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:title', finalOgTitle);
    setMetaTag('property', 'og:description', finalOgDesc);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', finalUrl);

    // 4. Twitter
    setMetaTag('name', 'twitter:title', finalOgTitle);
    setMetaTag('name', 'twitter:description', finalOgDesc);
    setMetaTag('name', 'twitter:image', ogImage);
    setMetaTag('name', 'twitter:url', finalUrl);

    // 5. Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', finalUrl);

    // 6. Structured Data (JSON-LD)
    const scriptId = 'page-structured-data';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;
    if (structuredData) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    } else if (scriptElement) {
      scriptElement.remove();
    }

    return () => {
      // Optional cleanup
    };
  }, [finalTitle, finalDesc, finalOgTitle, finalOgDesc, finalUrl, ogType, ogImage, structuredData]);

  return null;
};
