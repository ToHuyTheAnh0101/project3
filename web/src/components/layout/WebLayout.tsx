import Topbar from "../topbar/Topbar";
import { Outlet } from "react-router-dom";

const WebLayout = () => {
  return (
    <div className="web-layout">
      <Topbar />
      <div className="web-layout-body">
        <Outlet />
      </div>
    </div>
  );
};

export default WebLayout;
