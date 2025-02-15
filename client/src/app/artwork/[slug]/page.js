'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ArtistCarousel from './components/ArtistCarousel';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import OtherWorks from './components/OtherWorks';
import { Skeleton } from '@/components/ui/skeleton'; // Import shadcn/ui Skeleton
import ArtistInfo from './components/ArtistInfo';

export default function ArtworkPage() {
    const params = useParams();
    const slug = params?.slug;

    const [artwork, setArtwork] = useState(null);
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

                // Fetch Artwork Details
                const artworkResponse = await fetch("https://metaphysics-cdn.artsy.net/v2", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: `
                            query ArtworkDetailsQuery($slug: String!) {
                                artwork(id: $slug) {
                                    id
                                    title
                                    image {
                                        small: url(version: "small")
                                        large: url(version: "large")
                                    }
                                    artist {
                                        internalID
                                        slug
                                        name
                                    }
                                    description(format: HTML)
                                    category
                                    medium
                                    dimensions {
                                        in
                                        cm
                                    }
                                    publisher
                                    image_rights: imageRights
                                    articles {
                                        slug
                                        id
                                    }
                                }
                            }
                        `,
                        variables: { slug },
                    }),
                });

                const artworkResult = await artworkResponse.json();
                if (artworkResult.errors) {
                    console.error("GraphQL Errors (Artwork):", artworkResult.errors);
                    setError("Failed to fetch artwork data.");
                    return;
                }

                console.log("Artwork Data Fetched:", artworkResult.data.artwork);
                setArtwork(artworkResult.data.artwork);

                // Fetch Artist Details
                const artistID = artworkResult.data.artwork.artist.internalID;
                const artistResponse = await fetch("https://metaphysics-cdn.artsy.net/v2", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: `
                            query artistRoutes_ArtistAppQuery($artistID: String!) @cacheable {
                                artist(id: $artistID) @principalField {
                                    internalID
                                    slug
                                    name
                                    formattedNationalityAndBirthday
                                    biographyBlurb(format: HTML, partnerBio: false) {
                                        text
                                        credit
                                    }
                                    coverArtwork {
                                        title
                                        href
                                        image {
                                            src: url(version: ["larger", "larger"])
                                            width
                                            height
                                        }
                                        id
                                    }
                                }
                            }
                        `,
                        variables: { artistID },
                    }),
                });

                const artistResult = await artistResponse.json();
                if (artistResult.errors) {
                    console.error("GraphQL Errors (Artist):", artistResult.errors);
                    setError("Failed to fetch artist data.");
                    return;
                }

                console.log("Artist Data Fetched:", artistResult.data.artist);
                setArtist(artistResult.data.artist);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("An unexpected error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    // Fallback UI for Loading State
    if (loading) {
        return (
            <>
                <Header />
                <div className="px-6 py-8">
                    <Skeleton className="h-8 w-1/2 mb-4" /> {/* Title Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Carousel Skeleton */}
                        <div className="w-full h-[50vh] md:h-[70vh] bg-gray-200 rounded-lg animate-pulse" />

                        {/* Right Column: Content Skeleton */}
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-32" /> {/* Section Title Skeleton */}
                            <Skeleton className="h-4 w-full" /> {/* Artist Name Skeleton */}
                            <Skeleton className="h-4 w-2/3" /> {/* Nationality Skeleton */}
                            <Skeleton className="h-12 w-full" /> {/* Biography Skeleton */}

                            <Skeleton className="h-6 w-32 mt-4" /> {/* Section Title Skeleton */}
                            <Skeleton className="h-16 w-full" /> {/* Description Skeleton */}
                            <Skeleton className="h-4 w-1/2" /> {/* Category Skeleton */}
                            <Skeleton className="h-4 w-1/2" /> {/* Medium Skeleton */}
                            <Skeleton className="h-4 w-1/2" /> {/* Dimensions Skeleton */}

                            <Skeleton className="h-6 w-32 mt-4" /> {/* Section Title Skeleton */}
                            <Skeleton className="h-4 w-1/2" /> {/* Publisher Skeleton */}
                            <Skeleton className="h-4 w-1/2" /> {/* Image Rights Skeleton */}

                            <Skeleton className="h-6 w-32 mt-4" /> {/* Section Title Skeleton */}
                            <Skeleton className="h-4 w-1/2" /> {/* Articles Skeleton */}
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Fallback UI for Error State
    if (error) {
        return (
            <>
                <Header />
                <div className="px-6 py-8">
                    <p className="text-red-500">{error}</p>
                </div>
                <Footer />
            </>
        );
    }

    // Fallback UI for Missing Data
    if (!artwork || !artist) {
        return (
            <>
                <Header />
                <div className="px-6 py-8">
                    <p>Artwork or Artist not found.</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="px-6 py-8">
                {/* Header */}
                <h1 className="text-3xl font-bold mb-4">{artist.name}</h1>

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Carousel */}
                    <div className="w-full h-[50vh] md:h-[70vh]">
                        <ArtistCarousel slug={artist.slug} />
                    </div>

                    {/* Right Column: Content */}
                    <div className="space-y-4">
                        {/* Artist Section */}
                        <div>
                            <h2 className="text-xl font-semibold">Artist</h2>
                            <p className="text-gray-700">{artist.name}</p>
                            <p className="text-gray-500">{artist.formattedNationalityAndBirthday || "N/A"}</p>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: artist.biographyBlurb?.text || "<p>No biography available.</p>",
                                }}
                                className="text-gray-600 mt-2"
                            />
                        </div>

                        {/* Artwork Details */}
                        <div>
                            <h2 className="text-xl font-semibold">About the Work</h2>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: artwork.description || "<p>No description available.</p>",
                                }}
                                className="text-gray-700 mt-2"
                            />
                            <p className="text-gray-500 mt-2">
                                <strong>Category:</strong> {artwork.category || "N/A"}
                            </p>
                            <p className="text-gray-500">
                                <strong>Medium:</strong> {artwork.medium || "N/A"}
                            </p>
                            <p className="text-gray-500">
                                <strong>Dimensions:</strong>{" "}
                                {artwork.dimensions ? `${artwork.dimensions.in} / ${artwork.dimensions.cm}` : "N/A"}
                            </p>
                        </div>

                        {/* Additional Information */}
                        <div>
                            <h2 className="text-xl font-semibold">Additional Information</h2>
                            <p className="text-gray-700">
                                <strong>Publisher:</strong> {artwork.publisher || "N/A"}
                            </p>
                            <p className="text-gray-700">
                                <strong>Image Rights:</strong> {artwork.image_rights || "N/A"}
                            </p>
                        </div>

                        {/* Articles */}
                        <div>
                            <h2 className="text-xl font-semibold">Related Articles</h2>
                            {artwork.articles.length > 0 ? (
                                <ul>
                                    {artwork.articles.map((article) => (
                                        <li key={article.id}>
                                            <a
                                                href={`/articles/${article.slug}`}
                                                className="text-blue-500 hover:underline"
                                            >
                                                {article.slug}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No related articles available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ArtistInfo  slug={artist.slug}/>
            <OtherWorks slug={slug} />
            <Footer />
        </>
    );
}