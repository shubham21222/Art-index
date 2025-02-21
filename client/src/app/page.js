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
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
    <Header />
    <ResponsiveCarousel />
    <FeaturedSection/>
    <CuratorsPicks />
    {/* <ArtsySection /> */}
    <AuctionCarousel/>
    {/* <FeaturedShows /> */}
    <CurrentFairs />
    <FeaturedGalleries />
    <TrendingArtists />
    <Footer />
    </>
  );
}
