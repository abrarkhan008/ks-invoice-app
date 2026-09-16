import React, { forwardRef } from "react";
import logo from "../assets/logo.png";
// import cardImage from "./assets/visiting-card.png";
import sealSignature from "../assets/ks-enterprises-seal-signature.png";
import { calcTotals } from "../utils/defaultInvoice.js";
import { numberToWords } from "../utils/numberToWords.js";

const InvoicePreview = forwardRef(({ invoice }, ref) => {
  const { rows, totalQty, totalBeforeTax, cgst, sgst, totalAfterTax } =
    calcTotals(invoice);

  const consignee = invoice.sameAsReceiver
    ? invoice.receiver
    : invoice.consignee;

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString("en-GB");
  };

  return (
    <div
      ref={ref}
      style={{
        width: "794px",
        minHeight: "1123px",
        background: "#fff",
        color: "#000",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "11px",
        padding: "35px 45px 30px 45px",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderBottom: "1px solid #000",
          paddingBottom: "3px",
          marginBottom: "10px",
        }}
      >
        <div style={{ width: "55%", display: "flex", alignItems: "center" }}>
          <img
            src={logo}
            alt="KS Enterprises"
            style={{ width: "215px", height: "auto", objectFit: "contain" }}
          />
        </div>
        <div
          style={{
            width: "45%",
            textAlign: "right",
            lineHeight: "1.35",
            fontSize: "11px",
          }}
        >
          <div style={{ fontWeight: "bold" }}>GSTIN : 29EQSPR9307H1ZX</div>
          <div>Basavanapura Village, Chikkaiahana</div>
          <div>Chatra Hobli, Nanjangud, Mysuru-571 302</div>
          <div style={{ fontWeight: "bold" }}>Mob: 8660712660</div>
          <div>Email: ksenterprises1102@gmail.com</div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #000",
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          <col style={{ width: "7%" }} />
          <col style={{ width: "30%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "17%" }} />
        </colgroup>

        <tbody>
          <tr>
            <td
              colSpan="8"
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "17px",
                height: "28px",
                padding: "5px",
                color: "#1a4fa0",
              }}
            >
              TAX INVOICE
            </td>
          </tr>

          <tr>
            <td
              colSpan="8"
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "11px",
                height: "24px",
                padding: "4px",
              }}
            >
              {invoice.title}
            </td>
          </tr>

          <tr>
            <td
              colSpan="8"
              style={{
                borderLeft: "1px solid #000",
                borderRight: "1px solid #000",
                fontWeight: "bold",
                borderTop: "none",
                borderBottom: "none",
                padding: "5px",
                height: "22px",
                color: "#1a4fa0",
              }}
            >
              Invoice No:{invoice.invoiceNo}
            </td>
          </tr>

          <tr>
            <td
              colSpan="8"
              style={{
                borderLeft: "1px solid #000",
                borderRight: "1px solid #000",
                fontWeight: "bold",
                borderTop: "none",
                borderBottom: "1px solid #000",
                padding: "5px",
                height: "22px",
                color: "#1a4fa0",
              }}
            >
              Invoice Date:{formatDate(invoice.invoiceDate)}
            </td>
          </tr>
          <tr>
            <td
              colSpan="4"
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                padding: "5px",
              }}
            >
              Details of Receiver / Billed to
            </td>
            <td
              colSpan="4"
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                padding: "5px",
              }}
            >
              Details of Consignee
            </td>
          </tr>
          <tr>
            {/* RECEIVER */}
            <td
              colSpan="4"
              style={{
                border: "1px solid #000",
                padding: "5px",
                verticalAlign: "top",
                height: "90px",
                lineHeight: "16px",
              }}
            >
              <div>
                <b>Name</b>&nbsp;&nbsp;{invoice.receiver.name}
              </div>

              <div
                style={{
                  marginTop: "3px",
                  whiteSpace: "pre-line",
                  overflowWrap: "break-word",
                }}
              >
                <b>Address:</b>&nbsp;{invoice.receiver.address}
              </div>

              <div style={{ marginTop: "3px" }}>
                <b>GSTIN:</b>&nbsp;{invoice.receiver.gstin}
              </div>
            </td>

            {/* CONSIGNEE */}
            <td
              colSpan="4"
              style={{
                border: "1px solid #000",
                padding: "5px",
                verticalAlign: "top",
                height: "90px",
                lineHeight: "16px",
              }}
            >
              <div>
                <b>Name</b>&nbsp;&nbsp;{consignee.name}
              </div>

              <div
                style={{
                  marginTop: "3px",
                  whiteSpace: "pre-line",
                  overflowWrap: "break-word",
                }}
              >
                <b>Address:</b>&nbsp;{consignee.address}
              </div>

              <div style={{ marginTop: "3px" }}>
                <b>GSTIN:</b>&nbsp;{consignee.gstin}
              </div>
            </td>
          </tr>

          <tr>
            {/* LEFT SIDE */}
            <td
              colSpan="4"
              style={{
                border: "1px solid #000",
                padding: "0",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        borderRight: "1px solid #000",
                        padding: "5px",
                        width: "18%",
                      }}
                    >
                      State
                    </td>

                    <td
                      style={{
                        borderRight: "1px solid #000",
                        padding: "5px",
                        width: "32%",
                      }}
                    >
                      {invoice.state}
                    </td>

                    <td
                      style={{
                        borderRight: "1px solid #000",
                        padding: "5px",
                        width: "35%",
                      }}
                    >
                      STATE CODE
                    </td>

                    <td
                      style={{
                        padding: "5px",
                        width: "15%",
                        textAlign: "center",
                      }}
                    >
                      {invoice.stateCode}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* RIGHT SIDE */}
            <td
              colSpan="4"
              style={{
                border: "1px solid #000",
                padding: "0",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        borderRight: "1px solid #000",
                        padding: "5px",
                        width: "18%",
                      }}
                    >
                      State
                    </td>

                    <td
                      style={{
                        borderRight: "1px solid #000",
                        padding: "5px",
                        width: "32%",
                      }}
                    >
                      {invoice.state}
                    </td>

                    <td
                      style={{
                        borderRight: "1px solid #000",
                        padding: "5px",
                        width: "35%",
                      }}
                    >
                      STATE CODE
                    </td>

                    <td
                      style={{
                        padding: "5px",
                        width: "15%",
                        textAlign: "center",
                      }}
                    >
                      {invoice.stateCode}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          {/* GAP AFTER STATE ROW */}
          <tr>
            <td
              colSpan="8"
              style={{
                borderLeft: "1px solid #000",
                borderRight: "1px solid #000",
                borderTop: "none",
                borderBottom: "none",
                height: "10px",
                padding: "0",
              }}
            ></td>
          </tr>

          {/* ITEM HEADER */}
          <tr>
            <td
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                padding: "5px",
                width: "7%",
              }}
            >
              SL NO
            </td>
            <td
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                padding: "4px",
              }}
            >
              DESCRIPTION OF
              <br />
              PRODUCT/SERVICE
            </td>
            <td
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                padding: "5px",
                width: "9%",
              }}
            >
              HSN/SAC
            </td>
            <td
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                padding: "5px",
                width: "7%",
              }}
            >
              QTY
            </td>
            <td
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                padding: "5px",
                width: "6%",
              }}
            >
              UOM
            </td>
            <td
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                padding: "5px",
                width: "8%",
              }}
            >
              RATE
            </td>
            <td
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                padding: "5px",
                width: "13%",
              }}
            >
              AMOUNT
            </td>
            <td
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                padding: "5px",
                width: "14%",
              }}
            >
              VALUE OF
              <br />
              SUPPLY
            </td>
          </tr>

          {/* TITLE LINE (SL NO 1 + description title, blank number columns) */}
          <tr>
            <td
              rowSpan={rows.length + 1}
              style={{
                border: "1px solid #000",
                borderBottom: "1px solid #000",
                textAlign: "center",
                verticalAlign: "top",
                padding: "5px",
              }}
            >
              1
            </td>
            <td
              style={{
                border: "1px solid #000",
                borderBottom: "none",
                verticalAlign: "top",
                padding: "5px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {invoice.title}
            </td>
            <td
              style={{
                border: "1px solid #000",
                borderBottom: "none",
                padding: "5px",
              }}
            ></td>
            <td
              style={{
                border: "1px solid #000",
                borderBottom: "none",
                padding: "5px",
              }}
            ></td>
            <td
              style={{
                border: "1px solid #000",
                borderBottom: "none",
                padding: "5px",
              }}
            ></td>
            <td
              style={{
                border: "1px solid #000",
                borderBottom: "none",
                padding: "5px",
              }}
            ></td>
            <td
              style={{
                border: "1px solid #000",
                borderBottom: "none",
                padding: "5px",
              }}
            ></td>
            <td
              style={{
                border: "1px solid #000",
                borderBottom: "none",
                padding: "5px",
              }}
            ></td>
          </tr>

          {/* ITEM ROWS (no lines between them, no repeated SL NO — matches image 1) */}
          {rows.map((r, idx) => {
            const isLast = idx === rows.length - 1;
            return (
              <tr key={r.id || idx}>
                <td
                  style={{
                    border: "1px solid #000",
                    borderTop: "none",
                    borderBottom: isLast ? "1px solid #000" : "none",
                    verticalAlign: "top",
                    padding: "4px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                  }}
                >
                  {r.description}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    borderTop: "none",
                    borderBottom: isLast ? "1px solid #000" : "none",
                    textAlign: "center",
                    verticalAlign: "top",
                    padding: "5px",
                  }}
                >
                  {r.hsn}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    borderTop: "none",
                    borderBottom: isLast ? "1px solid #000" : "none",
                    textAlign: "right",
                    verticalAlign: "top",
                    padding: "5px",
                  }}
                >
                  {r.qty || 0}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    borderTop: "none",
                    borderBottom: isLast ? "1px solid #000" : "none",
                    textAlign: "center",
                    verticalAlign: "top",
                    padding: "5px",
                  }}
                >
                  {r.uom}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    borderTop: "none",
                    borderBottom: isLast ? "1px solid #000" : "none",
                    textAlign: "right",
                    verticalAlign: "top",
                    padding: "5px",
                  }}
                >
                  {Number(r.rate || 0).toFixed(2)}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    borderTop: "none",
                    borderBottom: isLast ? "1px solid #000" : "none",
                    textAlign: "right",
                    verticalAlign: "top",
                    padding: "5px",
                    fontWeight: "bold",
                  }}
                >
                  {r.amount.toFixed(2)}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    borderTop: "none",
                    borderBottom: isLast ? "1px solid #000" : "none",
                    textAlign: "right",
                    verticalAlign: "top",
                    padding: "5px",
                    fontWeight: "bold",
                  }}
                >
                  {r.amount.toFixed(2)}
                </td>
              </tr>
            );
          })}
          {/* GAP AFTER LAST ITEM */}
          <tr>
            <td
              colSpan="8"
              style={{
                borderLeft: "1px solid #000",
                borderRight: "1px solid #000",
                borderTop: "none",
                borderBottom: "none",
                height: "8px",
                padding: "0",
              }}
            ></td>
          </tr>

          {/* TOTAL */}
          <tr>
            <td
              colSpan="3"
              style={{
                border: "1px solid #000",
                textAlign: "right",
                fontWeight: "bold",
                padding: "6px",
              }}
            >
              Total
            </td>
            <td
              style={{
                border: "1px solid #000",
                textAlign: "right",
                fontWeight: "bold",
                padding: "6px",
              }}
            >
              {totalQty.toFixed(2)}
            </td>
            <td
              style={{
                border: "1px solid #000",
                textAlign: "center",
                fontWeight: "bold",
                padding: "6px",
              }}
            >
              TON
            </td>
            <td style={{ border: "1px solid #000", padding: "6px" }}></td>
            <td style={{ border: "1px solid #000", padding: "6px" }}></td>
            <td
              style={{
                border: "1px solid #000",
                textAlign: "right",
                fontWeight: "bold",
                padding: "6px",
              }}
            >
              {totalBeforeTax.toFixed(2)}
            </td>
          </tr>

          {/* GAP AFTER TOTAL */}
          <tr>
            <td
              colSpan="8"
              style={{
                borderLeft: "1px solid #000",
                borderRight: "1px solid #000",
                borderTop: "none",
                borderBottom: "none",
                height: "8px",
                padding: "0",
              }}
            ></td>
          </tr>

          {/* WORDS + TAX SUMMARY */}
          <tr>
            <td
              colSpan="4"
              rowSpan="5"
              style={{
                border: "1px solid #000",
                verticalAlign: "top",
                padding: "8px",
                minHeight: "100px",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                Total Invoice amount in words :
              </div>
              <div
                style={{
                  fontStyle: "italic",
                  fontWeight: "bold",
                  lineHeight: "1.35",
                }}
              >
                {numberToWords(totalAfterTax)}
              </div>
            </td>
            <td
              colSpan="2"
              style={{
                border: "1px solid #000",
                padding: "6px",
                fontWeight: "bold",
              }}
            >
              Total Amount Before Tax
            </td>
            <td
              colSpan="2"
              style={{
                border: "1px solid #000",
                textAlign: "right",
                padding: "6px",
                fontWeight: "bold",
              }}
            >
              {totalBeforeTax.toFixed(2)}
            </td>
          </tr>

          <tr>
            <td
              colSpan="2"
              style={{
                border: "1px solid #000",
                padding: "6px",
                fontWeight: "bold",
              }}
            >
              CGST @ {invoice.cgstRate}%
            </td>
            <td
              colSpan="2"
              style={{
                border: "1px solid #000",
                textAlign: "right",
                padding: "6px",
              }}
            >
              {cgst.toFixed(2)}
            </td>
          </tr>

          <tr>
            <td
              colSpan="2"
              style={{
                border: "1px solid #000",
                padding: "6px",
                fontWeight: "bold",
              }}
            >
              SGST @ {invoice.sgstRate}%
            </td>
            <td
              colSpan="2"
              style={{
                border: "1px solid #000",
                textAlign: "right",
                padding: "6px",
              }}
            >
              {sgst.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td
              colSpan="2"
              style={{
                border: "1px solid #000",
                padding: "6px",
                fontWeight: "bold",
              }}
            >
              Tax Amount GST
            </td>
            <td
              colSpan="2"
              style={{
                border: "1px solid #000",
                textAlign: "right",
                padding: "6px",
              }}
            >
              {(cgst + sgst).toFixed(2)}
            </td>
          </tr>

          <tr>
            <td
              colSpan="2"
              style={{
                border: "1px solid #000",
                padding: "5px",
                fontWeight: "bold",
                textAlign: "left",
              }}
            >
              Total Amount After Tax
            </td>

            <td
              colSpan="2"
              style={{
                border: "1px solid #000",
                padding: "5px",
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              {totalAfterTax.toFixed(2)}
            </td>
          </tr>

          {/* GAP AFTER TOTAL AMOUNT AFTER TAX */}
          <tr>
            <td
              colSpan="8"
              style={{
                borderLeft: "1px solid #000",
                borderRight: "1px solid #000",
                borderTop: "none",
                borderBottom: "none",
                height: "8px",
                padding: "0",
              }}
            ></td>
          </tr>

          {/* TERMS + SIGNATURE */}
          <tr>
            <td
              colSpan="4"
              style={{
                border: "1px solid #000",
                verticalAlign: "top",
                padding: "10px",
                height: "105px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  textDecoration: "underline",
                  marginBottom: "8px",
                }}
              >
                Terms and conditions:
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{invoice.terms}</div>
            </td>
            <td
              colSpan="4"
              style={{
                border: "1px solid #000",
                textAlign: "center",
                verticalAlign: "top",
                padding: "8px",
                height: "105px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "13px",
                  marginBottom: "2px",
                }}
              >
                For K.S. ENTERPRISES
              </div>

              <img
                src={sealSignature}
                alt="K.S. Enterprises Seal and Signature"
                style={{
                  width: "170px",
                  height: "70px",
                  display: "block",
                  margin: "0 auto",
                  objectFit: "contain",
                }}
              />

              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "11px",
                  marginTop: "-8px",
                }}
              >
                Proprietor
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

export default InvoicePreview;
