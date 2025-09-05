"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, Trash2, Filter, ChevronLeft, ChevronRight, X, Save } from "lucide-react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast, { Toaster } from 'react-hot-toast';

// Define all artwork categories and their API endpoints
const ARTWORK_CATEGORIES = [
  // { name: "All Artworks", endpoint: "/api/artworks" },
  // { name: "Filtered Artworks", endpoint: "/api/filtered-artworks" },
  // { name: "Auction Lots", endpoint: "/api/auction_lots" },
  { name: "Graffiti & Street Art", endpoint: "/api/graffiti-street-art", slug: "graffiti-and-street-art" },
  { name: "Photography", endpoint: "/api/photography-galleries", slug: "photography" },
  { name: "Contemporary Design", endpoint: "/api/contemporary-design", slug: "contemporary-design" },
  { name: "Modern", endpoint: "/api/modern", slug: "modern" },
  { name: "Middle Eastern Art", endpoint: "/api/middle-eastern-art", slug: "middle-eastern-art" },
  { name: "Emerging Art", endpoint: "/api/emerging-art", slug: "emerging-art" },
  { name: "Drawings", endpoint: "/api/drawings", slug: "drawings" },
  { name: "South Asian & Southeast Asian Art", endpoint: "/api/south-asian-southeast-asian-art", slug: "south-asian-and-southeast-asian-art" },
  { name: "Eastern European Art", endpoint: "/api/eastern-european-art", slug: "eastern-european-art" },
  { name: "Pop Art", endpoint: "/api/pop-art", slug: "pop-art" },
  { name: "Ancient Art & Antiquities", endpoint: "/api/ancient-art-antiquities", slug: "ancient-art-and-antiquities" },
  { name: "Indian Art", endpoint: "/api/indian-art", slug: "indian-art" },
  { name: "Ceramics", endpoint: "/api/ceramics", slug: "ceramics" },
  { name: "Old Masters", endpoint: "/api/old-masters", slug: "old-masters" },
  { name: "New Media & Video", endpoint: "/api/new-media-video", slug: "new-media-and-video" },
  { name: "Outdoor Art", endpoint: "/api/outdoor-art", slug: "outdoor-art" },
  { name: "Historical Art", endpoint: "/api/historical-art", slug: "historical-art" },
  { name: "Modern & Contemporary Art", endpoint: "/api/modern-contemporary-art", slug: "modern-contemporary-art" },
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
  const [editingItem, setEditingItem] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.saleMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
          // Use pagination for gallery APIs
          const endpoint = category.slug ? `${category.endpoint}?page=1&limit=100` : category.endpoint;
          const response = await fetch(endpoint);
          const data = await response.json();
          
          // Extract artworks from the response
          let categoryArtworks = [];
          if (data.artworks) {
            categoryArtworks = data.artworks;
          } else if (data.galleries) {
            // Gallery APIs return artworks in galleries array
            categoryArtworks = data.galleries;
          } else if (data.auction_lots) {
            categoryArtworks = data.auction_lots;
          }
          
          // Add category information to each artwork
          return categoryArtworks.map((artwork, index) => {
            // Handle different image structures
            let imageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
            if (artwork.image?.resized?.src) {
              imageUrl = artwork.image.resized.src;
            } else if (artwork.image?.src) {
              imageUrl = artwork.image.src;
            } else if (artwork.image?.url) {
              imageUrl = artwork.image.url;
            } else if (typeof artwork.image === 'string') {
              imageUrl = artwork.image;
            } else if (artwork.image && typeof artwork.image === 'object') {
              // Handle case where image is an object with src property
              imageUrl = artwork.image.src || imageUrl;
            }

            return {
              ...artwork,
              category: category.name,
              type: "artwork",
              title: artwork.title || artwork.name,
              name: artwork.title || artwork.name,
              image: imageUrl,
              artistNames: artwork.artistNames,
              saleMessage: artwork.saleMessage,
              partner: artwork.partner,
              artists: artwork.artists,
              date: artwork.date,
              medium: artwork.mediumType,
              slug: artwork.slug,
              _id: artwork._id, // Use MongoDB _id as primary identifier
              uniqueId: `${category.name}-${artwork._id || index}-${index}`
            };
          });
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
          } else if (data.institutions) {
            categoryArtists = data.institutions;
          }
          
          // Add category information to each artist
          return categoryArtists.map((artist, index) => {
            // Handle different image structures for artists
            let imageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
            if (artist.image?.resized?.src) {
              imageUrl = artist.image.resized.src;
            } else if (artist.image?.src) {
              imageUrl = artist.image.src;
            } else if (artist.image?.url) {
              imageUrl = artist.image.url;
            } else if (typeof artist.image === 'string') {
              imageUrl = artist.image;
            } else if (artist.image && typeof artist.image === 'object') {
              // Handle case where image is an object with src property
              imageUrl = artist.image.src || imageUrl;
            } else if (artist.coverArtwork?.image?.cropped?.src) {
              imageUrl = artist.coverArtwork.image.cropped.src;
            }

            return {
              ...artist,
              category: category.name,
              type: "artist",
              title: artist.name, // For consistent display
              name: artist.name,
              image: imageUrl,
              artistNames: artist.nationalityAndBirthday || "Artist",
              _id: artist._id, // Use MongoDB _id as primary identifier
              uniqueId: `${category.name}-${artist._id || index}-${index}`
            };
          });
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
          } else if (data.institutions) {
            categoryMuseums = data.institutions;
          }
          
          // Add category information to each museum
          return categoryMuseums.map((museum, index) => {
            // Handle different image structures for museums
            let imageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
            if (museum.image?.resized?.src) {
              imageUrl = museum.image.resized.src;
            } else if (museum.image?.src) {
              imageUrl = museum.image.src;
            } else if (museum.image?.url) {
              imageUrl = museum.image.url;
            } else if (typeof museum.image === 'string') {
              imageUrl = museum.image;
            } else if (museum.image && typeof museum.image === 'object') {
              // Handle case where image is an object with src property
              imageUrl = museum.image.src || imageUrl;
            } else if (museum.profile?.image?.cropped?.src) {
              imageUrl = museum.profile.image.cropped.src;
            } else if (museum.profile?.image?.src) {
              imageUrl = museum.profile.image.src;
            }

            return {
              ...museum,
              category: category.name,
              type: "museum",
              title: museum.name, // For consistent display
              name: museum.name,
              image: imageUrl,
              artistNames: museum.locations?.map(loc => loc.city).join(", ") || "Location not specified",
              _id: museum._id, // Use MongoDB _id as primary identifier
              uniqueId: `${category.name}-${museum._id || index}-${index}`
            };
          });
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

  const handleEdit = (item) => {
    setEditingItem({
      ...item,
      name: item.name || item.title,
      artist: item.artist || item.artistNames,
      gallery: item.partner?.name,
      image: item.image?.resized?.src || item.image?.src || item.image?.url || item.image,
      medium: item.medium || item.mediumType,
      locations: item.locations || []
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateItem = async (updatedData) => {
    if (!editingItem) return;
    
    // Debug: Log the item to see what fields are available
    console.log('Item to update:', editingItem);
    
    // Use MongoDB _id field
    let itemId = editingItem._id;
    
    // Convert ObjectId to string if needed
    if (itemId && typeof itemId === 'object' && itemId.toString) {
      itemId = itemId.toString();
    }
    
    console.log('Item ID for update:', itemId);
    console.log('MongoDB _id:', editingItem._id);
    
    if (!itemId) {
      alert('Error: Could not find MongoDB _id for update. Please check the console for details.');
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/artworks/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          category: editingItem.category,
          updates: updatedData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item');
      }

      const result = await response.json();
      
      // Show success toast
      toast.success('Item updated successfully!', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });
      
      // Update the item in the local state with proper image handling
      const updatedArtworks = allArtworks.map(item => {
        if (item._id === editingItem._id) {
          const updatedItem = { ...item, ...result.item };
          // Ensure image is a string URL for Next.js Image component
          if (updatedItem.image && typeof updatedItem.image === 'object' && updatedItem.image.src) {
            updatedItem.image = updatedItem.image.src;
          }
          return updatedItem;
        }
        return item;
      });
      
      setAllArtworks(updatedArtworks);
      setIsEditDialogOpen(false);
      setEditingItem(null);
      
      // Refresh the filtered artworks with proper image handling
      const updatedFiltered = filteredArtworks.map(item => {
        if (item._id === editingItem._id) {
          const updatedItem = { ...item, ...result.item };
          // Ensure image is a string URL for Next.js Image component
          if (updatedItem.image && typeof updatedItem.image === 'object' && updatedItem.image.src) {
            updatedItem.image = updatedItem.image.src;
          }
          return updatedItem;
        }
        return item;
      });
      setFilteredArtworks(updatedFiltered);
      
    } catch (error) {
      console.error('Error updating item:', error);
      alert(`Failed to update item: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    // Debug: Log the item to see what fields are available
    console.log('Item to delete:', itemToDelete);
    
    // Use MongoDB _id field
    let itemId = itemToDelete._id;
    
    // Convert ObjectId to string if needed
    if (itemId && typeof itemId === 'object' && itemId.toString) {
      itemId = itemId.toString();
    }
    
    console.log('Item ID for deletion:', itemId);
    console.log('MongoDB _id:', itemToDelete._id);
    
    if (!itemId) {
      alert('Error: Could not find MongoDB _id for deletion. Please check the console for details.');
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/artworks/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          category: itemToDelete.category
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }

      const result = await response.json();
      
      // Show success toast
      toast.success('Item deleted successfully!', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      
      // Remove the item from local state
      const updatedArtworks = allArtworks.filter(item => 
        item._id !== itemToDelete._id
      );
      setAllArtworks(updatedArtworks);
      
      const updatedFiltered = filteredArtworks.filter(item => 
        item._id !== itemToDelete._id
      );
      setFilteredArtworks(updatedFiltered);
      
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(`Failed to delete item: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(filteredArtworks.length / ITEMS_PER_PAGE);
  const displayedItems = artworks.slice(0, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Artworks & Artists</h1>
        {/* <Button className="bg-white text-black hover:bg-zinc-200">
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button> */}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by title, artist, price, gallery, or category..."
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
              key={item.uniqueId || `${item.category}-${item._id || index}-${index}`} 
              className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
              ref={index === displayedItems.length - 1 ? lastItemRef : null}
            >
              <CardContent className="p-4">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={item.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E"}
                    alt={item.title || item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="bg-white/90 hover:bg-white"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4 text-black" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="bg-white/90 hover:bg-white"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="w-4 h-4 text-black" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                    {item.type === "artwork" ? "Artwork" : item.type === "artist" ? "Artist" : "Museum"}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white line-clamp-2">
                    {item.title || item.name}
                  </h3>
                  <p className="text-sm text-zinc-300 mt-1 line-clamp-1">
                    {item.artistNames || "Unknown"}
                  </p>
                  {item.date && (
                    <p className="text-sm text-zinc-400 mt-1">
                      {item.date}
                    </p>
                  )}
                  {item.medium && (
                    <p className="text-sm text-zinc-400 mt-1 line-clamp-1">
                      {item.medium}
                    </p>
                  )}
                  {item.saleMessage && (
                    <div className="mt-2 p-2 bg-green-900/20 border border-green-700/30 rounded">
                      <p className="text-sm font-semibold text-green-400">
                        {item.saleMessage}
                      </p>
                    </div>
                  )}
                  {item.partner && (
                    <p className="text-sm text-zinc-400 mt-1 line-clamp-1">
                      {item.partner.name}
                    </p>
                  )}
                  <p className="text-sm text-zinc-500 mt-2 font-medium">
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <EditItemForm 
              item={editingItem} 
              onSave={handleUpdateItem} 
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-400">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-zinc-300">
              Are you sure you want to delete &quot;{itemToDelete?.name || itemToDelete?.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                className="border-zinc-700 text-white hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteItem}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Edit Item Form Component
function EditItemForm({ item, onSave, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: item.name || item.title || '',
    artist: item.artist || item.artistNames || '',
    gallery: item.gallery || item.partner?.name || '',
    image: item.image || '',
    medium: item.medium || item.mediumType || '',
    date: item.date || '',
    saleMessage: item.saleMessage || '',
    locations: item.locations || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-white">Name/Title</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="artist" className="text-white">Artist</Label>
          <Input
            id="artist"
            value={formData.artist}
            onChange={(e) => handleChange('artist', e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="gallery" className="text-white">Gallery/Partner</Label>
          <Input
            id="gallery"
            value={formData.gallery}
            onChange={(e) => handleChange('gallery', e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="medium" className="text-white">Medium</Label>
          <Input
            id="medium"
            value={formData.medium}
            onChange={(e) => handleChange('medium', e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="date" className="text-white">Date</Label>
          <Input
            id="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="saleMessage" className="text-white">Sale Message</Label>
          <Input
            id="saleMessage"
            value={formData.saleMessage}
            onChange={(e) => handleChange('saleMessage', e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image" className="text-white">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => handleChange('image', e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-zinc-700 text-white hover:bg-zinc-800"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
} 