# SEO Implementation Guide

This document outlines the comprehensive SEO implementation for the Art Index application.

## Overview

The application now includes:
- ✅ Complete meta tags and Open Graph tags
- ✅ Twitter Card support
- ✅ Structured data (JSON-LD)
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Web manifest for PWA
- ✅ Dynamic metadata generation
- ✅ SEO-optimized page titles and descriptions

## Files Created/Modified

### Core SEO Files
1. **`src/app/layout.js`** - Enhanced with comprehensive metadata
2. **`src/lib/metadata.js`** - Utility functions for metadata generation
3. **`public/site.webmanifest`** - PWA manifest
4. **`public/robots.txt`** - Search engine crawling instructions
5. **`public/sitemap.xml`** - Site structure for search engines

### Page-Specific Layouts
- `src/app/artists/layout.js`
- `src/app/collect/layout.js`
- `src/app/galleries/layout.js`
- `src/app/auctions/layout.js`
- `src/app/about/layout.js`
- `src/app/art-news/layout.js`
- `src/app/price-database/layout.js`
- `src/app/institutions/layout.js`
- `src/app/partnerships/layout.js`

### Components
- `src/components/SEOHead.jsx` - Dynamic SEO component for client-side pages

## Metadata Structure

### Base Metadata (Root Layout)
```javascript
export const metadata = {
  title: {
    default: "Art Index - Discover & Collect Fine Art Worldwide",
    template: "%s | Art Index"
  },
  description: "Discover, buy, and sell contemporary and classic artworks...",
  keywords: ["art gallery", "fine art", "contemporary art", ...],
  openGraph: {
    type: 'website',
    title: 'Art Index - Discover & Collect Fine Art Worldwide',
    description: '...',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Art Index - Discover & Collect Fine Art Worldwide',
    description: '...',
    images: ['/og-image.jpg']
  }
};
```

### Page-Specific Metadata
Each page has its own metadata defined in the corresponding layout file:

```javascript
// Example: src/app/artists/layout.js
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata.artists;
```

## Usage

### For Static Pages
Use the predefined metadata from `pageMetadata`:

```javascript
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata.home; // or .artists, .collect, etc.
```

### For Dynamic Pages
Use the `generateDynamicMetadata` function:

```javascript
import { generateDynamicMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }) {
  const artwork = await fetchArtwork(params.slug);
  
  return generateDynamicMetadata({
    type: 'artwork',
    title: artwork.title,
    description: artwork.description,
    image: artwork.image,
    url: `/artwork/${artwork.slug}`,
    additionalData: {
      publishedTime: artwork.createdAt,
      authors: [artwork.artist]
    }
  });
}
```

### For Client Components
Use the `SEOHead` component:

```javascript
import SEOHead from '@/components/SEOHead';

export default function MyClientComponent() {
  return (
    <>
      <SEOHead
        title="Dynamic Page Title"
        description="Dynamic page description"
        keywords={['dynamic', 'keywords']}
        image="/dynamic-image.jpg"
        url="/dynamic-page"
      />
      {/* Your component content */}
    </>
  );
}
```

## SEO Features Implemented

### 1. Meta Tags
- ✅ Title tags with template support
- ✅ Meta descriptions
- ✅ Keywords
- ✅ Viewport settings
- ✅ Theme color
- ✅ Apple mobile web app settings

### 2. Open Graph Tags
- ✅ og:title
- ✅ og:description
- ✅ og:image
- ✅ og:url
- ✅ og:type
- ✅ og:site_name
- ✅ og:locale

### 3. Twitter Cards
- ✅ twitter:card
- ✅ twitter:title
- ✅ twitter:description
- ✅ twitter:image
- ✅ twitter:creator
- ✅ twitter:site

### 4. Structured Data (JSON-LD)
- ✅ WebSite schema
- ✅ CreativeWork schema for artworks
- ✅ Person schema for artists
- ✅ SearchAction for site search

### 5. Technical SEO
- ✅ Canonical URLs
- ✅ Robots meta tags
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Web manifest
- ✅ Favicon links

### 6. Performance & Accessibility
- ✅ Preconnect to external domains
- ✅ Proper image alt attributes
- ✅ Semantic HTML structure
- ✅ Mobile-first responsive design

## Configuration

### Update Base URL
In `src/lib/metadata.js`, update the base URL:
```javascript
const baseUrl = 'https://your-domain.com';
```

### Update Verification Codes
In `src/app/layout.js`, replace placeholder verification codes:
```javascript
verification: {
  google: 'your-actual-google-verification-code',
  yandex: 'your-actual-yandex-verification-code',
  yahoo: 'your-actual-yahoo-verification-code',
},
```

### Update Social Media Handles
In `src/lib/metadata.js`, update Twitter handles:
```javascript
twitter: {
  creator: '@your-actual-handle',
  site: '@your-actual-handle',
}
```

## Testing

### 1. Meta Tags
Use browser dev tools to inspect the `<head>` section and verify all meta tags are present.

### 2. Open Graph
Test with Facebook's Sharing Debugger: https://developers.facebook.com/tools/debug/

### 3. Twitter Cards
Test with Twitter's Card Validator: https://cards-dev.twitter.com/validator

### 4. Structured Data
Test with Google's Rich Results Test: https://search.google.com/test/rich-results

### 5. Sitemap
Verify sitemap is accessible at: `https://your-domain.com/sitemap.xml`

## Best Practices

1. **Unique Titles**: Each page should have a unique, descriptive title
2. **Descriptive Descriptions**: Keep descriptions between 150-160 characters
3. **Relevant Keywords**: Use natural, relevant keywords without stuffing
4. **Quality Images**: Use high-quality images for Open Graph and Twitter Cards
5. **Fast Loading**: Optimize images and ensure fast page load times
6. **Mobile-Friendly**: Ensure all pages work well on mobile devices
7. **Accessibility**: Maintain proper alt attributes and semantic structure

## Maintenance

### Regular Updates
- Update sitemap.xml with new pages
- Refresh meta descriptions periodically
- Monitor search console for issues
- Update structured data as needed

### Monitoring
- Use Google Search Console to monitor performance
- Check Core Web Vitals regularly
- Monitor mobile usability
- Track keyword rankings

## Next Steps

1. **Create OG Images**: Generate proper Open Graph images for each page
2. **Add More Structured Data**: Implement more schema markup for galleries, auctions, etc.
3. **Implement Dynamic Sitemap**: Create a dynamic sitemap that updates automatically
4. **Add Breadcrumbs**: Implement breadcrumb navigation with structured data
5. **Optimize Images**: Implement next/image optimization for all images
6. **Add Analytics**: Implement proper analytics tracking
7. **Performance Optimization**: Implement lazy loading and code splitting 