import { useState, useEffect } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import request from "../api/httpClient";
import EventModal from "../components/event/EventModal";
import { toast } from "react-toastify";
import { statusColors, statusLabels, formatDate } from "../utils/utils";

const EventPage = () => {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchEvents = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const res = await request(
        "get",
        `/events/organization/${organizationId}`
      );
      setEvents(res.data);
    } catch {
      toast.error("Lấy danh sách sự kiện thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [organizationId]);

  const groupedEvents = {
    draft: [],
    ongoing: [],
    completed: [],
    cancelled: [],
    paused: [],
  };
  events.forEach((ev) => {
    if (groupedEvents[ev.status]) groupedEvents[ev.status].push(ev);
  });

  const handleOpenEvent = (eventId) => {
    navigate(`/organization/${organizationId}/events/${eventId}`);
  };

  const renderEventCard = (event) => (
    <div
      key={event._id}
      className="bg-white p-3 rounded-xl shadow hover:shadow-lg cursor-pointer transition-all duration-200"
      onClick={() => handleOpenEvent(event._id)}
    >
      <div className="text-sm font-semibold text-gray-900 mb-1">{event.name}</div>
      <div className="text-xs text-gray-600">
        <b>Bắt đầu:</b> {formatDate(event.startDateTime)}
        <br />
        <b>Kết thúc:</b> {formatDate(event.endDateTime)}
      </div>
    </div>
  );

  const renderStatusColumn = (status) => (
    <div
      key={status}
      className="bg-blue-200 flex-1 min-w-[180px] p-3 rounded-xl flex flex-col"
    >
      <div
        className="text-sm font-bold pb-2 mb-3 border-b-4"
        style={{ borderColor: statusColors[status] }}
      >
        {statusLabels[status]}
      </div>
      <div className="flex flex-col gap-3">
        {groupedEvents[status].length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-2">
            Không có sự kiện
          </div>
        ) : (
          groupedEvents[status].map(renderEventCard)
        )}
      </div>
    </div>
  );

  return (
    <div className="overflow-x-hidden p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 m-0">Danh sách sự kiện</h1>
      </div>

      <div className="mb-6">
        <button
          className="bg-blue-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-600 hover:-translate-y-0.5 transition-all duration-200"
          onClick={() => setShowModal(true)}
        >
          Thêm sự kiện
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Đang tải danh sách sự kiện..." />
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-4 w-full">
            {Object.keys(groupedEvents).map(renderStatusColumn)}
          </div>
        </div>
      )}

      {/* Outlet sẽ render EventDetail khi URL có :eventId */}
      <Outlet />

      {showModal && (
        <EventModal
          organizationId={organizationId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchEvents();
            toast.success("Tạo sự kiện thành công!");
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default EventPage;
