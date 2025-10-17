export const TWO_PI = Math.PI * 2;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function angleBetween(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

export function formatPrice(n) {
  return `${n}`;
}


