"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Masonry from "react-masonry-css";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorBanner from '../../components/SponsorBanner';
import { Info, Search, Filter, Eye } from 'lucide-react';

// Define the API endpoint
const API_URL = "/api/filtered-artworks";

const categories = [
  "All Categories",
  "Contemporary Art",
  "Painting",
  "Street Art",
  "Photography",
  "Emerging Art",
  "20th-Century Art",
  "Sculpture",
  "Print",
  "Drawing",
  "Mixed Media"
];

const ArtworkCard = ({ artwork }) => {
  return (
    <div className="block mb-4 group">
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
        <Link href={`/artwork/${artwork.slug}`} className="block">
          <div className="relative aspect-[3/4]">
            <Image
              src={artwork.image}
              alt={artwork.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
              <span className="inline-block px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-gray-900 mb-2">
                {artwork.primaryLabel}
              </span>
            </div>
          </div>
        </Link>
        <div className="p-4 space-y-2">
          <h2 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {artwork.title}
          </h2>
          <p className="text-gray-600 font-medium">{artwork.artist}</p>
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">I&apos;m Interested</span>
            </div>
            <span className="text-sm font-semibold text-green-600">
              {artwork.price}
            </span>
          </div>
          <Link href={`/artwork/${artwork.slug}`}>
            <Button 
              className="w-full mt-2"
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Art
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="mb-4">
    <div className="bg-white rounded-xl overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-2 border-t">
          <Skeleton className="h-5 w-1/3" />
        </div>
      </div>
    </div>
  </div>
);

export default function ArtGallery() {
  const [sort, setSort] = useState("Recommended");
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const observerRef = useRef();
  const loadingRef = useRef();

  const fetchArtworks = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory);
      
      // Map sort options to API parameters
      let sortBy = "internalID";
      let sortOrder = "asc";
      
      switch (sort) {
        case "Newest":
          sortBy = "date";
          sortOrder = "desc";
          break;
        case "PriceLowHigh":
          sortBy = "price";
          sortOrder = "asc";
          break;
        case "PriceHighLow":
          sortBy = "price";
          sortOrder = "desc";
          break;
        default:
          sortBy = "internalID";
          sortOrder = "asc";
      }
      
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      params.append("page", page.toString());
      params.append("limit", "100");

      const url = `${API_URL}?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const { 
        artworks: fetchedArtworks, 
        totalCount: count,
        currentPage: pageNum,
        hasNextPage: hasNext,
        hasPreviousPage: hasPrev
      } = await response.json();

      if (append) {
        setArtworks(prev => [...prev, ...fetchedArtworks]);
      } else {
        setArtworks(fetchedArtworks);
      }
      
      setTotalCount(count);
      setCurrentPage(pageNum);
      setHasNextPage(hasNext);
      setHasPreviousPage(hasPrev);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, selectedCategory, sort]);

  // Initial load
  useEffect(() => {
    setCurrentPage(1);
    fetchArtworks(1, false);
  }, [fetchArtworks]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchArtworks(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, loadingMore, currentPage, fetchArtworks]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
    setSort("Recommended");
    setCurrentPage(1);
  };

  const masonryOptions = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 mt-8 md:mt-0 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-[60px] md:mt-0 mb-8 md:mb-12">
          <div className="space-y-2 text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Collect Art & Design
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Discover and collect contemporary artworks
            </p>
          </div>
          {/* <Button variant="outline" size="lg" className="w-full md:w-auto">
            Browse Collections
          </Button> */}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search artworks, artists, galleries..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-3 text-lg"
          />
        </div>

        {/* Filters and Sort Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4 mb-6">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            {/* <div className="flex gap-2">
              <span className="text-sm text-gray-500 self-center">
                {totalCount} artworks found
              </span>
            </div> */}
          </div>
          
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Recommended">Recommended</SelectItem>
              <SelectItem value="Newest">Newest</SelectItem>
              <SelectItem value="PriceLowHigh">Price: Low to High</SelectItem>
              <SelectItem value="PriceHighLow">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Masonry Grid */}
        <Masonry
          breakpointCols={masonryOptions}
          className="flex mt-8 -ml-4 w-auto"
          columnClassName="pl-4 bg-transparent"
        >
          {loading
            ? Array.from({ length: 12 }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))
            : artworks.length > 0
            ? artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))
            : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No artworks found matching your criteria.</p>
                <Button onClick={clearFilters} variant="outline" className="mt-4">
                  Clear Filters
                </Button>
              </div>
            )}
        </Masonry>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <span className="text-gray-600">Loading more artworks...</span>
            </div>
          </div>
        )}

        {/* Intersection Observer Target */}
        <div ref={loadingRef} className="h-10" />

        {/* Sponsor Banner - Bottom */}
        <div className="mt-12">
          <SponsorBanner placement="collect" position="bottom" />
        </div>
      </div>
      <Footer />
    </div>
  );
}