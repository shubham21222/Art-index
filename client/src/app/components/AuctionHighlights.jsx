'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Gavel, Users, ArrowRight, Star, Eye } from 'lucide-react';

const AuctionHighlights = () => {
  const [hoveredAuction, setHoveredAuction] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [stats, setStats] = useState({
    activeAuctions: 0,
    totalBidders: 0,
    totalValue: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auction/all`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }

      const data = await response.json();
      console.log('Auction API Response:', data);
      
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

      // Take only the first 4 active auctions
      const activeAuctions = auctionData
        .filter(auction => auction.status === 'ACTIVE')
        .slice(0, 4);

      setAuctions(activeAuctions);

      // Calculate real statistics
      const totalBidders = auctionData.reduce((sum, auction) => sum + (auction.participants?.length || 0), 0);
      const totalValue = auctionData.reduce((sum, auction) => sum + (auction.currentBid || auction.startingBid || 0), 0);
      const activeAuctionsCount = auctionData.filter(auction => auction.status === 'ACTIVE').length;
      const endedAuctionsCount = auctionData.filter(auction => auction.status === 'ENDED').length;
      const successRate = endedAuctionsCount > 0 ? Math.round((endedAuctionsCount / (endedAuctionsCount + activeAuctionsCount)) * 100) : 0;

      setStats({
        activeAuctions: activeAuctionsCount,
        totalBidders,
        totalValue,
        successRate
      });

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
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
    } else {
      return `${minutes} min`;
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

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full mb-4">
            <Gavel className="w-4 h-4 text-black mr-2" />
            <span className="text-sm font-medium text-black">Live Auctions</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Auction Highlights
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover exceptional artworks available for bidding from talented artists worldwide
          </p>
        </motion.div>

        {/* Auction Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {auctions.map((auction, index) => (
            <motion.div
              key={auction._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
              onMouseEnter={() => setHoveredAuction(auction._id)}
              onMouseLeave={() => setHoveredAuction(null)}
            >
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={auction.product?.image?.[0] || '/placeholder.jpg'}
                    alt={auction.product?.title || 'Auction Item'}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Overlay with Actions */}
                  {hoveredAuction === auction._id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                    >
                      <Link href={`/auction/${auction._id}`}>
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors"
                        >
                          Place Bid
                        </motion.button>
                      </Link>
                    </motion.div>
                  )}

                  {/* Badges */}
                  {/* <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-black text-xs font-semibold rounded-full">
                      {auction.category?.name || 'Uncategorized'}
                    </span>
                  </div> */}

                  {/* Lot Number */}
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                      <span className="text-sm font-bold text-black">{auction.lotNumber || 'No Lot'}</span>
                    </div>
                  </div>

                  {/* Time Left */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">{formatTimeLeft(auction.endDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span className="text-sm">{auction.participants?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Artist Info */}
                  <div className="flex items-center mb-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200">
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-gray-500">Artist</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-black">Artist</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <Eye className="w-3 h-3 mr-1" />
                        <span>View details</span>
                      </div>
                    </div>
                  </div>

                  {/* Artwork Title */}
                  <h3 className="text-lg font-bold text-black mb-3 group-hover:text-gray-700 transition-colors line-clamp-2">
                    {auction.product?.title || 'Untitled Artwork'}
                  </h3>

                  {/* Bidding Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Bid:</span>
                      <span className="text-lg font-bold text-black">
                        {formatCurrency(auction.currentBid || auction.startingBid || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Starting Bid:</span>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(auction.startingBid || 0)}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center justify-between">
                    <Link href={`/auction/${auction._id}`}>
                      <motion.button
                        className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Auction
                      </motion.button>
                    </Link>
                    <Link href={`/auction/${auction._id}`}>
                      <motion.button
                        className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowRight className="w-4 h-4 text-black" />
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
          {/* <motion.div 
            className="bg-gray-50 rounded-2xl p-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-black mb-2">{stats.activeAuctions}</div>
                <div className="text-gray-600">Active Auctions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black mb-2">{stats.totalBidders.toLocaleString()}</div>
                <div className="text-gray-600">Total Bidders</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black mb-2">{formatCurrency(stats.totalValue)}</div>
                <div className="text-gray-600">Total Value</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black mb-2">{stats.successRate}%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
            </div>
          </motion.div> */}

        {/* Bottom CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Link href="/auctions">
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-800"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore All Auctions
              <Gavel className="ml-2 w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default AuctionHighlights; 