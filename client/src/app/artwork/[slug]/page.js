'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ArtistCarousel from './components/ArtistCarousel';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import OtherWorks from './components/OtherWorks';
import { Skeleton } from '@/components/ui/skeleton'; // Import shadcn/ui Skeleton
import ArtistInfo from './components/ArtistInfo';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GalleryVertical, ArrowRight, ArrowLeft } from "lucide-react";
import ContactModal from "@/app/components/ContactModal";

export default function ArtworkPage() {
    const params = useParams();
    const slug = params?.slug;
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                const artworkResponse = await fetch("/api/artwork", {
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
                const artistResponse = await fetch("/api/artwork", {
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

    const handleContactClick = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

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
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-[1500px] mx-auto px-6 py-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                        <div>
                            {/* <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                                {artist.name}
                            </h1>
                            <p className="text-gray-600 text-lg">{artist.formattedNationalityAndBirthday || "N/A"}</p> */}
                        </div>
                       
                    </div>

                    {/* Two-Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left Column: Carousel */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-[50vh] md:h-[70vh] bg-white rounded-xl shadow-lg overflow-hidden"
                        >
                            <ArtistCarousel slug={artist.slug} />
                        </motion.div>

                        {/* Right Column: Content */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="space-y-8"
                        >
                            {/* Artist Section */}
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Artist</h2>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: artist.biographyBlurb?.text || "<p>No biography available.</p>",
                                    }}
                                    className="text-gray-600 prose max-w-none"
                                />
                            </div>

                            {/* Artwork Details */}
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">About the Work</h2>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: artwork.description || "<p>No description available.</p>",
                                    }}
                                    className="text-gray-700 prose max-w-none mb-6"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Category</p>
                                        <p className="font-medium">{artwork.category || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Medium</p>
                                        <p className="font-medium">{artwork.medium || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Dimensions</p>
                                        <p className="font-medium">
                                            {artwork.dimensions ? `${artwork.dimensions.in} / ${artwork.dimensions.cm}` : "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Publisher</p>
                                        <p className="font-medium">{artwork.publisher || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            {/* <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Image Rights</p>
                                        <p className="font-medium">{artwork.image_rights || "N/A"}</p>
                                    </div>
                                    {artwork.articles.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">Related Articles</p>
                                            <div className="flex flex-wrap gap-2">
                                                {artwork.articles.map((article) => (
                                                    <a
                                                        key={article.id}
                                                        href={`/articles/${article.slug}`}
                                                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-300"
                                                    >
                                                        {article.slug}
                                                        <ArrowRight className="w-4 h-4 ml-2" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div> */}
                             <div className="mt-4 md:mt-0">
                            <Button 
                                onClick={handleContactClick}
                                className="bg-black text-white hover:bg-gray-800 transition-colors duration-300 px-8 py-6 text-lg"
                            >
                                I&apos;m Interested
                            </Button>
                        </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            {/* <ArtistInfo slug={artist.slug} /> */}
            <OtherWorks slug={slug} />
            <Footer />

            {/* Contact Modal */}
            <ContactModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                artwork={artwork ? {
                    title: artwork.title,
                    artistNames: artist.name,
                    price: "I'm Interested",
                    id: artwork.id
                } : null}
            />
        </>
    );
}