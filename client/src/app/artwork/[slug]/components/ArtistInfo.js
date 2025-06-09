'use client';
import { useEffect, useState } from 'react';
import OtherWorks from './OtherWorks';

export default function ArtistInfo({ slug }) {
    const [artist, setArtist] = useState(null);
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

                // Fetch Artist Details
                const response = await fetch("/api/artwork", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: `
                            query ArtistInfoQuery($slug: String!) {
                                artist(id: $slug) {
                                    internalID
                                    href
                                    slug
                                    name
                                    initials
                                    formattedNationalityAndBirthday
                                    counts {
                                        artworks
                                        forSaleArtworks
                                        partnerShows
                                    }
                                    coverArtwork {
                                        avatar: image {
                                            cropped(width: 45, height: 45) {
                                                src
                                                srcSet
                                            }
                                        }
                                        id
                                    }
                                    image {
                                        cropped(width: 45, height: 45) {
                                            src
                                            srcSet
                                        }
                                    }
                                    exhibitionHighlights(size: 3) {
                                        partner {
                                            __typename
                                            ... on Partner {
                                                name
                                            }
                                            ... on ExternalPartner {
                                                name
                                                id
                                            }
                                            ... on Node {
                                                __isNode: __typename
                                                id
                                            }
                                        }
                                        name
                                        start_at: startAt(format: "YYYY")
                                        cover_image: coverImage {
                                            cropped(width: 800, height: 600) {
                                                url
                                            }
                                        }
                                        city
                                        id
                                    }
                                    collections
                                    biographyBlurb(format: HTML, partnerBio: false) {
                                        text
                                    }
                                    auctionResultsConnection(recordsTrusted: true, first: 1, sort: PRICE_AND_DATE_DESC) {
                                        edges {
                                            node {
                                                price_realized: priceRealized {
                                                    display(format: "0.0a")
                                                }
                                                organization
                                                sale_date: saleDate(format: "YYYY")
                                                id
                                            }
                                        }
                                    }
                                    id
                                }
                            }
                        `,
                        variables: { slug },
                    }),
                });

                const result = await response.json();
                if (result.errors) {
                    console.error("GraphQL Errors:", result.errors);
                    setError("Failed to fetch artist data.");
                    return;
                }

                setArtist(result.data.artist);
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
        return <p>Loading artist information...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!artist) {
        return <p>Artist not found.</p>;
    }

    return (
        <>
        <div className="max-w-[1500px] mx-auto space-y-8 px-6">
            {/* Artist Header */}
            <div className="flex items-center space-x-6 bg-gray-50 p-6 rounded-lg shadow-sm">
                <img
                    src={artist.image?.cropped?.src || artist.coverArtwork?.avatar?.cropped?.src}
                    alt={`${artist.name}'s avatar`}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{artist.name}</h2>
                    <p className="text-sm text-gray-600">{artist.formattedNationalityAndBirthday}</p>
                </div>
            </div>

            {/* Biography */}
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Biography</h3>
                <div
                    dangerouslySetInnerHTML={{
                        __html: artist.biographyBlurb?.text || "<p>No biography available.</p>",
                    }}
                    className="prose prose-sm max-w-none text-gray-700"
                />
            </div>

            {/* Exhibition Highlights */}
            {artist.exhibitionHighlights && artist.exhibitionHighlights.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Exhibition Highlights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {artist.exhibitionHighlights.map((exhibition) => (
                            <div
                                key={exhibition.id}
                                className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:scale-105"
                            >
                                {exhibition.cover_image?.cropped?.url && (
                                    <img
                                        src={exhibition.cover_image.cropped.url}
                                        alt={exhibition.name}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <h4 className="text-lg font-medium text-gray-900">{exhibition.name}</h4>
                                    <p className="text-sm text-gray-600">
                                        {exhibition.partner?.name}, {exhibition.city} ({exhibition.start_at})
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Collections */}
            {artist.collections && artist.collections.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Collections</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        {artist.collections.map((collection, index) => (
                            <li key={index}>{collection}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Auction Results */}
            {artist.auctionResultsConnection?.edges?.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Auction Results</h3>
                    <ul className="space-y-4">
                        {artist.auctionResultsConnection.edges.map(({ node }) => (
                            <li key={node.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <p className="text-base font-medium text-gray-900">
                                    <strong>{node.organization}</strong>: {node.price_realized.display} (
                                    {node.sale_date})
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Artwork Counts */}
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Artwork Counts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Total Artworks</p>
                        <p className="text-lg font-medium text-gray-900">{artist.counts.artworks || "N/A"}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">For Sale Artworks</p>
                        <p className="text-lg font-medium text-gray-900">{artist.counts.forSaleArtworks || "N/A"}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Partner Shows</p>
                        <p className="text-lg font-medium text-gray-900">{artist.counts.partnerShows || "N/A"}</p>
                    </div>
                </div>
            </div>
        </div>
        {/* <OtherWorks slug={artist.exhibitionHighlights.name}/> */}
        </>
    );
}