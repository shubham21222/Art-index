'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton from shadcn/ui

const ShowArtworks = ({ slug }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("https://metaphysics-cdn.artsy.net/v2", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query ShowArtworksFilterQuery($slug: String!, $input: FilterArtworksInput, $aggregations: [ArtworkAggregation]) {
                show(id: $slug) {
                  sidebar: filterArtworksConnection(aggregations: $aggregations, first: 1) {
                    aggregations {
                      slice
                      counts {
                        name
                        value
                        count
                      }
                    }
                    id
                  }
                  filtered_artworks: filterArtworksConnection(first: 30, input: $input) {
                    id
                    counts {
                      total(format: "0,0")
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                    pageCursors {
                      around {
                        cursor
                        page
                        isCurrent
                      }
                      first {
                        cursor
                        page
                        isCurrent
                      }
                      last {
                        cursor
                        page
                        isCurrent
                      }
                      previous {
                        cursor
                        page
                      }
                    }
                    edges {
                      node {
                        id
                        slug
                        href
                        internalID
                        image(includeAll: false) {
                          aspectRatio
                          resized(width: 445, version: ["larger", "large"]) {
                            src
                            srcSet
                            width
                            height
                          }
                        }
                        title
                        artistNames
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              slug,
              input: { sort: "partner_show_position" },
              aggregations: ["MEDIUM", "TOTAL", "MAJOR_PERIOD", "ARTIST_NATIONALITY", "MATERIALS_TERMS", "ARTIST"],
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message || "GraphQL query failed");
        }

        setData(result.data?.show || null);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [slug]);

  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-[1500px] mx-auto p-4">
      {/* Artwork Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="w-full h-[350px] rounded-lg" /> {/* Image Skeleton */}
                <Skeleton className="h-6 w-full" /> {/* Title Skeleton */}
                <Skeleton className="h-4 w-3/4" /> {/* Artist Names Skeleton */}
              </div>
            ))}
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Artworks ({data.filtered_artworks.counts.total})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.filtered_artworks.edges.map(({ node }) => (
                <Link href={`/artwork/${node.slug}`} key={node.id} passHref legacyBehavior>
                  <a className="group overflow-hidden rounded-lg shadow-lg block">
                    <div className="relative w-full h-[350px]">
                      <img
                        src={node.image.resized.src}
                        alt={node.title}
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        }}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{node.title}</h3>
                      <p className="text-gray-600">{node.artistNames}</p>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShowArtworks;