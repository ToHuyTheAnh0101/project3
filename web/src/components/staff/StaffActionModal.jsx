import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import request from "../../api/httpClient";
import { staffRoles } from "../../utils/utils";

const StaffActionModal = ({ staffId, onClose, onSuccess }) => {
  const [staff, setStaff] = useState(null);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      setFetching(true);
      try {
        const res = await request("get", `/staffs/${staffId}`);
        setStaff(res.data);
        setRole(res.data.role);
        setStatus(res.data.status);
      } catch (err) {
        console.error(err);
        toast.error("Lấy thông tin nhân sự thất bại");
        onClose();
      } finally {
        setFetching(false);
      }
    };

    if (staffId) fetchStaff();
  }, [staffId, onClose]);

  const handleSave = async () => {
    if (!staff) return;
    setLoading(true);
    try {
      await request("post", `/staffs/${staff._id}`, { role, status });
      toast.success("Cập nhật nhân sự thành công!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (fetching || !staff) return null;

  return (
    <div className="fixed inset-0 bg-black/35 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-[90%] shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Thông tin nhân sự
        </h3>

        <div className="flex flex-col mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Tên nhân sự
          </label>
          <input
            type="text"
            value={staff.authId?.name || ""}
            readOnly
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="text"
            value={staff.authId?.email || ""}
            readOnly
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Vai trò / Chức vụ
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {Object.entries(staffRoles).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <button
            className="w-full bg-red-600 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-md mb-2 transition-colors"
            onClick={async () => {
              if (!staff) return;
              setLoading(true);
              try {
                await request("post", `/staffs/${staff._id}`, {
                  status: "kicked",
                });
                toast.success("Nhân sự đã bị loại khỏi tổ chức");
                onSuccess?.();
                onClose();
              } catch (err) {
                toast.error("Loại nhân sự thất bại");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Loại nhân sự"}
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-md"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffActionModal;
