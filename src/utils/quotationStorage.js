const KEY = "ks_quotations";

export function getAllQuotations() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveQuotation(quotation) {
  const all = getAllQuotations();
  const idx = all.findIndex((q) => q.id === quotation.id);
  if (idx >= 0) all[idx] = quotation;
  else all.unshift(quotation);
  localStorage.setItem(KEY, JSON.stringify(all));
  return all;
}

export function deleteQuotation(id) {
  const all = getAllQuotations().filter((q) => q.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
  return all;
}

export function nextQuotationNumber() {
  const all = getAllQuotations();
  let max = 0;
  all.forEach((q) => {
    const m = /Quote-(\d+)/.exec(q.quotationNo || "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return `Quote-${max + 1}`;
}
