// Supabase Edge Function: admin-users
// Only an admin can create employees, change ID/password, remove access, delete.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

// Employee ID -> login e-mail (must match src/lib/supabase.js)
const emailFor = (code: string) =>
  code.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "@ks-hrms.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: { user } } = await db.auth.getUser(token);
    if (!user) return json({ error: "Not logged in" }, 401);
    const { data: me } = await db.from("profiles").select("role,active").eq("id", user.id).single();
    if (!me || me.role !== "admin" || !me.active) return json({ error: "Admins only" }, 403);

    const { action, ...p } = await req.json();

    if (action === "create") {
      const { password, ...profile } = p;
      if (!profile.emp_code || !password || !profile.name) return json({ error: "ID, name and password are required" }, 400);
      if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);
      const { data, error } = await db.auth.admin.createUser({
        email: emailFor(profile.emp_code), password, email_confirm: true,
      });
      if (error) return json({ error: error.message }, 400);
      const { error: e2 } = await db.from("profiles").insert({ ...profile, id: data.user.id });
      if (e2) { await db.auth.admin.deleteUser(data.user.id); return json({ error: e2.message }, 400); }
      return json({ ok: true, id: data.user.id });
    }

    if (action === "set_password") {
      if (!p.password || p.password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);
      const { error } = await db.auth.admin.updateUserById(p.id, { password: p.password });
      return error ? json({ error: error.message }, 400) : json({ ok: true });
    }

    if (action === "set_code") {
      const { error } = await db.auth.admin.updateUserById(p.id, { email: emailFor(p.emp_code), email_confirm: true });
      if (error) return json({ error: error.message }, 400);
      const { error: e2 } = await db.from("profiles").update({ emp_code: p.emp_code }).eq("id", p.id);
      return e2 ? json({ error: e2.message }, 400) : json({ ok: true });
    }

    if (action === "set_active") {
      const { error } = await db.auth.admin.updateUserById(p.id, { ban_duration: p.active ? "none" : "876000h" });
      if (error) return json({ error: error.message }, 400);
      await db.from("profiles").update({ active: p.active }).eq("id", p.id);
      return json({ ok: true });
    }

    if (action === "delete") {
      if (p.id === user.id) return json({ error: "You cannot delete yourself" }, 400);
      const { error } = await db.auth.admin.deleteUser(p.id);
      return error ? json({ error: error.message }, 400) : json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});