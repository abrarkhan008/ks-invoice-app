import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useRealtime } from "../lib/useRealtime.js";
import { fmtDMY, todayStr } from "../lib/dates.js";
import {
  Avatar,
  Btn,
  Card,
  Input,
  PageTitle,
  Select,
  Spinner,
} from "../components/ui.jsx";

const BADGE = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};
const days = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000) + 1;

export default function Leaves() {
  const { profile, isAdmin } = useAuth();
  const [rows, setRows] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [names, setNames] = useState({});
  const [f, setF] = useState({
    from_date: todayStr(),
    to_date: todayStr(),
    leave_type: "Casual",
    reason: "",
  });

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data || []);
    if (isAdmin) {
      const { data: p } = await supabase
        .from("photo_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at");
      setPhotos(p || []);
      const { data: d } = await supabase
        .from("directory")
        .select("id,name,photo_url");
      setNames(Object.fromEntries((d || []).map((x) => [x.id, x])));
    }
  }, [isAdmin]);
  useEffect(() => {
    load();
  }, [load]);
  useRealtime("leave_requests", load);
  useRealtime("photo_requests", load);

  const apply = async () => {
    if (f.to_date < f.from_date) return alert("End date is before start date");
    if (!f.reason.trim()) return alert("Please write a reason");
    const { error } = await supabase
      .from("leave_requests")
      .insert({ ...f, profile_id: profile.id });
    if (error) return alert(error.message);
    setF({ ...f, reason: "" });
    load();
  };
  const decide = async (id, status) => {
    const note =
      status === "rejected" ? prompt("Reason for rejection (optional)") : "";
    await supabase
      .from("leave_requests")
      .update({ status, admin_note: note || null })
      .eq("id", id);
    load();
  };
  const decidePhoto = async (p, ok) => {
    if (ok)
      await supabase
        .from("profiles")
        .update({ photo_url: p.photo_url })
        .eq("id", p.profile_id);
    await supabase
      .from("photo_requests")
      .update({ status: ok ? "approved" : "rejected" })
      .eq("id", p.id);
    load();
  };

  return (
    <div>
      <PageTitle
        title="Leave Management"
        sub={
          isAdmin
            ? "Approve or reject leave and photo requests"
            : "Apply for leave and track approval"
        }
      />

      {isAdmin && photos.length > 0 && (
        <Card className="mb-5 p-5">
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Photo change requests ({photos.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {photos.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
              >
                <img
                  src={p.photo_url}
                  alt=""
                  className="h-20 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="text-sm font-bold text-ksdark">
                    {names[p.profile_id]?.name}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Btn
                      onClick={() => decidePhoto(p, true)}
                      className="!py-1 text-xs"
                    >
                      Approve
                    </Btn>
                    <Btn
                      v="ghost"
                      onClick={() => decidePhoto(p, false)}
                      className="!py-1 text-xs"
                    >
                      Reject
                    </Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!isAdmin && (
        <Card className="mb-5 p-5">
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-500">
            New leave request
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-xs text-slate-500">From</label>
              <Input
                type="date"
                value={f.from_date}
                onChange={(e) => setF({ ...f, from_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">To</label>
              <Input
                type="date"
                value={f.to_date}
                onChange={(e) => setF({ ...f, to_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Type</label>
              <Select
                value={f.leave_type}
                onChange={(e) => setF({ ...f, leave_type: e.target.value })}
              >
                <option>Casual</option>
                <option>Sick</option>
                <option>Emergency</option>
                <option>Other</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Btn className="w-full" onClick={apply}>
                Submit request
              </Btn>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Input
                placeholder="Reason for leave"
                value={f.reason}
                onChange={(e) => setF({ ...f, reason: e.target.value })}
              />
            </div>
          </div>
        </Card>
      )}

      {!rows ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-400">
          No leave requests yet.
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <Avatar
                      src={names[r.profile_id]?.photo_url}
                      name={names[r.profile_id]?.name || "?"}
                      size={40}
                    />
                  )}
                  <div>
                    {isAdmin && (
                      <div className="text-sm font-bold text-ksdark">
                        {names[r.profile_id]?.name}
                      </div>
                    )}
                    <div className="text-sm font-semibold">
                      {fmtDMY(r.from_date)} → {fmtDMY(r.to_date)} ·{" "}
                      {days(r.from_date, r.to_date)} day(s)
                    </div>
                    <div className="text-xs text-slate-500">
                      {r.leave_type} · {r.reason}
                    </div>
                    {r.admin_note && (
                      <div className="mt-1 text-xs text-rose-500">
                        Admin: {r.admin_note}
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={
                    "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase " +
                    BADGE[r.status]
                  }
                >
                  {r.status}
                </span>
              </div>
              {isAdmin && r.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Btn
                    className="flex-1 !py-1.5 text-xs"
                    onClick={() => decide(r.id, "approved")}
                  >
                    ✓ Approve
                  </Btn>
                  <Btn
                    v="ghost"
                    className="flex-1 !py-1.5 text-xs"
                    onClick={() => decide(r.id, "rejected")}
                  >
                    ✕ Reject
                  </Btn>
                </div>
              )}
              {!isAdmin && r.status === "pending" && (
                <button
                  className="mt-3 text-xs text-rose-500"
                  onClick={async () => {
                    await supabase
                      .from("leave_requests")
                      .delete()
                      .eq("id", r.id);
                    load();
                  }}
                >
                  Cancel request
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
