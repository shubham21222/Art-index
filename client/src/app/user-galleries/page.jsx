'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Palette, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function UserGalleriesPage() {
  const [galleries, setGalleries] = useState([]);
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api';
        const response = await fetch(`${apiUrl}/gallery/all`);
        const data = await response.json();
        
        if (data.status && data.items) {
          setGalleries(data.items);
          setFilteredGalleries(data.items);
        }
      } catch (error) {
        console.error('Error fetching galleries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  // Filter galleries based on search term and category
  useEffect(() => {
    let filtered = galleries;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(gallery =>
        gallery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gallery.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gallery.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gallery.contact?.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(gallery =>
        gallery.categories?.some(cat => 
          cat.name?.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }

    setFilteredGalleries(filtered);
  }, [searchTerm, selectedCategory, galleries]);

  // Get unique categories from galleries
  const categories = React.useMemo(() => {
    const allCategories = galleries.flatMap(gallery => 
      gallery.categories?.map(cat => cat.name) || []
    );
    return ['all', ...Array.from(new Set(allCategories))];
  }, [galleries]);

  const handleImageError = (e) => {
    e.target.src = "/placeholder.jpeg";
    e.target.onerror = null;
  };

  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) &&
           !url.includes('example.com') &&
           !url.includes('placeholder.com') &&
           !url.includes('dummy.com');
  };

  const getImageSrc = (url, fallback = "/placeholder.jpeg") => {
    return isValidImageUrl(url) ? url : fallback;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading galleries...</p>
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
        <div className="text-center mb-12">
          {/* <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            🎨 Community Galleries
          </div> */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">
            Newly Added Galleries
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover galleries created by our community. Explore unique collections and exhibitions from passionate art enthusiasts.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search galleries by name, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredGalleries.length} of {galleries.length} galleries
            </div>
          </div>
        </div>

        {/* Galleries Grid */}
        {filteredGalleries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGalleries.map((gallery) => (
              <Link 
                key={gallery._id} 
                href={`/user-gallery/${gallery.slug}`}
                className="group block"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 h-full">
                  {/* Gallery Image */}
                  <div className="relative h-[250px] overflow-hidden">
                    <Image
                      src={getImageSrc(gallery.profileImage)}
                      alt={gallery.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-105 transition-transform duration-300"
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Community Badge */}
                    {/* <div className="absolute top-4 left-4">
                      <Badge className="bg-purple-600 text-white">
                        🎨 Community Gallery
                      </Badge>
                    </div> */}

                    {/* Stats Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex justify-between items-center text-white text-sm">
                        <div className="flex items-center gap-1">
                          <Palette className="w-4 h-4" />
                          <span>{gallery.artworks?.length || 0} Artworks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{gallery.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-purple-600 transition-colors">
                      {gallery.name}
                    </h3>
                    
                    {gallery.city && (
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{gallery.city}</span>
                      </div>
                    )}

                    {gallery.description && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {gallery.description}
                      </p>
                    )}

                    {/* Categories */}
                    {gallery.categories && gallery.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {gallery.categories.slice(0, 3).map((category, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {category.name}
                          </Badge>
                        ))}
                        {gallery.categories.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{gallery.categories.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No galleries found' : 'No galleries yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search criteria or browse all galleries.' 
                : 'Be the first to create a gallery in our community!'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Stats Section */}
        <section className="mt-20 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Statistics</h2>
            <p className="text-gray-600">Overview of our growing gallery community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {galleries.length}
              </div>
              <div className="text-gray-600">Total Galleries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {galleries.reduce((acc, gallery) => acc + (gallery.artworks?.length || 0), 0)}
              </div>
              <div className="text-gray-600">Total Artworks</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {galleries.reduce((acc, gallery) => {
                  const artists = new Set();
                  gallery.artworks?.forEach(artwork => {
                    if (artwork.artist) artists.add(artwork.artist);
                  });
                  return acc + artists.size;
                }, 0)}
              </div>
              <div className="text-gray-600">Total Artists</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {categories.length - 1}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 