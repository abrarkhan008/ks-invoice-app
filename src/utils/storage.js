// Simple local storage helper to save/load invoices on the device
const KEY = "ks_invoices_v1";

export function getAllInvoices() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveInvoice(invoice) {
  const all = getAllInvoices();
  const idx = all.findIndex((i) => i.id === invoice.id);
  if (idx >= 0) {
    all[idx] = invoice;
  } else {
    all.unshift(invoice);
  }
  localStorage.setItem(KEY, JSON.stringify(all));
  return all;
}

export function deleteInvoice(id) {
  const all = getAllInvoices().filter((i) => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
  return all;
}

export function nextInvoiceNumber() {
  const all = getAllInvoices();
  const year = new Date().getFullYear();
  const fy = `${year}-${String(year + 1).slice(2)}`;
  return `${String(all.length + 1).padStart(3, "0")}/${fy}`;
}
