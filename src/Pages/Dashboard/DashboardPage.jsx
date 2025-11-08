// src/pages/admin/DashboardPage.jsx
// COMPLETE VERSION - Matches your screenshot design with full width
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import { getApiBaseUrl } from "../../../../Backend/config/API_BASE_URL";

function DashboardPage() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [pendingAdoptions, setPendingAdoptions] = useState(0);
  const [scheduledAppointments, setScheduledAppointments] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [users, adoptions, appts] = await Promise.all([
          fetchWithAuth(`${getApiBaseUrl()}/dashboard/user/count`),
          fetchWithAuth(`${getApiBaseUrl()}/dashboard/user/adoption/count`),
          fetchWithAuth(`${getApiBaseUrl()}/dashboard/user/appointment/count`),
        ]);
        setUserCount(users.count || 0);
        setPendingAdoptions(adoptions.count || 0);
        setScheduledAppointments(appts.count || 0);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: userCount,
      icon: "👥",
      description: "Registered users",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      textColor: "text-gray-900",
    },
    {
      title: "Adoption Requests",
      value: pendingAdoptions,
      icon: "🐾",
      description: "Pending requests",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      textColor: "text-gray-900",
    },
    {
      title: "Scheduled Appointments",
      value: scheduledAppointments,
      icon: "📅",
      description: "Upcoming appointments",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-gray-900",
    },
  ];

  const quickActions = [
    {
      label: "Add New Pet",
      path: "/admin/pet",
      color: "bg-[#560705] hover:bg-[#703736]",
      textColor: "text-white",
    },
    {
      label: "View Adoptions",
      path: "/admin/adoption",
      color: "bg-orange-500 hover:bg-orange-600",
      textColor: "text-white",
    },
    {
      label: "Manage Appointments",
      path: "/admin/appointment",
      color: "bg-green-600 hover:bg-green-700",
      textColor: "text-white",
    },
    {
      label: "Check Messages",
      path: "/admin/message",
      color: "bg-blue-600 hover:bg-blue-700",
      textColor: "text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto">
        <TopNavAdmin handleSignOut={handleSignOut} />

        {/* Main Content Container */}
        <div className="px-8 pb-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Overview
            </h2>
            <p className="text-gray-600">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {loading
              ? // Loading Skeletons
                Array(3)
                  .fill(0)
                  .map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                          <div className="h-10 bg-gray-200 rounded w-20 mb-3"></div>
                          <div className="h-3 bg-gray-200 rounded w-28"></div>
                        </div>
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  ))
              : stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className={`${stat.bgColor} rounded-xl shadow-sm border border-gray-100 p-6 
                           hover:shadow-md transition-shadow duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-3">
                          {stat.title}
                        </p>
                        <h3
                          className={`text-5xl font-bold ${stat.textColor} mb-2`}
                        >
                          {stat.value}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {stat.description}
                        </p>
                      </div>
                      <div
                        className={`${stat.iconBg} ${stat.iconColor} p-4 rounded-full`}
                      >
                        <span className="text-3xl">{stat.icon}</span>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {/* Quick Actions Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className={`${action.color} ${action.textColor} px-6 py-4 rounded-lg 
                            font-semibold text-sm shadow-sm transition-all duration-200 
                            active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Recent Activity
            </h3>
            <div className="text-center py-12">
              <p className="text-gray-500">No recent activity to display</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
