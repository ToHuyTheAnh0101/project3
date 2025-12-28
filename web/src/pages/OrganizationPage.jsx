import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import OrganizationModal from "../components/organization/OrganizationModal";
import request from "../api/httpClient";
import { toast } from "react-toastify";

const OrganizationPage = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const fetchOrganizations = async () => {
      setLoading(true);
      try {
        const res = await request("get", "/organization", null);
        const data = res.data;
        setOrganizations(data);
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message);
      }

      setLoading(false);
    };
  
  useEffect(() => {
    fetchOrganizations();
  }, [navigate]);

  const handleSelect = (orgId) => {
    localStorage.setItem("selectedOrg", orgId);
    navigate(`/organization/${orgId}/events`);
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải danh sách tổ chức..." />;
  }

  return (
    <div className="w-full min-h-[calc(100vh-60px)] bg-[#f4f6f8] py-10">
      <div className="max-w-[960px] mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#1f1f1f]">
              Danh sách tổ chức
            </h2>
            <p className="text-gray-600 text-[15px] mt-1">
              Vui lòng chọn tổ chức bạn muốn làm việc cùng
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#0700cd] text-white font-medium text-[15px] px-4 py-2.5 rounded-lg shadow-md hover:bg-[#0600a6] transition-all"
          >
            <span>Tạo tổ chức mới</span>
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <OrganizationModal
            onClose={() => setShowModal(false)}
            onSuccess={() => fetchOrganizations()}
          />
        )}

        {/* Empty */}
        {organizations.length === 0 ? (
          <div className="text-center text-gray-600 text-[16px] mt-10">
            Bạn chưa tham gia tổ chức nào.
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
            {organizations.map((org) => (
              <div
                key={org._id}
                onClick={() => handleSelect(org._id)}
                className="bg-white rounded-xl p-6 shadow-sm cursor-pointer text-center transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={org.avatarUrl}
                  alt={org.name}
                  className="w-[140px] h-[140px] rounded-full object-cover mx-auto mb-4 border-2 border-black"
                />

                <span className="block text-[17px] font-semibold text-[#222] mb-1">
                  {org.name}
                </span>
                <small className="text-gray-600 text-sm">{org.role}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationPage;
