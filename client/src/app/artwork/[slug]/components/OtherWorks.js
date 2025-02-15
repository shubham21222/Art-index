'use client';
import { useEffect, useState } from 'react';

export default function OtherWorks({ slug }) {
    const [otherWorks, setOtherWorks] = useState([]);
    const [gridTitle, setGridTitle] = useState("Other Works");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!slug) {
            console.log("Slug is not available yet.");
            return;
        }

        const fetchData = async () => {
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
                            query OtherWorksQuery($slug: String!) @cacheable {
                                artwork(id: $slug) {
                                    ...OtherWorks_artwork
                                    id
                                }
                            }

                            fragment ArtworkGrid_artworks on ArtworkConnectionInterface {
                                __isArtworkConnectionInterface: __typename
                                edges {
                                    __typename
                                    node {
                                        id
                                        slug
                                        href
                                        internalID
                                        image(includeAll: false) {
                                            resized(width: 445, version: ["larger", "large"]) {
                                                src
                                                width
                                                height
                                            }
                                            aspectRatio
                                        }
                                        title
                                        artistNames
                                        date
                                        sale_message: saleMessage
                                        partner {
                                            name
                                            href
                                        }
                                    }
                                }
                            }

                            fragment OtherWorks_artwork on Artwork {
                                contextGrids(includeRelatedArtworks: false) {
                                    __typename
                                    title
                                    ctaTitle
                                    ctaHref
                                    artworksConnection(first: 8) {
                                        ...ArtworkGrid_artworks
                                    }
                                }
                            }
                        `,
                        variables: { slug },
                    }),
                });

                const result = await response.json();
                if (result.errors) {
                    console.error("GraphQL Errors:", result.errors);
                    setError("Failed to fetch other works data.");
                    return;
                }

                // Extract the first valid grid with artworks
                const grids = result.data.artwork.contextGrids;
                const validGrid = grids.find(
                    (grid) => grid.artworksConnection?.edges?.length > 0
                );

                if (validGrid) {
                    setGridTitle(validGrid.title || "Other Works");
                    setOtherWorks(
                        validGrid.artworksConnection.edges.map((edge) => edge.node)
                    );
                } else {
                    setOtherWorks([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("An unexpected error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) {
        return <p>Loading other works...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (otherWorks.length === 0) {
        return <p>No other works available.</p>;
    }

    return (
        <div className="mt-8 px-6">
            <h2 className="text-2xl font-semibold mb-4">{gridTitle}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {otherWorks.map((artwork) => (
                    <div key={artwork.internalID} className="group relative bg-gray-100 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:scale-105">
                        <a href={artwork.href} className="block">
                            <img
                                src={artwork.image?.resized?.src || "/placeholder-image.jpg"}
                                alt={artwork.title || "Untitled Artwork"}
                                className="w-full h-auto object-cover"
                                style={{
                                    aspectRatio: artwork.image?.aspectRatio || 1,
                                }}
                            />
                        </a>

                        <div className="p-4">
                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                                <a href={artwork.href}>{artwork.title || "Untitled"}</a>
                            </h3>
                            <p className="text-sm text-gray-600">{artwork.artistNames || "Unknown Artist"}</p>
                            <p className="text-sm text-gray-500">{artwork.date || "Unknown Date"}</p>
                            <p className="text-sm font-semibold text-gray-800 mt-2">{artwork.sale_message || "Price on request"}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {artwork.partner?.name && (
                                    <a href={artwork.partner.href} className="hover:underline">
                                        {artwork.partner.name}
                                    </a>
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}