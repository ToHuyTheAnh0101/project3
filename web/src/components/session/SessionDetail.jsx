import { useState, useEffect } from "react";
import {
  formatForInput,
  sessionStatusColors,
  sessionStatusLabels,
} from "../../utils/utils";
import request from "../../api/httpClient";
import { toast } from "react-toastify";
import StaffDropdown from "../staff/StaffDropdown";
import ResourceEditor from "../resource/ResourceEditor";

const SessionDetail = ({ event, sessionId, onBack }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    status: "planning",
    staffIds: [],
    resources: [],
    history: [],
  });
  const [loading, setLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setLoadingSession(false);
        return;
      }
      setLoadingSession(true);
      try {
        const res = await request("get", `/sessions/${sessionId}`);
        const s = res.data;
        setForm({
          title: s.title || "",
          description: s.description || "",
          startTime: s.startTime ? formatForInput(s.startTime) : "",
          endTime: s.endTime ? formatForInput(s.endTime) : "",
          location: s.location || "",
          status: s.status || "planning",
          staffIds: s.staffIds,
          resources: s.resources || [],
          history: s.history || [],
        });
      } catch (err) {
        toast.error("Không thể tải thông tin session");
        console.error(err);
      } finally {
        setLoadingSession(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStaffChange = (selectedIds) => {
    setForm((prev) => ({ ...prev, staffIds: selectedIds }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (sessionId) {
        await request("post", `/sessions/${sessionId}`, {
          ...form,
          eventId: event._id,
        });
      } else {
        await request("post", `/sessions`, { ...form, eventId: event._id });
      }
      toast.success("Lưu thông tin hoạt động thành công");
      onBack();
    } catch (err) {
      const message =
        err.response?.data?.message || // message từ NestJS
        err.message || // fallback
        "Đã có lỗi xảy ra";
      console.log();
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingSession) return <div>Đang tải thông tin session...</div>;

  return (
    <div className="flex gap-6 p-6 min-h-[500px]">
      {/* LEFT PANEL - 2/3 */}
      <div className="w-2/3 bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 min-w-[300px]">
        <div className="text-lg font-semibold mb-2">Sự kiện: {event.name}</div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Tiêu đề:</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Trạng thái:</label>
          <div className="flex justify-between">
            {Object.entries(sessionStatusLabels).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center cursor-pointer flex-1 justify-center gap-2"
              >
                <input
                  type="radio"
                  name="status"
                  value={key}
                  checked={form.status === key}
                  onChange={handleChange}
                />
                <div
                  className="px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap"
                  style={{ backgroundColor: sessionStatusColors[key] }}
                >
                  {label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">
            Thời gian bắt đầu:
          </label>
          <input
            type="datetime-local"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">
            Thời gian kết thúc:
          </label>
          <input
            type="datetime-local"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Địa điểm:</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Mô tả:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y min-h-[80px]"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 font-semibold hover:bg-gray-200"
            onClick={onBack}
            disabled={loading}
          >
            Quay lại
          </button>
          <button
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 min-w-[250px]">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">
            Nhân viên phụ trách:
          </label>
          <StaffDropdown
            initialSelectedIds={form.staffIds}
            onChange={handleStaffChange}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">
            Tài nguyên đang sử dụng:
          </label>
          <ResourceEditor
            initialResources={form.resources || []}
            onChange={(updatedResources) =>
              setForm((prev) => ({ ...prev, resources: updatedResources }))
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">
            Lịch sử thay đổi:
          </label>
          <div className="overflow-auto max-h-[300px] border border-gray-200 rounded p-2 text-sm">
            {!form.history || form.history.length === 0 ? (
              <p className="text-gray-500">Chưa có lịch sử thay đổi</p>
            ) : (
              form.history
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((h, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="text-gray-700 font-semibold text-base mb-1">
                      {new Date(h.timestamp).toLocaleString("vi-VN")}
                    </div>
                    <ul className="list-disc list-inside text-gray-700">
                      {h.info.map((item, i) => (
                        <li key={i}>{item.detail}</li>
                      ))}
                    </ul>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
