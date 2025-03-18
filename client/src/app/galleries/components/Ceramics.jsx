"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ContactModal from '@/app/components/ContactModal';

// Define the API endpoint
const API_URL = "/api/ceramics";

export default function Ceramics() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);

  // Fetch data from MongoDB API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const { galleries } = await response.json();
        setPartners(galleries || []);
        setCurrentIndex(Math.floor((galleries || []).length / 2));
      } catch (error) {
        console.error("Error fetching ceramics galleries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? partners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === partners.length - 1 ? 0 : prev + 1));
  };

  const handleContactClick = (e, gallery) => {
    e.preventDefault();
    setSelectedGallery(gallery);
    setIsModalOpen(true);
  };

  // Calculate 3D slide styles
  const getSlideStyle = (index) => {
    const total = partners.length || 5;
    const angle = (360 / total) * (index - currentIndex);
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const radius = isMobile ? 300 : 600;
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
      width: isMobile ? "200px" : "325px",
      height: isMobile ? "300px" : "400px",
      marginLeft: isMobile ? "-100px" : "-162.5px",
      marginTop: isMobile ? "-150px" : "-200px",
    };
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between w-full mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ceramics</h2>
          <p className="text-gray-900 text-lg mt-2">Discover ceramic art collections</p>
        </div>
        <Link
          href="#"
          className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4"
        >
          View All Galleries
        </Link>
      </div>

      {/* 3D Carousel */}
      <div className="relative h-[400px] w-full perspective-[1200px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                style={getSlideStyle(index)}
                className="rounded-lg overflow-hidden"
              >
                <Skeleton className="w-full h-[100%] rounded-t-md" />
                <div className="p-2 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))
          ) : partners.length > 0 ? (
            partners.map((partner, index) => (
              <div
                key={partner.internalID}
                style={getSlideStyle(index)}
                className="group rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div className="relative w-full h-[70%]">
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    fill
                    className="object-cover rounded-t-md transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                </div>
                <div className="p-2 text-white bg-gray-900 bg-opacity-80">
                  {/* <h3 className="text-base md:text-lg font-semibold line-clamp-1">
                    {partner.name}
                  </h3>
                  <p className="text-xs md:text-sm italic mb-2">
                    {partner.locations[0]?.city || "N/A"}
                  </p> */}
                  <div className="flex gap-2">
                    <Link 
                      href={`/visit-gallery/${partner.slug}`}
                      className="flex-1"
                    >
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="w-full text-xs bg-white/90 hover:bg-white text-black"
                      >
                        View Gallery
                      </Button>
                    </Link>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="text-xs bg-white/90 hover:bg-white text-black"
                      onClick={(e) => handleContactClick(e, partner)}
                    >
                      Contact for Pricing
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No galleries found.</p>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentIndex !== null && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-[1] transition-transform duration-300 hover:scale-110 hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-[1] transition-transform duration-300 hover:scale-110 hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Indicators */}
      {currentIndex !== null && (
        <div className="flex justify-center mt-6 space-x-2">
          {(partners.length > 0 ? partners : Array.from({ length: 5 })).map((_, index) => (
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
          setSelectedGallery(null);
        }}
        artwork={selectedGallery ? {
          title: selectedGallery.name,
          artistNames: selectedGallery.locations[0]?.city || "N/A",
          price: "Contact for pricing",
          id: selectedGallery.internalID
        } : null}
      />
    </div>
  );
}