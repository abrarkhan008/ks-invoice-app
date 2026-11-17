// All Excel + PDF downloads. Excel files copy the layout of YOUR three sheets
// (Attendance_MAY_2026, FORM-22_SEP-2026, Ton_List) including the formulas.
import logo from "../assets/logo.png";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { MONTHS, daysIn, monthLabel, fmtDMY, inr, pad } from "./dates.js";
import { numberToWords } from "../utils/numberToWords.js";

const XLSX_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const ARIAL = { name: "Arial", size: 10 };
const thin = { style: "thin", color: { argb: "FF000000" } };
const BORDER = { top: thin, left: thin, bottom: thin, right: thin };
const GREY = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE5E7EB" },
};

// ---------- saving (works in browser AND in the Android APK) ----------
const blobToBase64 = (blob) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });

export async function saveFile(blob, name) {
  if (Capacitor.isNativePlatform()) {
    const saved = await Filesystem.writeFile({
      path: name,
      data: await blobToBase64(blob),
      directory: Directory.Cache,
    });
    await Share.share({
      title: name,
      url: saved.uri,
      dialogTitle: "Save / Share",
    });
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

async function newBook() {
  const ExcelJS = (await import("exceljs")).default;
  return new ExcelJS.Workbook();
}
async function saveBook(wb, name) {
  const buf = await wb.xlsx.writeBuffer();
  await saveFile(new Blob([buf], { type: XLSX_TYPE }), name);
}
async function newPdf(orientation = "landscape", format = "a4") {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  return { doc: new jsPDF({ orientation, unit: "pt", format }), autoTable };
}
async function savePdf(doc, name) {
  await saveFile(doc.output("blob"), name);
}
const toDataUrl = async (url) => {
  const blob = await (await fetch(url)).blob();
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(blob);
  });
};
const style = (cell, o = {}) => {
  cell.font = {
    ...ARIAL,
    bold: !!o.bold,
    color: o.color ? { argb: o.color } : undefined,
  };
  cell.border = BORDER;
  cell.alignment = {
    vertical: "middle",
    horizontal: o.h || "center",
    wrapText: true,
  };
  if (o.fill) cell.fill = GREY;
};

// =====================================================================
// 1. ATTENDANCE  (format of Attendance_MAY_2026.xlsx)
//    people: [{id, emp_code, name, gender}]   att: { "profileId:day": "P" | "P/2" }
// =====================================================================
export async function attendanceXlsx({ y, m, people, att }) {
  const wb = await newBook();
  const ws = wb.addWorksheet("Sheet1");
  const days = daysIn(y, m),
    first = 5,
    last = 4 + days,
    tot = last + 1;
  const L = (c) => ws.getColumn(c).letter;

  ws.mergeCells(1, 1, 1, 4);
  ws.getCell(1, 1).value = "KS -ENTERPRISES";
  style(ws.getCell(1, 1), { bold: true });
  [
    ["Sl. No.", 1],
    ["Emp. ID", 2],
    ["Name of the Employee", 3],
    ["Male/ Female", 4],
  ].forEach(([t, c]) => {
    ws.mergeCells(2, c, 3, c);
    ws.getCell(2, c).value = t;
    style(ws.getCell(2, c), { bold: true, fill: true });
    style(ws.getCell(3, c), { fill: true });
  });
  ws.mergeCells(2, first, 2, last);
  ws.getCell(2, first).value = `Parle Attendance             ${monthLabel(
    y,
    m,
  )}`;
  style(ws.getCell(2, first), { bold: true, fill: true });
  for (let d = 1; d <= days; d++) {
    ws.getCell(3, 4 + d).value = d;
    style(ws.getCell(3, 4 + d), { bold: true, fill: true });
  }
  ws.getCell(3, tot).value = "TOTAL";
  style(ws.getCell(3, tot), { bold: true, fill: true });

  people.forEach((p, i) => {
    const r = 4 + i;
    ws.getCell(r, 1).value = i + 1;
    ws.getCell(r, 2).value = p.emp_code;
    ws.getCell(r, 3).value = p.name;
    ws.getCell(r, 4).value = p.gender || "Male";
    let total = 0;
    for (let d = 1; d <= days; d++) {
      const v = att[`${p.id}:${d}`];
      if (v) ws.getCell(r, 4 + d).value = v;
      total += v === "P" ? 1 : v === "P/2" ? 0.5 : 0;
    }
    ws.getCell(r, tot).value = {
      formula: `COUNTIF(${L(first)}${r}:${L(last)}${r},"P")+COUNTIF(${L(
        first,
      )}${r}:${L(last)}${r},"P/2")/2`,
      result: total,
    };
    for (let c = 1; c <= tot; c++)
      style(ws.getCell(r, c), { h: c === 3 ? "left" : "center" });
  });

  const tr = 4 + people.length;
  const sum = people.reduce((s, p) => {
    for (let d = 1; d <= days; d++) {
      const v = att[`${p.id}:${d}`];
      s += v === "P" ? 1 : v === "P/2" ? 0.5 : 0;
    }
    return s;
  }, 0);
  ws.getCell(tr, tot).value = {
    formula: `SUM(${L(tot)}4:${L(tot)}${tr - 1})`,
    result: sum,
  };
  style(ws.getCell(tr, tot), { bold: true });

  ws.getColumn(1).width = 9;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 34;
  ws.getColumn(4).width = 12;
  for (let c = first; c <= last; c++) ws.getColumn(c).width = 5;
  ws.getColumn(tot).width = 11;
  ws.views = [{ state: "frozen", xSplit: 3, ySplit: 3 }];
  await saveBook(wb, `Attendance_${MONTHS[m]}_${y}.xlsx`);
}

