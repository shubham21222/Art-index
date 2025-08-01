"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import * as XLSX from 'xlsx';

export default function BulkUploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    startDate: "",
    endDate: "",
    description: ""
  });
  const { token } = useSelector((state) => state.auth);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if file is Excel or CSV
      const validTypes = [  
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid Excel or CSV file');
        return;
      }
      
      setFile(selectedFile);
      setUploadResult(null);
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
                // Convert details string to proper object structure
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
                  image: product['Image URL'] ? [product['Image URL']] : [],
                  details: detailsArray, // Now properly structured
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

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const product = {};
        
        headers.forEach((header, index) => {
          product[header] = values[index] || '';
        });
        
        if (product['Product Title'] && product['Artist']) {
          // Convert details string to proper object structure
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
            image: product['Image URL'] ? [product['Image URL']] : [],
            details: detailsArray, // Now properly structured
            stock: parseInt(product['Stock'] || '1'),
            count: 1,
            sortByPrice: product['Sort By Price'] || 'Low Price'
          });
        }
      }
    }
    
    return products;
  };

  const handleUpload = async () => {
    if (!file || !formData.category || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields and select a file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let products = [];

      // Parse file based on type
      if (file.type === 'text/csv') {
        const text = await file.text();
        products = parseCSV(text);
      } else {
        // Excel file
        products = await parseExcelFile(file);
      }

      if (products.length === 0) {
        throw new Error('No valid products found in the file');
      }

      setUploadProgress(50);

      // Prepare the data for the API
      const auctionData = {
        products: products,
        category: formData.category,
        stateDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        desciptions: formData.description,
        auctionType: "TIMED",
        status: "ACTIVE"
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auction/bulkCreate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        }, 
        body: JSON.stringify(auctionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload auctions');
      }

      const result = await response.json();
      setUploadResult(result);
      
      if (result.status) {
        toast.success(`Successfully created ${products.length} auctions`);
        onSuccess();
        onClose();
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload auctions');
      setUploadResult({ error: error.message });
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
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
        'Image URL': 'https://example.com/starry-night.jpg',
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
        'Image URL': 'https://example.com/persistence-memory.jpg',
        'Sort By Price': 'High Price'
      }
    ];

    // Create Excel workbook
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Auction Template");
    
    // Generate Excel file
    XLSX.writeFile(wb, 'gallery_auction_template.xlsx');
  };

  const resetForm = () => {
    setFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    setFormData({
      category: "",
      startDate: "",
      endDate: "",
      description: ""
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Bulk Upload Auctions</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2">Instructions</h3>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Upload an Excel (.xlsx) or CSV file with auction data</li>
              <li>• Each row represents one auction product</li>
              <li>• Required columns: Product Title, Artist, Starting Bid</li>
              <li>• Optional columns: Price, Estimate Price, Description, etc.</li>
              <li>• All auctions will use the same category, start date, and end date</li>
            </ul>
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-white font-medium">Download Template</p>
                <p className="text-sm text-zinc-400">Get the Excel template with sample data</p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
                placeholder="e.g., Paintings, Sculptures"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
                placeholder="General auction description"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white"
                required
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Select Excel or CSV File *
            </label>
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-zinc-600 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-3"
              >
                <Upload className="w-8 h-8 text-zinc-400" />
                <div>
                  <p className="text-white font-medium">
                    {file ? file.name : "Click to select file or drag and drop"}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Excel (.xlsx, .xls) or CSV files
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white">Uploading...</span>
                <span className="text-zinc-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className={`p-4 rounded-lg ${
              uploadResult.error 
                ? 'bg-red-900 border border-red-700' 
                : 'bg-green-900 border border-green-700'
            }`}>
              <div className="flex items-center space-x-3">
                {uploadResult.error ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                <div>
                  <p className={`font-medium ${
                    uploadResult.error ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {uploadResult.error ? 'Upload Failed' : 'Upload Successful'}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {uploadResult.error || uploadResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || !formData.category || !formData.startDate || !formData.endDate || uploading}
              className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Auctions"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 