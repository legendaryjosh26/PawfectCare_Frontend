import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

function DashboardPage() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [pendingAdoptions, setPendingAdoptions] = useState(0);
  const [scheduledAppointments, setScheduledAppointments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const { apiClient, user, token, isTokenChecking, logout } = useAuth();

  useEffect(() => {
    const initPage = async () => {
      if (isTokenChecking) return;
      if (!user || !token) {
        navigate("/admin/login", { replace: true });
        return;
      }
      await fetchDashboardData();
    };
    initPage();
  }, [isTokenChecking, user, token, navigate]);

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

  // NEW PET-THEMED LOADING SCREEN
  if (isTokenChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 transition-opacity duration-300">
        <div className="flex flex-col items-center gap-6 p-8 animate-pulse">
          <div className="w-20 h-20 bg-[#7c5e3b]/20 rounded-2xl flex items-center justify-center mb-4">
            <Loader2 className="h-16 w-16 text-[#7c5e3b] animate-spin drop-shadow-md" />
          </div>
          <div className="space-y-2 text-center">
            <div className="text-xl font-bold text-[#7c5e3b] tracking-wide">
              Preparing Dashboard
            </div>
            <div className="text-lg text-[#7c5e3b]/80">
              Loading PawfectCare stats...
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#7c5e3b]/30 to-transparent rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#7c5e3b] to-amber-500 animate-pulse w-3/4" />
          </div>
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
    { label: "Add Pet", path: "/admin/pet" },
    { label: "Adoptions", path: "/admin/adoption" },
    { label: "Appointments", path: "/admin/appointment" },
    { label: "Messages", path: "/admin/message" },
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
