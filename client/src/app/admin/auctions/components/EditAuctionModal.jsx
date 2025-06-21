"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { X, Search, Calendar, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function EditAuctionModal({ isOpen, auction, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    product: "",
    category: "",
    startingBid: "",
    minBidIncrement: "10",
    startDate: "",
    endDate: "",
    description: ""
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isOpen && auction) {
      fetchProducts();
      fetchCategories();
      populateFormData();
    }
  }, [isOpen, auction]);

  const populateFormData = () => {
    if (auction) {
      const startDate = new Date(auction.startDate).toISOString().slice(0, 16);
      const endDate = new Date(auction.endDate).toISOString().slice(0, 16);
      
      setFormData({
        product: auction.product?._id || auction.product || "",
        category: auction.category?._id || auction.category || "",
        startingBid: auction.startingBid?.toString() || "",
        minBidIncrement: auction.minBidIncrement?.toString() || "10",
        startDate: startDate,
        endDate: endDate,
        description: auction.description || ""
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/all`, {
        headers: {
            'Authorization': `${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status && data.items) {
          setProducts(data.items);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/category/all`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status && data.items) {
          setCategories(data.items);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auctionData = {
        ...formData,
        auctionType: "TIMED",
        startingBid: parseFloat(formData.startingBid),
        minBidIncrement: parseFloat(formData.minBidIncrement),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/auction/update/${auction._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(auctionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update auction');
      }

      toast.success('Auction updated successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to update auction');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProduct = products.find(p => p._id === formData.product);

  if (!isOpen || !auction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Edit Auction</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Auction Info */}
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2">Auction Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-400">Lot Number:</span>
                <span className="text-white ml-2">{auction.lotNumber}</span>
              </div>
              <div>
                <span className="text-zinc-400">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  auction.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {auction.status}
                </span>
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Select Product *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProductSearch(!showProductSearch)}
                className="w-full flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white hover:bg-zinc-700 transition-colors"
              >
                <span>
                  {selectedProduct ? selectedProduct.title : "Choose a product..."}
                </span>
                <Search className="w-4 h-4" />
              </button>

              {showProductSearch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg max-h-60 overflow-y-auto z-10">
                  <div className="p-3 border-b border-zinc-700">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-600 rounded text-white placeholder-zinc-400 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            product: product._id,
                            category: product.category?._id || product.category
                          }));
                          setShowProductSearch(false);
                        }}
                        className="w-full p-3 text-left hover:bg-zinc-700 transition-colors border-b border-zinc-700 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image?.[0] || '/placeholder.jpg'}
                            alt={product.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <div className="text-white font-medium">{product.title}</div>
                            <div className="text-zinc-400 text-sm">${product.price}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bidding Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Starting Bid ($) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                  type="number"
                  value={formData.startingBid}
                  onChange={(e) => setFormData(prev => ({ ...prev, startingBid: e.target.value }))}
                  className="w-full pl-10 pr-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Minimum Bid Increment ($)
              </label>
              <input
                type="number"
                value={formData.minBidIncrement}
                onChange={(e) => setFormData(prev => ({ ...prev, minBidIncrement: e.target.value }))}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
                placeholder="10"
                min="1"
                step="1"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Start Date & Time *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full pl-10 pr-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                End Date & Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full pl-10 pr-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
              rows="4"
              placeholder="Enter auction description..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Auction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 