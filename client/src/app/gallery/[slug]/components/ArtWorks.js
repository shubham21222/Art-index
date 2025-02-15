'use client'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";

// GraphQL Query to Fetch Artworks
const WORKS_QUERY = `
query WorksFilterQuery(
  $partnerId: String!
  $input: FilterArtworksInput
  $aggregations: [ArtworkAggregation]
  $shouldFetchCounts: Boolean!
) {
  partner(id: $partnerId) {
    slug
    internalID
    filtered_artworks: filterArtworksConnection(first: 30, input: $input) {
      id
      counts {
        total(format: "0,0")
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
  const router = useRouter();
  const { slug } = router.query;

  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Artworks Data
  useEffect(() => {
    if (!slug) return; // Wait for slug to be available

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(ARTSY_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: WORKS_QUERY,
            variables: {
              partnerId: slug, // Use the slug as the partnerId
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
              aggregations: ["TOTAL", "MEDIUM", "MATERIALS_TERMS", "ARTIST_NATIONALITY", "ARTIST"],
              shouldFetchCounts: false,
            },
          }),
        });

        const { data, errors } = await response.json();

        if (errors) {
          throw new Error(errors[0].message || "Error fetching artworks");
        }

        const artworksData =
          data?.partner?.filtered_artworks?.edges?.map((edge) => edge.node) || [];
        setArtworks(artworksData);
      } catch (err) {
        setError(err.message || "An error occurred while fetching artworks.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
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
                alt={artwork.title}
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
            <h3 className="text-lg font-medium">{artwork.title}</h3>

            {/* Artist Name */}
            <p className="text-sm text-gray-600">{artwork.artistNames || "Unknown Artist"}</p>

            {/* Link to Artwork */}
            <a
              href={artwork.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm hover:underline"
            >
              View Artwork
            </a>
          </div>
        ))}
      </div>

      {/* No Artworks Found */}
      {artworks.length === 0 && <p>No artworks found for this gallery.</p>}
    </div>
  );
}