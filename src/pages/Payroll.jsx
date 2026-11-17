import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { calcPay, daysFromStatuses } from "../lib/payroll.js";
import { currentYM, inr, monthEnd, monthStart, parseYM } from "../lib/dates.js";
import { form22Pdf, form22Xlsx, payslipPdf } from "../lib/exports.js";
import { Btn, Card, Input, PageTitle, Spinner } from "../components/ui.jsx";

const EDIT = ["payDays", "ot", "nfh", "pt", "lwf", "others", "canteen"];
const HEAD = {
  payDays: "Pay days",
  ot: "OT hrs",
  nfh: "N&F H",
  pt: "PT",
  lwf: "LWF",
  others: "Others",
  canteen: "Canteen",
};

export default function Payroll() {
  const [ym, setYm] = useState(currentYM());
  const { y, m } = parseYM(ym);
  const [emps, setEmps] = useState(null);
  const [inputs, setInputs] = useState({}); // profileId -> {payDays, ot, ...}
  const [slips, setSlips] = useState({}); // profileId -> saved payslip row
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setEmps(null);
    const [{ data: ps }, { data: att }, { data: sl }] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("role", "employee")
        .order("sort_order")
        .order("emp_code"),
      supabase
        .from("attendance")
        .select("profile_id,status")
        .gte("att_date", monthStart(y, m))
        .lte("att_date", monthEnd(y, m)),
      supabase.from("payslips").select("*").eq("month", monthStart(y, m)),
    ]);
    const bySlip = Object.fromEntries((sl || []).map((s) => [s.profile_id, s]));
    const statuses = {};
    (att || []).forEach((a) => (statuses[a.profile_id] ||= []).push(a.status));
    const list = (ps || []).filter(
      (p) => p.active || statuses[p.id] || bySlip[p.id],
    );
    const inp = {};
    list.forEach((p) => {
      const s = bySlip[p.id]?.data;
      inp[p.id] = s
        ? Object.fromEntries(EDIT.map((k) => [k, s[k] ?? 0])) // saved values win
        : {
            payDays: daysFromStatuses(statuses[p.id] || []),
            ot: 0,
            nfh: 0,
            pt: 0,
            lwf: 0,
            others: 0,
            canteen: 0,
          };
    });
    setSlips(bySlip);
    setInputs(inp);
    setEmps(list);
  }, [y, m]);
  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(
    () =>
      (emps || []).map((emp) => ({ emp, calc: calcPay(emp, inputs[emp.id]) })),
    [emps, inputs],
  );
  const sum = (k) => rows.reduce((s, r) => s + r.calc[k], 0);
  const setIn = (id, k, v) =>
    setInputs((o) => ({ ...o, [id]: { ...o[id], [k]: v } }));

  const persist = async (publish) => {
    setBusy(true);
    const now = new Date().toISOString();
    const payload = rows.map(({ emp, calc }) => {
      const old = slips[emp.id];
      const pub = publish === undefined ? old?.published ?? false : publish;
      return {
        profile_id: emp.id,
        month: monthStart(y, m),
        data: calc,
        published: pub,
        published_at: pub ? old?.published_at ?? now : null,
      };
    });
    const { error } = await supabase
      .from("payslips")
      .upsert(payload, { onConflict: "profile_id,month" });
    setBusy(false);
    if (error) return alert(error.message);
    await load();
    alert(
      publish === true
        ? "Payslips sent to all employees ✅"
        : publish === false
        ? "Payslips hidden from employees"
        : "Saved",
    );
  };
  const sendOne = async (emp, calc) => {
    const old = slips[emp.id];
    const { error } = await supabase.from("payslips").upsert(
      {
        profile_id: emp.id,
        month: monthStart(y, m),
        data: calc,
        published: true,
        published_at: old?.published_at ?? new Date().toISOString(),
      },
      { onConflict: "profile_id,month" },
    );
    if (error) return alert(error.message);
    setSlips((s) => ({
      ...s,
      [emp.id]: { ...(s[emp.id] || {}), published: true },
    }));
    alert(`Payslip sent to ${emp.name} ✅`);
  };
  return (
    <div>
      <PageTitle
        title="Payroll & Payslips"
        sub="Pay days come from attendance. Edit any value, then save and publish."
        right={
          <>
            <Input
              type="month"
              value={ym}
              onChange={(e) => e.target.value && setYm(e.target.value)}
              className="!w-44"
            />
            <Btn
              v="green"
              disabled={!emps}
              onClick={() => form22Xlsx({ y, m, rows })}
            >
              ⬇ Form 22 Excel
            </Btn>
            <Btn
              v="dark"
              disabled={!emps}
              onClick={() => form22Pdf({ y, m, rows })}
            >
              ⬇ Form 22 PDF
            </Btn>
          </>
        }
      />
      <Card className="overflow-hidden">
        {!emps ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-max min-w-full text-xs">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="sticky left-0 bg-slate-100 px-2 py-2">
                    Employee
                  </th>
                  {EDIT.map((k) => (
                    <th key={k} className="px-1 py-2">
                      {HEAD[k]}
                    </th>
                  ))}
                  <th className="px-2">Gross</th>
                  <th className="px-2">PF</th>
                  <th className="px-2">ESI</th>
                  <th className="px-2">Deduction</th>
                  <th className="px-2">Net pay</th>
                  <th className="px-2">Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ emp, calc }) => (
                  <tr key={emp.id} className="border-t border-slate-100">
                    <td className="sticky left-0 min-w-[140px] bg-white px-2 py-1.5">
                      <div className="font-semibold text-ksdark">
                        {emp.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {emp.emp_code}
                      </div>
                    </td>
                    {EDIT.map((k) => (
                      <td key={k} className="px-1">
                        <input
                          type="number"
                          step="0.5"
                          value={inputs[emp.id]?.[k] ?? 0}
                          onChange={(e) => setIn(emp.id, k, e.target.value)}
                          className="w-16 rounded-lg border border-slate-200 px-1.5 py-1 text-right outline-none focus:border-ksorange"
                        />
                      </td>
                    ))}
                    <td className="px-2 text-right">{inr(calc.gross)}</td>
                    <td className="px-2 text-right">{calc.pf}</td>
                    <td className="px-2 text-right">{calc.esi}</td>
                    <td className="px-2 text-right">{inr(calc.totalDed)}</td>
                    <td className="px-2 text-right font-extrabold text-ksdark">
                      {inr(calc.net)}
                    </td>
                    <td className="px-2">
                      {slips[emp.id]?.published ? (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          SENT
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          DRAFT
                        </span>
                      )}
                    </td>
                    <td className="px-1 whitespace-nowrap">
                      <button
                        className="mr-1 rounded-lg bg-slate-100 px-2 py-1 font-semibold hover:bg-slate-200"
                        onClick={() => payslipPdf({ y, m, emp, calc })}
                      >
                        PDF
                      </button>
                      <button
                        className="rounded-lg bg-ksorange px-2 py-1 font-semibold text-white"
                        onClick={() => sendOne(emp, calc)}
                      >
                        Send
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                  <td className="px-2 py-2">TOTAL</td>
                  <td className="px-1 text-center">{sum("payDays")}</td>
                  <td colSpan={6} />
                  <td className="px-2 text-right">{inr(sum("gross"))}</td>
                  <td className="px-2 text-right">{sum("pf")}</td>
                  <td className="px-2 text-right">{sum("esi")}</td>
                  <td className="px-2 text-right">{inr(sum("totalDed"))}</td>
                  <td className="px-2 text-right text-ksorange">
                    {inr(sum("net"))}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <div className="mt-4 flex flex-wrap gap-2">
        <Btn
          v="dark"
          disabled={busy || !emps}
          onClick={() => persist(undefined)}
        >
          💾 Save draft
        </Btn>
        <Btn
          disabled={busy || !emps}
          onClick={() =>
            confirm("Send these payslips to ALL employees now?") &&
            persist(true)
          }
        >
          📤 Save & send to employees
        </Btn>
        <Btn v="ghost" disabled={busy || !emps} onClick={() => persist(false)}>
          Hide from employees
        </Btn>
      </div>
    </div>
  );
}
