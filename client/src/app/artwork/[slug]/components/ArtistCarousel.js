'use client';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

export default function ArtistCarousel({ slug }) {
    const [images, setImages] = useState([]);
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
                const artistResponse = await fetch("https://metaphysics-cdn.artsy.net/v2", {
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

                // Extract all artwork images
                const artworkImages = artistResult.data.artist.artworks_connection.edges.map(
                    (edge) => edge.node.image.large
                );
                setImages(artworkImages.filter(Boolean)); // Remove undefined/null values
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
        <div className="w-full h-full">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                loop={true}
                className="rounded-lg shadow-lg h-full"
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <div className="flex justify-center items-center h-full bg-gray-100">
                            <img
                                src={image}
                                alt={`Slide ${index + 1}`}
                                className="object-cover w-full h-full rounded-lg"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}