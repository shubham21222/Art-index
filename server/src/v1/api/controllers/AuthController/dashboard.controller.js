import User from "../../models/Auth/User.js";
import SponsorBanner from "../../models/SponsorBanner/sponsorBanner.model.js";
import Partnership from "../../models/Partnership/partnership.model.js";
import { success, onError } from "../../formatters/globalResponse.js";

// Get comprehensive dashboard statistics
export const getDashboardStats = async (req, res, next) => {
  try {
    // Get user statistics by role
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get sponsor banner statistics
    const bannerStats = await SponsorBanner.aggregate([
      {
        $group: {
          _id: null,
          totalBanners: { $sum: 1 },
          activeBanners: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0]
            }
          },
          totalImpressions: { $sum: "$impressions" },
          totalClicks: { $sum: "$clicks" },
          totalBudget: { $sum: "$budget" }
        }
      }
    ]);

    // Get partnership statistics
    const partnershipStats = await Partnership.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly user growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Get recent activities (last 10 users)
    const recentActivities = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get role distribution for charts
    const roleDistribution = userStats.map(stat => ({
      role: stat._id,
      count: stat.count,
      percentage: ((stat.count / totalUsers) * 100).toFixed(1)
    }));

    // Get partnership status distribution
    const partnershipDistribution = partnershipStats.map(stat => ({
      status: stat._id,
      count: stat.count
    }));

    // Calculate banner performance metrics
    const bannerData = bannerStats[0] || {
      totalBanners: 0,
      activeBanners: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalBudget: 0
    };

    const averageCTR = bannerData.totalImpressions > 0 
      ? (bannerData.totalClicks / bannerData.totalImpressions) * 100 
      : 0;

    // Format monthly growth data for charts
    const chartData = monthlyGrowth.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      users: item.count
    }));

    const dashboardData = {
      overview: {
        totalUsers,
        recentUsers,
        totalBanners: bannerData.totalBanners,
        activeBanners: bannerData.activeBanners,
        totalPartnerships: partnershipStats.reduce((sum, stat) => sum + stat.count, 0),
        totalImpressions: bannerData.totalImpressions,
        totalClicks: bannerData.totalClicks,
        totalBudget: bannerData.totalBudget,
        averageCTR: parseFloat(averageCTR.toFixed(2))
      },
      userStats: {
        roleDistribution,
        totalUsers,
        recentUsers
      },
      bannerStats: {
        totalBanners: bannerData.totalBanners,
        activeBanners: bannerData.activeBanners,
        totalImpressions: bannerData.totalImpressions,
        totalClicks: bannerData.totalClicks,
        totalBudget: bannerData.totalBudget,
        averageCTR: parseFloat(averageCTR.toFixed(2))
      },
      partnershipStats: {
        distribution: partnershipDistribution,
        total: partnershipStats.reduce((sum, stat) => sum + stat.count, 0)
      },
      charts: {
        monthlyGrowth: chartData,
        roleDistribution,
        partnershipDistribution
      },
      recentActivities
    };

    return success(res, 'Dashboard statistics retrieved successfully', dashboardData);
  } catch (error) {
    return onError(res, error);
  }
};

// Get real-time dashboard updates
export const getDashboardUpdates = async (req, res, next) => {
  try {
    // Get today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayUsers = await User.countDocuments({
      createdAt: { $gte: today }
    });

    const todayBanners = await SponsorBanner.countDocuments({
      createdAt: { $gte: today }
    });

    const todayPartnerships = await Partnership.countDocuments({
      createdAt: { $gte: today }
    });

    // Get this week's statistics
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekUsers = await User.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    const weekBanners = await SponsorBanner.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    const weekPartnerships = await Partnership.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    const updates = {
      today: {
        users: todayUsers,
        banners: todayBanners,
        partnerships: todayPartnerships
      },
      thisWeek: {
        users: weekUsers,
        banners: weekBanners,
        partnerships: weekPartnerships
      }
    };

    return success(res, 'Dashboard updates retrieved successfully', updates);
  } catch (error) {
    return onError(res, error);
  }
}; 