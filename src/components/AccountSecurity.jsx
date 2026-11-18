import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Btn, Field, Input, Modal } from "./ui.jsx";

export default function AccountSecurity({ onClose }) {
  const { session } = useAuth();
  const email = session?.user?.email || "";
  const [cur, setCur] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const verify = async () => {
    if (!cur) throw new Error("Enter your current password first");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: cur,
    });
    if (error) throw new Error("Current password is wrong");
  };

  const run = async (fn) => {
    setBusy(true);
    setMsg(null);
    try {
      setMsg({ ok: true, text: await fn() });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const changePassword = () =>
    run(async () => {
      if (pw1.length < 8) throw new Error("New password: minimum 8 characters");
      if (pw1 !== pw2) throw new Error("New passwords do not match");
      if (pw1 === cur) throw new Error("New password must be different");
      await verify();
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      await supabase.auth.signOut({ scope: "others" });
      setCur("");
      setPw1("");
      setPw2("");
      return "Password changed ✔ (other devices were logged out)";
    });

  const changeEmail = () =>
    run(async () => {
      if (!/^\S+@\S+\.\S+$/.test(newEmail))
        throw new Error("Enter a valid email");
      await verify();
      const { error } = await supabase.auth.updateUser(
        { email: newEmail.trim() },
        { emailRedirectTo: window.location.origin },
      );
      if (error) throw error;
      setNewEmail("");
      return "Confirmation link sent. Open it (check the new email, and the old one too). The email changes after you confirm.";
    });

  return (
    <Modal title="🔐 Account security" onClose={onClose}>
      <p className="mb-4 text-sm text-slate-500">
        Login email: <b className="text-ksdark">{email}</b>
      </p>

      <Field label="Current password" className="mb-5">
        <Input
          type="password"
          value={cur}
          onChange={(e) => setCur(e.target.value)}
        />
      </Field>

      <div className="mb-6 space-y-3 rounded-2xl border border-slate-200 p-4">
        <div className="text-xs font-bold uppercase text-slate-500">
          Change password
        </div>
        <Input
          type="password"
          placeholder="New password (min 8)"
          value={pw1}
          onChange={(e) => setPw1(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Repeat new password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
        />
        <Btn disabled={busy} onClick={changePassword} className="w-full">
          Change password
        </Btn>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <div className="text-xs font-bold uppercase text-slate-500">
          Change login email
        </div>
        <Input
          type="email"
          placeholder="New email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <Btn v="dark" disabled={busy} onClick={changeEmail} className="w-full">
          Change email
        </Btn>
      </div>

      {msg && (
        <div
          className={
            "mt-4 rounded-xl px-4 py-3 text-sm " +
            (msg.ok
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-600")
          }
        >
          {msg.text}
        </div>
      )}
    </Modal>
  );
}
