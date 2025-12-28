import { useState } from "react";
import BudgetTransactionModal from "./BudgetTransactionModal";
import LoadingSpinner from "../common/LoadingSpinner";

const BudgetSection = ({
  transactions = [],
  summary = { totalIncome: 0, totalExpense: 0, balance: 0 },
  loading = false,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onCreate,
  onEdit,
  showModal,
  setShowModal,
  editTransaction,
  setEditTransaction,
  modalProps = {},
  hideCreateButton = false,
  createButtonText = "Tạo khoản mới"
}) => {
  // Phân loại thu/chi
  const incomeTransactions = transactions.filter(tx => tx.type === "income");
  const expenseTransactions = transactions.filter(tx => tx.type === "expense");

  return (
    <div>
      {/* Bộ lọc ngày và button tạo mới */}
      <div className="flex justify-between items-end mb-6 gap-4 flex-wrap">
        {!hideCreateButton && (
          <button
            className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600 transition-colors h-10"
            onClick={() => setShowModal(true)}
          >
            {createButtonText}
          </button>
        )}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Từ ngày</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded-md p-2 w-[130px]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Đến ngày</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded-md p-2 w-[130px]" />
          </div>
        </div>
      </div>
      {/* Tổng quan */}
      <div className="grid grid-cols-3 gap-8 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 text-center">
          <div className="text-xs text-green-700 font-semibold mb-1">Tổng thu</div>
          <div className="text-xl font-bold text-green-700">{summary.totalIncome.toLocaleString("vi-VN")} đ</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-4 text-center">
          <div className="text-xs text-red-700 font-semibold mb-1">Tổng chi</div>
          <div className="text-xl font-bold text-red-700">{summary.totalExpense.toLocaleString("vi-VN")} đ</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 text-center">
          <div className="text-xs text-blue-700 font-semibold mb-1">Chênh lệch</div>
          <div className="text-xl font-bold text-blue-700">{summary.balance.toLocaleString("vi-VN")} đ</div>
        </div>
      </div>
      {/* Danh sách thu/chi chia 2 phần song song */}
      {loading ? (
        <LoadingSpinner text="Đang tải thu/chi..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Thu */}
          <div className="bg-white border border-green-200 rounded-xl shadow">
            <div className="bg-green-500 rounded-t-xl px-6 py-3 text-lg font-semibold text-white text-center tracking-wide">Thu</div>
            <div className="p-4 flex flex-col gap-2">
              {incomeTransactions.length === 0 && (
                <div className="text-gray-500 text-sm text-center py-8">Không có khoản thu nào.</div>
              )}
              {incomeTransactions.map(tx => (
                <div key={tx._id} className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 flex flex-col cursor-pointer hover:shadow" onClick={() => setEditTransaction(tx)}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-700">{tx.amount.toLocaleString("vi-VN")} đ</span>
                    <span className="text-xs text-gray-500">{tx.date ? new Date(tx.date).toLocaleDateString("vi-VN") : "-"}</span>
                  </div>
                  <div className="text-sm text-gray-700 mt-1 font-bold">
                    Mô tả: {tx.description || "-"}
                  </div>
                  {tx.eventId && tx.eventName && (
                    <div className="text-xs mt-1">
                      <span className="font-bold text-blue-600">Sự kiện: </span>
                      <a
                        href={`/organization/${tx.organizationId}/events/${typeof tx.eventId === 'object' && tx.eventId._id ? tx.eventId._id : tx.eventId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-600 hover:text-blue-800"
                        style={{ textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}
                      >
                        {tx.eventName}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Chi */}
          <div className="bg-white border border-red-200 rounded-xl shadow">
            <div className="bg-red-500 rounded-t-xl px-6 py-3 text-lg font-semibold text-white text-center tracking-wide">Chi</div>
            <div className="p-4 flex flex-col gap-2">
              {expenseTransactions.length === 0 && (
                <div className="text-gray-500 text-sm text-center py-8">Không có khoản chi nào.</div>
              )}
              {expenseTransactions.map(tx => (
                <div key={tx._id} className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex flex-col cursor-pointer hover:shadow" onClick={() => setEditTransaction(tx)}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-red-700">{tx.amount.toLocaleString("vi-VN")} đ</span>
                    <span className="text-xs text-gray-500">{tx.date ? new Date(tx.date).toLocaleDateString("vi-VN") : "-"}</span>
                  </div>
                  <div className="text-sm text-gray-700 mt-1 font-bold">
                    Mô tả: {tx.description || "-"}
                  </div>
                  {tx.eventId && tx.eventName && (
                    <div className="text-xs mt-1">
                      <span className="font-bold text-blue-600">Sự kiện: </span>
                      <a
                        href={`/organization/${tx.organizationId}/events/${typeof tx.eventId === 'object' && tx.eventId._id ? tx.eventId._id : tx.eventId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-600 hover:text-blue-800"
                        style={{ textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}
                      >
                        {tx.eventName}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {(showModal || editTransaction) && (
        <BudgetTransactionModal
          {...modalProps}
          transaction={editTransaction}
          onClose={() => {
            setShowModal(false);
            setEditTransaction(null);
          }}
          onSuccess={modalProps.onSuccess}
        />
      )}
    </div>
  );
};

export default BudgetSection;
