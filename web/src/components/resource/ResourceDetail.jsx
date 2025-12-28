import { useState, useEffect } from "react";
import { RESOURCE_TYPES } from "../../constants/resourceTypes";
import request from "../../api/httpClient";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { sessionStatusColors, sessionStatusLabels } from "../../utils/utils";

const ResourceDetail = ({ resourceId, onBack, onSave }) => {
  const { organizationId } = useParams();

  const [form, setForm] = useState({
    name: "",
    type: "",
    quantity: 0,
    usedQuantity: 0,
    availableQuantity: 0,
    note: "",
    sessions: [],
  });
  const [typeFilter, setTypeFilter] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resourceId) return;

    const fetchResource = async () => {
      try {
        const res = await request("get", `/resources/${resourceId}/detail`);
        const data = res.data;

        setForm({
          name: data.name || "",
          type: data.type || "",
          quantity: data.quantity || 0,
          usedQuantity: data.usedQuantity || 0,
          availableQuantity: data.availableQuantity || 0,
          note: data.note || "",
          sessions: data.sessions || [],
        });
      } catch (err) {
        toast.error("Không thể tải thông tin thiết bị");
        console.error(err);
      }
    };

    fetchResource();
  }, [resourceId]);

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "quantity") {
    const num = value === "" ? "" : Math.max(0, Number(value));
    setForm((prev) => ({
      ...prev,
      quantity: num,
      availableQuantity:
        num < prev.usedQuantity ? 0 : num - prev.usedQuantity,
    }));
    return;
  }

  setForm((prev) => ({ ...prev, [name]: value }));
};

  const handleSave = async () => {
    setLoading(true);
    try {
      if (resourceId) {
        await request("post", `/resources/${resourceId}`, {
          ...form,
          organizationId,
        });
        toast.success("Cập nhật thiết bị thành công");
      } else {
        await request("post", `/resources`, { ...form, organizationId });
        toast.success("Tạo thiết bị thành công");
      }
      onSave(form);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lưu thiết bị thất bại");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6 p-6 min-h-[500px]">
      {/* LEFT PANEL: Form (2/3) */}
      <div className="basis-2/3 bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Tên thiết bị:</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Loại thiết bị:</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Chọn loại thiết bị --</option>
            {RESOURCE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Tổng số lượng:</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            min={0}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">
            Số lượng đang dùng:
          </label>
          <input
            type="number"
            value={form.usedQuantity}
            disabled
            className="border border-gray-300 rounded-md p-2 bg-gray-100"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">
            Số lượng khả dụng:
          </label>
          <input
            type="number"
            value={form.availableQuantity}
            disabled
            className="border border-gray-300 rounded-md p-2 bg-gray-100"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Lưu ý:</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            rows={3}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
          />
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 font-semibold hover:bg-gray-200"
            onClick={onBack}
            disabled={loading}
          >
            Quay lại
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: History (1/3) */}
      <div className="basis-1/3 bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
        <h3 className="font-semibold text-gray-700 text-lg">
          Hoạt động sử dụng
        </h3>
        {form.sessions.length === 0 ? (
          <p className="text-gray-500">Chưa có lịch sử sử dụng</p>
        ) : (
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Sự kiện</th>
                  <th className="border p-2 text-left">Hoạt động</th>
                  <th className="border p-2 text-left">Số lượng</th>
                  <th className="border p-2 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {form.sessions.map((s) => (
                  <tr key={s.sessionId} className="hover:bg-gray-50">
                    <td className="border p-2">{s.eventName}</td>
                    <td className="border p-2">{s.title}</td>
                    <td className="border p-2">{s.quantity}</td>
                    <td className="border p-2">
                      <span
                        className="inline-block px-2 py-1 text-white text-xs font-semibold rounded text-center"
                        style={{
                          backgroundColor: sessionStatusColors[s.status],
                          minWidth: "fit-content",
                        }}
                      >
                        {sessionStatusLabels[s.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceDetail;
