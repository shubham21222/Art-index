'use client';

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ContactModal from '../../components/ContactModal';
import { MapPin, Palette, Eye, Heart, Share2, ShoppingCart, Star, ArrowLeft, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';

export default function ArtworkPage({ params }) {
  const { slug } = use(params);
  const [artwork, setArtwork] = useState(null);
  const [relatedArtworks, setRelatedArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [globalPricing, setGlobalPricing] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch artwork data from Algolia using slug
  const fetchArtworkData = async (slug) => {
    try {
      const response = await fetch('/api/algolia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analytics: false,
          analyticsTags: ["web"],
          clickAnalytics: true,
          enablePersonalization: false,
          facetingAfterDistinct: true,
          facets: "*",
          hitsPerPage: 25,
          page: 0,
          query: slug
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.hits?.find(hit => hit.slug === slug) || data.hits?.[0] || null;
    } catch (error) {
      console.error('Error fetching artwork data:', error);
      toast.error('Failed to load artwork data. Please try again.');
      return null;
    }
  };

  // Fetch related artworks by same artist
  const fetchRelatedArtworks = async (artistId, currentArtworkId) => {
    try {
      const response = await fetch('/api/algolia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analytics: false,
          analyticsTags: ["web"],
          clickAnalytics: true,
          enablePersonalization: false,
          facetingAfterDistinct: true,
          facets: "*",
          hitsPerPage: 8,
          page: 0,
          query: artistId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.hits?.filter(hit => hit.artId.toString() !== currentArtworkId) || [];
    } catch (error) {
      console.error('Error fetching related artworks:', error);
      toast.error('Failed to load related artworks.');
      return [];
    }
  };

  // Helper function to format adjusted price from our API
  const formatAdjustedPrice = (pricingData) => {
    if (!pricingData) return null;

    if (pricingData.adjustedPriceType === "Money") {
      return `$${(pricingData.adjustedPrice / 100).toLocaleString()}`;
    } else if (pricingData.adjustedPriceType === "PriceRange") {
      const minPrice = (pricingData.adjustedMinPrice / 100).toLocaleString();
      const maxPrice = (pricingData.adjustedMaxPrice / 100).toLocaleString();
      return `$${minPrice} - $${maxPrice}`;
    }

    return null;
  };

  // Helper function to get the original price
  const getOriginalPrice = () => {
    if (artwork?.geo_prices?.US) {
      return formatPrice(artwork.geo_prices);
    }
    return "Price Unavailable";
  };

  // Helper function to get the estimate price (adjusted)
  const getEstimatePrice = () => {
    if (globalPricing?.globalAdjustmentApplied) {
      return formatAdjustedPrice(globalPricing);
    }
    return getOriginalPrice(); // Fallback to original if no adjustment
  };

  // Helper function to get the price display format
  const getPriceDisplay = () => {
    const originalPrice = getOriginalPrice();
    const estimatePrice = getEstimatePrice();

    if (globalPricing?.globalAdjustmentApplied) {
      return {
        original: originalPrice,
        estimate: estimatePrice,
        hasAdjustment: true,
        adjustmentPercentage: globalPricing.adjustmentPercentage,
      };
    } else {
      return {
        original: originalPrice,
        estimate: originalPrice,
        hasAdjustment: false,
        adjustmentPercentage: 0,
      };
    }
  };

  // Helper function to get numeric price for comparison
  const getNumericPrice = () => {
    const priceDisplay = getPriceDisplay();
    const priceString = priceDisplay.estimate || priceDisplay.original;
    
    if (priceString === "Price Unavailable") return null;
    
    // Extract numeric value from price string (e.g., "$1,000" -> 1000)
    const numericMatch = priceString.replace(/[$,]/g, '').match(/\d+/);
    return numericMatch ? parseInt(numericMatch[0]) : null;
  };

  // Check if price is available
  const isPriceAvailable = () => {
    return getNumericPrice() !== null;
  };

  // Format price
  const formatPrice = (geoPrices) => {
    if (!geoPrices) return 'Price on request';
    
    const usPrice = geoPrices.US;
    const firstPrice = Object.values(geoPrices)[0];
    const price = usPrice || firstPrice;
    
    if (!price) return 'Price on request';
    
    const priceInDollars = price / 100;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceInDollars);
  };

  // Format print price
  const formatPrintPrice = (minPrintPrice) => {
    if (!minPrintPrice) return 'Print price on request';
    
    const priceInDollars = minPrintPrice / 100;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceInDollars);
  };

  // Fetch global pricing adjustment from admin system
  const fetchGlobalPricing = async (artworkData) => {
    try {
      // Get the original price from artwork data
      const originalPrice = artworkData.geo_prices?.US ? artworkData.geo_prices.US : null;
      
      if (!originalPrice) {
        console.log("No original price available for adjustment");
        return null;
      }

      const originalPriceType = "Money";
      const originalMinPrice = null;
      const originalMaxPrice = null;

      console.log("Fetching adjusted pricing...");
      console.log("Request payload:", {
        originalPrice,
        originalPriceType,
        originalMinPrice,
        originalMaxPrice,
        category: artworkData.category,
        artistName: artworkData.full_name,
        artworkId: artworkData.artId,
      });

      const adjustedPricingResponse = await fetch("/api/artwork-pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalPrice,
          originalPriceType,
          originalMinPrice,
          originalMaxPrice,
          category: artworkData.category,
          artistName: artworkData.full_name,
          artworkId: artworkData.artId,
        }),
      });

      console.log("Adjusted pricing response status:", adjustedPricingResponse.status);
      const adjustedPricingResult = await adjustedPricingResponse.json();
      console.log("Adjusted pricing response:", adjustedPricingResult);

      if (adjustedPricingResult.success && adjustedPricingResult.items) {
        console.log("Adjusted Pricing Data Fetched:", adjustedPricingResult.items);
        return adjustedPricingResult.items;
      } else if (adjustedPricingResult.status && adjustedPricingResult.items) {
        // Fallback for different response structure
        console.log("Using fallback response structure");
        return adjustedPricingResult.items;
      } else {
        console.log("Adjusted pricing not successful:", adjustedPricingResult);
        return null;
      }
    } catch (error) {
      console.error("Error fetching adjusted pricing:", error);
      toast.error('Failed to load price estimates.');
      return null;
    }
  };

  // Handle contact form submission
  const handleContactSubmit = async (formData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          itemName: artwork?.artwork_title || 'Artwork Inquiry',
          artwork: {
            title: artwork?.artwork_title,
            id: artwork?.artId,
            artistNames: artwork?.full_name,
            slug: artwork?.slug,
            image_url: artwork?.image_url,
            price: artwork?.geo_prices?.US ? artwork.geo_prices.US / 100 : null,
          },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send inquiry');
      }

      // Check if this is a new user (account was created)
      if (data.message && data.message.includes('check your email')) {
        toast.success("Inquiry sent successfully! Please check your email to complete your account setup.", {
          duration: 6000, // Show for 6 seconds
        });
      } else {
        toast.success("Inquiry sent successfully! We'll get back to you soon.");
      }

      setIsContactModalOpen(false);
      return data;
    } catch (error) {
      toast.error(error.message || 'Failed to send inquiry. Please try again.');
      throw error;
    }
  };

  // Handle favorite artwork
  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (!isFavorited) {
      toast.success('Added to favorites!');
    } else {
      toast.success('Removed from favorites!');
    }
  };

  // Handle share artwork
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: artwork?.artwork_title || 'Artwork',
          text: `Check out this amazing artwork: ${artwork?.artwork_title} by ${artwork?.full_name}`,
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share. Please try again.');
    }
  };

  // Handle view in room
  const handleViewInRoom = () => {
    toast.info('View in Room feature coming soon!');
  };

  // Handle make an offer
  const handleMakeOffer = () => {
    setIsContactModalOpen(true);
    toast.info('Opening inquiry form for your offer...');
  };

  // Load artwork data
  useEffect(() => {
    const loadArtworkData = async () => {
      setLoading(true);
      setError(null);

      try {
        const artworkData = await fetchArtworkData(slug);

        if (artworkData) {
          setArtwork(artworkData);
          setRelatedArtworks(await fetchRelatedArtworks(artworkData.id_user, artworkData.artId));
          
          // Fetch global pricing adjustment
          const pricing = await fetchGlobalPricing(artworkData);
          setGlobalPricing(pricing);
          
          toast.success('Artwork loaded successfully!');
        } else {
          setError('Artwork not found');
          toast.error('Artwork not found. Please check the URL and try again.');
        }
      } catch (error) {
        console.error('Error loading artwork:', error);
        setError('Failed to load artwork data');
        toast.error('Failed to load artwork data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadArtworkData();
  }, [slug]);

  // Debug useEffect to monitor pricing state changes
  useEffect(() => {
    console.log("Pricing state changed:", globalPricing);
    if (globalPricing) {
      console.log("Global pricing available:", globalPricing);
      console.log("Global adjustment applied:", globalPricing.globalAdjustmentApplied);
    }
  }, [globalPricing]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="w-full h-96" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !artwork) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artwork Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The artwork you are looking for does not exist.'}</p>
            <Link href="/artists">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Artworks
              </Button>
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link href="/artists" className="text-blue-600 hover:text-blue-800 flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Artworks
            </Link>
          </nav>

          {/* Main Artwork Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Artwork Image */}
            <div className="relative">
              <div className="relative w-full h-96 lg:h-[600px] overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={artwork.image_url || '/placeholder.jpeg'}
                  alt={artwork.artwork_title || 'Artwork'}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder.jpeg';
                  }}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center mt-4 space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleFavorite}
                  className={isFavorited ? 'bg-red-50 border-red-200 text-red-600' : ''}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Favorited' : 'Favorite'}
                </Button>
                {/* <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button> */}
                {/* <Button variant="outline" size="sm" onClick={handleViewInRoom}>
                  <Eye className="w-4 h-4 mr-2" />
                  View in Room
                </Button> */}
              </div>
            </div>

            {/* Artwork Details */}
            <div className="space-y-6">
              {/* Title and Artist */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {artwork.artwork_title}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  by {artwork.full_name}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {artwork.city}, {artwork.country}
                </div>
              </div>

              {/* Price Section */}
             

              {/* Price Estimate Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Price Estimate
                      </h3>
                      <p className="text-sm text-gray-600">
                        Current market valuation
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    {getPriceDisplay().hasAdjustment ? (  
                      <div className="flex justify-center items-center gap-2">
                        <div className="text-2xl font-bold text-gray-900">
                          {getPriceDisplay().original}
                        </div>
                        <span className="text-2xl font-bold text-gray-900">-</span>
                        <div className="text-2xl font-bold text-gray-900">
                          {getPriceDisplay().estimate}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-gray-900">
                          {getPriceDisplay().original}
                        </div>
                        <p className="text-sm text-gray-500">
                          List Price
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Adjustment Section */}
              {/* {globalPricing && globalPricing.globalAdjustmentApplied && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Adjusted Price</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {getEstimatePrice()}
                        </p>
                        {globalPricing.adjustmentPercentage && (
                          <p className="text-xs text-gray-500">
                            {globalPricing.adjustmentPercentage > 0 ? '+' : ''}{globalPricing.adjustmentPercentage}% global adjustment
                          </p>
                        )}
                        {globalPricing.adjustmentReason && (
                          <p className="text-xs text-gray-500">
                            Reason: {globalPricing.adjustmentReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )} */}

              {/* Artwork Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Artwork Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{artwork.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medium:</span>
                      <span className="font-medium">{artwork.mediums?.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Style:</span>
                      <span className="font-medium">{artwork.styles?.join(', ')}</span>
                    </div>
                    {artwork.subject && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subject:</span>
                        <span className="font-medium">{artwork.subject}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="font-medium">
                        {artwork.width} × {artwork.height} × {artwork.depth} cm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium capitalize">{artwork.size}</span>
                    </div>
                    {artwork.materials && artwork.materials.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Materials:</span>
                        <span className="font-medium">{artwork.materials.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Keywords */}
              {artwork.keywords && artwork.keywords.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {artwork.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  onClick={() => setIsContactModalOpen(true)}
                  className="bg-black text-white hover:bg-gray-800 w-full text-base sm:text-lg font-semibold py-4 sm:py-3 px-6 sm:px-8 rounded-2xl shadow-lg text-center transition-all duration-200"
                >
                  Contact - {getPriceDisplay().hasAdjustment ? getPriceDisplay().estimate : getPriceDisplay().original}
                </Button>
                
                {isPriceAvailable() && (
                  <Button
                    onClick={handleMakeOffer}
                    className="bg-blue-600 text-white hover:bg-blue-700 w-full text-base sm:text-lg font-semibold py-4 sm:py-3 px-6 sm:px-8 rounded-2xl shadow-lg text-center transition-all duration-200"
                  >
                    Make an Offer
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Related Artworks */}
          {relatedArtworks.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">More by {artwork.full_name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedArtworks.slice(0, 4).map((relatedArtwork) => (
                  <Link href={`/art/${relatedArtwork.slug || `artwork-${relatedArtwork.artId}`}`} key={relatedArtwork.objectID}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                      <div className="relative w-full h-48 overflow-hidden">
                        <Image
                          src={relatedArtwork.image_url || '/placeholder.jpeg'}
                          alt={relatedArtwork.artwork_title || 'Artwork'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white text-gray-900 font-semibold">
                            {formatPrice(relatedArtwork.geo_prices)}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                          {relatedArtwork.artwork_title}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {relatedArtwork.width} × {relatedArtwork.height} cm
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        artwork={{
          title: artwork?.artwork_title,
          id: artwork?.artId,
          artistNames: artwork?.full_name,
        }}
        onSubmit={handleContactSubmit}
      />
      
      <Footer />
    </>
  );
} 