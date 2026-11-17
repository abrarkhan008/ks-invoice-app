import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase, emailFor } from "../lib/supabase.js";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    if (!data || !data.active) {
      // access removed by admin
      await supabase.auth.signOut();
      setProfile(null);
      return null;
    }
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) await loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

const signIn = async (code, password, expectedRole) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailFor(code),
    password,
  });
  if (error) throw new Error("Wrong ID or password");
  const { data: prof } = await supabase
    .from("profiles").select("role").eq("id", data.user.id).single();
  if (expectedRole && prof?.role !== expectedRole) {
    await supabase.auth.signOut();
    throw new Error(
      expectedRole === "admin"
        ? "This is not an admin account. Please use Employee login."
        : "Admins must sign in from the Admin login page."
    );
  }
  const p = await loadProfile(data.user.id);
  if (!p) throw new Error("Your access has been removed. Please contact the admin.");
};
  const signOut = () => supabase.auth.signOut();

  return (
    <Ctx.Provider
      value={{
        session,
        profile,
        loading,
        signIn,
        signOut,
        isAdmin: profile?.role === "admin",
        reloadProfile: () => loadProfile(session.user.id),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
