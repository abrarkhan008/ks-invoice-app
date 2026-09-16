// Simple local storage helper to save/load Employment Details records
const KEY = "ks_employees_v1";

export function getAllEmployees() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEmployee(emp) {
  const all = getAllEmployees();
  const idx = all.findIndex((e) => e.id === emp.id);
  if (idx >= 0) {
    all[idx] = emp;
  } else {
    all.unshift(emp);
  }
  localStorage.setItem(KEY, JSON.stringify(all));
  return all;
}

export function deleteEmployee(id) {
  const all = getAllEmployees().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
  return all;
}

export function nextCardNumber() {
  const all = getAllEmployees();
  return String(all.length + 1).padStart(3, "0");
}
