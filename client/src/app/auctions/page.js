import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AuctionPrintsCarousel from './components/AuctionPrintsCarousel'

const page = () => {
  return (
    <>
    <Header />
    <AuctionPrintsCarousel />
    <Footer />
    </>
  )
}

export default page