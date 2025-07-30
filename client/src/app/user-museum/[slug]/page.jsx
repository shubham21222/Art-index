'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, Globe, ArrowLeft } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function UserMuseumPage({ params }) {
  const { slug } = params;
  const [museumData, setMuseumData] = useState(null);
  const [events, setEvents] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user museum data
        const userMuseumResponse = await fetch(`/api/user-museums`);
        const userMuseumData = await userMuseumResponse.json();
        
        // Find the user museum by slug
        const userMuseum = userMuseumData.museums?.find(m => m.slug === slug);
        
        if (userMuseum) {
          console.log('🏛️ Found user museum:', userMuseum.name);
          setMuseumData(userMuseum);
          setEvents(userMuseum.events || []);
          setArtworks(userMuseum.artworks || []);
        } else {
          console.log('🏛️ User museum not found');
          setError('Museum not found');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch museum data');
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
        {type === "artwork" ? "🖼️" : type === "event" ? "📅" : "🏛️"}
      </span>
      <span className="text-xs text-gray-500 text-center px-2">
        {type === "artwork" ? "Image not available" : type === "event" ? "Event image not available" : "Museum image not available"}
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
            <p className="mt-4 text-gray-600">Loading museum information...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Museum Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link 
              href="/institutions" 
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Institutions
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
            href="/institutions" 
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Institutions
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            🏛️ Community Museum
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-black bg-clip-text">
            {museumData?.name || slug.replace(/-/g, ' ').split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </h1>
          {museumData?.description && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              {museumData.description}
            </p>
          )}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the latest events and explore our curated collection of artworks
          </p>
        </div>

        {/* Museum Info Section */}
        {museumData && (
          <section className="mb-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Museum Image */}
                <div className="relative h-[400px] rounded-xl overflow-hidden">
                  {isValidImageUrl(museumData.profileImage) ? (
                    <Image
                      src={getImageSrc(museumData.profileImage)}
                      alt={museumData.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-xl"
                      onError={handleImageError}
                    />
                  ) : (
                    <ImagePlaceholder type="museum" className="rounded-xl" />
                  )}
                </div>
                
                {/* Museum Details */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About {museumData.name}</h2>
                    <p className="text-gray-600 leading-relaxed">
                      {museumData.description}
                    </p>
                  </div>
                  
                  {/* Contact Information */}
                  {museumData.contact && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                      <div className="space-y-3">
                        {museumData.contact.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-600">{museumData.contact.email}</span>
                          </div>
                        )}
                        {museumData.contact.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-600">{museumData.contact.phone}</span>
                          </div>
                        )}
                        {museumData.contact.address && (
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-600">{museumData.contact.address}</span>
                          </div>
                        )}
                        {museumData.contact.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-500" />
                            <a 
                              href={museumData.contact.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {museumData.contact.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Events Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Events & Exhibitions</h2>
            <p className="text-xl text-gray-600">
              {events.length > 0 
                ? `Discover ${events.length} upcoming and ongoing events` 
                : "No events scheduled at the moment"
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.length > 0 ? (
              events.map((event, index) => (
                <div key={event._id || `event-${index}`} className="group">
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                    <div className="relative w-full h-[250px] overflow-hidden">
                      {event.image ? (
                        <Image
                          src={getImageSrc(event.image)}
                          alt={event.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="group-hover:scale-105 transition-transform duration-300"
                          onError={handleImageError}
                        />
                      ) : (
                        <ImagePlaceholder type="event" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-purple-600 transition-colors">
                        {event.name}
                      </h3>
                      <div className="text-sm text-gray-600 mb-2 flex items-center">
                        <span className="mr-2">📅</span>
                        {new Date(event.startDate).toLocaleDateString()}
                        {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                      </div>
                      {event.location && (
                        <div className="text-xs text-gray-500 flex items-center">
                          <span className="mr-2">📍</span>
                          {event.location}
                        </div>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Yet</h3>
                <p className="text-gray-600">Check back later for upcoming events and exhibitions.</p>
              </div>
            )}
          </div>
        </section>

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
                <div key={artwork._id || `artwork-${index}`} className="group">
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
                        {artwork.name}
                      </h3>
                      {artwork.artist && (
                        <div className="text-sm text-gray-600 mb-2">
                          {artwork.artist}
                        </div>
                      )}
                      {artwork.year && (
                        <div className="text-xs text-gray-500 mb-1 flex items-center">
                          <span className="mr-1">📅</span>
                          {artwork.year}
                        </div>
                      )}
                      {artwork.medium && (
                        <div className="text-xs text-gray-400 mb-1 flex items-center">
                          <span className="mr-1">🎨</span>
                          {artwork.medium}
                        </div>
                      )}
                      {artwork.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                          {artwork.description}
                        </p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Museum Statistics</h2>
            <p className="text-gray-600">Overview of our collection and activities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {events.length}
              </div>
              <div className="text-gray-600">Events</div>
            </div>
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