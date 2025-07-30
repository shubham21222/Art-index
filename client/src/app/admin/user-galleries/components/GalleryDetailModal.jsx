'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { X, User, Palette, Calendar, Eye, Trash2, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BASE_URL } from '@/config/baseUrl';
import toast from 'react-hot-toast';

export default function GalleryDetailModal({ isOpen, gallery, onClose, onDelete }) {
    const [deleting, setDeleting] = useState(false);
    const auth = useSelector((state) => state.auth);

    const handleDeleteGallery = async () => {
        if (!confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch(`${BASE_URL}/gallery/admin/delete/${gallery._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': auth.token
                }
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Gallery deleted successfully');
                onDelete();
                onClose();
            } else {
                toast.error(data.message || 'Failed to delete gallery');
            }
        } catch (error) {
            console.error('Error deleting gallery:', error);
            toast.error('Failed to delete gallery');
        } finally {
            setDeleting(false);
        }
    };

    const getRoleBadge = (role) => {
        const roleColors = {
            'USER': 'bg-gray-100 text-gray-800',
            'ADMIN': 'bg-red-100 text-red-800',
            'GALLERY': 'bg-blue-100 text-blue-800',
            'ARTIST': 'bg-green-100 text-green-800'
        };
        return roleColors[role] || 'bg-gray-100 text-gray-800';
    };

    const formatPrice = (price) => {
        if (!price) return 'N/A';
        return `$${(price / 100).toLocaleString()}`;
    };

    if (!isOpen || !gallery) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Gallery Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Gallery Info */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {gallery.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="secondary">{gallery.categoryDisplay}</Badge>
                                        {gallery.isFeatured && (
                                            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                                                Featured
                                            </Badge>
                                        )}
                                        <Badge variant={gallery.active ? "default" : "secondary"}>
                                            {gallery.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600">{gallery.description}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleDeleteGallery}
                                    disabled={deleting}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {deleting ? 'Deleting...' : 'Delete Gallery'}
                                </Button>
                            </div>

                            {/* User Info */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Created by
                                </h4>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-medium">{gallery.createdByUser?.name || 'Unknown'}</p>
                                        <p className="text-sm text-gray-500">{gallery.createdByUser?.email}</p>
                                    </div>
                                    <Badge className={getRoleBadge(gallery.createdByUser?.role)}>
                                        {gallery.createdByUser?.role}
                                    </Badge>
                                </div>
                            </div>

                            {/* Gallery Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <Palette className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                                    <p className="text-2xl font-bold text-blue-600">{gallery.totalArtworks}</p>
                                    <p className="text-sm text-gray-600">Total Artworks</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <Eye className="w-6 h-6 mx-auto text-green-500 mb-2" />
                                    <p className="text-2xl font-bold text-green-600">{gallery.activeArtworks}</p>
                                    <p className="text-sm text-gray-600">Active Artworks</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <Calendar className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                                    <p className="text-sm font-medium text-purple-600">
                                        {new Date(gallery.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Created</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                    <Calendar className="w-6 h-6 mx-auto text-orange-500 mb-2" />
                                    <p className="text-sm font-medium text-orange-600">
                                        {new Date(gallery.updatedAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Updated</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Artworks */}
                    {gallery.artworks && gallery.artworks.length > 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Palette className="w-5 h-5" />
                                    Artworks ({gallery.artworks.length})
                                </h4>
                                <div className="space-y-4">
                                    {gallery.artworks.map((artwork, index) => (
                                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900 mb-2">
                                                        {artwork.title}
                                                    </h5>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Artist:</span>
                                                            <p className="font-medium">{artwork.artist?.name}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Category:</span>
                                                            <p className="font-medium">{artwork.category}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Medium:</span>
                                                            <p className="font-medium">{artwork.medium}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Price:</span>
                                                            <p className="font-medium">
                                                                {artwork.price?.min && artwork.price?.max 
                                                                    ? `${formatPrice(artwork.price.min)} - ${formatPrice(artwork.price.max)}`
                                                                    : artwork.price?.contactPrice 
                                                                    ? `Contact: ${formatPrice(artwork.price.contactPrice)}`
                                                                    : 'N/A'
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {artwork.description && (
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            {artwork.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant={artwork.isActive ? "default" : "secondary"}>
                                                            {artwork.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                        {artwork.condition?.framed && (
                                                            <Badge variant="outline">Framed</Badge>
                                                        )}
                                                        {artwork.condition?.certificateOfAuthenticity && (
                                                            <Badge variant="outline">COA</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Images */}
                    {gallery.images && gallery.images.length > 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Gallery Images</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {gallery.images.map((image, index) => (
                                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                            <img
                                                src={image}
                                                alt={`Gallery image ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder.jpeg';
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 p-6 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
} 