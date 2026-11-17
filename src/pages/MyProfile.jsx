import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fmtDMY } from "../lib/dates.js";
import { Avatar, Card, PageTitle, resizeImage } from "../components/ui.jsx";

const Row = ({ k, v }) => (
  <div className="flex justify-between border-b border-slate-100 py-2.5 text-sm">
    <span className="text-slate-500">{k}</span>
    <b className="text-right text-ksdark">{v || "—"}</b>
  </div>
);

export default function MyProfile() {
  const { profile } = useAuth();
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("photo_requests")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("status", "pending")
      .limit(1);
    setPending(data?.[0] || null);
  };
  useEffect(() => {
    load();
  }, []);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const blob = await resizeImage(file);
      const path = `req-${profile.id}-${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: e2 } = await supabase
        .from("photo_requests")
        .insert({ profile_id: profile.id, photo_url: data.publicUrl });
      if (e2) throw e2;
      await load();
    } catch (x) {
      alert(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="My Profile"
        sub="Details are managed by the admin. You can upload a new photo for approval."
      />
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="p-6 text-center">
          <div className="mx-auto w-fit">
            <Avatar src={profile.photo_url} name={profile.name} size={110} />
          </div>
          <div className="mt-3 text-lg font-extrabold text-ksdark">
            {profile.name}
          </div>
          <div className="text-xs text-slate-500">
            {profile.designation} · {profile.emp_code}
          </div>
          <label className="mt-4 block cursor-pointer rounded-xl bg-ksdark px-4 py-2.5 text-sm font-semibold text-white">
            {busy ? "Uploading…" : "📷 Upload new photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={upload}
              disabled={busy}
            />
          </label>
          {pending && (
            <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
              <img
                src={pending.photo_url}
                alt=""
                className="mx-auto mb-2 h-20 rounded-lg"
              />
              Waiting for admin approval
            </div>
          )}
        </Card>
        <Card className="p-6 md:col-span-2">
          <Row k="Employee ID" v={profile.emp_code} />
          <Row k="Designation" v={profile.designation} />
          <Row k="Date of birth" v={fmtDMY(profile.dob)} />
          <Row k="Date of joining" v={fmtDMY(profile.doj)} />
          <Row k="Mobile" v={profile.mobile} />
          <Row k="ESI No" v={profile.esi_no} />
          <Row k="UAN No" v={profile.uan_no} />
          <Row k="PF No" v={profile.pf_no} />
        </Card>
      </div>
    </div>
  );
}
