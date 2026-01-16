import {
  Outlet,
  useLocation,
  useNavigationType,
  ScrollRestoration,
} from "react-router-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import TopNavUser from "../Navigation/TopNavUser";

export default function UserLayout() {
  const { pathname } = useLocation();
  const navType = useNavigationType(); // "POP" | "PUSH" | "REPLACE"
  const [showOverlay, setShowOverlay] = useState(false);

  // Scroll to top for normal navigations
  useLayoutEffect(() => {
    if (navType !== "POP") window.scrollTo(0, 0);
  }, [pathname, navType]);

  // Overlay for transition masking (prevents the flash)
  useEffect(() => {
    setShowOverlay(true);
    const t = setTimeout(() => setShowOverlay(false), 800); // match page loader delay
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      <TopNavUser />

      {showOverlay && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 transition-opacity duration-300">
          <div className="flex flex-col items-center gap-6 p-8 animate-pulse">
            <div className="w-20 h-20 bg-[#7c5e3b]/20 rounded-2xl flex items-center justify-center mb-4">
              <Loader2 className="h-16 w-16 text-[#7c5e3b] animate-spin drop-shadow-md" />
            </div>
            <div className="space-y-2 text-center">
              <div className="text-xl font-bold text-[#7c5e3b] tracking-wide">
                Preparing Pets
              </div>
              <div className="text-lg text-[#7c5e3b]/80">
                Loading adorable companions...
              </div>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-[#7c5e3b]/30 to-transparent rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7c5e3b] to-amber-500 animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      )}

      <div className="pt-[72px]">
        <Outlet />
      </div>

      <ScrollRestoration getKey={(location) => location.pathname} />
    </>
  );
}
