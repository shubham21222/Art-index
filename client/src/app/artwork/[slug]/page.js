"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ArtistCarousel from "./components/ArtistCarousel";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherWorks from "./components/OtherWorks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  Download,
  User,
  Eye,
  Star,
  Tag,
  Info,
  DollarSign,
  MapPin,
  Palette,
  Ruler,
  Calendar,
  X,
  AlertCircle,
} from "lucide-react";
import ContactModal from "@/app/components/ContactModal";
import LoginModal from "@/app/components/LoginModal";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function ArtworkPage() {
  const params = useParams();
  const slug = params?.slug;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerError, setOfferError] = useState("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  const { isAuthenticated, token, user } = useSelector((state) => state.auth);

  const [artwork, setArtwork] = useState(null);
  const [artist, setArtist] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pricingLoaded, setPricingLoaded] = useState(false);

  // Helper function to format price
  const formatPrice = (priceData) => {
    if (!priceData) return null;

    if (priceData.__typename === "Money") {
      return `$${(priceData.minor / 100).toLocaleString()}`;
    } else if (priceData.__typename === "PriceRange") {
      const minPrice = (priceData.minPrice.minor / 100).toLocaleString();
      const maxPrice = (priceData.maxPrice.minor / 100).toLocaleString();
      return `$${minPrice} - $${maxPrice}`;
    }

    return null;
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
    if (pricing?.listPrice) {
      return formatPrice(pricing.listPrice);
    }
    return "Price Unavailable";
  };

  // Helper function to get the estimate price (adjusted)
  const getEstimatePrice = () => {
    if (pricing?.adjustedPricing?.globalAdjustmentApplied) {
      return formatAdjustedPrice(pricing.adjustedPricing);
    }
    return getOriginalPrice(); // Fallback to original if no adjustment
  };

  // Helper function to get the price display format
  const getPriceDisplay = () => {
    const originalPrice = getOriginalPrice();
    const estimatePrice = getEstimatePrice();

    if (pricing?.adjustedPricing?.globalAdjustmentApplied) {
      return {
        original: originalPrice,
        estimate: estimatePrice,
        hasAdjustment: true,
        adjustmentPercentage: pricing.adjustedPricing.adjustmentPercentage,
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

  const handleMakeOffer = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      setIsOfferModalOpen(true);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setOfferError("");
    const numericPrice = getNumericPrice();
    const offerNumeric = parseFloat(offerAmount.replace(/[$,]/g, ''));
    if (!offerNumeric || offerNumeric <= 0) {
      setOfferError("Please enter a valid offer amount");
      return;
    }
    setIsSubmittingOffer(true);
    try {
      // Fetch product by title to get MongoDB _id
      const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/by-title?title=${encodeURIComponent(artwork.title)}`);
      const productData = await productRes.json();
      const productId = productData?.item?._id;
      // Prepare offer payload
      let offerPayload = {
        offerAmount: offerNumeric,
        message: offerMessage
      };
      if (productId) {
        offerPayload.product = productId;
      } else {
        offerPayload.externalProductTitle = artwork.title;
        offerPayload.externalProductId = artwork.id;
        offerPayload.externalProductSlug = slug;
      }
      // Submit the offer to backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/offer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(offerPayload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsOfferModalOpen(false);
        setOfferAmount("");
        setOfferMessage("");
        setOfferError("");
        toast.success("Offer submitted successfully!");
      } else {
        setOfferError(data.message || "Failed to submit offer. Please try again.");
      }
    } catch (error) {
      setOfferError("Failed to submit offer. Please try again.");
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setIsOfferModalOpen(true);
  };

  useEffect(() => {
    if (!slug) {
      console.log("Slug is not available yet.");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Artwork Details
        const artworkResponse = await fetch("/api/artwork", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
                            query ArtworkDetailsQuery($slug: String!) {
                                artwork(id: $slug) {
                                    id
                                    title
                                    image {
                                        small: url(version: "small")
                                        large: url(version: "large")
                                    }
                                    artist {
                                        internalID
                                        slug
                                        name
                                    }
                                    description(format: HTML)
                                    additionalInformation(format: HTML)
                                    category
                                    medium
                                    mediumType {
                                        name
                                        longDescription
                                    }
                                    dimensions {
                                        in
                                        cm
                                    }
                                    publisher
                                    manufacturer
                                    image_rights: imageRights
                                    framed {
                                        label
                                        details
                                    }
                                    signatureInfo {
                                        label
                                        details
                                    }
                                    conditionDescription {
                                        label
                                        details
                                    }
                                    certificateOfAuthenticity {
                                        label
                                        details
                                    }
                                    attributionClass {
                                        name
                                        id
                                    }
                                    series
                                    literature(format: HTML)
                                    exhibition_history: exhibitionHistory(format: HTML)
                                    provenance(format: HTML)
                                    articles {
                                        slug
                                        id
                                    }
                                }
                            }
                        `,
            variables: { slug },
          }),
        });

        const artworkResult = await artworkResponse.json();
        if (artworkResult.errors) {
          console.error("GraphQL Errors (Artwork):", artworkResult.errors);
          setError("Failed to fetch artwork data.");
          return;
        }

        console.log("Artwork Data Fetched:", artworkResult.data.artwork);
        setArtwork(artworkResult.data.artwork);

        // Fetch Pricing Data
        const pricingResponse = await fetch("/api/artwork", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
                            query PricingContextQuery($slug: String!) @cacheable {
                                artwork(id: $slug) {
                                    listPrice {
                                        __typename
                                        ... on PriceRange {
                                            maxPrice {
                                                minor
                                            }
                                            minPrice {
                                                minor
                                            }
                                        }
                                        ... on Money {
                                            minor
                                        }
                                    }
                                    artists(shallow: true) {
                                        slug
                                        id
                                    }
                                    category
                                    pricingContext {
                                        appliedFiltersDisplay
                                        appliedFilters {
                                            dimension
                                            category
                                        }
                                        bins {
                                            maxPrice
                                            maxPriceCents
                                            minPrice
                                            minPriceCents
                                            numArtworks
                                        }
                                    }
                                    id
                                }
                            }
                        `,
            variables: { slug },
          }),
        });

        const pricingResult = await pricingResponse.json();
        if (pricingResult.errors) {
          console.error("GraphQL Errors (Pricing):", pricingResult.errors);
          // Don't set error for pricing, just log it
        } else {
          console.log("Pricing Data Fetched:", pricingResult.data.artwork);

          // Extract pricing data from Artsy response
          const listPrice = pricingResult.data.artwork.listPrice;
          let finalPricing = pricingResult.data.artwork;

          if (listPrice) {
            let originalPrice,
              originalPriceType,
              originalMinPrice,
              originalMaxPrice;

            if (listPrice.__typename === "Money") {
              originalPrice = listPrice.minor;
              originalPriceType = "Money";
            } else if (listPrice.__typename === "PriceRange") {
              originalMinPrice = listPrice.minPrice.minor;
              originalMaxPrice = listPrice.maxPrice.minor;
              originalPrice = (originalMinPrice + originalMaxPrice) / 2;
              originalPriceType = "PriceRange";
            }

            if (originalPrice) {
              try {
                console.log("Fetching adjusted pricing...");
                console.log("Request payload:", {
                  originalPrice,
                  originalPriceType,
                  originalMinPrice,
                  originalMaxPrice,
                  category: pricingResult.data.artwork.category,
                  artistName: artworkResult.data.artwork.artist.name,
                  artworkId: artworkResult.data.artwork.id,
                });

                const adjustedPricingResponse = await fetch(
                  "/api/artwork-pricing",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      originalPrice,
                      originalPriceType,
                      originalMinPrice,
                      originalMaxPrice,
                      category: pricingResult.data.artwork.category,
                      artistName: artworkResult.data.artwork.artist.name,
                      artworkId: artworkResult.data.artwork.id,
                    }),
                  }
                );

                console.log(
                  "Adjusted pricing response status:",
                  adjustedPricingResponse.status
                );
                const adjustedPricingResult =
                  await adjustedPricingResponse.json();
                console.log(
                  "Adjusted pricing response:",
                  adjustedPricingResult
                );

                // Test if the response has the expected structure
                console.log("Response structure check:", {
                  hasSuccess: "success" in adjustedPricingResult,
                  hasItems: "items" in adjustedPricingResult,
                  success: adjustedPricingResult.success,
                  items: adjustedPricingResult.items,
                });

                if (
                  adjustedPricingResult.success &&
                  adjustedPricingResult.items
                ) {
                  console.log(
                    "Adjusted Pricing Data Fetched:",
                    adjustedPricingResult.items
                  );
                  finalPricing = {
                    ...pricingResult.data.artwork,
                    adjustedPricing: adjustedPricingResult.items,
                  };
                  console.log("Final pricing with adjustments:", finalPricing);
                } else if (
                  adjustedPricingResult.status &&
                  adjustedPricingResult.items
                ) {
                  // Fallback for different response structure
                  console.log("Using fallback response structure");
                  finalPricing = {
                    ...pricingResult.data.artwork,
                    adjustedPricing: adjustedPricingResult.items,
                  };
                  console.log(
                    "Final pricing with adjustments (fallback):",
                    finalPricing
                  );
                } else {
                  console.log(
                    "Adjusted pricing not successful:",
                    adjustedPricingResult
                  );
                }
              } catch (error) {
                console.error("Error fetching adjusted pricing:", error);
              }
            } else {
              console.log("No original price available for adjustment");
            }
          }

          // Set the final pricing state
          setPricing(finalPricing);
          setPricingLoaded(true);
        }

        // Fetch Artist Details
        const artistID = artworkResult.data.artwork.artist.internalID;
        const artistResponse = await fetch("/api/artwork", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
                            query artistRoutes_ArtistAppQuery($artistID: String!) @cacheable {
                                artist(id: $artistID) @principalField {
                                    internalID
                                    slug
                                    name
                                    formattedNationalityAndBirthday
                                    biographyBlurb(format: HTML, partnerBio: false) {
                                        text
                                        credit
                                    }
                                    coverArtwork {
                                        title
                                        href
                                        image {
                                            src: url(version: ["larger", "larger"])
                                            width
                                            height
                                        }
                                        id
                                    }
                                }
                            }
                        `,
            variables: { artistID },
          }),
        });

        const artistResult = await artistResponse.json();
        if (artistResult.errors) {
          console.error("GraphQL Errors (Artist):", artistResult.errors);
          setError("Failed to fetch artist data.");
          return;
        }

        console.log("Artist Data Fetched:", artistResult.data.artist);
        setArtist(artistResult.data.artist);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An unexpected error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Debug useEffect to monitor pricing state changes
  useEffect(() => {
    console.log("Pricing state changed:", pricing);
    if (pricing?.adjustedPricing) {
      console.log("Adjusted pricing available:", pricing.adjustedPricing);
      console.log(
        "Global adjustment applied:",
        pricing.adjustedPricing.globalAdjustmentApplied
      );
    }
  }, [pricing]);

  const handleContactClick = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artwork?.title || "Artwork",
        text: `Check out this amazing artwork by ${artist?.name}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
    setShowShareMenu(false);
  };

  const handleDownload = () => {
    if (artwork?.image?.large) {
      const link = document.createElement("a");
      link.href = artwork.image.large;
      link.download = `${artwork.title || "artwork"}.jpg`;
      link.click();
    }
  };

  // Fallback UI for Loading State
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Image Skeleton */}
              <div className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl" />
              </div>

              {/* Content Skeleton */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>

                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-20 w-full" />
                </div>

                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Fallback UI for Error State
  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <Info className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="bg-black text-white hover:bg-gray-800"
            >
              Try Again
            </Button>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  // Fallback UI for Missing Data
  if (!artwork || !artist) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Eye className="w-12 h-12 text-gray-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Artwork Not Found
              </h2>
              <p className="text-gray-600">
                The artwork you&apos;re looking for doesn&apos;t exist or has
                been removed.
              </p>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 md:py-12">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">
            {/* Left Column: Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] bg-white rounded-2xl shadow-xl overflow-hidden flex items-center justify-center">
                <ArtistCarousel slug={artist.slug} />
              </div>
            </motion.div>

            {/* Right Column: Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Header Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500 uppercase tracking-wide">
                    {artwork.category || "Artwork"}
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {artwork.title || "Untitled Artwork"}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{artist.name}</span>
                  </div>
                  {artist.formattedNationalityAndBirthday && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{artist.formattedNationalityAndBirthday}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Share Menu */}
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-2 left-2 sm:left-auto sm:right-0 top-20 bg-white rounded-xl shadow-xl border p-4 z-10 w-auto sm:w-48"
                  >
                    <div className="space-y-2">
                      <button
                        onClick={handleShare}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Artist Section */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {artist.name}
                    </h2>
                    <p className="text-gray-600">
                      {artist.formattedNationalityAndBirthday}
                    </p>
                  </div>
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      artist.biographyBlurb?.text ||
                      "<p>No biography available.</p>",
                  }}
                  className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                />
              </div>

              {/* Artwork Details */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  <span>Artwork Details</span>
                </h2>

                {/* Description */}
                {artwork.description && (
                  <div className="mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                      Description
                    </h3>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: artwork.description,
                      }}
                      className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                    />
                  </div>
                )}

                {/* Additional Information */}
                {/* {artwork.additionalInformation && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: artwork.additionalInformation,
                                            }}
                                            className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                                        />
                                    </div>
                                )} */}

                {/* Technical Details Grid */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Tag className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-semibold text-gray-900">
                        {artwork.category || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Palette className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Medium</p>
                      <p className="font-semibold text-gray-900">
                        {artwork.medium || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Ruler className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500">Dimensions</p>
                      <p className="font-semibold text-gray-900">
                        {artwork.dimensions
                          ? `${artwork.dimensions.in} / ${artwork.dimensions.cm}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Publisher</p>
                      <p className="font-semibold text-gray-900">
                        {artwork.publisher || "N/A"}
                      </p>
                    </div>
                  </div>

                  {artwork.manufacturer && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <Tag className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="text-xs text-gray-500">Manufacturer</p>
                        <p className="font-semibold text-gray-900">
                          {artwork.manufacturer}
                        </p>
                      </div>
                    </div>
                  )}

                  {artwork.series && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <Tag className="w-4 h-4 text-pink-500" />
                      <div>
                        <p className="text-xs text-gray-500">Series</p>
                        <p className="font-semibold text-gray-900">
                          {artwork.series}
                        </p>
                      </div>
                    </div>
                  )}

                  {artwork.attributionClass && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <Tag className="w-4 h-4 text-teal-500" />
                      <div>
                        <p className="text-xs text-gray-500">Attribution</p>
                        <p className="font-semibold text-gray-900">
                          {artwork.attributionClass.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Condition and Authentication Details */}
                {(artwork.framed ||
                  artwork.signatureInfo ||
                  artwork.certificateOfAuthenticity ||
                  artwork.conditionDescription) && (
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Condition & Authentication
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {artwork.framed && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <Tag className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-gray-500">
                              {artwork.framed.label}
                            </p>
                            <p className="font-semibold text-gray-900">
                              {artwork.framed.details}
                            </p>
                          </div>
                        </div>
                      )}

                      {artwork.signatureInfo && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <Tag className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-xs text-gray-500">
                              {artwork.signatureInfo.label}
                            </p>
                            <p className="font-semibold text-gray-900">
                              {artwork.signatureInfo.details}
                            </p>
                          </div>
                        </div>
                      )}

                      {artwork.certificateOfAuthenticity && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <Tag className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="text-xs text-gray-500">
                              {artwork.certificateOfAuthenticity.label}
                            </p>
                            <p className="font-semibold text-gray-900">
                              {artwork.certificateOfAuthenticity.details}
                            </p>
                          </div>
                        </div>
                      )}

                      {artwork.conditionDescription && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <Tag className="w-4 h-4 text-orange-500" />
                          <div>
                            <p className="text-xs text-gray-500">
                              {artwork.conditionDescription.label}
                            </p>
                            <p className="font-semibold text-gray-900">
                              {artwork.conditionDescription.details}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                {(artwork.literature ||
                  artwork.exhibition_history ||
                  artwork.provenance) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Additional Details
                    </h3>

                    {artwork.literature && (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">
                          Literature
                        </h4>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: artwork.literature,
                          }}
                          className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                        />
                      </div>
                    )}

                    {artwork.exhibition_history && (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">
                          Exhibition History
                        </h4>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: artwork.exhibition_history,
                          }}
                          className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                        />
                      </div>
                    )}

                    {artwork.provenance && (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">
                          Provenance
                        </h4>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: artwork.provenance,
                          }}
                          className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Section */}
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  onClick={handleContactClick}
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
            </motion.div>
          </div>
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-4 sm:p-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  About the Artwork
                </h2>
                <p className="text-gray-600">
                  Comprehensive information about this piece
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                {/* Left Column: Description and Additional Info */}
                <div className="space-y-6">
                  {/* Description */}
                  {artwork.description && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Info className="w-5 h-5 text-blue-500" />
                        <span>Description</span>
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: artwork.description,
                        }}
                        className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Additional Information */}
                  {artwork.additionalInformation && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Info className="w-5 h-5 text-green-500" />
                        <span>Additional Information</span>
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: artwork.additionalInformation,
                        }}
                        className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Literature */}
                  {artwork.literature && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Info className="w-5 h-5 text-purple-500" />
                        <span>Literature</span>
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: artwork.literature,
                        }}
                        className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Exhibition History */}
                  {artwork.exhibition_history && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Info className="w-5 h-5 text-orange-500" />
                        <span>Exhibition History</span>
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: artwork.exhibition_history,
                        }}
                        className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Provenance */}
                  {artwork.provenance && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Info className="w-5 h-5 text-teal-500" />
                        <span>Provenance</span>
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: artwork.provenance,
                        }}
                        className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                      />
                    </div>
                  )}
                </div>

                {/* Right Column: Technical Details and Condition */}
                <div className="space-y-6">
                  {/* Technical Specifications */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Tag className="w-5 h-5 text-blue-500" />
                      <span>Technical Specifications</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {artwork.category && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">
                            Category
                          </span>
                          <span className="font-semibold text-gray-900">
                            {artwork.category}
                          </span>
                        </div>
                      )}

                      {artwork.medium && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Medium</span>
                          <span className="font-semibold text-gray-900">
                            {artwork.medium}
                          </span>
                        </div>
                      )}

                      {artwork.dimensions && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">
                            Dimensions
                          </span>
                          <span className="font-semibold text-gray-900">
                            {artwork.dimensions.in} / {artwork.dimensions.cm}
                          </span>
                        </div>
                      )}

                      {artwork.publisher && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">
                            Publisher
                          </span>
                          <span className="font-semibold text-gray-900">
                            {artwork.publisher}
                          </span>
                        </div>
                      )}

                      {artwork.manufacturer && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">
                            Manufacturer
                          </span>
                          <span className="font-semibold text-gray-900">
                            {artwork.manufacturer}
                          </span>
                        </div>
                      )}

                      {artwork.series && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Series</span>
                          <span className="font-semibold text-gray-900">
                            {artwork.series}
                          </span>
                        </div>
                      )}

                      {artwork.attributionClass && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">
                            Attribution
                          </span>
                          <span className="font-semibold text-gray-900">
                            {artwork.attributionClass.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Condition & Authentication */}
                  {(artwork.framed ||
                    artwork.signatureInfo ||
                    artwork.certificateOfAuthenticity ||
                    artwork.conditionDescription) && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Tag className="w-5 h-5 text-green-500" />
                        <span>Condition & Authentication</span>
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {artwork.framed && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">
                              {artwork.framed.label}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {artwork.framed.details}
                            </span>
                          </div>
                        )}

                        {artwork.signatureInfo && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">
                              {artwork.signatureInfo.label}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {artwork.signatureInfo.details}
                            </span>
                          </div>
                        )}

                        {artwork.certificateOfAuthenticity && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">
                              {artwork.certificateOfAuthenticity.label}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {artwork.certificateOfAuthenticity.details}
                            </span>
                          </div>
                        )}

                        {artwork.conditionDescription && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">
                              {artwork.conditionDescription.label}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {artwork.conditionDescription.details}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Medium Type Details */}
                  {artwork.mediumType && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Palette className="w-5 h-5 text-purple-500" />
                        <span>Medium Details</span>
                      </h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {artwork.mediumType.name}
                        </h4>
                        <p className="text-sm text-gray-700">
                          {artwork.mediumType.longDescription}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* About the Artwork Section */}

      <OtherWorks slug={slug} />
      <Footer />

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        artwork={
          artwork
            ? {
                title: artwork.title,
                artistNames: artist.name,
                price: getPriceDisplay().estimate,
                id: artwork.id,
              }
            : null
        }
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Offer Modal */}
      <AnimatePresence>
        {isOfferModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsOfferModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Make an Offer</h2>
                  <button
                    onClick={() => setIsOfferModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Listing Price:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {getPriceDisplay().estimate}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleOfferSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Offer Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="text"
                        id="offerAmount"
                        value={offerAmount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setOfferAmount(value);
                          setOfferError("");
                        }}
                        placeholder="Enter your offer"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="offerMessage" className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      id="offerMessage"
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      placeholder="Add a message to your offer..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {offerError && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-600">{offerError}</p>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOfferModalOpen(false)}
                      className="flex-1 py-3"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingOffer || !offerAmount}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      {isSubmittingOffer ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        "Submit Offer"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
