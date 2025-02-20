"use client";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"; // Import shadcn Skeleton
import { Button } from "@/components/ui/button"; // Import shadcn Button

// Define the GraphQL query with pagination support
const ARTWORKS_RAIL_QUERY = gql`
  query ArtworksRailRendererQuery($partnerId: String!, $after: String) {
    partner(id: $partnerId) {
      slug
      filterArtworksConnection(
        first: 20
        after: $after
        sort: "-partner_updated_at"
        forSale: true
      ) {
        edges {
          node {
            internalID
            href
            title
            date
            artistNames
            image {
              src: url(version: ["larger", "large"])
              width
              height
              blurhashDataURL
            }
            saleMessage
            collectingInstitution
            partner {
              name
              href
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

// Initialize Apollo Client
import { ApolloClient, InMemoryCache } from "@apollo/client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
const client = new ApolloClient({
    uri: "https://metaphysics-cdn.artsy.net/v2",
    cache: new InMemoryCache(),
});

export default function PartnerPage() {
    const params = useParams();
    const slug = params.slug;

    // Fetch data with pagination support
    const { loading, error, data, fetchMore } = useQuery(ARTWORKS_RAIL_QUERY, {
        variables: { partnerId: slug },
        client,
    });

    // Extract artworks and pagination info
    const artworks = data?.partner?.filterArtworksConnection?.edges || [];
    const pageInfo = data?.partner?.filterArtworksConnection?.pageInfo;

    // Handle "Load More" button click
    const handleLoadMore = () => {
        fetchMore({
            variables: {
                after: pageInfo.endCursor,
            },
            updateQuery: (prevResult, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prevResult;
                return {
                    partner: {
                        ...prevResult.partner,
                        filterArtworksConnection: {
                            ...fetchMoreResult.partner.filterArtworksConnection,
                            edges: [
                                ...prevResult.partner.filterArtworksConnection.edges,
                                ...fetchMoreResult.partner.filterArtworksConnection.edges,
                            ],
                        },
                    },
                };
            },
        });
    };

    // Conditional rendering for loading, error, and empty states
    if (loading && !data) {
        return (
            <div className="max-w-[1500px] mx-auto px-6 py-8">
                <Skeleton className="h-8 w-48 mb-4" /> {/* Skeleton for heading */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="flex flex-col space-y-2">
                            <Skeleton className="h-64 w-full rounded-md" /> {/* Skeleton for image */}
                            <Skeleton className="h-4 w-3/4" /> {/* Skeleton for title */}
                            <Skeleton className="h-4 w-1/2" /> {/* Skeleton for artist */}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    if (artworks.length === 0) {
        return <p>No artworks available for this partner.</p>;
    }

    return (
        <>
            <Header />
            <div className="max-w-[1500px] mx-auto px-6 md:pt-4 pt-8  py-8">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold capitalize">{slug}</h1> {/* Dynamic heading */}
                        <p className="text-gray-500 text-lg">Explore artworks from this gallery</p>
                    </div>
                </div>

                {/* Artworks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {artworks.map(({ node }) => (
                        <Link key={node.internalID} href={node.href} className="group flex flex-col cursor-pointer">
                            {/* Image */}
                            <div className="rounded-md overflow-hidden relative aspect-w-4 aspect-h-3">
                                {node.image?.src ? (
                                    <Image
                                        src={node.image.src}
                                        alt={node.title || "Artwork"}
                                        width={node.image.width}
                                        height={node.image.height}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-300 transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                        No Image Available
                                    </div>
                                )}
                            </div>

                            {/* Artwork Details */}
                            <div className="mt-2">
                                <h3 className="text-sm font-semibold">{node.title}</h3>
                                <p className="text-gray-500 text-xs">{node.artistNames}</p>
                                <p className="text-gray-500 text-xs">{node.date}</p>
                                <p className="text-black text-sm font-medium">{node.saleMessage}</p>
                                <p className="text-gray-500 text-xs italic">{node.collectingInstitution}</p>
                                <p className="text-gray-500 text-xs">
                                    Gallery:{" "}
                                    <span className="underline">
                                        <Link href={node.partner.href}>{node.partner.name}</Link>
                                    </span>
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Load More Button */}
                {pageInfo?.hasNextPage && (
                    <div className="flex justify-center mt-8">
                        <Button onClick={handleLoadMore} className="bg-black text-white hover:bg-gray-800">
                            Load More
                        </Button>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}