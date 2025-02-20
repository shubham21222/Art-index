// src/app/show/[slug]/page.js
import { getShowArtworks,getShowData } from './utils/data-fetchers';
import ShowHeader from './components/ShowHeader';
import PartnerInfo from './components/PartnerInfo';
import ArtworkGrid from './components/ArtworkGrid';
import AboutSection from './components/AboutSection';
import PressReleaseSection from './components/PressReleaseSection';
import LocationSection from './components/LocationSection';
import HoursSection from './components/HoursSection';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default async function ShowPage({ params }) {
  const { slug } = params;
  const show = await getShowData(slug);
  const artworks = await getShowArtworks(slug);

  // Handle case where the show data is not found
  if (!show) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-xl text-gray-500">Show not found</p>
      </div>
    );
  }

  return (
    <>
    <Header />
    <div className=" mx-auto px-4 sm:px-6 py-8 md:pt-4 pt-8">
      <ShowHeader name={show.name} />
      <PartnerInfo partner={show.partner} />
      <ArtworkGrid artworks={artworks} />
      {show.about && <AboutSection about={show.about} />}
      {show.pressRelease && <PressReleaseSection pressRelease={show.pressRelease} />}
      {show.hasLocation && <LocationSection location={show.location} />}
      {show.location.openingHours && <HoursSection openingHours={show.location.openingHours} />}
    </div>
    <Footer />
    </>
  );
}