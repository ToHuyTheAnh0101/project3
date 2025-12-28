import { useState } from "react";
import { toast } from "react-toastify";
import request from "../../api/httpClient";

const TRANSACTION_TYPES = [
  { value: "income", label: "Thu" },
  { value: "expense", label: "Chi" },
];

const BudgetTransactionModal = ({ organizationId, eventId, transaction, onClose, onSuccess }) => {
  const isEdit = !!transaction;
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState(transaction?.type || "income");
  const [amount, setAmount] = useState(transaction?.amount || "");
  const [description, setDescription] = useState(transaction?.description || "");
  const [date, setDate] = useState(transaction?.date ? transaction.date.slice(0,10) : today);
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    if (!transaction?._id) return;
    setLoading(true);
    try {
      await request("delete", `/budget/${transaction._id}`);
      toast.success("Đã xóa khoản thành công!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Xóa khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!amount || isNaN(amount) || Number(amount) < 0) {
      return toast.error("Vui lòng nhập số tiền hợp lệ");
    }
    if (!description.trim()) {
      return toast.error("Vui lòng nhập mô tả cho khoản thu/chi");
    }
    setLoading(true);
    try {
      const payload = {
        type,
        amount: Number(amount),
        description,
        date: date ? new Date(date) : undefined,
        organizationId,
        eventId,
      };
      if (isEdit) {
        await request("put", `/budget/${transaction._id}`, payload);
        toast.success("Cập nhật giao dịch thành công!");
      } else {
        await request("post", "/budget", payload);
        toast.success("Tạo giao dịch thành công!");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Lưu giao dịch thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/35 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-[90%] shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {isEdit ? "Chỉnh sửa giao dịch" : "Tạo giao dịch mới"}
        </h3>
        <div className="flex flex-col gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Loại giao dịch</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              value={type}
              onChange={e => setType(e.target.value)}
              disabled={isEdit}
            >
              {TRANSACTION_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Số tiền</label>
            <input
              type="number"
              min={0}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Nhập số tiền"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Mô tả <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Nhập mô tả cho khoản thu/chi"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Ngày giao dịch</label>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-between gap-3 mt-6">
          {isEdit ? (
            <button
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200"
              onClick={handleDelete}
              disabled={loading}
            >
              Xóa
            </button>
          ) : <span />}
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium text-white ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (isEdit ? "Đang lưu..." : "Đang tạo...") : (isEdit ? "Lưu" : "Tạo mới")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTransactionModal;
