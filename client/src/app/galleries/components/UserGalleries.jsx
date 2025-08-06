'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Image as ImageIcon, Calendar, ArrowRight } from 'lucide-react';

export default function UserGalleries() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch galleries data
  const fetchData = useCallback(async () => {
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
      console.log('Gallery API response:', data);
      
      if (data.status && data.items) {
        const newGalleries = data.items;
        console.log('Setting galleries:', newGalleries.length);
        setGalleries(newGalleries);
      } else {
        console.log('No valid data in response:', data);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Filter out galleries with invalid image URLs and limit to 8 most recent
  const validGalleries = useMemo(() => {
    console.log('🔍 Processing galleries - Total from API:', galleries.length);
    console.log('🔍 Raw galleries data:', galleries);

    const processedGalleries = galleries
      .map(gallery => {
        const processed = {
          ...gallery,
          name: gallery.title, // Map title to name
          profileImage: gallery.images && gallery.images.length > 0 && isValidImageUrl(gallery.images[0]) ? gallery.images[0] : "/placeholder.jpeg",
          slug: gallery.slug || gallery.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          city: gallery.city || "Unknown", // Assuming city might be available
        };
        console.log('🔍 Processed gallery:', processed);
        return processed;
      })
      .filter(gallery => {
        const isValid = gallery.name && gallery.slug;
        console.log('🔍 Gallery validation:', { name: gallery.name, slug: gallery.slug, isValid });
        return isValid;
      })
      .slice(0, 8); // Show only 8 galleries (2 rows of 4)

    console.log('✅ Final processed galleries:', processedGalleries.length);
    console.log('✅ First few galleries:', processedGalleries.slice(0, 3).map(g => ({ name: g.name, slug: g.slug })));

    return processedGalleries;
  }, [galleries]);

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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading galleries...</p>
          </div>
        </div>
      </section>
    );
  }

  if (validGalleries.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🏛️</div>
            <h2 className="text-3xl font-bold text-black mb-4">Newly Added Galleries</h2>
            <p className="text-gray-600">No galleries have been added yet. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-black text-white px-6 py-2 rounded-full text-sm font-medium mb-4 shadow-lg">
            🎨 Community Galleries
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Newly Added Galleries
          </h2>
          <p className="text-gray-600 text-lg mt-2 max-w-2xl mx-auto">
            Discover galleries created by our community in this section
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {validGalleries.map((gallery, index) => (
            <div
              key={gallery._id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-black transform hover:-translate-y-2"
            >
              <Link href={`/user-gallery/${gallery.slug}`} className="block h-full">
                {/* Gallery Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={gallery.profileImage}
                    alt={gallery.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 group-hover:scale-110"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Community Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-black text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                      🎨 Community
                    </span>
                  </div>

                  {/* Stats Overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2">
                      <div className="flex justify-between items-center text-white text-xs">
                        <div className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>{gallery.artworks?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{gallery.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 w-full">
                      <div className="flex items-center justify-between text-white">
                        <span className="text-sm font-medium">View Gallery</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gallery Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-black mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                    {gallery.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{gallery.city}</span>
                  </div>
                  
                  {gallery.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {gallery.description}
                    </p>
                  )}
                  
                  {/* Gallery Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-xs font-medium">{gallery.artworks?.length || 0} Artworks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-black fill-current" />
                      <span className="text-xs text-gray-500">New</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/user-galleries"
            className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View All Newly Added Galleries
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
} 