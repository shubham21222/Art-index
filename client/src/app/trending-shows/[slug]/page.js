"use client";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
          large: url(version: "large")
        }
        title
        href
      }
      counts {
        artworks
        follows
      }
      blurb
      biographyBlurb(format: HTML) {
        text
      }
      formattedNationalityAndBirthday
      artworksConnection(first: 6, filter: IS_FOR_SALE, published: true) {
        edges {
          node {
            title
            date
            category
            priceCurrency
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
              small: url(version: "small")
              large: url(version: "large")
            }
          }
        }
      }
    }
  }
`;

export default function ArtistPage() {
  const params = useParams();
  const slug = params.slug;

  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Artist Data
  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await fetch(ARTSY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: ARTIST_QUERY,
          variables: { artistID: slug },
        }),
      });

      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors[0].message || "Error fetching artist data");
      }

      if (!data?.artist) {
        throw new Error("Artist not found");
      }

      setArtist(data.artist);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "An error occurred while fetching artist data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <Skeleton className="h-12 w-2/3 rounded-lg mb-4" />
          <Skeleton className="h-6 w-1/2 rounded-md mb-8" />
          
          {/* Hero section skeleton */}
          <Skeleton className="w-full h-[400px] rounded-xl mb-8" />
          
          {/* Biography skeleton */}
          <Skeleton className="h-8 w-48 rounded-md mb-4" />
          <div className="space-y-3 mb-8">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
          
          {/* Artworks skeleton */}
          <Skeleton className="h-8 w-64 rounded-md mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-1/3 rounded" />
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero section with cover artwork */}
      {artist.coverArtwork ? (
        <div 
          className="relative h-[500px] w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${artist.coverArtwork.image.large})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{artist.name}</h1>
              <p className="text-xl text-gray-200 mb-6">{artist.formattedNationalityAndBirthday}</p>
              <div className="flex space-x-4 mb-6">
                <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-md px-4 py-2">
                  <span className="text-white">{artist.counts?.artworks || 0} Artworks</span>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-md px-4 py-2">
                  <span className="text-white">{artist.counts?.follows || 0} Followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-[300px] flex items-center justify-center">
          <div className="text-center max-w-2xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{artist.name}</h1>
            <p className="text-xl text-gray-100">{artist.formattedNationalityAndBirthday}</p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Main content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-12">
          <div className="p-8">
            {/* Description */}
            <div className="prose max-w-none mb-8">
              <p className="text-lg leading-relaxed text-gray-700">{artist.meta.description}</p>
            </div>
            
            {/* Biography */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Biography
              </h2>
              <div 
                className="prose max-w-none text-gray-700" 
                dangerouslySetInnerHTML={{ 
                  __html: artist.biographyBlurb?.text || "<p>No biography available for this artist.</p>" 
                }}
              />
            </div>
          </div>
        </div>

        {/* Artworks for Sale Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Artworks for Sale
          </h2>
          
          {artist.artworksConnection.edges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artist.artworksConnection.edges.map(({ node }, index) => (
                <a 
                  href={node.href} 
                  key={index} 
                  className="group bg-white rounded-xl shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={node.image.large || node.image.small}
                      alt={node.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {node.availability === "for sale" && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        For Sale
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition">
                      {node.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{node.date}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {node.listPrice?.major
                          ? `${node.priceCurrency} ${parseInt(node.listPrice.major).toLocaleString()}`
                          : "Price on request"}
                      </span>
                      <span className="text-blue-600 text-sm font-medium group-hover:underline">
                        View →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No artworks available for sale at this time.</p>
              <a 
                href={artist.href} 
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                View Artist Profile on Artsy
              </a>
            </div>
          )}
        </div>
        
        {/* View on Artsy button */}
        
      </div>
      
      <Footer />
    </div>
  );
}