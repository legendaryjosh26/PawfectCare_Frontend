import { useEffect } from "react";
import TopNavUser from "../Navigation/TopNavUser";
import { Outlet, useLocation } from "react-router-dom";

export default function UserLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <TopNavUser />
      <div className="pt-[72px]">
        <Outlet />
      </div>
    </>
  );
}
