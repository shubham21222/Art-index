'use client';

import React, { useState, useEffect } from 'react';
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
  Trash2,
  Image as ImageIcon,
  Palette,
  Ruler,
  DollarSign,
  FileText,
  User,
} from 'lucide-react';

// Helper function to format image URLs
const formatImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '/placeholder.jpeg';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  
  if (url.startsWith('/')) {
    return url;
  }
  
  return '/placeholder.jpeg';
};

export function ArtworkForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  artwork = null, 
  isSubmitting = false 
}) {
  const [formData, setFormData] = useState({
    title: '',
    artist: {
      name: '',
      nationality: '',
      birthYear: '',
      bio: '',
    },
    category: '',
    medium: '',
    dimensions: {
      width: '',
      height: '',
      unit: 'in',
      displayText: '',
    },
    publisher: 'N/A',
    attribution: 'Unique',
    condition: {
      framed: false,
      signature: 'Not signed',
      certificateOfAuthenticity: false,
    },
    price: {
      min: '',
      max: '',
      currency: 'USD',
      contactPrice: '',
    },
    description: '',
    additionalInfo: '',
    technicalSpecs: '',
    images: [''],
    isActive: true,
  });

  // Update form data when artwork prop changes
  useEffect(() => {
    if (artwork) {
      setFormData({
        title: artwork.title || '',
        artist: {
          name: artwork.artist?.name || '',
          nationality: artwork.artist?.nationality || '',
          birthYear: artwork.artist?.birthYear || '',
          bio: artwork.artist?.bio || '',
        },
        category: artwork.category || '',
        medium: artwork.medium || '',
        dimensions: {
          width: artwork.dimensions?.width || '',
          height: artwork.dimensions?.height || '',
          unit: artwork.dimensions?.unit || 'in',
          displayText: artwork.dimensions?.displayText || '',
        },
        publisher: artwork.publisher || 'N/A',
        attribution: artwork.attribution || 'Unique',
        condition: {
          framed: artwork.condition?.framed || false,
          signature: artwork.condition?.signature || 'Not signed',
          certificateOfAuthenticity: artwork.condition?.certificateOfAuthenticity || false,
        },
        price: {
          min: artwork.price?.min || '',
          max: artwork.price?.max || '',
          currency: artwork.price?.currency || 'USD',
          contactPrice: artwork.price?.contactPrice || '',
        },
        description: artwork.description || '',
        additionalInfo: artwork.additionalInfo || '',
        technicalSpecs: artwork.technicalSpecs || '',
        images: artwork.images && artwork.images.length > 0 ? artwork.images : [''],
        isActive: artwork.isActive !== undefined ? artwork.isActive : true,
      });
    } else {
      // Reset form when adding new artwork
      setFormData({
        title: '',
        artist: {
          name: '',
          nationality: '',
          birthYear: '',
          bio: '',
        },
        category: '',
        medium: '',
        dimensions: {
          width: '',
          height: '',
          unit: 'in',
          displayText: '',
        },
        publisher: 'N/A',
        attribution: 'Unique',
        condition: {
          framed: false,
          signature: 'Not signed',
          certificateOfAuthenticity: false,
        },
        price: {
          min: '',
          max: '',
          currency: 'USD',
          contactPrice: '',
        },
        description: '',
        additionalInfo: '',
        technicalSpecs: '',
        images: [''],
        isActive: true,
      });
    }
  }, [artwork]);

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    const formattedUrl = value.trim() ? formatImageUrl(value) : value;
    newImages[index] = formattedUrl;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleAddImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const handleRemoveImageField = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.artist.name || !formData.category || !formData.medium) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Clean up empty image fields
    const cleanedImages = formData.images.filter(img => img.trim() !== '');
    
    const submitData = {
      ...formData,
      images: cleanedImages,
    };

    onSubmit(submitData);
  };

  const categories = [
    'Photography', 'Painting', 'Sculpture', 'Print', 'Drawing', 
    'Mixed Media', 'Installation', 'Video', 'Digital Art', 'Textile'
  ];

  const mediums = [
    'Oil on canvas', 'Acrylic on canvas', 'Watercolor on paper',
    'Archival pigment print', 'Silver gelatin print', 'Bronze',
    'Marble', 'Mixed media', 'Digital print', 'Ink on paper'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {artwork ? 'Edit Artwork' : 'Add New Artwork'}
          </DialogTitle>
          <DialogDescription>
            {artwork ? 'Update artwork information' : 'Add a new artwork to the gallery'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter artwork title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Medium *</label>
              <select
                value={formData.medium}
                onChange={(e) => setFormData(prev => ({ ...prev, medium: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Medium</option>
                {mediums.map(med => (
                  <option key={med} value={med}>{med}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Artist Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <User className="w-5 h-5 mr-2" />
              Artist Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Artist Name *</label>
                <Input
                  value={formData.artist.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    artist: { ...prev.artist, name: e.target.value }
                  }))}
                  placeholder="Enter artist name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nationality</label>
                <Input
                  value={formData.artist.nationality}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    artist: { ...prev.artist, nationality: e.target.value }
                  }))}
                  placeholder="e.g., American"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Birth Year</label>
                <Input
                  value={formData.artist.birthYear}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    artist: { ...prev.artist, birthYear: e.target.value }
                  }))}
                  placeholder="e.g., b. 1970"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Artist Bio</label>
              <Textarea
                value={formData.artist.bio}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  artist: { ...prev.artist, bio: e.target.value }
                }))}
                placeholder="Enter artist biography"
                rows={3}
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Ruler className="w-5 h-5 mr-2" />
              Dimensions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Width</label>
                <Input
                  type="number"
                  value={formData.dimensions.width}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) || '' }
                  }))}
                  placeholder="Width"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Height</label>
                <Input
                  type="number"
                  value={formData.dimensions.height}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || '' }
                  }))}
                  placeholder="Height"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <select
                  value={formData.dimensions.unit}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dimensions: { ...prev.dimensions, unit: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="in">inches</option>
                  <option value="cm">centimeters</option>
                  <option value="ft">feet</option>
                  <option value="m">meters</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Display Text</label>
                <Input
                  value={formData.dimensions.displayText}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dimensions: { ...prev.dimensions, displayText: e.target.value }
                  }))}
                  placeholder="e.g., 30 × 8 in"
                />
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Price Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Price</label>
                <Input
                  type="number"
                  value={formData.price.min}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price: { ...prev.price, min: parseFloat(e.target.value) || '' }
                  }))}
                  placeholder="Min price"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Price</label>
                <Input
                  type="number"
                  value={formData.price.max}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price: { ...prev.price, max: parseFloat(e.target.value) || '' }
                  }))}
                  placeholder="Max price"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Price</label>
                <Input
                  type="number"
                  value={formData.price.contactPrice}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price: { ...prev.price, contactPrice: parseFloat(e.target.value) || '' }
                  }))}
                  placeholder="Contact price"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <select
                  value={formData.price.currency}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price: { ...prev.price, currency: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>
          </div>

          {/* Condition & Authentication */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Condition & Authentication
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="framed"
                  checked={formData.condition.framed}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    condition: { ...prev.condition, framed: e.target.checked }
                  }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="framed" className="text-sm font-medium">Framed</label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Signature</label>
                <select
                  value={formData.condition.signature}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    condition: { ...prev.condition, signature: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Not signed">Not signed</option>
                  <option value="Signed">Signed</option>
                  <option value="Signed and dated">Signed and dated</option>
                  <option value="Signed by artist">Signed by artist</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="certificate"
                  checked={formData.condition.certificateOfAuthenticity}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    condition: { ...prev.condition, certificateOfAuthenticity: e.target.checked }
                  }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="certificate" className="text-sm font-medium">Certificate of Authenticity</label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Publisher</label>
                <Input
                  value={formData.publisher}
                  onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                  placeholder="Publisher"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Attribution</label>
                <select
                  value={formData.attribution}
                  onChange={(e) => setFormData(prev => ({ ...prev, attribution: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Unique">Unique</option>
                  <option value="Limited Edition">Limited Edition</option>
                  <option value="Open Edition">Open Edition</option>
                  <option value="Artist Proof">Artist Proof</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              Images
            </h3>
            
            {formData.images.map((image, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  required={index === 0}
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

          {/* Descriptions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Descriptions
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter artwork description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Information</label>
                <Textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Enter additional information about the artwork"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Technical Specifications</label>
                <Textarea
                  value={formData.technicalSpecs}
                  onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: e.target.value }))}
                  placeholder="Enter technical specifications"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Active Artwork
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : artwork ? 'Update Artwork' : 'Add Artwork'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 