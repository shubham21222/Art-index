"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ContactModal from '@/app/components/ContactModal';

// Define the API endpoint
const API_URL = "/api/galleries"; // Your new MongoDB API route

export default function FeaturedGalleries() {
  const [galleries, setGalleries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Track the center gallery
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());

  // Fetch data from MongoDB API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const fetchedGalleries = data.galleries || [];
        
        // Validate and filter galleries wi th required fields
        const validGalleries = fetchedGalleries.filter(gallery => 
          gallery && 
          gallery.id && 
          gallery.name && 
          gallery.image
        );

        setGalleries(validGalleries);
        
        // Set initial index to the middle if we have galleries
        if (validGalleries.length > 0) {
          setCurrentIndex(Math.floor(validGalleries.length / 2));
        }
      } catch (error) {
        console.error("Error fetching galleries:", error);
        setError("Failed to load galleries. Please try again later.");
        // Set fallback data for better UX
        setGalleries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Navigation handlers
  const handlePrev = () => {
    if (galleries.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? galleries.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (galleries.length === 0) return;
    setCurrentIndex((prev) => (prev === galleries.length - 1 ? 0 : prev + 1));
  };

  // Handle image load errors
  const handleImageError = (galleryId) => {
    setImageErrors(prev => new Set(prev).add(galleryId));
  };

  // Calculate 3D positions for each slide
  const getSlideStyle = (index) => {
    const total = galleries.length || 6; // Fallback to 6 for skeletons
    const angle = (360 / total) * (index - currentIndex); // Circular positioning
    const radius = 700; // Larger radius for wider spacing
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
      marginLeft: "-200px", // Half of slide width (400px / 2) to center it
      marginTop: "-200px", // Half of slide height (400px / 2) to center it
    };  
  };

  const handleContactClick = (e, gallery) => {
    e.preventDefault();
    setSelectedGallery(gallery);
    setIsModalOpen(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-between w-full mb-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Sculptures</h2>
            <p className="text-gray-900 text-lg mt-2">
              Explore top galleries showcasing exceptional works.
            </p>
          </div>
          <Link 
            href="/galleries"
            className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4 md:mt-0"
          >
            View All Galleries
          </Link>
        </div>

        <div className="relative h-[500px] w-full perspective-[1200px] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                style={getSlideStyle(index)}
                className="w-[400px] h-[400px] rounded-lg overflow-hidden"
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
            <h2 className="text-3xl font-bold text-gray-900">Sculptures</h2>
            <p className="text-gray-900 text-lg mt-2">
              Explore top galleries showcasing exceptional works.
            </p>
          </div>
          <Link 
            href="/galleries"
            className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4 md:mt-0"
          >
            View All Galleries
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
  if (galleries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-between w-full mb-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Sculptures</h2>
            <p className="text-gray-900 text-lg mt-2">
              Explore top galleries showcasing exceptional works.
            </p>
          </div>
          <Link 
            href="/galleries"
            className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4 md:mt-0"
          >
            View All Galleries
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center h-[400px] text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium">No galleries available</p>
            <p className="text-sm mt-2">Check back later for new galleries.</p>
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
          <h2 className="text-3xl font-bold text-gray-900">Sculptures</h2>
          <p className="text-gray-900 text-lg mt-2">
            Explore top galleries showcasing exceptional works.
          </p>
        </div>
        <Link 
          href="/galleries"
          className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4 md:mt-0"
        >
          View All Galleries
        </Link>
      </div>

      {/* 3D Carousel */}
      <div className="relative h-[500px] w-full perspective-[1200px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {galleries.map((gallery, index) => (
            <div
              key={gallery.id}
              style={getSlideStyle(index)}
              className="group w-[400px] h-[400px] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl"
            >
              <Link href={`/gallery${gallery.href}`} className="block h-full">
                {/* Image */}
                <div className="relative w-full h-full">
                  <Image
                    src={imageErrors.has(gallery.id) ? "/placeholder.jpeg" : gallery.image}
                    alt={gallery.name}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full rounded-lg shadow-md transition-transform duration-500 group-hover:scale-110"
                    onError={() => handleImageError(gallery.id)}
                    priority={index === currentIndex}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                </div>

                {/* Gallery Details */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white z-10">
                  <h3 className="text-lg font-semibold drop-shadow-md">{gallery.name}</h3>
                  <p className="text-sm drop-shadow-md">{gallery.location}</p>
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={(e) => handleContactClick(e, gallery)}
                    className="mt-2 bg-white/90 hover:bg-white text-black w-full"
                  >
                    I&apos;m Interested
                  </Button>
                </div>
              </Link>
            </div>  
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-3 sm:p-2 rounded-full z-[50] transition-transform duration-300 hover:scale-110 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
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
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-3 sm:p-2 rounded-full z-[50] transition-transform duration-300 hover:scale-110 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
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

        {/* Contact Modal */}
        <ContactModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedGallery(null);
          }}
          artwork={selectedGallery ? {
            title: selectedGallery.name,
            artistNames: selectedGallery.name,
            price: "I&apos;m Interested",
            id: selectedGallery.id
          } : null}
        />
      </div>
    </div>
  );
}