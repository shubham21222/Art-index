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
    <UniversityMuseums />
    <NonprofitOrganizations />
    <ArtistEstates />
    <ModernAndContemporaryArt />
    <Museums />
    <HistoricalArt />
    <PrivateCollections />
    <OutdoorArt />
    <Footer />
    </>
)
}

export default page