import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useRealtime } from "../lib/useRealtime.js";
import { MONTHS, inr } from "../lib/dates.js";
import { payslipPdf } from "../lib/exports.js";
import { Btn, Card, Modal, PageTitle, Spinner } from "../components/ui.jsx";

export default function MyPayslips() {
  const { profile } = useAuth();
  const [slips, setSlips] = useState(null);
  const [open, setOpen] = useState(null);
  const load = async () => {
    const { data } = await supabase
      .from("payslips")
      .select("*")
      .order("month", { ascending: false });
    setSlips(data || []);
  };
  useEffect(() => {
    load();
  }, []);
  useRealtime("payslips", load);

  return (
    <div>
      <PageTitle title="My Payslips" sub="Sent to you by the admin" />
      {!slips ? (
        <Spinner />
      ) : slips.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-400">
          No payslip has been sent yet.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slips.map((s) => {
            const [y, mm] = s.month.split("-").map(Number);
            return (
              <Card
                key={s.id}
                className="cursor-pointer p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => setOpen(s)}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-ksorange">
                  {MONTHS[mm - 1]} {y}
                </div>
                <div className="mt-1 text-2xl font-extrabold text-ksdark">
                  ₹ {inr(s.data.net)}
                </div>
                <div className="text-xs text-slate-400">
                  {s.data.payDays} days · tap to view
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {open &&
        (() => {
          const [y, mm] = open.month.split("-").map(Number);
          const c = open.data;
          const line = (a, b) => (
            <div className="flex justify-between border-b border-slate-100 py-1.5 text-sm">
              <span>{a}</span>
              <b>{inr(b)}</b>
            </div>
          );
          return (
            <Modal
              title={`Payslip · ${MONTHS[mm - 1]} ${y}`}
              onClose={() => setOpen(null)}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-bold uppercase text-emerald-600">
                    Earnings
                  </div>
                  {line("Basic & DA", c.basic)}
                  {line("N&F Holiday", c.nfh)}
                  {line("Leave with wages", c.lww)}
                  {line("Bonus", c.bonus)}
                  {line("Paid holiday", c.ph)}
                  {line("Gross", c.gross)}
                </div>
                <div>
                  <div className="mb-1 text-xs font-bold uppercase text-rose-600">
                    Deductions
                  </div>
                  {line("PF", c.pf)}
                  {line("ESI", c.esi)}
                  {line("Prof. tax", c.pt)}
                  {line("LWF", c.lwf)}
                  {line("Others", c.others)}
                  {line("Canteen", c.canteen)}
                  {line("Total", c.totalDed)}
                </div>
              </div>
              <div className="my-4 rounded-2xl bg-gradient-to-r from-ksorange to-ksgold p-4 text-center text-white">
                <div className="text-xs uppercase tracking-wider opacity-80">
                  Net payable
                </div>
                <div className="text-3xl font-extrabold">₹ {inr(c.net)}</div>
              </div>
              <Btn
                className="w-full"
                onClick={() =>
                  payslipPdf({ y, m: mm - 1, emp: profile, calc: c })
                }
              >
                ⬇ Download PDF
              </Btn>
            </Modal>
          );
        })()}
    </div>
  );
}
