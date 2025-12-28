export const statusColors: Record<string, string> = {
  draft: "#9ca3af",       // Nháp - xám nhạt
  ongoing: "#2563eb",     // Đang diễn ra - xanh dương đậm
  completed: "#16a34a",   // Hoàn thành - xanh lá
  cancelled: "#dc2626",   // Hủy - đỏ đậm
  paused: "#f59e0b",      // Tạm ngưng - vàng cam
};


export const statusLabels: Record<string, string> = {
  draft: "Nháp",
  ongoing: "Đang diễn ra",
  completed: "Hoàn thành",
  cancelled: "Hủy",
  paused: "Tạm ngưng",
};

export const sessionStatusColors: Record<string, string> = {
  planning: "#0ea5e9",    // Chưa thực hiện - xanh dương sáng
  doing: "#7c3aed",       // Đang thực hiện - tím
  done: "#22c55e",         // Hoàn thành - xanh lá sáng
  cancelled: "#dc2626",   // Hủy - đỏ đậm
};

export const sessionStatusLabels: Record<string, string> = {
  planning: "Chưa thực hiện",
  doing: "Đang thực hiện",
  done: "Hoàn thành",
  cancelled: "Hủy",
};

export const staffRoles: Record<string, string> = {
  staff: "Nhân viên thường",
  finance: "Nhân viên tài chính",
  admin: "Quản lý",
};

export const DEFAULT_AVATAR = '/assets/default-avatar.svg';

export const formatDate = (dt: string | Date | undefined | null): string => {
  if (!dt) return "-";
  const d = new Date(dt);
  const pad = (n: number): string => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatForInput = (isoString?: string | null) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};
