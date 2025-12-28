import { useState, useRef } from "react";
import request from "../../api/httpClient";
import { toast } from "react-toastify";

const OrganizationModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    avatarFile: null as File | null,
    avatarPreview: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({
        ...form,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Tên tổ chức là bắt buộc");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      if (form.avatarFile) formData.append("avatar", form.avatarFile);

      await request("post", "/organization", formData);

      toast.success("Tạo tổ chức thành công!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo tổ chức thất bại");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
        <h2 className="text-center text-xl font-medium mb-4">Tạo tổ chức mới</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="font-medium">Tên tổ chức <span className="text-red-500">*</span></label>
            <input
              name="name"
              type="text"
              placeholder="Nhập tên tổ chức..."
              value={form.name}
              onChange={handleChange}
              className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium">Email liên hệ</label>
            <input
              name="email"
              type="email"
              placeholder="Ví dụ: contact@abc.com"
              value={form.email}
              onChange={handleChange}
              className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium">Ảnh đại diện</label>
            <div
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center cursor-pointer overflow-hidden"
              onClick={handleFileClick}
            >
              {form.avatarPreview ? (
                <img src={form.avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-3xl select-none">+</span>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Tạo mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationModal;
