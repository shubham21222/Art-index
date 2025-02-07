"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

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
    <section className="px-6 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl ">Current Fairs & Events</h2>
        <a href="#" className="text-sm font-medium underline">
          View All Fairs & Events
        </a>
      </div>

      {/* Display Fairs */}
      <div className="grid grid-cols-1   md:grid-cols-3 gap-6">
        {fairs.length > 0 ? (
          fairs.map((fair, index) => (
            <div key={index} className=" space-y-2">
              {/* Image */}
              <div className="relative w-full h-[400px]">
                <Image
                  src={fair.image?.cropped?.src || "/placeholder.svg"}
                  alt={fair.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
              {/* Title */}
              <h3 className="text-lg font-semibold">{fair.name}</h3>
              {/* Date */}
              <p className="text-sm text-gray-600">{fair.exhibitionPeriod}</p>
            </div>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </section>
  );
}