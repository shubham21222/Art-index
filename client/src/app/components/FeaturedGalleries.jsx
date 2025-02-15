"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // Import Link for routing
import { ChevronLeft, ChevronRight } from "lucide-react";

const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";

const GALLERIES_QUERY = `
query partnersRoutes_GalleriesRouteQuery {
    viewer {
        orderedSet(id: "5638fdfb7261690296000031") {
            orderedItemsConnection(first: 50) {
                edges {
                    node {
                        __typename
                        ... on Profile {
                            internalID
                            href
                            owner {
                                __typename
                                ... on Partner {
                                    internalID
                                    href
                                    name
                                    featuredShow {
                                        name
                                        location {
                                            city
                                        }
                                        coverImage {
                                            resized(height: 500, version: ["main", "normalized", "larger", "large"]) {
                                                src
                                            }
                                        }
                                    }
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

export default function FeaturedGalleries() {
    const carouselRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0); // Track active slide index
    const [galleries, setGalleries] = useState([]); // Store fetched galleries

    // Fetch data from Artsy API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(ARTSY_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: GALLERIES_QUERY,
                    }),
                });

                const { data } = await response.json();
                const fetchedGalleries =
                    data?.viewer?.orderedSet?.orderedItemsConnection?.edges
                        ?.filter((edge) => edge.node.__typename === "Profile")
                        .map((edge) => ({
                            id: edge.node.internalID,
                            href: edge.node.href, // Extract href
                            name: edge.node.owner.name,
                            location: edge.node.owner.featuredShow?.location?.city || "N/A",
                            image: edge.node.owner.featuredShow?.coverImage?.resized?.src || "/placeholder.svg",
                        })) || [];
                setGalleries(fetchedGalleries);
            } catch (error) {
                console.error("Error fetching data from Artsy API:", error);
            }
        };

        fetchData();
    }, []);

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -240, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 240, behavior: "smooth" });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (carouselRef.current) {
                const scrollPosition = carouselRef.current.scrollLeft;
                const totalWidth = carouselRef.current.scrollWidth;
                const visibleWidth = carouselRef.current.clientWidth;

                const index = scrollPosition > totalWidth / 2 - visibleWidth ? 1 : 0;
                setActiveIndex(index);
            }
        };
        const carouselElement = carouselRef.current;
        if (carouselElement) {
            carouselElement.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (carouselElement) {
                carouselElement.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    return (
        <section className="px-6 py-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl ">
                    Featured Galleries <sup className="text-blue-500 text-sm">6</sup>
                </h2>
                <a href="#" className="text-sm font-medium underline">
                    View All Galleries
                </a>
            </div>

            {/* Carousel with Buttons */}
            <div className="relative">
                {/* Left Button */}
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full hidden md:flex"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Featured Galleries Carousel */}
                <div
                    ref={carouselRef}
                    className="overflow-x-auto whitespace-nowrap scrollbar-hide flex space-x-6"
                >
                    {galleries.length > 0 ? (
                        galleries.map((gallery, index) => {
                            // Use href directly as the slug
                            const galleryRoute = `/gallery${gallery.href}`;

                            return (
                                <Link href={galleryRoute}>
                                    <div key={index} className="w-80 space-y-2 flex-shrink-0">
                                        {/* Name */}
                                        <div className="flex items-center justify-between">
                                            {/* Use Link for navigation */}

                                            <h3 className="text-sm cursor-pointer hover:underline">
                                                {gallery.name}
                                            </h3>

                                            {/* Follow Button */}
                                            <button className="border px-4 py-1 rounded-full text-sm">
                                                Follow
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-600 whitespace-pre-line">
                                            {gallery.location}
                                        </p>
                                        {/* Image */}
                                        <div className="relative w-80 h-80">
                                            <Image
                                                src={gallery.image}
                                                alt={gallery.name}
                                                layout="fill"
                                                objectFit="cover"
                                                className="rounded-md"
                                            />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>

                {/* Right Button */}
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full hidden md:flex"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Line Indicators */}
            <div className="flex justify-center mt-4 space-x-2">
                {[0, 1].map((index) => (
                    <div
                        key={index}
                        className={`h-[1px] w-full rounded-full transition-colors duration-300 ${index === activeIndex ? "bg-black" : "bg-gray-300"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}