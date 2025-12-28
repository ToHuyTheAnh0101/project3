import { useEffect, useState } from "react";
import { HiPencil } from "react-icons/hi";
import {
  statusLabels,
  statusColors,
  sessionStatusColors,
  sessionStatusLabels,
  formatDate,
  formatForInput,
} from "../../utils/utils";
import SessionDetail from "../session/SessionDetail";
import BudgetSection from "../budget/BudgetSection";
import LoadingSpinner from "../common/LoadingSpinner";
import { toast } from "react-toastify";
import request from "../../api/httpClient";
import { useParams } from "react-router-dom";

const EventDetail = () => {
  const { eventId, organizationId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeSession, setActiveSession] = useState(null);
  const [showSessionDetail, setShowSessionDetail] = useState(false);

  // Tabs: "sessions" or "budget"
  const [activeTab, setActiveTab] = useState("sessions");

  // Budget state for this event
  const [budgetTransactions, setBudgetTransactions] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editBudgetTx, setEditBudgetTx] = useState(null);
  // Default: 7 ngày trước đến hôm nay
  const today = new Date();
  const defaultEnd = today.toISOString().slice(0, 10);
  const defaultStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  // Fetch budget transactions for this event
  const fetchBudgetTransactions = async () => {
    if (!eventId || !organizationId) return;
    setBudgetLoading(true);
    try {
      let url = `/budget?organizationId=${organizationId}&eventId=${eventId}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      const res = await request("get", url);
      if (res.data && res.data.transactions) {
        setBudgetTransactions(res.data.transactions);
        setBudgetSummary(res.data.summary || { totalIncome: 0, totalExpense: 0, balance: 0 });
      } else {
        setBudgetTransactions([]);
        setBudgetSummary({ totalIncome: 0, totalExpense: 0, balance: 0 });
      }
    } catch (err) {
      toast.error("Không thể tải danh sách thu/chi");
    } finally {
      setBudgetLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "budget") {
      fetchBudgetTransactions();
    }
    // eslint-disable-next-line
  }, [eventId, startDate, endDate, activeTab]);
  // Budget modal success handler
  const handleBudgetSuccess = () => {
    setShowBudgetModal(false);
    setEditBudgetTx(null);
    fetchBudgetTransactions();
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    partnerName: "",
    partnerPhone: "",
    startDateTime: "",
    endDateTime: "",
    description: "",
    status: "draft",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await request("get", `/events/${eventId}`);
        setEvent(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Lấy thông tin sự kiện thất bại");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleAddSession = () => {
    setActiveSession(null);
    setShowSessionDetail(true);
  };

  const handleEditSession = (session) => {
    setActiveSession(session);
    setShowSessionDetail(true);
  };

  const handleBackFromSession = async () => {
    try {
      setLoading(true);
      const res = await request("get", `/events/${eventId}`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật danh sách hoạt động thất bại");
    } finally {
      setLoading(false);
      setShowSessionDetail(false);
      setActiveSession(null);
    }
  };

  const handleEditEvent = () => {
    setEditForm({
      partnerName: event.partnerName || "",
      partnerPhone: event.partnerPhone || "",
      startDateTime: formatForInput(event.startDateTime) || "",
      endDateTime: formatForInput(event.endDateTime) || "",
      description: event.description || "",
      status: event.status || "draft",
    });
    setIsEditing(true);
  };

  const handleSaveEvent = async () => {
    try {
      setLoading(true);
      await request("put", `/events/${eventId}`, editForm);
      toast.success("Cập nhật sự kiện thành công");
      const res = await request("get", `/events/${eventId}`);
      setEvent(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật sự kiện thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (showSessionDetail) {
    return (
      <SessionDetail
        event={event}
        sessionId={activeSession?._id || null}
        onBack={handleBackFromSession}
      />
    );
  }

  if (!event) return <LoadingSpinner text="Đang tải chi tiết sự kiện..." />;

  return (
    <div className="flex flex-col gap-5">
      {/* Event Info Box */}
      <div className="bg-white border border-gray-300 rounded-xl p-5 flex flex-col gap-5">
        {/* Event Name & Status */}
        <div className="flex items-center gap-3 text-lg font-semibold">
          <span className="text-xl font-bold text-gray-800">{event.name}</span>
          {!isEditing ? (
            <span
              className="px-3 py-1 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: statusColors[event.status] }}
            >
              {statusLabels[event.status]}
            </span>
          ) : (
            <div className="flex justify-around gap-2 mt-2">
              {Object.entries(statusLabels)
                .filter(([key]) =>
                  ["draft", "ongoing", "completed", "cancelled"].includes(key)
                )
                .map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center cursor-pointer flex-1 justify-center gap-2"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={key}
                      checked={editForm.status === key}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                    />
                    <div
                      className="px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap"
                      style={{ backgroundColor: statusColors[key] }}
                    >
                      {label}
                    </div>
                  </label>
                ))}
            </div>
          )}
          {!isEditing && (
            <HiPencil
              className="ml-auto text-blue-500 cursor-pointer text-xl hover:text-blue-600"
              onClick={handleEditEvent}
              title="Chỉnh sửa sự kiện"
            />
          )}
        </div>
        {/* Event Info Grid */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Đối tác", value: event.partnerName, key: "partnerName" },
            { label: "SĐT đối tác", value: event.partnerPhone, key: "partnerPhone" },
            {
              label: "Thời gian bắt đầu",
              value: formatDate(event.startDateTime),
              key: "startDateTime",
            },
            {
              label: "Thời gian kết thúc",
              value: formatDate(event.endDateTime),
              key: "endDateTime",
            },
          ].map((item) => (
            <div key={item.key} className="flex flex-col">
              <label className="font-semibold text-gray-700 text-sm">
                {item.label}
              </label>
              {isEditing ? (
                <input
                  type={item.key.includes("DateTime") ? "datetime-local" : "text"}
                  value={editForm[item.key]}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, [item.key]: e.target.value }))
                  }
                  className="mt-1 px-3 py-1 border border-gray-300 rounded-md text-gray-800"
                />
              ) : (
                <span className="mt-1 text-gray-900">{item.value || "-"}</span>
              )}
            </div>
          ))}
        </div>
        {/* Description */}
        <div className="flex flex-col gap-1 mt-2">
          <label className="font-semibold text-gray-700 text-sm">Mô tả</label>
          {isEditing ? (
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="mt-1 px-3 py-2 border border-gray-300 rounded-md text-gray-800"
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          )}
        </div>
        {/* Edit Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 font-semibold hover:bg-gray-200"
              onClick={() => setIsEditing(false)}
            >
              Hủy
            </button>
            <button
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
              onClick={handleSaveEvent}
            >
              Lưu
            </button>
          </div>
        )}
        {/* Session Stats */}
        <div className="mt-2">
          <label className="font-semibold text-gray-700">
            <b>Thống kê hoạt động</b>
          </label>
          <div className="flex flex-wrap gap-3 mt-2">
            {["planning", "doing", "done", "cancelled"].map((status) => (
              <div
                key={status}
                className="flex-1 min-w-[100px] text-center px-2 py-1 rounded-md font-semibold text-white"
                style={{ backgroundColor: sessionStatusColors[status] }}
              >
                {sessionStatusLabels[status]}: {event.sessionStats?.[status] || 0}
              </div>
            ))}
            <div className="flex-1 min-w-[100px] text-center px-2 py-1 rounded-md font-semibold bg-yellow-400 text-black">
              Tổng: {event.sessionStats?.total || 0}
            </div>
          </div>
        </div>
      </div>
      {/* Tabs (moved below event info box) */}
      <div className="flex gap-2 mb-2">
        <button
          className={`px-5 py-2 rounded-t-lg font-semibold border-b-4 shadow-sm transition-all duration-150 focus:outline-none 
            ${activeTab === "sessions"
              ? "border-blue-600 text-blue-800 bg-white shadow-md z-10"
              : "border-gray-200 text-gray-500 bg-[#f0f6ff] hover:bg-[#e0edff] hover:text-blue-700"}
          `}
          style={activeTab === "sessions" ? { boxShadow: "0 4px 16px 0 #60a5fa33" } : {}}
          onClick={() => setActiveTab("sessions")}
        >
          Hoạt động
        </button>
        <button
          className={`px-5 py-2 rounded-t-lg font-semibold border-b-4 shadow-sm transition-all duration-150 focus:outline-none 
            ${activeTab === "budget"
              ? "border-blue-600 text-blue-800 bg-white shadow-md z-10"
              : "border-gray-200 text-gray-500 bg-[#f0f6ff] hover:bg-[#e0edff] hover:text-blue-700"}
          `}
          style={activeTab === "budget" ? { boxShadow: "0 4px 16px 0 #60a5fa33" } : {}}
          onClick={() => setActiveTab("budget")}
        >
          Khoản phí
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === "sessions" ? (
        <div className="bg-white border border-gray-300 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-800">Danh sách hoạt động</span>
            <button
              className="px-3 py-1 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
              onClick={handleAddSession}
            >
              Thêm hoạt động
            </button>
          </div>
          {loading && <LoadingSpinner text="Đang tải hoạt động..." />}
          {!loading && (!event.sessions || event.sessions.length === 0) && (
            <div>Chưa có hoạt động nào</div>
          )}
          {event.sessions?.map((s) => (
            <div
              key={s._id}
              className="flex justify-between items-center p-3 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleEditSession(s)}
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-gray-900">{s.title}</span>
                <span className="text-gray-500 text-sm">
                  {formatDate(s.startTime)} → {formatDate(s.endTime)}
                </span>
              </div>
              <div
                className="px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap"
                style={{ backgroundColor: sessionStatusColors[s.status] }}
              >
                {sessionStatusLabels[s.status]}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <BudgetSection
          transactions={budgetTransactions}
          summary={budgetSummary}
          loading={budgetLoading}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          showModal={showBudgetModal}
          setShowModal={setShowBudgetModal}
          editTransaction={editBudgetTx}
          setEditTransaction={setEditBudgetTx}
          modalProps={{
            eventId,
            organizationId,
            onSuccess: handleBudgetSuccess,
          }}
          createButtonText="Tạo khoản mới"
        />
      )}
    </div>
  );
};

export default EventDetail;
