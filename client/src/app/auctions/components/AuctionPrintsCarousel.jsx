"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Timer, Eye } from "lucide-react";
import { ApolloClient, gql, InMemoryCache, useQuery } from "@apollo/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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
                bidCount
              }
            }
          }
        }
      }
      name
      formattedStartDateTime
    }
  }
`;

// Initialize Apollo Client outside the component
const client = new ApolloClient({
  uri: "https://metaphysics-cdn.artsy.net/v2",
  cache: new InMemoryCache(),
});

// Artwork Card Component
const ArtworkCard = ({ artwork }) => {
  const bidCount = artwork.collectorSignals?.auction?.bidCount ?? 0;
  const currentBid = artwork.saleArtwork?.highestBid?.display;
  const startingBid = artwork.saleArtwork?.openingBid?.display;

  return (
    <Card className="group relative flex-shrink-0 w-[280px] overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <Link href={`/artwork/${artwork.slug}`}>
        <div className="relative h-[320px] overflow-hidden">
          <Image
            src={artwork.image?.src || "/placeholder-artwork.jpg"}
            alt={artwork.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="280px"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>
      </Link>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold line-clamp-1">{artwork.artistNames}</h3>
          <p className="text-sm text-gray-600 italic line-clamp-1">{artwork.title}</p>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="secondary">Lot {artwork.saleArtwork?.lotLabel}</Badge>
          <span className="text-xs text-gray-500">
            {bidCount} {bidCount === 1 ? 'bid' : 'bids'}
          </span>
        </div>

        <div className="space-y-2">
          <p className="font-medium">
            {currentBid ? `Current Bid: ${currentBid}` : `Starting Bid: ${startingBid}`}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 shadow-lg space-y-2">
          <Button className="w-full" variant="default">
            Bid Now
          </Button>
          <Button className="w-full" variant="secondary">
            <Eye className="w-4 h-4 mr-2" />
            Watch Lot
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <Card className="flex-shrink-0 w-[280px]">
    <Skeleton className="h-[320px] w-full" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-5 w-2/3" />
    </CardContent>
  </Card>
);

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
      carouselRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 280, behavior: "smooth" });
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
  }, []);

  return (
    <section className="px-6 py-8">
      <div className="max-w-[1500px] mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {loading ? <Skeleton className="h-8 w-64" /> : data?.sale?.name}
            </h2>
            <div className="flex items-center text-gray-500">
              <Timer className="w-4 h-4 mr-2" />
              <p>
                {loading ? (
                  <Skeleton className="h-6 w-48" />
                ) : (
                  `Ends Mar 1, 6:00 PM GMT`
                )}
              </p>
            </div>
          </div>
          <Button variant="outline">View All Lots</Button>
        </div>

        {/* Carousel with Buttons */}
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            className="absolute -left-4 top-1/2 transform -translate-y-1/2 hidden md:flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div
            ref={carouselRef}
            className="overflow-x-auto scrollbar-hide pt-4 flex space-x-6 scroll-smooth px-2"
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))
            ) : error ? (
              <p className="text-red-500">Error loading auction artworks</p>
            ) : auctionArtworks.length === 0 ? (
              <p className="text-gray-500">No artworks available for this sale.</p>
            ) : (
              auctionArtworks.map(({ node }) => (
                <ArtworkCard key={node.internalID} artwork={node} />
              ))
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden md:flex"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Line Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {[0, 1].map((index) => (
            <div
              key={index}
              className={`h-1 w-32 rounded-full transition-colors duration-300 ${
                index === activeIndex ? "bg-black" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}