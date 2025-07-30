'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  Palette,
  User,
  DollarSign,
  Ruler,
  Eye,
  Plus,
  X,
} from 'lucide-react';
import Image from 'next/image';

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

// Helper function to handle image errors
const handleImageError = (e) => {
  e.target.src = '/placeholder.jpeg';
};

export function ArtworkList({ 
  isOpen, 
  onClose, 
  gallery, 
  onEditArtwork, 
  onDeleteArtwork, 
  onAddArtwork 
}) {
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewArtwork = (artwork) => {
    setSelectedArtwork(artwork);
    setIsDetailOpen(true);
  };

  const formatPrice = (price) => {
    if (!price.min && !price.max && !price.contactPrice) return 'Price on request';
    
    let priceText = '';
    if (price.min && price.max) {
      priceText = `${price.currency} ${price.min.toLocaleString()} - ${price.max.toLocaleString()}`;
    } else if (price.contactPrice) {
      priceText = `${price.currency} ${price.contactPrice.toLocaleString()}`;
    } else if (price.min) {
      priceText = `From ${price.currency} ${price.min.toLocaleString()}`;
    } else if (price.max) {
      priceText = `Up to ${price.currency} ${price.max.toLocaleString()}`;
    }
    
    return priceText;
  };

  const formatDimensions = (dimensions) => {
    if (!dimensions.width && !dimensions.height && !dimensions.displayText) {
      return 'Dimensions not specified';
    }
    
    if (dimensions.displayText) {
      return dimensions.displayText;
    }
    
    if (dimensions.width && dimensions.height) {
      return `${dimensions.width} × ${dimensions.height} ${dimensions.unit}`;
    }
    
    return 'Dimensions not specified';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Artworks in {gallery?.title}</span>
              <Button
                onClick={onAddArtwork}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Artwork
              </Button>
            </DialogTitle>
            <DialogDescription>
              Manage artworks in this gallery
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {gallery?.artworks && gallery.artworks.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {gallery.artworks.map((artwork) => (
                  <div key={artwork._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={formatImageUrl(artwork.images?.[0])}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                        onError={handleImageError}
                      />
                      {!artwork.isActive && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Badge variant="secondary" className="bg-gray-800 text-white">
                            Inactive
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 truncate" title={artwork.title}>
                        {artwork.title}
                      </h4>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-1" />
                        <span className="truncate">{artwork.artist?.name}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Palette className="w-4 h-4 mr-1" />
                        <span>{artwork.category} • {artwork.medium}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Ruler className="w-4 h-4 mr-1" />
                        <span className="truncate">{formatDimensions(artwork.dimensions)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-medium">{formatPrice(artwork.price)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex space-x-1">
                          <Badge variant="outline" size="sm" className="text-xs">
                            {artwork.attribution}
                          </Badge>
                          {artwork.condition?.framed && (
                            <Badge variant="outline" size="sm" className="text-xs">
                              Framed
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewArtwork(artwork)}
                            className="h-8 w-8 hover:bg-blue-50 text-blue-600"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditArtwork(gallery, artwork)}
                            className="h-8 w-8 hover:bg-gray-100"
                            title="Edit Artwork"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteArtwork(gallery._id, artwork._id)}
                            className="h-8 w-8 hover:bg-red-50 text-red-600"
                            title="Delete Artwork"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Palette className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No artworks yet</h3>
                <p className="text-gray-500 mb-4">
                  Start building your gallery collection by adding artworks.
                </p>
                <Button onClick={onAddArtwork} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Artwork
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Artwork Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedArtwork?.title}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDetailOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedArtwork && (
            <div className="space-y-6">
              {/* Artwork Image */}
              <div className="relative h-80 rounded-lg overflow-hidden">
                <Image
                  src={formatImageUrl(selectedArtwork.images?.[0])}
                  alt={selectedArtwork.title}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                />
              </div>

              {/* Artwork Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedArtwork.title}
                  </h3>
                  <p className="text-gray-600">{selectedArtwork.artist?.name}</p>
                  {selectedArtwork.artist?.nationality && (
                    <p className="text-sm text-gray-500">
                      {selectedArtwork.artist.nationality}
                      {selectedArtwork.artist.birthYear && `, ${selectedArtwork.artist.birthYear}`}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedArtwork.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Medium:</span>
                        <span className="font-medium">{selectedArtwork.medium}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="font-medium">{formatDimensions(selectedArtwork.dimensions)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Attribution:</span>
                        <span className="font-medium">{selectedArtwork.attribution}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Condition & Price</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Framed:</span>
                        <span className="font-medium">{selectedArtwork.condition?.framed ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Signature:</span>
                        <span className="font-medium">{selectedArtwork.condition?.signature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Certificate:</span>
                        <span className="font-medium">
                          {selectedArtwork.condition?.certificateOfAuthenticity ? 'Included' : 'Not included'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">{formatPrice(selectedArtwork.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedArtwork.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedArtwork.description}
                    </p>
                  </div>
                )}

                {selectedArtwork.additionalInfo && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedArtwork.additionalInfo}
                    </p>
                  </div>
                )}

                {selectedArtwork.technicalSpecs && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Technical Specifications</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedArtwork.technicalSpecs}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 