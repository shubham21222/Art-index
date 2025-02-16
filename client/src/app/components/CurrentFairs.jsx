"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";

const FAIRS_QUERY = `
  query fairsRoutes_FairsQuery {
    viewer {
      runningFairs: fairs(
        hasListing: true,
        hasFullFeature: true,
        sort: START_AT_DESC,
        size: 10,
        status: RUNNING
      ) {
        internalID
        name
        exhibitionPeriod
        image {
          cropped(width: 547, height: 410) {
            src
          }
        }
      }
    }
  }
`;

export default function CurrentFairs() {
  const [fairs, setFairs] = useState([]); // Store fetched fairs

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
            query: FAIRS_QUERY,
          }),
        });

        const { data } = await response.json();
        const fetchedFairs = data?.viewer?.runningFairs || [];
        setFairs(fetchedFairs);
      } catch (error) {
        console.error("Error fetching data from Artsy API:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="max-w-[1500px] mx-auto px-6 py-8 bg-gray-50">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Current Fairs & Events</h2>
          <p className="text-gray-500 text-lg mt-2">
            Discover the latest art fairs and events happening around the world.
          </p>
        </div>
        <a
          href="#"
          className="text-black text-sm font-medium hover:underline transition-colors duration-300"
        >
          View All Fairs & Events
        </a>
      </div>

      {/* Display Fairs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {fairs.length > 0 ? (
          fairs.map((fair, index) => (
            <Link
              key={index}
              href={`/fair/${fair.internalID}`}
              className="group relative flex flex-col overflow-hidden rounded-md shadow-md transition-shadow duration-300 hover:shadow-xl"
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

              {/* Image */}
              <div className="relative w-full h-[400px]">
                <Image
                  src={fair.image?.cropped?.src || "/placeholder.svg"}
                  alt={fair.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 transform group-hover:scale-105"
                />
              </div>

              {/* Details */}
              <div className="relative z-10 p-4">
                <h3 className="text-lg font-semibold text-white">{fair.name}</h3>
                <p className="text-sm text-gray-300">{fair.exhibitionPeriod}</p>
              </div>
            </Link>
          ))
        ) : (
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-[400px] rounded-md" />
          ))
        )}
      </div>
    </section>
  );
}