import React from 'react'
import ViewingRoomsCarousel from './components/ViewingRoomsCarousel'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LatestViewingRooms from './components/LatestViewingRooms'

const page = () => {
  return (
    <>
    <Header />
    <ViewingRoomsCarousel />
    <LatestViewingRooms />
    <Footer />
    </>
  )
}

export default page