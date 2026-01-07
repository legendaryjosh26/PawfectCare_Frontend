import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PawfectCareLogo from "../../assets/User-Page-Image/PawfectCareLogo.svg";
import { ChevronDown, LogOut, Bell } from "lucide-react";
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
  const notifRef = useRef(null);

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

  // Format date + time from DB
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

  // Initial fetch for notifications + unread count (total)
  useEffect(() => {
    if (!user) return;

    const fetchInitial = async () => {
      try {
        const res = await apiClient.get("/users/notification");
        const all = res.data.notifications || [];

        // store all notifications
        setNotifications(all);

        // badge = total notifications (change to pending filter if you want)
        setUnreadCount(all.length);
      } catch (e) {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    fetchInitial();
  }, [user, apiClient]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsNotifOpen(false);
  };

  // Click bell: open/close + fetch; clear unread when opening
  const toggleNotifications = async () => {
    if (!user) return;

    const willOpen = !isNotifOpen;
    setIsNotifOpen(willOpen);

    if (!willOpen) {
      // just closed
      return;
    }

    // user is opening -> mark as read (set to 0, or recompute if needed)
    setUnreadCount(0);

    setNotifLoading(true);
    try {
      const res = await apiClient.get("/users/notification");
      const all = res.data.notifications || [];
      setNotifications(all);
      // keep unreadCount 0 because user just opened
    } catch (e) {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const showBadge = unreadCount > 0;

  // Modal handlers
  const handleOpenNotifModal = (notif) => {
    setSelectedNotif(notif);
    setIsNotifModalOpen(true);
  };

  const handleCloseNotifModal = () => {
    setIsNotifModalOpen(false);
    setSelectedNotif(null);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full flex items-center justify-between px-4 py-3 md:px-10 md:py-4 z-50 bg-white border-b border-amber-100 caret-transparent">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => delayedNavigate("/user/about")}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#7c5e3b] rounded-full flex items-center justify-center">
            <img
              src={PawfectCareLogo}
              alt="Pawfect Care Logo"
              className="w-6 h-6 md:w-7 md:h-7 filter brightness-0 invert"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-bold text-[#7c5e3b]">
              Pawfect Care
            </span>
            <span className="text-xs text-amber-600 hidden md:block">
              Pet Adoption & Care
            </span>
          </div>
        </div>

        {/* Center nav */}
        <nav className="hidden md:flex flex-grow justify-center gap-8 lg:gap-12 text-sm font-medium">
          <button
            onClick={() => delayedNavigate("/user/about")}
            className={`relative px-4 py-2 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105 ${
              isActive("/user/about")
                ? "bg-gradient-to-r from-[#7c5e3b] to-[#8b6f47] text-white shadow-lg"
                : "text-gray-700 hover:text-[#7c5e3b] hover:bg-amber-50"
            }`}
          >
            About Us
            {isActive("/user/about") && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => delayedNavigate("/user/adoption")}
            className={`relative px-4 py-2 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105 ${
              isActive("/user/adoption")
                ? "bg-gradient-to-r from-[#7c5e3b] to-[#8b6f47] text-white shadow-lg"
                : "text-gray-700 hover:text-[#7c5e3b] hover:bg-amber-50"
            }`}
          >
            Adoption
            {isActive("/user/adoption") && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => delayedNavigate("/user/booking")}
            className={`relative px-4 py-2 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105 ${
              isActive("/user/booking")
                ? "bg-gradient-to-r from-[#7c5e3b] to-[#8b6f47] text-white shadow-lg"
                : "text-gray-700 hover:text-[#7c5e3b] hover:bg-amber-50"
            }`}
          >
            Book
            {isActive("/user/booking") && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            )}
          </button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notification bell */}
          {!isGuest && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                className="relative p-2 rounded-full border-2 border-amber-200 hover:bg-amber-50"
              >
                <Bell className="h-5 w-5 text-[#7c5e3b]" />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 md:left-auto md:right-0 md:transform-none top-full mt-2 w-80 max-h-80 overflow-y-auto bg-white border border-amber-200 rounded-2xl shadow-xl text-sm z-[60]">
                  <div className="px-4 py-2 border-b border-amber-100 font-semibold text-gray-800 sticky top-0 bg-white rounded-t-2xl">
                    Notifications
                  </div>
                  {notifLoading ? (
                    <div className="px-4 py-3 text-gray-500">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-3 text-gray-500">
                      No notifications.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={`${n.type}-${n.id}`}
                        className="px-4 py-3 border-b last:border-b-0 border-amber-50 cursor-pointer hover:bg-amber-50"
                        onClick={() => handleOpenNotifModal(n)}
                      >
                        {n.type === "appointment" ? (
                          <>
                            <p className="font-semibold text-[#7c5e3b]">
                              Appointment ({n.appointment_type})
                            </p>
                            <p className="text-gray-700">
                              Date:{" "}
                              {formatDateTime(
                                n.appointment_date,
                                n.timeSchedule
                              )}
                            </p>
                            <p className="text-xs text-amber-700">
                              Status: {n.review}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-[#7c5e3b]">
                              Adoption Request
                            </p>
                            <p className="text-gray-700">
                              Requested: {formatDateTime(n.dateRequested)}
                            </p>
                            <p className="text-xs text-gray-700 line-clamp-2">
                              Purpose: {n.purpose_of_adoption}
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Status: {n.status}
                            </p>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Profile / Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white border-2 border-amber-200 rounded-full"
            >
              <div className="w-8 h-8 bg-[#7c5e3b] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.first_name?.charAt(0) || "G"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden z-[60]">
                {!isGuest && (
                  <div className="p-4 bg-amber-50 border-b border-amber-100">
                    <p className="font-semibold text-gray-900">
                      {formatName(
                        `${user?.first_name || "Guest"} ${
                          user?.last_name || ""
                        }`
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                )}

                <nav className="flex flex-col">
                  <button
                    onClick={() => delayedNavigate("/user/about")}
                    className={`px-4 py-3 text-left font-medium md:hidden hover:bg-amber-50 ${
                      isActive("/user/about")
                        ? "text-[#7c5e3b]"
                        : "text-gray-700"
                    }`}
                  >
                    About Us
                  </button>
                  <button
                    onClick={() => delayedNavigate("/user/adoption")}
                    className={`px-4 py-3 text-left font-medium md:hidden hover:bg-amber-50 ${
                      isActive("/user/adoption")
                        ? "text-[#7c5e3b]"
                        : "text-gray-700"
                    }`}
                  >
                    Adoption
                  </button>
                  <button
                    onClick={() => delayedNavigate("/user/booking")}
                    className={`px-4 py-3 text-left font-medium md:hidden hover:bg-amber-50 ${
                      isActive("/user/booking")
                        ? "text-[#7c5e3b]"
                        : "text-gray-700"
                    }`}
                  >
                    Book
                  </button>
                </nav>

                {isGuest ? (
                  <button
                    onClick={() => delayedNavigate("/")}
                    className="w-full px-4 py-3 text-left text-[#7c5e3b] font-semibold hover:bg-amber-50 border-t border-amber-100"
                  >
                    Sign In
                  </button>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left flex items-center gap-2 text-red-600 border-t border-amber-100 hover:bg-amber-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-amber-300 z-[9999]" />
      )}

      {/* Notification detail modal */}
      {isNotifModalOpen && selectedNotif && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-100 p-6 relative transform -translate-x-4">
            {/* Close button */}
            <button
              onClick={handleCloseNotifModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold text-[#7c5e3b] mb-4">
              {selectedNotif.type === "appointment"
                ? "Appointment Details"
                : "Adoption Request Details"}
            </h2>

            {selectedNotif.type === "appointment" ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold text-gray-800">Type:</span>{" "}
                  {selectedNotif.appointment_type}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">
                    Date & Time:
                  </span>{" "}
                  {formatDateTime(
                    selectedNotif.appointment_date,
                    selectedNotif.timeSchedule
                  )}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Status:</span>{" "}
                  {selectedNotif.review}
                </p>
                {selectedNotif.review && (
                  <p className="text-xs text-gray-500 mt-2">
                    This appointment has been marked as {selectedNotif.review}.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold text-gray-800">
                    Requested On:
                  </span>{" "}
                  {formatDateTime(selectedNotif.dateRequested)}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Purpose:</span>{" "}
                  {selectedNotif.purpose_of_adoption}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Status:</span>{" "}
                  {selectedNotif.status}
                </p>
                {selectedNotif.status && (
                  <p className="text-xs text-gray-500 mt-2">
                    This adoption request is currently {selectedNotif.status}.
                  </p>
                )}
              </div>
            )}

            {/* Footer button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseNotifModal}
                className="px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavUser;
