// src/components/Navigation/TopNavAdmin.jsx
// COMPLETE FINAL VERSION - Full screen width
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OVSLogo from "../../assets/Admin-Page-Image/OVSLogo.png";

function TopNavAdmin({ handleSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Pets", path: "/admin/pet" },
    { name: "Adoptions", path: "/admin/adoption" },
    { name: "Appointments", path: "/admin/appointment" },
    { name: "Messages", path: "/admin/message" },
    { name: "Reports", path: "/admin/reports" },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 mb-8 w-full">
      {/* Top Row: Logo + Title + Sign Out */}
      <div className="w-full px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title Section */}
          <div className="flex items-center space-x-4">
            <img
              className="w-14 h-14 rounded-full shadow-sm ring-2 ring-gray-100"
              src={OVSLogo}
              alt="OVS Logo"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                Tacurong City Veterinary Services
              </h1>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg 
                     shadow-sm hover:bg-red-700 hover:shadow-md transition-all duration-200 
                     active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Bottom Row: Navigation Tabs */}
      <div className="border-t border-gray-100 w-full">
        <nav className="px-8">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              return (
                <button
                  key={tab.name}
                  onClick={() => navigate(tab.path)}
                  className={`
                    relative px-6 py-4 text-sm font-medium whitespace-nowrap
                    transition-all duration-200 focus:outline-none
                    ${
                      isActive
                        ? "text-[#560705] border-b-2 border-[#560705]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  {tab.name}
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#560705]" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default TopNavAdmin;
