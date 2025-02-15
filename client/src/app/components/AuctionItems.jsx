"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

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
    <div className="px-6 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl">At Auction</h2>

        </div>
        <a href="#" className="text-black text-sm font-medium hover:underline">
          View All Auctions
        </a>
      </div>

      <span className="text-lg p-[1px] border-black ml-8   border-b-2">Curators’ Picks</span>
      <div className="border"></div>
      {/* Carousel with Buttons */}
      <div className="relative">
        {/* Left Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full hidden md:flex"
        >
          <ChevronLeft className="w-5 h-5" />
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
                href={`/artwork/${item.slug}`} >
                <div key={index} className="group flex-shrink-0 flex flex-col justify-end min-w-[220px] p-2 rounded-md">
                  {/* Image */}
                  <div className="rounded-md overflow-hidden">
                    <Image
                      src={item.image?.src || "/placeholder.svg"}
                      alt={`${item.title}`}
                      width={220}
                      height={240}
                      className="object-cover transition-transform duration-300 transform group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-2 text-sm font-semibold">{item.artistNames}</h3>

                  {/* Artwork Details */}
                  <div className="relative">
                    {/* Title and Auction House */}
                    <p className="text-gray-500 italic text-xs">{item.title}</p>
                    {item.sale && (
                      <p className="text-gray-500 text-xs">
                        Ends at {new Date(item.sale.endAt).toLocaleDateString()}
                      </p>
                    )}

                    <div className="absolute w-full left-0 bottom-[1px] mt-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-opacity duration-300 space-x-2 bg-white p-1 ">
                      <button className="btn2 px-3 py-1 bg-gray-700 text-white text-xs font-medium rounded-md">
                        Prints
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-black font-medium">
                      {item.saleArtwork?.highestBid?.display ||
                        item.saleArtwork?.openingBid?.display ||
                        "N/A"}
                    </p>
                    {item.collectorSignals?.auction?.registrationEndsAt && (
                      <p className="text-gray-500 text-xs">
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
            className={`h-[1px] w-[300px] rounded-full transition-colors duration-300 ${index === activeIndex ? "bg-black" : "bg-gray-300"
              }`}
          />
        ))}
      </div>
    </div>
  );
}