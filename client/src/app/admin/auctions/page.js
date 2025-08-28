"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Eye,
  Gavel,
  Grid,
  List,
  FolderOpen,
  BookOpen,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import CreateAuctionModal from "./components/CreateAuctionModal";
import EditAuctionModal from "./components/EditAuctionModal";
import BulkUploadModal from "./components/BulkUploadModal";

export default function AdminAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("catalog"); // "catalog", "grid", or "list"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [expandedCatalogs, setExpandedCatalogs] = useState(new Set());
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auction/all`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // Handle different possible response structures
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
        console.log('No valid data structure found, setting empty array');
        auctionData = [];
      }
      
      setAuctions(auctionData);
    } catch (error) {
      toast.error('Failed to fetch auctions');
      console.error('Error fetching auctions:', error);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  // Group auctions by catalog (category)
  const groupAuctionsByCatalog = (auctions) => {
    const catalogs = {};
    
    auctions.forEach(auction => {
      const catalogName = auction.category?.name || 'Uncategorized';
      const catalogId = auction.category?._id || 'uncategorized';
      
      if (!catalogs[catalogId]) {
        catalogs[catalogId] = {
          id: catalogId,
          name: catalogName,
          auctions: [],
          totalLots: 0,
          activeLots: 0,
          totalValue: 0,
          totalBidders: 0
        };
      }
      
      catalogs[catalogId].auctions.push(auction);
      catalogs[catalogId].totalLots++;
      catalogs[catalogId].totalValue += auction.currentBid || auction.startingBid || 0;
      catalogs[catalogId].totalBidders += auction.participants?.length || 0;
      
      if (auction.status === 'ACTIVE') {
        catalogs[catalogId].activeLots++;
      }
    });
    
    return Object.values(catalogs);
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auction/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify({ auctionId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete auction');
      }

      toast.success('Auction deleted successfully');
      fetchAuctions();
    } catch (error) {
      toast.error('Failed to delete auction');
      console.error('Error deleting auction:', error);
    }
  };

  const handleDeleteAllAuctionsByCategory = async (categoryId, categoryName) => {
    if (!confirm(`Are you sure you want to delete ALL auctions in the "${categoryName}" catalog? This action cannot be undone and will delete ${catalogs.find(cat => cat.id === categoryId)?.auctions?.length || 0} auctions.`)) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auction/deleteAllByCategory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify({ categoryId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete all auctions in this catalog');
      }

      const result = await response.json();
      toast.success(`Successfully deleted ${result.data?.auctionsDeleted || 0} auctions from "${categoryName}" catalog`);
      fetchAuctions();
    } catch (error) {
      toast.error('Failed to delete all auctions in this catalog');
      console.error('Error deleting all auctions by category:', error);
    }
  };

  const handleDeleteAllAuctions = async () => {
    if (!confirm(`Are you sure you want to delete ALL auctions across ALL catalogs? This action cannot be undone and will delete ${auctions.length} auctions.`)) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auction/deleteAllAuctionsAndCatalogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete all auctions and catalogs');
      }

      const result = await response.json();
      toast.success(`Successfully deleted all auctions and catalogs (${result.data?.totalDeleted || 0} items deleted)`);
      fetchAuctions();
    } catch (error) {
      toast.error('Failed to delete all auctions and catalogs');
      console.error('Error deleting all auctions and catalogs:', error);
    }
  };

  const handleDeleteAllCatalogs = async () => {
    if (!confirm(`Are you sure you want to delete ALL catalogs? This action cannot be undone and will delete ${catalogs.length} catalogs and all their auctions.`)) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auction/deleteAllAuctionsAndCatalogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete all catalogs');
      }

      const result = await response.json();
      toast.success(`Successfully deleted all catalogs and their auctions (${result.data?.totalDeleted || 0} items deleted)`);
      fetchAuctions();
    } catch (error) {
      toast.error('Failed to delete all catalogs');
      console.error('Error deleting all catalogs:', error);
    }
  };

  const handleEditAuction = (auction) => {
    setSelectedAuction(auction);
    setIsEditModalOpen(true);
  };

  const toggleCatalogExpansion = (catalogId) => {
    const newExpanded = new Set(expandedCatalogs);
    if (newExpanded.has(catalogId)) {
      newExpanded.delete(catalogId);
    } else {
      newExpanded.add(catalogId);
    }
    setExpandedCatalogs(newExpanded);
  };

  const filteredAuctions = (auctions || []).filter(auction => {
    const matchesSearch = auction.product?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         auction.lotNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         auction.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || auction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const catalogs = groupAuctionsByCatalog(filteredAuctions);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Auction Catalogs</h1>
          <p className="text-zinc-400 mt-2">Manage auction catalogs and individual lots</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsBulkUploadModalOpen(true)}
            className="flex items-center px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={handleDeleteAllAuctions}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            title={`Delete all ${auctions.length} auctions across all catalogs`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All Auctions
          </button>
          <button
            onClick={handleDeleteAllCatalogs}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            title={`Delete all ${catalogs.length} catalogs`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All Catalogs
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Auction
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-white" />
            <div className="ml-4">
              <p className="text-sm text-zinc-400">Total Catalogs</p>
              <p className="text-2xl font-bold text-white">{catalogs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center">
            <Gavel className="w-8 h-8 text-white" />
            <div className="ml-4">
              <p className="text-sm text-zinc-400">Total Lots</p>
              <p className="text-2xl font-bold text-white">{auctions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-green-400" />
            <div className="ml-4">
              <p className="text-sm text-zinc-400">Active Lots</p>
              <p className="text-2xl font-bold text-white">
                {(auctions || []).filter(a => a.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm text-zinc-400">Total Value</p>
              <p className="text-2xl font-bold text-white">
                ${(auctions || []).reduce((sum, auction) => sum + (auction.currentBid || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search catalogs, lots, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ENDED">Ended</option>
          </select>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("catalog")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "catalog" 
                ? "bg-white text-black" 
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
            title="Catalog View"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid" 
                ? "bg-white text-black" 
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" 
                ? "bg-white text-black" 
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Catalog View */}
      {viewMode === "catalog" && (
        <div className="space-y-4">
          {catalogs.map((catalog) => (
            <div key={catalog.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              {/* Catalog Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-zinc-800 transition-colors"
                onClick={() => toggleCatalogExpansion(catalog.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {expandedCatalogs.has(catalog.id) ? (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    )}
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="text-xl font-semibold text-white">{catalog.name}</h3>
                      <p className="text-zinc-400 text-sm">
                        {catalog.totalLots} lots • {catalog.activeLots} active • ${catalog.totalValue.toLocaleString()} total value
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-6 text-sm text-zinc-400">
                      <span>{catalog.totalBidders} bidders</span>
                      <span className={`px-2 py-1 rounded-full ${catalog.activeLots > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {catalog.activeLots > 0 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAllAuctionsByCategory(catalog.id, catalog.name);
                      }}
                      className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      title={`Delete all ${catalog.totalLots} auctions in this catalog`}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete All
                    </button>
                  </div>
                </div>
              </div>

              {/* Catalog Lots (Expandable) */}
              {expandedCatalogs.has(catalog.id) && (
                <div className="border-t border-zinc-800">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {catalog.auctions.map((auction) => (
                        <div key={auction._id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors">
                          {/* Lot Image */}
                          <div className="relative h-32 bg-zinc-700 rounded-lg mb-3 overflow-hidden">
                            <img
                              src={auction.product?.image?.[0] || '/placeholder.jpg'}
                              alt={auction.product?.title || 'Lot'}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(auction.status)}`}>
                                {auction.status}
                              </span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className="bg-black bg-opacity-75 text-white px-2 py-1 text-xs rounded">
                                {auction.lotNumber || 'No Lot'}
                              </span>
                            </div>
                          </div>

                          {/* Lot Info */}
                          <h4 className="text-white font-medium text-sm mb-1 line-clamp-1">
                            {auction.product?.title || 'Untitled Lot'}
                          </h4>
                          <p className="text-zinc-400 text-xs mb-2 line-clamp-2">
                            {auction.product?.description || 'No description'}
                          </p>

                          {/* Price and Bidders */}
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-xs text-zinc-400">Current Bid</p>
                              <p className="text-white font-bold text-sm">
                                ${auction.currentBid?.toLocaleString() || auction.startingBid?.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-zinc-400">Bidders</p>
                              <p className="text-white text-sm">
                                {auction.participants?.length || 0}
                              </p>
                            </div>
                          </div>

                          {/* End Date */}
                          <p className="text-xs text-zinc-500 mb-3">
                            Ends: {formatDate(auction.endDate)}
                          </p>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditAuction(auction)}
                              className="flex-1 flex items-center justify-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAuction(auction._id)}
                              className="flex items-center justify-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Grid View (Original) */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAuctions.map((auction) => (
            <div key={auction._id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-600 transition-colors">
              {/* Product Image */}
              <div className="relative h-48 bg-zinc-800">
                <img
                  src={auction.product?.image?.[0] || '/placeholder.jpg'}
                  alt={auction.product?.title || 'Auction Item'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(auction.status)}`}>
                    {auction.status}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="bg-black bg-opacity-75 text-white px-2 py-1 text-xs rounded">
                    {auction.lotNumber || 'No Lot'}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-lg mb-1">
                  {auction.product?.title || 'Untitled'}
                </h3>
                <p className="text-zinc-400 text-sm mb-2">
                  {auction.category?.name || 'Uncategorized'}
                </p>
                <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                  {auction.product?.description || 'No description available'}
                </p>

                {/* Price Info */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-zinc-400">Current Bid</p>
                    <p className="text-white font-bold text-lg">
                      ${auction.currentBid?.toLocaleString() || auction.startingBid?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">Bidders</p>
                    <p className="text-white font-medium">
                      {auction.participants?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Date Info */}
                <div className="text-xs text-zinc-500 mb-4">
                  <p>Ends: {formatDate(auction.endDate)}</p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAuction(auction)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAuction(auction._id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View (Original) */}
      {viewMode === "list" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Auction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Lot Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Current Bid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Bidders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredAuctions.map((auction) => (
                  <tr key={auction._id} className="hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={auction.product?.image?.[0] || '/placeholder.jpg'}
                            alt={auction.product?.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {auction.product?.title || 'Untitled'}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {auction.category?.name || 'Uncategorized'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {auction.lotNumber || 'No Lot'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      ${auction.currentBid?.toLocaleString() || auction.startingBid?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatDate(auction.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {auction.participants?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(auction.status)}`}>
                        {auction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAuction(auction)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAuction(auction._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateAuctionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchAuctions();
          }}
        />
      )}

      {isEditModalOpen && selectedAuction && (
        <EditAuctionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          auction={selectedAuction}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedAuction(null);
            fetchAuctions();
          }}
        />
      )}

      {isBulkUploadModalOpen && (
        <BulkUploadModal
          isOpen={isBulkUploadModalOpen}
          onClose={() => setIsBulkUploadModalOpen(false)}
          onSuccess={() => {
            setIsBulkUploadModalOpen(false);
            fetchAuctions();
          }}
        />
      )}
    </div>
  );
} 