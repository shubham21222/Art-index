'use client';
import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Tags, User, ZoomIn, Share2, Heart, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

const ARTSY_API_URL = 'https://metaphysics-cdn.artsy.net/v2';

const ARTWORK_QUERY = `
  query artworkRoutes_ArtworkQuery($artworkID: String!) {
    artworkResult(id: $artworkID) {
      ... on Artwork {
        title
        date
        category
        image {
          url
        }
        meta {
          description
        }
        artists {
          name
          bio
          image {
            url
          }
        }
        medium
        dimensions {
          in
          cm
        }
      }
    }
  }
`;

// Loading component with enhanced animation
const LoadingState = () => (
  <div className="flex justify-center items-center min-h-[80vh]">
    <div className="w-full max-w-6xl px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="animate-pulse space-y-8"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <div className="h-[60vh] bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="w-full md:w-1/3 space-y-4">
            <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
            <div className="h-32 bg-gray-200 rounded-lg mt-8"></div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

// Error component with enhanced design
const ErrorState = ({ message }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col justify-center items-center min-h-[70vh] px-4"
  >
    <div className="text-red-500 text-2xl font-semibold mb-6 text-center">
      {message || 'Something went wrong'}
    </div>
    <Link 
      href="/"
      className="group flex items-center px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all"
    >
      <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
      Return to Home
    </Link>
  </motion.div>
);

// Image Modal for zoom view
const ImageModal = ({ isOpen, onClose, imageUrl, title }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-7xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <span className="sr-only">Close</span>
          ×
        </button>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </motion.div>
  );
};

const ArtworkDetails = ({ artwork }) => {
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  if (!artwork) return null;

  const {
    title = 'Untitled',
    date = 'Date unknown',
    category = 'Uncategorized',
    image = {},
    meta = {},
    artists = [],
    medium = 'Unknown medium',
    dimensions = {}
  } = artwork;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Image */}
          <div className="w-full md:w-2/3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="relative group rounded-2xl overflow-hidden bg-white shadow-xl"
            >
              {image?.url ? (
                <>
                  <img
                    src={image.url}
                    alt={title}
                    className="w-full h-[60vh] object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-artwork.jpg';
                      e.target.alt = 'Image not available';
                    }}
                  />
                  <button
                    onClick={() => setImageModalOpen(true)}
                    className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <ZoomIn className="w-12 h-12 text-white" />
                  </button>
                </>
              ) : (
                <div className="w-full h-[60vh] bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">Image not available</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Details */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {title}
              </h1>

              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <User className="w-5 h-5 mr-2" />
                  <span className="font-medium">Artist:</span>
                  <span className="ml-2">
                    {artists?.length > 0 
                      ? artists.map((artist) => artist?.name || 'Unknown Artist').join(', ')
                      : 'Unknown Artist'}
                  </span>
                </div>

                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">{date}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <Tags className="w-5 h-5 mr-2" />
                  <span className="font-medium">Category:</span>
                  <span className="ml-2">{category}</span>
                </div>

                {medium && (
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium">Medium:</span>
                    <span className="ml-2">{medium}</span>
                  </div>
                )}

                {dimensions?.in && (
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium">Dimensions:</span>
                    <span className="ml-2">{dimensions.in}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 mt-6">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-full transition-colors ${
                    isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                {/* <button className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
                  <Share2 className="w-6 h-6" />
                </button> */}
              </div>
            </div>

            {meta?.description && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-3">About the Artwork</h2>
                <p className="text-gray-700 leading-relaxed">
                  {meta.description}
                </p>
              </div>
            )}

            {artists?.[0]?.bio && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-3">About the Artist</h2>
                <div className="flex items-center space-x-4 mb-4">
                  {artists[0].image?.url && (
                    <img
                      src={artists[0].image.url}
                      alt={artists[0].name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{artists[0].name}</h3>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {artists[0].bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={image?.url}
        title={title}
      />
    </motion.div>
  );
};

const ArtistDetailPage = ({ params }) => {
  // Unwrap `params` using React.use()
  const unwrappedParams = React.use(params);
  const { slug } = unwrappedParams || {};

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setError('No artwork ID provided');
      setLoading(false);
      return;
    }

    const fetchArtwork = async () => {
      try {
        const response = await fetch(ARTSY_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: ARTWORK_QUERY,
            variables: {
              artworkID: slug,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch artwork (Status: ${response.status})`);
        }

        const { data, errors } = await response.json();

        if (errors?.length > 0) {
          throw new Error(errors[0]?.message || 'GraphQL query failed');
        }

        if (!data?.artworkResult) {
          throw new Error('Artwork not found');
        }

        setArtwork(data.artworkResult);
        setError(null);
      } catch (error) {
        console.error('Error fetching artwork data:', error);
        setError(error.message || 'Failed to load artwork');
        setArtwork(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [slug]);

  return (
    <>
      <Header />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <ArtworkDetails artwork={artwork} />
      )}
      <Footer />
    </>
  );
};

export default ArtistDetailPage;