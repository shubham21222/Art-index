"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ApolloClient, gql, InMemoryCache, useQuery } from "@apollo/client";

// Define the GraphQL query for Viewing Rooms
const VIEWING_ROOMS_QUERY = gql`
  query viewingRoomRoutes_ViewingRoomsAppQuery($count: Int!, $after: String) {
    allViewingRooms: viewer {
      ...ViewingRoomsApp_allViewingRooms_2QE1um
    }
    featuredViewingRooms: viewingRoomsConnection(featured: true) {
      ...ViewingRoomsApp_featuredViewingRooms
    }
  }

  fragment ViewingRoomsApp_allViewingRooms_2QE1um on Viewer {
    ...ViewingRoomsLatestGrid_viewingRooms_2QE1um
  }

  fragment ViewingRoomsApp_featuredViewingRooms on ViewingRoomsConnection {
    ...ViewingRoomsFeaturedRail_featuredViewingRooms
  }

  fragment ViewingRoomsFeaturedRail_featuredViewingRooms on ViewingRoomsConnection {
    edges {
      node {
        status
        slug
        title
        image {
          imageURLs {
            normalized
          }
        }
        # distanceToOpen(short: true)
        # distanceToClose(short: true)
        partner {
          name
          id
        }
      }
    }
  }

  fragment ViewingRoomsLatestGrid_viewingRooms_2QE1um on Viewer {
    viewingRoomsConnection(first: $count, after: $after) {
      edges {
        node {
          slug
          status
          title
          image {
            imageURLs {
              normalized
            }
          }
        #   distanceToOpen(short: true)
        #   distanceToClose(short: true)
          partner {
            name
            id
          }
          __typename
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

// Initialize Apollo Client outside the component
const client = new ApolloClient({
  uri: "https://metaphysics-cdn.artsy.net/v2",
  cache: new InMemoryCache(),
});

export default function ViewingRoomsCarousel() {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch data using the query
  const { loading, error, data } = useQuery(VIEWING_ROOMS_QUERY, {
    variables: {
      count: 20,
      after: null,
    },
    client,
  });

  // Extract featured viewing rooms data
  const featuredViewingRooms =
    data?.featuredViewingRooms?.edges.map((edge) => edge.node) || [];

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

  if (featuredViewingRooms.length === 0) {
    return <p>No featured viewing rooms available.</p>;
  }

  return (
    <div className="px-6 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl">Viewing Rooms</h2>
          <p className="text-gray-500 text-2xl">Featured</p>
        </div>
        <a href="#" className="text-black text-sm font-medium hover:underline">
          View All Viewing Rooms
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

        {/* Featured Viewing Rooms Carousel */}
        <div
          ref={carouselRef}
          className="overflow-x-auto scrollbar-hide pt-8 flex space-x-4 scroll-smooth px-2"
        >
          {featuredViewingRooms.map((room) => (
            <div key={room.slug} className="group flex-shrink-0 flex flex-col justify-end min-w-[220px] p-2 rounded-md">
              {/* Image */}
              <div className="rounded-md overflow-hidden">
                {room.image?.imageURLs?.normalized ? (
                  <Image
                    src={room.image.imageURLs.normalized}
                    alt={room.title}
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

              {/* Room Title and Partner Name */}
              <div className="mt-2">
                <h3 className="text-sm font-semibold">{room.title}</h3>
                <p className="text-gray-500 italic text-xs">
                  {room.partner?.name || "Unknown Partner"}
                </p>
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