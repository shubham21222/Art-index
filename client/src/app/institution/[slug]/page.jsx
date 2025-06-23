import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const dynamic = 'force-dynamic'; // Ensure SSR for fresh data

async function fetchInstitutionEvents(slug) {
  const res = await fetch('https://metaphysics-cdn.artsy.net/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: 'ShowPaginatedEventsRendererQuery',
      query: `query ShowPaginatedEventsRendererQuery($partnerId: String!, $first: Int, $page: Int, $status: EventStatus) {\n  partner(id: $partnerId) @principalField {\n    ...ShowPaginatedEvents_partner_JfDnP\n    id\n  }\n}\n\nfragment CellShow_show on Show {\n  internalID\n  slug\n  name\n  href\n  startAt\n  endAt\n  isFairBooth\n  exhibitionPeriod\n  partner {\n    __typename\n    ... on Partner {\n      name\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n    ... on ExternalPartner {\n      id\n    }\n  }\n  coverImage {\n    cropped(width: 445, height: 334, version: [\"larger\", \"large\"]) {\n      src\n      srcSet\n    }\n  }\n}\n\nfragment Pagination_pageCursors on PageCursors {\n  around {\n    cursor\n    page\n    isCurrent\n  }\n  first {\n    cursor\n    page\n    isCurrent\n  }\n  last {\n    cursor\n    page\n    isCurrent\n  }\n  previous {\n    cursor\n    page\n  }\n}\n\nfragment ShowPaginatedEvents_partner_JfDnP on Partner {\n  slug\n  showsConnection(first: $first, status: $status, page: $page, isDisplayable: true) {\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    pageCursors {\n      ...Pagination_pageCursors\n    }\n    edges {\n      node {\n        ...CellShow_show\n        internalID\n        id\n      }\n    }\n  }\n}\n`,
      variables: {
        partnerId: slug,
        first: 40,
        page: 1,
        status: 'CLOSED',
      },
    }),
    // cache: 'no-store', // Uncomment if you want to always fetch fresh data
  });
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  return data?.data?.partner?.showsConnection?.edges || [];
}

async function fetchInstitutionArtworks(slug) {
  console.log('🔍 Fetching artworks for institution:', slug);
  
  const res = await fetch('https://metaphysics-cdn.artsy.net/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: 'WorksFilterQuery',
      query: `query WorksFilterQuery($partnerId: String!, $input: FilterArtworksInput) {
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
                slug
                href
                internalID
                title
                date
                medium
                mediumType {
                  name
                  filterGene {
                    name
                  }
                }
                image(includeAll: false) {
                  resized(width: 445, version: ["larger", "large"]) {
                    src
                    srcSet
                    width
                    height
                  }
                }
                artists {
                  name
                  href
                  id
                  slug
                }
                partner {
                  name
                  href
                }
              }
            }
          }
        }
      }`,
      variables: {
        partnerId: slug,
        input: {
          page: 1,
          sort: '-decayed_merch',
          priceRange: '*-*',
          width: '*-*',
          height: '*-*',
        },
      },
    }),
  });
  
  if (!res.ok) {
    console.error('❌ API request failed:', res.status, res.statusText);
    const errorText = await res.text();
    console.error('❌ Error response body:', errorText);
    throw new Error('Failed to fetch institution artworks');
  }
  
  const data = await res.json();
  console.log('📦 API Response:', data);
  
  const artworks = data?.data?.partner?.filtered_artworks?.edges || [];
  console.log('🎨 Artworks data:', artworks.length, 'artworks found');
  
  return artworks;
}

export default async function InstitutionPage({ params, searchParams }) {
  const { slug } = params;
  
  // Handle searchParams properly - it might be a Promise in some Next.js versions
  let resolvedSearchParams = {};
  if (searchParams instanceof Promise) {
    resolvedSearchParams = await searchParams;
  } else {
    resolvedSearchParams = searchParams || {};
  }
  
  console.log('🏛️ Institution slug:', slug);
  console.log('🔍 Search params:', resolvedSearchParams);
  
  let events = [];
  let artworks = [];
  let error = null;
  let artworksError = null;
  
  try {
    events = await fetchInstitutionEvents(slug);
    console.log('📅 Events fetched:', events.length);
  } catch (e) {
    console.error('❌ Error fetching events:', e);
    error = e.message;
  }
  
  try {
    artworks = await fetchInstitutionArtworks(slug);
    console.log('✅ Artworks fetched successfully:', artworks.length);
  } catch (e) {
    console.error('❌ Error fetching artworks:', e);
    artworksError = e.message;
  }

  console.log('🎯 Final artworks state:', artworks.length, 'artworks');

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-black bg-clip-text">
            {slug.replace(/-/g, ' ').split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the latest events and explore our curated collection of artworks
          </p>
        </div>

        {/* Events Section */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Events</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
          </div>
          
          {error && (
            <div className="text-red-600 mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          {events.length === 0 && !error && (
            <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-lg">No events found for this institution.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(({ node }, index) => (
              <div key={node.internalID} className="group">
                <Link href={node.href || '#'} className="block">
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                    <div className="relative w-full h-[250px] overflow-hidden">
                      {node.coverImage?.cropped?.src ? (
                        <Image
                          src={node.coverImage.cropped.src}
                          alt={node.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                          <span className="text-4xl">🎨</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-purple-600 transition-colors">
                        {node.name}
                      </h3>
                      <div className="text-sm text-gray-600 mb-2 flex items-center">
                        <span className="mr-2">📅</span>
                        {node.exhibitionPeriod}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <span className="mr-2">🏛️</span>
                        {node.partner?.name}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Artworks Section */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Artwork Collection</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
          </div>
          
          {artworksError && (
            <div className="text-red-600 mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              {artworksError}
            </div>
          )}
          
          {artworks.length === 0 && !artworksError && (
            <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-lg">No artworks found for this institution.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {artworks.map(({ node }, index) => (
              <div key={node.internalID} className="group">
                <Link href={node.href || '#'} className="block">
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                    <div className="relative w-full h-[280px] overflow-hidden">
                      {node.image?.resized?.src ? (
                        <Image
                          src={node.image.resized.src}
                          alt={node.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                          <span className="text-4xl">🎨</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {node.title}
                      </h3>
                      <div className="text-sm text-gray-600 mb-2">
                        {node.artists?.map((artist, idx) => (
                          <span key={artist.id}>
                            <Link 
                              href={artist.href || '#'} 
                              className="underline hover:text-purple-600 transition-colors"
                            >
                              {artist.name}
                            </Link>
                            {idx < node.artists.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mb-1 flex items-center">
                        <span className="mr-1">📅</span>
                        {node.date}
                      </div>
                      <div className="text-xs text-gray-400 mb-1 flex items-center">
                        <span className="mr-1">🎨</span>
                        {node.mediumType?.name || node.medium}
                      </div>
                      {node.partner?.name && (
                        <div className="text-xs text-gray-400 flex items-center">
                          <span className="mr-1">🏛️</span>
                          {node.partner.name}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">{events.length}</div>
              <div className="text-gray-600">Events</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{artworks.length}</div>
              <div className="text-gray-600">Artworks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {artworks.reduce((acc, { node }) => acc + (node.artists?.length || 0), 0)}
              </div>
              <div className="text-gray-600">Artists</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 