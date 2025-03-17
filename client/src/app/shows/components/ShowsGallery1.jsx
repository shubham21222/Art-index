"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you're using shadcn/ui Skeleton
import Link from "next/link";

const API_URL = "/api/shows";

export default function ShowsGallery() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchShows = async (after = null) => {
    try {
      setLoading(after ? false : true);
      setLoadingMore(!!after);

      const url = new URL(API_URL, window.location.origin);
      url.searchParams.append("limit", "10");
      if (after) url.searchParams.append("after", after);

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch shows");

      const { shows: fetchedShows, pageInfo } = await response.json();

      setShows((prevShows) => (after ? [...prevShows, ...fetchedShows] : fetchedShows));
      setHasNextPage(pageInfo.hasNextPage);
      setEndCursor(pageInfo.endCursor);
    } catch (error) {
      console.error("Error fetching shows:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const masonryOptions = {
    default: 4,
    1280: 4,
    1024: 3,
    640: 2,
  };

  // Group shows by partner
  const groupedShows = shows.reduce((acc, show) => {
    const partnerName = show.partnerName;
    if (!acc[partnerName]) acc[partnerName] = [];
    acc[partnerName].push(show);
    return acc;
  }, {});

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-8 border-t border-gray-700">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
        Current Museum & Gallery Shows
      </h1>

      {loading ? (
        <Masonry
          breakpointCols={masonryOptions}
          className="flex -ml-4 w-auto"
          columnClassName="pl-4 bg-transparent"
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="mb-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <Skeleton className="w-full h-[350px] rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-4 w-2/5" />
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      ) : Object.keys(groupedShows).length > 0 ? (
        Object.entries(groupedShows).map(([partnerName, shows]) => (
          <div key={partnerName} className="mb-12">
            {/* Partner and Featured Show Section */}
            <div className="mb-6">
              <p className="text-xl md:text-2xl font-medium text-gray-900">
                {partnerName}
              </p>
              <p className="text-lg md:text-xl text-gray-700">
                {shows[0].name} ({shows[0].startDate} - {shows[0].endDate})
              </p>
            </div>

            {/* Artworks in Masonry Layout */}
            <Masonry
              breakpointCols={masonryOptions}
              className="flex -ml-4 w-auto"
              columnClassName="pl-4 bg-transparent"
            >
              {shows.flatMap((show) =>
                show.artworks.map((artwork) => (
                  <Link
                    key={artwork.href}
                    href={`/artwork/${artwork.slug}`}
                    className="mb-4 block cursor-pointer"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="relative w-full aspect-[4/3]">
                        <Image
                          src={artwork.image}
                          alt={artwork.title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-base md:text-lg line-clamp-1">
                          {artwork.title}
                        </h4>
                        <p className="text-sm text-gray-600">{artwork.artistNames}</p>
                        <p className="text-sm text-gray-600">{artwork.date}</p>
                        <p className="text-sm text-gray-600 font-medium">
                          {artwork.saleMessage}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </Masonry>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No shows found.</p>
      )}

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => fetchShows(endCursor)}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}