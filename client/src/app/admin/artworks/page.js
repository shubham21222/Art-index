"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, Trash2, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define all artwork categories and their API endpoints
const ARTWORK_CATEGORIES = [
  { name: "All Artworks", endpoint: "/api/artworks" },
  { name: "Filtered Artworks", endpoint: "/api/filtered-artworks" },
  { name: "Auction Lots", endpoint: "/api/auction_lots" },
  { name: "Graffiti & Street Art", endpoint: "/api/graffiti-street-art" },
  { name: "Photography", endpoint: "/api/photography-galleries" },
  { name: "Modern", endpoint: "/api/modern" },
  { name: "Middle Eastern Art", endpoint: "/api/middle-eastern-art" },
  { name: "Emerging Art", endpoint: "/api/emerging-art" },
  { name: "Drawings", endpoint: "/api/drawings" },
  { name: "South Asian Art", endpoint: "/api/south-asian-southeast-asian-art" },
  { name: "Eastern European Art", endpoint: "/api/eastern-european-art" },
  { name: "Pop Art", endpoint: "/api/pop-art" },
  { name: "Ancient Art", endpoint: "/api/ancient-art-antiquities" },
  { name: "Indian Art", endpoint: "/api/indian-art" },
  { name: "Ceramics", endpoint: "/api/ceramics" },
  { name: "Old Masters", endpoint: "/api/old-masters" },
  { name: "New Media", endpoint: "/api/new-media-video" },
  { name: "Contemporary Design", endpoint: "/api/contemporary-design" },
  { name: "Outdoor Art", endpoint: "/api/outdoor-art" },
  { name: "Historical Art", endpoint: "/api/historical-art" },
  { name: "Modern & Contemporary Art", endpoint: "/api/modern-contemporary-art" },
];

// Define artist and museum categories
const ARTIST_CATEGORIES = [
  { name: "Trending Artists", endpoint: "/api/trending-artists" },
  { name: "Artist Estates", endpoint: "/api/artist-estates" },
];

const MUSEUM_CATEGORIES = [
  { name: "Museums", endpoint: "/api/museums" },
  { name: "University Museums", endpoint: "/api/university-museums" },
  { name: "Nonprofit Organizations", endpoint: "/api/nonprofit-organizations" },
];

// Combine all categories
const ALL_CATEGORIES = [
  { name: "All Items", endpoint: "all" },
  ...ARTWORK_CATEGORIES,
  ...ARTIST_CATEGORIES,
  ...MUSEUM_CATEGORIES,
];

