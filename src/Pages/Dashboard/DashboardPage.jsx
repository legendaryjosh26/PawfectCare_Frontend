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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-1">
            Loading Dashboard...
          </p>
          <p className="text-sm text-gray-500">Fetching stats</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Loading Error
          </h2>
          <p className="text-gray-600 mb-8">{pageError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2.5 bg-[#560705] text-white rounded-lg font-medium text-sm hover:bg-opacity-90"
            >
              Retry
            </button>
            <button
              onClick={logout}
              className="px-6 py-2.5 bg-gray-100 text-gray-900 rounded-lg font-medium text-sm border hover:bg-gray-200"
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
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-900",
      iconColor: "text-indigo-600",
    },
    {
      title: "Adoptions",
      value: pendingAdoptions,
      icon: "🐾",
      desc: "Pending",
      bgColor: "bg-amber-50",
      textColor: "text-amber-900",
      iconColor: "text-amber-600",
    },
    {
      title: "Appointments",
      value: scheduledAppointments,
      icon: "📅",
      desc: "Upcoming",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-900",
      iconColor: "text-emerald-600",
    },
  ];

  const quickActions = [
    { label: "Add Pet", path: "/admin/pets/new" },
    { label: "Adoptions", path: "/admin/adoptions" },
    { label: "Appointments", path: "/admin/appointments" },
    { label: "Messages", path: "/admin/messages" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto">
        <TopNavAdmin handleSignOut={logout} />

        {/* Page Header with Stats - Matching AppointmentPage */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Admin Dashboard
                </h2>
                <p className="text-sm text-gray-600">
                  PawfectCare overview & quick actions
                </p>
              </div>
            </div>

            {/* Stats - Exact match to AppointmentPage sizing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`${stat.bgColor} rounded-lg p-4 border`}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold {stat.textColor}">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className="w-full h-12 bg-[#560705] text-white rounded-lg font-medium text-sm hover:bg-[#703736] hover:shadow-md transition-all flex items-center justify-center"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="px-6 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              📋
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Recent Activity
            </h4>
            <p className="text-sm text-gray-500">No recent activity found</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
