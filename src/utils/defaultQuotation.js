export function emptyQuotation(quoteNo) {
  return {
    id: Date.now(),
    quotationNo: quoteNo || "Quote-1",
    quotationDate: new Date().toISOString().slice(0, 10),
    receiver: { name: "", address: "", gstin: "" },
    items: [
      { id: Date.now(), description: "", qty: "", unit: "SQFT", price: "" },
    ],
    terms: [
      `Work includes - 4"Thick M25 Grade Concrete with 8mm steel reinforcement 1'x1' Spacing each`,
      "Minimum 60% of total value as advance needed before starting the work",
      "GST Charges Extra",
      "Work will be completed within 15 Days from Day to started",
      "This Quotation is valid for 15 days only",
    ],
  };
}

export function calcQuotationTotals(q) {
  const grandTotal = (q.items || []).reduce((sum, it) => {
    const qty = parseFloat(it.qty) || 0;
    const price = parseFloat(it.price) || 0;
    return sum + qty * price;
  }, 0);
  return { grandTotal };
}
