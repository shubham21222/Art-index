"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ApolloClient, gql, InMemoryCache, useQuery } from "@apollo/client";

// Define the GraphQL query
const AUCTION_ARTWORKS_QUERY = gql`
  query AuctionArtworksRailQuery($slug: String!) {
    sale(id: $slug) {
      artworksConnection(first: 20) {
        edges {
          node {
            internalID
            slug
            title
            artistNames
            href
            image {
              src: url(version: ["larger", "large"])
              width
              height
            }
            saleArtwork {
              lotID
              lotLabel
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
                bidCount
              }
            }
          }
        }
      }
      id
    }
  }
`;

// Initialize Apollo Client outside the component
const client = new ApolloClient({
    uri: "https://metaphysics-cdn.artsy.net/v2",
    cache: new InMemoryCache(),
});

export default function AuctionPrintsCarousel() {
    const carouselRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Fetch data using the query
    const { loading, error, data } = useQuery(AUCTION_ARTWORKS_QUERY, {
        variables: { slug: "chiswick-auctions-prints-and-multiples-413ec2b1-2010-4332-9518-c7285f006006" },
        client,
    });

    // Extract artwork data
    const auctionArtworks = data?.sale?.artworksConnection?.edges || [];

    // Scroll handlers
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

    // Add scroll event listener
    useEffect(() => {
        const handleScroll = () => {
            if (carouselRef.current) {
                const scrollPosition = carouselRef.current.scrollLeft;
                const totalWidth = carouselRef.current.scrollWidth;
                const visibleWidth = carouselRef.current.clientWidth;
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
    }, []); // Empty dependency array ensures this runs only once

    // Conditional rendering for loading, error, and empty states
    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    if (auctionArtworks.length === 0) {
        return <p>No artworks available for this sale.</p>;
    }

    return (
        <div className="px-6 py-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl">Chiswick Auctions: Prints & Multiples</h2>
                    <p className="text-gray-500 text-2xl">Ends Mar 1, 6:00 PM GMT</p>
                </div>
                <a href="#" className="text-black text-sm font-medium hover:underline">
                    View All Lots
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

                {/* Auction Artworks Carousel */}
                <div
                    ref={carouselRef}
                    className="overflow-x-auto scrollbar-hide pt-8 flex space-x-4 scroll-smooth px-2"
                >
                    {auctionArtworks.map(({ node }) => (
                        <div key={node.internalID} className="group flex-shrink-0 flex flex-col justify-end min-w-[220px] p-2 rounded-md">
                            {/* Image */}
                            <div className="rounded-md overflow-hidden">
                                <Image
                                    src={node.image.src}
                                    alt={node.title}
                                    width={220}
                                    height={240}
                                    className="object-cover transition-transform duration-300 transform group-hover:scale-105"
                                />
                            </div>

                            {/* Artwork Details */}
                            <div className="mt-2">
                                <h3 className="text-sm font-semibold">{node.artistNames}</h3>
                                <p className="text-gray-500 italic text-xs">{node.title}</p>
                                <p className="text-gray-500 text-xs">Lot {node.saleArtwork.lotLabel}</p>
                                <div className="mt-1">
                                    <p className="text-black font-medium">
                                        Current Bid: {node.saleArtwork.highestBid.display}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        {node.collectorSignals?.auction?.bidCount ?? 0} bids
                                    </p>
                                </div>
                                <div className="absolute left-0 bottom-[50px] mt-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-opacity duration-300 space-x-2 bg-white p-1">
                                    <button className="btn2 px-3 py-1 bg-black text-white text-xs font-medium rounded-md">
                                        Bid Now
                                    </button>
                                    <button className="btn2 px-3 py-1 bg-gray-700 text-white text-xs font-medium rounded-md">
                                        Watch Lot
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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