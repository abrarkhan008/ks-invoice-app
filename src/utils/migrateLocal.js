import { saveDoc } from "./cloudStore.js";

const OLD = [
  { key: "ks_invoices_v1", type: "invoice" },
  { key: "ks_quotations", type: "quotation" },
  { key: "ks_employees_v1", type: "employee" },
];
const FLAG = "ks_migrated_v1";

// Copies old on-device data to Supabase. Old data is NOT deleted.
export async function migrateOldLocalData() {
  if (localStorage.getItem(FLAG)) return { moved: 0, failed: 0 };
  let moved = 0,
    failed = 0;
  for (const { key, type } of OLD) {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      list = [];
    }
    for (const doc of list) {
      if (!doc || doc.id == null) continue;
      const res = await saveDoc(type, doc);
      if (res.cloud) moved++;
      else failed++;
    }
  }
  if (failed === 0) localStorage.setItem(FLAG, "1");
  return { moved, failed };
}
