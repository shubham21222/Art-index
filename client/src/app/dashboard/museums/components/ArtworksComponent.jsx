'use client';

import React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
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
  Pencil,
  Trash2,
  Image as ImageIcon,
  Search,
  Eye,
  User,
  Calendar,
} from 'lucide-react';
import Image from 'next/image';

export function ArtworksComponent({ museum, onUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    images: [''],
    description: '',
    artist: '',
    year: '',
    medium: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = selectedArtwork
        ? `${process.env.NEXT_PUBLIC_API_URL}/museum/${museum._id}/artworks/${selectedArtwork._id}/update`
        : `${process.env.NEXT_PUBLIC_API_URL}/museum/${museum._id}/artworks/add`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to save artwork');
      }

      toast.success(selectedArtwork ? 'Artwork updated successfully' : 'Artwork added successfully');
      setIsModalOpen(false);
      setSelectedArtwork(null);
      setFormData({
        name: '',
        images: [''],
        description: '',
        artist: '',
        year: '',
        medium: ''
      });
      onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to save artwork');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (artworkId) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/museum/${museum._id}/artworks/${artworkId}/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete artwork');
      }

      toast.success('Artwork deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to delete artwork');
    }
  };

  const handleEdit = (artwork) => {
    setSelectedArtwork(artwork);
    setFormData({
      name: artwork.name,
      images: artwork.images.length ? artwork.images : [''],
      description: artwork.description,
      artist: artwork.artist,
      year: artwork.year,
      medium: artwork.medium
    });
    setIsModalOpen(true);
  };

  const handleAddImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleRemoveImageField = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const filteredArtworks = museum.artworks.filter(artwork =>
    artwork.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artwork.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artwork.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Artworks</h3>
        <Button
          onClick={() => {
            setSelectedArtwork(null);
            setFormData({
              name: '',
              images: [''],
              description: '',
              artist: '',
              year: '',
              medium: ''
            });
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Artwork
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search artworks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200"
        />
      </div>

      <div className="grid gap-4">
        {filteredArtworks.map((artwork) => (
          <div key={artwork._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div className="flex space-x-4">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                  <Image
                    src={artwork.images[0] || '/placeholder.jpg'}
                    alt={artwork.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{artwork.name}</h4>
                  <p className="text-gray-600 text-sm mt-1">{artwork.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    {artwork.artist && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {artwork.artist}
                      </div>
                    )}
                    {artwork.year && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {artwork.year}
                      </div>
                    )}
                    {artwork.medium && (
                      <Badge variant="outline" className="text-xs">
                        {artwork.medium}
                      </Badge>
                    )}
                  </div>
                  {artwork.images.length > 1 && (
                    <div className="flex -space-x-2 mt-2">
                      {artwork.images.slice(1, 4).map((image, index) => (
                        <div key={index} className="relative w-8 h-8 rounded-full border-2 border-white">
                          <Image
                            src={image}
                            alt={`Artwork image ${index + 2}`}
                            fill
                            className="object-cover rounded-full"
                          />
                        </div>
                      ))}
                      {artwork.images.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs">
                          +{artwork.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(artwork)}
                  className="hover:bg-gray-100"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(artwork._id)}
                  className="hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filteredArtworks.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-100">
            <Eye className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No artworks found</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding a new artwork'}
            </p>
          </div>
        )}
      </div>

      {/* Dialog for Add/Edit Artwork */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedArtwork ? 'Edit Artwork' : 'Add New Artwork'}
            </DialogTitle>
            <DialogDescription>
              {selectedArtwork ? 'Update artwork information' : 'Add a new artwork'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Artwork Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter artwork name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Artist</label>
              <Input
                value={formData.artist}
                onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                placeholder="Enter artist name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Input
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="Enter year"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Medium</label>
                <Input
                  value={formData.medium}
                  onChange={(e) => setFormData(prev => ({ ...prev, medium: e.target.value }))}
                  placeholder="Enter medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter artwork description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Images</label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="Enter image URL"
                    required
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

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : selectedArtwork ? 'Update Artwork' : 'Add Artwork'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 