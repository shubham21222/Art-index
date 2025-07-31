'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, Globe, ArrowLeft } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function UserGalleryPage({ params }) {
  const { slug } = params;
  const [galleryData, setGalleryData] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user gallery data from the correct server API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api';
        const userGalleryResponse = await fetch(`${apiUrl}/gallery/all`);
        const userGalleryData = await userGalleryResponse.json();
        
        if (!userGalleryData.status || !userGalleryData.items) {
          throw new Error('Invalid response format from server');
        }
        
        // Find the user gallery by slug
        const userGallery = userGalleryData.items?.find(g => {
          const gallerySlug = g.slug || g.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return gallerySlug === slug;
        });
        
        if (userGallery) {
          console.log('🎨 Found user gallery:', userGallery.title);
          setGalleryData(userGallery);
          setArtworks(userGallery.artworks || []);
        } else {
          console.log('🎨 User gallery not found');
          setError('Gallery not found');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch gallery data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = "/placeholder.jpeg";
    e.target.onerror = null; // Prevent infinite loop
  };

  // Check if image URL is valid
  const isValidImageUrl = (url) => {
    if (!url) return false;
    if (url === "/placeholder.jpeg") return true;
    if (url.startsWith('data:')) return true;
    if (url.startsWith('blob:')) return true;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Check if it's a real image URL, not a placeholder
      return !url.includes('example.com') && !url.includes('placeholder');
    }
    return url.startsWith('/');
  };

  // Get image source with fallback
  const getImageSrc = (url, fallback = "/placeholder.jpeg") => {
    return isValidImageUrl(url) ? url : fallback;
  };

  // Placeholder component for missing images
  const ImagePlaceholder = ({ type = "artwork", className = "" }) => (
    <div className={`w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center ${className}`}>
      <span className="text-4xl mb-2">
        {type === "artwork" ? "🖼️" : "🎨"}
      </span>
      <span className="text-xs text-gray-500 text-center px-2">
        {type === "artwork" ? "Image not available" : "Gallery image not available"}
      </span>
    </div>
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading gallery information...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Gallery Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link 
              href="/galleries" 
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Galleries
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/galleries" 
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Galleries
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            🎨 Community Gallery
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black bg-clip-text">
            {galleryData?.title || slug.replace(/-/g, ' ').split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </h1>
          {galleryData?.description && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              {galleryData.description}
            </p>
          )}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our curated collection of artworks
          </p>
        </div>

        {/* Gallery Info Section */}
        {galleryData && (
          <section className="mb-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Gallery Image */}
                <div className="relative h-[400px] rounded-xl overflow-hidden">
                  {galleryData.images && galleryData.images.length > 0 && isValidImageUrl(galleryData.images[0]) ? (
                    <Image
                      src={getImageSrc(galleryData.images[0])}
                      alt={galleryData.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-xl"
                      onError={handleImageError}
                    />
                  ) : (
                    <ImagePlaceholder type="gallery" className="rounded-xl" />
                  )}
                </div>
                
                {/* Gallery Details */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About {galleryData.title}</h2>
                    <p className="text-gray-600 leading-relaxed">
                      {galleryData.description}
                    </p>
                  </div>
                  
                  {/* Category Information */}
                  {galleryData.categoryName && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Category</h3>
                      <div className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {galleryData.categoryName}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Artworks Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Artwork Collection</h2>
            <p className="text-xl text-gray-600">
              {artworks.length > 0 
                ? `Explore ${artworks.length} artworks in our collection` 
                : "No artworks in the collection yet"
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {artworks.length > 0 ? (
              artworks.map((artwork, index) => (
                <div 
                  key={artwork._id || `artwork-${index}`} 
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                    <div className="relative w-full h-[280px] overflow-hidden">
                      {artwork.images && artwork.images.length > 0 ? (
                        <Image
                          src={getImageSrc(artwork.images[0])}
                          alt={artwork.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="group-hover:scale-105 transition-transform duration-300"
                          onError={handleImageError}
                        />
                      ) : (
                        <ImagePlaceholder type="artwork" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {artwork.title}
                      </h3>
                      {artwork.artist && (
                        <div className="text-sm text-gray-600 mb-2">
                          {typeof artwork.artist === 'string' ? artwork.artist : artwork.artist.name}
                        </div>
                      )}
                      {artwork.category && (
                        <div className="text-xs text-gray-500 mb-1 flex items-center">
                          <span className="mr-1">🎨</span>
                          {artwork.category}
                        </div>
                      )}
                      {artwork.medium && (
                        <div className="text-xs text-gray-400 mb-1 flex items-center">
                          <span className="mr-1">🖼️</span>
                          {artwork.medium}
                        </div>
                      )}
                      {artwork.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                          {artwork.description}
                        </p>
                      )}
                      {artwork.price && (
                        <div className="text-xs text-green-600 mt-2 font-medium">
                          ${artwork.price.min} - ${artwork.price.max || 'Contact for price'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Artworks Yet</h3>
                <p className="text-gray-600">The collection is being curated. Check back soon for amazing artworks.</p>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Gallery Statistics</h2>
            <p className="text-gray-600">Overview of our collection</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {artworks.length}
              </div>
              <div className="text-gray-600">Artworks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {artworks.reduce((acc, artwork) => acc + (artwork.artist ? 1 : 0), 0)}
              </div>
              <div className="text-gray-600">Artists</div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 