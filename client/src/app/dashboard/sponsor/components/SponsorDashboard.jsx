'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Eye,
  MousePointer,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Edit,
  Trash2,
  Pause,
  Play,
  Download,
} from 'lucide-react';
import Image from 'next/image';

export function SponsorDashboard() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    averageCTR: 0,
    totalBudget: 0,
    activeCampaigns: 0,
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    sponsorName: '',
    sponsorWebsite: '',
    placement: 'homepage',
    position: 'middle',
    startDate: '',
    endDate: '',
    contactEmail: '',
    contactPhone: '',
    budget: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchBanners();
    fetchAnalytics();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsor-banner/all`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch banners');
      }

      const data = await res.json();
      if (data.success && data.items) {
        // The backend already filters by user role, so we can use all items
        setBanners(data.items);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsor-banner/stats`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          // The backend already filters by user role, so we can use the overall stats
          const overall = data.data.overall;
          const totalStats = {
            totalImpressions: overall.totalImpressions || 0,
            totalClicks: overall.totalClicks || 0,
            totalBudget: overall.totalBudget || 0,
            activeCampaigns: overall.activeBanners || 0,
            averageCTR: overall.totalImpressions > 0 
              ? (overall.totalClicks / overall.totalImpressions) * 100 
              : 0,
          };
          
          setAnalytics(totalStats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = selectedBanner 
        ? `${process.env.NEXT_PUBLIC_API_URL}/sponsor-banner/${selectedBanner._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/sponsor-banner/create`;

      const res = await fetch(url, {
        method: selectedBanner ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to save banner');
      }

      toast.success(selectedBanner ? 'Banner updated successfully' : 'Banner created successfully');
      setIsModalOpen(false);
      setSelectedBanner(null);
      resetForm();
      fetchBanners();
      fetchAnalytics();
    } catch (error) {
      toast.error(error.message || 'Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      image: banner.image,
      link: banner.link,
      sponsorName: banner.sponsorName,
      sponsorWebsite: banner.sponsorWebsite,
      placement: banner.placement,
      position: banner.position,
      startDate: banner.startDate.split('T')[0],
      endDate: banner.endDate.split('T')[0],
      contactEmail: banner.contactEmail,
      contactPhone: banner.contactPhone || '',
      budget: banner.budget,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (bannerId) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsor-banner/${bannerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete banner');
      }

      toast.success('Banner deleted successfully');
      fetchBanners();
      fetchAnalytics();
    } catch (error) {
      toast.error(error.message || 'Failed to delete banner');
    }
  };

  const handleToggleStatus = async (bannerId, currentStatus) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsor-banner/${bannerId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to toggle banner status');
      }

      toast.success(`Banner ${currentStatus ? 'paused' : 'activated'} successfully`);
      fetchBanners();
      fetchAnalytics();
    } catch (error) {
      toast.error(error.message || 'Failed to toggle banner status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      link: '',
      sponsorName: '',
      sponsorWebsite: '',
      placement: 'homepage',
      position: 'middle',
      startDate: '',
      endDate: '',
      contactEmail: '',
      contactPhone: '',
      budget: '',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sponsor Dashboard</h1>
          <p className="text-gray-600">Manage your banner campaigns and track performance</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Banner
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalImpressions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageCTR.toFixed(2)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalBudget)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeCampaigns}</div>
          </CardContent>
        </Card>
      </div>

      {/* Banners List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Banner Campaigns</CardTitle>
          <CardDescription>Manage and monitor your sponsored banner campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No banners yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first banner campaign.</p>
              <div className="mt-6">
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Banner
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div key={banner._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {banner.image && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={banner.image}
                            alt={banner.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{banner.title}</h3>
                        <p className="text-sm text-gray-600">{banner.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(banner.status)}>
                            {banner.status}
                          </Badge>
                          <Badge variant="outline">{banner.placement}</Badge>
                          <Badge variant="outline">{banner.position}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">{banner.impressions.toLocaleString()} impressions</div>
                        <div className="text-sm text-gray-600">{banner.clicks.toLocaleString()} clicks</div>
                        <div className="text-sm text-gray-600">{banner.clickThroughRate.toFixed(2)}% CTR</div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(banner)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(banner._id, banner.isActive)}
                        >
                          {banner.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(banner._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Banner Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBanner ? 'Edit Banner' : 'Create New Banner'}
            </DialogTitle>
            <DialogDescription>
              {selectedBanner ? 'Update your banner campaign details' : 'Create a new banner campaign'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sponsorName">Sponsor Name</Label>
                <Input
                  id="sponsorName"
                  value={formData.sponsorName}
                  onChange={(e) => setFormData({...formData, sponsorName: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="link">Click-through URL</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="placement">Placement</Label>
                <select
                  id="placement"
                  value={formData.placement}
                  onChange={(e) => setFormData({...formData, placement: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="homepage">Homepage</option>
                  <option value="collect">Collect</option>
                  <option value="museums">Museums</option>
                  <option value="artists">Artists</option>
                  <option value="galleries">Galleries</option>
                  <option value="price-index">Price Index</option>
                </select>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <select
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sponsorWebsite">Sponsor Website</Label>
                <Input
                  id="sponsorWebsite"
                  type="url"
                  value={formData.sponsorWebsite}
                  onChange={(e) => setFormData({...formData, sponsorWebsite: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="budget">Budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedBanner(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (selectedBanner ? 'Update Banner' : 'Create Banner')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 