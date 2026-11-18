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
    ((r.vehicle_no || "") + (r.worker_names || ""))
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  const sumBy = (arr, k) => arr.reduce((s, r) => s + (+r[k] || 0), 0);
  const totQty = sumBy(list, "invoiced_qty");
  const totTon = sumBy(list, "tonnage");
  const dairy = sumBy(
    list.filter((r) => r.category === "DAIRY"),
    "tonnage",
  );
  const pet = sumBy(
    list.filter((r) => r.category === "PET"),
    "tonnage",
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
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="Total entries"
            value={list.length}
            sub="vehicles this month"
          />
          <Stat label="Invoiced qty" value={totQty.toLocaleString("en-IN")} />
          <Stat
            label="Total tonnage"
            value={totTon.toFixed(2)}
            sub="2nd weigh slip"
            gold
          />
          <Stat
            label="Dairy / PET"
            value={`${dairy.toFixed(1)} / ${pet.toFixed(1)}`}
            sub="tonnage split"
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
            <table className="w-full min-w-[820px] text-xs">
              <thead>
                <tr className="bg-ksdark text-left text-[10px] uppercase tracking-[0.14em] text-ksgold">
                  <th className="px-4 py-3.5">Sl</th>
                  <th className="px-2">Billing date</th>
                  <th className="px-2">Vehicle no</th>
                  <th className="px-2 text-right">Invoiced qty</th>
                  <th className="px-2 text-right">Tonnage</th>
                  <th className="px-3">Type</th>
                  <th className="px-2">Loaded by</th>
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
              <tfoot>
                <tr className="border-t-2 border-ksgold/60 bg-ksmist text-sm font-bold text-ksdark">
                  <td
                    colSpan={3}
                    className="px-4 py-3.5 text-right uppercase tracking-wider"
                  >
                    Total
                  </td>
                  <td className="px-2 text-right">
                    {totQty.toLocaleString("en-IN")}
                  </td>
                  <td className="px-2 text-right text-ksorange">
                    {totTon.toFixed(2)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
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
    vehicle_no: "",
    invoiced_qty: "",
    tonnage: "",
    category: "DAIRY",
    worker_names: "",
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const add = async () => {
    if (!f.vehicle_no.trim()) return alert("Enter vehicle number");
    const { error } = await supabase.from("ton_entries").insert({
      list_type: "primary",
      entry_date: f.entry_date,
      vehicle_no: f.vehicle_no.trim().toUpperCase(),
      invoiced_qty: Number(f.invoiced_qty) || 0,
      tonnage: Number(f.tonnage) || 0,
      category: f.category,
      party_name: null,
      worker_names: f.worker_names,
      created_by: me.id,
    });
    if (error) return alert(error.message);
    setF({ ...f, vehicle_no: "", invoiced_qty: "", tonnage: "" });
    onAdded();
  };
  return (
    <Card className="p-5">
      <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ksorange">
        New entry
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
        <Input type="date" value={f.entry_date} onChange={set("entry_date")} />
        <Input
          placeholder="Vehicle no"
          value={f.vehicle_no}
          onChange={set("vehicle_no")}
        />
        <Input
          type="number"
          placeholder="Invoiced qty"
          value={f.invoiced_qty}
          onChange={set("invoiced_qty")}
        />
        <Input
          type="number"
          step="0.01"
          placeholder="Tonnage"
          value={f.tonnage}
          onChange={set("tonnage")}
        />
        <Select value={f.category} onChange={set("category")}>
          <option>DAIRY</option>
          <option>PET</option>
        </Select>
        <Input
          placeholder="Names (who loaded)"
          value={f.worker_names}
          onChange={set("worker_names")}
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
        <td className="px-2 font-bold tracking-wide text-ksdark">
          {r.vehicle_no}
        </td>
        <td className="px-2 text-right">{r.invoiced_qty}</td>
        <td className="px-2 text-right font-semibold">{r.tonnage}</td>
        <td className="px-3">
          <CatBadge c={r.category} />
        </td>
        <td className="px-2 text-slate-600">{r.worker_names}</td>
        <td />
      </tr>
    );
  }

  const save = async (k) => {
    if (String(v[k] ?? "") === String(r[k] ?? "")) return;
    const val = ["invoiced_qty", "tonnage"].includes(k)
      ? Number(v[k]) || 0
      : v[k];
    const { error } = await supabase
      .from("ton_entries")
      .update({ [k]: val })
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
      <td className="px-1">{cell("vehicle_no", "font-bold")}</td>
      <td className="px-1">{cell("invoiced_qty", "text-right", "number")}</td>
      <td className="px-1">
        {cell("tonnage", "text-right font-semibold", "number")}
      </td>
      <td className="px-2">
        <select
          value={v.category || ""}
          className="rounded-md bg-transparent px-1 py-1 text-xs font-bold"
          onChange={(e) => {
            setV({ ...v, category: e.target.value });
            supabase
              .from("ton_entries")
              .update({ category: e.target.value })
              .eq("id", r.id)
              .then(onChanged);
          }}
        >
          <option>DAIRY</option>
          <option>PET</option>
        </select>
      </td>
      <td className="px-1">{cell("worker_names")}</td>
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
