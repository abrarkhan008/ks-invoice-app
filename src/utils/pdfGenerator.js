import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

// export async function buildPdfFromNode(node, fileName) {
//   const canvas = await html2canvas(node, {
//     scale: 2,
//     useCORS: true,
//     backgroundColor: "#ffffff",
//   });
//   const imgData = canvas.toDataURL("image/png");

//   const pdf = new jsPDF({ unit: "pt", format: "a4" });
//   const pageWidth = pdf.internal.pageSize.getWidth();
//   const pageHeight = pdf.internal.pageSize.getHeight();

//   // Fit the WHOLE invoice onto a single page (scale to fit, don't tile).
//   const canvasRatio = canvas.width / canvas.height;
//   const pageRatio = pageWidth / pageHeight;

//   let renderWidth, renderHeight;
//   if (canvasRatio > pageRatio) {
//     renderWidth = pageWidth;
//     renderHeight = pageWidth / canvasRatio;
//   } else {
//     renderHeight = pageHeight;
//     renderWidth = pageHeight * canvasRatio;
//   }
//   const x = (pageWidth - renderWidth) / 2;
//   const y = 0;

//   pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);

//   const blob = pdf.output("blob");
//   const base64 = await blobToBase64(blob);
//   return { blob, base64, fileName: fileName || "invoice.pdf" };
// }
export async function buildPdfFromNode(node, fileName) {
  const SCALE = 2;
  const MARGIN = 40; // top/bottom white space on every page (in preview px)

  const canvas = await html2canvas(node, {
    scale: SCALE,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidthPt = pdf.internal.pageSize.getWidth();
  const pageHeightPt = pdf.internal.pageSize.getHeight();

  // ---- measurements in "preview px" (794 wide) ----
  const nodeW = node.offsetWidth;
  const pageH = (nodeW * pageHeightPt) / pageWidthPt; // ≈ 1123
  const ptPerPx = pageWidthPt / nodeW;
  const pxRatio = canvas.width / nodeW; // canvas px per preview px
  const totalH = canvas.height / pxRatio;

  // If the preview is shown scaled (CSS transform), correct for it
  const rect = node.getBoundingClientRect();
  const k = rect.width / nodeW || 1;

  // Blocks that must never be cut in the middle: table rows + [data-keep]
  const blocks = Array.from(node.querySelectorAll("tr, [data-keep]")).map(
    (el) => {
      const r = el.getBoundingClientRect();
      return { top: (r.top - rect.top) / k, bottom: (r.bottom - rect.top) / k };
    },
  );

  // ---- decide where every page starts / ends ----
  const pages = [];
  if (totalH <= pageH + 2) {
    pages.push({ start: 0, end: totalH }); // fits on one page
  } else {
    let start = 0;
    while (start < totalH - 1) {
      const isFirst = pages.length === 0;
      const usable = pageH - (isFirst ? 0 : MARGIN) - MARGIN;
      let end = Math.min(start + usable, totalH);

      if (end < totalH) {
        // if the cut falls inside a row/signature, move the cut above it
        let moved = true;
        while (moved) {
          moved = false;
          for (const b of blocks) {
            if (b.top > start + 1 && b.top < end && b.bottom > end + 0.5) {
              end = b.top;
              moved = true;
            }
          }
        }
      }
      pages.push({ start, end });
      start = end;
    }
  }

  // ---- draw each page ----
  pages.forEach((p, i) => {
    if (i > 0) pdf.addPage();
    const sy = Math.round(p.start * pxRatio);
    const sh = Math.max(1, Math.round((p.end - p.start) * pxRatio));

    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sh;
    const ctx = slice.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, slice.width, sh);
    ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

    const yPt = i === 0 ? 0 : MARGIN * ptPerPx;
    pdf.addImage(
      slice.toDataURL("image/png"),
      "PNG",
      0,
      yPt,
      pageWidthPt,
      (p.end - p.start) * ptPerPx,
    );
  });

  const blob = pdf.output("blob");
  const base64 = await blobToBase64(blob);
  return { blob, base64, fileName: fileName || "invoice.pdf" };
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function sharePdf({ blob, base64, fileName }) {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    const saved = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
    });

    await Share.share({
      title: fileName,
      text: "Tax Invoice - K S Enterprises",
      url: saved.uri,
      dialogTitle: "Share Invoice",
    });
    return;
  }

  const file = new File([blob], fileName, { type: "application/pdf" });
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: fileName,
      text: "Tax Invoice - K S Enterprises",
      files: [file],
    });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    alert(
      "Sharing isn't supported in this browser, so the PDF was downloaded instead. On your installed phone app, this button opens the native share sheet (WhatsApp, Email, etc.).",
    );
  }
}
// Saves the PDF to the device (browser = downloads folder,
// phone app = opens the save/share sheet so you can choose "Save to Files")
export async function downloadPdf({ blob, base64, fileName }) {
  if (Capacitor.isNativePlatform()) {
    const saved = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
    });
    await Share.share({
      title: fileName,
      url: saved.uri,
      dialogTitle: "Save PDF",
    });
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}