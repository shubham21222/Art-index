    "use client";
    import { useRef, useState, useEffect } from "react";
    import Image from "next/image";
    import Link from "next/link";
    import { ChevronLeft, ChevronRight } from "lucide-react";

    export default function CuratorsPicks() {
        const carouselRef = useRef(null);
        const [activeIndex, setActiveIndex] = useState(0); // Track active slide index
        const [artworks, setArtworks] = useState([]); // State to store fetched artworks

        // Fetch data from the API
        useEffect(() => {
            const fetchData = async () => {
                try {
                    const response = await fetch(
                        "https://metaphysics-cdn.artsy.net/v2",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                query: `
                                    query HomeEmergingPicksArtworksRailQuery {
                                        viewer {
                                            artworksConnection(first: 20, marketingCollectionID: "curators-picks-emerging", sort: "-decayed_merch") {
                                                edges {
                                                    node {
                                                        internalID
                                                        slug
                                                        href
                                                        title
                                                        artistNames
                                                        image {
                                                            resized(width: 220) {
                                                                src
                                                                width
                                                                height
                                                            }
                                                        }
                                                        saleMessage
                                                        partner {
                                                            name
                                                        }
                                                        priceCurrency
                                                    }
                                                }
                                            }
                                        }
                                    }
                                `,
                            }),
                        }
                    );

                    const result = await response.json();
                    if (result.errors) {
                        console.error("GraphQL Errors:", result.errors);
                    } else {
                        const artworksData =
                            result?.data?.viewer?.artworksConnection?.edges.map(
                                (edge) => edge.node
                            ) || [];
                        setArtworks(artworksData);
                    }
                } catch (error) {
                    console.error("Error fetching artworks:", error);
                }
            };

            fetchData();
        }, []);

        const scrollLeft = () => {
            if (carouselRef.current) {
                carouselRef.current.scrollBy({ left: -220, behavior: "smooth" });
            }
        };

        const scrollRight = () => {
            if (carouselRef.current) {
                carouselRef.current.scrollBy({ left: 220, behavior: "smooth" });
            }
        };

        // Update activeIndex based on scroll position
        useEffect(() => {
            const handleScroll = () => {
                if (carouselRef.current) {
                    const scrollPosition = carouselRef.current.scrollLeft;
                    const totalWidth = carouselRef.current.scrollWidth;
                    const visibleWidth = carouselRef.current.clientWidth;

                    // Determine which half of the carousel is active
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
            <div className="max-w-[1500px] mx-auto px-6 py-8 bg-gray-50">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Curators Picks</h2>
                        <p className="text-gray-500 text-lg mt-2">
                            The best works by rising talents on Artsy, all available now.
                        </p>
                    </div>
                    <a
                        href="#"
                        className="text-black text-sm font-medium hover:underline transition-colors duration-300"
                    >
                        View All Works
                    </a>
                </div>

                {/* Carousel with Buttons */}
                <div className="relative">
                    {/* Left Button */}
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hidden md:flex transition-transform duration-300 hover:scale-110"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>

                    {/* Artwork Carousel */}
                    <div
                        ref={carouselRef}
                        className="overflow-x-auto scrollbar-hide pt-8 flex space-x-4 scroll-smooth px-2"
                    >
                        {artworks.map((art) => (
                            <Link
                                key={art.internalID}
                                href={`/artwork/${art.slug}`}
                                className="group relative flex-shrink-0 flex flex-col justify-end min-w-[220px] p-2 rounded-md overflow-hidden transition-shadow duration-300 hover:shadow-xl"
                            >
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

                                {/* Image */}
                                <div className="rounded-md overflow-hidden relative">
                                    <Image
                                        src={art.image.resized.src}
                                        alt={art.title}
                                        width={art.image.resized.width}
                                        height={art.image.resized.height}
                                        className="object-cover transition-transform duration-300 transform group-hover:scale-105"
                                    />
                                </div>

                                {/* Artwork Details */}
                                <div className="relative z-10 mt-4">
                                    <h3 className="text-sm font-semibold text-white">{art.artistNames}</h3>
                                    <p className="text-xs text-gray-300 italic">{art.title}, {art.saleMessage}</p>
                                    <p className="text-xs text-gray-300">{art.partner.name}</p>
                                </div>

                               
                            </Link>
                        ))}
                    </div>

                    {/* Right Button */}
                    <button
                        onClick={scrollRight}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hidden md:flex transition-transform duration-300 hover:scale-110"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                </div>

                {/* Animated Scroll Indicators */}
                <div className="flex justify-center mt-6 space-x-4">
                    {[0, 1].map((index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-black scale-150' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>
            </div>
        );
    }