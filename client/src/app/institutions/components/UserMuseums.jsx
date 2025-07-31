"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = "/api/user-museums";

export default function UserMuseums() {
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isFetching = useRef(false);
  const hasLoaded = useRef(false);

  // Fetch museums data
  const fetchData = useCallback(async () => {
    if (hasLoaded.current) return;
    
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api';
      const response = await fetch(`${apiUrl}/museum/all`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.status === 304) {
        console.log('304 Not Modified - skipping update');
        return;
      }
      
      const data = await response.json();
      
      if (data.status && data.items) {
        const newMuseums = data.items;
        // Only update if data has actually changed
        if (JSON.stringify(newMuseums) !== JSON.stringify(museums)) {
          setMuseums(newMuseums);
        }
      }
      hasLoaded.current = true;
    } catch (error) {
      console.error('Error fetching museums:', error);
    } finally {
      setLoading(false);
    }
  }, [museums]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update currentIndex when museums change
  useEffect(() => {
    if (museums.length > 0) {
      const total = Math.min(museums.length, 20);
      setCurrentIndex(Math.floor(total / 2));
    }
  }, [museums.length]);

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

  // Filter out museums with invalid image URLs and limit to 20 most recent
  const validMuseums = useMemo(() => {
    console.log('UserMuseums: Processing museums, total from API:', museums.length);
    
    const processedMuseums = museums
      .map(museum => ({
        ...museum,
        profileImage: isValidImageUrl(museum.profileImage) ? museum.profileImage : "/placeholder.jpeg"
      }))
      .filter(museum => {
        // Include all museums, but ensure they have valid data
        return museum.name && museum.slug;
      })
      .slice(0, 20); // Show only 20 most recent museums
    
    console.log('UserMuseums: Processed museums (first 20):', processedMuseums.length);
    console.log('UserMuseums: First few museums:', processedMuseums.slice(0, 3).map(m => ({ name: m.name, slug: m.slug })));
    
    return processedMuseums;
  }, [museums]);

  const getSlideStyle = useCallback((index) => {
    const total = Math.min(museums.length, 20) || 6;
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

  const handlePrev = useCallback(() => {
    const total = Math.min(museums.length, 20);
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [museums.length]);

  const handleNext = useCallback(() => {
    const total = Math.min(museums.length, 20);
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [museums.length]);

  // Memoize the slide styles to prevent re-renders
  const slideStyles = useMemo(() => {
    const total = Math.min(museums.length, 20);
    return Array.from({ length: total }, (_, index) => getSlideStyle(index));
  }, [museums.length, currentIndex, getSlideStyle]);

  // Debug render conditions
  console.log('UserMuseums: Render debug - loading:', loading, 'museums.length:', museums.length, 'validMuseums.length:', validMuseums.length, 'currentIndex:', currentIndex);

  // Always render the component for debugging
  return (
    <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between w-full mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Newly Added Museums</h2>
          <p className="text-gray-900 text-lg mt-2">Discover museums created by our community</p>
          {/* Debug info */}
          {/* <p className="text-sm text-gray-500 mt-2">
            Debug: Loading={loading.toString()}, Museums={museums.length}, Valid={validMuseums.length}, CurrentIndex={currentIndex}
          </p> */}
        </div>
        <div className="mt-4">
          <Link 
            href="/user-museums"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium border border-gray-300"
          >
            View All Museums
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
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
          ) : validMuseums.length > 0 ? (
            validMuseums.map((museum, index) => {
              const slideStyle = getSlideStyle(index);
              console.log(`Slide ${index} style:`, slideStyle);
              return (
                <div
                  key={museum._id}
                  style={slideStyle}
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
                          e.target.onerror = null;
                        }}
                        onLoad={(e) => {
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
              );
            })
          ) : (
            <div className="text-center">
              <p className="text-gray-600">No museums available. Loading: {loading.toString()}</p>
              <p className="text-sm text-gray-500">Museums from API: {museums.length}</p>
              <p className="text-sm text-gray-500">Valid museums: {validMuseums.length}</p>
            </div>
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
