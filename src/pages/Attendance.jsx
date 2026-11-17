import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useRealtime } from "../lib/useRealtime.js";
import {
  currentYM,
  daysIn,
  dayStr,
  monthEnd,
  monthStart,
  pad,
  parseYM,
  MONTHS,
} from "../lib/dates.js";
import { attendancePdf, attendanceXlsx } from "../lib/exports.js";
import { Btn, Card, Input, PageTitle, Spinner } from "../components/ui.jsx";

const NEXT = { undefined: "P", P: "P/2", "P/2": undefined };
const COLOR = {
  P: "bg-emerald-500 text-white shadow-sm",
  "P/2": "bg-amber-400 text-white shadow-sm",
};
const WD = ["S", "M", "T", "W", "T", "F", "S"];

const Stat = ({ label, value, tone }) => (
  <Card className="p-4">
    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {label}
    </div>
    <div className={"mt-1 text-2xl font-extrabold " + tone}>{value}</div>
  </Card>
);

export default function Attendance() {
  const { profile, isAdmin } = useAuth();
  const canEdit = isAdmin || profile.can_mark_attendance;
  const [ym, setYm] = useState(currentYM());
  const { y, m } = parseYM(ym);
  const days = daysIn(y, m);
  const [people, setPeople] = useState(null);
  const [att, setAtt] = useState({});
  const [q, setQ] = useState("");
  const now = new Date();
  const todayD =
    now.getFullYear() === y && now.getMonth() === m ? now.getDate() : -1;
  const isSun = (d) => new Date(y, m, d).getDay() === 0;

  const load = useCallback(async () => {
    const { data: rows } = await supabase
      .from("attendance")
      .select("profile_id,att_date,status")
      .gte("att_date", monthStart(y, m))
      .lte("att_date", monthEnd(y, m));
    const map = {};
    (rows || []).forEach(
      (r) => (map[`${r.profile_id}:${Number(r.att_date.slice(8))}`] = r.status),
    );
    setAtt(map);

    let list;
    if (isAdmin) {
      const { data } = await supabase
        .from("profiles")
        .select("id,emp_code,name,gender,active,role")
        .eq("role", "employee")
        .order("sort_order")
        .order("emp_code");
      const withAtt = new Set((rows || []).map((r) => r.profile_id));
      list = (data || []).filter((p) => p.active || withAtt.has(p.id));
    } else if (canEdit) {
      const { data } = await supabase
        .from("directory")
        .select("id,emp_code,name,gender,role")
        .eq("role", "employee")
        .order("emp_code");
      list = data || [];
    } else {
      list = [
        {
          id: profile.id,
          emp_code: profile.emp_code,
          name: profile.name,
          gender: profile.gender,
        },
      ];
    }
    setPeople(list);
  }, [y, m, isAdmin, canEdit, profile]);

  useEffect(() => {
    setPeople(null);
    load();
  }, [load]);
  useRealtime("attendance", load);

  const setStatus = async (pid, d, status) => {
    setAtt((a) => {
      const n = { ...a };
      status ? (n[`${pid}:${d}`] = status) : delete n[`${pid}:${d}`];
      return n;
    });
    const date = dayStr(y, m, d);
    const res = status
      ? await supabase
          .from("attendance")
          .upsert(
            { profile_id: pid, att_date: date, status, marked_by: profile.id },
            { onConflict: "profile_id,att_date" },
          )
      : await supabase
          .from("attendance")
          .delete()
          .eq("profile_id", pid)
          .eq("att_date", date);
    if (res.error) {
      alert(res.error.message);
      load();
    }
  };
  const markDay = async (d) => {
    if (!canEdit || !confirm(`Mark everyone Present on day ${d}?`)) return;
    const rows = people.map((p) => ({
      profile_id: p.id,
      att_date: dayStr(y, m, d),
      status: "P",
      marked_by: profile.id,
    }));
    const { error } = await supabase
      .from("attendance")
      .upsert(rows, { onConflict: "profile_id,att_date" });
    if (error) alert(error.message);
    else load();
  };

  const total = (pid) => {
    let t = 0;
    for (let d = 1; d <= days; d++) {
      const v = att[`${pid}:${d}`];
      t += v === "P" ? 1 : v === "P/2" ? 0.5 : 0;
    }
    return t;
  };
  const stats = useMemo(() => {
    let full = 0,
      half = 0;
    (people || []).forEach((p) => {
      for (let d = 1; d <= days; d++) {
        const v = att[`${p.id}:${d}`];
        if (v === "P") full++;
        else if (v === "P/2") half++;
      }
    });
    const n = (people || []).length;
    return {
      n,
      full,
      half,
      grand: full + half * 0.5,
      avg: n ? ((full + half * 0.5) / n).toFixed(1) : "0",
    };
  }, [people, att, days]);

  const shift = (n) => {
    const d = new Date(y, m + n, 1);
    setYm(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  };
  const shown = (people || []).filter((p) =>
    (p.name + p.emp_code).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageTitle
        title="Attendance"
        sub={
          canEdit
            ? "Tap a box: P → P/2 → blank. Tap a day number to mark everyone present."
            : "Your attendance for the month"
        }
        right={
          canEdit &&
          people && (
            <>
              <Btn
                v="green"
                onClick={() => attendanceXlsx({ y, m, people, att })}
              >
                ⬇ Excel
              </Btn>
              <Btn
                v="dark"
                onClick={() => attendancePdf({ y, m, people, att })}
              >
                ⬇ PDF
              </Btn>
            </>
          )
        }
      />

      {/* month switcher */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
          <button
            onClick={() => shift(-1)}
            className="h-9 w-9 rounded-xl text-lg hover:bg-slate-100"
          >
            ‹
          </button>
          <div className="min-w-[130px] text-center text-sm font-extrabold text-ksdark">
            {MONTHS[m]} {y}
          </div>
          <button
            onClick={() => shift(1)}
            className="h-9 w-9 rounded-xl text-lg hover:bg-slate-100"
          >
            ›
          </button>
        </div>
        {canEdit && (
          <Input
            placeholder="Search employee…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="!w-56"
          />
        )}
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <i className="h-3 w-3 rounded bg-emerald-500" /> Present
          </span>
          <span className="flex items-center gap-1">
            <i className="h-3 w-3 rounded bg-amber-400" /> Half day
          </span>
          <span className="flex items-center gap-1">
            <i className="h-3 w-3 rounded bg-rose-100" /> Sunday
          </span>
        </div>
      </div>

      {/* summary cards */}
      {people && (
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Employees" value={stats.n} tone="text-ksdark" />
          <Stat label="Full days" value={stats.full} tone="text-emerald-600" />
          <Stat label="Half days" value={stats.half} tone="text-amber-500" />
          <Stat
            label="Total man-days"
            value={stats.grand}
            tone="text-ksorange"
          />
        </div>
      )}

      <Card className="overflow-hidden">
        {!people ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-max min-w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr className="bg-ksdark text-white">
                  <th className="sticky left-0 z-20 w-10 min-w-[40px] bg-ksdark px-2 py-3 text-left">
                    Sl
                  </th>
                  <th className="sticky left-10 z-20 min-w-[170px] bg-ksdark px-2 py-3 text-left">
                    Employee
                  </th>
                  {Array.from({ length: days }, (_, i) => {
                    const d = i + 1;
                    return (
                      <th
                        key={d}
                        onClick={() => markDay(d)}
                        className={
                          "w-8 min-w-[34px] py-2 text-center font-semibold " +
                          (isSun(d) ? "bg-rose-600/80 " : "") +
                          (d === todayD ? "!bg-ksorange " : "") +
                          (canEdit ? "cursor-pointer hover:bg-white/10" : "")
                        }
                      >
                        <div>{d}</div>
                        <div className="text-[9px] font-normal opacity-70">
                          {WD[new Date(y, m, d).getDay()]}
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-4 py-3 text-center">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p, i) => (
                  <tr key={p.id} className="group">
                    <td className="sticky left-0 z-10 border-b border-slate-100 bg-white px-2 text-slate-400 group-hover:bg-ksmist">
                      {i + 1}
                    </td>
                    <td className="sticky left-10 z-10 border-b border-slate-100 bg-white px-2 py-2 group-hover:bg-ksmist">
                      <div className="font-bold text-ksdark">{p.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {p.emp_code}
                      </div>
                    </td>
                    {Array.from({ length: days }, (_, k) => {
                      const d = k + 1,
                        v = att[`${p.id}:${d}`];
                      return (
                        <td
                          key={d}
                          className={
                            "border-b border-slate-100 p-0.5 text-center " +
                            (isSun(d) ? "bg-rose-50/70" : "")
                          }
                        >
                          <button
                            disabled={!canEdit}
                            onClick={() => setStatus(p.id, d, NEXT[v])}
                            className={
                              "h-7 w-7 rounded-lg text-[10px] font-bold transition " +
                              (v
                                ? COLOR[v]
                                : "bg-slate-100 text-slate-300 hover:bg-slate-200")
                            }
                          >
                            {v || "·"}
                          </button>
                        </td>
                      );
                    })}
                    <td className="border-b border-slate-100 px-3 text-center">
                      <span className="rounded-full bg-ksmist px-3 py-1 text-sm font-extrabold text-ksorange">
                        {total(p.id)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50">
                  <td
                    colSpan={2 + days}
                    className="px-3 py-3 text-right text-sm font-bold text-slate-600"
                  >
                    Grand total (man-days)
                  </td>
                  <td className="px-3 text-center text-base font-extrabold text-ksorange">
                    {stats.grand}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
