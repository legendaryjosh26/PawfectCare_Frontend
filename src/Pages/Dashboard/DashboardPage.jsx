import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

function DashboardPage() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [pendingAdoptions, setPendingAdoptions] = useState(0);
  const [scheduledAppointments, setScheduledAppointments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const { apiClient, user, token, isTokenChecking, logout, setToken } =
    useAuth();

  // 🔄 REFRESH TOKEN HANDLING + AUTH GUARD
  const handleRefreshToken = useCallback(async () => {
    if (!apiClient) return;

    try {
      const refreshRes = await apiClient.post(
        "/users/refresh-token",
        {},
        {
          withCredentials: true,
        }
      );

      const newAccessToken = refreshRes.data.access_token;
      setToken(newAccessToken);

      console.log("✅ Dashboard refresh token success");
      return true;
    } catch (refreshErr) {
      console.error("❌ Dashboard refresh failed:", refreshErr);
      logout();
      return false;
    }
  }, [apiClient, setToken, logout]);

  // Protect route + auto-refresh
  useEffect(() => {
    const initPage = async () => {
      // 1. Wait for auth check
      if (isTokenChecking) return;

      // 2. No user/token → redirect
      if (!user || !token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      // 3. Auto-refresh token if stale
      const refreshed = await handleRefreshToken();
      if (!refreshed) return;

      // 4. Load dashboard data
      await fetchDashboardData();
    };

    initPage();
  }, [isTokenChecking, user, token, handleRefreshToken, navigate]);

  // Load dashboard data with fallback
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setPageError(null);

      const [usersRes, adoptionsRes, apptsRes] = await Promise.all([
        apiClient
          .get("/dashboard/user/count")
          .catch(() => ({ data: { count: 0 } })),
        apiClient
          .get("/dashboard/user/adoption/count")
          .catch(() => ({ data: { count: 0 } })),
        apiClient
          .get("/dashboard/user/appointment/count")
          .catch(() => ({ data: { count: 0 } })),
      ]);

      setUserCount(usersRes.data.count || 0);
      setPendingAdoptions(adoptionsRes.data.count || 0);
      setScheduledAppointments(apptsRes.data.count || 0);
    } catch (err) {
      console.error("Dashboard data error:", err);
      setPageError("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  // Loading screen
  if (isTokenChecking || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-8">
        <div className="max-w-sm w-full text-center animate-pulse">
          <div className="w-24 h-24 bg-gradient-to-r from-[#560705] to-[#703736] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-4xl">📊</span>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gradient-to-r from-[#560705]/20 to-[#703736]/20 rounded-2xl w-48 mx-auto mb-4 backdrop-blur-sm"></div>
            <p className="text-xl font-semibold text-gray-700">
              Loading Dashboard...
            </p>
            <p className="text-sm text-gray-500">
              Authenticating and fetching data
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error screen
  if (pageError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center border-4 border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Loading Issue
          </h2>
          <p className="text-gray-600 mb-8">{pageError}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchDashboardData}
              className="px-8 py-3 bg-gradient-to-r from-[#560705] to-[#703736] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Retry
            </button>
            <button
              onClick={logout}
              className="px-8 py-3 bg-gray-100 text-gray-900 rounded-2xl font-semibold shadow-lg hover:shadow-md transition-all border"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: userCount,
      icon: "👥",
      description: "Registered pet owners",
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
      iconBg: "bg-gradient-to-r from-indigo-100 to-purple-100",
      iconColor: "text-indigo-600",
      textColor: "text-indigo-900",
    },
    {
      title: "Pending Adoptions",
      value: pendingAdoptions,
      icon: "🐾",
      description: "Awaiting approval",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      iconBg: "bg-gradient-to-r from-amber-100 to-orange-100",
      iconColor: "text-amber-600",
      textColor: "text-amber-900",
    },
    {
      title: "Appointments",
      value: scheduledAppointments,
      icon: "📅",
      description: "Upcoming bookings",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
      iconBg: "bg-gradient-to-r from-emerald-100 to-teal-100",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-900",
    },
  ];

  const quickActions = [
    {
      label: "Add New Pet",
      path: "/admin/pets/new",
      color:
        "bg-gradient-to-r from-[#560705] to-[#703736] hover:from-[#703736] hover:to-[#560705]",
    },
    {
      label: "View Adoptions",
      path: "/admin/adoptions",
      color:
        "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
    },
    {
      label: "Appointments",
      path: "/admin/appointments",
      color:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
    },
    {
      label: "Messages",
      path: "/admin/messages",
      color:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <TopNavAdmin handleSignOut={logout} />

        <div className="pt-12 pb-16">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 bg-clip-text text-transparent mb-4">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Welcome back! Manage PawfectCare operations with real-time
              insights.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`${stat.bgColor} group relative rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/20 to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <div>
                      <h2
                        className={`text-4xl lg:text-5xl font-black ${stat.textColor} mb-1`}
                      >
                        {stat.value.toLocaleString()}
                      </h2>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`${stat.iconBg} ${stat.iconColor} p-5 rounded-2xl shadow-lg backdrop-blur-sm shrink-0 ml-4`}
                  >
                    <span className="text-3xl">{stat.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className={`${action.color} text-white group relative overflow-hidden rounded-3xl p-8 shadow-2xl hover:shadow-3xl active:scale-[0.98] transition-all duration-300 font-semibold text-lg`}
                >
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm scale-110 group-hover:scale-100 transition-transform" />
                  <span className="relative z-10">{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                Recent Activity{" "}
                <span className="text-sm text-gray-500 font-normal">
                  (Last 24h)
                </span>
              </h3>
            </div>
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 opacity-60">
                📋
              </div>
              <h4 className="text-xl font-semibold text-gray-600 mb-2">
                No recent activity
              </h4>
              <p className="text-gray-500">
                Check back soon for updates and notifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
