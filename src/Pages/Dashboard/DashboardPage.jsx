import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin"; // ✅ Verify path
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

function DashboardPage() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [pendingAdoptions, setPendingAdoptions] = useState(0);
  const [scheduledAppointments, setScheduledAppointments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { apiClient, user, isTokenChecking, logout } = useAuth();

  // Auth Guard - Redirect if not admin
  useEffect(() => {
    if (!isTokenChecking && (!user || user.role !== "admin")) {
      navigate("/admin/login", { replace: true });
      return;
    }
  }, [user, isTokenChecking, navigate]);

  const fetchDashboardData = useCallback(async () => {
    if (!apiClient || !user) return;

    try {
      setLoading(true);
      setError(null);

      const [usersRes, adoptionsRes, apptsRes] = await Promise.all([
        apiClient.get("/dashboard/user/count"),
        apiClient.get("/dashboard/user/adoption/count"),
        apiClient.get("/dashboard/user/appointment/count"),
      ]);

      setUserCount(usersRes.data.count || 0);
      setPendingAdoptions(adoptionsRes.data.count || 0);
      setScheduledAppointments(apptsRes.data.count || 0);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [apiClient, user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = [
    {
      title: "Total Users",
      value: userCount,
      icon: "👥",
      description: "Registered users",
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
      iconBg: "bg-gradient-to-r from-indigo-100 to-purple-100",
      textColor: "text-indigo-900",
    },
    {
      title: "Pending Adoptions",
      value: pendingAdoptions,
      icon: "🐾",
      description: "Requests awaiting approval",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      iconBg: "bg-gradient-to-r from-amber-100 to-orange-100",
      textColor: "text-amber-900",
    },
    {
      title: "Appointments",
      value: scheduledAppointments,
      icon: "📅",
      description: "Upcoming bookings",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
      iconBg: "bg-gradient-to-r from-emerald-100 to-teal-100",
      textColor: "text-emerald-900",
    },
  ];

  const quickActions = [
    {
      label: "Add Pet",
      path: "/admin/pets/new",
      color: "bg-[#560705] hover:bg-[#703736]",
    },
    {
      label: "Adoptions",
      path: "/admin/adoptions",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      label: "Appointments",
      path: "/admin/appointments",
      color: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      label: "Messages",
      path: "/admin/messages",
      color: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  // Loading State
  if (isTokenChecking || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 bg-gradient-to-r from-[#560705] to-[#703736] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-3xl">📊</span>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-white/50 backdrop-blur-sm rounded-xl w-48 mx-auto mb-3"></div>
            <div className="text-lg font-medium text-gray-700">
              Loading Dashboard...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-3">
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2.5 bg-[#560705] text-white rounded-xl font-semibold hover:bg-[#703736] transition"
            >
              Retry
            </button>
            <button
              onClick={logout}
              className="px-6 py-2.5 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Welcome back! Here's what's happening with PawfectCare.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition text-sm font-medium text-gray-700">
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.bgColor} group rounded-2xl p-8 shadow-sm border border-white/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent -skew-x-12 -translate-x-8 group-hover:translate-x-0 transition-transform duration-500" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <div className="space-y-1">
                    <h2
                      className={`text-4xl lg:text-5xl font-bold ${stat.textColor}`}
                    >
                      {stat.value.toLocaleString()}
                    </h2>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                  </div>
                </div>
                <div
                  className={`${stat.iconBg} p-4 rounded-2xl shadow-lg backdrop-blur-sm flex-shrink-0`}
                >
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className={`${action.color} text-white px-8 py-6 rounded-2xl font-semibold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 group relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-opacity" />
                <span className="relative z-10">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500 mt-1">Last 24 hours</p>
          </div>
          <div className="p-8 text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              📋
            </div>
            <p className="text-gray-500 text-lg">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">
              Check back soon for updates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
