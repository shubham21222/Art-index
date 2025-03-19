import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FeaturedSection from '../components/featuredArticles'

const page = () => {
  return (
    <>
    <Header />
    <div>
     <FeaturedSection/>
    </div>
    <Footer/>
    </>
  )
}

export default page
