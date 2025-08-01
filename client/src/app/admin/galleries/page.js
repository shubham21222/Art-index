"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, Trash2, MapPin, Filter, ChevronLeft, ChevronRight, X, Save } from "lucide-react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast, { Toaster } from 'react-hot-toast';

// Define all gallery categories and their API endpoints
const GALLERY_CATEGORIES = [
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
];

// Define museum and institution categories
const MUSEUM_CATEGORIES = [
  { name: "Museums", endpoint: "/api/museums", slug: "museums" },
  { name: "University Museums", endpoint: "/api/university-museums", slug: "university-museums" },
  { name: "Nonprofit Organizations", endpoint: "/api/nonprofit-organizations", slug: "nonprofit-organizations" },
  { name: "Artist Estates", endpoint: "/api/artist-estates", slug: "artist-estates" },
  { name: "Private Collections", endpoint: "/api/private-collections", slug: "private-collections" },
  { name: "Historical Art", endpoint: "/api/historical-art", slug: "historical-art" },
  { name: "Modern & Contemporary Art", endpoint: "/api/modern-contemporary-art", slug: "modern-contemporary-art" },
  { name: "Outdoor Art", endpoint: "/api/outdoor-art", slug: "outdoor-art" },
];

// Define show categories
const SHOW_CATEGORIES = [
  { name: "Shows", endpoint: "/api/shows", slug: "shows" },
];

// Combine all categories
const ALL_CATEGORIES = [
  { name: "All Items", endpoint: "all", slug: "all" },
  ...GALLERY_CATEGORIES,
  ...MUSEUM_CATEGORIES,
  ...SHOW_CATEGORIES,
];

const ITEMS_PER_PAGE = 12;

