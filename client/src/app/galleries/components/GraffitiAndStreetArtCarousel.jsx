"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = "/api/graffiti-street-art";

export default function GraffitiAndStreetArtCarousel() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(null); // Match AuctionCarousel

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
        console.error("Error fetching graffiti and street art:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? partners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === partners.length - 1 ? 0 : prev + 1));
  };

  const getSlideStyle = (index) => {
    const total = partners.length || 8; // Match AuctionCarousel fallback
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

    const angle = (360 / total) * (index - currentIndex);
    const radius = 600; // Match AuctionCarousel
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
      marginLeft: "-175px", // Match AuctionCarousel (350px / 2)
      marginTop: "-150px", // Match AuctionCarousel (300px / 2)
    };
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between w-full mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Graffiti & Street Art</h2>
          <p className="text-gray-900 text-lg mt-2">Explore galleries and artists</p>
        </div>
        <Link
          href="#"
          className="text-black text-sm font-medium hover:underline transition-colors duration-300 mt-4"
        >
          View All Galleries
        </Link>
      </div>

      {/* 3D Carousel */}
      <div className="relative h-[400px] w-full perspective-[1000px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                style={getSlideStyle(index)}
                className="w-[350px] h-[300px] rounded-md overflow-hidden"
              >
                <Skeleton className="w-full h-full rounded-md" />
              </div>
            ))
          ) : partners.length > 0 ? (
            partners.map((partner, index) => (
              <div
                key={partner.internalID}
                style={getSlideStyle(index)}
                className="group w-[350px] h-[300px] rounded-md overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <Link href={`/visit-gallery/${partner.slug}`} className="block h-full">
                  <div className="relative w-full h-full">
                    <Image
                      src={partner.image}
                      alt={partner.name}
                      fill
                      className="object-cover w-full h-full rounded-md shadow-md transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                    <h3 className="text-sm font-semibold drop-shadow-md mb-1">{partner.name}</h3>
                    <p className="text-xs italic drop-shadow-md">
                      {partner.locations.map((loc) => loc.city).join(", ") || "N/A"}
                    </p>
                  </div>
                </Link>
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
          {(partners.length > 0 ? partners : Array.from({ length: 6 })).map((_, index) => (
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