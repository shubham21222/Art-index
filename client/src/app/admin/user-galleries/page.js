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
    Shield,
    Plus,
    Edit
} from "lucide-react";
import { BASE_URL } from '@/config/baseUrl';
import toast from 'react-hot-toast';
import GalleryDetailModal from './components/GalleryDetailModal';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditGalleryModal, setShowEditGalleryModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [galleryFormData, setGalleryFormData] = useState({
        title: '',
        description: '',
        images: [''],
        category: '',
        categoryName: '',
        artist: '',
        isFeatured: false,
        active: true,
        createdBy: ''
    });
    const [editGalleryFormData, setEditGalleryFormData] = useState({
        title: '',
        description: '',
        images: [''],
        category: '',
        categoryName: '',
        artist: '',
        isFeatured: false,
        active: true,
        createdBy: ''
    });
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [artworks, setArtworks] = useState([]);
    const [showArtworkModal, setShowArtworkModal] = useState(false);
    const [showViewArtworksModal, setShowViewArtworksModal] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [artworkFormData, setArtworkFormData] = useState({
        title: '',
        artist: {
            name: '',
            nationality: '',
            birthYear: '',
            bio: ''
        },
        category: '',
        medium: '',
        dimensions: {
            width: '',
            height: '',
            unit: 'in',
            displayText: ''
        },
        publisher: 'N/A',
        attribution: 'Unique',
        condition: {
            framed: false,
            signature: 'Not signed',
            certificateOfAuthenticity: false
        },
        price: {
            min: '',
            max: '',
            currency: 'USD',
            contactPrice: ''
        },
        description: '',
        additionalInfo: '',
        technicalSpecs: '',
        images: [''],
        isActive: true
    });
    const [isSubmittingArtwork, setIsSubmittingArtwork] = useState(false);

    const auth = useSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!auth.token) {
            router.push('/admin/login');
            return;
        }
        
        // Ensure users is always an array
        if (!Array.isArray(users)) {
            setUsers([]);
        }
        
        fetchData();
        fetchUsers(); // Call fetchUsers here to populate the dropdown
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

    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            console.log('Fetching users...');
            const response = await fetch(`${BASE_URL}/users/all`, {
                headers: {
                    'Authorization': auth.token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Users API response:', data);
            
            // Handle different possible response structures
            let usersArray = [];
            if (data.status && data.items) {
                if (Array.isArray(data.items)) {
                    usersArray = data.items;
                } else if (data.items.items && Array.isArray(data.items.items)) {
                    // Handle nested structure: data.items.items
                    usersArray = data.items.items;
                } else {
                    console.warn('Unexpected items structure:', data.items);
                    usersArray = [];
                }
            } else if (data.status && Array.isArray(data.data)) {
                // Handle alternative structure: data.data
                usersArray = data.data;
            } else {
                console.warn('No valid users data found:', data);
                usersArray = [];
            }
            
            console.log('Setting users to:', usersArray);
            setUsers(usersArray);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setUsersLoading(false);
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

    const handleCreateGallery = async (e) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            // Prepare the data for submission
            const submitData = {
                ...galleryFormData,
                images: galleryFormData.images.filter(img => img.trim() !== ''), // Remove empty image URLs
                createdBy: galleryFormData.createdBy || null, // Convert empty string to null
                artworks: artworks // Include the artworks array
            };

            const response = await fetch(`${BASE_URL}/gallery/admin/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth.token
                },
                body: JSON.stringify(submitData)
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Gallery created successfully');
                setShowCreateModal(false);
                resetGalleryForm();
                setArtworks([]); // Reset artworks
                fetchData(); // Refresh the data
            } else {
                toast.error(data.message || 'Failed to create gallery');
            }
        } catch (error) {
            console.error('Error creating gallery:', error);
            toast.error('Failed to create gallery');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateGalleryArtworks = async (e) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            // Update the gallery with new artworks
            const response = await fetch(`${BASE_URL}/gallery/admin/update-artworks/${selectedGallery._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth.token
                },
                body: JSON.stringify({ artworks })
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Gallery artworks updated successfully');
                setShowCreateModal(false);
                setSelectedGallery(null);
                setArtworks([]); // Reset artworks
                fetchData(); // Refresh the data
            } else {
                toast.error(data.message || 'Failed to update gallery artworks');
            }
        } catch (error) {
            console.error('Error updating gallery artworks:', error);
            toast.error('Failed to update gallery artworks');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateGallery = async (e) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            // Prepare the data for submission
            const submitData = {
                ...editGalleryFormData,
                images: editGalleryFormData.images.filter(img => img.trim() !== ''), // Remove empty image URLs
                createdBy: editGalleryFormData.createdBy || null // Convert empty string to null
            };

            const response = await fetch(`${BASE_URL}/gallery/admin/update/${selectedGallery._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth.token
                },
                body: JSON.stringify(submitData)
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Gallery updated successfully');
                setShowEditGalleryModal(false);
                setSelectedGallery(null);
                setEditGalleryFormData({
                    title: '',
                    description: '',
                    images: [''],
                    category: '',
                    categoryName: '',
                    artist: '',
                    isFeatured: false,
                    active: true,
                    createdBy: ''
                });
                fetchData(); // Refresh the data
            } else {
                toast.error(data.message || 'Failed to update gallery');
            }
        } catch (error) {
            console.error('Error updating gallery:', error);
            toast.error('Failed to update gallery');
        } finally {
            setIsCreating(false);
        }
    };

    const resetGalleryForm = () => {
        setGalleryFormData({
            title: '',
            description: '',
            images: [''],
            category: '',
            categoryName: '',
            artist: '',
            isFeatured: false,
            active: true,
            createdBy: ''
        });
    };

    const resetEditGalleryForm = () => {
        setEditGalleryFormData({
            title: '',
            description: '',
            images: [''],
            category: '',
            categoryName: '',
            artist: '',
            isFeatured: false,
            active: true,
            createdBy: ''
        });
    };

    const resetArtworkForm = () => {
        setArtworkFormData({
            title: '',
            artist: {
                name: '',
                nationality: '',
                birthYear: '',
                bio: ''
            },
            category: '',
            medium: '',
            dimensions: {
                width: '',
                height: '',
                unit: 'in',
                displayText: ''
            },
            publisher: 'N/A',
            attribution: 'Unique',
            condition: {
                framed: false,
                signature: 'Not signed',
                certificateOfAuthenticity: false
            },
            price: {
                min: '',
                max: '',
                currency: 'USD',
                contactPrice: ''
            },
            description: '',
            additionalInfo: '',
            technicalSpecs: '',
            images: [''],
            isActive: true
        });
    };

    // Artwork management functions
    const handleAddArtwork = () => {
        setSelectedArtwork(null);
        resetArtworkForm();
        setShowArtworkModal(true);
    };

    const loadGalleryForArtworkManagement = (gallery) => {
        setSelectedGallery(gallery);
        setArtworks(gallery.artworks || []);
        setShowArtworkModal(true); // Open artwork modal directly
    };

    const loadGalleryForViewingArtworks = (gallery) => {
        setSelectedGallery(gallery);
        setArtworks(gallery.artworks || []);
        setShowViewArtworksModal(true);
        
        // Refresh the gallery data to ensure we have the latest artworks
        fetchData();
    };

    const loadGalleryForEditing = (gallery) => {
        setSelectedGallery(gallery);
        setEditGalleryFormData({
            title: gallery.title || '',
            description: gallery.description || '',
            images: gallery.images && gallery.images.length > 0 ? gallery.images : [''],
            category: gallery.category || '',
            categoryName: gallery.categoryName || '',
            artist: gallery.artist || '',
            isFeatured: gallery.isFeatured || false,
            active: gallery.active !== undefined ? gallery.active : true,
            createdBy: gallery.createdBy || ''
        });
        setShowEditGalleryModal(true);
    };

    const handleEditArtwork = (artwork) => {
        setSelectedArtwork(artwork);
        setArtworkFormData({
            title: artwork.title || '',
            artist: { 
                name: artwork.artist?.name || '', 
                nationality: artwork.artist?.nationality || '',
                birthYear: artwork.artist?.birthYear || '',
                bio: artwork.artist?.bio || ''
            },
            category: artwork.category || '',
            medium: artwork.medium || '',
            dimensions: { 
                width: artwork.dimensions?.width || '', 
                height: artwork.dimensions?.height || '', 
                unit: artwork.dimensions?.unit || 'in',
                displayText: artwork.dimensions?.displayText || ''
            },
            publisher: artwork.publisher || 'N/A',
            attribution: artwork.attribution || 'Unique',
            condition: {
                framed: artwork.condition?.framed || false,
                signature: artwork.condition?.signature || 'Not signed',
                certificateOfAuthenticity: artwork.condition?.certificateOfAuthenticity || false
            },
            price: {
                min: artwork.price?.min || '',
                max: artwork.price?.max || '',
                currency: artwork.price?.currency || 'USD',
                contactPrice: artwork.price?.contactPrice || ''
            },
            description: artwork.description || '',
            additionalInfo: artwork.additionalInfo || '',
            technicalSpecs: artwork.technicalSpecs || '',
            images: artwork.images && artwork.images.length > 0 ? artwork.images : [''],
            isActive: artwork.isActive !== undefined ? artwork.isActive : true
        });
        setShowArtworkModal(true);
    };

    const handleDeleteArtwork = async (artworkId) => {
        if (window.confirm('Are you sure you want to delete this artwork?')) {
            try {
                setIsSubmittingArtwork(true);
                
                // Call the delete artwork API endpoint
                const response = await fetch(`${BASE_URL}/gallery/admin/${selectedGallery._id}/artworks/${artworkId}/delete`, {
                    method: 'POST',
                    headers: {
                        'Authorization': auth.token
                    }
                });

                const data = await response.json();
                if (data.status) {
                    toast.success('Artwork deleted successfully!');
                    fetchData(); // Refresh the data
                } else {
                    toast.error(data.message || 'Failed to delete artwork');
                }
            } catch (error) {
                console.error('Error deleting artwork:', error);
                toast.error('Failed to delete artwork');
            } finally {
                setIsSubmittingArtwork(false);
            }
        }
    };

    const handleArtworkSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!artworkFormData.title || !artworkFormData.artist.name || !artworkFormData.category || !artworkFormData.medium) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Clean up empty image fields
        const cleanedImages = artworkFormData.images.filter(img => img.trim() !== '');
        
        const submitData = {
            ...artworkFormData,
            images: cleanedImages,
        };

        if (selectedArtwork) {
            // Edit existing artwork - use the update endpoint
            try {
                setIsSubmittingArtwork(true);
                
                const response = await fetch(`${BASE_URL}/gallery/admin/${selectedGallery._id}/artworks/${selectedArtwork._id}/update`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': auth.token
                    },
                    body: JSON.stringify(submitData)
                });

                const data = await response.json();
                if (data.status) {
                    toast.success('Artwork updated successfully!');
                    setShowArtworkModal(false);
                    setSelectedArtwork(null);
                    fetchData(); // Refresh the data
                } else {
                    toast.error(data.message || 'Failed to update artwork');
                }
            } catch (error) {
                console.error('Error updating artwork:', error);
                toast.error('Failed to update artwork');
            } finally {
                setIsSubmittingArtwork(false);
            }
        } else {
            // Add new artwork - use the add endpoint
            try {
                setIsSubmittingArtwork(true);
                
                const response = await fetch(`${BASE_URL}/gallery/admin/${selectedGallery._id}/artworks/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': auth.token
                    },
                    body: JSON.stringify(submitData)
                });

                const data = await response.json();
                if (data.status) {
                    toast.success('Artwork added successfully!');
                    setShowArtworkModal(false);
                    setSelectedArtwork(null);
                    fetchData(); // Refresh the data
                } else {
                    toast.error(data.message || 'Failed to add artwork');
                }
            } catch (error) {
                console.error('Error adding artwork:', error);
                toast.error('Failed to add artwork');
            } finally {
                setIsSubmittingArtwork(false);
            }
        }
    };

    const handleArtworkImageChange = (index, value) => {
        const newImages = [...artworkFormData.images];
        newImages[index] = value;
        setArtworkFormData(prev => ({
            ...prev,
            images: newImages
        }));
    };

    const handleAddArtworkImage = () => {
        setArtworkFormData(prev => ({
            ...prev,
            images: [...prev.images, '']
        }));
    };

    const handleRemoveArtworkImage = (index) => {
        setArtworkFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
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
                    <h1 className="text-3xl font-bold text-white">User Galleries Management</h1>
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
                <h1 className="text-3xl font-bold text-white">User Galleries Management</h1>
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
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Gallery
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
                                            onClick={() => loadGalleryForArtworkManagement(gallery)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Artwork
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => loadGalleryForViewingArtworks(gallery)}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Artworks
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => loadGalleryForEditing(gallery)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Gallery
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

            {/* Create Gallery Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedGallery ? `Manage Artworks - ${selectedGallery.title}` : 'Create New Gallery'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedGallery 
                                ? `Add, edit, or remove artworks from the gallery "${selectedGallery.title}"`
                                : 'Create a new gallery. You can assign it to a specific user or create it as an admin gallery.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={selectedGallery ? handleUpdateGalleryArtworks : handleCreateGallery} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={galleryFormData.title}
                                onChange={(e) => setGalleryFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter gallery title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={galleryFormData.description}
                                onChange={(e) => setGalleryFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter gallery description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={galleryFormData.category}
                                    onChange={(e) => setGalleryFormData(prev => ({ ...prev, category: e.target.value }))}
                                    placeholder="Enter category"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="artist">Artist ID</Label>
                                <Input
                                    id="artist"
                                    value={galleryFormData.artist}
                                    onChange={(e) => setGalleryFormData(prev => ({ ...prev, artist: e.target.value }))}
                                    placeholder="Enter artist ID (optional)"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="createdBy">Created By User</Label>
                                <select
                                    id="createdBy"
                                    value={galleryFormData.createdBy}
                                    onChange={(e) => setGalleryFormData(prev => ({ ...prev, createdBy: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={usersLoading}
                                >
                                    <option value="">Admin Gallery (No User)</option>
                                    {usersLoading ? (
                                        <option value="" disabled>Loading users...</option>
                                    ) : Array.isArray(users) && users.length > 0 ? (
                                        users.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name || user.email} ({user.role})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No users available</option>
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="images">Images</Label>
                                <div className="space-y-2">
                                    {galleryFormData.images.map((image, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={image}
                                                onChange={(e) => {
                                                    const newImages = [...galleryFormData.images];
                                                    newImages[index] = e.target.value;
                                                    setGalleryFormData(prev => ({ ...prev, images: newImages }));
                                                }}
                                                placeholder="Enter image URL"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const newImages = galleryFormData.images.filter((_, i) => i !== index);
                                                    setGalleryFormData(prev => ({ ...prev, images: newImages }));
                                                }}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setGalleryFormData(prev => ({ 
                                            ...prev, 
                                            images: [...prev.images, '']
                                        }))}
                                        className="w-full"
                                    >
                                        Add Image URL
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    checked={galleryFormData.isFeatured}
                                    onChange={(e) => setGalleryFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                    className="rounded"
                                />
                                <Label htmlFor="isFeatured">Featured Gallery</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={galleryFormData.active}
                                    onChange={(e) => setGalleryFormData(prev => ({ ...prev, active: e.target.checked }))}
                                    className="rounded"
                                />
                                <Label htmlFor="active">Active</Label>
                            </div>
                        </div>

                        {/* Artworks Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-lg font-semibold">Artworks</Label>
                                <Button
                                    type="button"
                                    onClick={handleAddArtwork}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Artwork
                                </Button>
                            </div>

                            {artworks.length > 0 ? (
                                <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                                    {artworks.map((artwork, index) => (
                                        <div key={artwork._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{artwork.title}</h4>
                                                <p className="text-sm text-gray-600">
                                                    Artist: {artwork.artist?.name} | Category: {artwork.category} | Medium: {artwork.medium}
                                                </p>
                                                {artwork.images && artwork.images.length > 0 && artwork.images[0] && (
                                                    <p className="text-xs text-gray-500">
                                                        Images: {artwork.images.filter(img => img.trim()).length}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditArtwork(artwork)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteArtwork(artwork._id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p>No artworks added yet</p>
                                    <p className="text-sm">Click &quot;Add Artwork&quot; to get started</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    if (selectedGallery) {
                                        setSelectedGallery(null);
                                        setArtworks([]);
                                    } else {
                                        resetGalleryForm();
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreating}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isCreating 
                                    ? (selectedGallery ? 'Updating...' : 'Creating...') 
                                    : (selectedGallery ? 'Update Artworks' : 'Create Gallery')
                                }
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Artwork Modal */}
            <Dialog open={showArtworkModal} onOpenChange={setShowArtworkModal}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedArtwork 
                                ? `Edit Artwork${selectedGallery ? ` - ${selectedGallery.title}` : ''}` 
                                : `Add New Artwork${selectedGallery ? ` to ${selectedGallery.title}` : ''}`
                            }
                        </DialogTitle>
                        <DialogDescription>
                            {selectedArtwork 
                                ? 'Update artwork information' 
                                : `Add a new artwork${selectedGallery ? ` to the gallery` : ''}`
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleArtworkSubmit} className="space-y-4">
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="artworkTitle">Title *</Label>
                                <Input
                                    id="artworkTitle"
                                    value={artworkFormData.title}
                                    onChange={(e) => setArtworkFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter artwork title"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="artworkCategory">Category *</Label>
                                <Input
                                    id="artworkCategory"
                                    value={artworkFormData.category}
                                    onChange={(e) => setArtworkFormData(prev => ({ ...prev, category: e.target.value }))}
                                    placeholder="Enter category"
                                    required
                                />
                            </div>
                        </div>

                        {/* Artist Information */}
                        <div className="space-y-2">
                            <Label className="text-lg font-semibold">Artist Information</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="artistName">Artist Name *</Label>
                                    <Input
                                        id="artistName"
                                        value={artworkFormData.artist.name}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            artist: { ...prev.artist, name: e.target.value }
                                        }))}
                                        placeholder="Enter artist name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="artistNationality">Nationality</Label>
                                    <Input
                                        id="artistNationality"
                                        value={artworkFormData.artist.nationality}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            artist: { ...prev.artist, nationality: e.target.value }
                                        }))}
                                        placeholder="Enter nationality"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="artistBirthYear">Birth Year</Label>
                                    <Input
                                        id="artistBirthYear"
                                        value={artworkFormData.artist.birthYear}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            artist: { ...prev.artist, birthYear: e.target.value }
                                        }))}
                                        placeholder="Enter birth year"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="artistBio">Bio</Label>
                                    <Textarea
                                        id="artistBio"
                                        value={artworkFormData.artist.bio}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            artist: { ...prev.artist, bio: e.target.value }
                                        }))}
                                        placeholder="Enter artist bio"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Artwork Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="artworkMedium">Medium *</Label>
                                <Input
                                    id="artworkMedium"
                                    value={artworkFormData.medium}
                                    onChange={(e) => setArtworkFormData(prev => ({ ...prev, medium: e.target.value }))}
                                    placeholder="Enter medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="artworkPublisher">Publisher</Label>
                                <Input
                                    id="artworkPublisher"
                                    value={artworkFormData.publisher}
                                    onChange={(e) => setArtworkFormData(prev => ({ ...prev, publisher: e.target.value }))}
                                    placeholder="Enter publisher"
                                />
                            </div>
                        </div>

                        {/* Dimensions */}
                        <div className="space-y-2">
                            <Label className="text-lg font-semibold">Dimensions</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="artworkWidth">Width</Label>
                                    <Input
                                        id="artworkWidth"
                                        type="number"
                                        value={artworkFormData.dimensions.width}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            dimensions: { ...prev.dimensions, width: e.target.value }
                                        }))}
                                        placeholder="Width"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="artworkHeight">Height</Label>
                                    <Input
                                        id="artworkHeight"
                                        type="number"
                                        value={artworkFormData.dimensions.height}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            dimensions: { ...prev.dimensions, height: e.target.value }
                                        }))}
                                        placeholder="Height"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="artworkUnit">Unit</Label>
                                    <select
                                        id="artworkUnit"
                                        value={artworkFormData.dimensions.unit}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            dimensions: { ...prev.dimensions, unit: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="in">Inches</option>
                                        <option value="cm">Centimeters</option>
                                        <option value="mm">Millimeters</option>
                                        <option value="ft">Feet</option>
                                        <option value="m">Meters</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="artworkDisplayText">Display Text</Label>
                                <Input
                                    id="artworkDisplayText"
                                    value={artworkFormData.dimensions.displayText}
                                    onChange={(e) => setArtworkFormData(prev => ({
                                        ...prev,
                                        dimensions: { ...prev.dimensions, displayText: e.target.value }
                                    }))}
                                    placeholder="e.g., 24 x 36 inches"
                                />
                            </div>
                        </div>

                        {/* Price Information */}
                        <div className="space-y-2">
                            <Label className="text-lg font-semibold">Pricing</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="artworkMinPrice">Min Price</Label>
                                    <Input
                                        id="artworkMinPrice"
                                        type="number"
                                        value={artworkFormData.price.min}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            price: { ...prev.price, min: e.target.value }
                                        }))}
                                        placeholder="Min price"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="artworkMaxPrice">Max Price</Label>
                                    <Input
                                        id="artworkMaxPrice"
                                        type="number"
                                        value={artworkFormData.price.max}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            price: { ...prev.price, max: e.target.value }
                                        }))}
                                        placeholder="Max price"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="artworkCurrency">Currency</Label>
                                    <select
                                        id="artworkCurrency"
                                        value={artworkFormData.price.currency}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            price: { ...prev.price, currency: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                        <option value="JPY">JPY</option>
                                        <option value="CAD">CAD</option>
                                        <option value="AUD">AUD</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="artworkContactPrice">Contact for Price</Label>
                                <Input
                                    id="artworkContactPrice"
                                    type="number"
                                    value={artworkFormData.price.contactPrice}
                                    onChange={(e) => setArtworkFormData(prev => ({
                                        ...prev,
                                        price: { ...prev.price, contactPrice: e.target.value }
                                    }))}
                                    placeholder="Contact price"
                                />
                            </div>
                        </div>

                        {/* Condition */}
                        <div className="space-y-2">
                            <Label className="text-lg font-semibold">Condition</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="artworkFramed"
                                        checked={artworkFormData.condition.framed}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            condition: { ...prev.condition, framed: e.target.checked }
                                        }))}
                                        className="rounded"
                                    />
                                    <Label htmlFor="artworkFramed">Framed</Label>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="artworkSignature">Signature</Label>
                                    <select
                                        id="artworkSignature"
                                        value={artworkFormData.condition.signature}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            condition: { ...prev.condition, signature: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Not signed">Not signed</option>
                                        <option value="Signed">Signed</option>
                                        <option value="Signed and dated">Signed and dated</option>
                                        <option value="Initialed">Initialed</option>
                                        <option value="Stamp">Stamp</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="artworkCertificate"
                                        checked={artworkFormData.condition.certificateOfAuthenticity}
                                        onChange={(e) => setArtworkFormData(prev => ({
                                            ...prev,
                                            condition: { ...prev.condition, certificateOfAuthenticity: e.target.checked }
                                        }))}
                                        className="rounded"
                                    />
                                    <Label htmlFor="artworkCertificate">Certificate of Authenticity</Label>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-2">
                            <Label htmlFor="artworkAdditionalInfo">Additional Information</Label>
                            <Textarea
                                id="artworkAdditionalInfo"
                                value={artworkFormData.additionalInfo}
                                onChange={(e) => setArtworkFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                                placeholder="Enter additional information"
                                rows={2}
                            />
                        </div>

                        {/* Technical Specifications */}
                        <div className="space-y-2">
                            <Label htmlFor="artworkTechnicalSpecs">Technical Specifications</Label>
                            <Textarea
                                id="artworkTechnicalSpecs"
                                value={artworkFormData.technicalSpecs}
                                onChange={(e) => setArtworkFormData(prev => ({ ...prev, technicalSpecs: e.target.value }))}
                                placeholder="Enter technical specifications"
                                rows={2}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="artworkDescription">Description</Label>
                            <Textarea
                                id="artworkDescription"
                                value={artworkFormData.description}
                                onChange={(e) => setArtworkFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter artwork description"
                                rows={3}
                            />
                        </div>

                        {/* Attribution */}
                        <div className="space-y-2">
                            <Label htmlFor="artworkAttribution">Attribution</Label>
                            <Input
                                id="artworkAttribution"
                                value={artworkFormData.attribution}
                                onChange={(e) => setArtworkFormData(prev => ({ ...prev, attribution: e.target.value }))}
                                placeholder="Enter attribution"
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-2">
                            <Label htmlFor="artworkImages">Images</Label>
                            <div className="space-y-2">
                                {artworkFormData.images.map((image, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={image}
                                            onChange={(e) => handleArtworkImageChange(index, e.target.value)}
                                            placeholder="Enter image URL"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemoveArtworkImage(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddArtworkImage}
                                    className="w-full"
                                >
                                    Add Image URL
                                </Button>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="artworkActive"
                                checked={artworkFormData.isActive}
                                onChange={(e) => setArtworkFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="rounded"
                            />
                            <Label htmlFor="artworkActive">Active Artwork</Label>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowArtworkModal(false);
                                    setSelectedArtwork(null);
                                    resetArtworkForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmittingArtwork}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isSubmittingArtwork ? 'Saving...' : (selectedArtwork ? 'Update Artwork' : 'Add Artwork')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Artworks Modal */}
            <Dialog open={showViewArtworksModal} onOpenChange={setShowViewArtworksModal}>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Artworks in Gallery: {selectedGallery?.title}</DialogTitle>
                        <DialogDescription>
                            View and manage all artworks in this gallery. You can edit or delete artworks as needed.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Gallery Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Gallery Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Title:</span> {selectedGallery?.title}
                                </div>
                                <div>
                                    <span className="font-medium">Category:</span> {selectedGallery?.categoryName || 'Uncategorized'}
                                </div>
                                <div>
                                    <span className="font-medium">Total Artworks:</span> {artworks.length}
                                </div>
                                <div>
                                    <span className="font-medium">Status:</span> 
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                        selectedGallery?.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {selectedGallery?.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Add New Artwork Button */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Artworks ({artworks.length})</h3>
                            <Button
                                onClick={() => {
                                    setShowViewArtworksModal(false);
                                    loadGalleryForArtworkManagement(selectedGallery);
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Artwork
                            </Button>
                        </div>

                        {/* Artworks List */}
                        {artworks.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No artworks yet</p>
                                <p className="text-sm">This gallery doesn&apos;t have any artworks yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {artworks.map((artwork, index) => (
                                    <div key={artwork._id || index} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-lg font-semibold">{artwork.title}</h4>
                                                    <Badge variant={artwork.isActive ? "default" : "secondary"}>
                                                        {artwork.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                                    <div>
                                                        <span className="font-medium">Artist:</span> {artwork.artist?.name || 'Unknown'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Category:</span> {artwork.category || 'Uncategorized'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Medium:</span> {artwork.medium || 'Not specified'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Condition:</span> 
                                                        {artwork.condition?.signature || 'Not specified'}
                                                        {artwork.condition?.framed && ' (Framed)'}
                                                        {artwork.condition?.certificateOfAuthenticity && ' (COA)'}
                                                    </div>
                                                    {artwork.price && (
                                                        <div>
                                                            <span className="font-medium">Price:</span> 
                                                            {artwork.price.min && artwork.price.max 
                                                                ? `$${artwork.price.min} - $${artwork.price.max} ${artwork.price.currency || 'USD'}`
                                                                : artwork.price.min 
                                                                    ? `$${artwork.price.min} ${artwork.price.currency || 'USD'}`
                                                                    : artwork.price.contactPrice 
                                                                        ? `Contact for price`
                                                                        : 'Price on request'
                                                            }
                                                        </div>
                                                    )}
                                                    {artwork.dimensions && (artwork.dimensions.width || artwork.dimensions.height) && (
                                                        <div>
                                                            <span className="font-medium">Dimensions:</span> 
                                                            {artwork.dimensions.width && `${artwork.dimensions.width}${artwork.dimensions.unit || 'cm'}`}
                                                            {artwork.dimensions.width && artwork.dimensions.height && ' x '}
                                                            {artwork.dimensions.height && `${artwork.dimensions.height}${artwork.dimensions.unit || 'cm'}`}
                                                        </div>
                                                    )}
                                                </div>

                                                {artwork.description && (
                                                    <p className="text-sm text-gray-600 mb-3">
                                                        <span className="font-medium">Description:</span> {artwork.description}
                                                    </p>
                                                )}

                                                {/* Artwork Images */}
                                                {artwork.images && artwork.images.length > 0 && artwork.images[0] && (
                                                    <div className="mb-3">
                                                        <span className="font-medium text-sm">Images:</span>
                                                        <div className="flex gap-2 mt-2">
                                                            {artwork.images.filter(img => img.trim()).map((image, imgIndex) => (
                                                                <div key={imgIndex} className="relative">
                                                                    <img
                                                                        src={image}
                                                                        alt={`${artwork.title} - Image ${imgIndex + 1}`}
                                                                        className="w-16 h-16 object-cover rounded border"
                                                                        onError={(e) => {
                                                                            e.target.src = '/placeholder.jpeg';
                                                                        }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowViewArtworksModal(false);
                                                        setSelectedArtwork(artwork);
                                                        setArtworkFormData({
                                                            title: artwork.title || '',
                                                            artist: { 
                                                                name: artwork.artist?.name || '', 
                                                                nationality: artwork.artist?.nationality || '',
                                                                birthYear: artwork.artist?.birthYear || '',
                                                                bio: artwork.artist?.bio || ''
                                                            },
                                                            category: artwork.category || '',
                                                            medium: artwork.medium || '',
                                                            dimensions: { 
                                                                width: artwork.dimensions?.width || '', 
                                                                height: artwork.dimensions?.height || '', 
                                                                depth: artwork.dimensions?.depth || '', 
                                                                unit: artwork.dimensions?.unit || 'cm' 
                                                            },
                                                            publisher: artwork.publisher || 'N/A',
                                                            attribution: artwork.attribution || 'Unique',
                                                            condition: {
                                                                framed: artwork.condition?.framed || false,
                                                                signature: artwork.condition?.signature || 'Not signed',
                                                                certificateOfAuthenticity: artwork.condition?.certificateOfAuthenticity || false
                                                            },
                                                            price: {
                                                                min: artwork.price?.min || '',
                                                                max: artwork.price?.max || '',
                                                                currency: artwork.price?.currency || 'USD',
                                                                contactPrice: artwork.price?.contactPrice || ''
                                                            },
                                                            description: artwork.description || '',
                                                            additionalInfo: artwork.additionalInfo || '',
                                                            technicalSpecs: artwork.technicalSpecs || '',
                                                            images: artwork.images && artwork.images.length > 0 ? artwork.images : [''],
                                                            isActive: artwork.isActive !== undefined ? artwork.isActive : true
                                                        });
                                                        setShowArtworkModal(true);
                                                    }}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDeleteArtwork(artwork._id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={() => setShowViewArtworksModal(false)}
                            variant="outline"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Gallery Modal */}
            <Dialog open={showEditGalleryModal} onOpenChange={setShowEditGalleryModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Gallery: {selectedGallery?.title}</DialogTitle>
                        <DialogDescription>
                            Modify the details of the gallery.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateGallery} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="editTitle">Title *</Label>
                            <Input
                                id="editTitle"
                                value={editGalleryFormData.title}
                                onChange={(e) => setEditGalleryFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter gallery title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editDescription">Description</Label>
                            <Textarea
                                id="editDescription"
                                value={editGalleryFormData.description}
                                onChange={(e) => setEditGalleryFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter gallery description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editCategory">Category</Label>
                                <Input
                                    id="editCategory"
                                    value={editGalleryFormData.category}
                                    onChange={(e) => setEditGalleryFormData(prev => ({ ...prev, category: e.target.value }))}
                                    placeholder="Enter category"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editArtist">Artist ID</Label>
                                <Input
                                    id="editArtist"
                                    value={editGalleryFormData.artist}
                                    onChange={(e) => setEditGalleryFormData(prev => ({ ...prev, artist: e.target.value }))}
                                    placeholder="Enter artist ID (optional)"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editCreatedBy">Created By User</Label>
                                <select
                                    id="editCreatedBy"
                                    value={editGalleryFormData.createdBy}
                                    onChange={(e) => setEditGalleryFormData(prev => ({ ...prev, createdBy: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={usersLoading}
                                >
                                    <option value="">Admin Gallery (No User)</option>
                                    {usersLoading ? (
                                        <option value="" disabled>Loading users...</option>
                                    ) : Array.isArray(users) && users.length > 0 ? (
                                        users.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name || user.email} ({user.role})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No users available</option>
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editImages">Images</Label>
                                <div className="space-y-2">
                                    {editGalleryFormData.images.map((image, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={image}
                                                onChange={(e) => {
                                                    const newImages = [...editGalleryFormData.images];
                                                    newImages[index] = e.target.value;
                                                    setEditGalleryFormData(prev => ({ ...prev, images: newImages }));
                                                }}
                                                placeholder="Enter image URL"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const newImages = editGalleryFormData.images.filter((_, i) => i !== index);
                                                    setEditGalleryFormData(prev => ({ ...prev, images: newImages }));
                                                }}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditGalleryFormData(prev => ({ 
                                            ...prev, 
                                            images: [...prev.images, '']
                                        }))}
                                        className="w-full"
                                    >
                                        Add Image URL
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="editIsFeatured"
                                    checked={editGalleryFormData.isFeatured}
                                    onChange={(e) => setEditGalleryFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                    className="rounded"
                                />
                                <Label htmlFor="editIsFeatured">Featured Gallery</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="editActive"
                                    checked={editGalleryFormData.active}
                                    onChange={(e) => setEditGalleryFormData(prev => ({ ...prev, active: e.target.checked }))}
                                    className="rounded"
                                />
                                <Label htmlFor="editActive">Active</Label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowEditGalleryModal(false);
                                    resetEditGalleryForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreating}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {isCreating ? 'Updating...' : 'Update Gallery'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
} 