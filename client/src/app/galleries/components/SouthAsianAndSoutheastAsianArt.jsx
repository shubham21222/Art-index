"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ContactModal from '@/app/components/ContactModal';

// Define the API endpoint
const API_URL = "/api/south-asian-southeast-asian-art";

export default function SouthAsianAndSoutheastAsianArt() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0); // Center item index
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
        setCurrentIndex(Math.floor((galleries || []).length / 2)); // Start at middle
      } catch (error) {
        console.error("Error fetching South Asian & Southeast Asian art galleries:", error);
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
    const total = partners.length || 5; // Fallback for skeletons
    const angle = (360 / total) * (index - currentIndex); // Circular positioning
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const radius = isMobile ? 300 : 600; // Smaller radius on mobile
    const translateZ = -radius; // Depth of the 3D circle
    const rotateY = angle; // Rotation around Y-axis
    const opacity = Math.abs(angle) > 90 ? 0 : 1 - Math.abs(angle) / 120; // Fade distant slides
    const scale = 1 - Math.abs(angle) / 180; // Scale down distant slides

    return {
      transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
      opacity,
      transition: "transform 0.8s ease, opacity 0.8s ease",
      position: "absolute",
      top: "50%",
      left: "50%",
      transformOrigin: "center center",
      zIndex: Math.round(10 - Math.abs(angle)),
      width: isMobile ? "200px" : "325px", // Smaller width on mobile
      height: isMobile ? "300px" : "400px", // Adjusted height on mobile
      marginLeft: isMobile ? "-100px" : "-162.5px", // Center based on width
      marginTop: isMobile ? "-150px" : "-200px", // Center based on height
    };
  };

  return (
    <section className="px-6 py-8 max-w-[1500px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center sm:text-left">
          South Asian & Southeast Asian Art
        </h2>
        <Link
          href="#"
          className="text-sm font-medium text-black underline hover:text-gray-700 mt-2 sm:mt-0"
        >
          Explore All Galleries
        </Link>
      </div>

      {/* 3D Carousel */}
      <div className="relative h-[500px] w-full perspective-[1200px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                style={getSlideStyle(index)}
                className="rounded-lg overflow-hidden"
              >
                <Skeleton className="w-full h-[80%] rounded-t-md" />
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
                className="group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="h-full">
                  <Link href={`/visit-gallery/${partner.slug}`} className="block h-[80%]">
                    {/* Image */}
                    <div className="relative w-full h-full">
                      <Image
                        src={partner.image}
                        alt={partner.name}
                        fill
                        className="object-cover rounded-t-md transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                    </div>
                  </Link>
                  {/* Details */}
                  <div className="p-2 text-white bg-gray-900 bg-opacity-80">
                    {/* <h3 className="text-base md:text-lg font-semibold line-clamp-1">
                      {partner.name}
                    </h3>
                    <p className="text-xs md:text-sm">
                      {partner.locations[0]?.city || "N/A"}
                    </p>
                    <p className="text-xs md:text-sm text-gray-300">
                      {partner.categories.map((cat) => cat.name).join(", ") || "N/A"}
                    </p> */}
                    <div className="flex gap-2 mt-2">
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
                        I’m Interested
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No galleries found.</p>
          )}
        </div>

        {/* Navigation Buttons */}
        {!loading && partners.length > 0 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-20 transition-transform duration-300 hover:scale-110 hover:bg-gray-100"
              disabled={loading}
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-20 transition-transform duration-300 hover:scale-110 hover:bg-gray-100"
              disabled={loading}
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Indicators */}
      {!loading && partners.length > 0 && (
        <div className="flex justify-center mt-6 space-x-2">
          {partners.map((_, index) => (
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
          price: "I’m Interested",
          id: selectedGallery.internalID
        } : null}
      />
    </section>
  );
}