'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Gavel, Users, ArrowRight, Star, Eye } from 'lucide-react';

const AuctionHighlights = () => {
  const [hoveredAuction, setHoveredAuction] = useState(null);

  const auctionHighlights = [
    {
      id: 1,
      title: "Abstract Harmony in Blue",
      artist: "Sarah Chen",
      artistImage: "https://d7hftxdivxxvm.cloudfront.net?height=60&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FbvOv06PgLWNH59m8Uo43JQ%2Fwide.jpg&width=60",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=400&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2F6pzQaRA5WB8-XtHWuAW4RA%2Fmain.jpg&width=500",
      currentBid: "$12,500",
      startingBid: "$8,000",
      bidders: 24,
      timeLeft: "2 days 14 hours",
      category: "Contemporary",
      lotNumber: "LOT#1247",
      isFeatured: true,
      views: "1.2k"
    },
    {
      id: 2,
      title: "Urban Reflections",
      artist: "Marcus Rodriguez",
      artistImage: "https://d7hftxdivxxvm.cloudfront.net?height=60&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRYLtSPyYuHuL8P6xVaxK0g%2Fmain.jpg&width=60",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=400&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FPa-fblR2j-r-B_eSfm4ang%2Fmain.jpg&width=500",
      currentBid: "$8,900",
      startingBid: "$5,500",
      bidders: 18,
      timeLeft: "1 day 8 hours",
      category: "Modern",
      lotNumber: "LOT#1248",
      isFeatured: false,
      views: "856"
    },
    {
      id: 3,
      title: "Nature's Symphony",
      artist: "Emma Thompson",
      artistImage: "https://d7hftxdivxxvm.cloudfront.net?height=60&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FwwaLgcrlUyamFpiT6g_BRw%2Fwide.jpg&width=60",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=400&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FbvOv06PgLWNH59m8Uo43JQ%2Fwide.jpg&width=500",
      currentBid: "$15,800",
      startingBid: "$12,000",
      bidders: 31,
      timeLeft: "3 days 6 hours",
      category: "Abstract",
      lotNumber: "LOT#1249",
      isFeatured: true,
      views: "2.1k"
    },
    {
      id: 4,
      title: "Digital Dreams",
      artist: "Alex Kim",
      artistImage: "https://d7hftxdivxxvm.cloudfront.net?height=60&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FP2PBzTmhDlq2AD7D6G9S5g%2Fwide.jpg&width=60",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=400&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRYLtSPyYuHuL8P6xVaxK0g%2Fmain.jpg&width=500",
      currentBid: "$6,200",
      startingBid: "$4,000",
      bidders: 15,
      timeLeft: "5 hours 30 min",
      category: "Digital Art",
      lotNumber: "LOT#1250",
      isFeatured: false,
      views: "623"
    }
  ];

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
          {auctionHighlights.map((auction, index) => (
            <motion.div
              key={auction.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
              onMouseEnter={() => setHoveredAuction(auction.id)}
              onMouseLeave={() => setHoveredAuction(null)}
            >
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={auction.image}
                    alt={auction.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Overlay with Actions */}
                  {hoveredAuction === auction.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                    >
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors"
                      >
                        Place Bid
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    {auction.isFeatured && (
                      <span className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    )}
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-black text-xs font-semibold rounded-full">
                      {auction.category}
                    </span>
                  </div>

                  {/* Lot Number */}
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                      <span className="text-sm font-bold text-black">{auction.lotNumber}</span>
                    </div>
                  </div>

                  {/* Time Left */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">{auction.timeLeft}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span className="text-sm">{auction.bidders}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Artist Info */}
                  <div className="flex items-center mb-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src={auction.artistImage}
                        alt={auction.artist}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-black">{auction.artist}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <Eye className="w-3 h-3 mr-1" />
                        <span>{auction.views} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Artwork Title */}
                  <h3 className="text-lg font-bold text-black mb-3 group-hover:text-gray-700 transition-colors line-clamp-2">
                    {auction.title}
                  </h3>

                  {/* Bidding Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Bid:</span>
                      <span className="text-lg font-bold text-black">{auction.currentBid}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Starting Bid:</span>
                      <span className="text-sm text-gray-500">{auction.startingBid}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center justify-between">
                    <motion.button
                      className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Auction
                    </motion.button>
                    <motion.button
                      className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowRight className="w-4 h-4 text-black" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div 
          className="bg-gray-50 rounded-2xl p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-black mb-2">156</div>
              <div className="text-gray-600">Active Auctions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black mb-2">2,847</div>
              <div className="text-gray-600">Total Bidders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black mb-2">$1.2M</div>
              <div className="text-gray-600">Total Value</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black mb-2">98%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </motion.div>

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