import { ReactNode } from "react";
import Sidebar from "../sidebar/Sidebar";
import "./MainLayout.css";
import { Outlet } from "react-router-dom";

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="mainlayout">
      <Sidebar />
      <div className="mainlayout-content">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default MainLayout;
