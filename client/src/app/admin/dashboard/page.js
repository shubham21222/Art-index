"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Globe, 
  Building2, 
  Palette,
  Megaphone,
  Handshake,
  Activity,
  Calendar,
  RefreshCw
} from "lucide-react";
import { 
  BarChart, 
  PieChart, 
  LineChart, 
  MetricCard 
} from "@/components/ui/chart";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overview: {
      totalUsers: 0,
      recentUsers: 0,
      totalBanners: 0,
      activeBanners: 0,
      totalPartnerships: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalBudget: 0,
      averageCTR: 0
    },
    userStats: {
      roleDistribution: [],
      totalUsers: 0,
      recentUsers: 0
    },
    bannerStats: {
      totalBanners: 0,
      activeBanners: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalBudget: 0,
      averageCTR: 0
    },
    partnershipStats: {
      distribution: [],
      total: 0
    },
    charts: {
      monthlyGrowth: [],
      roleDistribution: [],
      partnershipDistribution: []
    },
    recentActivities: []
  });

  const [updates, setUpdates] = useState({
    today: { users: 0, banners: 0, partnerships: 0 },
    thisWeek: { users: 0, banners: 0, partnerships: 0 }
  });

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/dashboard/stats`, {
        headers: {
          Authorization: token,
        },
      });
      const data = await response.json();
      
      if (data.status && data.items) {
        setStats(data.items);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real-time updates
  const fetchUpdates = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/dashboard/updates`, {
        headers: {
          Authorization: token,
        },
      });
      const data = await response.json();
      
      if (data.status && data.items) {
        setUpdates(data.items);
      }
    } catch (error) {
      console.error("Error fetching updates:", error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchUpdates();
    
    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardStats();
      fetchUpdates();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Format data for charts
  const formatMonthlyGrowthData = () => {
    return stats.charts.monthlyGrowth.map(item => ({
      label: item.month,
      value: item.users
    }));
  };

  const formatRoleDistributionData = () => {
    return stats.userStats.roleDistribution.map(item => ({
      label: item.role,
      value: item.count
    }));
  };

  const formatPartnershipDistributionData = () => {
    return stats.partnershipStats.distribution.map(item => ({
      label: item.status,
      value: item.count
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-zinc-400 mt-2">
            Welcome back, {user?.name || "Admin"} • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => {
            fetchDashboardStats();
            fetchUpdates();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={stats.overview.totalUsers.toLocaleString()}
          change={12}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Active Banners"
          value={stats.overview.activeBanners}
          change={8}
          icon={Megaphone}
          color="green"
        />
        <MetricCard
          title="Total Impressions"
          value={stats.overview.totalImpressions.toLocaleString()}
          change={15}
          icon={Eye}
          color="purple"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${stats.overview.totalBudget.toLocaleString()}`}
          change={25}
          icon={DollarSign}
          color="orange"
        />
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
                         <CardTitle className="text-white text-lg">Today&apos;s Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-zinc-300">New Users</span>
                </div>
                <span className="text-white font-semibold">{updates.today.users}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-green-400" />
                  <span className="text-zinc-300">New Banners</span>
                </div>
                <span className="text-white font-semibold">{updates.today.banners}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-orange-400" />
                  <span className="text-zinc-300">Partnerships</span>
                </div>
                <span className="text-white font-semibold">{updates.today.partnerships}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-zinc-300">New Users</span>
                </div>
                <span className="text-white font-semibold">{updates.thisWeek.users}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-green-400" />
                  <span className="text-zinc-300">New Banners</span>
                </div>
                <span className="text-white font-semibold">{updates.thisWeek.banners}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-orange-400" />
                  <span className="text-zinc-300">Partnerships</span>
                </div>
                <span className="text-white font-semibold">{updates.thisWeek.partnerships}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Banner Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-purple-400" />
                  <span className="text-zinc-300">Total Clicks</span>
                </div>
                <span className="text-white font-semibold">{stats.overview.totalClicks.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-zinc-300">CTR</span>
                </div>
                <span className="text-white font-semibold">{stats.overview.averageCTR.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-zinc-300">Total Banners</span>
                </div>
                <span className="text-white font-semibold">{stats.overview.totalBanners}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly User Growth */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Monthly User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={formatMonthlyGrowthData()} 
              width={400} 
              height={300} 
              color="#3b82f6"
            />
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={formatRoleDistributionData()} 
              width={300} 
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Partnership Status */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Partnership Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-2xl">
            <BarChart 
              data={formatPartnershipDistributionData()} 
              width={600} 
              height={200} 
              color="#f59e0b"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-700 rounded-full">
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {activity.name} ({activity.email})
                      </p>
                      <p className="text-zinc-400 text-sm">
                        Joined as {activity.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400 text-sm">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-400">No recent activities</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 