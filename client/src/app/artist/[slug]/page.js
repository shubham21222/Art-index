'use client';
import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import React, { useEffect, useState } from 'react';

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
        }
      }
    }
  }
`;

const ArtistDetailPage = ({ params }) => {
  // Unwrap `params` using React.use()
  const unwrappedParams = React.use(params);
  const { slug } = unwrappedParams;

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

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
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const { data, errors } = await response.json();

        if (errors) {
          throw new Error('GraphQL query failed');
        }

        if (!data?.artworkResult) {
          throw new Error('Artwork not found');
        }

        setArtwork(data.artworkResult);
      } catch (error) {
        console.error('Error fetching artwork data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!artwork) {
    return <div className="flex justify-center items-center h-screen">Artwork not found</div>;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Artwork Image */}
          <img
            src={artwork.image?.url}
            alt={artwork.title}
            className="w-full h-96 object-cover"
          />

          {/* Artwork Details */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{artwork.title}</h1>
            <p className="text-lg text-gray-700 mb-4">
              <span className="font-semibold">Artist:</span>{' '}
              {artwork.artists.map((artist) => artist.name).join(', ')}
            </p>
            <p className="text-lg text-gray-700 mb-4">
              <span className="font-semibold">Date:</span> {artwork.date}
            </p>
            <p className="text-lg text-gray-700 mb-4">
              <span className="font-semibold">Category:</span> {artwork.category}
            </p>

            <p className="text-lg text-gray-700">
              <span className="font-semibold">Description:</span>{' '}
              {artwork.meta?.description}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ArtistDetailPage;