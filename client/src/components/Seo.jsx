import { useEffect } from 'react';

/**
 * Reusable SEO Component
 * Dynamically updates document title and meta tags (description, keywords, OpenGraph, JSON-LD)
 */
export default function Seo({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogType = 'website',
  ogImage,
  jsonLd,
}) {
  useEffect(() => {
    // 1. Update Document Title
    const originalTitle = document.title;
    if (title) {
      document.title = title;
    }

    // Helper to create or update a meta tag
    const setMetaTag = (attrName, attrValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Set Standard Meta Tags
    if (description) setMetaTag('name', 'description', description);
    if (keywords) setMetaTag('name', 'keywords', keywords);

    // 3. Set OpenGraph Meta Tags
    if (ogTitle || title) setMetaTag('property', 'og:title', ogTitle || title);
    if (ogDescription || description) setMetaTag('property', 'og:description', ogDescription || description);
    if (ogType) setMetaTag('property', 'og:type', ogType);
    if (ogImage) setMetaTag('property', 'og:image', ogImage);

    // 4. Set Canonical Link
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', canonical);
    }

    // 5. Set JSON-LD Schema
    let scriptEl = null;
    if (jsonLd) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }

    return () => {
      // Cleanup script on unmount
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogType, ogImage, jsonLd]);

  return null;
}
