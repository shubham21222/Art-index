"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MousePointer,
  TrendingUp,
  Globe,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function SponsorBannersAdmin() {
  const [banners, setBanners] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
    sponsorName: "",
    sponsorWebsite: "",
    placement: "",
    position: "middle",
    startDate: "",
    endDate: "",
    contactEmail: "",
    contactPhone: "",
    budget: "",
  });

  useEffect(() => {
    fetchBanners();
    fetchStats();
  }, []);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/sponsor-banner/all`, {
        headers: {
          Authorization: token,
        },
      });
      const data = await response.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/sponsor-banner/stats`, {
        headers: {
          Authorization: token,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreate = async () => {
    // Validate required fields
    const requiredFields = ['title', 'description', 'image', 'link', 'sponsorName', 'sponsorWebsite', 'placement', 'startDate', 'endDate', 'contactEmail', 'budget'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate placement enum
    const validPlacements = ['homepage', 'collect', 'museums', 'artists', 'galleries', 'price-index'];
    if (!validPlacements.includes(formData.placement)) {
      alert('Please select a valid placement');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/sponsor-banner/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        resetForm();
        fetchBanners();
        fetchStats();
        alert("Sponsor banner created successfully!");
      } else {
        alert(data.message || "Failed to create banner");
      }
    } catch (error) {
      console.error("Error creating banner:", error);
      alert("Error creating banner");
    }
  };

  const handleUpdate = async () => {
    // Validate required fields
    const requiredFields = ['title', 'description', 'image', 'link', 'sponsorName', 'sponsorWebsite', 'placement', 'startDate', 'endDate', 'contactEmail', 'budget'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate placement enum
    const validPlacements = ['homepage', 'collect', 'museums', 'artists', 'galleries', 'price-index'];
    if (!validPlacements.includes(formData.placement)) {
      alert('Please select a valid placement');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/sponsor-banner/${selectedBanner._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsEditModalOpen(false);
        resetForm();
        fetchBanners();
        fetchStats();
        alert("Sponsor banner updated successfully!");
      } else {
        alert(data.message || "Failed to update banner");
      }
    } catch (error) {
      console.error("Error updating banner:", error);
      alert("Error updating banner");
    }
  };

  const handleDelete = async (bannerId) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/sponsor-banner/${bannerId}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchBanners();
        fetchStats();
        alert("Sponsor banner deleted successfully!");
      } else {
        alert(data.message || "Failed to delete banner");
      }
    } catch (error) {
      alert("Error deleting banner");
    }
  };

  const handleToggleStatus = async (bannerId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/sponsor-banner/${bannerId}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchBanners();
        fetchStats();
      } else {
        alert(data.message || "Failed to toggle banner status");
      }
    } catch (error) {
      alert("Error toggling banner status");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
      link: "",
      sponsorName: "",
      sponsorWebsite: "",
      placement: "",
      position: "middle",
      startDate: "",
      endDate: "",
      contactEmail: "",
      contactPhone: "",
      budget: "",
    });
    setSelectedBanner(null);
  };

  const openEditModal = (banner) => {
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
      startDate: banner.startDate.split("T")[0],
      endDate: banner.endDate.split("T")[0],
      contactEmail: banner.contactEmail,
      contactPhone: banner.contactPhone || "",
      budget: banner.budget.toString(),
    });
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (banner) => {
    const now = new Date();
    const startDate = new Date(banner.startDate);
    const endDate = new Date(banner.endDate);

    if (!banner.isActive) {
      return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    }

    if (now < startDate) {
      return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
    }

    if (now > endDate) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    }

    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const getPlacementBadge = (placement) => {
    const variants = {
      homepage: "bg-purple-100 text-purple-800",
      collect: "bg-blue-100 text-blue-800",
      museums: "bg-indigo-100 text-indigo-800",
      artists: "bg-pink-100 text-pink-800",
      galleries: "bg-orange-100 text-orange-800",
      "price-index": "bg-teal-100 text-teal-800",
    };
    return <Badge className={variants[placement]}>{placement.replace("-", " ")}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Sponsor Banners</h1>
          <p className="text-zinc-400 mt-2">Manage sponsor banners and track performance</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Banner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Banners</p>
                <p className="text-2xl font-bold text-white">{stats.overall?.totalBanners || 0}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Active Banners</p>
                <p className="text-2xl font-bold text-white">{stats.overall?.activeBanners || 0}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <ToggleRight className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Impressions</p>
                <p className="text-2xl font-bold text-white">
                  {(stats.overall?.totalImpressions || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Clicks</p>
                <p className="text-2xl font-bold text-white">
                  {(stats.overall?.totalClicks || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <MousePointer className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banners List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">All Sponsor Banners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="flex items-center justify-between p-4 bg-zinc-800 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-12 bg-zinc-700 rounded-lg overflow-hidden">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{banner.title}</h3>
                    <p className="text-zinc-400 text-sm">{banner.sponsorName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(banner)}
                      {getPlacementBadge(banner.placement)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{banner.impressions?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointer className="w-4 h-4" />
                        <span>{banner.clicks?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{banner.clickThroughRate?.toFixed(2) || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(banner)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(banner._id)}
                      className="text-zinc-400 hover:text-white"
                    >
                      {banner.isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(banner._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Create Sponsor Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Sponsor Name</Label>
                <Input
                  value={formData.sponsorName}
                  onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Image URL</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Link URL</Label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Sponsor Website</Label>
                <Input
                  value={formData.sponsorWebsite}
                  onChange={(e) => setFormData({ ...formData, sponsorWebsite: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label className="text-white">Placement</Label>
                <Select
                  value={formData.placement}
                  onValueChange={(value) => {
                    console.log('Placement selected:', value);
                    setFormData({ ...formData, placement: value });
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200 z-[9999]">
                    <SelectItem value="homepage" className="text-zinc-200 hover:bg-zinc-700 cursor-pointer">Homepage</SelectItem>
                    <SelectItem value="collect" className="text-zinc-200 hover:bg-zinc-700 cursor-pointer">Collect</SelectItem>
                    <SelectItem value="museums" className="text-zinc-200 hover:bg-zinc-700 cursor-pointer">Museums</SelectItem>
                    <SelectItem value="artists" className="text-zinc-200 hover:bg-zinc-700 cursor-pointer">Artists</SelectItem>
                    <SelectItem value="galleries" className="text-zinc-200 hover:bg-zinc-700 cursor-pointer">Galleries</SelectItem>
                    <SelectItem value="price-index" className="text-zinc-200 hover:bg-zinc-700 cursor-pointer">Price Index</SelectItem>
                  </SelectContent>
                </Select>
                {/* Debug info */}
                <p className="text-xs text-zinc-500 mt-1">Current value: {formData.placement || 'None selected'}</p>
              </div>
            </div>

            <div>
              <Label className="text-white">Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200 z-50">
                  <SelectItem value="top" className="text-zinc-200 hover:bg-zinc-700">Top</SelectItem>
                  <SelectItem value="middle" className="text-zinc-200 hover:bg-zinc-700">Middle</SelectItem>
                  <SelectItem value="bottom" className="text-zinc-200 hover:bg-zinc-700">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Contact Email</Label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Contact Phone</Label>
                <Input
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Budget</Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} className="bg-white text-black hover:bg-gray-100">
                Create Banner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Sponsor Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Sponsor Name</Label>
                <Input
                  value={formData.sponsorName}
                  onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Image URL</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Link URL</Label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Sponsor Website</Label>
                <Input
                  value={formData.sponsorWebsite}
                  onChange={(e) => setFormData({ ...formData, sponsorWebsite: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label className="text-white">Placement</Label>
                <Select
                  value={formData.placement}
                  onValueChange={(value) => setFormData({ ...formData, placement: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200 z-[9999]">
                    <SelectItem value="homepage" className="text-zinc-200 hover:bg-zinc-700 cursor-pointer">Homepage</SelectItem>
                    <SelectItem value="collect" className="text-zinc-200 hover:bg-zinc-700 cursor-pointer">Collect</SelectItem>
                    <SelectItem value="museums" className="text-zinc-200 hover:bg-zinc-700 cursor-pointer">Museums</SelectItem>
                    <SelectItem value="artists" className="text-zinc-200 hover:bg-zinc-700 cursor-pointer">Artists</SelectItem>
                    <SelectItem value="galleries" className="text-zinc-200 hover:bg-zinc-700 cursor-pointer">Galleries</SelectItem>
                    <SelectItem value="price-index" className="text-zinc-200 hover:bg-zinc-700 cursor-pointer">Price Index</SelectItem>
                  </SelectContent>
                </Select>
                {/* Debug info */}
                <p className="text-xs text-zinc-500 mt-1">Current value: {formData.placement || 'None selected'}</p>
              </div>
            </div>

            <div>
              <Label className="text-white">Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200 z-50">
                  <SelectItem value="top" className="text-zinc-200 hover:bg-zinc-700">Top</SelectItem>
                  <SelectItem value="middle" className="text-zinc-200 hover:bg-zinc-700">Middle</SelectItem>
                  <SelectItem value="bottom" className="text-zinc-200 hover:bg-zinc-700">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Contact Email</Label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Contact Phone</Label>
                <Input
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Budget</Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} className="bg-white text-black hover:bg-gray-100">
                Update Banner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 