/**
 * Utility functions for generating metadata for different pages
 */

export function generateMetadata({
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

  const allKeywords = [...new Set([...baseKeywords, ...keywords])];

  return {
    title: {
      absolute: title,
      template: '%s | Art Index'
    },
    description,
    keywords: allKeywords,
    authors: authors.map(author => ({ name: author })),
    creator: 'Art Index',
    publisher: 'Art Index',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: fullUrl,
      siteName: 'Art Index',
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime,
      modifiedTime,
      authors,
      section,
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@artindex',
      site: '@artindex',
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
    category: 'art',
  };
}

// Predefined metadata for common pages
export const pageMetadata = {
  home: generateMetadata({
    title: 'Art Index - Discover & Collect Fine Art Worldwide',
    description: 'Discover, buy, and sell contemporary and classic artworks from top artists and galleries worldwide. Explore our curated collection of paintings, sculptures, photography, and more.',
    url: '/',
    keywords: ['art marketplace', 'buy art', 'sell art', 'art gallery online']
  }),

  artists: generateMetadata({
    title: 'Artists - Discover Talented Artists Worldwide',
    description: 'Explore talented artists from around the world. Discover emerging and established artists, view their portfolios, and find unique artworks.',
    url: '/artists',
    keywords: ['artists', 'emerging artists', 'established artists', 'artist portfolios']
  }),

  collect: generateMetadata({
    title: 'Collect Art - Browse & Buy Fine Artworks',
    description: 'Browse and buy fine artworks from our extensive collection. Find paintings, sculptures, photography, and more from talented artists worldwide.',
    url: '/collect',
    keywords: ['buy art', 'art for sale', 'fine art', 'art collection', 'paintings for sale']
  }),

  galleries: generateMetadata({
    title: 'Art Galleries - Explore Top Galleries Worldwide',
    description: 'Discover top art galleries showcasing exceptional works. Browse gallery collections, exhibitions, and find your next masterpiece.',
    url: '/galleries',
    keywords: ['art galleries', 'gallery exhibitions', 'gallery collections', 'art exhibitions']
  }),

  auctions: generateMetadata({
    title: 'Art Auctions - Bid on Fine Artworks',
    description: 'Participate in live art auctions and bid on exceptional artworks. Discover unique pieces from renowned artists and galleries.',
    url: '/auctions',
    keywords: ['art auctions', 'live auctions', 'bid on art', 'auction house', 'fine art auctions']
  }),

  about: generateMetadata({
    title: 'About Art Index - Your Trusted Art Marketplace',
    description: 'Learn about Art Index, your trusted platform for discovering, buying, and selling fine art. Connect with artists, galleries, and collectors worldwide.',
    url: '/about',
    keywords: ['about us', 'art marketplace', 'art platform', 'art community']
  }),

  artNews: generateMetadata({
    title: 'Art News & Insights - Latest in the Art World',
    description: 'Stay updated with the latest art news, trends, and insights. Read about artists, exhibitions, market trends, and art world developments.',
    url: '/art-news',
    keywords: ['art news', 'art trends', 'art insights', 'art world news', 'art market trends']
  }),

  priceDatabase: generateMetadata({
    title: 'Art Price Database - Art Market Analytics',
    description: 'Access comprehensive art market data and pricing information. Track art values, market trends, and investment opportunities.',
    url: '/price-database',
    keywords: ['art prices', 'art market data', 'art investment', 'art valuation', 'market analytics']
  }),

  institutions: generateMetadata({
    title: 'Museums & Institutions - Cultural Art Collections',
    description: 'Explore museums, cultural institutions, and their art collections. Discover historical and contemporary artworks from around the world.',
    url: '/institutions',
    keywords: ['museums', 'cultural institutions', 'art collections', 'museum exhibitions']
  }),

  partnerships: generateMetadata({
    title: 'Partnerships - Collaborate with Art Index',
    description: 'Partner with Art Index to expand your reach in the art world. Opportunities for galleries, artists, and art organizations.',
    url: '/partnerships',
    keywords: ['art partnerships', 'gallery partnerships', 'artist collaborations', 'art organizations']
  })
};

// Function to generate metadata for dynamic pages (artworks, artists, galleries)
export function generateDynamicMetadata({
  type, // 'artwork', 'artist', 'gallery', 'auction'
  title,
  description,
  image,
  url,
  additionalData = {}
}) {
  const baseKeywords = {
    artwork: ['artwork', 'painting', 'sculpture', 'fine art', 'original art'],
    artist: ['artist', 'painter', 'sculptor', 'artist portfolio', 'artist bio'],
    gallery: ['art gallery', 'gallery', 'exhibition', 'art space'],
    auction: ['auction', 'bidding', 'art auction', 'live auction']
  };

  const keywords = baseKeywords[type] || [];

  return generateMetadata({
    title,
    description,
    keywords,
    image,
    url,
    type: 'article',
    ...additionalData
  });
}

// Function to generate structured data for artworks
export function generateArtworkStructuredData(artwork) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": artwork.title,
    "description": artwork.description,
    "image": artwork.image,
    "creator": {
      "@type": "Person",
      "name": artwork.artist
    },
    "dateCreated": artwork.year,
    "artMedium": artwork.medium,
    "artform": artwork.category,
    "offers": {
      "@type": "Offer",
      "price": artwork.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };
}

// Function to generate structured data for artists
export function generateArtistStructuredData(artist) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": artist.name,
    "description": artist.bio,
    "image": artist.image,
    "nationality": artist.nationality,
    "birthDate": artist.birthDate,
    "deathDate": artist.deathDate,
    "jobTitle": "Artist",
    "worksFor": {
      "@type": "Organization",
      "name": "Art Index"
    }
  };
} 