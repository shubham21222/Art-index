"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";

const AUCTION_QUERY = `
  query HomeAuctionLotsRailQuery {
    viewer {
      artworksConnection(forSale: true, first: 20, geneIDs: "our-top-auction-lots") {
        edges {
          node {
            internalID
            href
            slug
            title
            artistNames
            image {
              src: url(version: ["larger", "large"])
              width
              height
            }
            sale {
              endAt
              isClosed
            }
            saleArtwork {
              highestBid {
                display
              }
              openingBid {
                display
              }
            }
            collectorSignals {
              auction {
                lotClosesAt
                registrationEndsAt
              }
            }
          }
        }
      }
    }
  }
`;

export default function AuctionCarousel() {
  const [auctionData, setAuctionData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

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
            query: AUCTION_QUERY,
          }),
        });

        const { data } = await response.json();
        const artworks = data?.viewer?.artworksConnection?.edges.map(
          (edge) => edge.node
        );
        setAuctionData(artworks || []);
      } catch (error) {
        console.error("Error fetching data from Artsy API:", error);
      }
    };

    fetchData();
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -220, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 220, behavior: "smooth" });
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
    <div className="max-w-[1500px] mx-auto px-6 py-8 bg-gray-50">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Art Auctions</h2>
          <p className="text-gray-500 text-lg mt-2">
            Discover top picks from ongoing auctions.
          </p>
        </div>
        <a
          href="#"
          className="text-black text-sm font-medium hover:underline transition-colors duration-300"
        >
          View All Auctions
        </a>
      </div>

      {/* Carousel with Buttons */}
      <div className="relative">
        {/* Left Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hidden md:flex transition-transform duration-300 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Artwork Carousel */}
        <div
          ref={carouselRef}
          className="overflow-x-auto scrollbar-hide pt-8 flex space-x-4 scroll-smooth px-2"
        >
          {auctionData.length > 0 ? (
            auctionData.map((item, index) => (
              <Link
                key={item.internalID}
                href={`/artwork/${item.slug}`}
                className="group relative flex-shrink-0 flex flex-col justify-end min-w-[220px] p-2 rounded-md overflow-hidden transition-shadow duration-300 hover:shadow-xl"
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

                {/* Image */}
                <div className="rounded-md overflow-hidden relative">
                  <Image
                    src={item.image?.src || "/placeholder.svg"}
                    alt={`${item.title}`}
                    width={220}
                    height={240}
                    className="object-cover transition-transform duration-300 transform group-hover:scale-105"
                  />
                </div>

                {/* Artwork Details */}
                <div className="relative z-10 mt-4">
                  <h3 className="text-sm font-semibold text-white">{item.artistNames}</h3>
                  <p className="text-xs text-gray-300 italic">{item.title}</p>
                  {item.sale && (
                    <p className="text-xs text-gray-400">
                      Ends at {new Date(item.sale.endAt).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-white font-medium">
                      {item.saleArtwork?.highestBid?.display ||
                        item.saleArtwork?.openingBid?.display ||
                        "N/A"}
                    </p>
                    {item.collectorSignals?.auction?.registrationEndsAt && (
                      <p className="text-xs text-gray-400">
                        Register by{" "}
                        {new Date(
                          item.collectorSignals.auction.registrationEndsAt
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="w-[220px] h-[300px] rounded-md" />
            ))
          )}
        </div>

        {/* Right Button */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hidden md:flex transition-transform duration-300 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Animated Scroll Indicators */}
      <div className="flex justify-center mt-6 space-x-4">
        {[0, 1].map((index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? "bg-black scale-150" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}