import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useRealtime } from "../lib/useRealtime.js";
import {
  birthdayInfo,
  daysIn,
  inr,
  monthEnd,
  monthLabel,
  monthStart,
  todayStr,
} from "../lib/dates.js";
import { Avatar, Btn, Card, Modal, Spinner } from "../components/ui.jsx";
import { daysFromStatuses } from "../lib/payroll.js";

export default function Dashboard() {
  const { profile, isAdmin } = useAuth();
  const [people, setPeople] = useState(null);
  const [myWishes, setMyWishes] = useState([]); // wishes I SENT this year
  const [received, setReceived] = useState([]); // wishes sent TO me this year
  const [stats, setStats] = useState({});
  const [wishFor, setWishFor] = useState(null);
  const year = new Date().getFullYear();

  const load = useCallback(async () => {
    const now = new Date(),
      y = now.getFullYear(),
      m = now.getMonth();
    const { data: dir } = await supabase.from("directory").select("*");
    setPeople(dir || []);
    const { data: w } = await supabase
      .from("birthday_wishes")
      .select("*")
      .eq("wish_year", year);
    setMyWishes((w || []).filter((x) => x.from_profile === profile.id));
    setReceived((w || []).filter((x) => x.to_profile === profile.id));

    const { data: att } = await supabase
      .from("attendance")
      .select("profile_id,att_date,status")
      .gte("att_date", monthStart(y, m))
      .lte("att_date", monthEnd(y, m));
    const s = {};
    if (isAdmin) {
      const today = todayStr();
      s.employees = (dir || []).filter((p) => p.role === "employee").length;
      s.presentToday = (att || []).filter((a) => a.att_date === today).length;
      const { count } = await supabase
        .from("payslips")
        .select("id", { count: "exact", head: true })
        .eq("month", monthStart(y, m))
        .eq("published", true);
      s.published = count || 0;
    } else {
      s.myDays = daysFromStatuses(
        (att || [])
          .filter((a) => a.profile_id === profile.id)
          .map((a) => a.status),
      );
      const { data: slip } = await supabase
        .from("payslips")
        .select("month,data")
        .order("month", { ascending: false })
        .limit(1);
      s.lastNet = slip?.[0]?.data?.net;
      s.lastMonth = slip?.[0]?.month;
    }
    setStats(s);
  }, [profile.id, isAdmin, year]);

  useEffect(() => {
    load();
  }, [load]);
  useRealtime("birthday_wishes", load);
  useRealtime("payslips", load);

  const birthdays = useMemo(() => {
    return (people || [])
      .filter((p) => p.dob)
      .map((p) => ({ ...p, info: birthdayInfo(p.dob) }))
      .filter((p) => p.info.days <= 30)
      .sort((a, b) => a.info.days - b.info.days);
  }, [people]);
  const today = birthdays.filter((b) => b.info.days === 0);
  const upcoming = birthdays.filter((b) => b.info.days > 0);
  const nameOf = (id) =>
    people?.find((p) => p.id === id)?.name || "A colleague";
  const iWished = (id) => myWishes.some((w) => w.to_profile === id);
  const now = new Date();

  return (
    <div>
      {/* hero */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-ksdark via-slate-800 to-ksdark p-6 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-ksorange/30 blur-2xl" />
        <p className="text-sm text-slate-300">
          {now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">
          Hello, {profile.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-slate-300">
          {isAdmin
            ? "Here is your company at a glance."
            : "Have a great day at work!"}
        </p>
      </div>

      {/* stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {isAdmin ? (
          <>
            <Stat
              label="Active employees"
              value={stats.employees ?? "…"}
              icon="👥"
              to="/employees"
            />
            <Stat
              label="Present today"
              value={stats.presentToday ?? "…"}
              icon="✅"
              to="/attendance"
            />
            <Stat
              label="Payslips published"
              value={stats.published ?? "…"}
              icon="💰"
              to="/payroll"
            />
            <Stat
              label="Birthdays (30 days)"
              value={birthdays.length}
              icon="🎂"
            />
          </>
        ) : (
          <>
            <Stat
              label={`Days worked · ${monthLabel(
                now.getFullYear(),
                now.getMonth(),
              )}`}
              value={stats.myDays ?? "…"}
              icon="🗓️"
              to="/attendance"
            />
            <Stat
              label="Last net pay"
              value={stats.lastNet != null ? "₹ " + inr(stats.lastNet) : "—"}
              icon="💰"
              to="/payslips"
            />
            <Stat label="Ton list" value="Open" icon="🚛" to="/ton" />
            <Stat
              label="Birthdays (30 days)"
              value={birthdays.length}
              icon="🎂"
            />
          </>
        )}
      </div>

      {/* birthdays */}
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-extrabold text-ksdark">
          🎂 Birthdays
        </h2>
        {!people ? (
          <Spinner />
        ) : birthdays.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No birthdays in the next 30 days.
          </p>
        ) : (
          <>
            {today.length > 0 && (
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                {today.map((b) => (
                  <div
                    key={b.id}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ksmist via-ksmist to-rose-100 p-4 ring-1 ring-ksgold/40"
                  >
                    <div className="absolute right-3 top-2 text-3xl">🎉</div>
                    <div className="flex items-center gap-4">
                      <Avatar src={b.photo_url} name={b.name} size={72} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-ksorange">
                          Today · turns {b.info.turning}
                        </div>
                        <div className="truncate text-lg font-extrabold text-ksdark">
                          {b.name}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {b.designation}
                        </div>
                        {b.id === profile.id ? (
                          <div className="mt-2 text-sm font-semibold text-ksorange">
                            Happy Birthday to you! 🥳
                          </div>
                        ) : iWished(b.id) ? (
                          <div className="mt-2 text-xs font-bold text-emerald-600">
                            ✓ Wish sent
                          </div>
                        ) : (
                          <Btn
                            className="mt-2 !py-1.5 text-xs"
                            onClick={() => setWishFor(b)}
                          >
                            🎁 Send wish
                          </Btn>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {upcoming.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                  >
                    <Avatar src={b.photo_url} name={b.name} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-ksdark">
                        {b.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {b.info.date.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        · in {b.info.days} day{b.info.days > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      {/* wishes I received */}
      {received.length > 0 && (
        <Card className="mt-5 p-5">
          <h2 className="mb-3 text-lg font-extrabold text-ksdark">
            💌 Wishes for you
          </h2>
          <div className="space-y-2">
            {received.map((w) => (
              <div key={w.id} className="rounded-xl bg-ksmist p-3 text-sm">
                <b>{nameOf(w.from_profile)}</b>
                <div className="text-slate-600">{w.message}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {wishFor && (
        <WishModal
          person={wishFor}
          me={profile}
          year={year}
          onClose={() => setWishFor(null)}
          onSent={() => {
            setWishFor(null);
            load();
          }}
        />
      )}
    </div>
  );
}

const Stat = ({ label, value, icon, to }) => {
  const body = (
    <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="text-xl font-extrabold text-ksdark">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
};

function WishModal({ person, me, year, onClose, onSent }) {
  const [msg, setMsg] = useState(
    `Happy Birthday ${
      person.name.split(" ")[0]
    }! 🎉 Wishing you a wonderful year ahead.`,
  );
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    const { error } = await supabase.from("birthday_wishes").insert({
      from_profile: me.id,
      to_profile: person.id,
      wish_year: year,
      message: msg,
    });
    setBusy(false);
    if (error) return alert(error.message);
    onSent();
  };
  return (
    <Modal title={`Wish ${person.name}`} onClose={onClose}>
      <div className="mb-3 flex items-center gap-3">
        <Avatar src={person.photo_url} name={person.name} size={56} />
        <div className="text-sm text-slate-500">
          Your wish will appear on their dashboard.
        </div>
      </div>
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        rows={4}
        className="mb-3 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-ksorange"
      />
      <Btn onClick={send} disabled={busy || !msg.trim()} className="w-full">
        {busy ? "Sending…" : "Send wish 🎁"}
      </Btn>
    </Modal>
  );
}
void daysIn;
