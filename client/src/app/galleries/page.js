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

const page = () => {
  return (
   <>
   <Header/>
   <Carousel2 />
   <div className='max-w-[1500px] mx-auto'>
   <GraffitiAndStreetArtCarousel />
   <PhotographyGalleriesCarousel />
   <ContemporaryDesign />
   <Modern />
   <MiddleEasternArt />
   <EmergingArt />
   <Drawings />
   <SouthAsianAndSoutheastAsianArt />
   <EasternEuropeanArt />
   <PopArt />
   <AncientArtAndAntiquities />
   <IndianArt />
    <OldMasters />
   <Ceramics />
   <NewMediaAndVideo />
   </div>
   <Footer />
   </>
  )
}

export default page