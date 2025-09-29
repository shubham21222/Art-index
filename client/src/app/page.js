'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

// Metadata is handled in layout for client components

// Skeleton Components
const CarouselSkeleton = () => (
  <div className="relative w-full h-[60vh] sm:h-[50vh] md:h-[70vh] lg:h-[80vh] bg-gray-200">
    <Skeleton className="w-full h-full" />
    <div className="absolute bottom-4 md:bottom-12 left-4 md:left-12 right-4 md:right-12">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96 mb-4" />
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

const ArtCategoriesSkeleton = () => (
  <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <Skeleton className="h-12 w-80 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="group relative">
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-200">
              <Skeleton className="h-64 w-full" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CuratorsPicksSkeleton = () => (
  <div className="flex flex-col items-center justify-center mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    <div className="flex flex-col items-center justify-between w-full mb-6">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>
      <Skeleton className="h-4 w-24 mt-4 md:mt-0" />
    </div>
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full h-[300px] rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AuctionCarouselSkeleton = () => (
  <div className="flex flex-col items-center justify-center mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    <div className="flex flex-col items-center justify-between w-full mb-6">
      <div className="text-center">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-4 w-28 mt-4 md:mt-0" />
    </div>
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full h-[300px] rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FeaturedGalleriesSkeleton = () => (
  <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
    <div className="flex flex-col items-center justify-between w-full mb-6">
      <div className="text-center">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>
      <Skeleton className="h-4 w-32 mt-4 md:mt-0" />
    </div>
    <div className="relative h-[500px] w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-[400px] h-[400px] rounded-lg overflow-hidden mx-2">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TrendingArtistsSkeleton = () => (
  <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
    <div className="flex flex-col items-center justify-between w-full mb-6">
      <div className="text-center">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>
      <Skeleton className="h-4 w-28 mt-4 md:mt-0" />
    </div>
    <div className="relative h-[500px] w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-[400px] h-[400px] rounded-lg overflow-hidden mx-2">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FeaturedArtworksSkeleton = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="group relative">
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-200">
              <Skeleton className="h-80 w-full" />
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-8 w-24 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ArtInsightsSkeleton = () => (
  <section className="py-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-6">
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-6 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full mr-3" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const AuctionHighlightsSkeleton = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="group relative">
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-200">
              <Skeleton className="h-64 w-full" />
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-3/4 mb-3" />
                <div className="space-y-3 mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [componentsLoaded, setComponentsLoaded] = useState({
    carousel: false,
    categories: false,
    curators: false,
    auctions: false,
    galleries: false,
    artists: false,
    artworks: false,
    insights: false,
    highlights: false
  });

  useEffect(() => {
    // Simulate component loading times
    const loadComponents = async () => {
      // Carousel loads first (critical)
      setTimeout(() => {
        setComponentsLoaded(prev => ({ ...prev, carousel: true }));
      }, 500);

      // Other components load progressively
      setTimeout(() => {
        setComponentsLoaded(prev => ({ ...prev, categories: true }));
      }, 800);

      setTimeout(() => {
        setComponentsLoaded(prev => ({ ...prev, curators: true }));
      }, 1000);

      setTimeout(() => {
        setComponentsLoaded(prev => ({ ...prev, auctions: true }));
      }, 1200);

      setTimeout(() => {
        setComponentsLoaded(prev => ({ ...prev, galleries: true }));
      }, 1400);

      setTimeout(() => {
        setComponentsLoaded(prev => ({ ...prev, artists: true }));
      }, 1600);

      setTimeout(() => {
        setComponentsLoaded(prev => ({ ...prev, artworks: true }));
      }, 1800);

      setTimeout(() => {
        setComponentsLoaded(prev => ({ ...prev, insights: true }));
      }, 2000);

      setTimeout(() => {
        setComponentsLoaded(prev => ({ ...prev, highlights: true }));
        setLoading(false);
      }, 2200);
    };

    loadComponents();
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <main className="w-full max-w-[1920px] mx-auto">
        {componentsLoaded.carousel ? <ResponsiveCarousel /> : <CarouselSkeleton />}
        
        <div className="">
          {/* <FeaturedSection/> */}
          {componentsLoaded.categories ? <ArtCategoriesShowcase /> : <ArtCategoriesSkeleton />}

          {componentsLoaded.curators ? <CuratorsPicks /> : <CuratorsPicksSkeleton />}
          {/* <ArtsySection /> */}
          {componentsLoaded.auctions ? <AuctionCarousel /> : <AuctionCarouselSkeleton />}
          
          {/* Sponsor Banner - Middle */}
          <div className=" mx-auto px-4 sm:px-6 py-8">
            <SponsorBanner placement="homepage" position="middle" />
          </div>
          
          {/* <FeaturedShows /> */}
          {/* <CurrentFairs /> */}
          {componentsLoaded.galleries ? <FeaturedGalleries /> : <FeaturedGalleriesSkeleton />}
          {componentsLoaded.artists ? <TrendingArtists /> : <TrendingArtistsSkeleton />}
          {componentsLoaded.artworks ? <FeaturedArtworksShowcase /> : <FeaturedArtworksSkeleton />}
          {componentsLoaded.insights ? <ArtInsightsStories /> : <ArtInsightsSkeleton />}
          {componentsLoaded.highlights ? <AuctionHighlights /> : <AuctionHighlightsSkeleton />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
