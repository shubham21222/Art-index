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
    Plus, 
    Edit, 
    Trash2, 
    RotateCcw,
    DollarSign,
    TrendingUp,
    TrendingDown
} from "lucide-react";
import config from '@/app/config_BASE_URL';
import toast from 'react-hot-toast';

export default function ArtworkPricingPage() {
    const [pricingData, setPricingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPricing, setEditingPricing] = useState(null);
    const [formData, setFormData] = useState({
        artworkId: '',
        artworkSlug: '',
        originalPrice: '',
        originalPriceType: 'Money',
        originalMinPrice: '',
        originalMaxPrice: '',
        adjustmentPercentage: '',
        adjustmentReason: '',
        artworkTitle: '',
        artistName: '',
        category: ''
    });

    const auth = useSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!auth.token) {
            router.push('/admin/login');
            return;
        }
        fetchPricingData();
    }, [auth.token, currentPage, searchQuery]);

    const fetchPricingData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                searchQuery: searchQuery
            });

            const response = await fetch(`${config.baseURL}/v1/api/artwork-pricing/all?${params}`, {
                headers: {
                    'Authorization': auth.token
                }
            });

            const data = await response.json();
            if (data.success) {
                setPricingData(data.data.items);
                setTotalPages(data.data.totalPages);
            } else {
                toast.error(data.message || 'Failed to fetch pricing data');
            }
        } catch (error) {
            console.error('Error fetching pricing data:', error);
            toast.error('Failed to fetch pricing data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePricing = async () => {
        try {
            const response = await fetch(`${config.baseURL}/v1/api/artwork-pricing/create-or-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth.token
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Pricing created successfully');
                setShowCreateModal(false);
                resetForm();
                fetchPricingData();
            } else {
                toast.error(data.message || 'Failed to create pricing');
            }
        } catch (error) {
            console.error('Error creating pricing:', error);
            toast.error('Failed to create pricing');
        }
    };

    const handleUpdatePricing = async () => {
        try {
            const response = await fetch(`${config.baseURL}/v1/api/artwork-pricing/create-or-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth.token
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Pricing updated successfully');
                setEditingPricing(null);
                resetForm();
                fetchPricingData();
            } else {
                toast.error(data.message || 'Failed to update pricing');
            }
        } catch (error) {
            console.error('Error updating pricing:', error);
            toast.error('Failed to update pricing');
        }
    };

    const handleDeletePricing = async (id) => {
        if (!confirm('Are you sure you want to delete this pricing?')) return;

        try {
            const response = await fetch(`${config.baseURL}/v1/api/artwork-pricing/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': auth.token
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Pricing deleted successfully');
                fetchPricingData();
            } else {
                toast.error(data.message || 'Failed to delete pricing');
            }
        } catch (error) {
            console.error('Error deleting pricing:', error);
            toast.error('Failed to delete pricing');
        }
    };

    const handleResetPricing = async (id) => {
        if (!confirm('Are you sure you want to reset this pricing to original?')) return;

        try {
            const response = await fetch(`${config.baseURL}/v1/api/artwork-pricing/reset/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': auth.token
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Pricing reset successfully');
                fetchPricingData();
            } else {
                toast.error(data.message || 'Failed to reset pricing');
            }
        } catch (error) {
            console.error('Error resetting pricing:', error);
            toast.error('Failed to reset pricing');
        }
    };

    const resetForm = () => {
        setFormData({
            artworkId: '',
            artworkSlug: '',
            originalPrice: '',
            originalPriceType: 'Money',
            originalMinPrice: '',
            originalMaxPrice: '',
            adjustmentPercentage: '',
            adjustmentReason: '',
            artworkTitle: '',
            artistName: '',
            category: ''
        });
    };

    const openEditModal = (pricing) => {
        setEditingPricing(pricing);
        setFormData({
            artworkId: pricing.artworkId,
            artworkSlug: pricing.artworkSlug,
            originalPrice: pricing.originalPrice,
            originalPriceType: pricing.originalPriceType,
            originalMinPrice: pricing.originalMinPrice || '',
            originalMaxPrice: pricing.originalMaxPrice || '',
            adjustmentPercentage: pricing.adjustmentPercentage,
            adjustmentReason: pricing.adjustmentReason || '',
            artworkTitle: pricing.artworkTitle,
            artistName: pricing.artistName,
            category: pricing.category || ''
        });
    };

    const formatPrice = (price) => {
        return `$${(price / 100).toLocaleString()}`;
    };

    const formatPercentage = (percentage) => {
        const sign = percentage >= 0 ? '+' : '';
        return `${sign}${percentage}%`;
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Artwork Pricing Management</h1>
                <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pricing
                </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search by artwork title, artist, or slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Pricing Data */}
            {loading ? (
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
            ) : (
                <div className="space-y-6">
                    {pricingData.map((pricing) => (
                        <Card key={pricing._id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {pricing.artworkTitle}
                                            </h3>
                                            <Badge variant="secondary">{pricing.category}</Badge>
                                        </div>
                                        <p className="text-gray-600 mb-2">by {pricing.artistName}</p>
                                        <p className="text-sm text-gray-500 mb-3">Slug: {pricing.artworkSlug}</p>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Original:</span>
                                                <p className="font-medium">{formatPrice(pricing.originalPrice)}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Adjusted:</span>
                                                <p className="font-medium">{formatPrice(pricing.adjustedPrice)}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Adjustment:</span>
                                                <div className="flex items-center gap-1">
                                                    {pricing.adjustmentPercentage >= 0 ? (
                                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                                    )}
                                                    <span className={`font-medium ${
                                                        pricing.adjustmentPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {formatPercentage(pricing.adjustmentPercentage)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Type:</span>
                                                <p className="font-medium">{pricing.adjustedPriceType}</p>
                                            </div>
                                        </div>
                                        
                                        {pricing.adjustmentReason && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                Reason: {pricing.adjustmentReason}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEditModal(pricing)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleResetPricing(pricing._id)}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeletePricing(pricing._id)}
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="px-4 py-2 text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingPricing) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle>
                                {editingPricing ? 'Edit Artwork Pricing' : 'Add New Artwork Pricing'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Artwork ID</label>
                                    <Input
                                        value={formData.artworkId}
                                        onChange={(e) => setFormData({...formData, artworkId: e.target.value})}
                                        placeholder="Artwork ID"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Artwork Slug</label>
                                    <Input
                                        value={formData.artworkSlug}
                                        onChange={(e) => setFormData({...formData, artworkSlug: e.target.value})}
                                        placeholder="artwork-slug"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Artwork Title</label>
                                <Input
                                    value={formData.artworkTitle}
                                    onChange={(e) => setFormData({...formData, artworkTitle: e.target.value})}
                                    placeholder="Artwork Title"
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Artist Name</label>
                                <Input
                                    value={formData.artistName}
                                    onChange={(e) => setFormData({...formData, artistName: e.target.value})}
                                    placeholder="Artist Name"
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Category</label>
                                <Input
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    placeholder="Category"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Original Price (in cents)</label>
                                    <Input
                                        type="number"
                                        value={formData.originalPrice}
                                        onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                                        placeholder="80000"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Price Type</label>
                                    <select
                                        value={formData.originalPriceType}
                                        onChange={(e) => setFormData({...formData, originalPriceType: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="Money">Fixed Price</option>
                                        <option value="PriceRange">Price Range</option>
                                    </select>
                                </div>
                            </div>
                            
                            {formData.originalPriceType === 'PriceRange' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Min Price (in cents)</label>
                                        <Input
                                            type="number"
                                            value={formData.originalMinPrice}
                                            onChange={(e) => setFormData({...formData, originalMinPrice: e.target.value})}
                                            placeholder="50000"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Max Price (in cents)</label>
                                        <Input
                                            type="number"
                                            value={formData.originalMaxPrice}
                                            onChange={(e) => setFormData({...formData, originalMaxPrice: e.target.value})}
                                            placeholder="100000"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Adjustment Percentage</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.adjustmentPercentage}
                                        onChange={(e) => setFormData({...formData, adjustmentPercentage: e.target.value})}
                                        placeholder="10 (for 10% increase)"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Adjustment Reason</label>
                                <Input
                                    value={formData.adjustmentReason}
                                    onChange={(e) => setFormData({...formData, adjustmentReason: e.target.value})}
                                    placeholder="Reason for price adjustment"
                                />
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={editingPricing ? handleUpdatePricing : handleCreatePricing}
                                    className="flex-1"
                                >
                                    {editingPricing ? 'Update' : 'Create'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingPricing(null);
                                        resetForm();
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
} 