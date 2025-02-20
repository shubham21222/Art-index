import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AuctionPrintsCarousel from './components/AuctionPrintsCarousel'
import AuctionArtworksPage from './components/AuctionArtworksPage'
import CuratorsPicks from '../components/CuratorsPicks'
import AuctionArtworksPage2 from './components/AuctionArtworksPage2'


const page = () => {
  return (
    <>
    <Header />
    <div className='md:pt-2 pt-12'>
    <CuratorsPicks />
    <AuctionPrintsCarousel />
    <AuctionArtworksPage />
    <AuctionArtworksPage2 />
    </div>
    <Footer />
    </>
  )
}

export default page