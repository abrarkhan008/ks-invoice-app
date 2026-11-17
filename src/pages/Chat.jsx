import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useRealtime } from "../lib/useRealtime.js";
import { Avatar, Card, PageTitle } from "../components/ui.jsx";

export default function Chat() {
  const { profile } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [people, setPeople] = useState({});
  const [text, setText] = useState("");
  const end = useRef(null);

  const load = useCallback(async () => {
    const { data: d } = await supabase
      .from("directory")
      .select("id,name,photo_url,role");
    setPeople(Object.fromEntries((d || []).map((x) => [x.id, x])));
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setMsgs((data || []).reverse());
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  useRealtime("messages", load);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    const { error } = await supabase
      .from("messages")
      .insert({ sender: profile.id, body });
    if (error) alert(error.message);
  };

  return (
    <div>
      <PageTitle title="Team Chat" sub="Everyone at K S Enterprises, live" />
      <Card className="flex h-[70vh] flex-col overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
          {msgs.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">
              No messages yet. Say hello 👋
            </p>
          )}
          {msgs.map((m) => {
            const mine = m.sender === profile.id;
            const p = people[m.sender];
            return (
              <div
                key={m.id}
                className={
                  "flex items-end gap-2 " + (mine ? "flex-row-reverse" : "")
                }
              >
                <Avatar src={p?.photo_url} name={p?.name || "?"} size={32} />
                <div
                  className={
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm " +
                    (mine
                      ? "rounded-br-sm bg-ksdark text-white"
                      : "rounded-bl-sm bg-white text-slate-800")
                  }
                >
                  {!mine && (
                    <div className="mb-0.5 text-[11px] font-bold text-ksorange">
                      {p?.name || "Colleague"}
                      {p?.role === "admin" ? " · Admin" : ""}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap break-words">
                    {m.body}
                  </div>
                  <div
                    className={
                      "mt-1 text-[10px] " +
                      (mine ? "text-slate-300" : "text-slate-400")
                    }
                  >
                    {new Date(m.created_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={end} />
        </div>
        <form
          onSubmit={send}
          className="flex gap-2 border-t border-slate-100 bg-white p-3"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-ksorange"
          />
          <button className="rounded-xl bg-ksorange px-5 font-bold text-white">
            Send
          </button>
        </form>
      </Card>
    </div>
  );
}
