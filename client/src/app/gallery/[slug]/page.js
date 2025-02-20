"use client";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";

const WORKS_QUERY = `
query WorksFilterQuery(
  $partnerId: String!
  $input: FilterArtworksInput
  $first: Int!
  $after: String
) {
  partner(id: $partnerId) {
    slug
    internalID
    filtered_artworks: filterArtworksConnection(first: $first, after: $after, input: $input) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id    
          title
          image(includeAll: false) {
            resized(width: 445, version: ["larger", "large"]) {
              src
              width
              height
            }
          }
          artistNames
          href
        }
      }
    }
  }
}
`;

export default function GalleryPage() {
    const params = useParams();
    const slug = params.slug;

    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [endCursor, setEndCursor] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Fetch Artworks Data
    const fetchData = async (fetchMore = false) => {
        try {
            if (fetchMore) {
                setIsLoadingMore(true);
            } else {
                setLoading(true);
            }
      
            const response = await fetch(ARTSY_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: WORKS_QUERY,
                    variables: {
                        partnerId: slug,
                        first: 100, // Using a smaller batch size for better pagination
                        after: fetchMore ? endCursor : null,
                        input: {
                            additionalGeneIDs: [],
                            artistIDs: [],
                            artistNationalities: [],
                            artistSeriesIDs: [],
                            attributionClass: [],
                            colors: [],
                            height: "*-*",
                            locationCities: [],
                            majorPeriods: [],
                            materialsTerms: [],
                            page: 1,
                            partnerIDs: [],
                            priceRange: "*-*",
                            sizes: [],
                            sort: "-decayed_merch",
                            width: "*-*",
                        },
                    },
                }),
            });
      
            const { data, errors } = await response.json();
      
            if (errors) {
                throw new Error(errors[0].message || "Error fetching artworks");
            }
      
            const newArtworksData = 
                data?.partner?.filtered_artworks?.edges?.map((edge) => edge.node) || [];
            
            // Get the new pagination info
            const newHasNextPage = data?.partner?.filtered_artworks?.pageInfo?.hasNextPage || false;
            const newEndCursor = data?.partner?.filtered_artworks?.pageInfo?.endCursor || null;
            
            // Update state with new data
            if (fetchMore) {
                setArtworks(prevArtworks => [...prevArtworks, ...newArtworksData]);
            } else {
                setArtworks(newArtworksData);
            }
            
            setHasNextPage(newHasNextPage);
            setEndCursor(newEndCursor);
            
            console.log("Has next page:", newHasNextPage);
            console.log("End cursor:", newEndCursor);
            
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.message || "An error occurred while fetching artworks.");
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!slug) return;
        fetchData();
    }, [slug]);

    if (loading && !isLoadingMore) {
        return (
            <div className="px-6 py-8">
                <Header />
                <h1 className="text-3xl font-bold mb-4">Gallery: {slug}</h1>
                {/* Skeleton Loading */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                            <Skeleton className="w-full h-60 rounded-md" />
                            <Skeleton className="w-3/4 h-6 rounded-md" />
                            <Skeleton className="w-1/2 h-4 rounded-md" />
                        </div>
                    ))}
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-6 py-8">
                <Header />
                <div className="text-red-500 text-center mt-10">
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="px-6 py-8">
                {/* Header */}
                <h1 className="text-3xl font-bold mb-4">Gallery: {slug}</h1>

                {/* Artworks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artworks.map((artwork) => (
                        <div key={artwork.id} className="space-y-2">
                            {/* Image */}
                            {artwork.image?.resized ? (
                                <img
                                    src={artwork.image.resized.src}
                                    alt={artwork.title || "Artwork"}
                                    width={artwork.image.resized.width}
                                    height={artwork.image.resized.height}
                                    className="rounded-md w-full h-auto"
                                />
                            ) : (
                                <div className="w-full h-60 bg-gray-200 rounded-md flex items-center justify-center">
                                    <span className="text-gray-500">No Image Available</span>
                                </div>
                            )}

                            {/* Title */}
                            <h3 className="text-lg font-medium">{artwork.title || "Untitled"}</h3>

                            {/* Artist Name */}
                            <p className="text-sm text-gray-600">{artwork.artistNames || "Unknown Artist"}</p>

                            {/* Link to Artwork */}
                            {artwork.href && (
                                <a
                                    href={artwork.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 text-sm hover:underline"
                                >
                                    View Artwork
                                </a>
                            )}
                        </div>
                    ))}
                </div>

                {/* No Artworks Found */}
                {artworks.length === 0 && !loading && (
                    <p className="text-center mt-6">No artworks found for this gallery.</p>
                )}
                
                {/* Load More Button */}
                {hasNextPage ? (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => fetchData(true)}
                            disabled={isLoadingMore}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {isLoadingMore ? "Loading..." : "Load More"}
                        </button>
                    </div>
                ) : artworks.length > 0 && (
                    <p className="text-center mt-6 text-gray-500">All artworks have been loaded.</p>
                )}
            </div>
            <Footer />
        </>
    );
}