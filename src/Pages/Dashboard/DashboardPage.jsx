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

  const handleRefreshToken = useCallback(async () => {
    if (!apiClient) return;

    try {
      const refreshRes = await apiClient.post(
        "/users/refresh-token",
        {},
        { withCredentials: true }
      );
      setToken(refreshRes.data.access_token);
      console.log("✅ Dashboard refresh token success");
      return true;
    } catch (refreshErr) {
      console.error("❌ Dashboard refresh failed:", refreshErr);
      logout();
      return false;
    }
  }, [apiClient, setToken, logout]);

  useEffect(() => {
    const initPage = async () => {
      if (isTokenChecking) return;
      if (!user || !token) {
        navigate("/admin/login", { replace: true });
        return;
      }
      const refreshed = await handleRefreshToken();
      if (!refreshed) return;
      await fetchDashboardData();
    };
    initPage();
  }, [isTokenChecking, user, token, handleRefreshToken, navigate]);

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

  if (isTokenChecking || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#560705] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-lg font-semibold text-gray-700">Loading...</p>
          <p className="text-sm text-gray-500 mt-1">Fetching data</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{pageError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-[#560705] text-white rounded-xl text-sm font-medium hover:opacity-90"
            >
              Retry
            </button>
            <button
              onClick={logout}
              className="px-6 py-2 bg-gray-200 text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-300"
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
      title: "Users",
      value: userCount,
      icon: "👥",
      desc: "Registered",
      bgColor: "from-indigo-50 to-purple-50",
      iconBg: "from-indigo-100 to-purple-100",
      textColor: "text-indigo-900",
    },
    {
      title: "Adoptions",
      value: pendingAdoptions,
      icon: "🐾",
      desc: "Pending",
      bgColor: "from-amber-50 to-orange-50",
      iconBg: "from-amber-100 to-orange-100",
      textColor: "text-amber-900",
    },
    {
      title: "Appointments",
      value: scheduledAppointments,
      icon: "📅",
      desc: "Upcoming",
      bgColor: "from-emerald-50 to-teal-50",
      iconBg: "from-emerald-100 to-teal-100",
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
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      label: "Messages",
      path: "/admin/messages",
      color: "bg-blue-500 hover:bg-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <TopNavAdmin handleSignOut={logout} />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-600">PawfectCare admin overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <h2 className={`text-2xl font-bold ${stat.textColor} mt-1`}>
                    {stat.value.toLocaleString()}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">{stat.desc}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <span className="text-xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className={`${action.color} text-white rounded-xl py-3 px-4 text-sm font-medium hover:opacity-90 active:scale-95 transition-all h-full`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            Recent Activity <span className="text-xs text-gray-500">(24h)</span>
          </h3>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              📋
            </div>
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
