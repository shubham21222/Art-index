'use client';

import { useEffect } from 'react';
import Head from 'next/head';

export default function SEOHead({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url = '',
  type = 'website',
  publishedTime,
  modifiedTime,
  authors = ['Art Index Team'],
  section = 'Art',
  tags = []
}) {
  const baseUrl = 'https://artindex.com';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  
  const baseKeywords = [
    'art gallery',
    'fine art',
    'contemporary art',
    'art for sale',
    'artists',
    'paintings',
    'sculptures',
    'photography',
    'art auctions',
    'art collection',
    'modern art',
    'classic art',
    'art marketplace',
    'art investment',
    'art exhibitions'
  ];

  const allKeywords = [...new Set([...baseKeywords, ...keywords])].join(', ');

  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = allKeywords;

    // Update Open Graph tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:image': image,
      'og:url': fullUrl,
      'og:type': type,
      'og:site_name': 'Art Index',
      'og:locale': 'en_US'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    });

    // Update Twitter Card tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:creator': '@artindex',
      'twitter:site': '@artindex'
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    });

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;

  }, [title, description, allKeywords, image, fullUrl, type]);

  return null; // This component doesn't render anything
} 