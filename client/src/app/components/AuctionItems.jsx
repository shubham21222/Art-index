"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";

const AUCTION_QUERY = `
  query HomeAuctionLotsRailQuery {
    viewer {
      artworksConnection(forSale: true, first: 20, geneIDs: "our-top-auction-lots") {
        edges {
          node {
            internalID
            href
            slug
            title
            artistNames
            image {
              src: url(version: ["larger", "large"])
              width
              height
            }
            sale {
              endAt
              isClosed
            }
            saleArtwork {
              highestBid {
                display
              }
              openingBid {
                display
              }
            }
            collectorSignals {
              auction {
                lotClosesAt
                registrationEndsAt
              }
            }
          }
        }
      }
    }
  }
`;

export default function AuctionCarousel() {
    const [auctionData, setAuctionData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(null); // Initialize as null, set to middle after data loads

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
                        query: AUCTION_QUERY,
                    }),
                });

                const { data } = await response.json();
                const artworks = data?.viewer?.artworksConnection?.edges.map(
                    (edge) => edge.node
                );
                setAuctionData(artworks || []);
                // Set initial index to the middle of the array
                setCurrentIndex(Math.floor((artworks || []).length / 2));
            } catch (error) {
                console.error("Error fetching data from Artsy API:", error);
            }
        };

        fetchData();
    }, []);

    // Navigation handlers
    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? auctionData.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === auctionData.length - 1 ? 0 : prev + 1));
    };

    // Calculate 3D positions for each slide
    const getSlideStyle = (index) => {
        const total = auctionData.length || 6; // Use 6 as fallback for skeletons
        if (currentIndex === null) {
            return {
                opacity: 0, // Hide until data is loaded
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(0)", // Start from center, scaled down
                transition: "all 0.8s ease",
            };
        }

        const angle = (360 / total) * (index - currentIndex); // Circular positioning
        const radius = 600; // Increased radius for wider slides
        const translateZ = -radius; // Depth of the 3D circle
        const rotateY = angle; // Rotation around Y-axis
        const opacity = Math.abs(angle) > 90 ? 0 : 1 - Math.abs(angle) / 120; // Fade out distant slides
        const scale = 1 - Math.abs(angle) / 180; // Scale down distant slides

        return {
            transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
            opacity,
            transition: "transform 0.8s ease, opacity 0.8s ease",
            position: "absolute",
            top: "50%", // Center vertically
            left: "50%", // Center horizontally
            transformOrigin: "center center",
            zIndex: Math.round(10 - Math.abs(angle)), // Reduced from 100 to 10
            marginLeft: "-175px", // Half of slide width (350px / 2) to center it
            marginTop: "-150px", // Half of slide height (300px / 2) to center it
        };
    };

    return (
        <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="flex flex-col items-center justify-between w-full mb-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Art Auctions</h2>
                    <p className="text-gray-900 text-lg mt-2">
                        Discover top picks from ongoing auctions.
                    </p>
                </div>
                <a
                    href="#"
                    className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4 md:mt-0"
                >
                    View All Auctions
                </a>
            </div>

            {/* 3D Carousel */}
            <div className="relative h-[400px] w-full perspective-[1000px] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    {auctionData.length > 0 ? (
                        auctionData.map((item, index) => (
                            <div
                                key={item.internalID}
                                style={getSlideStyle(index)}
                                className="group w-[350px] h-[300px] rounded-md overflow-hidden transition-all duration-300 hover:shadow-xl"
                            >
                                <Link href={`/artwork/${item.slug}`} className="block h-full">
                                    {/* Image */}
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={item.image?.src || "/placeholder.svg"}
                                            alt={item.title}
                                            width={350}
                                            height={item.image?.height || 240}
                                            className="object-cover w-full h-full rounded-md shadow-md transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                                    </div>

                                    {/* Artwork Details */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center text-white z-10">
                                        <h3 className="text-sm font-semibold drop-shadow-md">
                                            {item.artistNames}
                                        </h3>
                                        <p className="text-xs italic drop-shadow-md">{item.title}</p>
                                        {item.sale && (
                                            <p className="text-xs drop-shadow-md">
                                                Ends at{" "}
                                                {new Date(item.sale.endAt).toLocaleDateString()}
                                            </p>
                                        )}
                                        <div className="flex justify-between items-center mt-2 px-2">
                                            <p className="text-white font-medium text-xs">
                                                {item.saleArtwork?.highestBid?.display ||
                                                    item.saleArtwork?.openingBid?.display ||
                                                    "N/A"}
                                            </p>
                                            {item.collectorSignals?.auction?.registrationEndsAt && (
                                                <p className="text-xs text-gray-400 drop-shadow-md">
                                                    Register by{" "}
                                                    {new Date(
                                                        item.collectorSignals.auction.registrationEndsAt
                                                    ).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                style={getSlideStyle(index)}
                                className="w-[350px] h-[300px] rounded-md overflow-hidden"
                            >
                                <Skeleton className="w-full h-full rounded-md" />
                            </div>
                        ))
                    )}
                </div>

                {/* Navigation Buttons */}
                {currentIndex !== null && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-[1] transition-transform duration-300 hover:scale-110 hover:bg-gray-100"
                        >
                            <svg
                                className="w-5 h-5 text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-[1] transition-transform duration-300 hover:scale-110 hover:bg-gray-100"
                        >
                            <svg
                                className="w-5 h-5 text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {/* Indicators */}
            {currentIndex !== null && (
                <div className="flex justify-center mt-6 space-x-2">
                    {(auctionData.length > 0 ? auctionData : Array.from({ length: 6 })).map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex ? "bg-black scale-150" : "bg-gray-300"
                            }`}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}