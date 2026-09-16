import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import InvoiceForm from "./components/InvoiceForm.jsx";
import InvoicePreview from "./components/InvoicePreview.jsx";
import QuotationForm from "./components/QuotationForm.jsx";
import QuotationPreview from "./components/QuotationPreview.jsx";
import EmploymentForm from "./components/EmploymentForm.jsx";
import EmploymentPreview from "./components/EmploymentPreview.jsx";
import logo from "./assets/logo.png";
import cardImage from "./assets/visiting-card.png";
import { emptyInvoice, calcTotals } from "./utils/defaultInvoice.js";
import {
  getAllInvoices,
  saveInvoice,
  deleteInvoice,
  nextInvoiceNumber,
} from "./utils/storage.js";
import {
  emptyQuotation,
  calcQuotationTotals,
} from "./utils/defaultQuotation.js";
import {
  getAllQuotations,
  saveQuotation,
  deleteQuotation,
  nextQuotationNumber,
} from "./utils/quotationStorage.js";
import { emptyEmployment } from "./utils/defaultEmployment.js";
import {
  getAllEmployees,
  saveEmployee,
  deleteEmployee,
  nextCardNumber,
} from "./utils/employmentStorage.js";
import { buildPdfFromNode, sharePdf } from "./utils/pdfGenerator.js";

