import { Outlet } from "react-router-dom";
import TopNavUser from "../Navigation/TopNavUser";

export default function UserLayout() {
  return (
    <>
      <TopNavUser />
      <div className="pt-[72px]">
        <Outlet />
      </div>
    </>
  );
}
