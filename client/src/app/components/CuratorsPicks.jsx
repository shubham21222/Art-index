"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ContactModal from '@/app/components/ContactModal';

export default function CuratorsPicks() {
  const [artworks, setArtworks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          setArtworks(artworksData);
          setCurrentIndex(Math.floor(artworksData.length / 2));
        }
      } catch (error) {
        console.error("Error fetching artworks:", error);
      }
    };

    fetchData();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? artworks.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === artworks.length - 1 ? 0 : prev + 1));
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

  const getSlideStyle = (index) => {
    if (currentIndex === null) {
      return {
        opacity: 0,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) scale(0)",
        transition: "all 0.8s ease",
      };
    }

    const total = artworks.length;
    const angle = (360 / total) * (index - currentIndex);
    const radius = 600;
    const translateZ = -radius;
    const rotateY = angle;
    const opacity = Math.abs(angle) > 90 ? 0 : 1 - Math.abs(angle) / 120;
    const scale = 1 - Math.abs(angle) / 180;

    return {
      transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
      opacity,
      transition: "transform 0.8s ease, opacity 0.8s ease",
      position: "absolute",
      top: "50%",
      left: "50%",
      transformOrigin: "center center",
      zIndex: Math.round(5 - Math.abs(angle)),
      marginLeft: "-175px",
      marginTop: "-150px",
    };
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
      <div className="flex flex-col items-center justify-between w-full mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Modern Paintings</h2>
          <p className="text-gray-900 text-lg mt-2">
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

      <div className="relative h-[400px] w-full perspective-[1000px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {artworks.length === 0 ? (
            <p>Loading artworks...</p>
          ) : (
            artworks.map((art, index) => (
              <div
                key={art.internalID}
                style={getSlideStyle(index)}
                className="group w-[350px] h-[300px] rounded-md overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={art.image.resized.src}
                    alt={art.title}
                    width={350}
                    height={art.image.resized.height}
                    className="object-cover w-full h-full rounded-md shadow-md transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                    <h3 className="text-sm font-semibold drop-shadow-md mb-1">
                      {art.artistNames}
                    </h3>
                    <p className="text-xs italic drop-shadow-md mb-2">
                      {art.title}
                    </p>
                    <div className="flex justify-between items-center gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="text-xs bg-white/90 hover:bg-white text-black w-full"
                        onClick={(e) => handleContactClick(e, art)}
                      >
                        I'm Interested
                      </Button>
                      <Link 
                        href={`/artwork/${art.slug}`}
                        className="text-xs bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-md transition-colors duration-200"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

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

      {currentIndex !== null && (
        <div className="hidden sm:flex justify-center mt-6 space-x-2">
          {artworks.map((_, index) => (
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