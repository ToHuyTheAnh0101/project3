import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BudgetSection from "../components/budget/BudgetSection";
import request from "../api/httpClient";
import { toast } from "react-toastify";

const BudgetPage = () => {
  const { organizationId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [orgInfo, setOrgInfo] = useState(null);
  // Default: 7 ngày trước đến hôm nay
  const today = new Date();
  const defaultEnd = today.toISOString().slice(0, 10);
  const defaultStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  // Không dùng tab, chia 2 phần song song

  const fetchTransactions = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      let url = `/budget?organizationId=${organizationId}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      const res = await request("get", url);
      if (res.data && res.data.transactions) {
        setTransactions(res.data.transactions);
        setSummary(res.data.summary || { totalIncome: 0, totalExpense: 0, balance: 0 });
      } else {
        setTransactions([]);
        setSummary({ totalIncome: 0, totalExpense: 0, balance: 0 });
      }
    } catch (err) {
      toast.error("Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  // Fetch organization info for currentBudget
  const fetchOrgInfo = async () => {
    if (!organizationId) return;
    try {
      const res = await request("get", `/organization/info/${organizationId}`);
      setOrgInfo(res.data);
    } catch (err) {
      setOrgInfo(null);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [organizationId, startDate, endDate]);

  useEffect(() => {
    fetchOrgInfo();
    // eslint-disable-next-line
  }, [organizationId]);

  const handleSuccess = () => {
    setShowModal(false);
    setEditTransaction(null);
    fetchTransactions();
    fetchOrgInfo();
  };


  if (loading) {
    return <div className="p-8 flex justify-center items-center min-h-[300px]"><BudgetSection loading /></div>;
  }

  return (
    <div className="p-4">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý ngân sách</h1>
        <p className="mt-2 text-gray-600 text-sm">
          Theo dõi, thêm, chỉnh sửa và quản lý ngân sách cho các hoạt động, sự kiện hoặc tổ chức.
        </p>
      </div>
      {/* Current Budget Box */}
      {orgInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-4 text-center mb-6">
          <div className="text-xs text-yellow-700 font-semibold mb-1">Ngân sách hiện tại</div>
          <div className="text-xl font-bold text-yellow-700">{orgInfo.currentBudget?.toLocaleString("vi-VN") || 0} đ</div>
        </div>
      )}
      <BudgetSection
        transactions={transactions}
        summary={summary}
        loading={loading}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        showModal={showModal}
        setShowModal={setShowModal}
        editTransaction={editTransaction}
        setEditTransaction={setEditTransaction}
        modalProps={{
          organizationId,
          onSuccess: handleSuccess,
        }}
        organizationId={organizationId}
      />
    </div>
  );
};

export default BudgetPage;
