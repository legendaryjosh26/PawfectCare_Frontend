import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TopNavUser from "../Navigation/TopNavUser";

export default function UserLayout() {
  const location = useLocation();

  useLayoutEffect(() => {
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
