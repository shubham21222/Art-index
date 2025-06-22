"use client";

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Clock, Gavel, Users, ArrowRight, Search, Filter, Grid, List } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const AuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [filteredAuctions, setFilteredAuctions] = useState([]);

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    // Filter auctions based on search and status
    const filtered = auctions.filter(auction => {
      const matchesSearch = auction.product?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           auction.lotNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           auction.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || auction.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredAuctions(filtered);
  }, [auctions, searchQuery, filterStatus]);

  const fetchAuctions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/auction/all`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }

      const data = await response.json();
      console.log('Auctions API Response:', data);
      
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
      console.error('Error fetching auctions:', error);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) {
      return 'Ended';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
    <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-full mb-4">
              <Gavel className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Live Auctions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              All Auctions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover exceptional artworks available for bidding from talented artists worldwide
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <Gavel className="w-8 h-8 text-black" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Auctions</p>
                  <p className="text-2xl font-bold text-black">{auctions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Auctions</p>
                  <p className="text-2xl font-bold text-black">
                    {auctions.filter(a => a.status === 'ACTIVE').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Bidders</p>
                  <p className="text-2xl font-bold text-black">
                    {auctions.reduce((sum, auction) => sum + (auction.participants?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <ArrowRight className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-black">
                    {formatCurrency(auctions.reduce((sum, auction) => sum + (auction.currentBid || auction.startingBid || 0), 0))}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters and Search */}
          <motion.div 
            className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search auctions by title, lot number, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="ENDED">Ended</option>
              </select>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" 
                    ? "bg-black text-white" 
                    : "bg-white text-gray-400 hover:text-black border border-gray-300"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" 
                    ? "bg-black text-white" 
                    : "bg-white text-gray-400 hover:text-black border border-gray-300"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Auctions Display */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAuctions.map((auction, index) => (
                  <motion.div
                    key={auction._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group relative"
                  >
                    <Link href={`/auction/${auction._id}`}>
                      <div className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={auction.product?.image?.[0] || '/placeholder.jpg'}
                            alt={auction.product?.title || 'Auction Item'}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
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

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="text-black font-semibold text-lg mb-1 line-clamp-1">
                            {auction.product?.title || 'Untitled'}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {auction.category?.name || 'Uncategorized'}
                          </p>

                          {/* Price Info */}
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm text-gray-600">Current Bid</p>
                              <p className="text-black font-bold text-lg">
                                {formatCurrency(auction.currentBid || auction.startingBid || 0)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Bidders</p>
                              <p className="text-black font-medium">
                                {auction.participants?.length || 0}
                              </p>
                            </div>
                          </div>

                          {/* Time Left */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{formatTimeLeft(auction.endDate)}</span>
                            </div>
                            <span className="text-xs">View Details →</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              // List View
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Auction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lot Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Bid
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bidders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAuctions.map((auction) => (
                        <tr key={auction._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/auction/${auction._id}`}>
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <Image
                                    className="h-12 w-12 rounded-lg object-cover"
                                    src={auction.product?.image?.[0] || '/placeholder.jpg'}
                                    alt={auction.product?.title}
                                    width={48}
                                    height={48}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-black">
                                    {auction.product?.title || 'Untitled'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {auction.category?.name || 'Uncategorized'}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {auction.lotNumber || 'No Lot'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {formatCurrency(auction.currentBid || auction.startingBid || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {new Date(auction.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {auction.participants?.length || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(auction.status)}`}>
                              {auction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link href={`/auction/${auction._id}`}>
                              <button className="text-black hover:text-gray-700 font-medium">
                                View Details →
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredAuctions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No auctions found</div>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </motion.div>
        </div>
    </div>
    <Footer />
    </>
  );
};

export default AuctionsPage;