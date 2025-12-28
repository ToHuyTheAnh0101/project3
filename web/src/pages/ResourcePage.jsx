import { useState, useEffect } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ResourceDetail from "../components/resource/ResourceDetail";
import request from "../api/httpClient";

const ResourcePage = () => {
  const [resources, setResources] = useState([]);
  const [activeResource, setActiveResource] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await request("get", "/resources");
      setResources(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleAdd = () => {
    setActiveResource(null);
    setShowDetail(true);
  };

  const handleEdit = (res) => {
    setActiveResource(res);
    setShowDetail(true);
  };

  const handleSave = async (newResource) => {
    if (activeResource) {
      setResources((prev) =>
        prev.map((r) => (r._id === activeResource._id ? { ...r, ...newResource } : r))
      );
    } else {
      const newRes = { _id: Date.now().toString(), ...newResource };
      setResources((prev) => [newRes, ...prev]);
    }
    await fetchResources();
    setShowDetail(false);
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải danh sách thiết bị..." />;
  }

  if (showDetail) {
    return (
      <ResourceDetail
        resourceId={activeResource?._id || null}
        onBack={() => setShowDetail(false)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý trang thiết bị</h1>
      <p className="text-gray-600 text-base mb-4">
        Trang này hiển thị và quản lý các loại thiết bị của tổ chức.
      </p>

      <button
        className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md mb-4 hover:bg-blue-600 transition-colors"
        onClick={handleAdd}
      >
        Thêm thiết bị
      </button>

      {resources.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 text-base">
          Chưa có thiết bị nào.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Tên</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Loại</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Tổng số lượng</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Số lượng đang dùng</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Lưu ý</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((res) => (
                <tr
                  key={res._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEdit(res)}
                >
                  <td className="px-4 py-2 border-b border-gray-200 text-center">{res.name}</td>
                  <td className="px-4 py-2 border-b border-gray-200 text-center">{res.type}</td>
                  <td className="px-4 py-2 border-b border-gray-200 text-center">{res.quantity}</td>
                  <td className="px-4 py-2 border-b border-gray-200 text-center">{res.usedQuantity}</td>
                  <td className="px-4 py-2 border-b border-gray-200 text-center">{res.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResourcePage;
