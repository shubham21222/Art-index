"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";

const ARTISTS_QUERY = `
  query HomeTrendingArtistsRailQuery {
    viewer {
      curatedTrendingArtists(first: 20) {
        edges {
          node {
            internalID
            slug
            name
            href
            initials
            formattedNationalityAndBirthday
            counts {
              artworks
              forSaleArtworks
            }
            coverArtwork {
              image {
                cropped(width: 445, height: 334, version: ["larger", "large"]) {
                  src
                  srcSet
                }
              }
              id
            }
          }
        }
      }
    }
  }
`;

export default function TrendingArtists() {
    const carouselRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0); // Track active slide index
    const [artists, setArtists] = useState([]); // Store fetched artists

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
                        query: ARTISTS_QUERY,
                    }),
                });

                const { data } = await response.json();
                const fetchedArtists =
                    data?.viewer?.curatedTrendingArtists?.edges
                        ?.map((edge) => ({
                            id: edge.node.internalID,
                            name: edge.node.name,
                            href: edge.node.href,
                            nationalityAndBirthday: edge.node.formattedNationalityAndBirthday,
                            artworkCount: edge.node.counts.artworks,
                            forSaleArtworkCount: edge.node.counts.forSaleArtworks,
                            image: edge.node.coverArtwork?.image?.cropped?.src || "/placeholder.svg",
                        })) || [];
                setArtists(fetchedArtists);
            } catch (error) {
                console.error("Error fetching data from Artsy API:", error);
            }
        };

        fetchData();
    }, []);

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -240, behavior: "smooth" }); // Adjust scroll distance to match item width
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 240, behavior: "smooth" }); // Adjust scroll distance to match item width
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
        <section className="px-6 py-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl ">
                    Trending Artists on Artsy <sup className="text-blue-500 text-sm">20</sup>
                </h2>
                <a href="#" className="text-sm font-medium underline">
                    View All Artists
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

                {/* Trending Artists Carousel */}
                <div
                    ref={carouselRef}
                    className="overflow-x-auto whitespace-nowrap scrollbar-hide flex space-x-6"
                >
                    {artists.length > 0 ? (
                        artists.map((artist, index) => (
                            <div key={index} className="w-80 space-y-2 flex-shrink-0">
                                {/* Name and Info */}

                                {/* Image */}
                                <div className="relative w-80 h-80">
                                    <Image
                                        src={artist.image}
                                        alt={artist.name}
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-md"
                                    />
                                </div>

                                <div className="flex justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold">{artist.name}</h3>
                                        <p className="text-xs text-gray-600">{artist.nationalityAndBirthday}</p>
                                        <p className="text-xs text-gray-600">
                                            Artworks: {artist.artworkCount}, For Sale: {artist.forSaleArtworkCount}
                                        </p>

                                    </div>
                                    <button className="border  px-4 py-[2px] rounded-full text-sm">
                                        Follow
                                    </button>
                                </div>
                            </div>
                        ))
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