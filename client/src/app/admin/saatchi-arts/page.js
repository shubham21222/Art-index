"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, Trash2, Filter, ChevronLeft, ChevronRight, X, Save, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast, { Toaster } from 'react-hot-toast';
import SoldBadge from '@/components/SoldBadge';

export default function SaatchiArtsPage() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedMedium, setSelectedMedium] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [allArtworks, setAllArtworks] = useState([]);
  const [imageErrors, setImageErrors] = useState(new Set());

  // Get unique values for filters
  const categories = [...new Set(allArtworks.map(art => art.category).filter(Boolean))].sort();
  const styles = [...new Set(allArtworks.flatMap(art => art.styles || []).filter(Boolean))].sort();
  const mediums = [...new Set(allArtworks.flatMap(art => art.mediums || []).filter(Boolean))].sort();

  // Helper function to get image URL
  const getImageUrl = (artwork) => {
    if (artwork.image_url) return artwork.image_url;
    if (artwork.imageUrl) return artwork.imageUrl;
    if (artwork.image?.src) return artwork.image.src;
    if (artwork.image?.resized?.src) return artwork.image.resized.src;
    if (artwork.image?.url) return artwork.image.url;
    return '/placeholder.svg';
  };

  // Helper function to get artwork title
  const getArtworkTitle = (artwork) => {
    return artwork.artwork_title || artwork.title || artwork.name || 'Untitled Artwork';
  };

  // Helper function to get artist name
  const getArtistName = (artwork) => {
    return artwork.full_name || artwork.artist || artwork.artistNames || 'Unknown Artist';
  };

  // Handle image error
  const handleImageError = (artworkId) => {
    setImageErrors(prev => new Set(prev).add(artworkId));
  };

  // Generate unique ID for React keys
  const generateUniqueId = () => {
    return `saatchi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Fetch Saatchi Arts from Algolia API
  const fetchSaatchiArts = useCallback(async (pageNum = 0, append = false) => {
    try {
      const loadingState = pageNum === 0 ? setLoading : setLoadingMore;
      loadingState(true);

      const payload = {
        analytics: true,
        analyticsTags: ["web"],
        clickAnalytics: true,
        enablePersonalization: false,
        facetingAfterDistinct: true,
        facets: "*",
        filters: "(has_prints:\"true\")",
        hitsPerPage: 20,
        page: pageNum,
        query: searchTerm,
        userToken: "vc_eond94ta93"
      };

      // Add filters
      if (selectedCategory !== 'all') {
        payload.filters += ` AND (category:"${selectedCategory}")`;
      }
      if (selectedStyle !== 'all') {
        payload.filters += ` AND (styles:"${selectedStyle}")`;
      }
      if (selectedMedium !== 'all') {
        payload.filters += ` AND (mediums:"${selectedMedium}")`;
      }

      console.log('Fetching Saatchi Arts with payload:', payload);

      const response = await fetch('/api/algolia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Saatchi Arts response:', data);
      
      if (!data.hits) {
        setArtworks([]);
        setHasMore(false);
        return;
      }

      // Add unique IDs and mark as external
      const processedArtworks = data.hits.map(artwork => ({
        ...artwork,
        uniqueId: generateUniqueId(),
        isExternal: true,
        source: 'saatchi'
      }));

      if (append) {
        setArtworks(prev => [...prev, ...processedArtworks]);
      } else {
        setArtworks(processedArtworks);
      }
      
      setHasMore(data.hits.length === 20);
      setCurrentPage(pageNum);
    } catch (error) {
      console.error('Error fetching Saatchi Arts:', error);
      toast.error('Failed to fetch Saatchi Arts');
      setArtworks([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, selectedCategory, selectedStyle, selectedMedium]);

  // Fetch all artworks for filter options
  const fetchAllArtworksForFilters = useCallback(async () => {
    try {
      const payload = {
        analytics: true,
        analyticsTags: ["web"],
        clickAnalytics: true,
        enablePersonalization: false,
        facetingAfterDistinct: true,
        facets: "*",
        filters: "(has_prints:\"true\")",
        hitsPerPage: 1000,
        page: 0,
        query: "",
        userToken: "vc_eond94ta93"
      };

      const response = await fetch('/api/algolia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.hits) {
        setAllArtworks(data.hits);
      }
    } catch (error) {
      console.error('Error fetching all artworks for filters:', error);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        setIsSearching(true);
        fetchSaatchiArts(0, false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchSaatchiArts]);

  // Initial load
  useEffect(() => {
    fetchAllArtworksForFilters();
    fetchSaatchiArts(0, false);
  }, [fetchAllArtworksForFilters, fetchSaatchiArts]);

  // Load more items
  const loadMoreItems = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchSaatchiArts(currentPage + 1, true);
    }
  }, [loadingMore, hasMore, currentPage, fetchSaatchiArts]);

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem({
      ...item,
      soldStatus: item.soldStatus || 'available',
      soldPrice: item.soldPrice || '',
      soldTo: item.soldTo || '',
      soldNotes: item.soldNotes || ''
    });
    setShowEditModal(true);
  };

  // Handle update
  const handleUpdateItem = async (updatedData) => {
    if (!editingItem) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/artworks/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          id: editingItem.objectID || editingItem.artId || editingItem.id,
          category: 'Artwork',
          updates: {
            ...updatedData,
            slug: editingItem.slug,
            name: updatedData.customTitle || getArtworkTitle(editingItem),
            artist: updatedData.customArtistName || getArtistName(editingItem),
            image: getImageUrl(editingItem),
            href: `/art/${editingItem.slug || `artwork-${editingItem.objectID}`}`,
            isExternal: true,
            source: 'saatchi'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item');
      }

      const result = await response.json();
      console.log('Update result:', result);

      // Update local state
      setArtworks(prev => prev.map(item => 
        item.uniqueId === editingItem.uniqueId 
          ? { 
              ...item, 
              ...updatedData,
              customTitle: updatedData.customTitle,
              customArtistName: updatedData.customArtistName
            }
          : item
      ));

      toast.success('Saatchi Art updated successfully!');
      setShowEditModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating Saatchi Art:', error);
      toast.error(error.message || 'Failed to update Saatchi Art');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStyle('all');
    setSelectedMedium('all');
  };

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saatchi Arts Management</h1>
          <p className="text-gray-600 mt-1">Manage Saatchi Arts artworks, search, and update sold status</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Saatchi Arts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search Saatchi Arts by title, artist, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                {styles.map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMedium} onValueChange={setSelectedMedium}>
              <SelectTrigger>
                <SelectValue placeholder="Medium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Mediums</SelectItem>
                {mediums.map(medium => (
                  <SelectItem key={medium} value={medium}>{medium}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={() => fetchSaatchiArts(0, false)}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Saatchi Arts ({artworks.length} found)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : artworks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((artwork) => {
                  const imageUrl = getImageUrl(artwork);
                  const artworkTitle = getArtworkTitle(artwork);
                  const artistName = getArtistName(artwork);
                  const artworkId = artwork.objectID || artwork.artId || artwork.id;

                  return (
                    <Card key={artwork.uniqueId} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative w-full h-48 overflow-hidden">
                        <Image
                          src={imageErrors.has(artworkId) ? '/placeholder.svg' : imageUrl}
                          alt={`${artworkTitle} by ${artistName}`}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(artworkId)}
                        />
                        {artwork.soldStatus && artwork.soldStatus !== 'available' && (
                          <div className="absolute top-2 right-2">
                            <SoldBadge status={artwork.soldStatus} />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                          {artwork.customArtistName || artistName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                          &ldquo;{artwork.customTitle || artworkTitle}&rdquo;
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          {artwork.mediums?.slice(0, 2).map((medium, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {medium}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {artwork.city}, {artwork.country}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(artwork)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={loadMoreItems}
                    disabled={loadingMore}
                    variant="outline"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No Saatchi Arts found matching your criteria.</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Saatchi Art</DialogTitle>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-6 py-4">
              {/* Image Preview */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                  <Image
                    src={getImageUrl(editingItem)}
                    alt={getArtworkTitle(editingItem)}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="artist-name" className="text-sm font-medium">
                      Artist Name
                    </Label>
                    <Input 
                      id="artist-name"
                      value={editingItem.customArtistName || getArtistName(editingItem)} 
                      onChange={(e) => setEditingItem(prev => ({ ...prev, customArtistName: e.target.value }))}
                      placeholder="Enter artist name"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="artwork-title" className="text-sm font-medium">
                      Artwork Title
                    </Label>
                    <Input 
                      id="artwork-title"
                      value={editingItem.customTitle || getArtworkTitle(editingItem)} 
                      onChange={(e) => setEditingItem(prev => ({ ...prev, customTitle: e.target.value }))}
                      placeholder="Enter artwork title"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sold-status" className="text-sm font-medium">
                    Sold Status
                  </Label>
                  <Select
                    value={editingItem.soldStatus}
                    onValueChange={(value) => setEditingItem(prev => ({ ...prev, soldStatus: value }))}
                  >
                    <SelectTrigger id="sold-status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional Fields */}
                {editingItem.soldStatus !== 'available' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Sale Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sold-price" className="text-sm font-medium">
                          Sold Price ($)
                        </Label>
                        <Input
                          id="sold-price"
                          type="number"
                          value={editingItem.soldPrice || ''}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, soldPrice: e.target.value }))}
                          placeholder="Enter sold price"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="sold-to" className="text-sm font-medium">
                          Sold To
                        </Label>
                        <Input
                          id="sold-to"
                          value={editingItem.soldTo || ''}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, soldTo: e.target.value }))}
                          placeholder="Enter buyer name"
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sold-notes" className="text-sm font-medium">
                        Notes
                      </Label>
                      <Textarea
                        id="sold-notes"
                        value={editingItem.soldNotes || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, soldNotes: e.target.value }))}
                        placeholder="Enter any additional notes"
                        rows={3}
                        className="w-full resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateItem({
                    soldStatus: editingItem.soldStatus,
                    soldPrice: editingItem.soldPrice,
                    soldTo: editingItem.soldTo,
                    soldNotes: editingItem.soldNotes,
                    customTitle: editingItem.customTitle,
                    customArtistName: editingItem.customArtistName
                  })}
                  disabled={isSubmitting}
                  className="px-6"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Artwork
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
