"use client";
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ContactModal from '@/app/components/ContactModal'

// Map of slugs to their API endpoints
const API_ENDPOINTS = {
  'graffiti-and-street-art': '/api/graffiti-street-art',
  'photography': '/api/photography-galleries',
  'contemporary-design': '/api/contemporary-design',
  'modern': '/api/modern',
  'middle-eastern-art': '/api/middle-eastern-art',
  'emerging-art': '/api/emerging-art',
  'drawings': '/api/drawings',
  'south-asian-and-southeast-asian-art': '/api/south-asian-southeast-asian-art',
  'eastern-european-art': '/api/eastern-european-art',
  'pop-art': '/api/pop-art',
  'ancient-art-and-antiquities': '/api/ancient-art-antiquities',
  'indian-art': '/api/indian-art',
  'ceramics': '/api/ceramics',
  'old-masters': '/api/old-masters',
  'new-media-and-video': '/api/new-media-video'
}

const ITEMS_PER_PAGE = 30

export default function GalleryContent({ slug }) {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedArtwork, setSelectedArtwork] = useState(null)

  // Convert slug to display name (e.g., "graffiti-and-street-art" to "Graffiti and Street Art")
  const getGalleryName = (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true)
        const apiUrl = API_ENDPOINTS[slug]
        if (!apiUrl) {
          console.error('No API endpoint found for gallery:', slug)
          return
        }

        const response = await fetch(`${apiUrl}?page=${currentPage}&limit=${ITEMS_PER_PAGE}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        
        const data = await response.json()
        setArtworks(data.galleries || [])
        // Assuming the API returns total count in the response
        setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE))
      } catch (error) {
        console.error(`Error fetching ${slug} artworks:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtworks()
  }, [slug, currentPage])

  const handleContactClick = (e, artwork) => {
    e.preventDefault()
    setSelectedArtwork(artwork)
    setIsModalOpen(true)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <main className="max-w-[1500px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{getGalleryName(slug)}</h1>
        
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeletons
            Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
            ))
          ) : artworks.length > 0 ? (
            // Artwork grid
            artworks.map((artwork) => (
              <div 
                key={artwork.internalID} 
                className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href={`/artwork/${artwork.slug}`} className="block h-full">
                  <div className="relative w-full h-full overflow-hidden">
                    <Image
                      src={artwork.image.src}
                      alt={artwork.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:rotate-1"
                      priority={false}
                      quality={85}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Content overlay */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-white drop-shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          {artwork.title}
                        </h3>
                        <p className="text-sm text-white/90 drop-shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                          {artwork.artistNames}
                        </p>
                        <p className="text-xs text-white/80 drop-shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-200">
                          {artwork.date}
                        </p>
                        {artwork.mediumType && (
                          <p className="text-xs text-white/70 drop-shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-300">
                            {artwork.mediumType}
                          </p>
                        )}
                        <div className="flex justify-center gap-2 mt-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-300">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="text-xs bg-white/90 hover:bg-white text-black shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={(e) => handleContactClick(e, artwork)}
                          >
                            I&apos;m Interested
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 py-8">No artworks found.</p>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="mx-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      {/* Contact Modal */}
      {isModalOpen && selectedArtwork && (
        <ContactModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          artwork={selectedArtwork}
        />
      )}
    </>
  )
} 