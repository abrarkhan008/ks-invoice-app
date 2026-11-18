import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { Btn, Card, Input } from "./ui.jsx";

export default function ResetPassword({ onDone }) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setErr("");
    if (p1.length < 8) return setErr("Minimum 8 characters");
    if (p1 !== p2) return setErr("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: p1 });
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    await supabase.auth.signOut();
    alert("Password changed. Please log in with the new password.");
    window.location.hash = "#/admin-login";
    onDone();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm space-y-3 p-6">
        <h1 className="text-xl font-extrabold text-ksdark">Set new password</h1>
        <Input
          type="password"
          placeholder="New password (min 8)"
          value={p1}
          onChange={(e) => setP1(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Repeat password"
          value={p2}
          onChange={(e) => setP2(e.target.value)}
        />
        {err && <div className="text-sm text-rose-600">{err}</div>}
        <Btn disabled={busy} onClick={save} className="w-full">
          {busy ? "Saving…" : "Save password"}
        </Btn>
      </Card>
    </div>
  );
}
