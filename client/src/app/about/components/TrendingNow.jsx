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
    const [activeIndex, setActiveIndex] = useState(0); // Track active slide index
    const [artworks, setArtworks] = useState([]); // Store fetched artworks

    // Fetch data from Artsy API
    useEffect(() => {
        const fetchData = async () => {
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

                const { data } = await response.json();
                const fetchedArtworks =
                    data?.marketingCollection?.artworksConnection?.edges
                        ?.map((edge) => ({
                            id: edge.node.internalID,
                            title: edge.node.title,
                            href: edge.node.href,
                            artistNames: edge.node.artistNames,
                            image: edge.node.image?.src || "/placeholder.svg",
                            saleMessage: edge.node.saleMessage,
                            collectingInstitution: edge.node.collectingInstitution,
                            partnerName: edge.node.partner?.name,
                            partnerHref: edge.node.partner?.href,
                            isAuction: edge.node.sale?.isAuction,
                            isClosed: edge.node.sale?.isClosed,
                        })) || [];
                setArtworks(fetchedArtworks);
            } catch (error) {
                console.error("Error fetching data from Artsy API:", error);
            }
        };

        fetchData();
    }, []);

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -240, behavior: "smooth" }); // Adjust scroll distance to match item width
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 240, behavior: "smooth" }); // Adjust scroll distance to match item width
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

    return (
        <section className="px-6 py-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl ">
                    Trending Now <sup className="text-blue-500 text-sm">50</sup>
                </h2>
                <a href="#" className="text-sm font-medium underline">
                    View All Artworks
                </a>
            </div>

            {/* Carousel with Buttons */}
            <div className="relative">
                {/* Left Button */}
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full hidden md:flex"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Trending Artworks Carousel */}
                <div
                    ref={carouselRef}
                    className="overflow-x-auto whitespace-nowrap scrollbar-hide flex space-x-6"
                >
                    {artworks.length > 0 ? (
                        artworks.map((artwork, index) => (
                            <div key={index} className="w-80 space-y-2 flex-shrink-0">
                                {/* Image */}
                                <div className="relative w-80 h-80">
                                    <Image
                                        src={artwork.image}
                                        alt={artwork.title}
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-md"
                                    />
                                </div>

                                {/* Details */}
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold w-[85%] flex flex-wrap break-words overflow-hidden">{artwork.title}</h3>
                                    <p className="text-xs text-gray-600">{artwork.artistNames}</p>
                                    <p className="text-xs text-gray-600">{artwork.saleMessage}</p>
                                    {artwork.collectingInstitution && (
                                        <p className="text-xs text-gray-600">
                                            Institution: {artwork.collectingInstitution}
                                        </p>
                                    )}
                                    {artwork.partnerName && (
                                        <a
                                            href={artwork.partnerHref}
                                            className="text-xs text-gray-600 underline"
                                        >
                                            Partner: {artwork.partnerName}
                                        </a>
                                    )}
                                    {artwork.isAuction && (
                                        <p className="text-xs text-red-500">
                                            {artwork.isClosed ? "Auction Closed" : "Live Auction"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>

                {/* Right Button */}
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full hidden md:flex"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Line Indicators */}
            <div className="flex justify-center mt-4 space-x-2">
                {[0, 1].map((index) => (
                    <div
                        key={index}
                        className={`h-[1px] w-full rounded-full transition-colors duration-300 ${index === activeIndex ? "bg-black" : "bg-gray-300"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}