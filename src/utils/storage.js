import { getAllDocs, saveDoc, deleteDoc } from "./cloudStore.js";

export const getAllInvoices = () => getAllDocs("invoice");
export const saveInvoice = (inv) => saveDoc("invoice", inv);
export const deleteInvoice = (id) => deleteDoc("invoice", id);

export async function nextInvoiceNumber() {
  const list = await getAllDocs("invoice");
  const now = new Date();
  const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const fy = `${y}-${String(y + 1).slice(2)}`;
  const max = list.reduce((m, i) => {
    const n = parseInt(String(i.invoiceNo || "").split("/")[0], 10) || 0;
    return String(i.invoiceNo || "").endsWith(fy) ? Math.max(m, n) : m;
  }, 0);
  return `${String(max + 1).padStart(3, "0")}/${fy}`;
}
