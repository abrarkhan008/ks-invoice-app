import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export const Card = ({ className = "", children, ...p }) => (
  <div
    className={
      "rounded-xl bg-white shadow-premium ring-1 ring-slate-900/[0.06] " +
      className
    }
    {...p}
  >
    {children}
  </div>
);

const variants = {
  primary:
    "bg-gradient-to-b from-ksgold to-ksorange text-ksink shadow-glow hover:brightness-105 active:scale-[.98]",
  dark: "bg-ksdark text-white hover:bg-slate-800 active:scale-[.98]",
  ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger: "bg-rose-50 text-rose-600 ring-1 ring-rose-100 hover:bg-rose-100",
  green: "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[.98]",
};
export const Btn = ({ v = "primary", className = "", ...p }) => (
  <button
    type="button"
    {...p}
    className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[v]} ${className}`}
  />
);

export const Badge = ({ tone = "slate", children }) => {
  const t = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    orange: "bg-ksmist text-ksorange",
    dark: "bg-ksdark text-white",
  }[tone];
  return (
    <span
      className={
        "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider " +
        t
      }
    >
      {children}
    </span>
  );
};

export const Field = ({ label, className = "", children }) => (
  <label className={"block " + className}>
    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
      {label}
    </span>
    {children}
  </label>
);
export const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-base sm:text-sm outline-none transition focus:border-ksorange focus:bg-white focus:ring-4 focus:ring-ksmist";
export const Input = (p) => (
  <input {...p} className={inputCls + " " + (p.className || "")} />
);
export const Select = ({ children, ...p }) => (
  <select {...p} className={inputCls + " " + (p.className || "")}>
    {children}
  </select>
);

export const Spinner = () => (
  <div className="flex justify-center py-12">
    <div className="h-9 w-9 animate-spin rounded-full border-4 border-ksmist border-t-ksorange" />
  </div>
);

export const Empty = ({ icon = "📭", text }) => (
  <Card className="p-12 text-center">
    <div className="mb-2 text-4xl">{icon}</div>
    <p className="text-sm text-slate-400">{text}</p>
  </Card>
);

export function Modal({ title, onClose, children, wide, footer }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const h = (e) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // page behind stops scrolling
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ksink/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-3xl ${
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        }`}
      >
        {/* fixed header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="truncate text-lg font-extrabold text-ksdark">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="ml-3 h-9 w-9 shrink-0 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>
        {/* scrolling body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          {children}
        </div>
        {/* fixed footer (Save button) */}
        {footer && (
          <div className="shrink-0 border-t border-slate-100 bg-white px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export const PageTitle = ({ title, sub, right }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ksdark md:text-3xl">
        {title}
      </h1>
      <div className="mt-1.5 h-1 w-10 rounded-full bg-gradient-to-r from-ksorange to-ksgold" />
      {sub && <p className="mt-2 text-sm text-slate-500">{sub}</p>}
    </div>
    <div className="flex flex-wrap items-center gap-2">{right}</div>
  </div>
);

export const Avatar = ({ src, name = "", size = 44 }) =>
  src ? (
    <img
      src={src}
      alt={name}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover ring-2 ring-white shadow-md"
    />
  ) : (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ksorange to-ksgold font-bold text-white shadow-md ring-2 ring-white"
    >
      {(name[0] || "?").toUpperCase()}
    </div>
  );

// resize a picked photo to ~400px so 50 photos stay tiny
export async function resizeImage(file, max = 400) {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = URL.createObjectURL(file);
  });
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = img.width * k;
  c.height = img.height * k;
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, "image/jpeg", 0.85));
}