const ITEMS_PER_PAGE = 12;

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [allArtworks, setAllArtworks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const observer = useRef();
  const lastItemRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isFetching) {
        setCurrentPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, isFetching]);

  useEffect(() => {
    fetchAllArtworks();
  }, []);

  useEffect(() => {
    // Filter artworks based on search query and selected category
    let filtered = allArtworks;
    
    // Apply category filter
    if (selectedCategory !== "All Items") {
      const category = ALL_CATEGORIES.find(cat => cat.name === selectedCategory);
      if (category) {
        filtered = filtered.filter(item => item.category === category.name);
      }
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.artistNames?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredArtworks(filtered);
    setCurrentPage(1); // Reset pagination when filters change
    setHasMore(filtered.length > ITEMS_PER_PAGE);
    
    // Initialize displayed items
    const initialItems = filtered.slice(0, ITEMS_PER_PAGE);
    setArtworks(initialItems);
  }, [searchQuery, selectedCategory, allArtworks]);

  useEffect(() => {
    if (currentPage > 1 && !isFetching) {
      loadMoreItems();
    }
  }, [currentPage]);

  const loadMoreItems = async () => {
    if (isFetching) return;
    
    setIsFetching(true);
    try {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newItems = filteredArtworks.slice(startIndex, endIndex);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setArtworks(prev => [...prev, ...newItems]);
        setHasMore(endIndex < filteredArtworks.length);
      }
    } catch (error) {
      console.error("Error loading more items:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchAllArtworks = async () => {
    try {
      setLoading(true);
      
      // Fetch artworks from all categories
      const allArtworksPromises = ARTWORK_CATEGORIES.map(async (category) => {
        try {
          const response = await fetch(category.endpoint);
          const data = await response.json();
          
          // Extract artworks from the response
          let categoryArtworks = [];
          if (data.artworks) {
            categoryArtworks = data.artworks;
          } else if (data.galleries) {
            // Some APIs return galleries with artworks
            categoryArtworks = data.galleries.flatMap(gallery => 
              gallery.artworks || []
            );
          }
          
          // Add category information to each artwork
          return categoryArtworks.map(artwork => ({
            ...artwork,
            category: category.name,
            type: "artwork"
          }));
        } catch (error) {
          console.error(`Error fetching ${category.name}:`, error);
          return [];
        }
      });
      
      // Fetch artists
      const artistPromises = ARTIST_CATEGORIES.map(async (category) => {
        try {
          const response = await fetch(category.endpoint);
          const data = await response.json();
          
          // Extract artists from the response
          let categoryArtists = [];
          if (data.artists) {
            categoryArtists = data.artists;
          }
          
          // Add category information to each artist
          return categoryArtists.map(artist => ({
            ...artist,
            category: category.name,
            type: "artist",
            title: artist.name, // For consistent display
            artistNames: artist.nationalityAndBirthday || "Artist"
          }));
        } catch (error) {
          console.error(`Error fetching ${category.name}:`, error);
          return [];
        }
      });
      
      // Fetch museums
      const museumPromises = MUSEUM_CATEGORIES.map(async (category) => {
        try {
          const response = await fetch(category.endpoint);
          const data = await response.json();
          
          // Extract museums from the response
          let categoryMuseums = [];
          if (data.museums) {
            categoryMuseums = data.museums;
          }
          
          // Add category information to each museum
          return categoryMuseums.map(museum => ({
            ...museum,
            category: category.name,
            type: "museum",
            title: museum.name, // For consistent display
            artistNames: museum.locations?.map(loc => loc.city).join(", ") || "Location not specified"
          }));
        } catch (error) {
          console.error(`Error fetching ${category.name}:`, error);
          return [];
        }
      });
      
      const results = await Promise.all([
        ...allArtworksPromises,
        ...artistPromises,
        ...museumPromises
      ]);
      
      const combinedItems = results.flat();
      
      setAllArtworks(combinedItems);
      setFilteredArtworks(combinedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(filteredArtworks.length / ITEMS_PER_PAGE);
  const displayedItems = artworks.slice(0, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Artworks & Artists</h1>
        <Button className="bg-white text-black hover:bg-zinc-200">
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by title, artist, or category..."
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-400"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
              {ALL_CATEGORIES.map((category) => (
                <SelectItem 
                  key={category.name} 
                  value={category.name}
                  className="text-white hover:bg-zinc-800"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="aspect-square bg-zinc-800 rounded-lg animate-pulse" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : displayedItems.length > 0 ? (
          displayedItems.map((item, index) => (
            <Card 
              key={item.id || item.internalID} 
              className="bg-zinc-900 border-zinc-800"
              ref={index === displayedItems.length - 1 ? lastItemRef : null}
            >
              <CardContent className="p-4">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={item.image?.resized?.src || item.image || "/placeholder-artwork.jpg"}
                    alt={item.title || item.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Edit className="w-4 h-4 text-black" />
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Trash2 className="w-4 h-4 text-black" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                    {item.type === "artwork" ? "Artwork" : item.type === "artist" ? "Artist" : "Museum"}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white">{item.title || item.name}</h3>
                  <p className="text-sm text-zinc-400">{item.artistNames || "Unknown"}</p>
                  {item.type === "artwork" && (
                    <div className="mt-2">
                      {item.saleMessage ? (
                        <p className="text-sm font-medium text-green-400">{item.saleMessage}</p>
                      ) : item.priceCurrency && item.price ? (
                        <p className="text-sm font-medium text-white">
                          {item.priceCurrency} {item.price.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-400">Price not available</p>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-zinc-400 mt-1">
                    {item.category}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-zinc-400">No items found.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && filteredArtworks.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            className="bg-zinc-900 border-zinc-800 text-white"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="bg-zinc-900 border-zinc-800 text-white"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Loading indicator for infinite scroll */}
      {isFetching && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-800 border-t-white"></div>
        </div>
      )}
    </div>
  );
} 