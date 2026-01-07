import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PawfectCareLogo from "../../assets/User-Page-Image/PawfectCareLogo.svg";
import { ChevronDown, LogOut, Bell, X } from "lucide-react";
import { useAuth } from "../ServiceLayer/Context/authContext";

const TopNavUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  const dropdownRef = useRef(null);
  const { user, setUser, apiClient, logout, isTokenChecking } = useAuth();

  const delayedNavigate = (path) => {
    setLoading(true);
    setTimeout(() => {
      navigate(path);
      setIsDropdownOpen(false);
      setIsNotifOpen(false);
      setLoading(false);
    }, 200);
  };

  const isGuest = !user?.first_name && !user?.last_name;
  const isActive = (path) => location.pathname === path;

  const formatName = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
    let formattedTime = "";
    if (timeStr) {
      const [h, m, s] = timeStr.split(":").map(Number);
      const t = new Date();
      t.setHours(h, m ?? 0, s ?? 0, 0);
      formattedTime = t.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return formattedTime
      ? `${formattedDate} at ${formattedTime}`
      : formattedDate;
  };

  // Fetch user info
  useEffect(() => {
    if (isTokenChecking) return;
    if (!user) {
      apiClient
        .get("/users/me")
        .then((response) => setUser(response.data.value || response.data))
        .catch(() => setUser(null));
    }
  }, [user, apiClient, setUser, isTokenChecking]);

  // Stable fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return 0;
    try {
      setNotifLoading(true);
      const res = await apiClient.get("/users/notification");
      const all = res.data.notifications || [];
      setNotifications(all);
      return all.length;
    } catch (e) {
      setNotifications([]);
      return 0;
    } finally {
      setNotifLoading(false);
    }
  }, [user, apiClient]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications().then(setUnreadCount);
  }, [fetchNotifications]);

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mobile scroll lock
  useEffect(() => {
    if (isDropdownOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsNotifOpen(false);
  };

  const toggleNotifications = async () => {
    const willOpen = !isNotifOpen;
    setIsNotifOpen(willOpen);
    if (willOpen) {
      setUnreadCount(0);
      await fetchNotifications();
    }
  };

  const showBadge = unreadCount > 0;

  const handleOpenNotifModal = (notif) => {
    setSelectedNotif(notif);
    setIsNotifModalOpen(true);
  };

  const handleCloseNotifModal = () => {
    setIsNotifModalOpen(false);
    setSelectedNotif(null);
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseNotifModal();
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full flex items-center justify-between px-4 py-3 md:px-10 md:py-4 z-50 bg-white border-b border-amber-100 caret-transparent">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer flex-shrink-0"
          onClick={() => delayedNavigate("/user/about")}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#7c5e3b] rounded-full flex items-center justify-center shadow-md">
            <img
              src={PawfectCareLogo}
              alt="Pawfect Care Logo"
              className="w-6 h-6 md:w-7 md:h-7 filter brightness-0 invert"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl md:text-2xl font-bold text-[#7c5e3b] leading-none">
              Pawfect Care
            </span>
            <span className="text-xs text-amber-600 hidden md:block">
              Pet Adoption & Care
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-grow justify-center gap-8 lg:gap-12 text-sm font-medium max-w-2xl">
          <button
            onClick={() => delayedNavigate("/user/about")}
            className={`relative px-6 py-3 rounded-full font-bold text-base transition-all duration-300 hover:scale-105 group ${
              isActive("/user/about")
                ? "bg-gradient-to-r from-[#7c5e3b] to-[#8b6f47] text-white shadow-lg"
                : "text-gray-700 hover:text-[#7c5e3b] hover:bg-amber-50 hover:shadow-md"
            }`}
          >
            About Us
            {isActive("/user/about") && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-amber-400 rounded-full animate-bounce shadow-lg" />
            )}
          </button>
          <button
            onClick={() => delayedNavigate("/user/adoption")}
            className={`relative px-6 py-3 rounded-full font-bold text-base transition-all duration-300 hover:scale-105 group ${
              isActive("/user/adoption")
                ? "bg-gradient-to-r from-[#7c5e3b] to-[#8b6f47] text-white shadow-lg"
                : "text-gray-700 hover:text-[#7c5e3b] hover:bg-amber-50 hover:shadow-md"
            }`}
          >
            Adoption
            {isActive("/user/adoption") && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-amber-400 rounded-full animate-bounce shadow-lg" />
            )}
          </button>
          <button
            onClick={() => delayedNavigate("/user/booking")}
            className={`relative px-6 py-3 rounded-full font-bold text-base transition-all duration-300 hover:scale-105 group ${
              isActive("/user/booking")
                ? "bg-gradient-to-r from-[#7c5e3b] to-[#8b6f47] text-white shadow-lg"
                : "text-gray-700 hover:text-[#7c5e3b] hover:bg-amber-50 hover:shadow-md"
            }`}
          >
            Book
            {isActive("/user/booking") && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-amber-400 rounded-full animate-bounce shadow-lg" />
            )}
          </button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Desktop Notifications */}
          {!isGuest && (
            <div className="hidden md:block relative group">
              <button
                onClick={toggleNotifications}
                className="p-3 rounded-2xl border-2 border-amber-200 hover:bg-amber-50 hover:border-amber-300 hover:shadow-md transition-all duration-200 relative"
              >
                <Bell className="h-5 w-5 text-[#7c5e3b] group-hover:scale-110 transition-transform" />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-xs font-bold text-white rounded-full shadow-lg border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 max-h-96 bg-white/95 backdrop-blur-md border border-amber-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                  {/* Desktop notifications content here - simplified */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-[#7c5e3b] mb-4">
                      Notifications
                    </h3>
                    {notifLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Bell className="h-16 w-16 mx-auto mb-4 opacity-50 text-amber-300" />
                        <p className="text-lg">No notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={`${n.type}-${n.id}`}
                          className="p-4 hover:bg-amber-50 rounded-2xl mb-2 cursor-pointer transition-colors"
                          onClick={() => handleOpenNotifModal(n)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#7c5e3b] rounded-xl flex items-center justify-center flex-shrink-0">
                              {n.type === "appointment" ? "📅" : "🐾"}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-[#7c5e3b]">
                                {n.type === "appointment"
                                  ? `Appointment (${n.appointment_type})`
                                  : "Adoption Request"}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {formatDateTime(
                                  n.appointment_date || n.dateRequested,
                                  n.timeSchedule
                                )}
                              </p>
                              <p className="text-xs font-medium text-amber-700 mt-1">
                                Status: {n.review || n.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-4 py-3 md:px-6 md:py-3 bg-white/80 backdrop-blur-sm border-2 border-amber-200 hover:border-amber-300 rounded-2xl hover:shadow-lg transition-all group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#7c5e3b] to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg drop-shadow-md">
                  {user?.first_name?.charAt(0) || "G"}
                </span>
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <span className="font-semibold text-gray-900 text-sm block leading-tight">
                  {formatName(user?.first_name || "Guest")}
                </span>
                <span className="text-xs text-gray-600 font-medium">Menu</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-600 group-hover:text-[#7c5e3b] transition-colors ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <>
                {/* Mobile Backdrop */}
                <div
                  className="fixed inset-0 z-[59] bg-black/30 backdrop-blur-sm md:hidden"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsNotifOpen(false);
                  }}
                />

                {/* Main Dropdown */}
                <div className="fixed md:static md:absolute md:right-0 md:top-full md:mt-3 w-96 md:w-80 lg:w-72 max-h-[85vh] md:max-h-96 bg-white/95 backdrop-blur-lg border border-amber-200/50 shadow-2xl ring-1 ring-black/10 rounded-3xl overflow-hidden z-[60] md:right-0 animate-in slide-in-from-top-4 fade-in duration-200 md:rounded-2xl">
                  {/* Profile Header */}
                  {!isGuest && (
                    <div className="p-6 bg-gradient-to-b from-amber-50/80 to-white/50 border-b border-amber-100/50 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#7c5e3b] to-amber-600 rounded-2xl flex items-center justify-center shadow-xl">
                          <span className="text-white font-bold text-xl drop-shadow-lg">
                            {user?.first_name?.charAt(0)}
                            {user?.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-xl text-gray-900 leading-tight">
                            {formatName(
                              `${user?.first_name} ${user?.last_name}`
                            )}
                          </p>
                          <p className="text-sm text-gray-600 font-medium">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications Section */}
                  {!isGuest && (
                    <div className="p-6 border-b border-amber-100/50">
                      <div className="flex items-center justify-between mb-5 pb-3 border-b border-amber-100/30">
                        <h3 className="font-bold text-xl text-[#7c5e3b] flex items-center gap-2">
                          <Bell className="h-6 w-6" />
                          Notifications
                        </h3>
                        {showBadge && (
                          <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-xl shadow-lg">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={toggleNotifications}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-amber-300/50 hover:border-amber-400 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-25 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02]"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-[#7c5e3b] to-amber-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <Bell className="h-7 w-7 text-white drop-shadow-md" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-lg text-gray-900 leading-tight">
                            View Notifications
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notifLoading
                              ? "Loading..."
                              : notifications.length === 0
                              ? "No new notifications"
                              : `${notifications.length} total`}
                          </p>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-500 transition-transform ${
                            isNotifOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Inline Notifications List */}
                      {isNotifOpen && (
                        <div className="mt-6 max-h-64 overflow-y-auto rounded-2xl border border-amber-100/50 bg-white/90 backdrop-blur-sm shadow-inner">
                          {notifLoading ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                              <p className="mt-3">Loading notifications...</p>
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                              <Bell className="h-16 w-16 mx-auto mb-4 opacity-40 text-amber-300" />
                              <p className="text-lg font-medium text-gray-600">
                                No notifications yet
                              </p>
                              <p className="text-sm mt-1">
                                You'll see updates here
                              </p>
                            </div>
                          ) : (
                            notifications.slice(0, 4).map((n) => (
                              <div
                                key={`${n.type}-${n.id}`}
                                className="p-5 border-b border-amber-50/50 last:border-b-0 hover:bg-amber-50/70 cursor-pointer transition-all hover:scale-[1.01] first:rounded-t-xl last:rounded-b-xl"
                                onClick={() => handleOpenNotifModal(n)}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="w-12 h-12 bg-gradient-to-r from-[#7c5e3b] to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                    {n.type === "appointment" ? "📅" : "🐾"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[#7c5e3b] text-base leading-tight">
                                      {n.type === "appointment"
                                        ? `Appointment (${n.appointment_type})`
                                        : "Adoption Request"}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-2 leading-tight">
                                      {formatDateTime(
                                        n.appointment_date || n.dateRequested,
                                        n.timeSchedule
                                      )}
                                    </p>
                                    <p className="inline-flex items-center gap-2 px-3 py-1 mt-2 bg-amber-100/50 text-xs font-bold text-amber-800 rounded-full">
                                      {n.review || n.status}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                          {notifications.length > 4 && (
                            <div className="p-4 text-center border-t border-amber-100/50">
                              <button className="text-amber-600 hover:text-amber-700 font-medium text-sm">
                                View all ({notifications.length})
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Links */}
                  <nav className="p-2 pt-0">
                    <button
                      onClick={() => delayedNavigate("/user/about")}
                      className={`w-full px-6 py-5 text-left font-bold text-lg rounded-2xl mx-2 mb-3 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] flex items-center gap-3 ${
                        isActive("/user/about")
                          ? "bg-gradient-to-r from-[#7c5e3b]/20 to-amber-500/20 text-[#7c5e3b] border-2 border-amber-200 shadow-amber-200/50"
                          : "text-gray-700 hover:text-[#7c5e3b] hover:bg-amber-50/80 border-transparent"
                      }`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        🏠
                      </div>
                      About Us
                    </button>

                    <button
                      onClick={() => delayedNavigate("/user/adoption")}
                      className={`w-full px-6 py-5 text-left font-bold text-lg rounded-2xl mx-2 mb-3 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] flex items-center gap-3 ${
                        isActive("/user/adoption")
                          ? "bg-gradient-to-r from-[#7c5e3b]/20 to-amber-500/20 text-[#7c5e3b] border-2 border-amber-200 shadow-amber-200/50"
                          : "text-gray-700 hover:text-[#7c5e3b] hover:bg-amber-50/80 border-transparent"
                      }`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        🐶
                      </div>
                      Adoption
                    </button>

                    <button
                      onClick={() => delayedNavigate("/user/booking")}
                      className={`w-full px-6 py-5 text-left font-bold text-lg rounded-2xl mx-2 mb-6 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] flex items-center gap-3 ${
                        isActive("/user/booking")
                          ? "bg-gradient-to-r from-[#7c5e3b]/20 to-amber-500/20 text-[#7c5e3b] border-2 border-amber-200 shadow-amber-200/50"
                          : "text-gray-700 hover:text-[#7c5e3b] hover:bg-amber-50/80 border-transparent"
                      }`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        📅
                      </div>
                      Book Appointment
                    </button>
                  </nav>

                  {/* Footer */}
                  <div className="p-6 pt-0 border-t border-amber-100/50">
                    {isGuest ? (
                      <button
                        onClick={() => delayedNavigate("/")}
                        className="w-full py-4 px-8 bg-gradient-to-r from-[#7c5e3b] to-amber-500 hover:from-[#6a4f2f] hover:to-amber-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
                      >
                        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                          👤
                        </div>
                        Sign In
                      </button>
                    ) : (
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 text-red-600 hover:text-red-700 hover:bg-red-50 font-bold text-lg rounded-2xl border-2 border-transparent hover:border-red-200 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 z-[9999] shadow-lg animate-pulse" />
      )}

      {/* Notification Detail Modal */}
      {isNotifModalOpen && selectedNotif && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
          onClick={handleModalBackdropClick}
        >
          <div className="w-full max-w-lg max-h-[90vh] bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-amber-200/50 overflow-hidden animate-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-amber-100/50 sticky top-0 bg-white/50 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#7c5e3b] flex items-center gap-3">
                  {selectedNotif.type === "appointment"
                    ? "📅 Appointment"
                    : "🐾 Adoption"}
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                    {selectedNotif.review || selectedNotif.status}
                  </span>
                </h2>
                <button
                  onClick={handleCloseNotifModal}
                  className="p-2 hover:bg-amber-100 rounded-2xl transition-colors text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {selectedNotif.type === "appointment" ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Appointment Type
                        </label>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-l-4 border-blue-400">
                          <span className="text-xl font-bold text-blue-800">
                            {selectedNotif.appointment_type}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Date & Time
                        </label>
                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border-l-4 border-emerald-400 text-lg font-bold text-emerald-900">
                          {formatDateTime(
                            selectedNotif.appointment_date,
                            selectedNotif.timeSchedule
                          )}
                        </div>
                      </div>
                      {selectedNotif.review && (
                        <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl border-l-4 border-amber-400">
                          <p className="text-sm text-amber-900">
                            <span className="font-bold">Status:</span> This
                            appointment has been marked as{" "}
                            <strong>{selectedNotif.review}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Requested On
                      </label>
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border-l-4 border-emerald-400">
                        <span className="text-lg font-bold text-emerald-900">
                          {formatDateTime(selectedNotif.dateRequested)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Purpose of Adoption
                      </label>
                      <p className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl border-l-4 border-pink-400 text-lg leading-relaxed">
                        "{selectedNotif.purpose_of_adoption}"
                      </p>
                    </div>
                    {selectedNotif.status && (
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl border-l-4 border-amber-400">
                        <p className="text-sm text-amber-900">
                          <span className="font-bold">Status:</span> This
                          adoption request is currently{" "}
                          <strong>{selectedNotif.status}</strong>
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-amber-100/50 bg-gradient-to-t from-white/50">
              <button
                onClick={handleCloseNotifModal}
                className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                  ✓
                </div>
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavUser;
