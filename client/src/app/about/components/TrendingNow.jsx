"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";

const ARTWORKS_QUERY = `
  query AboutArtworksRailQuery {
    marketingCollection(slug: "trending-this-week") {
      artworksConnection(first: 50) {
        edges {
          node {
            internalID
            slug
            href
            title
            artistNames
            image {
              src: url(version: ["larger", "large"])
              width
              height
            }
            saleMessage
            collectingInstitution
            partner {
              name
              href
            }
            sale {
              isAuction
              isClosed
            }
          }
        }
      }
    }
  }
`;

export default function TrendingNow() {
    const carouselRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [artworks, setArtworks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageErrors, setImageErrors] = useState(new Set());

    // Fetch data from Artsy API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const response = await fetch(ARTSY_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: ARTWORKS_QUERY,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const { data } = await response.json();
                const fetchedArtworks =
                    data?.marketingCollection?.artworksConnection?.edges
                        ?.map((edge) => ({
                            id: edge.node.internalID,
                            title: edge.node.title,
                            href: edge.node.href,
                            artistNames: edge.node.artistNames,
                            image: edge.node.image?.src || "/placeholder.jpeg",
                            saleMessage: edge.node.saleMessage,
                            collectingInstitution: edge.node.collectingInstitution,
                            partnerName: edge.node.partner?.name,
                            partnerHref: edge.node.partner?.href,
                            isAuction: edge.node.sale?.isAuction,
                            isClosed: edge.node.sale?.isClosed,
                        }))
                        .filter(artwork => artwork.title && artwork.artistNames) || [];
                
                setArtworks(fetchedArtworks);
            } catch (error) {
                console.error("Error fetching data from Artsy API:", error);
                setError("Failed to load trending artworks. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleImageError = (artworkId) => {
        setImageErrors(prev => new Set(prev).add(artworkId));
    };

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -320, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 320, behavior: "smooth" });
        }
    };

    // Update activeIndex based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (carouselRef.current) {
                const scrollPosition = carouselRef.current.scrollLeft;
                const totalWidth = carouselRef.current.scrollWidth;
                const visibleWidth = carouselRef.current.clientWidth;

                // Determine which half of the carousel is active
                const index = scrollPosition > totalWidth / 2 - visibleWidth ? 1 : 0;
                setActiveIndex(index);
            }
        };
        const carouselElement = carouselRef.current;
        if (carouselElement) {
            carouselElement.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (carouselElement) {
                carouselElement.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    // Show loading state
    if (isLoading) {
        return (
            <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Trending Now 
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> This Week</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover the most talked-about artworks in the art world
                        </p>
                    </div>

                    <div className="flex space-x-6 overflow-hidden">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="w-80 flex-shrink-0">
                                <div className="bg-gray-200 rounded-2xl h-80 mb-4 animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="bg-gray-200 h-4 rounded animate-pulse"></div>
                                    <div className="bg-gray-200 h-3 rounded w-3/4 animate-pulse"></div>
                                    <div className="bg-gray-200 h-3 rounded w-1/2 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Show error state
    if (error) {
        return (
            <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Trending Now 
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> This Week</span>
                    </h2>
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="text-gray-500 mb-4">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-lg font-medium">{error}</p>
                            <p className="text-sm mt-2">Please check your connection and try again.</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Trending Now 
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> This Week</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Discover the most talked-about artworks in the art world
                    </p>
                    <div className="flex justify-center items-center space-x-4">
                        <span className="text-2xl font-bold text-gray-900">{artworks.length}</span>
                        <span className="text-gray-600">artworks trending</span>
                    </div>
                </div>

                {/* Carousel with Buttons */}
                <div className="relative">
                    {/* Left Button */}
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg hover:shadow-xl p-3 rounded-full hidden md:flex z-10 transition-all duration-300 hover:scale-110 border border-gray-200"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>

                    {/* Trending Artworks Carousel */}
                    <div
                        ref={carouselRef}
                        className="overflow-x-auto whitespace-nowrap scrollbar-hide flex space-x-8 px-4"
                    >
                        {artworks.length > 0 ? (
                            artworks.map((artwork, index) => (
                                <div key={artwork.id || index} className="w-80 space-y-4 flex-shrink-0 group">
                                    {/* Image */}
                                    <div className="relative w-80 h-80 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300">
                                        <Image
                                            src={imageErrors.has(artwork.id) ? "/placeholder.jpeg" : artwork.image}
                                            alt={artwork.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={() => handleImageError(artwork.id)}
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        {/* Status Badge */}
                                        {artwork.isAuction && (
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                    artwork.isClosed 
                                                        ? 'bg-red-500 text-white' 
                                                        : 'bg-green-500 text-white'
                                                }`}>
                                                    {artwork.isClosed ? 'Auction Closed' : 'Live Auction'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {artwork.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 font-medium">
                                            {artwork.artistNames}
                                        </p>
                                        {artwork.saleMessage && (
                                            <p className="text-sm text-gray-500">
                                                {artwork.saleMessage}
                                            </p>
                                        )}
                                        {artwork.collectingInstitution && (
                                            <p className="text-xs text-gray-500">
                                                {artwork.collectingInstitution}
                                            </p>
                                        )}
                                        {artwork.partnerName && (
                                            <a
                                                href={artwork.partnerHref}
                                                className="text-xs text-blue-600 hover:text-blue-800 underline transition-colors"
                                            >
                                                {artwork.partnerName}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full text-center py-12">
                                <p className="text-gray-500">No trending artworks available at the moment.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Button */}
                    <button
                        onClick={scrollRight}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg hover:shadow-xl p-3 rounded-full hidden md:flex z-10 transition-all duration-300 hover:scale-110 border border-gray-200"
                    >
                        <ChevronRight className="w-6 h-6 text-gray-700" />
                    </button>
                </div>

                {/* Line Indicators */}
                <div className="flex justify-center mt-12 space-x-4">
                    {[0, 1].map((index) => (
                        <div
                            key={index}
                            className={`h-1 w-16 rounded-full transition-all duration-300 ${
                                index === activeIndex 
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500" 
                                    : "bg-gray-300"
                            }`}
                        />
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <a 
                        href="/artworks" 
                        className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        View All Artworks
                        <ChevronRight className="ml-2 w-5 h-5" />
                    </a>
                </div>
            </div>
        </section>
    );
}