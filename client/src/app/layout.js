import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from '@/redux/provider';
import { Toaster } from 'react-hot-toast';
import ApiDebugger from './components/ApiDebugger';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Art Index - Discover & Collect Fine Art Worldwide",
    template: "%s | Art Index"
  },
  description: "Discover, buy, and sell contemporary and classic artworks from top artists and galleries worldwide. Explore our curated collection of paintings, sculptures, photography, and more.",
  keywords: [
    "art gallery",
    "fine art",
    "contemporary art",
    "art for sale",
    "artists",
    "paintings",
    "sculptures",
    "photography",
    "art auctions",
    "art collection",
    "modern art",
    "classic art",
    "art marketplace",
    "art investment",
    "art exhibitions"
  ],
  authors: [{ name: "Art Index Team" }],
  creator: "Art Index",
  publisher: "Art Index",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://artindex.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://artindex.com',
    siteName: 'Art Index',
    title: 'Art Index - Discover & Collect Fine Art Worldwide',
    description: 'Discover, buy, and sell contemporary and classic artworks from top artists and galleries worldwide. Explore our curated collection of paintings, sculptures, photography, and more.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Art Index - Fine Art Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Art Index - Discover & Collect Fine Art Worldwide',
    description: 'Discover, buy, and sell contemporary and classic artworks from top artists and galleries worldwide.',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'art',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Art Index" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Art Index",
              "url": "https://artindex.com",
              "description": "Discover, buy, and sell contemporary and classic artworks from top artists and galleries worldwide.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://artindex.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
