'use client';
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ShowArtworks from "./components/ShowArtworks";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton from shadcn/ui

const ShowPage = () => {
  const params = useParams(); // Extract dynamic route parameters
  const slug = params.slug; // Get the 'slug' parameter

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchShowData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("https://metaphysics-cdn.artsy.net/v2", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query ShowRoutes_ShowInfoQuery($slug: String!) {
                show(id: $slug) @principalField {
                  ...ShowInfo_show
                  id
                }
              }

              fragment EntityHeaderPartner_partner on Partner {
                internalID
                type
                slug
                href
                name
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
                  internalID
                  avatar: image {
                    cropped(width: 45, height: 45) {
                      src
                      srcSet
                    }
                  }
                  icon {
                    cropped(width: 45, height: 45, version: ["untouched-png", "large", "square"]) {
                      src
                      srcSet
                    }
                  }
                  id
                }
              }

              fragment ShowHours_show on Show {
                location {
                  ...ShowLocationHours_location
                  id
                }
                fair {
                  location {
                    ...ShowLocationHours_location
                    id
                  }
                  id
                }
              }

              fragment ShowInfoLocation_show on Show {
                fair {
                  location {
                    display
                    address
                    address2
                    city
                    state
                    country
                    summary
                    id
                  }
                  id
                }
                location {
                  display
                  address
                  address2
                  city
                  state
                  country
                  summary
                  id
                }
              }

              fragment ShowInfo_show on Show {
                ...ShowInfoLocation_show
                ...ShowHours_show
                name
                about: description
                pressRelease(format: HTML)
                hasLocation
                events {
                  dateTimeRange
                  description
                  eventType
                  title
                }
                partner {
                  __typename
                  ... on Partner {
                    ...EntityHeaderPartner_partner
                    type
                  }
                  ... on Node {
                    __isNode: __typename
                    id
                  }
                  ... on ExternalPartner {
                    id
                  }
                }
              }

              fragment ShowLocationHours_location on Location {
                openingHours {
                  __typename
                  ... on OpeningHoursArray {
                    schedules {
                      days
                      hours
                    }
                  }
                  ... on OpeningHoursText {
                    text
                  }
                }
              }
            `,
            variables: { slug },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message || "GraphQL query failed");
        }

        setShow(result.data?.show || null);
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchShowData();
  }, [slug]);

  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <>
      <Header />
      <div className="max-w-[1500px] mx-auto p-4">
        {/* Title and Description */}
        {loading ? (
          <div>
            <Skeleton className="h-8 w-64 mb-4" /> {/* Title Skeleton */}
            <Skeleton className="h-4 w-full mb-6" /> {/* Description Skeleton */}
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{show.name}</h1>
            <p className="text-gray-600 mt-2">{show.about || "No description available."}</p>
          </>
        )}

        {/* Partner Information */}
        {loading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-6 w-48" /> {/* Section Title Skeleton */}
            <Skeleton className="h-4 w-full" /> {/* Name Skeleton */}
            <Skeleton className="h-4 w-full" /> {/* Type Skeleton */}
            <Skeleton className="h-4 w-full" /> {/* Categories Skeleton */}
            <Skeleton className="h-4 w-full" /> {/* Locations Skeleton */}
          </div>
        ) : (
          show.partner && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Partner Information</h2>
              <p>
                <strong>Name:</strong> {show.partner.name}
              </p>
              <p>
                <strong>Type:</strong> {show.partner.type}
              </p>
              <p>
                <strong>Categories:</strong>{" "}
                {show.partner.categories.map((category) => category.name).join(", ")}
              </p>
              <p>
                <strong>Locations:</strong>{" "}
                {show.partner.locationsConnection.edges
                  .map((edge) => edge.node.city)
                  .join(", ")}
              </p>
            </div>
          )
        )}

        {/* Location Information */}
        {loading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-6 w-48" /> {/* Section Title Skeleton */}
            <Skeleton className="h-4 w-full" /> {/* Address Skeleton */}
            <Skeleton className="h-4 w-full" /> {/* City Skeleton */}
            <Skeleton className="h-4 w-full" /> {/* Country Skeleton */}
          </div>
        ) : (
          show.location && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Location Information</h2>
              <p>
                <strong>Address:</strong> {show.location.display || "Not Available"}
              </p>
              <p>
                <strong>City:</strong> {show.location.city || "Not Available"}
              </p>
              <p>
                <strong>Country:</strong> {show.location.country || "Not Available"}
              </p>
            </div>
          )
        )}

        {/* Events */}
        {loading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-6 w-48" /> {/* Section Title Skeleton */}
            <Skeleton className="h-4 w-full" /> {/* Event Skeleton */}
            <Skeleton className="h-4 w-full" /> {/* Event Skeleton */}
          </div>
        ) : (
          show.events.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Events</h2>
              <ul>
                {show.events.map((event, index) => (
                  <li key={index}>
                    <strong>{event.title}:</strong> {event.description} ({event.dateTimeRange})
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>

      {/* Artworks Section */}
      <div className="max-w-[1500px] mx-auto p-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="w-full h-[350px] rounded-lg" /> {/* Image Skeleton */}
                <Skeleton className="h-6 w-full" /> {/* Title Skeleton */}
                <Skeleton className="h-4 w-3/4" /> {/* Artist Names Skeleton */}
              </div>
            ))}
          </div>
        ) : (
          <ShowArtworks slug={slug} />
        )}
      </div>

      <Footer />
    </>
  );
};

export default ShowPage;