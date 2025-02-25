'use client';

import { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import Masonry from 'react-masonry-css';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '../components/Header';
import Footer from '../components/Footer';

const categories = [
  { name: 'Contemporary Art', image: '/images/contemporary.jpg' },
  { name: 'Painting', image: '/images/painting.jpg' },
  { name: 'Street Art', image: '/images/street.jpg' },
  { name: 'Photography', image: '/images/photo.jpg' },
  { name: 'Emerging Art', image: '/images/emerging.jpg' },
  { name: '20th-Century Art', image: '/images/century.jpg' },
];

const ArtworkCard = ({ artwork }) => (
  <Link href={`/artwork/${artwork.slug}`} className="block mb-4 group">
    <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative aspect-[3/4]">
        <Image
          src={artwork.image}
          alt={artwork.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="inline-block px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-gray-900 mb-2">
            {artwork.primaryLabel}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h2 className="font-semibold text-lg text-gray-900 line-clamp-1">
          {artwork.title}
        </h2>
        <p className="text-gray-600 font-medium">{artwork.artist}</p>
        <p className="text-sm text-gray-500">{artwork.gallery}</p>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-bold text-gray-900">{artwork.price}</span>
          <span className="text-sm text-gray-500">
            Demand: {artwork.demandRank}
          </span>
        </div>
      </div>
    </div>
  </Link>
);

const LoadingSkeleton = () => (
  <div className="mb-4">
    <div className="bg-white rounded-xl overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-2 border-t">
          <Skeleton className="h-5 w-1/3" />
        </div>
      </div>
    </div>
  </div>
);

export default function ArtGallery() {
  const [sort, setSort] = useState('Recommended');
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [endCursor, setEndCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const client = new ApolloClient({
    uri: 'https://metaphysics-cdn.artsy.net/v2',
    cache: new InMemoryCache(),
  });

  const fetchArtworks = async (afterCursor = null) => {
    try {
      setLoading(afterCursor ? false : true);
      setLoadingMore(!!afterCursor);

      const { data } = await client.query({
        query: gql`
          query CollectArtworkFilterQuery($input: FilterArtworksInput!) {
            viewer {
              filtered_artworks: artworksConnection(input: $input) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                edges {
                  node {
                    id
                    slug
                    href
                    internalID
                    title
                    date
                    saleMessage
                    image(includeAll: false) {
                      url(version: "large")
                      aspectRatio
                    }
                    artist(shallow: true) {
                      name
                    }
                    partner(shallow: true) {
                      name
                    }
                    collectorSignals {
                      primaryLabel
                      auction {
                        lotClosesAt
                        registrationEndsAt
                        onlineBiddingExtended
                      }
                      partnerOffer {
                        priceWithDiscount {
                          display
                        }
                      }
                    }
                    marketPriceInsights {
                      demandRank
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          input: {
            after: afterCursor,
            first: 50,
          },
        },
      });

      const fetchedArtworks = data?.viewer?.filtered_artworks?.edges.map(
        (edge) => ({
          id: edge.node.id,
          slug: edge.node.slug,
          image: edge.node.image?.url || '/images/placeholder.jpg',
          title: edge.node.title,
          artist: edge.node.artist?.name,
          gallery: edge.node.partner?.name,
          price: edge.node.saleMessage || 'Price on request',
          primaryLabel: edge.node.collectorSignals?.primaryLabel || 'Available',
          demandRank: edge.node.marketPriceInsights?.demandRank || 'N/A',
        })
      );

      setArtworks((prevArtworks) =>
        afterCursor ? [...prevArtworks, ...fetchedArtworks] : fetchedArtworks
      );
      setEndCursor(data?.viewer?.filtered_artworks?.pageInfo?.endCursor);
      setHasNextPage(data?.viewer?.filtered_artworks?.pageInfo?.hasNextPage);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  const masonryOptions = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <div className=" min-h-screen">
      <Header />
      <div className="max-w-[1500px] mx-auto px-4 mt-8 md:mt-0 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-[60px] md:mt-0 mb-8 md:mb-12">
          <div className="space-y-2 text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Collect Art & Design
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Discover and collect contemporary artworks
            </p>
          </div>
          <Button variant="outline" size="lg" className="w-full md:w-auto">
            Browse Collections
          </Button>
        </div>

        {/* Filters and Sort Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              All Filters
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              Rarity
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              Medium
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              Price Range
            </Button>
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Recommended">Recommended</SelectItem>
              <SelectItem value="Newest">Newest</SelectItem>
              <SelectItem value="PriceLowHigh">Price: Low to High</SelectItem>
              <SelectItem value="PriceHighLow">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Masonry Grid */}
        <Masonry
          breakpointCols={masonryOptions}
          className="flex mt-8 -ml-4 w-auto"
          columnClassName="pl-4 bg-transparent"
        >
          {loading
            ? Array.from({ length: 12 }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))
            : artworks.length > 0
            ? artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))
            : null}
        </Masonry>

        {/* Load More Button */}
        {hasNextPage && (
          <div className="flex justify-center mt-8">
            <Button
              size="lg"
              onClick={() => fetchArtworks(endCursor)}
              disabled={loadingMore}
              className="w-full sm:w-auto"
            >
              {loadingMore ? 'Loading...' : 'Load More Artworks'}
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}