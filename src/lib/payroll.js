// Re-creates the formulas of your FORM-22 Excel sheet exactly (row 15 formulas).
//   Bonus K  = ROUND(Basic*8.33%)         LWW L = Basic/26*1.25
//   R = ROUND(Basic/26*PayDays)           T = ROUND(L/26*PayDays)
//   U = ROUND(K/26*PayDays)               V = ROUND(PH/26*PayDays)
//   W (ESI wages) = R+S+T                 X (Gross) = R+S+T+U+V
//   PF  = IF(R>=15000, 1800, R*12%)       ESI = CEILING(W*0.75%)
//   Net = Gross - (PF+ESI+PT+LWF+others+canteen)

// Rates from "Approval 2026-27" (verify these once - they were read from a scanned page)
export const RATE_CARD = {
  Unskilled:            { fixed_basic: 15126.92, fixed_ph: 484.84 },
  Supervisor:           { fixed_basic: 16270.92, fixed_ph: 521.5 },
  "Driver / Forklift":  { fixed_basic: 16840.57, fixed_ph: 539.76 },
};
export const DESIGNATIONS = Object.keys(RATE_CARD);

const n = (v) => Number(v) || 0;

export function calcPay(emp, inp = {}) {
  const I = n(emp.fixed_basic), J = n(emp.fixed_other), M = n(emp.fixed_ph);
  const K = Math.round(I * 0.0833);
  const L = (I / 26) * 1.25;
  const N = I + J;
  const P = n(inp.payDays);
  const R = Math.round((I / 26) * P);
  const S = n(inp.nfh);
  const T = Math.round((L / 26) * P);
  const U = Math.round((K / 26) * P);
  const V = Math.round((M / 26) * P);
  const W = R + S + T;
  const X = R + S + T + U + V;
  const Y = Math.round(R >= 15000 ? 1800 : R * 0.12);
  const Z = Math.ceil(+(W * 0.0075).toFixed(6));
  const AA = n(inp.pt), AB = n(inp.lwf), AC = n(inp.others), AD = n(inp.canteen);
  const AE = Y + Z + AA + AB + AC + AD;
  const AF = X - AE;
  return {
    fixedBasic: I, fixedOther: J, fixedBonus: K, fixedLww: L, fixedPh: M, fixedGross: N,
    payDays: P, ot: n(inp.ot),
    basic: R, nfh: S, lww: T, bonus: U, ph: V, esiWages: W, gross: X,
    pf: Y, esi: Z, pt: AA, lwf: AB, others: AC, canteen: AD, totalDed: AE, net: AF,
  };
}

// attendance statuses -> pay days (P = 1, P/2 = 0.5)
export const daysFromStatuses = (list) =>
  list.reduce((s, v) => s + (v === "P" ? 1 : v === "P/2" ? 0.5 : 0), 0);
