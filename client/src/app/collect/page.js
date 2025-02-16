'use client';

import { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import Masonry from 'react-masonry-css';
import Image from 'next/image';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
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

export default function ArtGallery() {
  const [sort, setSort] = useState('Recommended');
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [endCursor, setEndCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Initialize Apollo Client for GraphQL queries
  const client = new ApolloClient({
    uri: 'https://metaphysics-cdn.artsy.net/v2',
    cache: new InMemoryCache(),
  });

  // Fetch artworks from the Artsy API
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
            first: 50, // Number of artworks per page
          },
        },
      });

      // Extract artwork data from the response
      const fetchedArtworks = data?.viewer?.filtered_artworks?.edges.map(
        (edge) => ({
          id: edge.node.id,
          image: edge.node.image?.url || '/images/placeholder.jpg',
          title: edge.node.title,
          artist: edge.node.artist?.name,
          gallery: edge.node.partner?.name,
          price: edge.node.saleMessage || 'Price not available', // Use saleMessage for price
          primaryLabel: edge.node.collectorSignals?.primaryLabel || 'No label',
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

  // Masonry layout options
  const masonryOptions = {
    default: 4, // Columns for larger screens
    1100: 3, // Columns for medium screens
    700: 2, // Columns for small screens
    500: 1, // Columns for very small screens
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-[1500px] mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Collect art and design online
          </h1>
          <a
            href="#"
            className="text-blue-600 hover:text-blue-800 transition-colors duration-300 font-medium"
          >
            Browse by collection
          </a>
        </div>

        {/* Categories */}
        {/* <div className="flex space-x-4 overflow-x-auto py-6 scrollbar-hide">
          {categories.map((cat, index) => (
            <div key={index} className="w-40 flex-shrink-0">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-24 object-cover rounded-lg shadow-md"
              />
              <p className="text-center mt-2 text-sm font-medium text-gray-700">
                {cat.name}
              </p>
            </div>
          ))}
        </div> */}

        {/* Filters */}
        <div className="flex justify-between mt-8 items-center border-b pb-4">
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-300">
              All Filters
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-300">
              Rarity
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-300">
              Medium
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-300">
              Price Range
            </button>
          </div>
          <div>
            <label className="mr-2 text-gray-700">Sort:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Recommended</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Artwork Grid */}
        <Masonry
          breakpointCols={masonryOptions}
          className="flex mt-8 -ml-4 w-auto"
          columnClassName="pl-4 bg-transparent"
        >
          {loading ? (
            Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="mb-4">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <Skeleton height={350} />
                  <div className="p-4 space-y-2">
                    <Skeleton height={20} width="80%" />
                    <Skeleton height={16} width="60%" />
                  </div>
                </div>
              </div>
            ))
          ) : artworks.length > 0 ? (
            artworks.map((art) => (
              <div key={art.id} className="mb-4 group">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-zoom-in">
                  <div className="relative">
                    <Image
                      src={art.image}
                      alt={art.title}
                      width={400}
                      height={600}
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{ aspectRatio: 'auto' }}
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h2 className="text-white font-semibold truncate">
                        {art.title}
                      </h2>
                    </div>
                  </div>
                  <div className="p-4 opacity-100 group-hover:opacity-90 transition-opacity duration-300">
                    <p className="font-medium text-gray-900 truncate">
                      {art.artist}
                    </p>
                    <p className="text-gray-600 text-sm truncate">
                      {art.gallery}
                    </p>
                    <p className="text-gray-900 font-semibold mt-2">
                      Price: {art.price}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      Primary Label: {art.primaryLabel}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      Demand Rank: {art.demandRank}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No artworks found.</p>
          )}
        </Masonry>

        {/* Load More Button */}
        {hasNextPage && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => fetchArtworks(endCursor)}
              disabled={loadingMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}