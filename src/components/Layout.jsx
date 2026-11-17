import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useRealtime } from "../lib/useRealtime.js";
import { Avatar } from "./ui.jsx";
import logo from "../assets/logo.png";

export default function Layout() {
  const { profile, isAdmin, signOut } = useAuth();
  const [pending, setPending] = useState(0);
  // proper logout: asks first, then goes to the correct login page
  const doLogout = async () => {
    if (!confirm("Logout from K S Enterprises?")) return;
    const goTo = isAdmin ? "#/admin-login" : "#/login";
    await signOut();
    window.location.hash = goTo;
  };

  // auto logout after 15 minutes of no activity
  useEffect(() => {
    let t;
    const out = async () => {
      await signOut();
      window.location.hash = "#/login";
    };
    const reset = () => {
      clearTimeout(t);
      t = setTimeout(out, 15 * 60 * 1000);
    };
    const evs = ["click", "keydown", "touchstart", "mousemove"];
    evs.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      clearTimeout(t);
      evs.forEach((e) => window.removeEventListener(e, reset));
    };
    // eslint-disable-next-line
  }, []);
  // admin: count of leave + photo requests waiting for approval
  const loadPending = useCallback(async () => {
    if (!isAdmin) return;
    const a = await supabase
      .from("leave_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    const b = await supabase
      .from("photo_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    setPending((a.count || 0) + (b.count || 0));
  }, [isAdmin]);
  useEffect(() => {
    loadPending();
  }, [loadPending]);
  useRealtime("leave_requests", loadPending);
  useRealtime("photo_requests", loadPending);

  const groups = [
    {
      title: "Main",
      items: [
        { to: "/", label: "Dashboard", icon: "🏠", end: true },
        { to: "/attendance", label: "Attendance", icon: "🗓️" },
        { to: "/leaves", label: "Leaves", icon: "🏖️", badge: pending },
        { to: "/ton", label: "Ton List", icon: "🚛" },
      ],
    },
    {
      title: isAdmin ? "Administration" : "My Space",
      items: isAdmin
        ? [
            { to: "/employees", label: "Employees", icon: "👥" },
            { to: "/payroll", label: "Payroll", icon: "💰" },
            { to: "/documents", label: "Invoices", icon: "🧾" },
          ]
        : [
            { to: "/payslips", label: "My Payslips", icon: "💰" },
            { to: "/profile", label: "My Profile", icon: "🪪" },
          ],
    },
    {
      title: "Community",
      items: [{ to: "/chat", label: "Team Chat", icon: "💬" }],
    },
  ];
  const flat = groups.flatMap((g) => g.items);

  const side = ({ isActive }) =>
    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition border-l-2 " +
    (isActive
      ? "border-ksgold bg-white/[0.07] text-white"
      : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white");

  return (
    <div className="min-h-screen bg-gradient-to-br from-ksivory via-ksivory to-slate-100 md:flex">
      {/* ---------- desktop sidebar ---------- */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-gradient-to-b from-ksdark to-ksink p-5 md:flex">
        <div className="mb-7 rounded-2xl bg-white p-2.5 shadow-lg">
          <img
            src={logo}
            alt="K S Enterprises"
            className="h-14 w-full object-contain"
          />
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {g.title}
              </div>
              <div className="space-y-1">
                {g.items.map((i) => (
                  <NavLink key={i.to} to={i.to} end={i.end} className={side}>
                    <span className="text-lg">{i.icon}</span>
                    <span className="flex-1">{i.label}</span>
                    {i.badge > 0 && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {i.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <Avatar src={profile?.photo_url} name={profile?.name} size={42} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-white">
              {profile?.name}
            </div>
            <div className="truncate text-[11px] text-slate-400">
              {isAdmin ? "Administrator" : profile?.emp_code}
            </div>
          </div>
          <button
            onClick={doLogout}
            title="Logout"
            className="rounded-lg p-2 text-lg text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ⏻
          </button>
        </div>
        <button
          onClick={doLogout}
          className="mt-3 w-full rounded-xl bg-rose-500/10 py-2.5 text-sm font-bold text-rose-300 ring-1 ring-rose-400/20 transition hover:bg-rose-500 hover:text-white"
        >
          ⏻ Logout
        </button>
      </aside>

      {/* ---------- content ---------- */}
      <div className="min-w-0 flex-1">
        {/* mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-ksdark px-4 py-2.5 shadow-lg md:hidden">
          <img
            src={logo}
            alt=""
            className="h-9 rounded-lg bg-white px-2 py-0.5 object-contain"
          />
          <div className="flex items-center gap-2 text-white">
            <Avatar src={profile?.photo_url} name={profile?.name} size={30} />
            <span className="max-w-[32vw] truncate text-xs font-semibold">
              {profile?.name}
            </span>
            <button
              onClick={doLogout}
              className="rounded-full bg-rose-500 px-3 py-1.5 text-xs font-bold text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="page-in mx-auto max-w-6xl p-4 pb-28 md:p-10">
          <Outlet />
        </main>

        {/* mobile bottom nav (swipe sideways) */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-slate-200 bg-white/95 px-1 py-1.5 backdrop-blur md:hidden">
          {flat.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              end={i.end}
              className={({ isActive }) =>
                "relative flex min-w-[64px] flex-1 flex-col items-center px-2 py-1 text-[10px] font-semibold " +
                (isActive ? "text-ksorange" : "text-slate-400")
              }
            >
              <span className="text-xl">{i.icon}</span>
              {i.label}
              {i.badge > 0 && (
                <span className="absolute right-2 top-0 rounded-full bg-rose-500 px-1.5 text-[9px] font-bold text-white">
                  {i.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
