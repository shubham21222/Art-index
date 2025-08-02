'use client';

import { useState, useEffect } from 'react';
import { BASE_URL } from '../../../config/baseUrl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const PartnershipsAdmin = () => {
    const [partnerships, setPartnerships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [filter, setFilter] = useState('all');
    const [selectedPartnership, setSelectedPartnership] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchPartnerships();
        fetchStats();
    }, [filter]);

    const fetchPartnerships = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = filter === 'all' 
                ? `${BASE_URL}/partnership/all`
                : `${BASE_URL}/partnership/all?status=${filter}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setPartnerships(data.items.partnerships || []);
            }
        } catch (error) {
            console.error('Error fetching partnerships:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/partnership/stats`, {
                headers: {
                    'Authorization': `${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setStats(data.items || {});
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleApprove = async (partnershipId) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/partnership/${partnershipId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchPartnerships();
                fetchStats();
                const data = await response.json();
                const userInfo = data.items.user;
                const message = userInfo.isNewUser 
                    ? 'Partnership approved successfully! New user account created. They will receive a password setup email.'
                    : 'Partnership approved successfully! Existing user account updated.';
                alert(message);
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to approve partnership');
            }
        } catch (error) {
            alert('Error approving partnership');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (partnershipId) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/partnership/${partnershipId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rejectionReason })
            });

            if (response.ok) {
                fetchPartnerships();
                fetchStats();
                setRejectionReason('');
                setSelectedPartnership(null);
                alert('Partnership rejected successfully!');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to reject partnership');
            }
        } catch (error) {
            alert('Error rejecting partnership');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return <Badge className={variants[status]}>{status.toUpperCase()}</Badge>;
    };

    const getPartnershipTypeBadge = (type) => {
        const variants = {
            auctions: 'bg-blue-100 text-blue-800',
            fairs: 'bg-purple-100 text-purple-800',
            museums: 'bg-indigo-100 text-indigo-800',
            galleries: 'bg-pink-100 text-pink-800',
            sponsors: 'bg-orange-100 text-orange-800'
        };
        return <Badge className={variants[type]}>{type.toUpperCase()}</Badge>;
    };

    if (loading) {
        return <div className="p-8">Loading partnerships...</div>;
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Partnership Management</h1>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Requests</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Partnerships List */}
            <div className="space-y-4">
                {partnerships.map((partnership) => (
                    <Card key={partnership._id}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-lg font-semibold">
                                            {partnership.firstName} {partnership.lastName}
                                        </h3>
                                        {getStatusBadge(partnership.status)}
                                        {getPartnershipTypeBadge(partnership.partnershipType)}
                                    </div>
                                    <p className="text-gray-600">{partnership.email}</p>
                                    <p className="text-gray-600">{partnership.phone}</p>
                                    <p className="text-sm text-gray-500">
                                        Location: {partnership.location.toUpperCase()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Submitted: {new Date(partnership.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                {partnership.status === 'pending' && (
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={() => handleApprove(partnership._id)}
                                            disabled={actionLoading}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {actionLoading ? 'Approving...' : 'Approve'}
                                        </Button>
                                        
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    disabled={actionLoading}
                                                    onClick={() => setSelectedPartnership(partnership)}
                                                >
                                                    Reject
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Reject Partnership Request</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <p>Please provide a reason for rejection:</p>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="rejectionReason">Rejection Reason</Label>
                                                        <Textarea
                                                            id="rejectionReason"
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                            placeholder="Enter rejection reason..."
                                                            rows={4}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setRejectionReason('');
                                                                setSelectedPartnership(null);
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => handleReject(partnership._id)}
                                                            disabled={actionLoading}
                                                        >
                                                            {actionLoading ? 'Rejecting...' : 'Reject'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                
                {partnerships.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-gray-500">No partnership requests found.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default PartnershipsAdmin; 