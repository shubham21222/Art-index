'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const ARTWORKS_QUERY = `
  query CollectionArtworksQuery($slug: String!, $after: String, $first: Int) {
    marketingCollection(slug: $slug) {
      artworksConnection(first: $first, after: $after, sort: "-decayed_merch") {
        edges {
          node {
            id
            title
            artist {
              name
            }
            partner {
              name
            }
            image {
              url(version: "large")
            }
            priceCurrency
            price
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

export default function ArtGallery() {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [endCursor, setEndCursor] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchArtworks = async (after = null) => {
        try {
            setLoading(after ? false : true); // Only show full-page loader on initial load
            setLoadingMore(!!after); // Show "load more" loader if fetching additional pages

            const endpoint = 'https://metaphysics-production.artsy.net/v2';
            const variables = {
                slug: 'new-this-week',
                first: 30,
                after,
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: ARTWORKS_QUERY,
                    variables,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch artworks');
            }

            const data = await response.json();
            const fetchedArtworks = data.data.marketingCollection.artworksConnection.edges.map(
                ({ node }) => ({
                    id: node.id,
                    image: node.image?.url || '/placeholder.jpg',
                    title: node.title,
                    artist: node.artist?.name || 'Unknown Artist',
                    gallery: node.partner?.name || 'Unknown Gallery',
                    price: `${node.priceCurrency}${node.price || 'Price on Request'}`,
                })
            );

            setArtworks((prevArtworks) => (after ? [...prevArtworks, ...fetchedArtworks] : fetchedArtworks));
            setHasNextPage(data.data.marketingCollection.artworksConnection.pageInfo.hasNextPage);
            setEndCursor(data.data.marketingCollection.artworksConnection.pageInfo.endCursor);
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
        640: 2,
        1024: 3,
        1280: 4,
    };

    return (
        <>
            <Header />
            <div className="mx-auto px-4 py-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-bold mb-8">New This Week</h1>
                    <p className="text-gray-600 mt-2">
                        Discover a hand-picked selection of standout artworks.
                    </p>
                </div>
                <div className="flex gap-4 mt-6">
                    <button className="border px-4 py-2 rounded-full">All Filters</button>
                    <button className="border px-4 py-2 rounded-full">Rarity</button>
                    <button className="border px-4 py-2 rounded-full">Medium</button>
                    <button className="border px-4 py-2 rounded-full">Price Range</button>
                </div>

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
                                            className="w-full object-cover transition-transform duration-300 group-hover:brightness-95"
                                            style={{ aspectRatio: 'auto' }}
                                        />
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <h2 className="text-white font-semibold truncate">{art.title}</h2>
                                        </div>
                                    </div>
                                    <div className="p-4 opacity-100 group-hover:opacity-90 transition-opacity duration-300">
                                        <p className="font-medium text-gray-900 truncate">{art.artist}</p>
                                        <p className="text-gray-600 text-sm truncate">{art.gallery}</p>
                                        <p className="text-gray-900 font-semibold mt-2">{art.price}</p>
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
        </>
    );
}