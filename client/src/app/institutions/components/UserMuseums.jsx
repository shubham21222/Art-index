"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Palette, MapPin, Phone, Mail, Globe } from "lucide-react";

// Define the API endpoint
const API_URL = "/api/user-museums";

export default function UserMuseums() {
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isFetching = useRef(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isFetching.current || hasLoaded.current) return;
      
      try {
        isFetching.current = true;
        setLoading(true);
        const response = await fetch(API_URL, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
          },
        });

        // Handle 304 Not Modified
        if (response.status === 304) {
          console.log("Data not modified, using cached data");
          setLoading(false);
          isFetching.current = false;
          return;
        }

        if (response.ok) {
          const { museums } = await response.json();
          const newMuseums = museums || [];
          
          console.log("Fetched museums:", newMuseums.length);
          
          // Only update state if data actually changed
          setMuseums(prevMuseums => {
            if (JSON.stringify(prevMuseums) === JSON.stringify(newMuseums)) {
              console.log("Data unchanged, skipping update");
              return prevMuseums; // Don't update if data is the same
            }
            console.log("Data changed, updating state");
            return newMuseums;
          });
          
          setCurrentIndex(Math.floor(newMuseums.length / 2));
          hasLoaded.current = true;
        }
      } catch (error) {
        console.error("Error fetching user museums:", error);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    fetchData();
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? museums.length - 1 : prev - 1));
  }, [museums.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === museums.length - 1 ? 0 : prev + 1));
  }, [museums.length]);

  const getSlideStyle = useCallback((index) => {
    const total = museums.length || 6;
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
  }, [museums.length, currentIndex]);

  // Helper function to validate image URLs
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    // If it's already a valid URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Filter out example.com and other placeholder URLs
      if (url.includes('example.com') || url.includes('placeholder.com') || url.includes('dummy.com')) {
        return false;
      }
      return true;
    }
    
    // If it starts with www, add https://
    if (url.startsWith('www.')) {
      return true;
    }
    
    // If it's a relative path, return as is
    if (url.startsWith('/')) {
      return true;
    }
    
    // For other cases, treat as invalid
    return false;
  };

  // Filter out museums with invalid image URLs
  const validMuseums = useMemo(() => {
    return museums.filter(museum => {
      // Always include museums, but fix their image URLs
      return true;
    }).map(museum => ({
      ...museum,
      profileImage: isValidImageUrl(museum.profileImage) ? museum.profileImage : "/placeholder.jpeg"
    }));
  }, [museums]);

  // Memoize the slide styles to prevent re-renders
  const slideStyles = useMemo(() => {
    return validMuseums.map((_, index) => getSlideStyle(index));
  }, [validMuseums.length, currentIndex, getSlideStyle]);

  // Don't render if no museums and not loading
  if (!loading && validMuseums.length === 0) {
    return null;
  }

  // Don't render if still loading and no museums yet
  if (loading && validMuseums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Newly Added Museums</h2>
          <p className="text-gray-900 text-lg mt-2">Discover museums created by our community</p>
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

  // Don't render if no museums after loading
  if (!loading && validMuseums.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between w-full mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Newly Added Museums</h2>
          <p className="text-gray-900 text-lg mt-2">Discover museums created by our community</p>
        </div>
      </div>

      {/* 3D Carousel */}
      <div className="relative h-[500px] w-full perspective-[1200px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                style={slideStyles[index] || getSlideStyle(index)}
                className="w-[400px] h-[400px] rounded-lg overflow-hidden"
              >
                <Skeleton className="w-full h-full rounded-lg" />
              </div>
            ))
          ) : validMuseums.length > 0 ? (
            validMuseums.map((museum, index) => (
              <div
                key={museum._id}
                style={slideStyles[index] || getSlideStyle(index)}
                className="group w-[400px] h-[400px] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                <Link href={`/user-museum/${museum.slug}`} className="block h-full">
                  {/* Image */}
                  <div className="relative w-full h-full">
                    <Image
                      src={museum.profileImage || "/placeholder.jpeg"}
                      alt={museum.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full rounded-lg shadow-md transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "/placeholder.jpeg";
                        e.target.onerror = null; // Prevent infinite loop
                      }}
                      onLoad={(e) => {
                        // Remove error handler on successful load
                        e.target.onerror = null;
                      }}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 group-hover:via-black/30 transition-opacity duration-300"></div>
                  </div>

                  {/* Museum Details */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white z-10">
                    {/* Community Badge */}
                    <div className="flex justify-center mb-2">
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        🏛️ Community Museum
                      </span>
                    </div>
                    <h3 className="text-lg font-bold drop-shadow-lg mb-2 text-white">{museum.name}</h3>
                    <p className="text-sm font-medium drop-shadow-lg mb-2 text-white/90">{museum.city || "N/A"}</p>
                    
                    {/* Stats */}
                    <div className="flex justify-center items-center gap-4 text-xs drop-shadow-lg">
                      <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                        <Calendar className="w-3 h-3" />
                        <span className="font-medium">{museum.events?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                        <Palette className="w-3 h-3" />
                        <span className="font-medium">{museum.artworks?.length || 0}</span>
                      </div>
                    </div>
                    
                    {/* Categories */}
                    {museum.categories && museum.categories.length > 0 && (
                      <div className="flex justify-center gap-1 mt-2">
                        {museum.categories.slice(0, 2).map((cat, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs px-2 py-1">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No museums found.</p>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentIndex !== null && validMuseums.length > 0 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-3 sm:p-2 rounded-full z-[50] transition-transform duration-300 hover:scale-110 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
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
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-3 sm:p-2 rounded-full z-[50] transition-transform duration-300 hover:scale-110 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
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
    </div>
  );
} 