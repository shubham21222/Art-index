"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ContactModal from '@/app/components/ContactModal';

// Define the API endpoint
const API_URL = "/api/trending-artists"; // Your new MongoDB API route

export default function TrendingArtists() {
  const [artists, setArtists] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Track the center artist
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data from MongoDB API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const { artists: fetchedArtists } = await response.json();
        setArtists(fetchedArtists || []);
        setCurrentIndex(Math.floor((fetchedArtists || []).length / 2)); // Set initial index to the middle
      } catch (error) {
        console.error("Error fetching artists:", error);
      }
    };

    fetchData();
  }, []);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? artists.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === artists.length - 1 ? 0 : prev + 1));
  };

  const handleContactClick = (e, artist) => {
    e.preventDefault();
    setSelectedArtist(artist);
    setIsModalOpen(true);
  };

  // Calculate 3D positions for each slide
  const getSlideStyle = (index) => {
    const total = artists.length || 6; // Fallback to 6 for skeletons
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

  return (
    <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between w-full mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Trending Art on Art Index</h2>
          <p className="text-gray-900 text-lg mt-2">
            Discover artists making waves in the art world.
          </p>
        </div>
        <Link
          href="/artists"
          className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4 md:mt-0"
        >
          View All Artists
        </Link>
      </div>

      {/* 3D Carousel */}
      <div className="relative h-[500px] w-full perspective-[1200px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {artists.length > 0 ? (
            artists.map((artist, index) => (
              <div
                key={artist.id}
                style={getSlideStyle(index)}
                className="group w-[400px] h-[400px] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                <Link href={`/trending-shows/${artist.slug}`} className="block h-full">
                  {/* Image */}
                  <div className="relative w-full h-full">
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full rounded-lg shadow-md transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                  </div>

                  {/* Artist Details */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white z-10">
                    <h3 className="text-lg font-semibold drop-shadow-md">{artist.name}</h3>
                    <p className="text-sm drop-shadow-md">{artist.nationalityAndBirthday}</p>
                    <p className="text-xs drop-shadow-md">
                      Artworks: {artist.artworkCount}, For Sale: {artist.forSaleArtworkCount}
                    </p>
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={(e) => handleContactClick(e, artist)}
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
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-[1] transition-transform duration-300 hover:scale-110 hover:bg-gray-100"
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
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-[1] transition-transform duration-300 hover:scale-110 hover:bg-gray-100"
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

        {/* Contact Modal */}
        <ContactModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedArtist(null);
          }}
          artwork={selectedArtist ? {
            title: selectedArtist.name,
            artistNames: selectedArtist.name,
            price: "I&apos;m Interested",
            id: selectedArtist.id
          } : null}
        />
      </div>

      {/* Indicators */}
      {artists.length > 0 && (
        <div className="flex justify-center mt-6 space-x-2">
          {artists.map((_, index) => (
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