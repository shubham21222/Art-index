"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // Import Link for client-side navigation
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ApolloClient, gql, InMemoryCache, useQuery } from "@apollo/client";

// Define the GraphQL query
const PARTNERS_RAIL_QUERY = gql`
  query PartnersRailQuery($id: String!, $category: [String], $type: [PartnerClassification!]!) {
    partnerCategory(id: $id) {
      name
      primary: partners(
        partnerCategories: $category
        sort: RANDOM_SCORE_DESC
        type: $type
      ) {
        internalID
        slug
        name
        href
        locationsConnection(first: 15) {
          edges {
            node {
              city
              id
            }
          }
        }
        profile {
          image {
            cropped(width: 445, height: 334, version: ["wide", "large", "featured", "larger"]) {
              src
              srcSet
            }
          }
          id
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

export default function GraffitiAndStreetArtCarousel() {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch data using the query
  const { loading, error, data } = useQuery(PARTNERS_RAIL_QUERY, {
    variables: {
      id: "graffiti-and-street-art",
      category: "GALLERY",
      type: "GALLERY",
    },
    client,
  });

  // Extract partner data
  const partners = data?.partnerCategory?.primary || [];

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

  if (partners.length === 0) {
    return <p>No partners available for this category.</p>;
  }

  return (
    <div className="px-6 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl">Graffiti & Street Art</h2>
          <p className="text-gray-500 text-2xl">Explore galleries and artists</p>
        </div>
        <a href="#" className="text-black text-sm font-medium hover:underline">
          View All Galleries
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
          className="overflow-x-auto scrollbar-hide pt-8 flex space-x-4 scroll-smooth px-2"
        >
          {partners.map((partner) => (
            <Link
              key={partner.internalID}
              href={`/visit-gallery/${partner.slug}`} // Use the slug for dynamic routing
              className="group flex-shrink-0 flex flex-col justify-end min-w-[220px] p-2 rounded-md cursor-pointer"
            >
              {/* Image */}
              <div className="rounded-md overflow-hidden">
                {partner.profile?.image?.cropped?.src ? (
                  <Image
                    src={partner.profile.image.cropped.src}
                    alt={partner.name}
                    width={220}
                    height={240}
                    className="object-cover transition-transform duration-300 transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-[240px] bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image Available
                  </div>
                )}
              </div>

              {/* Partner Name and Location */}
              <div className="mt-2">
                <h3 className="text-sm font-semibold">{partner.name}</h3>
                <p className="text-gray-500 italic text-xs">
                  {partner.locationsConnection.edges.map(({ node }) => node.city).join(", ")}
                </p>
              </div>
            </Link>
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