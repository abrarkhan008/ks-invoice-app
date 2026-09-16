import React from "react";

export default function QuotationForm({ quotation, setQuotation }) {
  const updateReceiver = (field, value) =>
    setQuotation((prev) => ({
      ...prev,
      receiver: { ...prev.receiver, [field]: value },
    }));

  const updateItem = (idx, field, value) =>
    setQuotation((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });

  const addItem = () =>
    setQuotation((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), description: "", qty: "", unit: "SQFT", price: "" },
      ],
    }));

  const removeItem = (idx) =>
    setQuotation((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
        <label className="text-xs font-bold text-gray-500">Quotation #</label>
        <input
          className="w-full border rounded-lg p-2"
          value={quotation.quotationNo}
          onChange={(e) =>
            setQuotation((p) => ({ ...p, quotationNo: e.target.value }))
          }
        />

        <label className="text-xs font-bold text-gray-500">Date</label>
        <input
          type="date"
          className="w-full border rounded-lg p-2"
          value={quotation.quotationDate}
          onChange={(e) =>
            setQuotation((p) => ({ ...p, quotationDate: e.target.value }))
          }
        />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
        <div className="text-xs font-bold text-gray-500">Receiver</div>
        <input
          className="w-full border rounded-lg p-2"
          placeholder="Company Name"
          value={quotation.receiver.name}
          onChange={(e) => updateReceiver("name", e.target.value)}
        />
        <textarea
          className="w-full border rounded-lg p-2"
          placeholder="Address"
          rows={3}
          value={quotation.receiver.address}
          onChange={(e) => updateReceiver("address", e.target.value)}
        />
        <input
          className="w-full border rounded-lg p-2"
          placeholder="GSTIN"
          value={quotation.receiver.gstin}
          onChange={(e) => updateReceiver("gstin", e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="text-xs font-bold text-gray-500">Items</div>
        {quotation.items.map((it, idx) => (
          <div key={it.id} className="border rounded-lg p-2 space-y-1">
            <input
              className="w-full border rounded-lg p-2"
              placeholder="Description"
              value={it.description}
              onChange={(e) => updateItem(idx, "description", e.target.value)}
            />
            <div className="flex gap-2">
              <input
                className="w-1/3 border rounded-lg p-2"
                placeholder="Qty"
                value={it.qty}
                onChange={(e) => updateItem(idx, "qty", e.target.value)}
              />
              <input
                className="w-1/3 border rounded-lg p-2"
                placeholder="Unit"
                value={it.unit}
                onChange={(e) => updateItem(idx, "unit", e.target.value)}
              />
              <input
                className="w-1/3 border rounded-lg p-2"
                placeholder="Price"
                value={it.price}
                onChange={(e) => updateItem(idx, "price", e.target.value)}
              />
            </div>
            {quotation.items.length > 1 && (
              <button
                onClick={() => removeItem(idx)}
                className="text-red-400 text-xs"
              >
                Remove item
              </button>
            )}
          </div>
        ))}
        <button onClick={addItem} className="text-ksorange text-sm font-bold">
          + Add item
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
        <div className="text-xs font-bold text-gray-500">
          Terms & Conditions (one per line)
        </div>
        <textarea
          className="w-full border rounded-lg p-2"
          rows={6}
          value={quotation.terms.join("\n")}
          onChange={(e) =>
            setQuotation((p) => ({ ...p, terms: e.target.value.split("\n") }))
          }
        />
      </div>
    </div>
  );
}
