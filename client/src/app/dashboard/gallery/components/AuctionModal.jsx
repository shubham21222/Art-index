"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { X, Upload, Search, Calendar, Clock, DollarSign, FileSpreadsheet, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import * as XLSX from 'xlsx';

export default function AuctionModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    artist: "",
    category: "",
    startingBid: "",
    minBidIncrement: "10",
    startDate: "",
    endDate: "",
    selectionMethod: "manual", // Only manual and excel options
    images: [""] // Add images array for manual entry
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/all`, {
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

  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('File must have at least a header row and one data row'));
            return;
          }

          const headers = jsonData[0].map(h => h?.toString().trim().replace(/"/g, ''));
          const products = [];

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
              const product = {};
              
              headers.forEach((header, index) => {
                product[header] = row[index] || '';
              });
              
              if (product['Product Title'] && product['Artist']) {
                const detailsArray = [];
                if (product['Details']) {
                  detailsArray.push({
                    key: 'Description',
                    value: product['Details']
                  });
                }
                if (product['Type']) {
                  detailsArray.push({
                    key: 'Type',
                    value: product['Type']
                  });
                }
                if (product['Medium']) {
                  detailsArray.push({
                    key: 'Medium',
                    value: product['Medium']
                  });
                }
                if (product['Dimensions']) {
                  detailsArray.push({
                    key: 'Dimensions',
                    value: product['Dimensions']
                  });
                }

                // Handle multiple image URLs (comma-separated)
                const imageUrls = product['Image URL'] 
                  ? product['Image URL'].split(',').map(url => url.trim()).filter(url => url !== '')
                  : [];
                
                products.push({
                  title: product['Product Title'],
                  description: product['Description'] || '',
                  price: parseFloat(product['Price'] || '0'),
                  estimateprice: product['Estimate Price'] || 'N/A',
                  offerAmount: parseFloat(product['Offer Amount'] || '0'),
                  onlinePrice: parseFloat(product['Online Price'] || '0'),
                  sellPrice: parseFloat(product['Starting Bid'] || '0'),
                  ReservePrice: parseFloat(product['Reserve Price'] || '0'),
                  skuNumber: product['SKU'] || 'N/A',
                  lotNumber: product['Lot Number'] || '',
                  internalID: product['Internal ID'] || `AUCTION_${Date.now()}_${i}`,
                  type: product['Type'] || '',
                  auctionType: product['Auction Type'] || 'TIMED',
                  image: imageUrls,
                  details: detailsArray,
                  stock: parseInt(product['Stock'] || '1'),
                  count: 1,
                  sortByPrice: product['Sort By Price'] || 'Low Price'
                });
              }
            }
          }
          
          resolve(products);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const downloadSampleFile = () => {
    const sampleData = [
      {
        'Product Title': 'Starry Night Over the Rhône',
        'Artist': 'Vincent van Gogh',
        'Price': '8500000',
        'Estimate Price': '8000000-9000000',
        'Starting Bid': '6000000',
        'Reserve Price': '5500000',
        'Type': 'Oil Painting',
        'Auction Type': 'TIMED',
        'SKU': 'ART001',
        'Lot Number': 'LOT#1',
        'Internal ID': 'AUCTION_001',
        'Description': 'A masterpiece of Post-Impressionist art, this oil painting depicts the Rhône River at night with stars reflecting in the water',
        'Details': 'Oil on canvas, 72.5 x 92 cm, 1888',
        'Medium': 'Oil on Canvas',
        'Dimensions': '72.5" x 92" cm',
        'Stock': '1',
        'Image URL': 'https://example.com/starry-night.jpg,https://example.com/starry-night-detail.jpg',
        'Sort By Price': 'High Price'
      },
      {
        'Product Title': 'The Persistence of Memory',
        'Artist': 'Salvador Dalí',
        'Price': '12000000',
        'Estimate Price': '11000000-13000000',
        'Starting Bid': '9000000',
        'Reserve Price': '8000000',
        'Type': 'Surrealist Painting',
        'Auction Type': 'TIMED',
        'SKU': 'ART002',
        'Lot Number': 'LOT#2',
        'Internal ID': 'AUCTION_002',
        'Description': 'Iconic surrealist painting featuring melting clocks in a dreamlike landscape',
        'Details': 'Oil on canvas, 24 x 33 cm, 1931',
        'Medium': 'Oil on Canvas',
        'Dimensions': '24" x 33" cm',
        'Stock': '1',
        'Image URL': 'https://example.com/persistence-memory.jpg,https://example.com/persistence-memory-detail.jpg',
        'Sort By Price': 'High Price'
      },
      {
        'Product Title': 'Girl with a Pearl Earring',
        'Artist': 'Johannes Vermeer',
        'Price': '45000000',
        'Estimate Price': '40000000-50000000',
        'Starting Bid': '35000000',
        'Reserve Price': '30000000',
        'Type': 'Dutch Golden Age',
        'Auction Type': 'TIMED',
        'SKU': 'ART003',
        'Lot Number': 'LOT#3',
        'Internal ID': 'AUCTION_003',
        'Description': 'One of Vermeer\'s most famous works, featuring a young woman with a pearl earring',
        'Details': 'Oil on canvas, 44.5 x 39 cm, 1665',
        'Medium': 'Oil on Canvas',
        'Dimensions': '44.5" x 39" cm',
        'Stock': '1',
        'Image URL': 'https://example.com/pearl-earring.jpg,https://example.com/pearl-earring-detail.jpg',
        'Sort By Price': 'High Price'
      }
    ];

    // Create Excel workbook
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Auction Template");
    
    // Generate Excel file
    XLSX.writeFile(wb, 'auction_sample_template.xlsx');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

          try {
        let auctionData;

      if (formData.selectionMethod === 'manual') {
        // Validate manual entry
        if (!formData.title || !formData.artist || !formData.category || !formData.startingBid || !formData.startDate || !formData.endDate) {
          throw new Error('Please fill in all required fields');
        }
        
        // Validate that at least one image URL is provided
        const validImages = formData.images.filter(img => img.trim() !== '');
        if (validImages.length === 0) {
          throw new Error('Please provide at least one image URL');
        }

        // Create product data for manual entry
        const productData = {
          title: formData.title,
          description: formData.description || '',
          price: parseFloat(formData.startingBid),
          estimateprice: `$${formData.startingBid}`,
          offerAmount: 0,
          onlinePrice: 0,
          sellPrice: parseFloat(formData.startingBid),
          ReservePrice: parseFloat(formData.startingBid) * 0.8, // 80% of starting bid
          skuNumber: `ART_${Date.now()}`,
          lotNumber: `LOT#${Date.now()}`,
          internalID: `AUCTION_${Date.now()}`,
          type: formData.category,
          auctionType: "TIMED",
          image: formData.images.filter(img => img.trim() !== ''), // Filter out empty image URLs
          details: [
            { key: 'Artist', value: formData.artist },
            { key: 'Description', value: formData.description || '' }
          ],
          stock: 1,
          count: 1,
          sortByPrice: 'High Price'
        };

        auctionData = {
          products: [productData],
          category: formData.category,
          stateDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          desciptions: formData.description || '',
          auctionType: "TIMED",
          status: "ACTIVE"
        };
      } else {
        // Validate Excel upload
        if (!formData.excelFile) {
          throw new Error('Please select an Excel file');
        }
        
        if (!formData.category || !formData.startDate || !formData.endDate) {
          throw new Error('Please fill in category, start date, and end date');
        }

        // Parse Excel file and create auction data
        const products = await parseExcelFile(formData.excelFile);
        
        auctionData = {
          products: products,
          category: formData.category,
          stateDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          desciptions: formData.description,
          auctionType: "TIMED",
          status: "ACTIVE"
        };
      }

      const endpoint = '/auction/bulkCreate';
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(auctionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create auction');
      }

      const result = await response.json();
      
      if (formData.selectionMethod === 'manual') {
        toast.success('Auction created successfully!');
      } else {
        toast.success(`Successfully created ${result.data?.length || 1} auctions`);
      }
      
      onSuccess();
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, excelFile: e.target.files[0] }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      artist: "",
      category: "",
      startingBid: "",
      minBidIncrement: "10",
      startDate: "",
      endDate: "",
      selectionMethod: "manual",
      images: [""]
    });
    setSearchQuery("");
    setFormData(prev => ({ ...prev, excelFile: null }));
  };

  const filteredProducts = []; // No longer filtering products from galleryArtworks

  const selectedProduct = null; // No longer selecting a product

  // Map artwork data to product format for display
  const mapArtworkToProduct = (artwork) => ({
    _id: artwork._id,
    title: artwork.title,
    description: artwork.description,
    price: artwork.price?.min || artwork.price || 0,
    image: artwork.images || [],
    category: artwork.category,
    artist: artwork.artist?.name || 'Unknown Artist'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Create New Auction</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Selection Method */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Auction Creation Method *
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, selectionMethod: 'manual' }))}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  formData.selectionMethod === 'manual' 
                    ? 'bg-white text-black border-white' 
                    : 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, selectionMethod: 'excel' }))}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  formData.selectionMethod === 'excel' 
                    ? 'bg-white text-black border-white' 
                    : 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                Upload Excel File
              </button>
            </div>
          </div>

          {/* Manual Entry Fields */}
          {formData.selectionMethod === 'manual' && (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Artwork Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="Enter artwork title"
                  required
                />
              </div>

              {/* Artist */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Artist Name *
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="Enter artist name"
                  required
                />
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
                  rows="3"
                  placeholder="Enter artwork description..."
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Image URLs
                </label>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[index] = e.target.value;
                          setFormData(prev => ({ ...prev, images: newImages }));
                        }}
                        className="flex-1 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
                        placeholder="Enter image URL..."
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, images: newImages }));
                          }}
                          className="px-3 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, images: [...prev.images, ""] }))}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white hover:bg-zinc-700 transition-colors"
                  >
                    + Add Another Image
                  </button>
                  
                  {/* Image Preview */}
                  {formData.images.some(img => img.trim() !== '') && (
                    <div className="mt-4">
                      <p className="text-sm text-zinc-400 mb-2">Image Preview:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {formData.images.filter(img => img.trim() !== '').map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-zinc-700"
                              onError={(e) => {
                                e.target.src = '/placeholder.jpeg';
                                e.target.alt = 'Image not found';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Excel Upload Option */}
          {formData.selectionMethod === 'excel' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Upload Excel File *
              </label>
              
              {/* Instructions */}
              <div className="bg-zinc-800 p-4 rounded-lg mb-4">
                <h3 className="text-white font-medium mb-2">Instructions</h3>
                <ul className="text-sm text-zinc-400 space-y-1">
                  <li>• Upload an Excel (.xlsx) or CSV file with auction data</li>
                  <li>• Each row represents one auction product</li>
                  <li>• Required columns: Product Title, Artist, Starting Bid</li>
                  <li>• Optional columns: Price, Estimate Price, Description, Image URL, etc.</li>
                  <li>• Image URL: Use comma-separated URLs for multiple images</li>
                  <li>• You still need to set category, start date, and end date below</li>
                  <li>• All auctions will use the same category, start date, and end date</li>
                </ul>
              </div>
              
              {/* Sample File Download */}
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg mb-4">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Download Sample Template</p>
                    <p className="text-sm text-zinc-400">Get the Excel template with sample data</p>
                  </div>
                </div>
                {/* <button
                  type="button"
                  onClick={downloadSampleFile}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button> */}
              </div>
              
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-zinc-600 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="auction-file-upload"
                />
                <label
                  htmlFor="auction-file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <Upload className="w-8 h-8 text-zinc-400" />
                  <div>
                    <p className="text-white font-medium">
                      {formData.excelFile ? formData.excelFile.name : "Click to select Excel file or drag and drop"}
                    </p>
                    <p className="text-sm text-zinc-400">
                      Excel (.xlsx, .xls) or CSV files
                    </p>
                  </div>
                </label>
              </div>
              {formData.excelFile && (
                <div className="mt-2 p-3 bg-zinc-800 rounded-lg">
                  <p className="text-sm text-green-400">✓ File selected: {formData.excelFile.name}</p>
                </div>
              )}
            </div>
          )}

          {/* Category - Show for both manual and Excel */}
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

          {/* Bidding Details - Show for both manual and Excel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Starting Bid ($) {formData.selectionMethod === 'manual' ? '*' : '(from Excel)'}
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
                  required={formData.selectionMethod === 'manual'}
                  disabled={formData.selectionMethod === 'excel'}
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

          {/* Date and Time - Show for both manual and Excel */}
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

          {/* Description - Show for both manual and Excel */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Auction Description
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
              {loading ? "Creating..." : formData.selectionMethod === 'manual' ? "Create Auction" : "Upload & Create Auctions"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 