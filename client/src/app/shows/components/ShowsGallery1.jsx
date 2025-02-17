'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import Skeleton from 'react-loading-skeleton';
import Link from 'next/link'; // Import Link from Next.js
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
            artworksConnection(first: 10) {
              edges {
                node {
                  title
                  image {
                    url(version: "larger")
                  }
                  artistNames
                  href
                  slug
                  date
                  saleMessage
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
      setLoading(after ? false : true);
      setLoadingMore(!!after);

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
        artworks: node.artworksConnection.edges.map(({ node: artwork }) => ({
          title: artwork.title,
          image: artwork.image?.url || '/placeholder.jpg',
          artistNames: artwork.artistNames,
          href: artwork.href,
          slug: artwork.slug, // Ensure slug is included
          date: artwork.date,
          saleMessage: artwork.saleMessage,
        })),
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

  // Group shows by partner
  const groupedShows = shows.reduce((acc, show) => {
    const partnerName = show.partnerName;
    if (!acc[partnerName]) {
      acc[partnerName] = [];
    }
    acc[partnerName].push(show);
    return acc;
  }, {});

  return (
    <>
      <div className="max-w-[1500px] mx-auto px-4 py-8 border-t-gray-700">
        <h1 className="text-4xl mb-4">Current Museum & Gallery Shows</h1>

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
        ) : Object.keys(groupedShows).length > 0 ? (
          Object.entries(groupedShows).map(([partnerName, shows]) => (
            <div key={partnerName} className="mb-12">
              {/* Partner and Featured Show Section */}
              <div className="mb-8">
                <p className="text-2xl font-medium text-gray-900">
                  <span className="">{partnerName}</span>
                </p>
                <p className="text-2xl font-medium text-gray-900">
                  <span className="">{shows[0].name}</span>
                </p>
              </div>

              {/* Artworks in Masonry Layout */}
              <Masonry
                breakpointCols={masonryOptions}
                className="flex -ml-4 w-auto"
                columnClassName="pl-4 bg-transparent"
              >
                {shows.flatMap((show) =>
                  show.artworks.map((artwork) => (
                    <Link
                      key={artwork.href}
                      href={`/artwork/${artwork.slug}`} // Use the show's slug for navigation
                      passHref
                    >
                      <div className="mb-4 cursor-pointer">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                          <Image
                            src={artwork.image}
                            alt={artwork.title}
                            width={400}
                            height={600}
                            className="w-full object-cover"
                            style={{ aspectRatio: 'auto' }}
                          />
                          <div className="p-4">
                            <h4 className="font-semibold text-lg">{artwork.title}</h4>
                            <p className="text-sm text-gray-600">{artwork.artistNames}</p>
                            <p className="text-sm text-gray-600">{artwork.date}</p>
                            <p className="text-sm text-gray-600">{artwork.saleMessage}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </Masonry>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No shows found.</p>
        )}

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