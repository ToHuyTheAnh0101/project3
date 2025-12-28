import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { toast } from "react-toastify";
import request from "../../api/httpClient";

const Topbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Lấy thông tin user từ /auth/me
    request("get", "/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);


  const handleProfile = () => {
    window.open("/profile", "_blank");
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Nếu backend có API logout
      await request("post", "/auth/logout");
    } catch (error) {
      console.log("Logout API error (có thể token hết hạn, bỏ qua):", error);
    }

    localStorage.removeItem("access_token");
    toast.success("Đăng xuất thành công!");

    navigate("/auth");
  };

  return (
    <div className="flex justify-between items-center h-[60px] bg-white px-5 shadow sticky top-0 z-10">
      {/* Left side */}
      <div className="flex items-end gap-3">
        <img src="/assets/logo.png" alt="Logo" className="h-9 w-24 object-contain" />
        <span className="text-lg font-semibold text-gray-800">
          Hệ thống quản lý sự kiện
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <FaBell className="text-gray-600 text-lg cursor-pointer" />

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            <img
              src={user && user.avatarUrl ? user.avatarUrl : require("../../utils/utils").DEFAULT_AVATAR}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover"
            />
            <span className="text-sm text-gray-800">{user && user.name ? user.name : (user && user.email ? user.email : "Tài khoản")}</span>
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-md py-2 z-50">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 text-sm"
                onClick={handleProfile}
              >
                Thông tin cá nhân
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 text-sm"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
