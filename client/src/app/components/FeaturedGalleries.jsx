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

  // Fetch data from MongoDB API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const { galleries: fetchedGalleries } = await response.json();
        setGalleries(fetchedGalleries || []);
        setCurrentIndex(Math.floor((fetchedGalleries || []).length / 2)); // Set initial index to the middle
      } catch (error) {
        console.error("Error fetching galleries:", error);
      }
    };

    fetchData();
  }, []);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? galleries.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === galleries.length - 1 ? 0 : prev + 1));
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
          {galleries.length > 0 ? (
            galleries.map((gallery, index) => (
              <div
                key={gallery.id}
                style={getSlideStyle(index)}
                className="group w-[400px] h-[400px] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                <Link href={`/gallery${gallery.href}`} className="block h-full">
                  {/* Image */}
                  <div className="relative w-full h-full">
                    <Image
                      src={gallery.image}
                      alt={gallery.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full rounded-lg shadow-md transition-transform duration-500 group-hover:scale-110"
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
            ))
          ) : (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                style={getSlideStyle(index)}
                className="w-[400px] h-[400px] rounded-lg overflow-hidden"
              >
                <Skeleton className="w-full h-full rounded-lg" />
              </div>
            ))
          )}
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

      {/* Indicators */}
      {galleries.length > 0 && (
        <div className="hidden sm:flex justify-center mt-6 space-x-2">
          {galleries.map((_, index) => (
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