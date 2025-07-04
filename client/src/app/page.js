import Image from "next/image";
import Header from "./components/Header";
import ResponsiveCarousel from "./components/ResponsiveCarousel";
import FeaturedSection from "./components/featuredArticles";
import CuratorsPicks from "./components/CuratorsPicks";
import ArtsySection from "./components/ArtsySection";
import AuctionCarousel from "./components/AuctionItems";
import FeaturedShows from "./components/FeaturedShows";
import CurrentFairs from "./components/CurrentFairs";
import FeaturedGalleries from "./components/FeaturedGalleries";
import TrendingArtists from "./components/TrendingArtists";
import ArtCategoriesShowcase from "./components/ArtCategoriesShowcase";
import FeaturedArtworksShowcase from "./components/FeaturedArtworksShowcase";
import ArtInsightsStories from "./components/ArtInsightsStories";
import AuctionHighlights from "./components/AuctionHighlights";
import SponsorBanner from "../components/SponsorBanner";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <main className="w-full max-w-[1920px] mx-auto">
        <ResponsiveCarousel />
        <div className="">
          {/* <FeaturedSection/> */}
          <ArtCategoriesShowcase />

          <CuratorsPicks />
          {/* <ArtsySection /> */}
          <AuctionCarousel/>
          
          {/* Sponsor Banner - Middle */}
          <div className=" mx-auto px-4 sm:px-6 py-8">
            <SponsorBanner placement="homepage" position="middle" />
          </div>
          
          {/* <FeaturedShows /> */}
          {/* <CurrentFairs /> */}
          <FeaturedGalleries /> 
          <TrendingArtists />
          <FeaturedArtworksShowcase />
          <ArtInsightsStories />
          <AuctionHighlights />
        </div>
      </main>
      <Footer />
    </div>
  );
}
