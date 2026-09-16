import React, { forwardRef } from "react";
import logo from "../assets/logo.png";
import signature from "../assets/ks-enterprises-seal-signature.png";
import { calcQuotationTotals } from "../utils/defaultQuotation.js";

const QuotationPreview = forwardRef(({ quotation }, ref) => {
  const { grandTotal } = calcQuotationTotals(quotation);
  const fmt = (n) =>
    `₹${Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const formatDate = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    return `${day}-${month}-${year}`;
  };

  return (
    <div
      ref={ref}
      style={{
        width: 794,
        height: 1123,
        padding: 40,
        background: "#fff",
        fontFamily: "Arial, sans-serif",
        color: "#222",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "2px solid #eee",
          paddingBottom: 16,
        }}
      >
        <img src={logo} alt="logo" style={{ height: 70 }} />
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontWeight: "bold", fontSize: 22 }}>
            K S ENTREPRISES
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>
            0 Basavanapura Village
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>
            Chikkaiahna Chatra Hobli Nanjangud
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>
            Nanjangud Mysore District- 571302
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>
            📞 8660712660 ✉ ksenterprises1102@gmail.com
          </div>
          <div style={{ fontSize: 12, fontWeight: "bold" }}>
            GSTIN 29EQSPR9307H1ZX
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>
          Quotation
        </div>
      </div>

      {/* To / Quote info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <div>
          <div style={{ fontWeight: "bold" }}>To,</div>
          <div style={{ fontWeight: "bold" }}>{quotation.receiver.name}</div>
          <div style={{ fontSize: 12, whiteSpace: "pre-line" }}>
            {quotation.receiver.address}
          </div>
          <div style={{ fontSize: 12 }}>GSTIN {quotation.receiver.gstin}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div>
            <b>Quotation#</b> {quotation.quotationNo}
          </div>
          <div>
            <div>
              <b>Date:</b> {formatDate(quotation.quotationDate)}
            </div>
          </div>
        </div>
      </div>

      <p style={{ marginTop: 20, fontSize: 13 }}>
        Thank you for your valuable inquiry. We are pleased to quote as below:
      </p>

      {/* Table */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}
      >
        <thead>
          <tr style={{ background: "#f7f7f7", textAlign: "left" }}>
            <th style={{ padding: 8, fontSize: 12 }}>#</th>
            <th style={{ padding: 8, fontSize: 12 }}>DESCRIPTION</th>
            <th style={{ padding: 8, fontSize: 12, textAlign: "right" }}>
              QTY
            </th>
            <th style={{ padding: 8, fontSize: 12, textAlign: "center" }}>
              UOM
            </th>
            <th style={{ padding: 8, fontSize: 12, textAlign: "right" }}>
              PRICE
            </th>
            <th style={{ padding: 8, fontSize: 12, textAlign: "right" }}>
              TOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          {quotation.items.map((it, i) => {
            const qty = parseFloat(it.qty) || 0;
            const price = parseFloat(it.price) || 0;
            return (
              <tr key={it.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8, fontSize: 13 }}>{i + 1}</td>
                <td style={{ padding: 8, fontSize: 13, fontWeight: "bold" }}>
                  {it.description}
                </td>
                <td style={{ padding: 8, fontSize: 13, textAlign: "right" }}>
                  {qty}
                </td>

                <td style={{ padding: 8, fontSize: 13, textAlign: "center" }}>
                  {it.unit}
                </td>

                <td style={{ padding: 8, fontSize: 13, textAlign: "right" }}>
                  ₹{price.toFixed(2)}
                </td>
                <td style={{ padding: 8, fontSize: 13, textAlign: "right" }}>
                  {fmt(qty * price)}
                </td>
              </tr>
            );
          })}
          <tr>
            <td colSpan={4}></td>
            <td style={{ padding: 8, fontWeight: "bold", fontSize: 13 }}>
              GRAND TOTAL
            </td>
            <td
              style={{
                padding: 8,
                fontWeight: "bold",
                fontSize: 14,
                textAlign: "right",
              }}
            >
              {fmt(grandTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginTop: 20, fontSize: 13 }}>
        We hope you find our offer to be in line with your requirement.
      </p>

      {/* Terms */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontWeight: "bold", marginBottom: 6 }}>
          Terms & Conditions:
        </div>
        {quotation.terms.map((t, i) => (
          <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
            {i + 1}) {t}
          </div>
        ))}
      </div>

      {/* Signature */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>
          For, K S ENTREPRISES
        </div>
        <img src={signature} alt="signature" style={{ height: 60 }} />
        <div style={{ fontSize: 11, marginTop: 4 }}>AUTHORIZED SIGNATURE</div>
      </div>
    </div>
  );
});

export default QuotationPreview;
