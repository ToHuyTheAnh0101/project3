import { useState } from "react";
import request from "../../api/httpClient";
import { toast } from "react-toastify";
import { statusLabels } from "../../utils/utils";

const EventModal = ({ onClose, onSuccess, organizationId }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    status: "draft",
    partnerName: "",
    partnerPhone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Tên sự kiện là bắt buộc");
      return;
    }

    try {
      const formData = { ...form, organizationId };
      await request("post", "/events", formData);

      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Tạo sự kiện thất bại");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-center text-lg font-medium mb-4">Thêm sự kiện mới</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Name */}
          <div className="flex flex-col">
            <label className="font-medium">
              Tên sự kiện <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              placeholder="Nhập tên sự kiện..."
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="font-medium">Mô tả</label>
            <textarea
              name="description"
              placeholder="Mô tả sự kiện..."
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Start Date */}
          <div className="flex flex-col">
            <label className="font-medium">Ngày & giờ bắt đầu</label>
            <input
              name="startDateTime"
              type="datetime-local"
              value={form.startDateTime}
              onChange={handleChange}
              className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <label className="font-medium">Ngày & giờ kết thúc</label>
            <input
              name="endDateTime"
              type="datetime-local"
              value={form.endDateTime}
              onChange={handleChange}
              className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="font-medium">Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Partner Name */}
          <div className="flex flex-col">
            <label className="font-medium">Tên đối tác</label>
            <input
              name="partnerName"
              type="text"
              placeholder="Nhập tên đối tác..."
              value={form.partnerName}
              onChange={handleChange}
              className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Partner Phone */}
          <div className="flex flex-col">
            <label className="font-medium">Số điện thoại đối tác</label>
            <input
              name="partnerPhone"
              type="text"
              placeholder="Nhập số điện thoại đối tác..."
              value={form.partnerPhone}
              onChange={handleChange}
              className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Tạo mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
