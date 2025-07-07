"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ContactModal from '@/app/components/ContactModal';

// Define your API endpoint (adjust the path if needed)
const API_URL = "/api/auction_lots"; // Assuming this is your API route

export default function AuctionCarousel() {
    const [auctionData, setAuctionData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(null); // Initialize as null, set to middle after data loads
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageErrors, setImageErrors] = useState(new Set());

    // Fetch data from your MongoDB API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const response = await fetch(API_URL, {
                    method: "GET", // Your API uses GET by default
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const fetchedAuctionLots = data.auctionLots || [];
                
                // Validate and filter auction lots with required fields
                const validAuctionLots = fetchedAuctionLots.filter(lot => 
                    lot && 
                    lot.internalID && 
                    lot.title && 
                    lot.image?.src
                );

                setAuctionData(validAuctionLots);
                // Set initial index to the middle of the array
                if (validAuctionLots.length > 0) {
                    setCurrentIndex(Math.floor(validAuctionLots.length / 2));
                }
            } catch (error) {
                console.error("Error fetching data from MongoDB API:", error);
                setError("Failed to load auction items. Please try again later.");
                setAuctionData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Navigation handlers
    const handlePrev = () => {
        if (auctionData.length === 0) return;
        setCurrentIndex((prev) => (prev === 0 ? auctionData.length - 1 : prev - 1));
    };

    const handleNext = () => {
        if (auctionData.length === 0) return;
        setCurrentIndex((prev) => (prev === auctionData.length - 1 ? 0 : prev + 1));
    };

    // Handle image load errors
    const handleImageError = (lotId) => {
        setImageErrors(prev => new Set(prev).add(lotId));
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
            zIndex: Math.round(10 - Math.abs(angle)),
            marginLeft: "-175px", // Half of slide width (350px / 2) to center it
            marginTop: "-150px", // Half of slide height (300px / 2) to center it
        };
    };

    const handleContactClick = (e, artwork) => {
        e.preventDefault(); // Prevent the Link navigation
        setSelectedArtwork(artwork);
        setIsModalOpen(true);
    };

    // Calculate adjusted price (10% higher)
    const getAdjustedPrice = (artwork) => {
        const originalPrice = artwork.saleArtwork?.highestBid?.display || 
                            artwork.saleArtwork?.openingBid?.display;
        if (!originalPrice) return null;

        const numericPrice = parseFloat(originalPrice.replace(/[^0-9.-]+/g, ''));
        return numericPrice ? `$${(numericPrice * 1.1).toLocaleString()}` : null;
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-between w-full mb-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Masters</h2>
                        <p className="text-gray-900 text-lg mt-2">
                            Discover top picks from ongoing auctions.
                        </p>
                    </div>
                    <Link
                        href="/collect"
                        className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4 md:mt-0"
                    >
                        View All Auctions
                    </Link>
                </div>

                <div className="relative h-[400px] w-full perspective-[1000px] overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                style={getSlideStyle(index)}
                                className="w-[350px] h-[300px] rounded-md overflow-hidden"
                            >
                                <Skeleton className="w-full h-full rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-between w-full mb-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Masters</h2>
                        <p className="text-gray-900 text-lg mt-2">
                            Discover top picks from ongoing auctions.
                        </p>
                    </div>
                    <Link
                        href="/collect"
                        className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4 md:mt-0"
                    >
                        View All Auctions
                    </Link>
                </div>

                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="text-gray-500 mb-4">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-lg font-medium">{error}</p>
                        <p className="text-sm mt-2">Please check your connection and try again.</p>
                    </div>
                    <Button 
                        onClick={() => window.location.reload()} 
                        variant="outline"
                        className="mt-4"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // Show empty state
    if (auctionData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-between w-full mb-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Masters</h2>
                        <p className="text-gray-900 text-lg mt-2">
                            Discover top picks from ongoing auctions.
                        </p>
                    </div>
                    <Link
                        href="/collect"
                        className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4 md:mt-0"
                    >
                        View All Auctions
                    </Link>
                </div>

                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="text-gray-500 mb-4">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-lg font-medium">No auction items available</p>
                        <p className="text-sm mt-2">Check back later for new auction items.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="flex flex-col items-center justify-between w-full mb-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Masters</h2>
                    <p className="text-gray-900 text-lg mt-2">
                        Discover top picks from ongoing auctions.
                    </p>
                </div>
                <Link
                    href="/collect"
                    className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4 md:mt-0"
                >
                    View All Auctions
                </Link>
            </div>

            {/* 3D Carousel */}
            <div className="relative h-[400px] w-full perspective-[1000px] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    {auctionData.map((item, index) => (
                            <div
                                key={item.internalID}
                                style={getSlideStyle(index)}
                                className="group w-[350px] h-[300px] rounded-md overflow-hidden transition-all duration-300 hover:shadow-xl"
                            >
                                <Link href={`/artwork/${item.slug}`} className="block h-full">
                                    {/* Image */}
                                    <div className="relative w-full h-full">
                                        <Image
                                        src={imageErrors.has(item.internalID) ? "/placeholder.jpeg" : (item.image?.src || "/placeholder.jpeg")}
                                            alt={item.title}
                                            width={350}
                                            height={item.image?.height || 240}
                                            className="object-cover w-full h-full rounded-md shadow-md transition-transform duration-500 group-hover:scale-110"
                                        onError={() => handleImageError(item.internalID)}
                                        priority={index === currentIndex}
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                                    </div>

                                    {/* Artwork Details */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                                        <h3 className="text-sm font-semibold drop-shadow-md mb-1">
                                            {item.artistNames}
                                        </h3>
                                        <p className="text-xs italic drop-shadow-md mb-2">{item.title}</p>
                                        
                                        <div className="flex flex-col gap-2">
                                            {item.sale && (
                                                <p className="text-xs drop-shadow-md">
                                                    Ends at {new Date(item.sale.endAt).toLocaleDateString()}
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center justify-between">
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm"
                                                    className="text-xs bg-white/90 hover:bg-white text-black w-full"
                                                    onClick={(e) => handleContactClick(e, {
                                                        ...item,
                                                        price: getAdjustedPrice(item)
                                                    })}
                                                >
                                                    I'm Interested
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                {currentIndex !== null && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-2 sm:left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-3 sm:p-2 rounded-full z-[50] transition-transform duration-300 hover:scale-110 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
                            style={{ touchAction: 'manipulation' }}
                        >
                            <svg
                                className="w-6 h-6 sm:w-5 sm:h-5 text-gray-700"
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
                            className="absolute right-2 sm:right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-3 sm:p-2 rounded-full z-[50] transition-transform duration-300 hover:scale-110 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
                            style={{ touchAction: 'manipulation' }}
                        >
                            <svg
                                className="w-6 h-6 sm:w-5 sm:h-5 text-gray-700"
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

            {/* Contact Modal */}
            <ContactModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedArtwork(null);
                }}
                artwork={selectedArtwork}
            />
        </div>
    );
}