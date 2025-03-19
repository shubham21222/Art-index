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
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <main className="w-full max-w-[1920px] mx-auto">
        <ResponsiveCarousel />
        <div className="">
          {/* <FeaturedSection/> */}
          <CuratorsPicks />
          {/* <ArtsySection /> */}
          <AuctionCarousel/>
          {/* <FeaturedShows /> */}
          {/* <CurrentFairs /> */}
          <FeaturedGalleries />
          <TrendingArtists />
        </div>
      </main>
      <Footer />
    </div>
  );
}
