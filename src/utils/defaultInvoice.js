export function emptyItem() {
  return {
    id: crypto.randomUUID(),
    description: "",
    hsn: "998519",
    qty: "",
    uom: "TON",
    rate: "",
  };
}

export function emptyInvoice(invoiceNo) {
  return {
    id: crypto.randomUUID(),
    invoiceNo: invoiceNo || "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    title: "LOADING CHARGES FOR THE MONTH OF",
    receiver: { name: "", address: "", gstin: "" },
    consignee: { name: "", address: "", gstin: "" },
    sameAsReceiver: true,
    state: "Karnataka",
    stateCode: "29",
    items: [emptyItem()],
    cgstRate: 9,
    sgstRate: 9,
    terms: "",
  };
}

export function calcTotals(invoice) {
  const rows = invoice.items.map((it) => {
    const qty = parseFloat(it.qty) || 0;
    const rate = parseFloat(it.rate) || 0;
    const amount = qty * rate;
    return { ...it, qty, rate, amount };
  });
  const totalQty = rows.reduce((s, r) => s + r.qty, 0);
  const totalBeforeTax = rows.reduce((s, r) => s + r.amount, 0);
  const cgst = (totalBeforeTax * (parseFloat(invoice.cgstRate) || 0)) / 100;
  const sgst = (totalBeforeTax * (parseFloat(invoice.sgstRate) || 0)) / 100;
  const totalAfterTax = totalBeforeTax + cgst + sgst;
  return { rows, totalQty, totalBeforeTax, cgst, sgst, totalAfterTax };
}
