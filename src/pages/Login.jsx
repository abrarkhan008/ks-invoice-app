import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.png";

export default function Login({ mode = "employee" }) {
  const isAdmin = mode === "admin";
  const { session, profile, signIn } = useAuth();
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  if (session && profile) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await signIn(code, pw, mode);
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-ksorange focus:bg-white focus:ring-4 focus:ring-ksmist";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* left brand panel */}
      <div className="relative hidden overflow-hidden bg-ksdark p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-ksorange/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative rounded-2xl bg-white p-3 w-fit">
          <img src={logo} alt="" className="h-14 object-contain" />
        </div>
        <div className="relative">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-ksorange">
            {isAdmin ? "Administrator Portal" : "Employee Portal"}
          </p>
          <h2 className="text-4xl font-extrabold leading-tight">
            {isAdmin
              ? "Manage people, payroll and operations in one place."
              : "Your attendance, payslips and leaves, always with you."}
          </h2>
          <p className="mt-4 max-w-md text-slate-300">
            K S Enterprises · Human Resource Management System
          </p>
        </div>
        <p className="relative text-xs text-slate-400">
          © K S Enterprises, Nanjangud
        </p>
      </div>

      {/* right form */}
      <div className="flex items-center justify-center bg-white p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex justify-center">
            <img src={logo} alt="" className="h-16 object-contain" />
          </div>
          <span
            className={
              "mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider " +
              (isAdmin ? "bg-slate-900 text-white" : "bg-ksmist text-ksorange")
            }
          >
            {isAdmin ? "Admin login" : "Employee login"}
          </span>
          <h1 className="text-3xl font-extrabold text-ksdark">Welcome back</h1>
          <p className="mb-8 mt-1 text-sm text-slate-500">
            Sign in with your Employee ID and password.
          </p>

          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Employee ID
          </label>
          <input
            className={input + " mb-5"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="KS01/2025-26"
            autoCapitalize="characters"
            required
          />

          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Password
          </label>
          <div className="relative mb-5">
            <input
              className={input + " pr-16"}
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400"
            >
              {show ? "HIDE" : "SHOW"}
            </button>
          </div>

          {err && (
            <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {err}
            </div>
          )}

          <button
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-r from-ksorange to-ksgold py-3.5 font-bold text-white shadow-lg shadow-ksorange/30 transition hover:brightness-105 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-6 text-center text-xs text-slate-400">
            Forgot password? Ask the admin to reset it.
          </p>
          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm">
            {isAdmin ? (
              <Link to="/login" className="font-semibold text-ksorange">
                ← Employee login
              </Link>
            ) : (
              <Link
                to="/admin-login"
                className="font-semibold text-slate-500 hover:text-ksorange"
              >
                Admin login →
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
