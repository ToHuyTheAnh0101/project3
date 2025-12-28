import { useState, useRef } from "react";
import { toast } from "react-toastify";
import request from "../../api/httpClient";

const StaffInviteModal = ({ organizationId, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const debounceRef = useRef();

  // Gợi ý email
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setSelectedUser(null);
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || !organizationId) return;
    debounceRef.current = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await request("get", `/auth/suggest?keyword=${encodeURIComponent(value)}&organizationId=${organizationId}`);
        setSuggestions(res.data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 300);
  };

  const handleSelectSuggestion = (user) => {
    setEmail(user.email);
    setSelectedUser(user);
    setSuggestions([]);
  };

  const handleInvite = async () => {
    if (!email) return toast.error("Vui lòng nhập email");

    setLoading(true);
    try {
      let authId = selectedUser?._id;
      if (!authId) {
        // try resolve by suggest API
        const res = await request("get", `/auth/suggest?keyword=${encodeURIComponent(email)}&organizationId=${organizationId}&limit=1`);
        const user = (res.data && res.data[0]) || null;
        if (!user) {
          throw new Error('Không tìm thấy tài khoản với email này');
        }
        authId = user._id;
      }
      await request("post", "/staffs", { authId, organizationId });
      toast.success("Đã thêm nhân sự thành công!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Thêm nhân sự thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/35 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-[90%] shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thêm nhân sự
        </h3>

        <div className="flex flex-col mb-4 relative">
          <label className="text-sm font-medium text-gray-700 mb-2">Email:</label>
          <input
            type="email"
            placeholder="Nhập email nhân sự"
            value={email}
            onChange={handleEmailChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoComplete="off"
          />
          {suggestLoading && (
            <div className="text-xs text-gray-400 mt-1">Đang tìm kiếm...</div>
          )}
          {suggestions.length > 0 && (
            <div className="border border-gray-200 rounded-lg mt-1 bg-white shadow z-50 max-h-48 overflow-y-auto w-full absolute left-0" style={{ top: '100%' }}>
              {suggestions.map((user) => (
                <div
                  key={user._id || user.email}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                  onClick={() => handleSelectSuggestion(user)}
                >
                  <img src={user.avatarUrl || require("../../utils/utils").DEFAULT_AVATAR} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                  <span className="font-medium text-gray-800">{user.name || user.email}</span>
                  <span className="text-xs text-gray-500 ml-2">{user.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium text-white ${
              loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={handleInvite}
            disabled={loading}
          >
            {loading ? "Đang thêm..." : "Thêm nhân sự"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffInviteModal;
