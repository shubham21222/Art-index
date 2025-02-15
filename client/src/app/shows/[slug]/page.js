import { notFound } from "next/navigation";

// Define the GraphQL query
const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";
const ARTIST_QUERY = `
  query artistRoutes_ArtistAppQuery($artistID: String!) {
    artist(id: $artistID) {
      slug
      name
      nationality
      birthday
      deathday
      gender
      href
      meta {
        description
        title
      }
      coverArtwork {
        image {
          large
        }
        title
        href
      }
      counts {
        artworks
        follows
      }
      blurb
      artworks_connection(first: 5, filter: IS_FOR_SALE, published: true) {
        edges {
          node {
            title
            date
            category
            price_currency
            listPrice {
              __typename
              ... on Money {
                major
                currencyCode
              }
            }
            availability
            href
            image {
              small
              large
            }
          }
        }
      }
    }
  }
`;

// Server Component to Fetch and Display Artist Data
export default async function ArtistPage({ params }) {
  const { slug } = params;

  // Log the slug extracted from the URL
  console.log("Slug extracted from URL:", slug);

  // Fetch artist data from the Artsy API
  const fetchData = async () => {
    try {
      const response = await fetch(ARTSY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: ARTIST_QUERY,
          variables: { artistID: slug }, // Pass the slug as artistID
        }),
      });

      // Log the raw API response
      console.log("Raw API Response:", response);

      const { data } = await response.json();

      // Log the parsed API data
      console.log("Parsed API Data:", data);

      if (!data?.artist) {
        throw new Error("Artist not found");
      }

      return data.artist;
    } catch (error) {
      console.error("Error fetching artist data:", error);
      notFound(); // Show 404 page if artist is not found
    }
  };

  const artist = await fetchData();

  // Log the final artist data being used in the component
  console.log("Final Artist Data:", artist);

  return (
    <div className="px-6 py-8">
      {/* Artist Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{artist.name}</h1>
        <p className="text-gray-600">
          {artist.nationality}, {artist.birthday}–{artist.deathday || "Present"}
        </p>
        <p className="mt-4">{artist.meta.description}</p>
      </header>

      {/* Cover Artwork */}
      {artist.coverArtwork && (
        <div className="mb-8">
          <img
            src={artist.coverArtwork.image.large}
            alt={artist.coverArtwork.title}
            className="w-full rounded-md"
          />
          <p className="mt-2 text-sm text-gray-600">
            Cover Artwork:{" "}
            <a href={artist.coverArtwork.href} className="underline">
              {artist.coverArtwork.title}
            </a>
          </p>
        </div>
      )}

      {/* Biography */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold">Biography</h2>
        <p className="mt-2">{artist.blurb}</p>
      </section>

      {/* Artworks */}
      <section>
        <h2 className="text-xl font-semibold">Artworks for Sale</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {artist.artworks_connection.edges.map(({ node }, index) => (
            <div key={index} className="space-y-2">
              <img
                src={node.image.small}
                alt={node.title}
                className="w-full h-48 object-cover rounded-md"
              />
              <h3 className="text-lg font-medium">{node.title}</h3>
              <p className="text-gray-600">{node.date}</p>
              <p className="text-gray-700">
                {node.listPrice?.major ? `${node.price_currency} ${node.listPrice.major}` : "Price on request"}
              </p>
              <a href={node.href} className="text-blue-500 underline">
                View Details
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}