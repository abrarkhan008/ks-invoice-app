import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useRealtime } from "../lib/useRealtime.js";
import {
  currentYM,
  monthEnd,
  monthStart,
  parseYM,
  todayStr,
  fmtDMY,
  MONTHS,
} from "../lib/dates.js";
import { tonPdf, tonXlsx } from "../lib/exports.js";
import {
  Btn,
  Card,
  Input,
  PageTitle,
  Select,
  Spinner,
  Empty,
} from "../components/ui.jsx";

const Stat = ({ label, value, sub, gold }) => (
  <Card className="relative overflow-hidden p-5">
    <div
      className={
        "absolute inset-x-0 top-0 h-1 " +
        (gold ? "bg-gradient-to-r from-ksorange to-ksgold" : "bg-ksdark")
      }
    />
    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </div>
    <div
      className={
        "mt-2 font-serif text-3xl font-bold " +
        (gold ? "text-ksorange" : "text-ksdark")
      }
    >
      {value}
    </div>
    {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
  </Card>
);

const CatBadge = ({ c }) => (
  <span
    className={
      "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider " +
      (c === "PET"
        ? "bg-slate-900 text-ksgold"
        : "bg-ksmist text-ksorange ring-1 ring-ksgold/40")
    }
  >
    {c || "—"}
  </span>
);

export default function TonList() {
  const { profile, isAdmin } = useAuth();
  const canEdit = isAdmin; // employees can only view
  const [ym, setYm] = useState(currentYM());
  const { y, m } = parseYM(ym);
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    let query = supabase
      .from("ton_entries")
      .select("*")
      .eq("list_type", "primary")
      .gte("entry_date", monthStart(y, m))
      .lte("entry_date", monthEnd(y, m))
      .order("entry_date")
      .order("id");
    // employee: only the rows he added. admin: everything.
    if (!isAdmin) query = query.eq("created_by", profile.id);
    const { data } = await query;
    setRows(data || []);
  }, [y, m, isAdmin, profile.id]);
  useEffect(() => {
    setRows(null);
    load();
  }, [load]);
  useRealtime("ton_entries", load);

  const list = useMemo(() => rows || [], [rows]);
  const shown = list.filter((r) =>
    ((r.vehicle_no || "") + (r.name1 || "") + (r.name2 || ""))
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageTitle
        title="Ton List"
        sub={
          canEdit
            ? `${MONTHS[m]} ${y} · All entries. Changes appear on all phones instantly.`
            : `${MONTHS[m]} ${y} · Your entries only`
        }
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
              disabled={!rows}
              onClick={() => tonXlsx({ y, m, primary: list })}
            >
              ⬇ Excel
            </Btn>
            <Btn
              v="dark"
              disabled={!rows}
              onClick={() => tonPdf({ y, m, primary: list })}
            >
              ⬇ PDF
            </Btn>
          </>
        }
      />

      {/* summary cards */}
      {rows && (
        <div className="mb-5 grid grid-cols-2 gap-3">
          <Stat
            label="Total entries"
            value={list.length}
            sub="vehicles this month"
            gold
          />
        </div>
      )}

      <AddRow me={profile} onAdded={load} />

      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-ksdark">Dispatch register</h2>
          <Input
            placeholder="Search vehicle or name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="!w-60"
          />
        </div>

        {!rows ? (
          <Spinner />
        ) : shown.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            {canEdit
              ? "No entries found for this month."
              : "You have not added any entry this month."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-xs">
              <thead>
                <tr className="bg-ksdark text-left text-[10px] uppercase tracking-[0.14em] text-ksgold">
                  <th className="px-4 py-3.5">Sl</th>
                  <th className="px-2">Billing date</th>
                  <th className="px-2">Name 1</th>
                  <th className="px-2">Name 2</th>
                  <th className="px-2">Vehicle no</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {shown.map((r, i) => (
                  <Row
                    key={r.id}
                    r={r}
                    i={i}
                    canEdit={canEdit}
                    onChanged={load}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function AddRow({ me, onAdded }) {
  const [f, setF] = useState({
    entry_date: todayStr(),
    name1: "",
    name2: "",
    vehicle_no: "",
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const add = async () => {
    if (!f.vehicle_no.trim()) return alert("Enter vehicle number");
    const { error } = await supabase.from("ton_entries").insert({
      list_type: "primary",
      entry_date: f.entry_date,
      name1: f.name1.trim(),
      name2: f.name2.trim(),
      vehicle_no: f.vehicle_no.trim().toUpperCase(),
      created_by: me.id,
    });
    if (error) return alert(error.message);
    setF({ ...f, name1: "", name2: "", vehicle_no: "" });
    onAdded();
  };
  return (
    <Card className="p-5">
      <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ksorange">
        New entry
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <Input type="date" value={f.entry_date} onChange={set("entry_date")} />
        <Input placeholder="Name 1" value={f.name1} onChange={set("name1")} />
        <Input placeholder="Name 2" value={f.name2} onChange={set("name2")} />
        <Input
          placeholder="Vehicle no"
          value={f.vehicle_no}
          onChange={set("vehicle_no")}
        />
        <Btn onClick={add}>+ Add entry</Btn>
      </div>
    </Card>
  );
}

function Row({ r, i, canEdit, onChanged }) {
  const [v, setV] = useState(r);
  useEffect(() => setV(r), [r]);
  const stripe = i % 2 ? "bg-ksivory/60" : "bg-white";

  if (!canEdit) {
    return (
      <tr className={"border-t border-slate-100 " + stripe}>
        <td className="px-4 py-3 text-slate-400">{i + 1}</td>
        <td className="px-2">{fmtDMY(r.entry_date)}</td>
        <td className="px-2">{r.name1}</td>
        <td className="px-2">{r.name2}</td>
        <td className="px-2 font-bold tracking-wide text-ksdark">
          {r.vehicle_no}
        </td>
        <td />
      </tr>
    );
  }

  const save = async (k) => {
    if (String(v[k] ?? "") === String(r[k] ?? "")) return;
    const { error } = await supabase
      .from("ton_entries")
      .update({ [k]: v[k] })
      .eq("id", r.id);
    if (error) alert(error.message);
    else onChanged();
  };
  const cell = (k, cls = "", type = "text") => (
    <input
      type={type}
      value={v[k] ?? ""}
      onChange={(e) => setV({ ...v, [k]: e.target.value })}
      onBlur={() => save(k)}
      className={
        "w-full rounded-md border border-transparent bg-transparent px-1.5 py-1.5 outline-none hover:border-slate-200 focus:border-ksorange focus:bg-white " +
        cls
      }
    />
  );
  return (
    <tr className={"border-t border-slate-100 " + stripe}>
      <td className="px-4 text-slate-400">{i + 1}</td>
      <td className="px-1">{cell("entry_date", "", "date")}</td>
      <td className="px-1">{cell("name1")}</td>
      <td className="px-1">{cell("name2")}</td>
      <td className="px-1">{cell("vehicle_no", "font-bold")}</td>
      <td className="px-2">
        <button
          title="Delete"
          className="rounded-md px-1.5 py-1 text-rose-400 hover:bg-rose-50 hover:text-rose-600"
          onClick={async () => {
            if (confirm("Delete this row?")) {
              await supabase.from("ton_entries").delete().eq("id", r.id);
              onChanged();
            }
          }}
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
