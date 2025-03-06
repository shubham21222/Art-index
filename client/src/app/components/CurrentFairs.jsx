"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useScroll, useTransform } from "framer-motion";

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

export default function CosmicArtFairs() {
  const [fairs, setFairs] = useState([]);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.5]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.95]);

  // Fetch data from Artsy API
  useEffect(() => {
    const fetchCosmicEvents = async () => {
      try {
        const response = await fetch(ARTSY_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: FAIRS_QUERY }),
        });

        const { data } = await response.json();
        setFairs(data?.viewer?.runningFairs || []);
      } catch (error) {
        console.error("Error fetching cosmic events:", error);
      }
    };

    fetchCosmicEvents();
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white py-16">
      {/* Cosmic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#ffffff10_1%,_transparent_50%)] animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header Section */}
      <motion.div
        style={{ opacity: headerOpacity, scale: headerScale }}
        className="relative z-10 max-w-[1500px] mx-auto px-6 mb-16 text-center"
      >
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 animate-text-glow">
          Cosmic Art Fairs
        </h2>
        <p className="mt-4 text-lg md:text-xl text-gray-300 animate-fade-in">
          Embark on a journey through the universe of art and creativity.
        </p>
        <a
          href="#"
          className="inline-block mt-6 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 glow-effect"
        >
          Explore All Cosmic Events
        </a>
      </motion.div>

      {/* Fairs Grid */}
      <div className="relative z-10 max-w-[1500px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {fairs.length > 0 ? (
          fairs.map((fair, index) => (
            <motion.div
              key={fair.internalID}
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15, type: "spring" }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="group relative flex flex-col rounded-xl overflow-hidden bg-gray-800/50 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {/* Holographic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

              {/* Image with Cosmic Effect */}
              <div className="relative w-full h-[450px] overflow-hidden">
                <Image
                  src={fair.image?.cropped?.src || "/placeholder.svg"}
                  alt={fair.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
              </div>

              {/* Event Details */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                <h3 className="text-2xl font-bold mb-2 drop-shadow-lg group-hover:text-purple-300 transition-colors duration-300">
                  {fair.name}
                </h3>
                <p className="text-sm text-gray-300 drop-shadow-md">{fair.exhibitionPeriod}</p>
                <Link
                  href={`/fair/${fair.internalID}`}
                  className="mt-4 inline-block text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-300"
                >
                  Enter the Cosmos →
                </Link>
              </div>
            </motion.div>
          ))
        ) : (
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="w-full h-[450px] rounded-xl bg-gray-700/50 animate-pulse"
            />
          ))
        )}
      </div>
    </section>
  );
}