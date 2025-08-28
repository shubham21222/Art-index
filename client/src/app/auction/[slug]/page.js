"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LoginModal from '../../components/LoginModal';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Gavel, 
  Users, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Eye, 
  Heart,
  Share2,
  ArrowLeft,
  Timer,
  Tag
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

const AuctionDetailPage = () => {
  const params = useParams();
  const auctionId = params.slug;
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (auctionId) {
      fetchAuctionDetails();
    }
  }, [auctionId]);

  useEffect(() => {
    if (auction) {
      const timer = setInterval(() => {
        updateTimeLeft();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [auction]);

  // Close login modal when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && showLoginModal) {
      setShowLoginModal(false);
      toast.success('Login successful! You can now place bids.');
    }
  }, [isAuthenticated, showLoginModal]);

  const fetchAuctionDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auction/${auctionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch auction details');
      }

      const data = await response.json();
      console.log('Auction Detail API Response:', data);
      
      // Handle different possible response structures
      let auctionData = null;
      if (data.status && data.items) {
        auctionData = data.items;
      } else if (data.status && data.data) {
        auctionData = data.data;
      } else if (data.auction) {
        auctionData = data.auction;
      } else {
        auctionData = data;
      }

      setAuction(auctionData);
    } catch (error) {
      console.error('Error fetching auction details:', error);
      toast.error('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const updateTimeLeft = () => {
    if (!auction?.endDate) return;

    const now = new Date();
    const end = new Date(auction.endDate);
    const diff = end - now;

    if (diff <= 0) {
      setTimeLeft('Auction Ended');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    } else if (hours > 0) {
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    } else if (minutes > 0) {
      setTimeLeft(`${minutes}m ${seconds}s`);
    } else {
      setTimeLeft(`${seconds}s`);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePlaceBid = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      toast.error('Please login to place a bid');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= (auction.currentBid || auction.startingBid)) {
      toast.error('Bid amount must be higher than current bid');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auction/placeBid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify({
          auctionId: auction._id,
          bidAmount: parseFloat(bidAmount)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place bid');
      }

      toast.success('Bid placed successfully!');
      setBidAmount('');
      fetchAuctionDetails(); // Refresh auction data
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error(error.message || 'Failed to place bid');
    }
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

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    toast.success('Login successful! You can now place bids.');
  };

  const handleOpenSignUp = () => {
    setShowLoginModal(false);
    // You can add signup modal logic here if needed
    toast.info('Please use the signup option in the header');
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

  if (!auction) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Auction Not Found</h1>
              <p className="text-gray-600 mb-8">The auction you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Link href="/auctions">
                <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  Back to Auctions
                </button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images = auction.product?.image || ['/placeholder.jpg'];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link href="/auctions">
              <button className="flex items-center text-gray-600 hover:text-black transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Auctions
              </button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={images[currentImageIndex]}
                  alt={auction.product?.title || 'Auction Item'}
                  fill
                  className="object-cover"
                />
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(auction.status)}`}>
                    {auction.status}
                  </span>
                </div>

                {/* Lot Number */}
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-2 bg-black bg-opacity-75 text-white rounded-lg">
                    <span className="text-sm font-bold">{auction.lotNumber || 'No Lot'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <button className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  {/* <button className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button> */}
                </div>
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index ? 'border-black' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${auction.product?.title} - Image ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Auction Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-8"
            >
              {/* Header */}
              <div>
                {/* <div className="flex items-center space-x-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{auction.category?.name || 'Uncategorized'}</span>
                </div> */}
                <h1 className="text-3xl font-bold text-black mb-2">
                  {auction.product?.title || 'Untitled Artwork'}
                </h1>
                <p className="text-gray-600 text-lg">
                  {auction.product?.description || 'No description available'}
                </p>
              </div>

              {/* Time Left */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Timer className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-sm text-red-600 font-medium">Time Remaining</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{timeLeft}</span>
                </div>
              </div>

              {/* Bidding Info */}
              <div className="bg-white rounded-lg border p-6 space-y-4">
                <h3 className="text-xl font-semibold text-black">Bidding Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Bid</p>
                    <p className="text-2xl font-bold text-black">
                      {formatCurrency(auction.currentBid || auction.startingBid || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Starting Bid</p>
                    <p className="text-lg text-gray-700">
                      {formatCurrency(auction.startingBid || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {auction.participants?.length || 0} bidders
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">View details</span>
                  </div>
                </div>

                {/* Place Bid Form */}
                {auction.status === 'ACTIVE' && (
                  <div className="space-y-3 pt-4 border-t">
                    {isAuthenticated ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Bid Amount
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              placeholder="Enter bid amount"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              min={auction.currentBid ? auction.currentBid + 1 : auction.startingBid}
                            />
                            <button
                              onClick={handlePlaceBid}
                              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                            >
                              Place Bid
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Logged in as: {user?.name || user?.email}
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600 mb-3">You need to be logged in to place a bid</p>
                        <button
                          onClick={() => setShowLoginModal(true)}
                          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                          Login to Bid
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Auction Details */}
              <div className="bg-white rounded-lg border p-6 space-y-4">
                <h3 className="text-xl font-semibold text-black">Auction Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Auction Type</span>
                    <span className="font-medium">{auction.auctionType || 'Timed'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-medium">{formatDate(auction.startDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">End Date</span>
                    <span className="font-medium">{formatDate(auction.endDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Minimum Bid Increment</span>
                    <span className="font-medium">{formatCurrency(auction.minBidIncrement || 10)}</span>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              {auction.product && (
                <div className="bg-white rounded-lg border p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-black">Artwork Details</h3>
                  
                  <div className="space-y-3">
                    {auction.product.details && auction.product.details.length > 0 ? (
                      auction.product.details.map((detail, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-600">{detail.key}</span>
                          <span className="font-medium">{detail.value}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Medium</span>
                          <span className="font-medium">{auction.product.medium || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Dimensions</span>
                          <span className="font-medium">{auction.product.dimensions || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Year</span>
                          <span className="font-medium">{auction.product.year || 'Not specified'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onOpenSignUp={handleOpenSignUp}
      />
    </>
  );
};

export default AuctionDetailPage; 