import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

export async function buildPdfFromNode(node, fileName) {
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Fit the WHOLE invoice onto a single page (scale to fit, don't tile).
  const canvasRatio = canvas.width / canvas.height;
  const pageRatio = pageWidth / pageHeight;

  let renderWidth, renderHeight;
  if (canvasRatio > pageRatio) {
    renderWidth = pageWidth;
    renderHeight = pageWidth / canvasRatio;
  } else {
    renderHeight = pageHeight;
    renderWidth = pageHeight * canvasRatio;
  }
  const x = (pageWidth - renderWidth) / 2;
  const y = 0;

  pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);

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
