import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import GalleryContent from './GalleryContent'

// Map of slugs to their API endpoints (needed for generateStaticParams)
const API_ENDPOINTS = {
  'graffiti-and-street-art': '/api/graffiti-street-art',
  'photography': '/api/photography',
  'contemporary-design': '/api/contemporary-design',
  'modern': '/api/modern',
  'middle-eastern-art': '/api/middle-eastern-art',
  'emerging-art': '/api/emerging-art',
  'drawings': '/api/drawings',
  'south-asian-and-southeast-asian-art': '/api/south-asian-art',
  'eastern-european-art': '/api/eastern-european-art',
  'pop-art': '/api/pop-art',
  'ancient-art-and-antiquities': '/api/ancient-art',
  'indian-art': '/api/indian-art',
  'ceramics': '/api/ceramics',
  'old-masters': '/api/old-masters',
  'new-media-and-video': '/api/new-media'
}

export default function GalleryPage({ params }) {
  const { slug } = params

  return (
    <>
      <Header />
      <GalleryContent slug={slug} />
      <Footer />
    </>
  )
}

// Generate static paths for all galleries
export async function generateStaticParams() {
  return Object.keys(API_ENDPOINTS).map((gallery) => ({
    slug: gallery,
  }))
} 