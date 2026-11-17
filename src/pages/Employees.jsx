import { useCallback, useEffect, useState } from "react";
import { supabase, adminApi } from "../lib/supabase.js";
import {
  Avatar,
  Badge,
  Btn,
  Card,
  Empty,
  Field,
  Input,
  Modal,
  PageTitle,
  Select,
  Spinner,
  resizeImage,
} from "../components/ui.jsx";
import { DESIGNATIONS, RATE_CARD } from "../lib/payroll.js";
import { fmtDMY } from "../lib/dates.js";

const blank = {
  emp_code: "",
  name: "",
  password: "",
  role: "employee",
  designation: "Unskilled",
  gender: "Male",
  dob: "",
  doj: "",
  esi_no: "",
  uan_no: "",
  pf_no: "",
  mobile: "",
  aadhaar: "",
  bank_details: "",
  fixed_basic: RATE_CARD.Unskilled.fixed_basic,
  fixed_other: 0,
  fixed_ph: RATE_CARD.Unskilled.fixed_ph,
  can_mark_attendance: false,
  sort_order: 0,
};

export default function Employees() {
  const [list, setList] = useState(null);
  const [edit, setEdit] = useState(null); // null | blank (new) | profile
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("sort_order")
      .order("emp_code");
    setList(data || []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const shown = (list || []).filter((p) =>
    (p.name + p.emp_code).toLowerCase().includes(q.toLowerCase()),
  );
  const active = (list || []).filter((p) => p.active).length;

  return (
    <div>
      <PageTitle
        title="Employees"
        sub={
          list
            ? `${active} active · ${list.length} total`
            : "Create logins, change IDs & passwords, remove access"
        }
        right={
          <div className="flex w-full gap-2 sm:w-auto">
            <Input
              placeholder="Search name or ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 sm:!w-56"
            />
            <Btn onClick={() => setEdit({ ...blank })} className="shrink-0">
              + Add
            </Btn>
          </div>
        }
      />

      {!list ? (
        <Spinner />
      ) : shown.length === 0 ? (
        <Empty icon="👥" text="No employees found." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <Card
              key={p.id}
              className={
                "group relative overflow-hidden transition hover:-translate-y-1 hover:shadow-xl " +
                (p.active ? "" : "opacity-60")
              }
            >
              <div
                className={
                  "h-1.5 w-full " +
                  (p.active
                    ? "bg-gradient-to-r from-ksorange to-ksgold"
                    : "bg-slate-300")
                }
              />
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <Avatar src={p.photo_url} name={p.name} size={60} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-serif text-lg font-bold text-ksdark">
                      {p.name}
                    </div>
                    <div className="truncate text-xs font-semibold tracking-wide text-ksorange">
                      {p.emp_code}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {p.designation}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-ksivory p-3 text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Date of joining
                    </div>
                    <div className="font-semibold text-ksdark">
                      {fmtDMY(p.doj) || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Mobile
                    </div>
                    <div className="font-semibold text-ksdark">
                      {p.mobile || "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {p.role === "admin" && <Badge tone="dark">Admin</Badge>}
                    {!p.active && <Badge tone="rose">Left / Blocked</Badge>}
                    {p.can_mark_attendance && (
                      <Badge tone="orange">Supervisor</Badge>
                    )}
                    {p.active && p.role !== "admin" && (
                      <Badge tone="green">Active</Badge>
                    )}
                  </div>
                  <Btn
                    v="dark"
                    onClick={() => setEdit(p)}
                    className="!px-4 !py-1.5 text-xs"
                  >
                    ✏️ Edit
                  </Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {edit && (
        <EmployeeModal
          emp={edit}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            load();
          }}
        />
      )}
    </div>
  );
}

const Sec = ({ title, children }) => (
  <div className="mb-6">
    <div className="mb-3 border-b border-ksgold/40 pb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ksorange">
      {title}
    </div>
    <div className="grid gap-3 sm:grid-cols-2">{children}</div>
  </div>
);

function EmployeeModal({ emp, onClose, onSaved }) {
  const isNew = !emp.id;
  const [f, setF] = useState({ ...emp });
  const [busy, setBusy] = useState(false);
  const [newPw, setNewPw] = useState("");

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setF((p) => ({ ...p, [k]: v }));
  };

  const pickDesignation = (e) => {
    const d = e.target.value;
    setF((p) => ({ ...p, designation: d, ...(RATE_CARD[d] || {}) })); // auto-fill salary
  };

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      await fn();
      if (okMsg) alert(okMsg);
    } catch (x) {
      alert(x.message);
    } finally {
      setBusy(false);
    }
  };

  const clean = () => {
    const { password, id, created_at, photo_url, ...rest } = f;
    ["dob", "doj"].forEach((k) => {
      if (!rest[k]) rest[k] = null;
    });
    ["fixed_basic", "fixed_other", "fixed_ph", "sort_order"].forEach(
      (k) => (rest[k] = Number(rest[k]) || 0),
    );
    rest.emp_code = (rest.emp_code || "").trim();
    rest.name = (rest.name || "").trim();
    return rest;
  };

  const save = () =>
    run(async () => {
      if (!f.emp_code?.trim()) throw new Error("Please enter Employee ID");
      if (!f.name?.trim()) throw new Error("Please enter Name");
      if (isNew) {
        if (!f.password || f.password.length < 6)
          throw new Error("Password must be at least 6 characters");
        await adminApi("create", { ...clean(), password: f.password });
      } else {
        const { emp_code, ...rest } = clean();
        if (emp_code !== emp.emp_code)
          await adminApi("set_code", { id: emp.id, emp_code });
        const { error } = await supabase
          .from("profiles")
          .update(rest)
          .eq("id", emp.id);
        if (error) throw error;
      }
      onSaved();
    });

  const upload = (e) =>
    run(async () => {
      const file = e.target.files?.[0];
      if (!file) return;
      const blob = await resizeImage(file);
      const path = `${emp.id}-${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase
        .from("profiles")
        .update({ photo_url: data.publicUrl })
        .eq("id", emp.id);
      setF((p) => ({ ...p, photo_url: data.publicUrl }));
    });

  return (
    <Modal
      wide
      title={isNew ? "Add employee" : `Edit · ${emp.name}`}
      onClose={onClose}
      footer={
        <Btn onClick={save} disabled={busy} className="w-full !py-3 text-base">
          {busy ? "Please wait…" : isNew ? "Create employee" : "Save changes"}
        </Btn>
      }
    >
      {!isNew && (
        <div className="mb-6 flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
          <Avatar src={f.photo_url} name={f.name} size={72} />
          <div>
            <label className="inline-block cursor-pointer rounded-xl bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-slate-200 hover:bg-slate-100">
              📷 Change photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={upload}
              />
            </label>
            <div className="mt-1 text-xs text-slate-400">
              Photo is shown on birthdays
            </div>
          </div>
        </div>
      )}

      <Sec title="Login details">
        <Field label="Employee ID (login ID)">
          <Input
            value={f.emp_code}
            onChange={set("emp_code")}
            placeholder="KS032/2026-27"
            autoCapitalize="characters"
          />
        </Field>
        <Field label="Full name">
          <Input value={f.name} onChange={set("name")} />
        </Field>
        {isNew && (
          <Field label="Password (min 6)" className="sm:col-span-2">
            <Input
              value={f.password}
              onChange={set("password")}
              placeholder="Give this to the employee"
            />
          </Field>
        )}
        <Field label="Role">
          <Select value={f.role} onChange={set("role")}>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>
        <Field label="Gender">
          <Select value={f.gender} onChange={set("gender")}>
            <option>Male</option>
            <option>Female</option>
          </Select>
        </Field>
      </Sec>

      <Sec title="Personal & job">
        <Field label="Designation">
          <Select value={f.designation} onChange={pickDesignation}>
            {DESIGNATIONS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Mobile">
          <Input type="tel" value={f.mobile || ""} onChange={set("mobile")} />
        </Field>
        <Field label="Date of birth">
          <Input type="date" value={f.dob || ""} onChange={set("dob")} />
        </Field>
        <Field label="Date of joining">
          <Input type="date" value={f.doj || ""} onChange={set("doj")} />
        </Field>
        <Field label="Aadhaar">
          <Input value={f.aadhaar || ""} onChange={set("aadhaar")} />
        </Field>
        <Field label="Sort order (Sl.No)">
          <Input
            type="number"
            value={f.sort_order}
            onChange={set("sort_order")}
          />
        </Field>
      </Sec>

      <Sec title="Statutory & bank">
        <Field label="ESI number">
          <Input value={f.esi_no || ""} onChange={set("esi_no")} />
        </Field>
        <Field label="UAN number">
          <Input value={f.uan_no || ""} onChange={set("uan_no")} />
        </Field>
        <Field label="PF number">
          <Input value={f.pf_no || ""} onChange={set("pf_no")} />
        </Field>
        <Field label="Bank name & A/C no">
          <Input value={f.bank_details || ""} onChange={set("bank_details")} />
        </Field>
      </Sec>

      <Sec title="Salary (auto-filled from designation)">
        <Field label="Fixed Basic & DA">
          <Input
            type="number"
            inputMode="decimal"
            value={f.fixed_basic}
            onChange={set("fixed_basic")}
          />
        </Field>
        <Field label="Fixed Other Allow">
          <Input
            type="number"
            inputMode="decimal"
            value={f.fixed_other}
            onChange={set("fixed_other")}
          />
        </Field>
        <Field label="Fixed PH">
          <Input
            type="number"
            inputMode="decimal"
            value={f.fixed_ph}
            onChange={set("fixed_ph")}
          />
        </Field>
      </Sec>

      <label className="mb-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5"
          checked={!!f.can_mark_attendance}
          onChange={set("can_mark_attendance")}
        />
        <span>
          Allow this employee to fill attendance for everyone (e.g. supervisor)
        </span>
      </label>

      {!isNew && (
        <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Access control
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="New password (min 6)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
            <Btn
              v="dark"
              disabled={busy || newPw.length < 6}
              className="shrink-0"
              onClick={() =>
                run(async () => {
                  await adminApi("set_password", {
                    id: emp.id,
                    password: newPw,
                  });
                  setNewPw("");
                }, "Password changed")
              }
            >
              Reset
            </Btn>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {emp.active ? (
              <Btn
                v="danger"
                disabled={busy}
                className="flex-1"
                onClick={() =>
                  confirm(
                    "Block this employee? He will be logged out and cannot log in.",
                  ) &&
                  run(async () => {
                    await adminApi("set_active", { id: emp.id, active: false });
                    onSaved();
                  })
                }
              >
                🚫 Left company – remove access
              </Btn>
            ) : (
              <Btn
                v="green"
                disabled={busy}
                className="flex-1"
                onClick={() =>
                  run(async () => {
                    await adminApi("set_active", { id: emp.id, active: true });
                    onSaved();
                  })
                }
              >
                ✅ Restore access
              </Btn>
            )}
            <Btn
              v="danger"
              disabled={busy}
              className="flex-1"
              onClick={() =>
                confirm(
                  "DELETE permanently, including attendance and payslips?",
                ) &&
                run(async () => {
                  await adminApi("delete", { id: emp.id });
                  onSaved();
                })
              }
            >
              🗑 Delete forever
            </Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}
