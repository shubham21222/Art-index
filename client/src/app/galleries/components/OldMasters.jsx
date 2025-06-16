"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ContactModal from '@/app/components/ContactModal';

// Define the API endpoint
const API_URL = "/api/old-masters";

export default function OldMasters() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try { 
        setLoading(true);
        const response = await fetch(API_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const { galleries } = await response.json();
        setArtworks(galleries || []);
        setCurrentIndex(Math.floor((galleries || []).length / 2));
      } catch (error) {
        console.error("Error fetching Old Masters artworks:", error);
      } finally {
        setLoading(false);
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
    e.preventDefault();
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
  };

  const getSlideStyle = (index) => {
    const total = artworks.length || 6;
    const angle = (360 / total) * (index - currentIndex);
    const radius = 700;
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
      zIndex: Math.round(10 - Math.abs(angle)),
      marginLeft: "-200px",
      marginTop: "-200px",
    };
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between w-full mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Old Masters</h2>
          <p className="text-gray-900 text-lg mt-2">Discover classical masterpieces</p>
        </div>
        {/* <Link
          href="/old-masters"
          className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4 md:mt-0"
        >
          View All Artworks
        </Link> */}
      </div>

      {/* 3D Carousel */}
      <div className="relative h-[500px] w-full perspective-[1200px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                style={getSlideStyle(index)}
                className="w-[400px] h-[400px] rounded-lg overflow-hidden"
              >
                <Skeleton className="w-full h-full rounded-lg" />
              </div>
            ))
          ) : artworks.length > 0 ? (
            artworks.map((artwork, index) => (
              <div
                key={artwork.internalID}
                style={getSlideStyle(index)}
                className="group w-[400px] h-[400px] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                <Link href={`/artwork/${artwork.slug}`} className="block h-full">
                  {/* Image */}
                  <div className="relative w-full h-full">
                    <Image
                      src={artwork.image.src}
                      alt={artwork.title}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full rounded-lg shadow-md transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                  </div>

                  {/* Artwork Details */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white z-10">
                    <h3 className="text-lg font-semibold drop-shadow-md">{artwork.title}</h3>
                    <p className="text-sm drop-shadow-md">{artwork.artistNames}</p>
                    <p className="text-xs drop-shadow-md">{artwork.date}</p>
                    <div className="flex justify-center gap-2 mt-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="text-xs bg-white/90 hover:bg-white text-black"
                        onClick={(e) => {
                          e.preventDefault();
                          handleContactClick(e, artwork);
                        }}
                      >
                        I'm Interested
                      </Button>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No artworks found.</p>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentIndex !== null && artworks.length > 0 && (
          <>
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
          </>
        )}
      </div>

      {/* Indicators */}
      {currentIndex !== null && artworks.length > 0 && (
        <div className="flex justify-center mt-6 space-x-2">
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
        artwork={selectedArtwork ? {
          title: selectedArtwork.title,
          artistNames: selectedArtwork.artistNames,
          price: selectedArtwork.saleMessage || "Price on request",
          id: selectedArtwork.internalID
        } : null}
      />
    </div>
  );
}