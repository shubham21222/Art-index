"use client";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ContactModal from "../../components/ContactModal";
import { motion } from "framer-motion";
import { GalleryVertical, ArrowRight, ArrowLeft } from "lucide-react";

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
            price
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState(null);

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

    const handleContactClick = (e, artwork) => {
        e.preventDefault();
        setSelectedArtwork(artwork);
        setIsModalOpen(true);
    };

    // Update the getPriceDisplay function to handle string price
    const getPriceDisplay = (artwork) => {
        if (!artwork.price) {
            return artwork.saleMessage || "Contact for pricing";
        }
        
        // Extract numeric value from price string (assuming format like "$1,000" or "£500")
        const numericPrice = parseFloat(artwork.price.replace(/[^0-9.-]+/g, ""));
        if (isNaN(numericPrice)) {
            return artwork.saleMessage || "Contact for pricing";
        }
        
        const minPrice = Math.floor(numericPrice * 0.9);
        const maxPrice = Math.ceil(numericPrice * 1.1);
        return `Price Range: ${minPrice} - ${maxPrice}`;
    };

    // Conditional rendering for loading, error, and empty states
    if (loading && !data) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-[1500px] mx-auto px-6 py-12">
                    <Skeleton className="h-12 w-64 mb-8" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="flex flex-col space-y-3">
                                <Skeleton className="h-72 w-full rounded-xl" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Gallery</h2>
                    <p className="text-gray-600">{error.message}</p>
                </div>
            </div>
        );
    }

    if (artworks.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <GalleryVertical className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Artworks Available</h2>
                    <p className="text-gray-600">This gallery currently has no artworks on display.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Header />
            <div className="max-w-[1500px] mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 capitalize">
                            {slug}
                        </h1>
                        <p className="text-gray-600 text-lg">Explore our curated collection of artworks</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <Button className="bg-black text-white hover:bg-gray-800 transition-colors duration-300">
                            View All Collections
                        </Button>
                    </div>
                </div>

                {/* Artworks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {artworks.map(({ node }, index) => (
                        <motion.div
                            key={node.internalID}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <Link href={node.href} className="block">
                                {/* Image */}
                                <div className="relative aspect-w-4 aspect-h-3 overflow-hidden">
                                    {node.image?.src ? (
                                        <Image
                                            src={node.image.src}
                                            alt={node.title || "Artwork"}
                                            width={node.image.width}
                                            height={node.image.height}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <GalleryVertical className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                {/* Artwork Details */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                                        {node.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">{node.artistNames}</p>
                                    <p className="text-sm text-gray-500 mb-3">{node.date}</p>
                                    <p className="text-base font-medium text-gray-900 mb-2">
                                        {getPriceDisplay(node)}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span className="italic">{node.collectingInstitution}</span>
                                        <span className="flex items-center">
                                            Gallery
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            {/* Contact Button */}
                            <div className="p-4 pt-0">
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    className="w-full bg-black text-white hover:bg-gray-800 transition-colors duration-300"
                                    onClick={(e) => handleContactClick(e, node)}
                                >
                                    Contact for Pricing
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Load More Button */}
                {pageInfo?.hasNextPage && (
                    <div className="flex justify-center mt-12">
                        <Button 
                            onClick={handleLoadMore} 
                            className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
                        >
                            Load More Artworks
                        </Button>
                    </div>
                )}
            </div>
            <Footer />

            {/* Contact Modal */}
            <ContactModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedArtwork(null);
                }}
                artwork={selectedArtwork ? {
                    title: selectedArtwork.title,
                    artistNames: selectedArtwork.artistNames,
                    price: getPriceDisplay(selectedArtwork),
                    id: selectedArtwork.internalID
                } : null}
            />
        </div>
    );
}