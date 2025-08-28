'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Palette, 
  MapPin, 
  Calendar,
  Eye,
  Heart,
  Share2,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ArtistDetailPage({ params }) {
  const { slug } = use(params);
  const router = useRouter();
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch artist details with artworks
  const fetchArtistDetails = async (artistSlug) => {
    try {
      const query = `
        query ArtistWorksForSaleRouteArtworksQuery(
          $artistID: String!
          $aggregations: [ArtworkAggregation]
          $input: FilterArtworksInput!
        ) @cacheable {
          artist(id: $artistID) {
            ...ArtistArtworkFilter_artist_2VV6jB
            sidebarAggregations: filterArtworksConnection(aggregations: $aggregations, first: 1) {
              counts {
                total
              }
              aggregations {
                slice
                counts {
                  name
                  value
                  count
                }
              }
              id
            }
            id
          }
        }

        fragment ArtistArtworkFilter_artist_2VV6jB on Artist {
          counts {
            partner_shows: partnerShows
            for_sale_artworks: forSaleArtworks
            ecommerce_artworks: ecommerceArtworks
            auction_artworks: auctionArtworks
            artworks
            has_make_offer_artworks: hasMakeOfferArtworks
          }
          filtered_artworks: filterArtworksConnection(first: 30, input: $input) {
            id
            counts {
              total(format: "0,0")
            }
            ...ArtworkFilterArtworkGrid_filtered_artworks
          }
          internalID
          name
          slug
          meta(page: ARTWORKS) {
            title
          }
        }

        fragment ArtworkFilterArtworkGrid_filtered_artworks on FilterArtworksConnection {
          id
          pageInfo {
            hasNextPage
            endCursor
          }
          pageCursors {
            ...Pagination_pageCursors
          }
          edges {
            node {
              id
            }
          }
          ...ArtworkGrid_artworks
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
                aspectRatio
              }
              ...GridItem_artwork
              ...FlatGridItem_artwork
            }
            ... on Node {
              __isNode: __typename
              id
            }
          }
        }

        fragment GridItem_artwork on Artwork {
          internalID
          title
          imageTitle
          image(includeAll: false) {
            internalID
            placeholder
            url(version: ["larger", "large"])
            aspectRatio
            versions
          }
          artistNames
          href
          ...Metadata_artwork
          ...ExclusiveAccessBadge_artwork
        }

        fragment FlatGridItem_artwork on Artwork {
          ...Metadata_artwork
          sale {
            extendedBiddingPeriodMinutes
            extendedBiddingIntervalMinutes
            startAt
            isOpen
            id
          }
          saleArtwork {
            endAt
            extendedBiddingEndAt
            lotID
            id
          }
          internalID
          title
          image_title: imageTitle
          image(includeAll: false) {
            resized(width: 445, version: ["larger", "large"]) {
              src
              srcSet
              width
              height
            }
          }
          artistNames
          href
        }

        fragment Metadata_artwork on Artwork {
          ...Details_artwork
          internalID
          href
          sale {
            isOpen
            id
          }
        }

        fragment Details_artwork on Artwork {
          internalID
          href
          title
          date
          collectorSignals {
            primaryLabel
            auction {
              bidCount
              lotClosesAt
              liveBiddingStarted
              registrationEndsAt
              onlineBiddingExtended
            }
          }
          sale_message: saleMessage
          cultural_maker: culturalMaker
          artist(shallow: true) {
            targetSupply {
              isP1
            }
            id
          }
          marketPriceInsights {
            demandRank
          }
          artists(shallow: true) {
            id
            href
            name
          }
          collecting_institution: collectingInstitution
          partner(shallow: true) {
            name
            href
            id
          }
          sale {
            endAt
            cascadingEndTimeIntervalMinutes
            extendedBiddingIntervalMinutes
            startAt
            is_auction: isAuction
            is_closed: isClosed
            id
          }
          sale_artwork: saleArtwork {
            lotID
            lotLabel
            endAt
            extendedBiddingEndAt
            formattedEndDateTime
            counts {
              bidder_positions: bidderPositions
            }
            highest_bid: highestBid {
              display
            }
            opening_bid: openingBid {
              display
            }
            id
          }
          ...PrimaryLabelLine_artwork
          ...BidTimerLine_artwork
          ...HoverDetails_artwork
        }

        fragment PrimaryLabelLine_artwork on Artwork {
          internalID
          collectorSignals {
            primaryLabel
            partnerOffer {
              endAt
              priceWithDiscount {
                display
              }
              id
            }
          }
        }

        fragment BidTimerLine_artwork on Artwork {
          saleArtwork {
            lotID
            id
          }
          collectorSignals {
            auction {
              lotClosesAt
              registrationEndsAt
              onlineBiddingExtended
            }
          }
        }

        fragment HoverDetails_artwork on Artwork {
          internalID
          attributionClass {
            name
            id
          }
          mediumType {
            filterGene {
              name
              id
            }
          }
        }

        fragment ExclusiveAccessBadge_artwork on Artwork {
          isUnlisted
        }

        fragment Pagination_pageCursors on PageCursors {
          around {
            cursor
            page
            isCurrent
          }
          first {
            cursor
            page
            isCurrent
          }
          last {
            cursor
            page
            isCurrent
          }
          previous {
            cursor
            page
          }
        }
      `;

      const response = await fetch('/api/artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            artistID: artistSlug,
            aggregations: ["MEDIUM", "TOTAL", "MAJOR_PERIOD", "PARTNER", "LOCATION_CITY", "MATERIALS_TERMS", "SIMPLE_PRICE_HISTOGRAM", "ARTIST_SERIES"],
            input: {
              sort: "-decayed_merch"
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch artist details');
      }

      const data = await response.json();
      
      if (data.data?.artist) {
        const artistData = data.data.artist;
        setArtist(artistData);
        setArtworks(artistData.filtered_artworks?.edges || []);
        return artistData;
      } else {
        throw new Error('Artist not found');
      }
    } catch (error) {
      console.error('Error fetching artist details:', error);
      toast.error('Failed to load artist details. Please try again.');
      return null;
    }
  };

  // Load artist data
  useEffect(() => {
    const loadArtistData = async () => {
      setLoading(true);
      setError(null);

      try {
        const artistData = await fetchArtistDetails(slug);
        
        if (artistData) {
          toast.success(`Loaded ${artistData.name}'s profile`);
        } else {
          setError('Artist not found');
          toast.error('Artist not found. Please check the URL and try again.');
        }
      } catch (error) {
        console.error('Error loading artist:', error);
        setError('Failed to load artist data');
        toast.error('Failed to load artist data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadArtistData();
  }, [slug]);

  // Handle favorite artist
  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (!isFavorited) {
      toast.success('Added to favorites!');
    } else {
      toast.success('Removed from favorites!');
    }
  };

  // Handle share artist
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: artist?.name || 'Artist',
          text: `Check out this amazing artist: ${artist?.name}`,
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share. Please try again.');
    }
  };

  // Handle artwork click
  const handleArtworkClick = (artwork) => {
    const artworkSlug = artwork.node.slug || artwork.node.href?.split('/').pop() || artwork.node.internalID;
    router.push(`/artwork/${artworkSlug}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <Skeleton className="h-8 w-48 mb-4" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Skeleton className="w-full h-96 rounded-lg mb-6" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="lg:col-span-2">
                <Skeleton className="h-8 w-1/2 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="w-full h-64 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !artist) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The artist you are looking for does not exist.'}</p>
            <Link href="/all-artists">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Artists
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link href="/all-artists" className="text-blue-600 hover:text-blue-800 flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Artists
            </Link>
          </nav>

          {/* Artist Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Artist Image/Profile */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                  {artist.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{artist.name}</h1>
                  {artist.nationality && (
                    <p className="text-lg text-gray-600 mb-2">{artist.nationality}</p>
                  )}
                  {artist.hometown && (
                    <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {artist.hometown}
                    </div>
                  )}
                  {(artist.birthday || artist.deathday) && (
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {artist.birthday && artist.deathday 
                        ? `${artist.birthday} - ${artist.deathday}`
                        : artist.birthday || artist.deathday
                      }
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={handleFavorite}
                    className={isFavorited ? 'bg-red-50 border-red-200 text-red-600' : ''}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                    {isFavorited ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                  {/* <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Artist
                  </Button> */}
                </div>
              </div>
            </div>

            {/* Artist Bio */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Palette className="w-6 h-6 mr-2 text-blue-600" />
                    About {artist.name}
                  </h2>
                  
                  {artist.biography ? (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {artist.biography}
                      </p>
                    </div>
                  ) : artist.blurb ? (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {artist.blurb}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      Biography not available for this artist.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Artworks Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <ImageIcon className="w-6 h-6 mr-2 text-blue-600" />
                Artworks by {artist.name}
              </h2>
              <div className="flex items-center space-x-4">
                {artist.counts && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{artist.counts.for_sale_artworks || 0} for sale</span>
                    <span>•</span>
                    <span>{artist.counts.artworks || 0} total</span>
                  </div>
                )}
                <Badge variant="secondary">
                  {artworks.length} artworks
                </Badge>
              </div>
            </div>

            {artworks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {artworks.map((artworkItem) => (
                  <Card 
                    key={artworkItem.node.internalID} 
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleArtworkClick(artworkItem)}
                  >
                    <div className="relative w-full h-48 overflow-hidden">
                      {artworkItem.node.image?.resized?.src ? (
                        <Image
                          src={artworkItem.node.image.resized.src}
                          alt={artworkItem.node.title || 'Artwork'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : artworkItem.node.image?.url ? (
                        <Image
                          src={artworkItem.node.image.url}
                          alt={artworkItem.node.title || 'Artwork'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Price Badge */}
                      {/* {artworkItem.node.sale_message && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white text-gray-900 font-semibold shadow-sm">
                            {artworkItem.node.sale_message}
                          </Badge>
                        </div>
                      )} */}
                      
                      {/* Attribution Badge */}
                      {/* {artworkItem.node.attributionClass?.name && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="outline" className="bg-white/90 text-xs">
                            {artworkItem.node.attributionClass.name}
                          </Badge>
                        </div>
                      )} */}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                        {artworkItem.node.title || 'Untitled'}
                      </h3>
                      {artworkItem.node.date && (
                        <p className="text-xs text-gray-600 mb-1">
                          {artworkItem.node.date}
                        </p>
                      )}
                      {artworkItem.node.mediumType?.filterGene?.name && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {artworkItem.node.mediumType.filterGene.name}
                        </p>
                      )}
                      {artworkItem.node.partner?.name && (
                        <p className="text-xs text-blue-600 font-medium">
                          {artworkItem.node.partner.name}
                        </p>
                      )}
                      {/* {artworkItem.node.sale_message && (
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          {artworkItem.node.sale_message}
                        </p>
                      )} */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No artworks available
                </h3>
                <p className="text-gray-600">
                  No artworks have been uploaded for this artist yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 