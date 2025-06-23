'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Calendar, 
    DollarSign, 
    Users, 
    TrendingUp, 
    Package,
    Plus,
    Settings,
    BarChart3
} from 'lucide-react';

const AuctionsDashboard = () => {
    const [stats, setStats] = useState({
        totalAuctions: 0,
        activeAuctions: 0,
        totalRevenue: 0,
        totalBidders: 0
    });

    useEffect(() => {
        // Fetch auction statistics
        // This would be replaced with actual API calls
        setStats({
            totalAuctions: 12,
            activeAuctions: 3,
            totalRevenue: 125000,
            totalBidders: 450
        });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Auctions Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage your auction listings and track performance</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Auctions</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalAuctions}</div>
                            <p className="text-xs text-muted-foreground">
                                +2 from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Auctions</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeAuctions}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently running
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                +12% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bidders</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalBidders}</div>
                            <p className="text-xs text-muted-foreground">
                                +8% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Plus className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Create New Auction</h3>
                                    <p className="text-sm text-gray-600">Start a new auction listing</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">View Analytics</h3>
                                    <p className="text-sm text-gray-600">Track auction performance</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Settings className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Settings</h3>
                                    <p className="text-sm text-gray-600">Manage account settings</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Auctions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Auctions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                        <div>
                                            <h4 className="font-medium">Modern Art Collection #{item}</h4>
                                            <p className="text-sm text-gray-600">Ended on Dec {item + 10}, 2024</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline">Completed</Badge>
                                        <span className="text-sm font-medium">$12,500</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AuctionsDashboard; 