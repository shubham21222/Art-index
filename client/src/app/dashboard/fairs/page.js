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
    Globe
} from 'lucide-react';

const FairsDashboard = () => {
    const [stats, setStats] = useState({
        totalFairs: 0,
        upcomingFairs: 0,
        totalExhibitors: 0,
        totalVisitors: 0
    });

    useEffect(() => {
        // Fetch fair statistics
        setStats({
            totalFairs: 8,
            upcomingFairs: 2,
            totalExhibitors: 120,
            totalVisitors: 2500
        });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Fairs Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage your art fairs and track attendance</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fairs</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalFairs}</div>
                            <p className="text-xs text-muted-foreground">
                                +1 from last year
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Fairs</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.upcomingFairs}</div>
                            <p className="text-xs text-muted-foreground">
                                Next 3 months
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Exhibitors</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalExhibitors}</div>
                            <p className="text-xs text-muted-foreground">
                                +15% from last year
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalVisitors.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                +22% from last year
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
                                    <h3 className="font-semibold">Create New Fair</h3>
                                    <p className="text-sm text-gray-600">Plan a new art fair event</p>
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
                                    <p className="text-sm text-gray-600">Track fair performance</p>
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

                {/* Upcoming Fairs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Fairs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "Spring Art Fair 2024", location: "New York", date: "Mar 15-20", exhibitors: 45 },
                                { name: "Contemporary Art Expo", location: "Los Angeles", date: "Apr 10-15", exhibitors: 38 }
                            ].map((fair, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{fair.name}</h4>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                <span>{fair.location}</span>
                                                <span>•</span>
                                                <span>{fair.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline">{fair.exhibitors} Exhibitors</Badge>
                                        <Badge className="bg-green-100 text-green-800">Upcoming</Badge>
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

export default FairsDashboard; 