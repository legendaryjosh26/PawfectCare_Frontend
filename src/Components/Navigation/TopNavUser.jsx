import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PawfectCareLogo from "../../assets/User-Page-Image/PawfectCareLogo.svg";
import { ChevronDown, LogOut } from "lucide-react";
import { getApiBaseUrl } from "../../../../Backend/config/API_BASE_URL";

const TopNavUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const delayedNavigate = (path) => {
    setLoading(true);
    setTimeout(() => {
      navigate(path);
      setIsDropdownOpen(false);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (user !== null) setUser(null);
      return;
    }

    fetch(`${getApiBaseUrl()}/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsDropdownOpen(false);
    navigate("/", { replace: true });
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

        {/* Center: Navigation (desktop only) */}
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
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
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
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
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
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            )}
          </button>
        </nav>

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
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden">
              {/* User info */}
              {!isGuest && (
                <div className="p-4 bg-amber-50 border-b border-amber-100">
                  <p className="font-semibold text-gray-900">
                    {formatName(
                      `${user?.first_name || "Guest"} ${user?.last_name || ""}`
                    )}
                  </p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              )}

              {/* Nav links */}
              <nav className="flex flex-col">
                <button
                  onClick={() => delayedNavigate("/user/about")}
                  className={`px-4 py-3 text-left font-medium md:hidden hover:bg-amber-50 ${
                    isActive("/user/about") ? "text-[#7c5e3b]" : "text-gray-700"
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

              {/* Sign In / Sign Out */}
              {isGuest ? (
                <button
                  onClick={() => delayedNavigate("/user/login")}
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
      </header>

      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-amber-300 z-[9999]" />
      )}
    </>
  );
};

export default TopNavUser;
