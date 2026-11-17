export const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
export const pad = (n) => String(n).padStart(2, "0");

export const currentYM = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
export const parseYM = (ym) => { const [y, m] = ym.split("-").map(Number); return { y, m: m - 1 }; };
export const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
export const monthStart = (y, m) => `${y}-${pad(m + 1)}-01`;
export const monthEnd = (y, m) => `${y}-${pad(m + 1)}-${pad(daysIn(y, m))}`;
export const dayStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
export const monthLabel = (y, m) => `${MONTHS[m]}-${y}`;
export const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

export const fmtDMY = (s) => (s ? s.split("-").reverse().join("/") : "");
export const inr = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// days until the next birthday (0 = today)
export function birthdayInfo(dob, now = new Date()) {
  if (!dob) return null;
  const [, mm, dd] = dob.split("-").map(Number);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), mm - 1, dd);
  if (next < today) next = new Date(now.getFullYear() + 1, mm - 1, dd);
  const days = Math.round((next - today) / 86400000);
  const born = Number(dob.split("-")[0]);
  return { days, date: next, turning: next.getFullYear() - born };
}
