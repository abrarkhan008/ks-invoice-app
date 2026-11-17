import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      // session is forgotten when the browser tab/app is closed
      storage: window.sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);

// Employee ID  ->  hidden login e-mail.  MUST be identical to the function in the Edge Function.
export const emailFor = (code) =>
  code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + "@ks-hrms.app";

// Calls the secure server function (create employee, reset password, remove access ...)
export async function adminApi(action, payload = {}) {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action, ...payload },
  });
  if (error) {
    let msg = error.message;
    try {
      msg = (await error.context.json()).error || msg;
    } catch {}
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
