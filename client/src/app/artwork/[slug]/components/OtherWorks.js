'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, DollarSign } from "lucide-react";
import ContactModal from '@/app/components/ContactModal';

const ArtworkCard = ({ artwork }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  const handleContactClick = (e) => {
    e.preventDefault();
    const adjustedPrice = getAdjustedPrice(artwork);
    setSelectedArtwork({
      ...artwork,
      price: adjustedPrice
    });
    setIsModalOpen(true);
  };

  // Calculate adjusted price (10% higher)
  const getAdjustedPrice = (artwork) => {
    if (!artwork.sale_message) return null;
    const priceMatch = artwork.sale_message.match(/\$[\d,]+/);
    if (!priceMatch) return null;
    
    const originalPrice = parseFloat(priceMatch[0].replace(/[$,]/g, ''));
    return originalPrice ? `$${(originalPrice * 1.1).toLocaleString()}` : null;
  };

  return (
    <>
      <Card className="group mb-8 overflow-hidden bg-white transition-all duration-300 hover:shadow-lg">
        <Link href={artwork.href} className="block relative aspect-square overflow-hidden">
          <Image
            src={artwork.image?.resized?.src || "/placeholder-image.jpg"}
            alt={artwork.title || "Untitled Artwork"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </Link>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Link 
                href={artwork.href}
                className="font-medium text-lg text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-1"
              >
                {artwork.title || "Untitled"}
              </Link>
              <p className="text-sm text-gray-600">{artwork.artistNames || "Unknown Artist"}</p>
            </div>
            <Link 
              href={artwork.href}
              className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{artwork.date || "Date unknown"}</span>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              <Button 
                variant="secondary"
                size="sm"
                onClick={handleContactClick}
                className="w-full text-sm"
              >
                I’m Interested
              </Button>
              
              {/* {artwork.partner?.name && (
                <Link 
                  href={artwork.partner.href}
                  className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  <Badge variant="secondary" className="mr-2">Gallery</Badge>
                  {artwork.partner.name}
                </Link>
              )} */}
            </div>
          </div>
        </CardContent>
      </Card>

      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedArtwork(null);
        }}
        artwork={selectedArtwork}
      />
    </>
  );
};

const LoadingSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <CardContent className="p-4 space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-4 w-1/3" />
      <div className="pt-3 border-t border-gray-100 space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </CardContent>
  </Card>
);

export default function OtherWorks({ slug }) {
  const [otherWorks, setOtherWorks] = useState([]);
  const [gridTitle, setGridTitle] = useState("Other Works");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      console.log("Slug is not available yet.");
      return;
    }

    const fetchData = async () => {
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
              query OtherWorksQuery($slug: String!) @cacheable {
                artwork(id: $slug) {
                  ...OtherWorks_artwork
                  id
                }
              }

              fragment ArtworkGrid_artworks on ArtworkConnectionInterface {
                __isArtworkConnectionInterface: __typename
                edges {
                  __typename
                  node {
                    id
                    slug
                    href
                    internalID
                    image(includeAll: false) {
                      resized(width: 445, version: ["larger", "large"]) {
                        src
                        width
                        height
                      }
                      aspectRatio
                    }
                    title
                    artistNames
                    date
                    sale_message: saleMessage
                    partner {
                      name
                      href
                    }
                  }
                }
              }

              fragment OtherWorks_artwork on Artwork {
                contextGrids(includeRelatedArtworks: false) {
                  __typename
                  title
                  ctaTitle
                  ctaHref
                  artworksConnection(first: 8) {
                    ...ArtworkGrid_artworks
                  }
                }
              }
            `,
            variables: { slug },
          }),
        });

        const result = await response.json();
        if (result.errors) {
          console.error("GraphQL Errors:", result.errors);
          setError("Failed to fetch other works data.");
          return;
        }

        const grids = result.data.artwork.contextGrids;
        const validGrid = grids.find(
          (grid) => grid.artworksConnection?.edges?.length > 0
        );

        if (validGrid) {
          setGridTitle(validGrid.title || "Other Works");
          setOtherWorks(
            validGrid.artworksConnection.edges.map((edge) => edge.node)
          );
        } else {
          setOtherWorks([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An unexpected error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  return (
    <section className="max-w-[1500px] mx-auto mt-16 px-6">
      <CardHeader className="px-0">
        {/* <CardTitle className="text-3xl font-bold tracking-tight">
          {gridTitle}
        </CardTitle> */}
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))
        ) : error ? (
          <p className="col-span-full text-center text-red-500">{error}</p>
        ) : otherWorks.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No other works available.
          </p>
        ) : (
          otherWorks.map((artwork) => (
            <ArtworkCard key={artwork.internalID} artwork={artwork} />
          ))
        )}
      </div>
    </section>
  );
}