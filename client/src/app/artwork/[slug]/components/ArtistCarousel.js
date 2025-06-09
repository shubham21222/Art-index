'use client';
import { useEffect, useState } from 'react';

export default function ArtistCarousel({ slug }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); // Track the main image

    useEffect(() => {
        if (!slug) {
            console.log("Slug is not available yet.");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const artistResponse = await fetch("/api/artwork", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: `
                            query ArtistDetailsQuery($slug: String!) {
                                artist(id: $slug) {
                                    artworks_connection: artworksConnection(first: 10, filter: IS_FOR_SALE, published: true) {
                                        edges {
                                            node {
                                                image {
                                                    large: url(version: "large")
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        `,
                        variables: { slug },
                    }),
                });

                const artistResult = await artistResponse.json();
                if (artistResult.errors) {
                    console.error("GraphQL Errors (Artist):", artistResult.errors);
                    setError("Failed to fetch artist data.");
                    return;
                }

                const artworkImages = artistResult.data.artist.artworks_connection.edges.map(
                    (edge) => edge.node.image.large
                );
                const filteredImages = artworkImages.filter(Boolean);
                setImages(filteredImages);
                setSelectedImage(filteredImages[0]); // Set the first image as default
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
        return <p>Loading images...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (images.length === 0) {
        return <p>No images available.</p>;
    }

    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-4 p-4">
            {/* Thumbnail Column (Left Side) */}
            <div className="flex flex-col gap-2 w-full md:w-1/4 max-h-[600px] overflow-y-auto">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`relative w-full h-24 cursor-pointer rounded-lg overflow-hidden border-2 ${
                            selectedImage === image ? 'border-blue-500' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedImage(image)}
                    >
                        <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                ))}
            </div>

            {/* Main Image (Right Side) */}
            <div className="w-full md:w-3/4 h-[400px] md:h-[600px] bg-gray-100 rounded-lg shadow-lg overflow-hidden">
                {selectedImage && (
                    <img
                        src={selectedImage}
                        alt="Selected Artwork"
                        className="object-cover w-full h-full"
                    />
                )}
            </div>
        </div>
    );
}