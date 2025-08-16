export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const randRange = (min, max) => Math.random() * (max - min) + min;
export const randInt = (min, max) => Math.floor(randRange(min, max + 1));

// sadə toqquşma
export function aabbIntersect(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// ən yaxşı skor yaddaşda saxlanır
const BEST_KEY = "flippy_best_score";
export function getBest() {
  try { return parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10) || 0; }
  catch { return 0; }
}
export function setBest(v) {
  try { localStorage.setItem(BEST_KEY, String(v)); } catch {}
}
