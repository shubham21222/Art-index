'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserGalleries() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasLoaded = useRef(false);

  // Fetch galleries data
  const fetchData = useCallback(async () => {
    if (hasLoaded.current) return;
    
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api';
      const response = await fetch(`${apiUrl}/gallery/all`, {
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
        const newGalleries = data.items;
        // Only update if data has actually changed
        if (JSON.stringify(newGalleries) !== JSON.stringify(galleries)) {
          setGalleries(newGalleries);
        }
      }
      hasLoaded.current = true;
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  }, [galleries]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper function to validate image URLs
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (url === "/placeholder.jpeg") return true;
    if (url.startsWith('data:')) return true;
    if (url.startsWith('blob:')) return true;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Check if it's a real image URL, not a placeholder
      return !url.includes('example.com') && 
             !url.includes('placeholder.com') && 
             !url.includes('dummy.com');
    }
    return url.startsWith('/');
  };

  // Filter out galleries with invalid image URLs and limit to 20 most recent
  const validGalleries = useMemo(() => {
    console.log('Total galleries from API:', galleries.length);

    const processedGalleries = galleries
      .map(gallery => ({
        ...gallery,
        profileImage: isValidImageUrl(gallery.profileImage) ? gallery.profileImage : "/placeholder.jpeg"
      }))
      .filter(gallery => {
        return gallery.name && gallery.slug;
      })
      .slice(0, 20); // Show only 20 most recent galleries

    console.log('Processed galleries (first 20):', processedGalleries.length);
    console.log('First few galleries:', processedGalleries.slice(0, 3).map(g => ({ name: g.name, slug: g.slug })));

    return processedGalleries;
  }, [galleries]);

  // Update currentIndex when validGalleries changes
  useEffect(() => {
    if (validGalleries.length > 0) {
      setCurrentIndex(Math.floor(validGalleries.length / 2));
    }
  }, [validGalleries.length]);

  const handlePrev = useCallback(() => {
    const total = validGalleries.length;
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [validGalleries.length]);

  const handleNext = useCallback(() => {
    const total = validGalleries.length;
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [validGalleries.length]);

  const getSlideStyle = useCallback((index) => {
    const total = validGalleries.length || 6;
    const angle = (360 / total) * (index - currentIndex);
    const radius = 700;
    const translateZ = -radius;
    const rotateY = angle;
    const opacity = Math.abs(angle) > 90 ? 0 : 1 - Math.abs(angle) / 120;
    const scale = 1 - Math.abs(angle) / 180;

    console.log(`Slide ${index}: Angle=${angle.toFixed(2)}, Opacity=${opacity.toFixed(2)}, Scale=${scale.toFixed(2)}`);

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
  }, [validGalleries.length, currentIndex]);

  // Memoize the slide styles to prevent re-renders
  const slideStyles = useMemo(() => {
    const total = validGalleries.length;
    return Array.from({ length: total }, (_, index) => getSlideStyle(index));
  }, [validGalleries.length, currentIndex, getSlideStyle]);

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = "/placeholder.jpeg";
    e.target.onerror = null; // Prevent infinite loop
  };

  // Handle image load
  const handleImageLoad = (e) => {
    e.target.onerror = null; // Clear error handler on successful load
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading galleries...</p>
          </div>
        </div>
      </section>
    );
  }

  if (validGalleries.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🏛️</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Newly Added Galleries</h2>
            <p className="text-gray-600">No galleries have been added yet. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            🎨 Community Galleries
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Newly Added Galleries</h2>
          <p className="text-gray-900 text-lg mt-2">Discover galleries created by our community</p>
        </div>

        {/* 3D Carousel */}
        <div className="relative h-[600px] mb-12">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Container */}
          <div className="relative w-full h-full perspective-1000">
            <div className="relative w-full h-full transform-style-preserve-3d">
              {validGalleries.map((gallery, index) => (
                <div
                  key={gallery._id}
                  className="absolute w-[400px] h-[500px] cursor-pointer"
                  style={slideStyles[index]}
                >
                  <Link href={`/user-gallery/${gallery.slug}`} className="block h-full">
                    <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
                      {/* Gallery Image */}
                      <div className="relative h-[300px] overflow-hidden">
                        <Image
                          src={gallery.profileImage}
                          alt={gallery.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="transition-transform duration-300 hover:scale-105"
                          onError={handleImageError}
                          onLoad={handleImageLoad}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        
                        {/* Community Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                            🎨 Community Gallery
                          </span>
                        </div>

                        {/* Stats Overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex justify-between items-center text-white text-sm">
                              <div className="flex items-center gap-1">
                                <span>🖼️</span>
                                <span>{gallery.artworks?.length || 0} Artworks</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>📍</span>
                                <span>{gallery.city}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gallery Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {gallery.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <span className="text-sm">{gallery.city}</span>
                        </div>
                        {gallery.description && (
                          <p className="text-gray-600 text-sm line-clamp-3">
                            {gallery.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/user-galleries"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300 font-medium"
          >
            View All Newly Added Galleries
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
} 