// // =====================================================================
// // 2. FORM 22  (format of FORM-22_SEP-2026.xlsx, same columns A..AG, same formulas)
// //    rows: [{ emp, calc }]
export async function attendancePdf({ y, m, people, att }) {
  const { doc, autoTable } = await newPdf("landscape", "a4");
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const days = daysIn(y, m);
  const isSun = (d) => new Date(y, m, d).getDay() === 0;
  const NAVY = [11, 18, 32],
    GOLD = [184, 146, 63];
  let logoData = null;
  try {
    logoData = await toDataUrl(logo);
  } catch {}

  const drawHead = () => {
    doc.setFillColor(...NAVY).rect(0, 0, W, 64, "F");
    doc.setFillColor(...GOLD).rect(0, 64, W, 2.5, "F");
    if (logoData) doc.addImage(logoData, "PNG", 20, 9, 72, 46);
    doc
      .setTextColor(255)
      .setFont(undefined, "bold")
      .setFontSize(16)
      .text("K S  ENTERPRISES", 108, 30);
    doc
      .setFont(undefined, "normal")
      .setFontSize(8.5)
      .setTextColor(200, 205, 215)
      .text(
        "Monthly Attendance Register  ·  Parle Agro Pvt Ltd, Nanjangud",
        108,
        46,
      );
    doc
      .setFont(undefined, "bold")
      .setFontSize(13)
      .setTextColor(...GOLD)
      .text(monthLabel(y, m), W - 20, 40, { align: "right" });
  };

  let full = 0,
    half = 0;
  const body = people.map((p, i) => {
    let t = 0;
    const row = [i + 1, p.emp_code, p.name, (p.gender || "Male")[0]];
    for (let d = 1; d <= days; d++) {
      const v = att[`${p.id}:${d}`] || "";
      row.push(v);
      if (v === "P") {
        t += 1;
        full++;
      } else if (v === "P/2") {
        t += 0.5;
        half++;
      }
    }
    row.push(t);
    return row;
  });
  const grand = full + half * 0.5;
  body.push([
    {
      content: "TOTAL MAN-DAYS",
      colSpan: 4 + days,
      styles: {
        halign: "right",
        fontStyle: "bold",
        fillColor: [241, 234, 219],
      },
    },
    {
      content: String(grand),
      styles: {
        fontStyle: "bold",
        fillColor: NAVY,
        textColor: [212, 178, 106],
      },
    },
  ]);

  doc.setFont(undefined, "normal").setFontSize(9).setTextColor(70);
  doc.text(
    `Employees: ${people.length}     Full days: ${full}     Half days: ${half}     Total man-days: ${grand}`,
    20,
    86,
  );
  doc
    .setFontSize(7)
    .setTextColor(130)
    .text(
      "P = Present     P/2 = Half day     Shaded column = Sunday",
      W - 20,
      86,
      { align: "right" },
    );

  const colStyles = {
    0: { cellWidth: 22 },
    1: { cellWidth: 60 },
    2: { halign: "left", cellWidth: 104, fontStyle: "bold" },
    3: { cellWidth: 24 },
  };
  for (let d = 1; d <= days; d++) colStyles[3 + d] = { cellWidth: 18 };
  colStyles[4 + days] = { cellWidth: 32, fontStyle: "bold" };

  autoTable(doc, {
    startY: 96,
    margin: { left: 20, right: 20, top: 80, bottom: 40 },
    head: [
      [
        "Sl",
        "Emp. ID",
        "Name of the Employee",
        "M/F",
        ...Array.from(
          { length: days },
          (_, i) => `${i + 1}\n${"SMTWTFS"[new Date(y, m, i + 1).getDay()]}`,
        ),
        "Total",
      ],
    ],
    body,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 2,
      halign: "center",
      valign: "middle",
      minCellHeight: 20,
      lineColor: [221, 214, 200],
      lineWidth: 0.4,
      textColor: [30, 35, 45],
    },
    headStyles: {
      fillColor: NAVY,
      textColor: [212, 178, 106],
      fontSize: 7,
      fontStyle: "bold",
    },
    columnStyles: colStyles,
    didParseCell: (h) => {
      const c = h.column.index,
        isDay = c >= 4 && c < 4 + days;
      if (isDay && isSun(c - 3)) {
        if (h.section === "head") h.cell.styles.fillColor = [122, 28, 28];
        else if (h.cell.raw === "") h.cell.styles.fillColor = [248, 240, 240];
      }
      if (h.section === "body" && isDay) {
        if (h.cell.raw === "P") {
          h.cell.styles.fillColor = [220, 240, 228];
          h.cell.styles.textColor = [22, 101, 52];
          h.cell.styles.fontStyle = "bold";
        }
        if (h.cell.raw === "P/2") {
          h.cell.styles.fillColor = [248, 236, 205];
          h.cell.styles.textColor = [133, 94, 20];
          h.cell.styles.fontStyle = "bold";
        }
      }
    },
    didDrawPage: () => {
      drawHead();
      doc.setFont(undefined, "normal").setFontSize(7.5).setTextColor(130);
      doc.text(
        "Computer generated attendance register · K S Enterprises",
        20,
        H - 18,
      );
      doc.text(
        `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
        W - 20,
        H - 18,
        { align: "right" },
      );
    },
  });

  let yy = doc.lastAutoTable.finalY + 60;
  if (yy > H - 50) {
    doc.addPage();
    yy = 120;
  }
  doc
    .setDrawColor(...GOLD)
    .setLineWidth(0.8)
    .setTextColor(70)
    .setFontSize(8.5);
  doc.line(20, yy, 180, yy);
  doc.text("Prepared by", 20, yy + 12);
  doc.line(W / 2 - 80, yy, W / 2 + 80, yy);
  doc.text("Checked by (Supervisor)", W / 2 - 80, yy + 12);
  doc.line(W - 180, yy, W - 20, yy);
  doc.text("Authorised Signatory", W - 180, yy + 12);

  await savePdf(doc, `Attendance_${MONTHS[m]}_${y}.pdf`);
}
// =====================================================================
const F22_HEAD = [
  "Sl.No",
  "Designation",
  "ID No",
  "DOJ",
  "ESI Number",
  "UAN Number",
  "PF No",
  "Name of the Employee",
  "Fixed Basic & DA",
  "Fixed Other Allow",
  "Fixed Bonus",
  "Fixed LWW",
  "Fixed PH",
  "Fixed Gross",
  "AWD",
  "Pay Days",
  "OT Hours",
  "Basic & DA",
  "N&F H",
  "LWW",
  "Bonus",
  "PH",
  "ESI Wages",
  "Gross Total",
  "PF",
  "ESI",
  "PT",
  "LWF",
  "others",
  "canteen",
  "Total Deduction",
  "Net Payable",
  "Mode of payment",
];

export async function form22Xlsx({ y, m, rows }) {
  const wb = await newBook();
  const ws = wb.addWorksheet("Sheet1");
  const top = [
    "FORM\u00a0NO\u00a022\u00a0(See\u00a0Rule\u00a0137)",
    "I. Form 22 (Muster Roll-cum-Register Wages Salary/Subsistence Allowance) Rule 137 of the Karnataka Factories Rules, (1969)",
    "II. Form V (Rule 29(1) of the Karnataka Minimum Wages Rules, 1958)",
    "III. Form VII (Rule 29(5) of the Karnataka Minimum Wages Rules, 1958)",
    "IV. Form  III (Rule 5 of the Karnataka Payment of Wages Rules, 1963)",
    " ",
    "VI. Form XVII (Rules 78(1)(a)(i) of the Contract Labour (Regulation & Abolition) (Karnataka) Rules, 1974",
  ];
  top.forEach((t, i) => {
    ws.mergeCells(i + 1, 1, i + 1, 34);
    ws.getCell(i + 1, 1).value = t;
    ws.getCell(i + 1, 1).font = { ...ARIAL, bold: true };
    ws.getCell(i + 1, 1).alignment = { horizontal: "center" };
  });
  ws.mergeCells(8, 1, 8, 33);
  ws.getCell(8, 1).value = "M/S Parle Agro Pvt Ltd";
  ws.mergeCells(9, 1, 9, 6);
  ws.getCell(9, 1).value = "Name and address of the Factory/Establishment:";
  ws.mergeCells(9, 31, 9, 33);
  ws.getCell(9, 31).value = "Adakanahalli Industrial Area,";
  ws.mergeCells(10, 2, 10, 6);
  ws.getCell(10, 2).value = "M/S KS  Enterprises,";
  ws.mergeCells(10, 31, 10, 33);
  ws.getCell(10, 31).value = "Nanjangud Taluk, Mysore(D)";
  ws.mergeCells(11, 1, 11, 34);
  ws.getCell(11, 1).value = "BASAVANAPURA";
  ws.mergeCells(12, 1, 12, 34);
  ws.getCell(12, 1).value = "NANJANGUD-571302";
  ws.mergeCells(13, 13, 13, 15);
  ws.getCell(13, 13).value = new Date(Date.UTC(y, m, 1));
  ws.getCell(13, 13).numFmt = "mmm-yy";
  for (let r = 8; r <= 13; r++) ws.getRow(r).font = { ...ARIAL, bold: true };

  F22_HEAD.forEach((h, i) => {
    const c = ws.getCell(14, i + 1);
    c.value = h;
    style(c, { bold: true, fill: true });
  });
  ws.getRow(14).height = 30;

  const first = 15;
  rows.forEach(({ emp, calc }, i) => {
    const r = first + i;
    const f = (col, formula, result) => {
      ws.getCell(`${col}${r}`).value = { formula, result };
    };
    const set = (col, v) => {
      ws.getCell(`${col}${r}`).value = v;
    };
    set("A", i + 1);
    set("B", emp.designation);
    set("C", emp.emp_code);
    set("D", fmtDMY(emp.doj));
    set("E", emp.esi_no);
    set("F", emp.uan_no);
    set("G", emp.pf_no);
    set("H", emp.name);
    set("I", calc.fixedBasic);
    set("J", calc.fixedOther);
    f("K", `ROUND(I${r}*8.33%,0)`, calc.fixedBonus);
    f("L", `I${r}/26*1.25`, calc.fixedLww);
    set("M", calc.fixedPh);
    f("N", `SUM(I${r}:J${r})`, calc.fixedGross);
    set("O", calc.payDays);
    set("P", calc.payDays);
    set("Q", calc.ot);
    f("R", `ROUND(I${r}/26*P${r},0)`, calc.basic);
    set("S", calc.nfh);
    f("T", `ROUND(L${r}/26*P${r},0)`, calc.lww);
    f("U", `ROUND(K${r}/26*P${r},0)`, calc.bonus);
    f("V", `ROUND(M${r}/26*P${r},0)`, calc.ph);
    f("W", `SUM(R${r}+S${r}+T${r})`, calc.esiWages);
    f("X", `SUM(R${r}:V${r})`, calc.gross);
    f("Y", `ROUND(IF(R${r}>=15000,1800, R${r}*12%),0)`, calc.pf);
    f("Z", `CEILING(W${r}*0.75%,1)`, calc.esi);
    set("AA", calc.pt);
    set("AB", calc.lwf);
    set("AC", calc.others);
    set("AD", calc.canteen);
    f("AE", `SUM(Y${r}:AD${r})`, calc.totalDed);
    f("AF", `SUM(X${r}-AE${r})`, calc.net);
    set("AG", "BANK PAYMENT");
    for (let c = 1; c <= 33; c++)
      style(ws.getCell(r, c), { h: c === 8 ? "left" : "center" });
  });
  const tr = first + rows.length,
    lastR = tr - 1;
  const totals = { O: "gross", P: "payDays" };
  [
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "AA",
    "AB",
    "AC",
    "AD",
    "AE",
    "AF",
  ].forEach((col) => {
    const key = {
      O: "payDays",
      P: "payDays",
      Q: "ot",
      R: "basic",
      S: "nfh",
      T: "lww",
      U: "bonus",
      V: "ph",
      W: "esiWages",
      X: "gross",
      Y: "pf",
      Z: "esi",
      AA: "pt",
      AB: "lwf",
      AC: "others",
      AD: "canteen",
      AE: "totalDed",
      AF: "net",
    }[col];
    const res = rows.reduce((s, x) => s + x.calc[key], 0);
    ws.getCell(`${col}${tr}`).value = {
      formula: `SUM(${col}${first}:${col}${lastR})`,
      result: res,
    };
    style(ws.getCell(`${col}${tr}`), { bold: true });
  });
  void totals;
  const widths = [6, 12, 15, 11, 13, 15, 8, 26];
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));
  for (let c = 9; c <= 33; c++) ws.getColumn(c).width = 11;
  ws.getColumn(33).width = 16;
  ws.views = [{ state: "frozen", xSplit: 8, ySplit: 14 }];
  await saveBook(wb, `FORM-22_${MONTHS[m]}-${y}.xlsx`);
}

export async function form22Pdf({ y, m, rows }) {
  const { doc, autoTable } = await newPdf("landscape", "a3");
  doc
    .setFontSize(12)
    .text(
      "FORM NO 22 (See Rule 137) - Muster Roll-cum-Register of Wages",
      30,
      28,
    );
  doc
    .setFontSize(9)
    .text(
      `M/S Parle Agro Pvt Ltd  |  M/S KS Enterprises, Basavanapura, Nanjangud-571302  |  ${monthLabel(
        y,
        m,
      )}`,
      30,
      42,
    );
  const keys = [
    "basic",
    "nfh",
    "lww",
    "bonus",
    "ph",
    "esiWages",
    "gross",
    "pf",
    "esi",
    "pt",
    "lwf",
    "others",
    "canteen",
    "totalDed",
    "net",
  ];
  const body = rows.map(({ emp, calc }, i) => [
    i + 1,
    emp.designation,
    emp.emp_code,
    fmtDMY(emp.doj),
    emp.esi_no || "",
    emp.uan_no || "",
    emp.pf_no || "",
    emp.name,
    calc.fixedBasic,
    calc.fixedOther,
    calc.fixedBonus,
    calc.fixedLww.toFixed(2),
    calc.fixedPh,
    calc.fixedGross,
    calc.payDays,
    calc.payDays,
    calc.ot,
    ...keys.map((k) => calc[k]),
    "BANK PAYMENT",
  ]);
  const sum = (k) => rows.reduce((s, x) => s + x.calc[k], 0);
  body.push([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "TOTAL",
    "",
    "",
    "",
    "",
    "",
    "",
    sum("payDays"),
    sum("payDays"),
    sum("ot"),
    ...keys.map(sum),
    "",
  ]);
  autoTable(doc, {
    startY: 52,
    head: [F22_HEAD],
    body,
    styles: {
      fontSize: 5.5,
      cellPadding: 1.5,
      halign: "center",
      lineColor: 0,
      lineWidth: 0.3,
    },
    headStyles: { fillColor: [229, 231, 235], textColor: 0 },
    columnStyles: { 7: { halign: "left", cellWidth: 70 } },
    theme: "grid",
  });
  await savePdf(doc, `FORM-22_${MONTHS[m]}-${y}.pdf`);
}

// =====================================================================
// 3. TON LIST (format of Ton_List.xlsx: Primary on the left, Secondary on the right)
//    Invoice number + Buyer are REMOVED, "Names" column added.
// =====================================================================
export async function tonXlsx({ y, m, primary }) {
  const wb = await newBook();
  const ws = wb.addWorksheet("Sheet1");
  const last = daysIn(y, m),
    lab = `${MONTHS[m]}-${y}(01.${pad(m + 1)}.${String(y).slice(
      2,
    )} TO ${last}.${pad(m + 1)}.${y})`;

  ws.mergeCells(1, 1, 1, 6);
  ws.getCell(1, 1).value = `KS ENTERPRISES Ton list  month of ${lab}`;
  ws.getCell(1, 1).font = { ...ARIAL, bold: true };
  ws.getCell(1, 1).alignment = { horizontal: "center" };

  [
    "sl number",
    "Billing date",
    "Vehicle no",
    "Sum of Invoiced Quantity",
    "Tonnage as per SECOND WEIGH SLIP",
    "Names",
  ].forEach((h, i) => {
    const c = ws.getCell(2, 1 + i);
    c.value = h;
    style(c, { bold: true, fill: true });
  });

  primary.forEach((e, i) => {
    const r = 3 + i;
    [
      i + 1,
      fmtDMY(e.entry_date),
      e.vehicle_no,
      Number(e.invoiced_qty) || 0,
      Number(e.tonnage) || 0,
      e.worker_names || "",
    ].forEach((v, k) => {
      ws.getCell(r, 1 + k).value = v;
      style(ws.getCell(r, 1 + k), { h: k === 5 ? "left" : "center" });
    });
  });

  const pEnd = 2 + primary.length,
    pt = 3 + primary.length;
  ws.getCell(pt, 4).value = {
    formula: `SUM(D3:D${pEnd})`,
    result: primary.reduce((s, e) => s + (+e.invoiced_qty || 0), 0),
  };
  ws.getCell(pt, 5).value = {
    formula: `SUM(E3:E${pEnd})`,
    result: primary.reduce((s, e) => s + (+e.tonnage || 0), 0),
  };
  [
    [pt, 4],
    [pt, 5],
  ].forEach(([r, c]) => style(ws.getCell(r, c), { bold: true }));

  const cat = (k) =>
    primary.filter((e) => (e.category || "").toUpperCase() === k);
  let r = pt + 3;
  ["DAIRY", "PET"].forEach((k) => {
    ws.getCell(r, 3).value = k;
    ws.getCell(r, 4).value = cat(k).reduce(
      (s, e) => s + (+e.invoiced_qty || 0),
      0,
    );
    ws.getCell(r, 5).value = cat(k).reduce((s, e) => s + (+e.tonnage || 0), 0);
    for (let c = 3; c <= 5; c++) style(ws.getCell(r, c), { bold: true });
    r += 2;
  });
  ws.getCell(r, 4).value = {
    formula: `SUM(D${pt + 3}:D${r - 1})`,
    result: primary.reduce((s, e) => s + (+e.invoiced_qty || 0), 0),
  };
  ws.getCell(r, 5).value = {
    formula: `SUM(E${pt + 3}:E${r - 1})`,
    result: primary.reduce((s, e) => s + (+e.tonnage || 0), 0),
  };
  style(ws.getCell(r, 4), { bold: true });
  style(ws.getCell(r, 5), { bold: true });

  [8, 13, 24, 16, 28, 30].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.getRow(2).height = 42;
  await saveBook(wb, `Ton_List_${MONTHS[m]}_${y}.xlsx`);
}

export async function tonPdf({ y, m, primary }) {
  const { doc, autoTable } = await newPdf("portrait", "a4");
  const W = doc.internal.pageSize.getWidth();
  const tt = (k) => primary.reduce((s, e) => s + (+e[k] || 0), 0);
  doc.setFillColor(11, 18, 32).rect(0, 0, W, 56, "F");
  doc.setFillColor(184, 146, 63).rect(0, 56, W, 2.5, "F");
  doc
    .setTextColor(255)
    .setFont(undefined, "bold")
    .setFontSize(14)
    .text("K S ENTERPRISES", 30, 30);
  doc
    .setFont(undefined, "normal")
    .setFontSize(9)
    .setTextColor(212, 178, 106)
    .text(`Ton List · ${monthLabel(y, m)}`, 30, 45);
  autoTable(doc, {
    startY: 74,
    head: [
      [
        "Sl",
        "Billing date",
        "Vehicle no",
        "Invoiced Qty",
        "Tonnage (2nd weigh slip)",
        "Type",
        "Names",
      ],
    ],
    body: [
      ...primary.map((e, i) => [
        i + 1,
        fmtDMY(e.entry_date),
        e.vehicle_no,
        e.invoiced_qty,
        e.tonnage,
        e.category || "",
        e.worker_names || "",
      ]),
      ["", "", "TOTAL", tt("invoiced_qty"), tt("tonnage").toFixed(2), "", ""],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [221, 214, 200],
      lineWidth: 0.4,
    },
    headStyles: { fillColor: [11, 18, 32], textColor: [212, 178, 106] },
    theme: "grid",
    didParseCell: (d) => {
      if (d.section === "body" && d.row.index === primary.length) {
        d.cell.styles.fontStyle = "bold";
        d.cell.styles.fillColor = [241, 234, 219];
      }
    },
  });
  await savePdf(doc, `Ton_List_${MONTHS[m]}_${y}.pdf`);
}

// =====================================================================
// 4. PAYSLIP PDF (one employee, one month)
// =====================================================================
export async function payslipPdf({ y, m, emp, calc }) {
  const { doc, autoTable } = await newPdf("portrait", "a4");
  const W = doc.internal.pageSize.getWidth();
  const NAVY = [11, 18, 32],
    GOLD = [184, 146, 63],
    LINE = [221, 214, 200];

  doc.setFillColor(...NAVY).rect(0, 0, W, 96, "F");
  doc.setFillColor(...GOLD).rect(0, 96, W, 3, "F");
  try {
    doc.addImage(await toDataUrl(logo), "PNG", 30, 22, 96, 52);
  } catch {}
  doc
    .setTextColor(255)
    .setFont(undefined, "bold")
    .setFontSize(15)
    .text("K S ENTERPRISES", W - 30, 38, { align: "right" });
  doc.setFont(undefined, "normal").setFontSize(7.5).setTextColor(200, 205, 215);
  doc.text(
    "Basavanapura Village, Chikkaiahana, Chatra Hobli, Nanjangud, Mysuru-571 302",
    W - 30,
    52,
    { align: "right" },
  );
  doc.text("GSTIN: 29EQSPR9307H1ZX   |   Mob: 8660712660", W - 30, 64, {
    align: "right",
  });

  doc
    .setTextColor(...NAVY)
    .setFont(undefined, "bold")
    .setFontSize(15)
    .text("PAY SLIP", W / 2, 132, { align: "center" });
  doc
    .setFontSize(9)
    .setTextColor(...GOLD)
    .text(monthLabel(y, m), W / 2, 147, { align: "center" });

  autoTable(doc, {
    startY: 162,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 5,
      lineColor: LINE,
      lineWidth: 0.5,
      textColor: [30, 35, 45],
    },
    body: [
      ["Employee Name", emp.name, "Employee ID", emp.emp_code],
      [
        "Designation",
        emp.designation || "",
        "Date of Joining",
        fmtDMY(emp.doj),
      ],
      ["ESI No", emp.esi_no || "-", "UAN No", emp.uan_no || "-"],
      ["PF No", emp.pf_no || "-", "Pay Days", String(calc.payDays)],
    ],
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [246, 244, 239], cellWidth: 95 },
      2: { fontStyle: "bold", fillColor: [246, 244, 239], cellWidth: 95 },
    },
  });

  const earn = [
    ["Basic & DA", calc.basic],
    ["N&F Holiday", calc.nfh],
    ["Leave with Wages", calc.lww],
    ["Bonus", calc.bonus],
    ["Paid Holiday", calc.ph],
  ];
  const ded = [
    ["PF", calc.pf],
    ["ESI", calc.esi],
    ["Prof. Tax", calc.pt],
    ["LWF", calc.lwf],
    ["Others", calc.others],
    ["Canteen", calc.canteen],
  ];
  const rows = Array.from({ length: 6 }, (_, i) => [
    earn[i]?.[0] || "",
    earn[i] ? inr(earn[i][1]) : "",
    ded[i]?.[0] || "",
    ded[i] ? inr(ded[i][1]) : "",
  ]);
  rows.push([
    "GROSS EARNINGS",
    inr(calc.gross),
    "TOTAL DEDUCTIONS",
    inr(calc.totalDed),
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    theme: "grid",
    head: [["Earnings", "Amount (Rs)", "Deductions", "Amount (Rs)"]],
    body: rows,
    styles: {
      fontSize: 9,
      cellPadding: 6,
      lineColor: LINE,
      lineWidth: 0.5,
      textColor: [30, 35, 45],
    },
    headStyles: { fillColor: NAVY, textColor: [212, 178, 106] },
    columnStyles: { 1: { halign: "right" }, 3: { halign: "right" } },
    didParseCell: (d) => {
      if (d.section === "body" && d.row.index === rows.length - 1) {
        d.cell.styles.fontStyle = "bold";
        d.cell.styles.fillColor = [241, 234, 219];
      }
    },
  });

  const y2 = doc.lastAutoTable.finalY + 20;
  doc.setFillColor(...NAVY).roundedRect(30, y2, W - 60, 44, 4, 4, "F");
  doc
    .setTextColor(200, 205, 215)
    .setFont(undefined, "normal")
    .setFontSize(8)
    .text("NET PAYABLE", 44, y2 + 17);
  doc
    .setTextColor(212, 178, 106)
    .setFont(undefined, "bold")
    .setFontSize(16)
    .text(`Rs ${inr(calc.net)}`, 44, y2 + 36);
  doc.setTextColor(70).setFont(undefined, "normal").setFontSize(9);
  doc.text(`In words: ${numberToWords(calc.net)}`, 30, y2 + 66);
  doc.text("Mode of payment: BANK PAYMENT", 30, y2 + 82);

  doc
    .setDrawColor(...GOLD)
    .setLineWidth(0.8)
    .line(W - 190, y2 + 130, W - 30, y2 + 130);
  doc.setFontSize(8.5).text("Authorised Signatory", W - 190, y2 + 143);
  doc
    .setFontSize(7.5)
    .setTextColor(130)
    .text("This is a computer generated pay slip.", W / 2, 810, {
      align: "center",
    });

  await savePdf(
    doc,
    `Payslip_${emp.emp_code.replace(/\//g, "-")}_${MONTHS[m]}-${y}.pdf`,
  );
}
