import { useState } from "react";
import {
  FaHome,
  FaCalendarAlt,
  FaUsersCog,
  FaBoxes,
  FaChartBar,
  FaArrowLeft,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const { organizationId } = useParams();

  const menuItems = [
    {
      id: 0,
      icon: <FaArrowLeft />, // icon khác biệt
      label: "Về trang tổ chức",
      path: "/organization",
      isBack: true, // đánh dấu menu quay lại
    },
    {
      id: 2,
      icon: <FaCalendarAlt />,
      label: "Quản lý sự kiện",
      path: `/organization/${organizationId}/events`,
    },
    {
      id: 3,
      icon: <FaUsersCog />,
      label: "Quản lý nhân sự",
      path: `/organization/${organizationId}/human-resource`,
    },
    {
      id: 4,
      icon: <FaBoxes />,
      label: "Quản lý trang thiết bị",
      path: `/organization/${organizationId}/resources`,
    },
    {
      id: 5,
      icon: <FaChartBar />,
      label: "Quản lý ngân sách",
      path: `/organization/${organizationId}/budget`,
    },
    {
      id: 6,
      icon: <FaUsersCog />, // hoặc chọn icon phù hợp hơn
      label: "Cài đặt tổ chức",
      path: `/organization/${organizationId}/settings`,
    },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          return (
            <Link key={item.id} to={item.path} className="sidebar-link">
              <li
                className={`sidebar-item ${
                  item.isBack
                    ? "is-back bg-green-700 text-white font-medium transition-colors duration-200"
                    : ""
                }`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span
                  className={`sidebar-label ${isCollapsed ? "collapsed" : ""}`}
                >
                  {item.label}
                </span>
              </li>
            </Link>
          );
        })}
      </ul>

      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? "»" : "«"}
      </button>
    </div>
  );
};

export default Sidebar;