export default function GalleriesPage() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [allGalleries, setAllGalleries] = useState([]);
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
    fetchAllGalleries();
  }, []);

  useEffect(() => {
    // Filter galleries based on search query and selected category
    let filtered = allGalleries;
    
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
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.artistNames?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.saleMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.locations?.some(loc => 
          loc.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.country?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    setFilteredGalleries(filtered);
    setCurrentPage(1); // Reset pagination when filters change
    setHasMore(filtered.length > ITEMS_PER_PAGE);
    
    // Initialize displayed items
    const initialItems = filtered.slice(0, ITEMS_PER_PAGE);
    setGalleries(initialItems);
  }, [searchQuery, selectedCategory, allGalleries]);

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
      const newItems = filteredGalleries.slice(startIndex, endIndex);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setGalleries(prev => [...prev, ...newItems]);
        setHasMore(endIndex < filteredGalleries.length);
      }
    } catch (error) {
      console.error("Error loading more items:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchAllGalleries = async () => {
    try {
      setLoading(true);
      
      // Fetch galleries from all categories with pagination
      const galleryPromises = GALLERY_CATEGORIES.map(async (category) => {
        try {
          const response = await fetch(`${category.endpoint}?page=1&limit=100`);
          const data = await response.json();
          
          // Extract galleries from the response
          let categoryGalleries = [];
          if (data.galleries) {
            categoryGalleries = data.galleries;
          }
          
          // Add category information to each gallery
          return categoryGalleries.map((gallery, index) => ({
            ...gallery,
            category: category.name,
            type: "gallery",
            name: gallery.title || gallery.name,
            image: gallery.image?.src || gallery.image?.url || "/placeholder-gallery.jpg",
            locations: gallery.partner ? [{ city: gallery.partner.name, country: "Gallery" }] : [],
            artist: gallery.artistNames,
            medium: gallery.mediumType,
            date: gallery.date,
            slug: gallery.slug,
            internalID: gallery.internalID,
            saleMessage: gallery.saleMessage,
            partner: gallery.partner,
            artists: gallery.artists,
            uniqueId: `${category.name}-${gallery.internalID || gallery.id || index}-${index}`
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
          } else if (data.galleries) {
            categoryMuseums = data.galleries;
          }
          
          // Add category information to each museum
          return categoryMuseums.map((museum, index) => ({
            ...museum,
            category: category.name,
            type: "museum",
            name: museum.name || museum.title,
            image: museum.image?.src || museum.image?.url || "/placeholder-gallery.jpg",
            locations: museum.locations || [],
            uniqueId: `${category.name}-${museum.id || museum.internalID || index}-${index}`
          }));
        } catch (error) {
          console.error(`Error fetching ${category.name}:`, error);
          return [];
        }
      });
      
      // Fetch shows
      const showPromises = SHOW_CATEGORIES.map(async (category) => {
        try {
          const response = await fetch(category.endpoint);
          const data = await response.json();
          
          // Extract shows from the response
          let categoryShows = [];
          if (data.shows) {
            categoryShows = data.shows;
          }
          
          // Add category information to each show
          return categoryShows.map((show, index) => ({
            ...show,
            category: category.name,
            type: "show",
            name: show.name || show.title,
            image: show.image?.src || show.coverImage || "/placeholder-gallery.jpg",
            locations: show.locations || [],
            uniqueId: `${category.name}-${show.id || show.internalID || index}-${index}`
          }));
        } catch (error) {
          console.error(`Error fetching ${category.name}:`, error);
          return [];
        }
      });
      
      const results = await Promise.all([
        ...galleryPromises,
        ...museumPromises,
        ...showPromises
      ]);
      
      const combinedItems = results.flat();
      
      setAllGalleries(combinedItems);
      setFilteredGalleries(combinedItems);
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
      image: item.image?.src || item.image,
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
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/galleries/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingItem.internalID || editingItem._id,
          category: editingItem.category,
          updates: updatedData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
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
      const updatedGalleries = allGalleries.map(item => {
        if (item.internalID === editingItem.internalID || item._id === editingItem._id) {
          const updatedItem = { ...item, ...result.item };
          // Ensure image is a string URL for Next.js Image component
          if (updatedItem.image && typeof updatedItem.image === 'object' && updatedItem.image.src) {
            updatedItem.image = updatedItem.image.src;
          }
          return updatedItem;
        }
        return item;
      });
      
      setAllGalleries(updatedGalleries);
      setIsEditDialogOpen(false);
      setEditingItem(null);
      
      // Refresh the filtered galleries with proper image handling
      const updatedFiltered = filteredGalleries.map(item => {
        if (item.internalID === editingItem.internalID || item._id === editingItem._id) {
          const updatedItem = { ...item, ...result.item };
          // Ensure image is a string URL for Next.js Image component
          if (updatedItem.image && typeof updatedItem.image === 'object' && updatedItem.image.src) {
            updatedItem.image = updatedItem.image.src;
          }
          return updatedItem;
        }
        return item;
      });
      setFilteredGalleries(updatedFiltered);
      
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/galleries/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemToDelete.internalID || itemToDelete._id,
          category: itemToDelete.category
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
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
      const updatedGalleries = allGalleries.filter(item => 
        item.internalID !== itemToDelete.internalID && item._id !== itemToDelete._id
      );
      setAllGalleries(updatedGalleries);
      
      const updatedFiltered = filteredGalleries.filter(item => 
        item.internalID !== itemToDelete.internalID && item._id !== itemToDelete._id
      );
      setFilteredGalleries(updatedFiltered);
      
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(filteredGalleries.length / ITEMS_PER_PAGE);
  const displayedItems = galleries.slice(0, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Galleries & Museums</h1>
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
            placeholder="Search by name, artist, gallery, price, city, or country..."
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
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-60">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="aspect-video bg-zinc-800 rounded-lg animate-pulse" />
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
              key={item.uniqueId} 
              className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
              ref={index === displayedItems.length - 1 ? lastItemRef : null}
            >
              <CardContent className="p-4">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={item.image || "/placeholder-gallery.jpg"}
                    alt={item.name || item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                    {item.type === "gallery" ? "Gallery" : item.type === "museum" ? "Museum" : "Show"}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white line-clamp-2">
                    {item.name || item.title}
                  </h3>
                  {item.artist && (
                    <p className="text-sm text-zinc-300 mt-1 line-clamp-1">
                      {item.artist}
                    </p>
                  )}
                  <div className="flex items-center mt-1 text-sm text-zinc-400">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {item.locations?.map(loc => loc.city).join(", ") || item.partner?.name || "Location not specified"}
                    </span>
                  </div>
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
      {!loading && filteredGalleries.length > 0 && (
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