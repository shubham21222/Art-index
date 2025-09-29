"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ContactModal from '@/app/components/ContactModal';
import SoldBadge from '@/components/SoldBadge';

export default function CuratorsPicks() {
  const [artworks, setArtworks] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/artworks", {
          method: "GET",
        });
        const result = await response.json();
        if (result.error) {
          console.error("API Error:", result.error);
        } else {
          console.log("Fetched artworks:", result.artworks); // Debug log
          const artworksData = result.artworks || [];
          // Shuffle the array to randomize items on each refresh
          const shuffledData = [...artworksData].sort(() => Math.random() - 0.5);
          // Take 200 items for carousel
          const selectedArtworks = shuffledData.slice(0, 200);
          setArtworks(selectedArtworks);
        }
      } catch (error) {
        console.error("Error fetching artworks:", error);
      }
    };

    fetchData();
  }, []);

  // Calculate number of slides (4 cards per slide)
  const cardsPerSlide = 4;
  const totalSlides = Math.ceil(artworks.length / cardsPerSlide);

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


  const handleContactClick = (e, artwork) => {
    e.preventDefault(); // Prevent the Link navigation
    const adjustedPrice = getAdjustedPrice(artwork);
    setSelectedArtwork({
      ...artwork,
      price: adjustedPrice
    });
    setIsModalOpen(true);
  };

  // Calculate adjusted price (10% higher)
  const getAdjustedPrice = (artwork) => {
    if (!artwork.saleMessage) return null;
    const priceMatch = artwork.saleMessage.match(/\$[\d,]+/);
    if (!priceMatch) return null;
    
    const originalPrice = parseFloat(priceMatch[0].replace(/[$,]/g, ''));
    return originalPrice ? `$${(originalPrice * 1.1).toLocaleString()}` : null;
  };


  return (
    <div className="flex flex-col items-center justify-center mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col items-center justify-between w-full mb-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Modern Paintings</h2>
          <p className="text-gray-900 text-base sm:text-lg mt-2">
            The best works by rising talents on Art Index, all available now.
          </p>
        </div>
        <Link
          href="/collect"
          className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4 md:mt-0"
        >
          View All Works
        </Link>
      </div>

      <div className="w-full relative">
        {artworks.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Loading artworks...</p>
          </div>
        ) : (
          <>
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
                      {artworks
                        .slice(slideIndex * cardsPerSlide, (slideIndex + 1) * cardsPerSlide)
                        .map((art, cardIndex) => (
                          <div
                            key={art.internalID}
                            className="group relative w-full h-[300px] sm:h-[350px] lg:h-[400px] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                          >
                            <div className="relative w-full h-full">
                              <Image
                                src={art.image.resized.src}
                                alt={art.title}
                                width={400}
                                height={300}
                                className="object-cover w-full h-full rounded-lg shadow-md transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                              
                              {/* Sold Status Badge */}
                              {art.soldStatus && art.soldStatus !== 'available' && (
                                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20">
                                  <SoldBadge status={art.soldStatus} />
                                </div>
                              )}
                              
                              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6 text-white z-10">
                                <h3 className="text-sm sm:text-base lg:text-lg font-semibold drop-shadow-md mb-1 sm:mb-2">
                                  {art.artistNames}
                                </h3>
                                <p className="text-xs sm:text-sm italic drop-shadow-md mb-2 sm:mb-3 lg:mb-4">
                                  {art.title}
                                </p>
                                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3">
                                  <Button 
                                    variant="secondary" 
                                    size="sm"
                                    className="text-xs sm:text-sm bg-white/90 hover:bg-white text-black px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2"
                                    onClick={(e) => handleContactClick(e, art)}
                                  >
                                    I'm Interested
                                  </Button>
                                  <Link 
                                    href={`/artwork/${art.slug}`}
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