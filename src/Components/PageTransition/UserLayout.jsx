import TopNavUser from "../Navigation/TopNavUser";
import { Outlet } from "react-router-dom";

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