export default function App() {
  const [screen, setScreen] = useState("list");
  const [docType, setDocType] = useState("invoice"); // "invoice" | "quotation" | "employment"
  const [menuOpen, setMenuOpen] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [invoice, setInvoice] = useState(null);

  const [quotations, setQuotations] = useState([]);
  const [quotation, setQuotation] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(null);

  const [busy, setBusy] = useState(false);
  const previewRef = useRef(null);
  const previewWrapRef = useRef(null);
  const [scale, setScale] = useState(0.42);

  useEffect(() => {
    setInvoices(getAllInvoices());
    setQuotations(getAllQuotations());
    setEmployees(getAllEmployees());
  }, []);

  // Recompute the preview scale so it exactly fills the card width
  // instead of using a hardcoded 0.42 / 340% hack.
  useLayoutEffect(() => {
    if (screen !== "preview") return;
    const el = previewWrapRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 794);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [screen]);

  // ---------- Invoice handlers ----------
  const startNew = () => {
    setInvoice(emptyInvoice(nextInvoiceNumber()));
    setDocType("invoice");
    setScreen("edit");
  };

  const editExisting = (inv) => {
    setInvoice(inv);
    setDocType("invoice");
    setScreen("edit");
  };

  const handleSave = () => {
    const updated = saveInvoice(invoice);
    setInvoices(updated);
    setScreen("preview");
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this invoice?")) return;
    setInvoices(deleteInvoice(id));
  };

  // ---------- Quotation handlers ----------
  const startNewQuotation = () => {
    setQuotation(emptyQuotation(nextQuotationNumber()));
    setDocType("quotation");
    setScreen("edit");
  };

  const editExistingQuotation = (q) => {
    setQuotation(q);
    setDocType("quotation");
    setScreen("edit");
  };

  const handleSaveQuotation = () => {
    const updated = saveQuotation(quotation);
    setQuotations(updated);
    setScreen("preview");
  };

  const handleDeleteQuotation = (id) => {
    if (!confirm("Delete this quotation?")) return;
    setQuotations(deleteQuotation(id));
  };

  // ---------- Employment handlers ----------
  const startNewEmployment = () => {
    setEmployee(emptyEmployment(nextCardNumber()));
    setDocType("employment");
    setScreen("edit");
  };

  const editExistingEmployment = (emp) => {
    setEmployee(emp);
    setDocType("employment");
    setScreen("edit");
  };

  const handleSaveEmployment = () => {
    const updated = saveEmployee(employee);
    setEmployees(updated);
    setScreen("preview");
  };

  const handleDeleteEmployment = (id) => {
    if (!confirm("Delete this employment record?")) return;
    setEmployees(deleteEmployee(id));
  };

  // ---------- Shared: share/export current doc as PDF ----------
  const handleShare = async () => {
    if (!previewRef.current) return;
    setBusy(true);
    try {
      let fileName = "Document.pdf";
      if (docType === "invoice") {
        fileName = `Invoice_${(invoice.invoiceNo || "KS").replace(
          /\//g,
          "-",
        )}.pdf`;
      } else if (docType === "quotation") {
        fileName = `Quotation_${(quotation.quotationNo || "KS").replace(
          /\//g,
          "-",
        )}.pdf`;
      } else if (docType === "employment") {
        fileName = `Employment_${(
          employee.cardNo ||
          employee.name ||
          "KS"
        ).replace(/\//g, "-")}.pdf`;
      }
      const pdf = await buildPdfFromNode(previewRef.current, fileName);
      await sharePdf(pdf);
    } catch (err) {
      alert("Could not share the PDF: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <header className="bg-ksdark text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-2">
            {/* BACK BUTTON */}
            {screen !== "list" && (
              <button
                onClick={() => setScreen("list")}
                className="text-2xl leading-none"
                type="button"
              >
                ‹
              </button>
            )}

            {/* 3 DOT MENU - ONLY ON HOME */}
            {screen === "list" && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-2xl font-bold"
                >
                  ⋮
                </button>

                {/* DROPDOWN MENU */}
                {menuOpen && (
                  <div className="absolute left-0 top-11 w-56 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        startNew();
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-gray-100"
                    >
                      🧾 Add Invoice
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        startNewQuotation();
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-gray-100"
                    >
                      📄 Add Quotation
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        startNewEmployment();
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-gray-100"
                    >
                      🧑‍💼 Add Employment Details
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setScreen("storage");
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-gray-100"
                    >
                      🗂️ Storage
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ksorange">
              {screen === "list"
                ? "K S Enterprises"
                : screen === "storage"
                ? "My Documents"
                : screen === "edit"
                ? docType === "invoice"
                  ? "Edit Invoice"
                  : docType === "quotation"
                  ? "Edit Quotation"
                  : "Edit Employment Details"
                : "Preview"}
            </span>
          </div>
        </div>
      </header>

      {/* CARD IMAGE - HOME PAGE ONLY */}
      {screen === "list" && (
        <div className="max-w-md mx-auto flex justify-center px-4 pt-6 pb-4">
          <img
            src={cardImage}
            alt="K.S. Enterprises"
            className="w-full h-auto object-contain rounded-xl shadow"
          />
        </div>
      )}

      <main className="max-w-md mx-auto px-4 pt-4">
        {screen === "storage" && (
          <div>
            {invoices.length === 0 &&
              quotations.length === 0 &&
              employees.length === 0 && (
                <p className="text-center text-gray-400 text-sm mt-10">
                  No documents yet. Tap a button above to create one.
                </p>
              )}

            {invoices.length > 0 && (
              <div className="mb-2 text-xs font-bold text-gray-400 uppercase">
                Invoices
              </div>
            )}
            <div className="space-y-3">
              {invoices.map((inv) => {
                const { totalAfterTax } = calcTotals(inv);
                return (
                  <div
                    key={inv.id}
                    className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center"
                  >
                    <div
                      onClick={() => editExisting(inv)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-bold text-sm">
                        {inv.invoiceNo || "Untitled"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {inv.receiver.name || "No receiver name"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {inv.invoiceDate}
                      </div>
                      <div className="text-sm font-bold text-ksorange mt-1">
                        ₹ {totalAfterTax.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="text-red-400 text-xs ml-2"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>

            {quotations.length > 0 && (
              <div className="mb-2 mt-6 text-xs font-bold text-gray-400 uppercase">
                Quotations
              </div>
            )}
            <div className="space-y-3">
              {quotations.map((q) => {
                const { grandTotal } = calcQuotationTotals(q);
                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center"
                  >
                    <div
                      onClick={() => editExistingQuotation(q)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-bold text-sm">{q.quotationNo}</div>
                      <div className="text-xs text-gray-500">
                        {q.receiver.name || "No receiver name"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {q.quotationDate}
                      </div>
                      <div className="text-sm font-bold text-ksdark mt-1">
                        ₹ {grandTotal.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteQuotation(q.id)}
                      className="text-red-400 text-xs ml-2"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>

            {employees.length > 0 && (
              <div className="mb-2 mt-6 text-xs font-bold text-gray-400 uppercase">
                Employees
              </div>
            )}
            <div className="space-y-3">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center"
                >
                  <div
                    onClick={() => editExistingEmployment(emp)}
                    className="flex-1 cursor-pointer flex items-center gap-3"
                  >
                    {emp.photo ? (
                      <img
                        src={emp.photo}
                        alt=""
                        className="w-10 h-12 object-cover rounded border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-12 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-[9px] text-gray-400">
                        No Photo
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        {emp.name || "Untitled"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Card No: {emp.cardNo}
                      </div>
                      <div className="text-xs text-gray-400">
                        {emp.designation}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEmployment(emp.id)}
                    className="text-red-400 text-xs ml-2"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {screen === "edit" && docType === "invoice" && invoice && (
          <div>
            <InvoiceForm invoice={invoice} setInvoice={setInvoice} />
            <button
              onClick={handleSave}
              className="w-full bg-ksorange text-white font-bold rounded-xl py-3 mt-4 mb-4 shadow"
            >
              Save & Preview Invoice
            </button>
          </div>
        )}

        {screen === "edit" && docType === "quotation" && quotation && (
          <div>
            <QuotationForm quotation={quotation} setQuotation={setQuotation} />
            <button
              onClick={handleSaveQuotation}
              className="w-full bg-ksdark text-white font-bold rounded-xl py-3 mt-4 mb-4 shadow"
            >
              Save & Preview Quotation
            </button>
          </div>
        )}

        {screen === "edit" && docType === "employment" && employee && (
          <div>
            <EmploymentForm employee={employee} setEmployee={setEmployee} />
            <button
              onClick={handleSaveEmployment}
              className="w-full bg-ksdark text-white font-bold rounded-xl py-3 mt-4 mb-4 shadow"
            >
              Save & Preview Employment Details
            </button>
          </div>
        )}

        {screen === "preview" && (invoice || quotation || employee) && (
          <div>
            <div
              ref={previewWrapRef}
              className="bg-white rounded-xl shadow-sm p-2 mb-4 overflow-hidden"
              style={{ height: 1123 * scale + 16 }}
            >
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  width: 794,
                  height: 1123,
                }}
              >
                {docType === "invoice" ? (
                  <InvoicePreview invoice={invoice} />
                ) : docType === "quotation" ? (
                  <QuotationPreview quotation={quotation} />
                ) : (
                  <EmploymentPreview employee={employee} />
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setScreen("edit")}
                className="flex-1 bg-gray-200 text-gray-700 font-bold rounded-xl py-3"
              >
                Edit
              </button>
              <button
                onClick={handleShare}
                disabled={busy}
                className="flex-1 bg-green-600 text-white font-bold rounded-xl py-3"
              >
                {busy ? "Preparing..." : "Share"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Hidden full-size preview used only for accurate PDF capture */}
      {docType === "invoice" && invoice && (
        <div style={{ position: "fixed", top: 0, left: "-9999px" }}>
          <InvoicePreview ref={previewRef} invoice={invoice} />
        </div>
      )}
      {docType === "quotation" && quotation && (
        <div style={{ position: "fixed", top: 0, left: "-9999px" }}>
          <QuotationPreview ref={previewRef} quotation={quotation} />
        </div>
      )}
      {docType === "employment" && employee && (
        <div style={{ position: "fixed", top: 0, left: "-9999px" }}>
          <EmploymentPreview ref={previewRef} employee={employee} />
        </div>
      )}
    </div>
  );
}
