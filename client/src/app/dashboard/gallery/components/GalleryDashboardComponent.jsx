'use client';

import React from 'react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Search,
  Filter,
  Star,
  Grid,
  List,
  Palette,
  Eye,
  Gavel,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { MuseumDetailView } from '../../museums/components/MuseumDetailView';
import { ArtworkForm } from './ArtworkForm';
import { ArtworkList } from './ArtworkList';
import AuctionModal from './AuctionModal';
import BulkUploadModal from './BulkUploadModal';

// Helper function to format image URLs
const formatImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '/placeholder.jpeg';
  
  // If it's already a valid URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it starts with www, add https://
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  
  // If it's a relative path, return as is
  if (url.startsWith('/')) {
    return url;
  }
  
  // For other cases, treat as invalid and return placeholder
  return '/placeholder.jpeg';
};

// Helper function to handle image errors
const handleImageError = (e) => {
  e.target.src = '/placeholder.jpeg';
};

export function GalleryDashboardComponent() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [selectedGalleryForArtwork, setSelectedGalleryForArtwork] = useState(null);
  const [isArtworkListOpen, setIsArtworkListOpen] = useState(false);
  const [selectedGalleryForList, setSelectedGalleryForList] = useState(null);
  const [isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [auctionsLoading, setAuctionsLoading] = useState(false);
  const [selectedGalleryForAuction, setSelectedGalleryForAuction] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [''],
    category: '',
    isFeatured: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, user } = useSelector((state) => state.auth);
  const isFetching = useRef(false);

  const fetchGalleries = useCallback(async () => {
    if (!token || isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/all`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch galleries');
      }

      const data = await res.json();
      if (data.status && data.items) {
        setGalleries(data.items);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch galleries');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchGalleries();
    }
  }, [fetchGalleries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = selectedGallery
        ? `${process.env.NEXT_PUBLIC_API_URL}/gallery/update/${selectedGallery._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/gallery/create`;

      console.log('Submitting gallery data:', formData);
      console.log('URL:', url);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      const result = await res.json();
      console.log('Success response:', result);

      toast.success(selectedGallery ? 'Gallery updated successfully' : 'Gallery created successfully');
      setIsModalOpen(false);
      setSelectedGallery(null);
      setFormData({
        title: '',
        description: '',
        images: [''],
        category: '',
        isFeatured: false
      });
      fetchGalleries();
    } catch (error) {
      console.error('Gallery submit error:', error);
      toast.error(error.message || 'Failed to save gallery');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (galleryId) => {
    if (!confirm('Are you sure you want to delete this gallery?')) return;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/delete/${galleryId}`, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete gallery');
      }

      toast.success('Gallery deleted successfully');
      fetchGalleries();
    } catch (error) {
      toast.error(error.message || 'Failed to delete gallery');
    }
  };

  const handleEdit = async (gallery) => {
    setSelectedGallery(gallery);
    setFormData({
      title: gallery.title,
      description: gallery.description,
      images: gallery.images.length ? gallery.images : [''],
      category: gallery.categoryName || (typeof gallery.category === 'object' ? gallery.category._id : gallery.category) || '',
      isFeatured: gallery.isFeatured
    });
    setIsModalOpen(true);
  };

  const handleAddImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    // Format the URL if it's not empty
    const formattedUrl = value.trim() ? formatImageUrl(value) : value;
    newImages[index] = formattedUrl;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleRemoveImageField = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddArtwork = (gallery) => {
    setSelectedGalleryForArtwork(gallery);
    setSelectedArtwork(null);
    setIsArtworkModalOpen(true);
  };

  const handleViewArtworks = (gallery) => {
    setSelectedGalleryForList(gallery);
    setIsArtworkListOpen(true);
  };

  const handleEditArtwork = (gallery, artwork) => {
    setSelectedGalleryForArtwork(gallery);
    setSelectedArtwork(artwork);
    setIsArtworkModalOpen(true);
  };

  const handleDeleteArtwork = async (galleryId, artworkId) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/${galleryId}/artworks/${artworkId}/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete artwork');
      }

      toast.success('Artwork deleted successfully');
      fetchGalleries();
    } catch (error) {
      toast.error(error.message || 'Failed to delete artwork');
    }
  };

  const handleArtworkSubmit = async (artworkData) => {
    try {
      const url = selectedArtwork
        ? `${process.env.NEXT_PUBLIC_API_URL}/gallery/artwork/update/${selectedGalleryForArtwork._id}/${selectedArtwork._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/gallery/artwork/add/${selectedGalleryForArtwork._id}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(artworkData)
      });

      if (!res.ok) {
        throw new Error('Failed to save artwork');
      }

      toast.success(selectedArtwork ? 'Artwork updated successfully!' : 'Artwork added successfully!');
      setIsArtworkModalOpen(false);
      setSelectedArtwork(null);
      setSelectedGalleryForArtwork(null);
      fetchGalleries();
    } catch (error) {
      toast.error(error.message || 'Failed to save artwork');
    }
  };

  // Auction-related functions
  const fetchAuctions = useCallback(async () => {
    if (!token) return;

    try {
      setAuctionsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auction/all`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch auctions');
      }

      const data = await res.json();
      console.log('Auctions API response:', data);
      
      // Handle the correct API response structure
      let auctionData = [];
      if (data.status && data.items && data.items.formattedAuctions) {
        auctionData = Array.isArray(data.items.formattedAuctions) ? data.items.formattedAuctions : [];
      } else if (data.status && data.items) {
        auctionData = Array.isArray(data.items) ? data.items : [];
      } else if (data.status && data.data) {
        auctionData = Array.isArray(data.data) ? data.data : [];
      } else if (Array.isArray(data)) {
        auctionData = data;
      } else {
        console.warn('Unexpected auctions API response structure:', data);
        auctionData = [];
      }
      
      // Filter auctions to show only those created by the current user
      const userAuctions = auctionData.filter(auction => {
        const currentUserId = user?._id;
        return auction.createdBy === currentUserId;
      });
      
      setAuctions(userAuctions);
      console.log('Processed auction data:', userAuctions);
      console.log('Number of user auctions:', userAuctions.length);
      console.log('Current user ID:', user?._id);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      toast.error(error.message || 'Failed to fetch auctions');
      setAuctions([]); // Set empty array on error
    } finally {
      setAuctionsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (token) {
      fetchAuctions();
    }
  }, [fetchAuctions]);

  const handleCreateAuction = () => {
    // If there's only one gallery, use it. Otherwise, show a selection modal or use the first one
    const galleryToUse = galleries.length === 1 ? galleries[0] : galleries[0]; // For now, use first gallery
    setSelectedGalleryForAuction(galleryToUse);
    setIsAuctionModalOpen(true);
  };

  const handleAuctionSuccess = () => {
    fetchAuctions();
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!confirm('Are you sure you want to delete this auction?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auction/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify({ auctionId: auctionId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete auction');
      }

      const result = await response.json();
      toast.success(result.message || 'Auction deleted successfully!');
      fetchAuctions(); // Refresh the auctions list
    } catch (error) {
      console.error('Error deleting auction:', error);
      toast.error(error.message || 'Failed to delete auction');
    }
  };

  const filteredGalleries = useMemo(() => {
    return galleries.filter(gallery =>
    gallery.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gallery.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  }, [galleries, searchQuery]);

  const stats = useMemo(() => {
    return {
    total: galleries.length,
    featured: galleries.filter(g => g.isFeatured).length,
      categories: new Set(galleries.map(g => g.categoryDisplay || g.category?.name || g.categoryName || 'Uncategorized')).size,
      totalArtworks: galleries.reduce((sum, gallery) => sum + (gallery.artworks?.length || 0), 0),
      activeArtworks: galleries.reduce((sum, gallery) => sum + (gallery.artworks?.filter(a => a.isActive)?.length || 0), 0),
      totalAuctions: Array.isArray(auctions) ? auctions.length : 0,
      activeAuctions: Array.isArray(auctions) ? auctions.filter(a => a.status === 'ACTIVE').length : 0,
  };
  }, [galleries, auctions]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Gallery Management</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your gallery collections, showcase your artwork, and connect with art enthusiasts worldwide.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Galleries</h3>
            <ImageIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Featured Galleries</h3>
            <Star className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.featured}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            <Filter className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.categories}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Artworks</h3>
            <Palette className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalArtworks}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Artworks</h3>
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.activeArtworks}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Auctions</h3>
            <Gavel className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalAuctions}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Auctions</h3>
            <Gavel className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.activeAuctions}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 w-full gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search galleries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="bg-gray-50"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleCreateAuction}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Gavel className="w-4 h-4 mr-2" />
              Create Auction
            </Button>
            <Button
              onClick={() => {
                setSelectedGallery(null);
                setFormData({
                  title: '',
                  description: '',
                  images: [''],
                  category: '',
                  isFeatured: false
                });
                setIsModalOpen(true);
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Gallery
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGalleries.map((gallery) => (
            <div key={gallery._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group hover:shadow-md transition-shadow">
              <div className="relative h-64">
                <Image
                  src={formatImageUrl(gallery.images[0])}
                  alt={gallery.title}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                />
                {gallery.isFeatured && (
                  <Badge className="absolute top-4 right-4 bg-yellow-500">
                    Featured
                  </Badge>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 truncate">
                    {gallery.title}
                  </h3>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(gallery)}
                      className="hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAddArtwork(gallery)}
                      className="hover:bg-green-50 text-green-600"
                      title="Add Artwork"
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewArtworks(gallery)}
                      className="hover:bg-blue-50 text-blue-600"
                      title="View Artworks"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(gallery._id)}
                      className="hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600 line-clamp-2 mb-4">
                  {gallery.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-gray-50">
                    {gallery.categoryDisplay || gallery.category?.name || gallery.categoryName || 'Uncategorized'}
                  </Badge>
                  <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {gallery.images.length} images
                  </span>
                    {gallery.artworks && gallery.artworks.length > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {gallery.artworks.length} artworks
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredGalleries.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No galleries found</h3>
              <p className="mt-2 text-gray-500">
                {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new gallery'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGalleries.map((gallery) => (
            <div key={gallery._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={formatImageUrl(gallery.images[0])}
                      alt={gallery.title}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{gallery.title}</h3>
                    <p className="text-gray-600">{gallery.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(gallery)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddArtwork(gallery)}
                    className="text-green-600"
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewArtworks(gallery)}
                    className="text-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(gallery._id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auctions Section */}
      {Array.isArray(auctions) && auctions.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Auctions</h2>
            {/* <div className="flex space-x-3">
              <Button
                onClick={() => setIsBulkUploadModalOpen(true)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Button
                onClick={handleCreateAuction}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Gavel className="w-4 h-4 mr-2" />  
                Create Auction
              </Button>
            </div> */}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {auctions.map((auction) => (
              <div key={auction._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {auction.product?.title || 'Untitled Auction'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`${
                          auction.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                          auction.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {auction.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAuction(auction._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Auction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Starting Bid:</span>
                      <span className="font-semibold text-gray-900">${auction.startingBid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Bid:</span>
                      <span className="font-semibold text-green-600">${auction.currentBid || auction.startingBid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Lot Number:</span>
                      <span className="font-semibold text-gray-900">{auction.lotNumber}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    <div>Start: {new Date(auction.startDate).toLocaleDateString()}</div>
                    <div>End: {new Date(auction.endDate).toLocaleDateString()}</div>
                  </div>
                  
                  {auction.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {auction.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog for Add/Edit Gallery */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedGallery ? 'Edit Gallery' : 'Add New Gallery'}
            </DialogTitle>
            <DialogDescription>
              {selectedGallery ? 'Update gallery information' : 'Create a new gallery'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter gallery title"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter gallery description"
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Images</label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    required
                  />
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveImageField(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-gray-500">
                Enter full URLs starting with http:// or https://. URLs starting with www. will be automatically formatted.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddImageField}
                className="w-full"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Add Image URL
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Enter category name or ID"
                required
              />
              <p className="text-xs text-gray-500">
                You can enter a category name (e.g., "Modern Art") or a valid ObjectId
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium">
                Featured Gallery
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : selectedGallery ? 'Update Gallery' : 'Create Gallery'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Artwork Form Modal */}
      <ArtworkForm
        isOpen={isArtworkModalOpen}
        onClose={() => {
          setIsArtworkModalOpen(false);
          setSelectedArtwork(null);
          setSelectedGalleryForArtwork(null);
        }}
        onSubmit={handleArtworkSubmit}
        artwork={selectedArtwork}
        isSubmitting={isSubmitting}
      />

      {/* Artwork List Modal */}
      <ArtworkList
        isOpen={isArtworkListOpen}
        onClose={() => setIsArtworkListOpen(false)}
        gallery={selectedGalleryForList}
        onDeleteArtwork={handleDeleteArtwork}
        onEditArtwork={handleEditArtwork}
      />

      {/* Auction Modal */}
      <AuctionModal
        isOpen={isAuctionModalOpen}
        onClose={() => {
          setIsAuctionModalOpen(false);
          setSelectedGalleryForAuction(null);
        }}
        onSuccess={handleAuctionSuccess}
        galleryArtworks={selectedGalleryForAuction?.artworks || []}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onSuccess={() => {
          setIsBulkUploadModalOpen(false);
          fetchAuctions(); // Refresh auctions after bulk upload
        }}
      />
    </div>
  );
} 