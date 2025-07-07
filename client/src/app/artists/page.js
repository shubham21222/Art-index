'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Search, Filter, MapPin, DollarSign, Palette, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Algolia API configuration
const ALGOLIA_CONFIG = {
  url: 'https://b0ml7g848r-dsn.algolia.net/1/indexes/production_all_artworks/query',
  headers: {
    'x-algolia-agent': 'Algolia for JavaScript (3.35.1); Browser',
    'x-algolia-application-id': 'B0ML7G848R',
    'x-algolia-api-key': 'f9325566b566be56c6896db6c90a8eab',
    'Content-Type': 'application/json'
  }
};

export default function ArtistsPage() {
  const [artworks, setArtworks] = useState([]);
  const [allArtworks, setAllArtworks] = useState([]); // Store all artworks for filter options
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedMedium, setSelectedMedium] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Get unique values for filters from all artworks (not just current filtered results)
  const categories = [...new Set(allArtworks.map(art => art.category).filter(Boolean))].sort();
  const styles = [...new Set(allArtworks.flatMap(art => art.styles || []).filter(Boolean))].sort();
  const mediums = [...new Set(allArtworks.flatMap(art => art.mediums || []).filter(Boolean))].sort();

  // Fetch artworks from Algolia API via proxy
  const fetchArtworks = useCallback(async (pageNum = 0, append = false) => {
    try {
      const loadingState = pageNum === 0 ? setLoading : setLoadingMore;
      loadingState(true);

      // Base payload matching Python code
      const payload = {
        analytics: true,
        analyticsTags: ["web"],
        clickAnalytics: true,
        enablePersonalization: false,
        facetingAfterDistinct: true,
        facets: "*",
        filters: "(has_prints:\"true\")",
        hitsPerPage: 20,
        page: pageNum,
        query: searchTerm,
        userToken: "vc_eond94ta93"
      };

      // Add category filter
      if (selectedCategory !== 'all') {
        payload.filters += ` AND (category:"${selectedCategory}")`;
      }

      // Add style filter
      if (selectedStyle !== 'all') {
        payload.filters += ` AND (styles:"${selectedStyle}")`;
      }

      // Add medium filter
      if (selectedMedium !== 'all') {
        payload.filters += ` AND (mediums:"${selectedMedium}")`;
      }

      console.log('Fetching artworks with payload:', payload);

      const response = await fetch('/api/algolia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Algolia response:', data);
      
      if (!data.hits) {
        console.error('No hits in response:', data);
        setArtworks([]);
        setHasMore(false);
        return;
      }
      
      if (append) {
        setArtworks(prev => [...prev, ...data.hits]);
      } else {
        setArtworks(data.hits);
      }
      
      setHasMore(data.hits.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      setArtworks([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, selectedCategory, selectedStyle, selectedMedium]);

  // Fetch all artworks for filter options (without any filters)
  const fetchAllArtworksForFilters = useCallback(async () => {
    try {
      const payload = {
        analytics: true,
        analyticsTags: ["web"],
        clickAnalytics: true,
        enablePersonalization: false,
        facetingAfterDistinct: true,
        facets: "*",
        filters: "(has_prints:\"true\")",
        hitsPerPage: 1000, // Get a large number to have all categories
        page: 0,
        query: "",
        userToken: "vc_eond94ta93"
      };

      const response = await fetch('/api/algolia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.hits) {
        setAllArtworks(data.hits);
      }
    } catch (error) {
      console.error('Error fetching all artworks for filters:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllArtworksForFilters(); // Load all artworks for filter options
    fetchArtworks(0, false);
  }, [fetchAllArtworksForFilters, fetchArtworks]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
      setLoadingMore(true);
      fetchArtworks(page + 1, true);
    }
  }, [loadingMore, hasMore, page, fetchArtworks]);

  // Add scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStyle('all');
    setSelectedMedium('all');
    setSortBy('relevance');
  };

  // Format price from geo_prices object (matching Python code structure)
  const formatPrice = (geoPrices) => {
    if (!geoPrices) return 'Price on request';
    
    // Get US price as default, fallback to first available price
    const usPrice = geoPrices.US;
    const firstPrice = Object.values(geoPrices)[0];
    const price = usPrice || firstPrice;
    
    if (!price) return 'Price on request';
    
    // Divide by 100 to match Python code structure
    const priceInDollars = price / 100;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceInDollars);
  };

  // Format print price (matching Python code structure)
  const formatPrintPrice = (minPrintPrice) => {
    if (!minPrintPrice) return 'Print price on request';
    
    // Divide by 100 to match Python code structure
    const priceInDollars = minPrintPrice / 100;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceInDollars);
  };

  // Get dominant color
  const getDominantColor = (color) => {
    if (!color) return '#f3f4f6';
    return color;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Artworks</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore thousands of original artworks from talented artists around the world
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6 space-y-4">
              {/* Search Bar */}
              <div className="relative z-30">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search artworks by title, artist, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-40">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="all">All Styles</SelectItem>
                    {styles.map(style => (
                      <SelectItem key={style} value={style}>{style}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedMedium} onValueChange={setSelectedMedium}>
                  <SelectTrigger>
                    <SelectValue placeholder="Medium" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="all">All Mediums</SelectItem>
                    {mediums.map(medium => (
                      <SelectItem key={medium} value={medium}>{medium}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>



              {/* Results Count */}
              <div className="text-center text-sm text-gray-600">
                Showing {artworks.length} artworks
                {hasMore && ' (scroll for more)'}
              </div>
            </CardContent>
          </Card>

          {/* Artworks Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="w-full h-64" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : artworks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {artworks.map((artwork) => (
                  <Link href={`/art/${artwork.slug || `artwork-${artwork.artId}`}`} key={artwork.objectID}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                      {/* Artwork Image */}
                      <div className="relative w-full h-64 overflow-hidden">
                        <Image
                          src={artwork.image_url || '/placeholder.jpeg'}
                          alt={artwork.artwork_title || 'Artwork'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/placeholder.jpeg';
                          }}
                        />
                        {/* Overlay with quick info */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        {/* Price badge */}
                        {/* <div className="absolute top-2 right-2">
                          <Badge className="bg-white text-gray-900 font-semibold">
                            {formatPrice(artwork.geo_prices)}
                          </Badge>
                        </div> */}
                        {/* Size badge */}
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="text-xs">
                            {artwork.width || 'N/A'}×{artwork.height || 'N/A'}cm
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        {/* Artist Name */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                          {artwork.full_name || 'Unknown Artist'}
                        </h3>
                        
                        {/* Artwork Title */}
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                          &ldquo;{artwork.artwork_title || 'Untitled'}&rdquo;
                        </p>

                        {/* Location */}
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          {artwork.city || 'Unknown'}, {artwork.country || 'Unknown'}
                        </div>

                        {/* Medium and Style */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {artwork.mediums?.slice(0, 2).map((medium, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <Palette className="w-3 h-3 mr-1" />
                              {medium}
                            </Badge>
                          ))}
                          {artwork.styles?.slice(0, 1).map((style, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {style}
                            </Badge>
                          ))}
                        </div>

                        {/* Subject and Materials */}
                        {artwork.subject && (
                          <div className="text-xs text-gray-500 mb-2">
                            Subject: {artwork.subject}
                          </div>
                        )}
                        {artwork.materials && artwork.materials.length > 0 && (
                          <div className="text-xs text-gray-500 mb-2">
                            Materials: {artwork.materials.join(', ')}
                          </div>
                        )}

                        {/* Price */}
                        {/* <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(artwork.geo_prices)}
                            </span>
                            {artwork.min_print_price && (
                              <div className="text-xs text-gray-500">
                                Print from {formatPrintPrice(artwork.min_print_price)}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {artwork.category || 'Art'}
                          </Badge>
                        </div> */}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading more artworks...</span>
                  </div>
                </div>
              )}

              {/* No More Results */}
              {!hasMore && artworks.length > 0 && (
                <div className="text-center mt-8 text-gray-500">
                  No more artworks to load
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 text-lg">No artworks found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
