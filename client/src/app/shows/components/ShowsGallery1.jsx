'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SHOWS_QUERY = `
  query ShowsCurrentShowsQuery($first: Int, $after: String) {
    viewer {
      showsConnection(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            name
            href
            startAt(format: "MMM D")
            endAt(format: "MMM D")
            partner {
              __typename
              ... on Partner {
                name
              }
              ... on ExternalPartner {
                name
              }
            }
            artworksConnection(first: 1) {
              edges {
                node {
                  image(includeAll: false) {
                    url(version: "larger")
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default function ShowsGallery() {
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [endCursor, setEndCursor] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchShows = async (after = null) => {
        try {
            setLoading(after ? false : true); // Only show full-page loader on initial load
            setLoadingMore(!!after); // Show "load more" loader if fetching additional pages

            const endpoint = 'https://metaphysics-production.artsy.net/v2';
            const variables = {
                first: 10,
                after,
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: SHOWS_QUERY,
                    variables,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch shows');
            }

            const data = await response.json();
            const fetchedShows = data.data.viewer.showsConnection.edges.map(({ node }) => ({
                id: node.id,
                name: node.name,
                href: node.href,
                startDate: node.startAt,
                endDate: node.endAt,
                partnerName: node.partner?.name || 'Unknown Partner',
                image: node.artworksConnection.edges[0]?.node.image?.url || '/placeholder.jpg',
            }));

            setShows((prevShows) => (after ? [...prevShows, ...fetchedShows] : fetchedShows));
            setHasNextPage(data.data.viewer.showsConnection.pageInfo.hasNextPage);
            setEndCursor(data.data.viewer.showsConnection.pageInfo.endCursor);
        } catch (error) {
            console.error('Error fetching shows:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchShows();
    }, []);

    const masonryOptions = {
        default: 4,
        640: 2,
        1024: 3,
        1280: 4,
    };

    return (
        <>
            <div className="mx-auto px-4 py-8 border-t-gray-700">
                {/* Main Title */}
                <h1 className="text-4xl font-bold mb-4">Current Museum & Gallery Shows</h1>

                {/* Subtitle with Partner Name and Show Name */}
                {shows.length > 0 && (
                    <div className="mb-8">
                        <p className="text-lg font-medium text-gray-700">
                            Partner: <span className="font-bold">{shows[0].partnerName}</span>
                        </p>
                        <p className="text-lg font-medium text-gray-700">
                            Featured Show: <span className="font-bold">{shows[0].name}</span>
                        </p>
                    </div>
                )}

                <Masonry
                    breakpointCols={masonryOptions}
                    className="flex mt-8 -ml-4 w-auto"
                    columnClassName="pl-4 bg-transparent"
                >
                    {loading ? (
                        Array.from({ length: 10 }).map((_, index) => (
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
                    ) : shows.length > 0 ? (
                        shows.map((show) => (
                            <div key={show.id} className="mb-4 group">
                                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-zoom-in">
                                    <div className="relative">
                                        <Image
                                            src={show.image}
                                            alt={show.name}
                                            width={400}
                                            height={600}
                                            className="w-full object-cover transition-transform duration-300 group-hover:brightness-95"
                                            style={{ aspectRatio: 'auto' }}
                                        />
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <h2 className="text-white font-semibold truncate">{show.name}</h2>
                                        </div>
                                    </div>
                                    <div className="p-4 opacity-100 group-hover:opacity-90 transition-opacity duration-300">
                                        <p className="font-medium text-gray-900 truncate">{show.partnerName}</p>
                                        <p className="text-gray-600 text-sm truncate">
                                            {show.startDate} - {show.endDate}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No shows found.</p>
                    )}
                </Masonry>

                {/* Load More Button */}
                {hasNextPage && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => fetchShows(endCursor)}
                            disabled={loadingMore}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400"
                        >
                            {loadingMore ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}