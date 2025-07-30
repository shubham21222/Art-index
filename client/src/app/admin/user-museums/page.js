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
    Building2,
    Palette,
    Eye,
    Calendar,
    Mail,
    Shield,
    MapPin,
    Phone,
    Globe
} from "lucide-react";
import { BASE_URL } from '@/config/baseUrl';
import toast from 'react-hot-toast';
import MuseumDetailModal from './components/MuseumDetailModal';

export default function UserMuseumsAdmin() {
    const [museums, setMuseums] = useState([]);
    const [usersWithMuseums, setUsersWithMuseums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [view, setView] = useState('users'); // 'users' or 'museums'
    const [deleting, setDeleting] = useState(false);
    const [selectedMuseum, setSelectedMuseum] = useState(null);
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
                await fetchUsersWithMuseums();
            } else {
                await fetchAllMuseums();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersWithMuseums = async () => {
        const response = await fetch(`${BASE_URL}/museum/admin/users-with-museums`, {
            headers: {
                'Authorization': auth.token
            }
        });

        const data = await response.json();
        if (data.status) {
            setUsersWithMuseums(data.items);
        } else {
            toast.error(data.message || 'Failed to fetch users');
        }
    };

    const fetchAllMuseums = async () => {
        const response = await fetch(`${BASE_URL}/museum/admin/all-with-users`, {
            headers: {
                'Authorization': auth.token
            }
        });

        const data = await response.json();
        if (data.status) {
            setMuseums(data.items);
        } else {
            toast.error(data.message || 'Failed to fetch museums');
        }
    };

    const fetchUserMuseums = async (userId) => {
        try {
            const response = await fetch(`${BASE_URL}/museum/admin/user/${userId}/museums`, {
                headers: {
                    'Authorization': auth.token
                }
            });

            const data = await response.json();
            if (data.status) {
                setMuseums(data.items);
                setView('museums');
            } else {
                toast.error(data.message || 'Failed to fetch user museums');
            }
        } catch (error) {
            console.error('Error fetching user museums:', error);
            toast.error('Failed to fetch user museums');
        }
    };

    const handleDeleteMuseum = async (museumId) => {
        if (!confirm('Are you sure you want to delete this museum? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch(`${BASE_URL}/museum/admin/delete/${museumId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': auth.token
                }
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Museum deleted successfully');
                fetchData(); // Refresh the data
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

    const handleViewMuseumDetails = (museum) => {
        setSelectedMuseum(museum);
        setShowDetailModal(true);
    };

    const handleMuseumDeleted = () => {
        fetchData(); // Refresh the data after deletion
    };

    const filteredUsers = usersWithMuseums.filter(user => 
        user.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredMuseums = museums.filter(museum => 
        museum.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        museum.createdByUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        museum.createdByUser?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">User Museums Management</h1>
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
                <h1 className="text-3xl font-bold text-gray-900">User Museums Management</h1>
                <div className="flex gap-2">
                    <Button
                        variant={view === 'users' ? 'default' : 'outline'}
                        onClick={() => setView('users')}
                    >
                        <User className="w-4 h-4 mr-2" />
                        Users
                    </Button>
                    <Button
                        variant={view === 'museums' ? 'default' : 'outline'}
                        onClick={() => setView('museums')}
                    >
                        <Building2 className="w-4 h-4 mr-2" />
                        All Museums
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder={view === 'users' ? "Search users..." : "Search museums..."}
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
                                                <Building2 className="w-4 h-4 text-blue-500" />
                                                <span className="text-gray-500">Museums:</span>
                                                <span className="font-medium">{userData.totalMuseums}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-green-500" />
                                                <span className="text-gray-500">Events:</span>
                                                <span className="font-medium">{userData.totalEvents}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Palette className="w-4 h-4 text-purple-500" />
                                                <span className="text-gray-500">Artworks:</span>
                                                <span className="font-medium">{userData.totalArtworks}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedUser(userData.user);
                                                fetchUserMuseums(userData.user._id);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Museums
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Museums View */}
            {view === 'museums' && (
                <div className="space-y-6">
                    {selectedUser && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-medium text-blue-900">
                                Viewing museums for: {selectedUser.name} ({selectedUser.email})
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSelectedUser(null);
                                    fetchAllMuseums();
                                }}
                                className="mt-2"
                            >
                                View All Museums
                            </Button>
                        </div>
                    )}
                    
                    {filteredMuseums.map((museum) => (
                        <Card key={museum._id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {museum.name}
                                            </h3>
                                            <Badge variant={museum.isActive ? "default" : "secondary"}>
                                                {museum.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        
                                        <p className="text-gray-600 mb-3">{museum.description}</p>
                                        
                                        {/* Contact Info */}
                                        {museum.contact && (
                                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    {museum.contact.email && (
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 text-gray-500" />
                                                            <span className="text-gray-600">{museum.contact.email}</span>
                                                        </div>
                                                    )}
                                                    {museum.contact.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-4 h-4 text-gray-500" />
                                                            <span className="text-gray-600">{museum.contact.phone}</span>
                                                        </div>
                                                    )}
                                                    {museum.contact.website && (
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="w-4 h-4 text-gray-500" />
                                                            <span className="text-gray-600">{museum.contact.website}</span>
                                                        </div>
                                                    )}
                                                    {museum.contact.address && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-gray-500" />
                                                            <span className="text-gray-600">{museum.contact.address}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* User Info */}
                                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700">Created by:</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="text-sm font-medium">{museum.createdByUser?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{museum.createdByUser?.email}</p>
                                                </div>
                                                <Badge className={getRoleBadge(museum.createdByUser?.role)}>
                                                    {museum.createdByUser?.role}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Total Events:</span>
                                                <p className="font-medium">{museum.totalEvents}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Active Events:</span>
                                                <p className="font-medium">{museum.activeEvents}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Total Artworks:</span>
                                                <p className="font-medium">{museum.totalArtworks}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Created:</span>
                                                <p className="font-medium">
                                                    {new Date(museum.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleViewMuseumDetails(museum)}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteMuseum(museum._id)}
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
              (view === 'museums' && filteredMuseums.length === 0)) && (
                <div className="text-center py-12">
                    <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {view === 'users' ? 'No users found' : 'No museums found'}
                    </h3>
                    <p className="text-gray-500">
                        {view === 'users' 
                            ? 'No users have created museums yet.' 
                            : 'No museums match your search criteria.'}
                    </p>
                </div>
            )}

            {/* Museum Detail Modal */}
            {showDetailModal && selectedMuseum && (
                <MuseumDetailModal
                    isOpen={showDetailModal}
                    museum={selectedMuseum}
                    onClose={() => setShowDetailModal(false)}
                    onDelete={handleMuseumDeleted}
                />
            )}
        </div>
    );
} 