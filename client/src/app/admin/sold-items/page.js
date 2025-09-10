"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Calendar,
  User,
  Filter,
  Search,
  MoreVertical,
  Eye,
  RotateCcw,
  ShoppingCart
} from 'lucide-react';

export default function SoldItemsPage() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('sold');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtworks, setSelectedArtworks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch sold artworks
  const fetchSoldArtworks = async (page = 1, status = 'sold') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api'}/artworks/external-sold?page=${page}&limit=20&status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sold artworks');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      setArtworks(data.items?.artworks || []);
      setTotalPages(data.items?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching sold artworks:', error);
      toast.error('Failed to fetch sold artworks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api'}/artworks/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Stats Response:', data); // Debug log
        setStats(data.items || {});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchSoldArtworks(currentPage, selectedStatus);
    fetchStats();
  }, [currentPage, selectedStatus]);

  // Mark artwork as available
  const markAsAvailable = async (artwork) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api'}/artworks/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: artwork.artsyId || artwork._id,
          category: 'Artwork',
          updates: {
            soldStatus: 'available',
            slug: artwork.slug,
            title: artwork.title,
            artistNames: artwork.artistNames,
            imageUrl: artwork.image,
            href: `/artwork/${artwork.slug}`
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark artwork as available');
      }

      toast.success('Artwork marked as available');
      fetchSoldArtworks(currentPage, selectedStatus);
      fetchStats();
    } catch (error) {
      console.error('Error marking artwork as available:', error);
      toast.error('Failed to mark artwork as available');
    }
  };

  // Bulk mark as available
  const bulkMarkAsAvailable = async () => {
    if (selectedArtworks.length === 0) {
      toast.error('Please select artworks to mark as available');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const promises = selectedArtworks.map(artwork => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api'}/artworks/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: artwork.artsyId || artwork._id,
            category: 'Artwork',
            updates: {
              soldStatus: 'available',
              slug: artwork.slug,
              title: artwork.title,
              artistNames: artwork.artistNames,
              imageUrl: artwork.image,
              href: `/artwork/${artwork.slug}`
            }
          })
        })
      );

      await Promise.all(promises);
      toast.success(`${selectedArtworks.length} artworks marked as available`);
      setSelectedArtworks([]);
      setShowBulkActions(false);
      fetchSoldArtworks(currentPage, selectedStatus);
      fetchStats();
    } catch (error) {
      console.error('Error bulk marking artworks:', error);
      toast.error('Failed to mark artworks as available');
    }
  };

  // Handle artwork selection
  const toggleArtworkSelection = (artwork) => {
    setSelectedArtworks(prev => {
      const isSelected = prev.some(item => item._id === artwork._id);
      if (isSelected) {
        return prev.filter(item => item._id !== artwork._id);
      } else {
        return [...prev, artwork];
      }
    });
  };

  // Select all artworks
  const selectAllArtworks = () => {
    if (selectedArtworks.length === artworks.length) {
      setSelectedArtworks([]);
    } else {
      setSelectedArtworks([...artworks]);
    }
  };

  // Filter artworks by search term
  const filteredArtworks = artworks.filter(artwork =>
    artwork.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.galleryTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions = [
    { value: 'sold', label: 'Sold', icon: CheckCircle, color: 'text-green-500' },
    { value: 'reserved', label: 'Reserved', icon: Clock, color: 'text-yellow-500' },
    { value: 'available', label: 'Available', icon: XCircle, color: 'text-blue-500' }
  ];

  return (
    <div className="p-6 bg-zinc-950 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Sold Items Management</h1>
        <p className="text-zinc-400">Manage sold, reserved, and available artworks</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Total Artworks</p>
              <p className="text-2xl font-bold text-white">{stats.totalArtworks || 0}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Sold Artworks</p>
              <p className="text-2xl font-bold text-green-500">{stats.soldArtworks || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Total Sold Value</p>
              <p className="text-2xl font-bold text-white">${(stats.totalSoldValue || 0).toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Average Price</p>
              <p className="text-2xl font-bold text-white">${(stats.averageSoldPrice || 0).toFixed(0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Status Filter */}
            <div className="flex gap-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    selectedStatus === option.value
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <option.icon className={`h-4 w-4 ${option.color}`} />
                  {option.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedArtworks.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={bulkMarkAsAvailable}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Mark as Available ({selectedArtworks.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Artworks Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedArtworks.length === artworks.length && artworks.length > 0}
                  onChange={selectAllArtworks}
                  className="rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-zinc-300 font-medium">Select All</span>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-zinc-700">
              {filteredArtworks.map((artwork) => (
                <div key={artwork._id} className="p-6 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedArtworks.some(item => item._id === artwork._id)}
                      onChange={() => toggleArtworkSelection(artwork)}
                      className="rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-500"
                    />

                    {/* Artwork Image */}
                    <div className="w-16 h-16 bg-zinc-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {artwork.images && artwork.images.length > 0 ? (
                        <Image
                          src={artwork.images[0]}
                          alt={artwork.title || 'Artwork'}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <ShoppingCart className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Artwork Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {artwork.title}
                          </h3>
                          <p className="text-zinc-400 text-sm truncate">
                            by {artwork.artist?.name || 'Unknown Artist'}
                          </p>
                          <p className="text-zinc-500 text-xs truncate">
                            Gallery: {artwork.galleryTitle || 'Unknown Gallery'}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 ml-4">
                          {artwork.soldStatus === 'sold' && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">
                              <CheckCircle className="h-3 w-3" />
                              Sold
                            </span>
                          )}
                          {artwork.soldStatus === 'reserved' && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs">
                              <Clock className="h-3 w-3" />
                              Reserved
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Sold Details */}
                      {artwork.soldStatus === 'sold' && (
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-zinc-400">Sold Price:</span>
                            <p className="text-green-400 font-semibold">
                              ${artwork.soldPrice?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-zinc-400">Sold Date:</span>
                            <p className="text-white">
                              {artwork.soldAt ? new Date(artwork.soldAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-zinc-400">Sold To:</span>
                            <p className="text-white truncate">
                              {artwork.soldTo || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-zinc-400">Category:</span>
                            <p className="text-white">
                              {artwork.category || 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {artwork.soldNotes && (
                        <div className="mt-2">
                          <span className="text-zinc-400 text-sm">Notes:</span>
                          <p className="text-zinc-300 text-sm">{artwork.soldNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => markAsAvailable(artwork)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Mark Available
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-zinc-800 px-6 py-4 border-t border-zinc-700">
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-sm transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-sm transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Empty State */}
      {!loading && filteredArtworks.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400 mb-2">No {selectedStatus} artworks found</h3>
          <p className="text-zinc-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No artworks match the current filter'}
          </p>
        </div>
      )}
    </div>
  );
}
