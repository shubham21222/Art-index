'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Calendar, 
    MapPin, 
    Users, 
    TrendingUp, 
    Package,
    Plus,
    Settings,
    BarChart3,
    Palette,
    DollarSign
} from 'lucide-react';

const GalleriesDashboard = () => {
    const [stats, setStats] = useState({
        totalArtworks: 0,
        activeShows: 0,
        totalSales: 0,
        totalArtists: 0
    });

    useEffect(() => {
        // Fetch gallery statistics
        setStats({
            totalArtworks: 180,
            activeShows: 3,
            totalSales: 450000,
            totalArtists: 25
        });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Galleries Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage your gallery shows and track sales performance</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
                            <Palette className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalArtworks}</div>
                            <p className="text-xs text-muted-foreground">
                                +12 from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Shows</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeShows}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently running
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                +25% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalArtists}</div>
                            <p className="text-xs text-muted-foreground">
                                +3 from last month
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
                                    <h3 className="font-semibold">Add Artwork</h3>
                                    <p className="text-sm text-gray-600">Add new artwork to inventory</p>
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
                                    <p className="text-sm text-gray-600">Track sales performance</p>
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

                {/* Current Shows */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Shows</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "Contemporary Masters", artist: "Sarah Johnson", endDate: "Mar 25", sales: 85000 },
                                { name: "Abstract Expressions", artist: "Michael Chen", endDate: "Apr 10", sales: 62000 },
                                { name: "Urban Perspectives", artist: "Emma Rodriguez", endDate: "Apr 30", sales: 45000 }
                            ].map((show, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                                            <Palette className="h-6 w-6 text-pink-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{show.name}</h4>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <span>by {show.artist}</span>
                                                <span>•</span>
                                                <span>Ends {show.endDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline">${show.sales.toLocaleString()} Sales</Badge>
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
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

export default GalleriesDashboard; 