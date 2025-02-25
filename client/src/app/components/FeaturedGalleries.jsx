"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";

const GALLERIES_QUERY = `
  query partnersRoutes_GalleriesRouteQuery {
    viewer {
      orderedSet(id: "5638fdfb7261690296000031") {
        orderedItemsConnection(first: 50) {
          edges {
            node {
              __typename
              ... on Profile {
                internalID
                href
                owner {
                  __typename
                  ... on Partner {
                    internalID
                    href
                    name
                    featuredShow {
                      name
                      location {
                        city
                      }
                      coverImage {
                        resized(height: 500, version: ["main", "normalized", "larger", "large"]) {
                          src
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default function FeaturedGalleries() {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0); // Track active slide index
  const [galleries, setGalleries] = useState([]); // Store fetched galleries

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
            query: GALLERIES_QUERY,
          }),
        });

        const { data } = await response.json();
        const fetchedGalleries =
          data?.viewer?.orderedSet?.orderedItemsConnection?.edges
            ?.filter((edge) => edge.node.__typename === "Profile")
            .map((edge) => ({
              id: edge.node.internalID,
              href: edge.node.href,
              name: edge.node.owner.name,
              location: edge.node.owner.featuredShow?.location?.city || "N/A",
              image: edge.node.owner.featuredShow?.coverImage?.resized?.src || "/placeholder.svg",
            })) || [];
        setGalleries(fetchedGalleries);
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
          <h2 className="text-3xl font-bold text-gray-900">Featured Galleries</h2>
          <p className="text-gray-900 text-lg mt-2">
            Explore top galleries showcasing exceptional works.
          </p>
        </div>
        <a
          href="#"
          className="text-black text-sm font-medium hover:underline transition-colors duration-300"
        >
          View All Galleries
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

        {/* Featured Galleries Carousel */}
        <div
          ref={carouselRef}
          className="overflow-x-auto scrollbar-hide flex space-x-6 pt-4"
        >
          {galleries.length > 0 ? (
            galleries.map((gallery, index) => {
              const galleryRoute = `/gallery${gallery.href}`;

              return (
                <Link
                  key={index}
                  href={galleryRoute}
                  className="group relative w-80 flex-shrink-0 cursor-pointer rounded-md overflow-hidden transition-shadow duration-300 hover:shadow-xl"
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

                  {/* Image */}
                  <div className="relative w-80 h-80">
                    <Image
                      src={gallery.image}
                      alt={gallery.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 transform group-hover:scale-105"
                    />
                  </div>

                  {/* Details */}
                  <div className="relative z-10 p-4">
                    <h3 className="text-lg font-semibold text-white">{gallery.name}</h3>
                    <p className="text-sm text-gray-300">{gallery.location}</p>
                    <button className="mt-2 bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 hover:bg-gray-200">
                      Follow
                    </button>
                  </div>
                </Link>
              );
            })
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