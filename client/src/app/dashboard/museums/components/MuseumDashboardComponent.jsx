'use client';

import React from 'react';
import { useState, useEffect } from 'react';
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
  Grid,
  List,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building2,
  Eye,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import { MuseumDetailView } from './MuseumDetailView';

export function MuseumDashboardComponent() {
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMuseum, setSelectedMuseum] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuseumId, setSelectedMuseumId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    profileImage: '',
    contact: {
      email: '',
      phone: '',
      address: '',
      website: '',
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchMuseums();
  }, []);

  const fetchMuseums = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/museum/all`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch museums');
      }

      const data = await res.json();
      if (data.status && data.items) {
        setMuseums(data.items);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch museums');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = selectedMuseum
        ? `${process.env.NEXT_PUBLIC_API_URL}/museum/update/${selectedMuseum._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/museum/create`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to save museum');
      }

      toast.success(selectedMuseum ? 'Museum updated successfully' : 'Museum created successfully');
      setIsModalOpen(false);
      setSelectedMuseum(null);
      setFormData({
        name: '',
        description: '',
        profileImage: '',
        contact: {
          email: '',
          phone: '',
          address: '',
          website: '',
        }
      });
      fetchMuseums();
    } catch (error) {
      toast.error(error.message || 'Failed to save museum');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (museumId) => {
    if (!confirm('Are you sure you want to delete this museum?')) return;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/museum/delete/${museumId}`, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete museum');
      }

      toast.success('Museum deleted successfully');
      fetchMuseums();
    } catch (error) {
      toast.error(error.message || 'Failed to delete museum');
    }
  };

  const handleEdit = (museum) => {
    setSelectedMuseum(museum);
    setFormData({
      name: museum.name,
      description: museum.description,
      profileImage: museum.profileImage,
      contact: museum.contact || {
        email: '',
        phone: '',
        address: '',
        website: '',
      }
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = (museumId) => {
    setSelectedMuseumId(museumId);
  };

  const handleBackToList = () => {
    setSelectedMuseumId(null);
  };

  const filteredMuseums = museums.filter(museum =>
    museum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    museum.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: museums.length,
    totalEvents: museums.reduce((sum, museum) => sum + museum.events.length, 0),
    totalArtworks: museums.reduce((sum, museum) => sum + museum.artworks.length, 0),
    activeEvents: museums.reduce((sum, museum) => sum + museum.events.filter(e => e.isActive).length, 0),
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  // Show detailed view if a museum is selected
  if (selectedMuseumId) {
    return <MuseumDetailView museumId={selectedMuseumId} onBack={handleBackToList} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Museum Management</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your museum collections, events, and connect with art enthusiasts worldwide.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Museums</h3>
            <Building2 className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Events</h3>
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Artworks</h3>
            <Eye className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalArtworks}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Events</h3>
            <Calendar className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeEvents}</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 w-full gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search museums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="bg-gray-50"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={() => {
              setSelectedMuseum(null);
              setFormData({
                name: '',
                description: '',
                profileImage: '',
                contact: {
                  email: '',
                  phone: '',
                  address: '',
                  website: '',
                }
              });
              setIsModalOpen(true);
            }}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Museum
          </Button>
        </div>
      </div>

      {/* Museum Content */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMuseums.map((museum) => (
            <div key={museum._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group hover:shadow-md transition-shadow">
              <div className="relative h-64">
                <Image
                  src={museum.profileImage || '/placeholder.jpg'}
                  alt={museum.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 truncate">
                    {museum.name}
                  </h3>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(museum._id)}
                      className="hover:bg-blue-50 text-blue-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(museum)}
                      className="hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(museum._id)}
                      className="hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600 line-clamp-2 mb-4">
                  {museum.description}
                </p>
                <div className="space-y-2 mb-4">
                  {museum.contact?.email && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-2" />
                      {museum.contact.email}
                    </div>
                  )}
                  {museum.contact?.phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-2" />
                      {museum.contact.phone}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="bg-blue-50">
                      {museum.events.length} Events
                    </Badge>
                    <Badge variant="outline" className="bg-green-50">
                      {museum.artworks.length} Artworks
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredMuseums.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No museums found</h3>
              <p className="mt-2 text-gray-500">
                {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new museum'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Museum</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Events</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Artworks</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMuseums.map((museum) => (
                  <tr key={museum._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden mr-3">
                          <Image
                            src={museum.profileImage || '/placeholder.jpg'}
                            alt={museum.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium text-gray-900">{museum.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 max-w-xs truncate">{museum.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {museum.contact?.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            {museum.contact.email}
                          </div>
                        )}
                        {museum.contact?.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-3 w-3 mr-1" />
                            {museum.contact.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-blue-50">
                        {museum.events.length} Events
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-green-50">
                        {museum.artworks.length} Artworks
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(museum._id)}
                          className="hover:bg-blue-50 text-blue-600"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(museum)}
                          className="hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(museum._id)}
                          className="hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMuseums.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No museums found</h3>
                      <p className="mt-2 text-gray-500">
                        {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new museum'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog for Add/Edit Museum */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMuseum ? 'Edit Museum' : 'Add New Museum'}
            </DialogTitle>
            <DialogDescription>
              {selectedMuseum ? 'Update museum information' : 'Create a new museum'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter museum name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter museum description"
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Image URL</label>
              <Input
                value={formData.profileImage}
                onChange={(e) => setFormData(prev => ({ ...prev, profileImage: e.target.value }))}
                placeholder="Enter profile image URL"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Contact Information</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={formData.contact.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                  placeholder="Enter email"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.contact.phone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contact: { ...prev.contact, phone: e.target.value }
                  }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Textarea
                  value={formData.contact.address}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contact: { ...prev.contact, address: e.target.value }
                  }))}
                  placeholder="Enter address"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={formData.contact.website}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contact: { ...prev.contact, website: e.target.value }
                  }))}
                  placeholder="Enter website URL"
                  type="url"
                />
              </div>
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
                {isSubmitting ? 'Saving...' : selectedMuseum ? 'Update Museum' : 'Create Museum'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 