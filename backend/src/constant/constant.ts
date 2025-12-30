export const sessionStatusLabels: Record<string, string> = {
  planning: 'Chưa thực hiện',
  doing: 'Đang thực hiện',
  done: 'Hoàn thành',
  cancelled: 'Hủy',
};

export const transactionTypeLabels: Record<string, string> = {
  income: 'Thu',
  expense: 'Chi',
};

export const formatDate = (dt: string | Date | undefined | null): string => {
  if (!dt) return '-';
  const d = new Date(dt);
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatDateDDMMYYYY = (
  dt: string | Date | undefined | null,
): string => {
  if (!dt) return '-';
  const d = new Date(dt);
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};
