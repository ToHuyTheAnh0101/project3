import { useEffect, useState, useRef } from "react";
import request from "../api/httpClient";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const OrganizationSettingsPage = () => {
  const [orgInfo, setOrgInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", avatarUrl: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef(null);
  const orgId = localStorage.getItem("selectedOrg");

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const res = await request("get", `/organization/info/${orgId}`);
        setOrgInfo(res.data);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          avatarUrl: res.data.avatarUrl || "",
        });
        setAvatarPreview(res.data.avatarUrl || "");
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi tải thông tin tổ chức");
      }
      setLoading(false);
    };
    if (orgId) fetchOverview();
  }, [orgId]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Tên tổ chức không được để trống");
      return;
    }
    try {
      let dataToSend;
      let config = {};
      if (avatarFile) {
        dataToSend = new FormData();
        dataToSend.append("name", form.name);
        dataToSend.append("email", form.email);
        dataToSend.append("avatar", avatarFile);
        config.headers = { "Content-Type": "multipart/form-data" };
      } else {
        dataToSend = form;
      }
      const res = await request("patch", `/organization/${orgId}`, dataToSend, config);
      toast.success("Cập nhật thông tin tổ chức thành công!");
      setOrgInfo({ ...orgInfo, ...form, avatarUrl: res.data?.avatarUrl || form.avatarUrl });
      setEditMode(false);
      setAvatarFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại!");
    }
  };

  if (loading) return <LoadingSpinner text="Đang tải thông tin tổ chức..." />;
  if (!orgInfo) return <div>Không tìm thấy thông tin tổ chức.</div>;

  return (
    <div className="w-full min-h-[calc(100vh-60px)] bg-[#f4f6f8] py-10">
      <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Cài đặt tổ chức</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col items-center">
            <label className="font-medium mb-1">Ảnh đại diện</label>
            <div
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center cursor-pointer overflow-hidden mb-2"
              onClick={editMode ? handleFileClick : undefined}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-3xl select-none">+</span>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                disabled={!editMode}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="font-medium">
              Tên tổ chức <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              placeholder="Nhập tên tổ chức..."
              value={form.name}
              onChange={handleChange}
              className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={!editMode}
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 p-2 border rounded-md bg-gray-100"
              disabled
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            {editMode ? (
              <>
                <button
                  type="button"
                  onClick={() => { setEditMode(false); setAvatarFile(null); setAvatarPreview(orgInfo.avatarUrl || ""); }}
                  className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 font-semibold hover:bg-gray-200"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Lưu
                </button>
              </>
            ) : (
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                onClick={() => setEditMode(true)}
              >
                Chỉnh sửa
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationSettingsPage;
