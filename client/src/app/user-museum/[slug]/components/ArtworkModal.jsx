'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Palette, User, MapPin, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import ContactModal from '@/app/components/ContactModal';

export default function ArtworkModal({ isOpen, onClose, artwork, museumName }) {
  const [showContactModal, setShowContactModal] = useState(false);

  if (!artwork) return null;

  const handleImageError = (e) => {
    e.target.src = "/placeholder.jpeg";
    e.target.onerror = null;
  };

  const isValidImageUrl = (url) => {
    if (!url) return false;
    if (url === "/placeholder.jpeg") return true;
    if (url.startsWith('data:')) return true;
    if (url.startsWith('blob:')) return true;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return !url.includes('example.com') && !url.includes('placeholder');
    }
    return url.startsWith('/');
  };

  const getImageSrc = (url, fallback = "/placeholder.jpeg") => {
    return isValidImageUrl(url) ? url : fallback;
  };

  const handleContactClick = () => {
    setShowContactModal(true);
  };

  const handleContactClose = () => {
    setShowContactModal(false);
  };

  const handleContactSubmit = async (formData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          itemName: artwork.name || 'Artwork Inquiry',
          artwork: {
            title: artwork.name,
            id: artwork._id,
            artistNames: artwork.artist,
            museum: museumName,
          },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send inquiry');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {artwork.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Artwork Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              {artwork.images && artwork.images.length > 0 ? (
                <Image
                  src={getImageSrc(artwork.images[0])}
                  alt={artwork.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-xl"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <span className="text-6xl">🎨</span>
                </div>
              )}
            </div>

            {/* Artwork Details */}
            <div className="space-y-6">
              {/* Title and Artist */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {artwork.name}
                </h2>
                {artwork.artist && (
                  <div className="flex items-center gap-2 text-lg text-gray-600">
                    <User className="w-5 h-5" />
                    <span>{artwork.artist}</span>
                  </div>
                )}
              </div>

              {/* Artwork Info */}
              <div className="space-y-4">
                {artwork.year && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{artwork.year}</span>
                  </div>
                )}
                
                {artwork.medium && (
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{artwork.medium}</span>
                  </div>
                )}

                {artwork.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {artwork.description}
                    </p>
                  </div>
                )}

                {/* Museum Info */}
                {museumName && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{museumName}</span>
                  </div>
                )}

                {/* Categories/Tags */}
                {artwork.categories && artwork.categories.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {artwork.categories.map((category, index) => (
                        <Badge key={index} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={handleContactClick}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Inquire About Price
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={handleContactClose}
        artwork={{
          title: artwork.name,
          id: artwork._id,
          artistNames: artwork.artist,
        }}
        onSubmit={handleContactSubmit}
      />
    </>
  );
} 