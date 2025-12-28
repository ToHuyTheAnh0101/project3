import { useState, useEffect, useRef } from "react";
import request from "../api/httpClient";

const DEFAULT_AVATAR =
  "https://static.xx.fbcdn.net/rsrc.php/v3/yi/r/3rR6G5Aif5R.png";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", avatarUrl: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Lấy thông tin cá nhân từ API
    request("get", "/auth/me")
      .then((res) => {
        setProfile(res.data);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          avatarUrl: res.data.avatarUrl || "",
        });
        setAvatarPreview(res.data.avatarUrl || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      alert("Tên không được để trống");
      return;
    }
    const formData = new FormData();
    formData.append("name", form.name);
    if (avatarFile) formData.append("avatar", avatarFile);
    await request("patch", "/auth/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setEdit(false);
    // Reload toàn bộ trang để đồng bộ Topbar
    window.location.reload();
  };

  if (loading) return <div>Đang tải...</div>;
  if (!profile) return <div>Không tìm thấy thông tin cá nhân.</div>;

  return (
    <div className="w-full min-h-[calc(100vh-60px)] bg-[#f4f6f8] py-10">
      <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Thông tin cá nhân
        </h2>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col items-center">
            <label className="font-medium mb-1">Ảnh đại diện</label>
            <div
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center cursor-pointer overflow-hidden mb-2"
              onClick={edit ? handleFileClick : undefined}
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
                disabled={!edit}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="font-medium">
              Họ tên <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              placeholder="Nhập họ tên..."
              value={form.name}
              onChange={handleChange}
              className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={!edit}
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              className="mt-1 p-2 border rounded-md bg-gray-100"
              disabled
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            {edit ? (
              <>
                <button
                  type="button"
                  onClick={() => setEdit(false)}
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
                onClick={() => setEdit(true)}
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

export default ProfilePage;
