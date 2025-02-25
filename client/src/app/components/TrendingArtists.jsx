"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";

const ARTISTS_QUERY = `
  query HomeTrendingArtistsRailQuery {
    viewer {
      curatedTrendingArtists(first: 20) {
        edges {
          node {
            internalID
            slug
            name
            href
            initials
            formattedNationalityAndBirthday
            counts {
              artworks
              forSaleArtworks
            }
            coverArtwork {
              image {
                cropped(width: 445, height: 334, version: ["larger", "large"]) {
                  src
                  srcSet
                }
              }
              id
            }
          }
        }
      }
    }
  }
`;

export default function TrendingArtists() {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0); // Track active slide index
  const [artists, setArtists] = useState([]); // Store fetched artists

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
            query: ARTISTS_QUERY,
          }),
        });

        const { data } = await response.json();
        const fetchedArtists =
          data?.viewer?.curatedTrendingArtists?.edges
            ?.map((edge) => ({
              id: edge.node.internalID,
              slug: edge.node.slug,
              name: edge.node.name,
              href: edge.node.href,
              nationalityAndBirthday: edge.node.formattedNationalityAndBirthday,
              artworkCount: edge.node.counts.artworks,
              forSaleArtworkCount: edge.node.counts.forSaleArtworks,
              image: edge.node.coverArtwork?.image?.cropped?.src || "/placeholder.svg",
            })) || [];
        setArtists(fetchedArtists);
      } catch (error) {
        console.error("Error fetching data from Artsy API:", error);
      }
    };

    fetchData();
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

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
    <section className="max-w-[1500px] mx-auto px-6 py-8 ">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Trending Artists on Artsy</h2>
          <p className="text-gray-900 text-lg mt-2">
            Discover artists making waves in the art world.
          </p>
        </div>
        <a
          href="#"
          className="text-black text-sm font-medium hover:underline transition-colors duration-300"
        >
          View All Artists
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

        {/* Trending Artists Carousel */}
        <div
          ref={carouselRef}
          className="overflow-x-auto scrollbar-hide flex space-x-6 pt-4"
        >
          {artists.length > 0 ? (
            artists.map((artist, index) => (
              <Link
                key={index}
                href={`/trending-shows/${artist.slug}`}
                className="group relative w-80 flex-shrink-0 cursor-pointer rounded-md overflow-hidden transition-shadow duration-300 hover:shadow-xl"
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

                {/* Image */}
                <div className="relative w-80 h-80">
                  <Image
                    src={artist.image}
                    alt={artist.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 transform group-hover:scale-105"
                  />
                </div>

                {/* Details */}
                <div className="relative z-10 p-4">
                  <h3 className="text-lg font-semibold text-white">{artist.name}</h3>
                  <p className="text-sm text-gray-300">{artist.nationalityAndBirthday}</p>
                  <p className="text-xs text-gray-400">
                    Artworks: {artist.artworkCount}, For Sale: {artist.forSaleArtworkCount}
                  </p>
                  <button className="mt-2 bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 hover:bg-gray-200">
                    Follow
                  </button>
                </div>
              </Link>
            ))
          ) : (
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="w-80 h-80 rounded-md" />
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
    </section>
  );
}