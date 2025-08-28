'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, Globe, ArrowLeft, X, Heart, Share2, Eye, Star, Tag, Info, DollarSign, MapPinIcon, Palette, Ruler, Calendar } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ContactModal from '@/app/components/ContactModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function UserGalleryPage({ params }) {
  const { slug } = params;
  const [galleryData, setGalleryData] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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

  // Handle artwork click to open modal
  const handleArtworkClick = (artwork) => {
    setSelectedArtwork(artwork);
    setIsArtworkModalOpen(true);
  };

  // Handle contact button click
  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  // Handle contact modal close
  const handleContactClose = () => {
    setIsContactModalOpen(false);
  };

  // Handle artwork modal close
  const handleArtworkModalClose = () => {
    setIsArtworkModalOpen(false);
    setSelectedArtwork(null);
  };

  // Handle share artwork
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedArtwork?.title || 'Artwork',
        text: `Check out this artwork: ${selectedArtwork?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
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
          {/* <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            🎨 Community Gallery
          </div> */}
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
                  onClick={() => handleArtworkClick(artwork)}
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

      {/* Artwork Modal */}
      <Dialog open={isArtworkModalOpen} onOpenChange={handleArtworkModalClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArtwork && (
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedArtwork.title}</h2>
                <button
                  onClick={handleArtworkModalClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Artwork Image */}
              <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-gray-100">
                {selectedArtwork.images && selectedArtwork.images.length > 0 ? (
                  <Image
                    src={getImageSrc(selectedArtwork.images[0])}
                    alt={selectedArtwork.title}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-lg"
                    onError={handleImageError}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  />
                ) : (
                  <ImagePlaceholder type="artwork" className="rounded-lg" />
                )}
              </div>

              {/* Artwork Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Artwork Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedArtwork.title}</h3>
                    {selectedArtwork.artist && (
                      <p className="text-lg text-gray-600">
                        by {typeof selectedArtwork.artist === 'string' ? selectedArtwork.artist : selectedArtwork.artist.name}
                      </p>
                    )}
                  </div>

                  {/* Artwork Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedArtwork.category && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{selectedArtwork.category}</span>
                      </div>
                    )}
                    {selectedArtwork.medium && (
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{selectedArtwork.medium}</span>
                      </div>
                    )}
                    {selectedArtwork.dimensions && selectedArtwork.dimensions.displayText && (
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{selectedArtwork.dimensions.displayText}</span>
                      </div>
                    )}
                    {selectedArtwork.date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{selectedArtwork.date}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {selectedArtwork.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedArtwork.description}</p>
                    </div>
                  )}

                  {/* Additional Info */}
                  {selectedArtwork.additionalInfo && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedArtwork.additionalInfo}</p>
                    </div>
                  )}
                </div>

                {/* Right Column - Pricing and Actions */}
                <div className="space-y-6">
                  {/* Pricing */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Pricing</h4>
                    {selectedArtwork.price ? (
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-600">
                          ${selectedArtwork.price.min}
                          {selectedArtwork.price.max && ` - $${selectedArtwork.price.max}`}
                        </div>
                        <p className="text-sm text-gray-600">
                          {selectedArtwork.price.currency || 'USD'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Contact for pricing</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleContactClick}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Contact for Price
                    </Button>
                    
                    {/* <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleShare}
                        className="flex-1"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div> */}
                  </div>

                  {/* Condition Info */}
                  {selectedArtwork.condition && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Condition</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Framed: {selectedArtwork.condition.framed ? 'Yes' : 'No'}</div>
                        <div>Signature: {selectedArtwork.condition.signature}</div>
                        {selectedArtwork.condition.certificateOfAuthenticity && (
                          <div>Certificate of Authenticity: Yes</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={handleContactClose}
        artwork={selectedArtwork}
      />

      <Footer />
    </>
  );
} 