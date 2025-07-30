'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { X, User, Palette, Calendar, Eye, Trash2, MapPin, Phone, Globe, Building2, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BASE_URL } from '@/config/baseUrl';
import toast from 'react-hot-toast';

export default function MuseumDetailModal({ isOpen, museum, onClose, onDelete }) {
    const [deleting, setDeleting] = useState(false);
    const auth = useSelector((state) => state.auth);

    const handleDeleteMuseum = async () => {
        if (!confirm('Are you sure you want to delete this museum? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch(`${BASE_URL}/museum/admin/delete/${museum._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': auth.token
                }
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Museum deleted successfully');
                onDelete();
                onClose();
            } else {
                toast.error(data.message || 'Failed to delete museum');
            }
        } catch (error) {
            console.error('Error deleting museum:', error);
            toast.error('Failed to delete museum');
        } finally {
            setDeleting(false);
        }
    };

    const getRoleBadge = (role) => {
        const roleColors = {
            'USER': 'bg-gray-100 text-gray-800',
            'ADMIN': 'bg-red-100 text-red-800',
            'GALLERY': 'bg-blue-100 text-blue-800',
            'MUSEUM': 'bg-purple-100 text-purple-800',
            'ARTIST': 'bg-green-100 text-green-800'
        };
        return roleColors[role] || 'bg-gray-100 text-gray-800';
    };

    if (!isOpen || !museum) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Museum Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Museum Info */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {museum.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant={museum.isActive ? "default" : "secondary"}>
                                            {museum.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600">{museum.description}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleDeleteMuseum}
                                    disabled={deleting}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {deleting ? 'Deleting...' : 'Delete Museum'}
                                </Button>
                            </div>

                            {/* Contact Info */}
                            {museum.contact && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {museum.contact.email && (
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Email</p>
                                                    <p className="text-sm text-gray-600">{museum.contact.email}</p>
                                                </div>
                                            </div>
                                        )}
                                        {museum.contact.phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Phone</p>
                                                    <p className="text-sm text-gray-600">{museum.contact.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {museum.contact.website && (
                                            <div className="flex items-center gap-3">
                                                <Globe className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Website</p>
                                                    <p className="text-sm text-gray-600">{museum.contact.website}</p>
                                                </div>
                                            </div>
                                        )}
                                        {museum.contact.address && (
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Address</p>
                                                    <p className="text-sm text-gray-600">{museum.contact.address}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* User Info */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Created by
                                </h4>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-medium">{museum.createdByUser?.name || 'Unknown'}</p>
                                        <p className="text-sm text-gray-500">{museum.createdByUser?.email}</p>
                                    </div>
                                    <Badge className={getRoleBadge(museum.createdByUser?.role)}>
                                        {museum.createdByUser?.role}
                                    </Badge>
                                </div>
                            </div>

                            {/* Museum Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <Calendar className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                                    <p className="text-2xl font-bold text-blue-600">{museum.totalEvents}</p>
                                    <p className="text-sm text-gray-600">Total Events</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <Eye className="w-6 h-6 mx-auto text-green-500 mb-2" />
                                    <p className="text-2xl font-bold text-green-600">{museum.activeEvents}</p>
                                    <p className="text-sm text-gray-600">Active Events</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <Palette className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                                    <p className="text-2xl font-bold text-purple-600">{museum.totalArtworks}</p>
                                    <p className="text-sm text-gray-600">Total Artworks</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                    <Calendar className="w-6 h-6 mx-auto text-orange-500 mb-2" />
                                    <p className="text-sm font-medium text-orange-600">
                                        {new Date(museum.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Created</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Events */}
                    {museum.events && museum.events.length > 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Events ({museum.events.length})
                                </h4>
                                <div className="space-y-4">
                                    {museum.events.map((event, index) => (
                                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900 mb-2">
                                                        {event.name}
                                                    </h5>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Start Date:</span>
                                                            <p className="font-medium">
                                                                {new Date(event.startDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        {event.endDate && (
                                                            <div>
                                                                <span className="text-gray-500">End Date:</span>
                                                                <p className="font-medium">
                                                                    {new Date(event.endDate).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="text-gray-500">Location:</span>
                                                            <p className="font-medium">{event.location || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Status:</span>
                                                            <p className="font-medium">
                                                                <Badge variant={event.isActive ? "default" : "secondary"}>
                                                                    {event.isActive ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {event.description && (
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Artworks */}
                    {museum.artworks && museum.artworks.length > 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Palette className="w-5 h-5" />
                                    Artworks ({museum.artworks.length})
                                </h4>
                                <div className="space-y-4">
                                    {museum.artworks.map((artwork, index) => (
                                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900 mb-2">
                                                        {artwork.name}
                                                    </h5>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Artist:</span>
                                                            <p className="font-medium">{artwork.artist || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Year:</span>
                                                            <p className="font-medium">{artwork.year || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Medium:</span>
                                                            <p className="font-medium">{artwork.medium || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Created:</span>
                                                            <p className="font-medium">
                                                                {new Date(artwork.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {artwork.description && (
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            {artwork.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Profile Image */}
                    {museum.profileImage && (
                        <Card>
                            <CardContent className="p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Image</h4>
                                <div className="aspect-video rounded-lg overflow-hidden">
                                    <img
                                        src={museum.profileImage}
                                        alt={museum.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/placeholder.jpeg';
                                        }}
                                    />
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