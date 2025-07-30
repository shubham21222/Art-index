'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {    
    Search, 
    Trash2, 
    User,
    GalleryVertical,
    Palette,
    Eye,
    Calendar,
    Mail,
    Shield
} from "lucide-react";
import { BASE_URL } from '@/config/baseUrl';
import toast from 'react-hot-toast';
import GalleryDetailModal from './components/GalleryDetailModal';

export default function UserGalleriesAdmin() {
    const [galleries, setGalleries] = useState([]);
    const [usersWithGalleries, setUsersWithGalleries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [view, setView] = useState('users'); // 'users' or 'galleries'
    const [deleting, setDeleting] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const auth = useSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!auth.token) {
            router.push('/admin/login');
            return;
        }
        fetchData();
    }, [auth.token, view]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (view === 'users') {
                await fetchUsersWithGalleries();
            } else {
                await fetchAllGalleries();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersWithGalleries = async () => {
        const response = await fetch(`${BASE_URL}/gallery/admin/users-with-galleries`, {
            headers: {
                'Authorization': auth.token
            }
        });

        const data = await response.json();
        if (data.status) {
            setUsersWithGalleries(data.items);
        } else {
            toast.error(data.message || 'Failed to fetch users');
        }
    };

    const fetchAllGalleries = async () => {
        const response = await fetch(`${BASE_URL}/gallery/admin/all-with-users`, {
            headers: {
                'Authorization': auth.token
            }
        });

        const data = await response.json();
        if (data.status) {
            setGalleries(data.items);
        } else {
            toast.error(data.message || 'Failed to fetch galleries');
        }
    };

    const fetchUserGalleries = async (userId) => {
        try {
            const response = await fetch(`${BASE_URL}/gallery/admin/user/${userId}/galleries`, {
                headers: {
                    'Authorization': auth.token
                }
            });

            const data = await response.json();
            if (data.status) {
                setGalleries(data.items);
                setView('galleries');
            } else {
                toast.error(data.message || 'Failed to fetch user galleries');
            }
        } catch (error) {
            console.error('Error fetching user galleries:', error);
            toast.error('Failed to fetch user galleries');
        }
    };

    const handleDeleteGallery = async (galleryId) => {
        if (!confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch(`${BASE_URL}/gallery/admin/delete/${galleryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': auth.token
                }
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Gallery deleted successfully');
                fetchData(); // Refresh the data
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

    const handleViewGalleryDetails = (gallery) => {
        setSelectedGallery(gallery);
        setShowDetailModal(true);
    };

    const handleGalleryDeleted = () => {
        fetchData(); // Refresh the data after deletion
    };

    const filteredUsers = usersWithGalleries.filter(user => 
        user.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredGalleries = galleries.filter(gallery => 
        gallery.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gallery.createdByUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gallery.createdByUser?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadge = (role) => {
        const roleColors = {
            'USER': 'bg-gray-100 text-gray-800',
            'ADMIN': 'bg-red-100 text-red-800',
            'GALLERY': 'bg-blue-100 text-blue-800',
            'ARTIST': 'bg-green-100 text-green-800'
        };
        return roleColors[role] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">User Galleries Management</h1>
                </div>
                <div className="grid gap-6">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-48" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">User Galleries Management</h1>
                <div className="flex gap-2">
                    <Button
                        variant={view === 'users' ? 'default' : 'outline'}
                        onClick={() => setView('users')}
                    >
                        <User className="w-4 h-4 mr-2" />
                        Users
                    </Button>
                    <Button
                        variant={view === 'galleries' ? 'default' : 'outline'}
                        onClick={() => setView('galleries')}
                    >
                        <GalleryVertical className="w-4 h-4 mr-2" />
                        All Galleries
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder={view === 'users' ? "Search users..." : "Search galleries..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Users View */}
            {view === 'users' && (
                <div className="space-y-6">
                    {filteredUsers.map((userData) => (
                        <Card key={userData.user._id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {userData.user.name || 'No Name'}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-600">{userData.user.email}</span>
                                                </div>
                                            </div>
                                            <Badge className={getRoleBadge(userData.user.role)}>
                                                {userData.user.role}
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <GalleryVertical className="w-4 h-4 text-blue-500" />
                                                <span className="text-gray-500">Galleries:</span>
                                                <span className="font-medium">{userData.totalGalleries}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Palette className="w-4 h-4 text-green-500" />
                                                <span className="text-gray-500">Artworks:</span>
                                                <span className="font-medium">{userData.totalArtworks}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-purple-500" />
                                                <span className="text-gray-500">Member since:</span>
                                                <span className="font-medium">
                                                    {userData.user.createdAt 
                                                        ? new Date(userData.user.createdAt).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedUser(userData.user);
                                                fetchUserGalleries(userData.user._id);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Galleries
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Galleries View */}
            {view === 'galleries' && (
                <div className="space-y-6">
                    {selectedUser && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-medium text-blue-900">
                                Viewing galleries for: {selectedUser.name} ({selectedUser.email})
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSelectedUser(null);
                                    fetchAllGalleries();
                                }}
                                className="mt-2"
                            >
                                View All Galleries
                            </Button>
                        </div>
                    )}
                    
                    {filteredGalleries.map((gallery) => (
                        <Card key={gallery._id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {gallery.title}
                                            </h3>
                                            <Badge variant="secondary">{gallery.categoryDisplay}</Badge>
                                            {gallery.isFeatured && (
                                                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <p className="text-gray-600 mb-3">{gallery.description}</p>
                                        
                                        {/* User Info */}
                                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700">Created by:</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="text-sm font-medium">{gallery.createdByUser?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{gallery.createdByUser?.email}</p>
                                                </div>
                                                <Badge className={getRoleBadge(gallery.createdByUser?.role)}>
                                                    {gallery.createdByUser?.role}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Total Artworks:</span>
                                                <p className="font-medium">{gallery.totalArtworks}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Active Artworks:</span>
                                                <p className="font-medium">{gallery.activeArtworks}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Status:</span>
                                                <p className="font-medium">
                                                    <Badge variant={gallery.active ? "default" : "secondary"}>
                                                        {gallery.active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Created:</span>
                                                <p className="font-medium">
                                                    {new Date(gallery.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleViewGalleryDetails(gallery)}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteGallery(gallery._id)}
                                            disabled={deleting}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {((view === 'users' && filteredUsers.length === 0) || 
              (view === 'galleries' && filteredGalleries.length === 0)) && (
                <div className="text-center py-12">
                    <GalleryVertical className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {view === 'users' ? 'No users found' : 'No galleries found'}
                    </h3>
                    <p className="text-gray-500">
                        {view === 'users' 
                            ? 'No users have created galleries yet.' 
                            : 'No galleries match your search criteria.'}
                    </p>
                </div>
            )}

            {/* Gallery Detail Modal */}
            {showDetailModal && selectedGallery && (
                <GalleryDetailModal
                    isOpen={showDetailModal}
                    gallery={selectedGallery}
                    onClose={() => setShowDetailModal(false)}
                    onDelete={handleGalleryDeleted}
                />
            )}
        </div>
    );
} 