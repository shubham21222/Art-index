"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";

const FEATURED_SHOWS_QUERY = `
  query HomeFeaturedShowsRailQuery {
    orderedSet(id: "530ebe92139b21efd6000071") {
      items {
        __typename
        ... on Show {
          internalID
          slug
          name
          href
          startAt
          endAt
          exhibitionPeriod
          partner {
            __typename
            ... on Partner {
              name
            }
          }
          coverImage {
            cropped(width: 445, height: 334, version: ["larger", "large"]) {
              src
            }
          }
        }
      }
    }
  }
`;

export default function FeaturedShows() {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0); // Track active slide index
  const [featuredShows, setFeaturedShows] = useState([]); // Store fetched shows

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
            query: FEATURED_SHOWS_QUERY,
          }),
        });

        const { data } = await response.json();
        const shows = data?.orderedSet?.items.filter(
          (item) => item.__typename === "Show"
        );
        setFeaturedShows(shows || []);
      } catch (error) {
        console.error("Error fetching data from Artsy API:", error);
      }
    };

    fetchData();
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -345, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 345, behavior: "smooth" });
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
    <section className="max-w-[1500px] mx-auto px-6 py-8 bg-gray-50">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Featured Shows</h2>
          <p className="text-gray-500 text-lg mt-2">
            Explore the latest exhibitions from galleries around the world.
          </p>
        </div>
        <a
          href="#"
          className="text-black text-sm font-medium hover:underline transition-colors duration-300"
        >
          View All Shows
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

        {/* Featured Shows Carousel */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto scrollbar-hide space-x-6 pt-4"
        >
          {featuredShows.length > 0 ? (
            featuredShows.map((show, index) => (
              <Link
                key={index}
                href={`/show/${show.slug}`}
                className="group relative flex-shrink-0 w-[345px] cursor-pointer rounded-md overflow-hidden transition-shadow duration-300 hover:shadow-xl"
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

                {/* Image */}
                <div className="relative w-[345px] h-[220px]">
                  <Image
                    src={show.coverImage?.cropped?.src || "/placeholder.svg"}
                    alt={show.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 transform group-hover:scale-105"
                  />
                </div>

                {/* Details */}
                <div className="relative z-10 p-4">
                  <h3 className="text-lg font-semibold text-white">{show.name}</h3>
                  <p className="text-sm text-gray-300">{show.partner?.name || "N/A"}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {show.exhibitionPeriod || "N/A"}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="w-[345px] h-[320px] rounded-md" />
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