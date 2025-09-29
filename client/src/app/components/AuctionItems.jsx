"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ContactModal from '@/app/components/ContactModal';

// Define your API endpoint (adjust the path if needed)
const API_URL = "/api/auction_lots"; // Assuming this is your API route

export default function AuctionCarousel() {
    const [auctionData, setAuctionData] = useState([]);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageErrors, setImageErrors] = useState(new Set());
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const carouselRef = useRef(null);
    const autoPlayRef = useRef(null);

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

                // Shuffle the array to randomize items on each refresh
                const shuffledData = [...validAuctionLots].sort(() => Math.random() - 0.5);
                // Take 200 items for carousel
                const selectedAuctionLots = shuffledData.slice(0, 200);

                setAuctionData(selectedAuctionLots);
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

    // Calculate number of slides (4 cards per slide)
    const cardsPerSlide = 4;
    const totalSlides = Math.ceil(auctionData.length / cardsPerSlide);

    // Auto-play functionality
    useEffect(() => {
        if (isAutoPlaying && totalSlides > 0) {
            autoPlayRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => 
                    prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
                );
            }, 3000);
        }

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [isAutoPlaying, totalSlides]);

    // Navigation functions
    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
        );
        setIsAutoPlaying(false);
        // Resume auto-play after 5 seconds
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
        );
        setIsAutoPlaying(false);
        // Resume auto-play after 5 seconds
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    // Handle image load errors
    const handleImageError = (lotId) => {
        setImageErrors(prev => new Set(prev).add(lotId));
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
            <div className="flex flex-col items-center justify-center mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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

                <div className="w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="w-full h-[300px] rounded-lg overflow-hidden"
                            >
                                <Skeleton className="w-full h-full rounded-lg" />
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
        <div className="flex flex-col items-center justify-center mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Header Section */}
            <div className="flex flex-col items-center justify-between w-full mb-6">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Masters</h2>
                    <p className="text-gray-900 text-base sm:text-lg mt-2">
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

            {/* Carousel Container */}
            <div className="w-full relative">
                {/* Navigation Buttons */}
                <button
                    onClick={goToPrevious}
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all duration-200"
                    aria-label="Previous artwork"
                >
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <button
                    onClick={goToNext}
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all duration-200"
                    aria-label="Next artwork"
                >
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Carousel Container */}
                <div 
                    ref={carouselRef}
                    className="overflow-hidden rounded-lg"
                >
                    <div 
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                            <div
                                key={slideIndex}
                                className="w-full flex-shrink-0 px-1 sm:px-2"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                                    {auctionData
                                        .slice(slideIndex * cardsPerSlide, (slideIndex + 1) * cardsPerSlide)
                                        .map((item, cardIndex) => (
                                            <div
                                                key={item.internalID}
                                                className="group relative w-full h-[300px] sm:h-[350px] lg:h-[400px] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                                            >
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={imageErrors.has(item.internalID) ? "/placeholder.jpeg" : (item.image?.src || "/placeholder.jpeg")}
                                                        alt={item.title}
                                                        width={400}
                                                        height={300}
                                                        className="object-cover w-full h-full rounded-lg shadow-md transition-transform duration-500 group-hover:scale-110"
                                                        onError={() => handleImageError(item.internalID)}
                                                        priority={cardIndex < 4}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                                                    
                                                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6 text-white z-10">
                                                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold drop-shadow-md mb-1 sm:mb-2">
                                                            {item.artistNames}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm italic drop-shadow-md mb-2 sm:mb-3 lg:mb-4">{item.title}</p>
                                                        
                                                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3">
                                                            <Button 
                                                                variant="secondary" 
                                                                size="sm"
                                                                className="text-xs sm:text-sm bg-white/90 hover:bg-white text-black px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2"
                                                                onClick={(e) => handleContactClick(e, {
                                                                    ...item,
                                                                    price: getAdjustedPrice(item)
                                                                })}
                                                            >
                                                                I'm Interested
                                                            </Button>
                                                            <Link 
                                                                href={`/artwork/${item.slug}`}
                                                                className="text-xs sm:text-sm bg-black/40 hover:bg-black/60 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors duration-200 text-center"
                                                            >
                                                                View Details
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Carousel Indicators */}
                <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentIndex(index);
                                setIsAutoPlaying(false);
                                setTimeout(() => setIsAutoPlaying(true), 5000);
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                index === currentIndex 
                                    ? 'bg-black' 
                                    : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
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