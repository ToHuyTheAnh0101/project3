import { useState, useEffect } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useParams } from "react-router-dom";
import request from "../api/httpClient";
import { toast } from "react-toastify";
import StaffInviteModal from "../components/staff/StaffInviteModal";
import StaffActionModal from "../components/staff/StaffActionModal";
import { staffRoles, DEFAULT_AVATAR } from "../utils/utils";
import { FaEdit } from "react-icons/fa";

const HumanResourcePage = () => {
  const { organizationId } = useParams();
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const res = await request("get", `/staffs?organizationId=${organizationId}`);
      setStaffs(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Lấy danh sách nhân sự thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const handleInviteSuccess = async () => {
    await fetchStaffs();
  };

  return (
    <div className="p-4">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân sự</h1>
        <p className="mt-2 text-gray-600 text-sm">
          Quản lý thông tin nhân viên, phòng ban và quyền hạn
        </p>
      </div>

      <div className="flex mb-6">
        <button
          className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => setShowInviteModal(true)}
        >
          Thêm nhân sự
        </button>
      </div>

      {showInviteModal && (
        <StaffInviteModal
          organizationId={organizationId}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}

      {selectedStaff && (
        <StaffActionModal
          staffId={selectedStaff._id}
          onClose={() => setSelectedStaff(null)}
          onSuccess={fetchStaffs}
        />
      )}

      {loading ? (
        <LoadingSpinner text="Đang tải danh sách nhân sự..." />
      ) : staffs.length === 0 ? (
        <div className="text-center text-gray-500 text-base mt-10">
          Chưa có nhân viên nào.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Ảnh</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Tên</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Email</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Vai trò</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((staff) => (
                <tr key={staff._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b border-gray-200 text-center">
                    <img
                      className="w-10 h-10 rounded-full object-cover mx-auto"
                      src={staff.authId?.avatarUrl || DEFAULT_AVATAR}
                      alt="avatar"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-center">
                    {staff.authId?.name}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-center">
                    {staff.authId?.email}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-center">
                    {staffRoles[staff.role]}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-center">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => setSelectedStaff(staff)}
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HumanResourcePage;
