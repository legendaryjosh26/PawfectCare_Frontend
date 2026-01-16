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
    const t = setTimeout(() => setShowOverlay(false), 250); // tweak 200–500ms
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      <TopNavUser />

      {showOverlay && (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-[#7c5e3b] animate-spin" />
        </div>
      )}

      <div className="pt-[72px]">
        <Outlet />
      </div>

      <ScrollRestoration getKey={(location) => location.pathname} />
    </>
  );
}
