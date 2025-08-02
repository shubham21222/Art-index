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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Users,
  Eye,
  MousePointer,
  TrendingUp,
  DollarSign,
  BarChart3,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Globe,
} from 'lucide-react';

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalSponsors: 0,
    totalBanners: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalRevenue: 0,
  });
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchSponsors();
    fetchBanners();
    fetchAnalytics();
  }, []);

  const fetchSponsors = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sponsors`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch sponsors');
      }

      const data = await res.json();
      if (data.success && data.items) {
        setSponsors(data.items);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch sponsors');
    }
  };

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
          const overall = data.data.overall;
          setAnalytics({
            totalBanners: overall.totalBanners || 0,
            totalImpressions: overall.totalImpressions || 0,
            totalClicks: overall.totalClicks || 0,
            totalRevenue: overall.totalBudget || 0,
            totalSponsors: sponsors.length,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleViewSponsor = (sponsor) => {
    setSelectedSponsor(sponsor);
    setIsModalOpen(true);
  };

  const handleDeleteSponsor = async (sponsorId) => {
    if (!confirm('Are you sure you want to delete this sponsor? This will also delete all their banners.')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${sponsorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete sponsor');
      }

      toast.success('Sponsor deleted successfully');
      fetchSponsors();
      fetchAnalytics();
    } catch (error) {
      toast.error(error.message || 'Failed to delete sponsor');
    }
  };

  const getSponsorBanners = (sponsorId) => {
    return banners.filter(banner => banner.createdBy._id === sponsorId);
  };

  const getSponsorStats = (sponsorId) => {
    const sponsorBanners = getSponsorBanners(sponsorId);
    return sponsorBanners.reduce((acc, banner) => ({
      totalBanners: acc.totalBanners + 1,
      totalImpressions: acc.totalImpressions + (banner.impressions || 0),
      totalClicks: acc.totalClicks + (banner.clicks || 0),
      totalBudget: acc.totalBudget + (banner.budget || 0),
      activeBanners: acc.activeBanners + (banner.isActive ? 1 : 0),
    }), {
      totalBanners: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalBudget: 0,
      activeBanners: 0,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredSponsors = sponsors.filter(sponsor =>
    sponsor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sponsor.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Sponsor Management</h1>
          <p className="text-gray-600">Manage sponsor accounts and their banner campaigns</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sponsors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSponsors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBanners}</div>
          </CardContent>
        </Card>

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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Sponsors</CardTitle>
          <CardDescription>Manage sponsor accounts and view their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search sponsors by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredSponsors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sponsors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Try adjusting your search terms.' : 'No sponsors have been created yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sponsor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Banners</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSponsors.map((sponsor) => {
                  const stats = getSponsorStats(sponsor._id);
                  return (
                    <TableRow key={sponsor._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sponsor.name || 'Unnamed Sponsor'}</div>
                          <div className="text-sm text-gray-500">{sponsor.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{sponsor.email}</span>
                          </div>
                          {sponsor.mobile && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{sponsor.mobile}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{stats.totalBanners} total</div>
                          <div className="text-green-600">{stats.activeBanners} active</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{stats.totalImpressions.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{stats.totalClicks.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{formatCurrency(stats.totalBudget)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSponsor(sponsor)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSponsor(sponsor._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sponsor Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sponsor Details</DialogTitle>
            <DialogDescription>
              View detailed information about this sponsor and their campaigns
            </DialogDescription>
          </DialogHeader>
          
          {selectedSponsor && (
            <div className="space-y-6">
              {/* Sponsor Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Sponsor Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm">{selectedSponsor.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm">{selectedSponsor.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm">{selectedSponsor.mobile || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Role</Label>
                      <p className="text-sm">{selectedSponsor.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sponsor Banners */}
              <Card>
                <CardHeader>
                  <CardTitle>Banner Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  {getSponsorBanners(selectedSponsor._id).length === 0 ? (
                    <p className="text-sm text-gray-500">No banner campaigns found for this sponsor.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Placement</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Impressions</TableHead>
                          <TableHead>Clicks</TableHead>
                          <TableHead>CTR</TableHead>
                          <TableHead>Budget</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getSponsorBanners(selectedSponsor._id).map((banner) => (
                          <TableRow key={banner._id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{banner.title}</div>
                                <div className="text-sm text-gray-500">{banner.sponsorName}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{banner.placement}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {banner.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>{banner.impressions.toLocaleString()}</TableCell>
                            <TableCell>{banner.clicks.toLocaleString()}</TableCell>
                            <TableCell>{banner.clickThroughRate.toFixed(2)}%</TableCell>
                            <TableCell>{formatCurrency(banner.budget)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 