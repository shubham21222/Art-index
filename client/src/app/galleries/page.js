import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Carousel2 from './components/ResponsiveCarousel2'
import GraffitiAndStreetArtCarousel from './components/GraffitiAndStreetArtCarousel'
import PhotographyGalleriesCarousel from './components/PhotographyGalleriesCarousel'
import ContemporaryDesign from './components/ContemporaryDesign'
import Modern from './components/Modern'
import MiddleEasternArt from './components/MiddleEasternArt'
import EmergingArt from './components/EmergingArt'
import Drawings from './components/Drawings'
import SouthAsianAndSoutheastAsianArt from './components/SouthAsianAndSoutheastAsianArt'
import EasternEuropeanArt from './components/EasternEuropeanArt'
import PopArt from './components/PopArt'
import AncientArtAndAntiquities from './components/AncientArtAndAntiquities'
import IndianArt from './components/IndianArt'
import Ceramics from './components/Ceramics'
import OldMasters from './components/OldMasters'
import NewMediaAndVideo from './components/NewMediaAndVideo'

// Map of component names to their slugs
const gallerySlugs = {
  GraffitiAndStreetArtCarousel: 'graffiti-and-street-art',
  PhotographyGalleriesCarousel: 'photography',
  ContemporaryDesign: 'contemporary-design',
  Modern: 'modern',
  MiddleEasternArt: 'middle-eastern-art',
  EmergingArt: 'emerging-art',
  Drawings: 'drawings',
  SouthAsianAndSoutheastAsianArt: 'south-asian-and-southeast-asian-art',
  EasternEuropeanArt: 'eastern-european-art',
  PopArt: 'pop-art',
  AncientArtAndAntiquities: 'ancient-art-and-antiquities',
  IndianArt: 'indian-art',
  Ceramics: 'ceramics',
  OldMasters: 'old-masters',
  NewMediaAndVideo: 'new-media-and-video'
}

// Wrapper component to add dynamic "View All" link
const GallerySection = ({ Component, componentName }) => {
  const slug = gallerySlugs[componentName]
  return (
    <div className="relative">
      <Component />
      <div className="absolute top-0 right-0 mt-4 mr-6">
        <a 
          href={`/galleries/${slug}`}
          className="text-black text-sm font-medium hover:underline transition-colors duration-300"
        >
          View All
        </a>
      </div>
    </div>
  )
}

const page = () => {
  return (
    <>
      <Header/>
      <Carousel2 />
      <div className='max-w-[1500px] mx-auto'>
        <GallerySection Component={GraffitiAndStreetArtCarousel} componentName="GraffitiAndStreetArtCarousel" />
        <GallerySection Component={PhotographyGalleriesCarousel} componentName="PhotographyGalleriesCarousel" />
        {/* <GallerySection Component={ContemporaryDesign} componentName="ContemporaryDesign" /> */}
        <GallerySection Component={Modern} componentName="Modern" />
        <GallerySection Component={MiddleEasternArt} componentName="MiddleEasternArt" />
        <GallerySection Component={EmergingArt} componentName="EmergingArt" />
        <GallerySection Component={Drawings} componentName="Drawings" />
        <GallerySection Component={SouthAsianAndSoutheastAsianArt} componentName="SouthAsianAndSoutheastAsianArt" />
        <GallerySection Component={EasternEuropeanArt} componentName="EasternEuropeanArt" />
        <GallerySection Component={PopArt} componentName="PopArt" />
        <GallerySection Component={AncientArtAndAntiquities} componentName="AncientArtAndAntiquities" />
        <GallerySection Component={IndianArt} componentName="IndianArt" />
        <GallerySection Component={OldMasters} componentName="OldMasters" />
        <GallerySection Component={Ceramics} componentName="Ceramics" />
        <GallerySection Component={NewMediaAndVideo} componentName="NewMediaAndVideo" />
      </div>
      <Footer />
    </>
  )
}

export default page