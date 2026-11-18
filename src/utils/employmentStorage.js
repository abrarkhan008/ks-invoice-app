// // Simple local storage helper to save/load Employment Details records
// const KEY = "ks_employees_v1";

// export function getAllEmployees() {
//   try {
//     const raw = localStorage.getItem(KEY);
//     return raw ? JSON.parse(raw) : [];
//   } catch {
//     return [];
//   }
// }

// export function saveEmployee(emp) {
//   const all = getAllEmployees();
//   const idx = all.findIndex((e) => e.id === emp.id);
//   if (idx >= 0) {
//     all[idx] = emp;
//   } else {
//     all.unshift(emp);
//   }
//   localStorage.setItem(KEY, JSON.stringify(all));
//   return all;
// }

// export function deleteEmployee(id) {
//   const all = getAllEmployees().filter((e) => e.id !== id);
//   localStorage.setItem(KEY, JSON.stringify(all));
//   return all;
// }

// export function nextCardNumber() {
//   const all = getAllEmployees();
//   return String(all.length + 1).padStart(3, "0");
// }
import { getAllDocs, saveDoc, deleteDoc } from "./cloudStore.js";

export const getAllEmployees = () => getAllDocs("employee");
export const saveEmployee = (emp) => saveDoc("employee", emp);
export const deleteEmployee = (id) => deleteDoc("employee", id);

export async function nextCardNumber() {
  const list = await getAllDocs("employee");
  const max = list.reduce(
    (m, e) => Math.max(m, parseInt(e.cardNo, 10) || 0),
    0,
  );
  return String(max + 1).padStart(3, "0");
}
