import { supabase } from "../lib/supabase.js";

const TABLE = "documents";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const cacheKey = (type) => `ks_cache_${type}`;
const pendKey = (type) => `ks_pending_${type}`;

function readLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}
function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
function upsertLocal(key, item) {
  const list = readLocal(key);
  const i = list.findIndex((d) => String(d.id) === String(item.id));
  if (i >= 0) list[i] = item;
  else list.unshift(item);
  writeLocal(key, list);
}
function removeLocal(key, id) {
  writeLocal(
    key,
    readLocal(key).filter((d) => String(d.id) !== String(id)),
  );
}

// Photos & signatures are NEVER sent to the database (text only = tiny storage)
function lean(type, doc) {
  const copy = { ...doc };
  if (type === "employee") {
    copy.photo = "";
    copy.signature = "";
  }
  return copy;
}

function numberOf(type, doc) {
  if (type === "employee") return doc.cardNo || "";
  if (type === "invoice") return doc.invoiceNo || "";
  return doc.quotationNo || "";
}

function timeout(promise, ms = 15000) {
  return Promise.race([
    promise,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error("Network timeout")), ms),
    ),
  ]);
}

async function ensureSession() {
  const { data } = await supabase.auth.getSession();
  if (!data?.session) throw new Error("LOGIN_EXPIRED");
}

async function withRetry(fn, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await timeout(fn());
    } catch (err) {
      last = err;
      if (err.message === "LOGIN_EXPIRED") break;
      await wait(700 * (i + 1));
    }
  }
  throw last;
}

async function push(type, doc) {
  await ensureSession();
  const { error } = await supabase.from(TABLE).upsert(
    {
      id: String(doc.id),
      doc_type: type,
      doc_no: numberOf(type, doc),
      data: lean(type, doc),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "doc_type,id" },
  );
  if (error) throw error;
}

// Saves on the device first (never lost), then uploads with retries.
export async function saveDoc(type, doc) {
  const item = lean(type, doc);
  upsertLocal(cacheKey(type), item);
  try {
    await withRetry(() => push(type, doc));
    removeLocal(pendKey(type), doc.id);
    return { cloud: true };
  } catch (err) {
    upsertLocal(pendKey(type), item); // upload later automatically
    return {
      cloud: false,
      loginExpired: err.message === "LOGIN_EXPIRED",
      error: err.message,
    };
  }
}

// Uploads anything that failed earlier
export async function syncPending(type) {
  for (const doc of readLocal(pendKey(type))) {
    try {
      await withRetry(() => push(type, doc), 2);
      removeLocal(pendKey(type), doc.id);
    } catch {
      break;
    }
  }
}

export async function getAllDocs(type) {
  await syncPending(type);
  const pending = readLocal(pendKey(type));
  try {
    await ensureSession();
    const { data, error } = await supabase
      .from(TABLE)
      .select("data")
      .eq("doc_type", type)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    const cloud = data.map((r) => r.data);
    const merged = [
      ...pending,
      ...cloud.filter(
        (c) => !pending.some((p) => String(p.id) === String(c.id)),
      ),
    ];
    writeLocal(cacheKey(type), merged);
    return merged;
  } catch {
    return readLocal(cacheKey(type)); // offline: show what is on the device
  }
}

export async function deleteDoc(type, id) {
  removeLocal(cacheKey(type), id);
  removeLocal(pendKey(type), id);
  await withRetry(async () => {
    await ensureSession();
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("doc_type", type)
      .eq("id", String(id));
    if (error) throw error;
  });
}
