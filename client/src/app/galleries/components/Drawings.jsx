"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";

const PARTNERS_RAIL_QUERY = `
  query PartnersRailQuery(
    $id: String!
    $category: [String]
    $type: [PartnerClassification!]!
  ) {
    partnerCategory(id: $id) {
      name
      primary: partners(
        defaultProfilePublic: true
        eligibleForListing: true
        eligibleForPrimaryBucket: true
        partnerCategories: $category
        sort: RANDOM_SCORE_DESC
        type: $type
      ) {
        internalID
        slug
        name
        href
        initials
        locationsConnection(first: 15) {
          edges {
            node {
              city
              id
            }
          }
        }
        categories {
          name
          slug
          id
        }
        profile {
          image {
            cropped(width: 445, height: 334, version: ["wide", "large", "featured", "larger"]) {
              src
            }
          }
          id
        }
      }
      id
    }
  }
`;

export default function Drawings() {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0); // Track active slide index
  const [partners, setPartners] = useState([]); // Store fetched partners

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
            query: PARTNERS_RAIL_QUERY,
            variables: {
              id: "drawings", // Updated ID for the Drawings category
              category: "GALLERY",
              type: "GALLERY",
            },
          }),
        });

        const { data } = await response.json();
        const primaryPartners = data?.partnerCategory?.primary || [];
        setPartners(primaryPartners);
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
    <section className="px-6 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">Drawings</h2>
        <a href="#" className="text-sm font-medium underline">
          Explore All Galleries
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

        {/* Partners Carousel */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto space-x-6 scrollbar-hide pt-4"
        >
          {partners.length > 0 ? (
            partners.map((partner, index) => (
              <div key={index} className="w-[325px] shrink-0">
                {/* Image */}
                <div className="relative w-[325px] h-80">
                  <Image
                    src={partner.profile?.image?.cropped?.src || "/placeholder.svg"}
                    alt={partner.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                {/* Title */}
                <h3 className="mt-2 text-lg">{partner.name}</h3>
                {/* Location */}
                <p className="text-sm text-gray-900">
                  {partner.locationsConnection?.edges[0]?.node.city || "N/A"}
                </p>
                {/* Categories */}
                <p className="text-sm text-gray-500">
                  {partner.categories.map(cat => cat.name).join(", ") || "N/A"}
                </p>
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
            className={`h-[1px] w-[300px] rounded-full transition-colors duration-300 ${
              index === activeIndex ? "bg-black" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}