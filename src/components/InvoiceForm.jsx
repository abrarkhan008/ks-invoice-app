import React from "react";
import MicButton from "./MicButton.jsx";
import { emptyItem } from "../utils/defaultInvoice.js";

// A labeled text input with a mic button attached.
function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 bg-white focus-within:border-ksorange">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 py-2 outline-none text-sm bg-transparent"
        />
        {type === "text" && <MicButton onText={(text) => onChange(text)} />}
      </div>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <div className="flex items-start gap-2 border border-gray-300 rounded-lg px-2 bg-white focus-within:border-ksorange">
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="flex-1 py-2 outline-none text-sm bg-transparent resize-none"
        />
        <MicButton
          className="mt-1"
          onText={(text) => onChange((value ? value + " " : "") + text)}
        />
      </div>
    </div>
  );
}

export default function InvoiceForm({ invoice, setInvoice }) {
  const update = (patch) => setInvoice({ ...invoice, ...patch });

  const updateParty = (key, patch) =>
    update({ [key]: { ...invoice[key], ...patch } });

  const updateItem = (id, patch) =>
    update({
      items: invoice.items.map((it) =>
        it.id === id ? { ...it, ...patch } : it,
      ),
    });

  const addItem = () => update({ items: [...invoice.items, emptyItem()] });

  const removeItem = (id) =>
    update({ items: invoice.items.filter((it) => it.id !== id) });

  return (
    <div className="space-y-5">
      {/* Invoice basics */}
      <section className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ksorange mb-3">
          Invoice Details
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Invoice No"
            value={invoice.invoiceNo}
            onChange={(v) => update({ invoiceNo: v })}
            placeholder="021/2026-27"
          />
          <Field
            label="Invoice Date"
            type="date"
            value={invoice.invoiceDate}
            onChange={(v) => update({ invoiceDate: v })}
          />
        </div>
        <Field
          label="Description Title (e.g. Loading Charges for the month of July 2026)"
          value={invoice.title}
          onChange={(v) => update({ title: v })}
          placeholder="LOADING CHARGES FOR THE MONTH OF JULY 2026"
        />
      </section>

      {/* Receiver */}
      <section className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ksorange mb-3">
          Details of Receiver / Billed To
        </h3>
        <Field
          label="Name"
          value={invoice.receiver.name}
          onChange={(v) => updateParty("receiver", { name: v })}
          placeholder="Parle Agro Private Ltd"
        />
        <TextAreaField
          label="Address"
          value={invoice.receiver.address}
          onChange={(v) => updateParty("receiver", { address: v })}
          placeholder="Plot No 32-46 and 49-63 Area, Adakanahalli..."
        />
        <Field
          label="GSTIN"
          value={invoice.receiver.gstin}
          onChange={(v) => updateParty("receiver", { gstin: v })}
          placeholder="29AAACP8416G1ZB"
        />
      </section>

      {/* Consignee */}
      <section className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-ksorange">
            Details of Consignee
          </h3>
          <label className="flex items-center gap-1 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={invoice.sameAsReceiver}
              onChange={(e) => update({ sameAsReceiver: e.target.checked })}
            />
            Same as receiver
          </label>
        </div>
        {!invoice.sameAsReceiver && (
          <>
            <Field
              label="Name"
              value={invoice.consignee.name}
              onChange={(v) => updateParty("consignee", { name: v })}
            />
            <TextAreaField
              label="Address"
              value={invoice.consignee.address}
              onChange={(v) => updateParty("consignee", { address: v })}
            />
            <Field
              label="GSTIN"
              value={invoice.consignee.gstin}
              onChange={(v) => updateParty("consignee", { gstin: v })}
            />
          </>
        )}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Field
            label="State"
            value={invoice.state}
            onChange={(v) => update({ state: v })}
          />
          <Field
            label="State Code"
            value={invoice.stateCode}
            onChange={(v) => update({ stateCode: v })}
          />
        </div>
      </section>

      {/* Items */}
      <section className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ksorange mb-3">
          Items / Charges
        </h3>
        {invoice.items.map((item, idx) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-3 mb-3 relative"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-400">
                Item {idx + 1}
              </span>
              {invoice.items.length > 1 && (
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-red-500"
                  type="button"
                >
                  Remove
                </button>
              )}
            </div>
            <Field
              label="Description"
              value={item.description}
              onChange={(v) => updateItem(item.id, { description: v })}
              placeholder="DAIRY / BEVERAGES / SECONDARY LOADING"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="HSN/SAC"
                value={item.hsn}
                onChange={(v) => updateItem(item.id, { hsn: v })}
              />
              <Field
                label="UOM"
                value={item.uom}
                onChange={(v) => updateItem(item.id, { uom: v })}
              />
              <Field
                label="Qty"
                type="number"
                value={item.qty}
                onChange={(v) => updateItem(item.id, { qty: v })}
              />
              <Field
                label="Rate"
                type="number"
                value={item.rate}
                onChange={(v) => updateItem(item.id, { rate: v })}
              />
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          type="button"
          className="w-full border-2 border-dashed border-ksorange text-ksorange rounded-lg py-2 text-sm font-semibold"
        >
          + Add Item
        </button>
      </section>

      {/* Tax rates */}
      <section className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ksorange mb-3">Tax Rates</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="CGST %"
            type="number"
            value={invoice.cgstRate}
            onChange={(v) => update({ cgstRate: v })}
          />
          <Field
            label="SGST %"
            type="number"
            value={invoice.sgstRate}
            onChange={(v) => update({ sgstRate: v })}
          />
        </div>
      </section>

      {/* Terms */}
      <section className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ksorange mb-3">
          Terms and Conditions (optional)
        </h3>
        <TextAreaField
          label="Terms"
          value={invoice.terms}
          onChange={(v) => update({ terms: v })}
          placeholder="Payment within 30 days..."
        />
      </section>
    </div>
  );
}
