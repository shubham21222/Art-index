import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Carousel3 from './components/ResponsiveCarousel3'
import UniversityMuseums from './components/UniversityMuseums'
import NonprofitOrganizations from './components/NonprofitOrganizations'
import ArtistEstates from './components/ArtistEstates'
import ModernAndContemporaryArt from './components/ModernAndContemporaryArt'
import Museums from './components/Museums'
import HistoricalArt from './components/HistoricalArt'
import PrivateCollections from './components/PrivateCollections'
import OutdoorArt from './components/OutdoorArt'

const page = () => {
  return (
    <>
    <Header />
    <Carousel3 /> 
    <div className="max-w-[1500px] mx-auto">
    <Museums />
    <UniversityMuseums />
    {/* <NonprofitOrganizations /> */}
    <ArtistEstates /> 
    <ModernAndContemporaryArt />
    <HistoricalArt />
    <PrivateCollections />
    <OutdoorArt />
    </div>
    <Footer />
    </>
)
}

export default page